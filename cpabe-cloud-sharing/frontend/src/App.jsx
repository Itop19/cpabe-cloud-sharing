import { useState, useEffect } from 'react';
import axios from 'axios';

const api = axios.create({ baseURL: import.meta.env.VITE_API_URL || '/api' });

// Recommended default attribute presets for each role so the decrypt form can auto-fill
// user-specific access contexts while preserving the existing backend API contract.
const roleAttributeMap = {
  data_consumer: ['Department=CS', 'Role=Student'],
  data_owner: ['Department=CS', 'Role=Owner'],
  attribute_authority: ['Department=CS', 'Role=Authority'],
  admin: ['Department=CS', 'Role=Admin']
};

function App() {
  const [token, setToken] = useState(localStorage.getItem('token') || '');
  const [user, setUser] = useState(JSON.parse(localStorage.getItem('user') || 'null'));
  const [users, setUsers] = useState([]);
  const [selectedUserId, setSelectedUserId] = useState('');
  const [selectedUser, setSelectedUser] = useState(null);
  const [form, setForm] = useState({ username: '', email: '', password: '', role: 'data_consumer' });
  const [loginForm, setLoginForm] = useState({ username: '', password: '' });
  const [attributes, setAttributes] = useState([]);
  const [policies, setPolicies] = useState([]);
  const [files, setFiles] = useState([]);
  const [audit, setAudit] = useState([]);
  const [ciphertexts, setCiphertexts] = useState({});
  const [selectedFileId, setSelectedFileId] = useState('');
  const [decryptAttributes, setDecryptAttributes] = useState('Department=CS, Role=Student');
  const [decryptResult, setDecryptResult] = useState('');
  const [decryptPayload, setDecryptPayload] = useState(null);
  const [decryptError, setDecryptError] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [isDecrypting, setIsDecrypting] = useState(false);
  const [toast, setToast] = useState(null);

  useEffect(() => {
    if (token) {
      api.defaults.headers.common.Authorization = `Bearer ${token}`;
      loadData();
    }
  }, [token]);

  useEffect(() => {
    if (!user) return;
    const currentUserId = user.id || user._id;
    setSelectedUserId(currentUserId);
  }, [user]);

  useEffect(() => {
    if (!users.length) return;

    const chosenUser = users.find((entry) => (entry._id || entry.id) === selectedUserId)
      || users.find((entry) => (entry.username || '').toLowerCase() === (user?.username || '').toLowerCase())
      || null;

    setSelectedUser(chosenUser);
  }, [users, selectedUserId, user]);

  useEffect(() => {
    if (!selectedUser) return;

    const roleKey = selectedUser.role || user?.role || 'data_consumer';
    const suggestions = roleAttributeMap[roleKey] || roleAttributeMap.data_consumer;
    setDecryptAttributes(suggestions.join(', '));
  }, [selectedUser, user]);

  async function loadData() {
    try {
      const [attrRes, policyRes, fileRes, auditRes, userRes] = await Promise.all([
        api.get('/attributes'),
        api.get('/policies'),
        api.get('/files'),
        api.get('/audit'),
        api.get('/users')
      ]);

      setAttributes(attrRes.data);
      setPolicies(policyRes.data);
      setFiles(fileRes.data);
      setAudit(auditRes.data);
      setUsers(userRes.data);
    } catch (error) {
      console.error(error);
      showToast('error', 'Unable to refresh dashboard data.');
    }
  }

  function showToast(type, message) {
    setToast({ type, message });
    window.clearTimeout(showToast.timeoutId);
    showToast.timeoutId = window.setTimeout(() => setToast(null), 3200);
  }

  async function register(e) {
    e.preventDefault();
    try {
      const response = await api.post('/auth/register', form);
      setToken(response.data.token);
      setUser(response.data.user);
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.user));
      showToast('success', 'Account created successfully.');
    } catch (error) {
      showToast('error', error.response?.data?.message || 'Registration failed.');
    }
  }

  async function login(e) {
    e.preventDefault();
    try {
      const response = await api.post('/auth/login', loginForm);
      setToken(response.data.token);
      setUser(response.data.user);
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.user));
      showToast('success', 'Logged in successfully.');
    } catch (error) {
      showToast('error', error.response?.data?.message || 'Login failed.');
    }
  }

  async function createAttribute(e) {
    e.preventDefault();
    try {
      const body = Object.fromEntries(new FormData(e.target));
      await api.post('/attributes', body);
      await loadData();
      e.target.reset();
      showToast('success', 'Attribute created.');
    } catch (error) {
      showToast('error', error.response?.data?.message || 'Unable to create attribute.');
    }
  }

  async function createPolicy(e) {
    e.preventDefault();
    try {
      const body = Object.fromEntries(new FormData(e.target));
      await api.post('/policies', body);
      await loadData();
      e.target.reset();
      showToast('success', 'Policy created.');
    } catch (error) {
      showToast('error', error.response?.data?.message || 'Unable to create policy.');
    }
  }

  async function uploadFile(e) {
    e.preventDefault();
    setIsUploading(true);
    try {
      const formData = new FormData(e.target);
      const response = await api.post('/files/upload', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
      const uploadedFile = response.data.file;
      const uploadedCiphertext = response.data.encryption?.ciphertext;

      if (uploadedFile?._id && uploadedCiphertext) {
        setCiphertexts((prev) => ({ ...prev, [uploadedFile._id]: uploadedCiphertext }));
      }

      await loadData();
      e.target.reset();
      showToast('success', 'File encrypted and uploaded.');
    } catch (error) {
      showToast('error', error.response?.data?.message || 'Upload failed.');
    } finally {
      setIsUploading(false);
    }
  }

  async function decryptSelectedFile(e) {
    e.preventDefault();
    setDecryptError('');
    setDecryptResult('');
    setDecryptPayload(null);

    const ciphertext = ciphertexts[selectedFileId];
    if (!selectedFileId || !ciphertext) {
      setDecryptError('Select an uploaded file first.');
      showToast('warning', 'Select an uploaded file first.');
      return;
    }

    const attributesList = decryptAttributes
      .split(',')
      .map((item) => item.trim())
      .filter(Boolean);

    if (attributesList.length === 0) {
      setDecryptError('Enter at least one attribute in the format Department=CS, Role=Student.');
      showToast('warning', 'Enter at least one attribute.');
      return;
    }

    setIsDecrypting(true);

    try {
      const response = await api.post('/files/decrypt', {
        ciphertext,
        key: { attributes: attributesList }
      });

      if (response.data.success) {
        setDecryptPayload(response.data);
        setDecryptResult(response.data.isText ? response.data.plaintext : '');
        showToast('success', 'Decryption successful.');
      } else {
        const message = response.data.message || 'Decryption failed.';
        setDecryptError(message);
        showToast('warning', message);
      }
    } catch (error) {
      const message = error.response?.data?.message || 'Decryption failed.';
      setDecryptError(message);
      showToast('error', message);
    } finally {
      setIsDecrypting(false);
    }
  }

  function downloadDecryptedFile() {
    if (!decryptPayload) return;

    const selectedFile = files.find((file) => file._id === selectedFileId);
    const fileName = selectedFile?.originalName || 'decrypted-file';

    if (decryptPayload.isText) {
      const blob = new Blob([decryptPayload.plaintext], { type: decryptPayload.contentType || 'text/plain;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${fileName}.txt`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      showToast('success', 'Plaintext downloaded.');
      return;
    }

    const binary = window.atob(decryptPayload.binaryBase64 || '');
    const bytes = Uint8Array.from(binary, (char) => char.charCodeAt(0));
    const blob = new Blob([bytes], { type: decryptPayload.contentType || 'application/octet-stream' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    showToast('success', 'Binary file downloaded.');
  }

  function logout() {
    setToken('');
    setUser(null);
    setSelectedUserId('');
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    showToast('warning', 'You have been logged out.');
  }

  if (!token) {
    return (
      <div className="auth-shell">
        <div className="auth-panel">
          <div className="auth-intro glass-card">
            <span className="eyebrow">University Final-Year Project</span>
            <h1>Secure CP-ABE Cloud Sharing</h1>
            <p>
              A modern enterprise security dashboard for demonstrating ciphertext-policy
              attribute-based encryption in a secure cloud-sharing workflow.
            </p>
            <div className="auth-badges">
              <span><i className="fa-solid fa-shield-halved"></i> Access Control</span>
              <span><i className="fa-solid fa-lock"></i> Policy-based Encryption</span>
              <span><i className="fa-solid fa-cloud"></i> Cloud Security Demo</span>
            </div>
          </div>

          <div className="auth-forms">
            <form onSubmit={register} className="glass-card auth-card">
              <div className="card-title-row">
                <h2><i className="fa-solid fa-user-plus"></i> Register</h2>
              </div>
              <div className="field-stack">
                <input className="dashboard-input" placeholder="Username" onChange={(e) => setForm({ ...form, username: e.target.value })} />
                <input className="dashboard-input" placeholder="Email" onChange={(e) => setForm({ ...form, email: e.target.value })} />
                <input className="dashboard-input" type="password" placeholder="Password" onChange={(e) => setForm({ ...form, password: e.target.value })} />
                <select className="dashboard-input" onChange={(e) => setForm({ ...form, role: e.target.value })}>
                  <option value="data_consumer">Data Consumer</option>
                  <option value="data_owner">Data Owner</option>
                  <option value="attribute_authority">Attribute Authority</option>
                  <option value="admin">Admin</option>
                </select>
                <button className="dashboard-button button-success" type="submit">Register account</button>
              </div>
            </form>

            <form onSubmit={login} className="glass-card auth-card">
              <div className="card-title-row">
                <h2><i className="fa-solid fa-right-to-bracket"></i> Login</h2>
              </div>
              <div className="field-stack">
                <input className="dashboard-input" placeholder="Username" onChange={(e) => setLoginForm({ ...loginForm, username: e.target.value })} />
                <input className="dashboard-input" type="password" placeholder="Password" onChange={(e) => setLoginForm({ ...loginForm, password: e.target.value })} />
                <button className="dashboard-button button-primary" type="submit">Login</button>
              </div>
            </form>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="app-root">
      <div className="dashboard-shell">
        <header className="topbar glass-card">
          <div>
            <p className="eyebrow">Enterprise Security Visibility</p>
            <h1><i className="fa-solid fa-shield-halved"></i> Secure CP-ABE Cloud Sharing</h1>
            <p className="subtle-text">Authenticated dashboard for admins, owners, and consumers.</p>
          </div>

          <div className="topbar-actions">
            <div className="user-pill">
              <i className="fa-solid fa-user"></i>
              <span>{user?.username || 'User'}</span>
            </div>
            <button className="dashboard-button button-danger" onClick={logout}>Logout</button>
          </div>
        </header>

        <section className="stats-grid">
          <div className="stat-card glass-card">
            <span className="stat-label"><i className="fa-solid fa-tag"></i> Attributes</span>
            <strong>{attributes.length}</strong>
          </div>
          <div className="stat-card glass-card">
            <span className="stat-label"><i className="fa-solid fa-file-contract"></i> Policies</span>
            <strong>{policies.length}</strong>
          </div>
          <div className="stat-card glass-card">
            <span className="stat-label"><i className="fa-solid fa-cloud-arrow-up"></i> Files</span>
            <strong>{files.length}</strong>
          </div>
        </section>

        <section className="content-grid">
          <div className="glass-card section-card">
            <div className="card-title-row">
              <h2><i className="fa-solid fa-user-shield"></i> Create Attributes</h2>
            </div>

            <form onSubmit={createAttribute} className="field-stack">
              <input name="name" className="dashboard-input" placeholder="Attribute name (Example: Department)" />
              <input name="value" className="dashboard-input" placeholder="Attribute value (Example: CS)" />
              <input name="description" className="dashboard-input" placeholder="Description" />
              <button className="dashboard-button button-success" type="submit">Add attribute</button>
            </form>

            <div className="list-stack">
              {attributes.length === 0 ? (
                <div className="empty-state">No attributes yet. Create your first one.</div>
              ) : (
                attributes.map((item) => (
                  <div key={item._id} className="mini-chip">
                    <span>{item.name}</span>
                    <strong>{item.value}</strong>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="glass-card section-card">
            <div className="card-title-row">
              <h2><i className="fa-solid fa-key"></i> Create Policy</h2>
            </div>

            <form onSubmit={createPolicy} className="field-stack">
              <input name="name" className="dashboard-input" placeholder="Policy name" />
              <input name="expression" className="dashboard-input" placeholder="(Department=CS AND Role=Student)" />
              <input name="description" className="dashboard-input" placeholder="Description" />
              <button className="dashboard-button button-primary" type="submit">Create policy</button>
            </form>

            <div className="list-stack">
              {policies.length === 0 ? (
                <div className="empty-state">No policies yet. Create your first access rule.</div>
              ) : (
                policies.map((policy) => (
                  <div key={policy._id} className="policy-card">
                    <strong>{policy.name}</strong>
                    <span>{policy.expression}</span>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="glass-card section-card upload-section">
            <div className="card-title-row">
              <h2><i className="fa-solid fa-cloud-arrow-up"></i> Upload & Encrypt</h2>
            </div>

            <form onSubmit={uploadFile} className="field-stack">
              <label className="upload-dropzone">
                <input name="file" type="file" />
                <div>
                  <i className="fa-solid fa-cloud-arrow-up"></i>
                  <span>Drag and drop a file here or click to browse</span>
                </div>
              </label>
              <input name="policy" className="dashboard-input" placeholder="Policy expression" />
              <button className="dashboard-button button-accent" type="submit" disabled={isUploading}>
                {isUploading ? <span className="inline-spinner"></span> : <i className="fa-solid fa-lock"></i>}
                {isUploading ? 'Encrypting…' : 'Encrypt & upload'}
              </button>
            </form>
          </div>
        </section>

        <section className="two-column-grid">
          <div className="glass-card section-card">
            <div className="card-title-row">
              <h2><i className="fa-solid fa-folder-open"></i> File Vault</h2>
            </div>

            {files.length === 0 ? (
              <div className="empty-illustration">
                <i className="fa-solid fa-file-circle-xmark"></i>
                <p>No uploaded files yet.</p>
              </div>
            ) : (
              <div className="file-list">
                {files.map((file) => (
                  <div key={file._id} className="file-card">
                    <div>
                      <strong>{file.originalName}</strong>
                      <p>{file.encrypted ? 'Encrypted artifact stored' : 'Plain file record'}</p>
                    </div>
                    <span className={`badge ${file.encrypted ? 'badge-encrypted' : 'badge-plain'}`}>
                      {file.encrypted ? 'Encrypted' : 'Plain'}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="glass-card section-card">
            <div className="card-title-row">
              <h2><i className="fa-solid fa-clock-rotate-left"></i> Audit Timeline</h2>
            </div>

            <div className="audit-timeline">
              {audit.length === 0 ? (
                <div className="empty-state">No audit events yet.</div>
              ) : (
                audit.map((entry) => (
                  <div key={entry._id} className="timeline-item">
                    <div className="timeline-icon">
                      <i className="fa-solid fa-circle-info"></i>
                    </div>
                    <div className="timeline-content">
                      <strong>{entry.action}</strong>
                      <span>{entry.outcome}</span>
                      <p>{entry.details || 'No details provided'}</p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </section>

        <section className="glass-card section-card decrypt-section">
          <div className="card-title-row">
            <h2><i className="fa-solid fa-unlock-keyhole"></i> Decrypt File</h2>
          </div>

          <div className="decrypt-steps">
            <div className="step-pill">1. Select uploaded file</div>
            <div className="step-pill">2. Choose user context</div>
            <div className="step-pill">3. Enter attributes</div>
            <div className="step-pill">4. View plaintext</div>
          </div>

          <div className="decrypt-layout">
            <form onSubmit={decryptSelectedFile} className="field-stack">
              <select value={selectedUserId} onChange={(e) => setSelectedUserId(e.target.value)} className="dashboard-input">
                <option value="">Select user</option>
                {users.map((userEntry) => (
                  <option key={userEntry._id || userEntry.id} value={userEntry._id || userEntry.id}>
                    {userEntry.username} • {userEntry.role}
                  </option>
                ))}
              </select>

              <select value={selectedFileId} onChange={(e) => setSelectedFileId(e.target.value)} className="dashboard-input">
                <option value="">Select uploaded file</option>
                {files.map((file) => (
                  <option key={file._id} value={file._id}>{file.originalName}</option>
                ))}
              </select>

              <input
                value={decryptAttributes}
                onChange={(e) => setDecryptAttributes(e.target.value)}
                className="dashboard-input"
                placeholder="Department=CS, Role=Student"
              />

              <button className="dashboard-button button-accent" type="submit" disabled={isDecrypting}>
                {isDecrypting ? <span className="inline-spinner"></span> : <i className="fa-solid fa-unlock"></i>}
                {isDecrypting ? 'Decrypting…' : 'Decrypt file'}
              </button>
            </form>

            <div className="result-panel">
              {decryptError ? <div className="result-message error">{decryptError}</div> : null}

              {decryptPayload ? (
                <>
                  {decryptPayload.isText ? (
                    <div className="result-message success">
                      <strong>Plaintext result</strong>
                      <pre>{decryptResult}</pre>
                    </div>
                  ) : (
                    <div className="result-message success">
                      <strong>Binary file decrypted successfully</strong>
                      <p className="mt-2">The decrypted payload is binary. Use the download button below to save the recovered file.</p>
                    </div>
                  )}
                  <button className="dashboard-button button-primary" onClick={downloadDecryptedFile}>
                    <i className="fa-solid fa-download"></i>
                    {decryptPayload.isText ? 'Download decrypted file' : 'Download recovered file'}
                  </button>
                </>
              ) : (
                <div className="empty-state">Your plaintext will appear here after decryption succeeds.</div>
              )}
            </div>
          </div>
        </section>
      </div>

      {toast ? (
        <div className={`toast toast-${toast.type}`}>
          <i className={`fa-solid ${toast.type === 'success' ? 'fa-circle-check' : toast.type === 'warning' ? 'fa-triangle-exclamation' : 'fa-circle-xmark'}`}></i>
          <span>{toast.message}</span>
        </div>
      ) : null}
    </div>
  );
}

export default App;
