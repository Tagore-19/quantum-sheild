# Q-SHIELD: Quantum-Secure Communication and Threat Detection Platform for Critical Infrastructure

> **Problem Statement:** VNQFF-07 — Quantum Key Distribution for Critical Infrastructure  
> **Platform Name:** Q-SHIELD  
> **Status:** Software Simulation & Educational Demonstration Prototype  

---

## ⚡ Important Scientific & Prototype Notice
**THIS IS A SOFTWARE SIMULATION AND EDUCATIONAL DEMONSTRATION PROTOTYPE, NOT A CLAIM OF REAL-WORLD QUANTUM HARDWARE DEPLOYMENT.**

Real-world Quantum Key Distribution (QKD) requires specialized quantum-photonic hardware (single-photon emitters or entangled photon pairs, avalanche photodiode or superconducting nanowire single-photon detectors), low-loss dark fiber or free-space optical channels, authenticated classical channels, physical site security, and post-processing hardware (information reconciliation & privacy amplification).

Q-SHIELD faithfully simulates the quantum mechanics of the **BB84 protocol** (Bennett & Brassard 1984), single-photon polarization encoding, wave-function measurement collapse, and **Quantum Bit Error Rate (QBER)** threat detection in software.

---

## 🌟 Executive Summary

Modern critical infrastructure—such as high-voltage electric transmission grids, municipal water treatment facilities, and train signaling networks—relies on Supervisory Control and Data Acquisition (SCADA) telemetry. Today's communications are protected by classical public-key cryptography (RSA, ECC), which are mathematically vulnerable to future quantum computers running Shor’s algorithm, and susceptible to today's **"Harvest Now, Decrypt Later"** attacks.

**Q-SHIELD** solves this challenge by demonstrating how **BB84 Quantum Key Distribution** can establish information-theoretically secure shared secret keys between a Central Control Center (Alice) and a Remote Substation (Bob), while using **Quantum Bit Error Rate (QBER)** monitoring to detect any eavesdropping attempt (Eve) in real time.

---

## 🔬 Core Scientific Mechanics & BB84 Implementation

### 1. Quantum State Representation
Q-SHIELD implements single-photon polarization encoding across two mutually unbiased bases (MUBs):
* **Computational (Rectilinear / Z) Basis:**
  * Bit 0 $\rightarrow$ $|0\rangle$ (Horizontal polarization, $0^\circ$)
  * Bit 1 $\rightarrow$ $|1\rangle$ (Vertical polarization, $90^\circ$)
* **Diagonal (Hadamard / X) Basis:**
  * Bit 0 $\rightarrow$ $|+\rangle = \frac{|0\rangle + |1\rangle}{\sqrt{2}}$ ($+45^\circ$ diagonal polarization)
  * Bit 1 $\rightarrow$ $|-\rangle = \frac{|0\rangle - |1\rangle}{\sqrt{2}}$ ($-45^\circ$ diagonal polarization)

### 2. Quantum Measurement Collapse (Born Rule)
* If Bob (or Eve) measures a photon in the **same basis** as Alice: The measurement is deterministic ($100\%$ accuracy).
* If Bob (or Eve) measures a photon in the **conjugate orthogonal basis**: The wave-function collapses into a 50/50 superposition:
  $$P(\text{outcome } 0) = P(\text{outcome } 1) = 0.5$$

### 3. The 25% Eavesdropping Invariant
By the **No-Cloning Theorem**, Eve cannot copy propagating photons. Under an intercept-resend attack:
1. Eve intercepts a fraction $p_{eve}$ of transmitted qubits.
2. Eve randomly guesses between $Z$ and $X$ basis (50% probability of error).
3. If Eve guesses the wrong basis, her measurement projects the qubit into the conjugate state and resends it.
4. When Alice and Bob compare identical bases, Bob has a 50% chance of getting the wrong bit:
   $$\text{Error per intercepted qubit} = P(\text{Eve wrong basis}) \times P(\text{Bob error}) = 0.5 \times 0.5 = 25\%$$
5. Total expected QBER from eavesdropping:
   $$\text{QBER}_{eve} = 0.25 \times p_{eve}$$

### 4. Security Threshold Determination
* **Default Threshold:** $11.0\%$ (the asymptotic Shor-Preskill threshold for unconditional BB84 security).
* **Configurable:** Fully adjustable ($1\%$ to $25\%$) to accommodate practical optical fiber noise margins and finite-key effects.
* If $\text{QBER} > \text{Threshold} \rightarrow$ **POTENTIAL EAVESDROPPING / KEY REJECTED**.
* If $\text{QBER} \le \text{Threshold} \rightarrow$ **SECURE / KEY ACCEPTED FOR SCADA ONE-TIME PAD**.

