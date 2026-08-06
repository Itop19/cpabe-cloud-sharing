# Secure CP-ABE Cloud Sharing System

## Abstract

This project presents a secure cloud data-sharing prototype that demonstrates attribute-based access control using a simplified Ciphertext-Policy Attribute-Based Encryption (CP-ABE) workflow. The system integrates three layers: a Node.js/Express backend for persistence and API services, a Python Flask service that simulates the cryptographic policy engine, and a React/Vite frontend for user interaction and visual demonstration.

The objective of the system is to provide a practical and educational implementation of how access to encrypted data can be governed by attributes and policy expressions, rather than by static user roles alone. Although the cryptographic logic is simulated for prototype purposes, the overall architecture and interaction flow closely resemble a real CP-ABE-based system.

## Deployment Readiness Notes

The project has been prepared for deployment by:
- using environment-based configuration instead of hard-coded secrets
- enabling CORS for approved frontend origins
- hashing passwords with bcrypt before persistence
- returning friendly error messages for database, Flask, upload, and decryption failures
- adding a deployment-focused ignore file for local artifacts and build output

## 1. Introduction

Modern secure cloud-sharing systems often require access decisions to be made dynamically based on user attributes such as department, role, or organizational affiliation. Traditional role-based models are limited because they typically assign a single access level to a user. In contrast, attribute-based access control allows access to be granted when a user's attributes satisfy a policy condition.

This project implements a demonstration of that concept in a simple and understandable web application. It allows a user to:

- create an account and authenticate
- define attributes and access policies
- upload a file and encrypt it under a policy
- provide attribute-based credentials for decryption
- view plaintext results in the browser

## 2. Problem Statement

Many cloud-sharing applications rely on basic identity checks or static permissions. These models often do not capture real-world access requirements in highly dynamic environments where users need access based on a combination of attributes rather than fixed predefined roles.

The project addresses this by illustrating how a policy-driven access model can be built and demonstrated through a lightweight prototype. It focuses on the workflow associated with attribute-based encryption concepts, rather than on delivering a production-grade cryptographic framework.

## 3. Objectives

The main objectives of the project are to:

1. design and implement a prototype secure file-sharing system
2. provide a local web interface for user interaction
3. demonstrate attribute-based access control in a practical manner
4. simulate CP-ABE encryption and decryption behavior
5. allow experimentation, evaluation, and academic presentation of the workflow

## 4. System Architecture

The architecture is divided into three major components.

### 4.1 Backend Layer

The backend is implemented in Node.js using Express and Mongoose. It is responsible for:

- user registration and authentication
- attribute management
- policy definition and retrieval
- file metadata handling
- file upload and decryption requests
- audit logging

The backend is connected to MongoDB locally using the URI:

```text
mongodb://localhost:27017/
```

If MongoDB is unreachable, the system can continue in fallback mode using an in-memory strategy so the prototype remains usable for demonstration.

### 4.2 CP-ABE Simulation Service

A Python Flask service is included to simulate the encryption and decryption policy engine. It exposes health and encryption/decryption endpoints and demonstrates the CP-ABE-style behavior required by the rest of the platform.

### 4.3 Frontend Layer

The frontend is built with React and Vite. It provides a modern security-portal interface for:

- registration and login
- attribute and policy creation
- file upload and encryption
- decryption with attribute input
- plaintext viewing and file download

## 5. Methodology

The project follows a layered development methodology:

1. authentication and data persistence are implemented in the backend
2. access conditions are represented as policy expressions
3. files are uploaded and encrypted using a simulated CP-ABE process
4. decryption is attempted by supplying attribute values in the frontend
5. audit records are generated to capture operations and outcomes

This approach allows the project to remain understandable for educational purposes while still modeling a realistic secure-sharing workflow.

## 6. Functional Workflow

A typical user interaction with the system proceeds as follows:

1. A user registers and logs in.
2. Attributes such as Department and Role are created.
3. A policy condition is defined.
4. A file is uploaded through the dashboard.
5. The system encrypts the file using the simulated CP-ABE service.
6. The user selects an uploaded file and enters attributes.
7. The decryption attempt is evaluated against the policy.
8. If the policy is satisfied, the plaintext is shown in the browser.

## 7. Implementation Details

### Authentication

The backend uses JWT-based authentication and password hashing for secure local demonstration.

### File Handling

Uploaded files are stored locally, and metadata is persisted in the system database. The encrypted artifact is also saved on disk for demonstration.

### Audit Logging

Every file and access-related action is logged to provide traceability and a basis for evaluation.

### Limitations of the Prototype

This project uses simulated CP-ABE logic rather than a full real cryptographic implementation. The primary purpose is conceptual demonstration, not production-level security assurance.

## 8. Evaluation Strategy

The following evaluation approach is recommended:

1. register a user and authenticate successfully
2. create attributes and access policies
3. upload files with different sizes and contents
4. test successful decryption with matching attributes
5. test unsuccessful decryption with non-matching attributes
6. review audit logs and verify system responses

## 9. Expected Results

The expected result of a valid test run is:

- successful registration and login
- creation of attributes and policies
- successful upload and encrypted file metadata generation
- successful decryption when the supplied attributes match the policy
- denial or failure when the attributes do not match

## 10. Project Structure Summary

- backend/: core API, database connection, user and file management
- cpabe-service/: Flask service for simulated encryption/decryption
- frontend/: React dashboard presenting the user workflow
- uploads/: local file storage directory
- benchmark-output/: benchmark results for the evaluation process

## 11. Running the Project

### Dependencies

```bash
cd backend
npm install
```

```bash
cd frontend
npm install
```

```bash
cd cpabe-service
pip install -r requirements.txt
```

### Start services

```bash
cd cpabe-service
python app.py
```

```bash
cd backend
npm start
```

```bash
cd frontend
npm run dev
```

Then open the frontend in a browser.

## 12. Troubleshooting Notes

- If the frontend cannot reach the backend, verify the proxy and backend port.
- If MongoDB is unavailable, the application will fall back to an in-memory mechanism.
- If the Flask service is not reachable, confirm the Python environment and the service port.
- If uploads fail, verify that the upload directory has write permissions.

## 13. Conclusion

The Secure CP-ABE Cloud Sharing System serves as a proof-of-concept for demonstrating how attribute-based access control can be modeled in a web application. While the cryptographic layer is simulated for simplicity, the project successfully captures the major functional workflow of a real CP-ABE-inspired secure sharing system and provides a strong basis for academic discussion, evaluation, and further enhancement.
