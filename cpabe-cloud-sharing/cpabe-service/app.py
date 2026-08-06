from flask import Flask, request, jsonify
import base64
import os

app = Flask(__name__)

@app.get('/health')
def health():
    return jsonify({"ok": True, "service": "cpabe-service"})

@app.post('/generate-params')
def generate_params():
    return jsonify({"success": True, "public_params": {"algorithm": "CP-ABE", "mode": "simulated"}, "master_key": {"algorithm": "CP-ABE", "mode": "simulated"}})

@app.post('/generate-user-key')
def generate_user_key():
    data = request.get_json() or {}
    attributes = data.get('attributes', [])
    return jsonify({"success": True, "user_key": {"attributes": attributes, "mode": "simulated"}})

@app.post('/encrypt')
def encrypt():
    data = request.get_json() or {}
    file_buffer = data.get('fileBuffer', '')
    policy = data.get('policy', '')
    filename = data.get('filename', 'file.bin')
    content_bytes = base64.b64decode(file_buffer) if file_buffer else b''
    ciphertext = base64.b64encode(content_bytes + b'::CPABE::' + policy.encode()).decode()
    return jsonify({"success": True, "ciphertext": ciphertext, "filename": filename, "policy": policy})

@app.post('/decrypt')
def decrypt():
    data = request.get_json() or {}
    ciphertext = data.get('ciphertext', '')
    key = data.get('key', {})
    try:
        if not key.get('attributes'):
            raise PermissionError('missing attributes')

        decoded = base64.b64decode(ciphertext)
        if b'::CPABE::' not in decoded:
            raise ValueError('not encrypted')

        plaintext_bytes = decoded.split(b'::CPABE::', 1)[0]

        try:
            plaintext_text = plaintext_bytes.decode('utf-8')
            return jsonify({
                "success": True,
                "isText": True,
                "plaintext": plaintext_text,
                "contentType": "text/plain;charset=utf-8"
            })
        except UnicodeDecodeError:
            return jsonify({
                "success": True,
                "isText": False,
                "plaintext": '',
                "binaryBase64": base64.b64encode(plaintext_bytes).decode('ascii'),
                "contentType": "application/octet-stream"
            })
    except Exception as e:
        return jsonify({"success": False, "message": str(e)})

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=int(os.getenv('PORT', '8000')))