---

## 🚀 Key Features

* **Interactive BB84 Simulation:**
  * Control qubit count ($50$, $100$, $500$, $1000$), channel noise ($0\%$ to $20\%$), Eve toggle & interception rate ($10\%$ to $100\%$), and security threshold.
* **Microscopic Qubit Inspector Table:**
  * Inspect all photons: Alice Bit, Alice Basis, Prepared State, Eve Basis, Eve Result, Bob Basis, Bob Result, Sifted Status, and Error.
  * Click any qubit to view wave-function collapse mathematics!
* **Critical Infrastructure Scenarios:**
  * Power Grid (Substation 400kV PMU sync)
  * Municipal Water Distribution (East Pumping Station valves)
  * High-Speed Rail Signaling (Interlocking track clearance)
  * Nuclear Safety Auxiliary Cooling (Emergency loop valves)
* **Live One-Time Pad Encryption Demo:**
  * Real-time XOR stream encryption of SCADA commands (`"TRIP_BREAKER_SYNC_400KV_BUS_B"`).
  * Automatically blocks transmission when key status is marked `REJECTED`!
* **Threat Monitor & Attack Radar:**
  * Visualizes the Alice $\rightarrow$ Eve $\rightarrow$ Bob attack flow.
  * Calculates theoretical vs. observed QBER in real time.
* **Analytics & SVG Charts:**
  * QBER vs. Eve Interception percentage curve.
  * Historical session registry with CSV & JSON export.
* **1-Click Hackathon Demo Mode:**
  * Automated 5-stage presentation workflow for judges.
* **AI Security Analyst:**
  * Real-time natural language interpretation powered by Gemini 3.8 Flash, with guaranteed offline deterministic fallback.

---

## 🛠️ Technology Stack

* **Frontend:** React 19, TypeScript, Tailwind CSS, Lucide Icons
* **Backend:** Express 4.21, TypeScript (`tsx` engine)
* **Simulation Core:** Exact Complex State Vector BB84 & Born Rule measurement engine
* **AI Integration:** `@google/genai` TypeScript SDK (model `gemini-3.8-flash`) + offline rule-based telemetry engine
* **Testing:** Automated test suite (`tests/bb84.test.ts`) with fixed seed verification

---

## 💻 Quickstart (Beginner Friendly)

### 1. Prerequisites
* Node.js v18 or higher installed on your computer
* npm (bundled with Node.js)

### 2. Installation
```bash
# Clone repository
git clone https://github.com/your-repo/q-shield.git
cd q-shield

# Install dependencies
npm install
```

### 3. Environment Configuration
Create a `.env` file from `.env.example`:
```bash
cp .env.example .env
```
*(Optional: Add `GEMINI_API_KEY="your-api-key"` for enhanced AI analysis; the app runs 100% offline without it!)*

### 4. Running the Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your web browser.

### 5. Running Automated Verification Tests
```bash
npm test
```
Verifies polarization encoding, quantum collapse, 0-noise accuracy, 100% Eve 25% error invariant, 50% Eve 12.5% error invariant, and One-Time Pad cryptography.

---

## 📊 REST API Documentation

* `POST /api/simulation/run` — Run BB84 simulation with custom parameters
* `POST /api/qkd/bb84` — Shortcut: Run normal secure channel session
* `POST /api/qkd/attack` — Shortcut: Run simulated Eve attack session
* `POST /api/simulation/reset` — Reset state to clean baseline
* `GET /api/simulation/:id` — Retrieve specific session details
* `GET /api/metrics` — Aggregated operational statistics
* `GET /api/events` — Security audit logs (filterable by severity)
* `GET /api/sessions` — Session history registry
* `GET /api/health` — System status and quantum engine health
* `POST /api/ai/analyze` — Request AI security mentor interpretation

---

## 🏆 Hackathon Pitch Script (Summary)

> "Q-SHIELD is a simulation-based quantum-security monitoring platform that demonstrates BB84 Quantum Key Distribution for critical-infrastructure communication and identifies simulated eavesdropping through QBER-based monitoring."

See the in-app **About & Pitch** tab for the full 5-minute presentation script and judge Q&A breakdown.
