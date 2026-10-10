# QUANTUM-SHIELD
### Quantum Key Distribution (BB84) & Threat Detection for Critical Infrastructure

> **Notice:** This project is an **educational software simulation prototype**. It demonstrates the quantum physical principles of the BB84 protocol (polarization, measurement collapse, and QBER threshold monitoring) in software. It does **not** claim to be an unhackable system or a real physical quantum photonic device. Real-world QKD requires specialized single-photon optics, authenticated classical communications, and physical site security.

---

## Architecture Overview

```
                      +-----------------------------+
                      |   Alice (Control Center)    |
                      |   Generates Bits & Bases    |
                      +--------------+--------------+
                                     |
                          Single-Photon Transmit
                                     v
                  +-------------------------------------+
                  |   Optical Channel / Eve Intercept   |
                  |     (Random Basis Collapse)         |
                  +------------------+------------------+
                                     |
                                     v
                      +-----------------------------+
                      |     Bob (Remote Substation) |
                      |    Measures in Random Basis |
                      +--------------+--------------+
                                     |
                             Public Sifting
                                     v
                      +-----------------------------+
                      |   QBER Parameter Check      |
                      |    (Threshold: ~11%)        |
                      +--------------+--------------+
                                     |
                    +----------------+----------------+
                    |                                 |
           QBER <= Threshold                   QBER > Threshold
                    v                                 v
          [Key Accepted]                      [Key Rejected]
   Reconciliation & SHA-256             Suspicious Session Flagged
                    v                                 v
        AES-256-GCM Encryption               Command Blocked!
      Protected SCADA Dispatch
```

---

## Tech Stack
* **Backend:** Python (Flask)
* **Quantum Simulation:** Qiskit & Qiskit Aer (`AerSimulator`) with fallback state-vector modeling
* **Cryptography:** `cryptography` library (`AES-256-GCM`)
* **AI Anomaly Detection:** `scikit-learn` (`IsolationForest`)
* **Frontend:** Modern Web UI with Chart.js

---

## Installation & Running

### 1. Install Dependencies
```bash
cd quantum-shield
pip install -r requirements.txt
```

### 2. Run Verification Tests
```bash
python test_quantum_shield.py
```
This tests:
* QBER is near 0% without Eve.
* QBER rises to ~25% when Eve's intercept-resend attack is active.
* Valid AES-256-GCM message encryption and decryption.
* Tampered ciphertext fails decryption with `"Integrity check failed"`.

### 3. Launch Web Dashboard
```bash
python app.py
```
Open `http://localhost:5000` in your browser.

---

## How to Toggle Eve and Interpret Results

1. **Eve OFF (Normal Baseline):**
   * Keep the Eve switch toggled to **OFF**.
   * Run the simulation with 100 qubits.
   * Observed QBER is near **0.0%**.
   * The key is accepted and the final 256-bit AES key is derived.
   * Send a critical SCADA command: `"Reduce power output to 70%"`. The command is encrypted with AES-256-GCM and Bob successfully authenticates it.

2. **Eve ON (Intercept-Resend Attack):**
   * Toggle the Eve switch to **ON**.
   * Run the simulation.
   * Eve intercepts propagating qubits, measures them in a randomly chosen basis, and reprepairs states.
   * Due to the **No-Cloning Theorem** and wave-function collapse, Eve's conjugate measurements introduce error.
   * Observed QBER rises toward **~25%**, exceeding the 11% threshold.
   * The dashboard flags a **SECURITY ALERT**, rejects the key, and marks the session suspicious.
   * Try sending a command: the dashboard blocks it with `"Command blocked: suspicious key"`.

3. **Tamper Test:**
   * In a secure session, click **Simulate Tampering** to corrupt a byte of the in-flight ciphertext.
   * Bob attempts decryption, the GCM authentication tag fails verification, and the dashboard displays `"Integrity check failed"`.

---

## Honesty and Labelling Requirements

1. **Simulation Scope:** QKD only distributes cryptographic keys; AES-256-GCM provides authenticated encryption for the actual payload.
2. **Backend Execution:** The backend defaults to local simulation (`AerSimulator`). Hardware execution requires authenticating with a physical IBM Quantum cloud service.
3. **QBER Threshold:** The 11% threshold is an educational parameter based on the asymptotic Shor-Preskill BB84 proof; real-world engineering thresholds depend on channel loss, detector dark counts, and finite-key effects.
4. **Simulated Infrastructure:** No physical power grid or substation is altered by this educational prototype.
