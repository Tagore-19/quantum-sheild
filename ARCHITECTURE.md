# Q-SHIELD System Architecture

## Overview
Q-SHIELD is architected as a modular, full-stack quantum simulation platform designed to decouple quantum physical modeling, RESTful API transport, telemetry storage, and high-fidelity interactive visualization.

```
+-------------------------------------------------------------------------+
|                         User Web Browser (SPA)                          |
|  - Dashboard View        - QKD Simulator View      - Threat Monitor     |
|  - Network Topology      - Key Management          - Analytics & Charts |
|  - Education Center      - SIEM Audit Logs         - 1-Click Demo       |
+------------------------------------+------------------------------------+
                                     |  HTTP REST / JSON
                                     v
+-------------------------------------------------------------------------+
|                     Express 4.21 Backend Server                         |
|  - Endpoint Validation   - Session In-Memory DB    - Audit Event Ledger |
|  - AI Proxy Controller   - Vite Middleware Bridge  - Metrics Aggregator |
+------------------------------------+------------------------------------+
                                     |
                                     v
+-------------------------------------------------------------------------+
|                      QKD Simulation Core Engine                         |
|  1. Quantum State Preparation (Alice: Z and X bases)                    |
|  2. Quantum Optical Channel Model (Depolarizing Noise & Attenuation)    |
|  3. Eve Intercept-Resend Attacker Model (Projective Collapse)           |
|  4. Bob Dual-Basis Receiver & Measurement                               |
|  5. Classical Basis Sifting Protocol (Announce Bases)                   |
|  6. Statistical QBER Parameter Estimation                               |
|  7. Security Policy Threshold Evaluator (11% Asymptotic Limit)           |
|  8. One-Time Pad SCADA Interlocking Cryptography Engine                 |
+------------------------------------+------------------------------------+
                                     |
             +-----------------------+-----------------------+
             v                                               v
+-----------------------------+             +-----------------------------+
|    AI Security Assistant    |             |   Offline Deterministic     |
|  - Gemini 3.8 Flash SDK     |             |   - Rule-Based Telemetry    |
|  - Server-Side Proxy        |             |   - Zero Network Fallback   |
+-----------------------------+             +-----------------------------+
```

## Layered Component Specifications

### 1. Quantum State Preparation
* **File:** `src/services/bb84Simulation.ts`
* Generates true random bits $a_i \in \{0, 1\}$ and basis choices $b_A \in \{Z, X\}$.
* Encodes into single-photon polarization state vectors:
  * $Z(0) \rightarrow |0\rangle$, $Z(1) \rightarrow |1\rangle$
  * $X(0) \rightarrow |+\rangle$, $X(1) \rightarrow |-\rangle$

### 2. Quantum Channel & Eve Model
* If Eve intercepts with probability $p_{eve}$:
  * Eve selects basis $b_E \in \{Z, X\}$ uniformly at random.
  * Quantum measurement collapses conjugate states with $50\%$ probability.
  * Eve reprepairs and resends the collapsed state.
* Environmental depolarizing noise $p_{noise}$ flips states with probability $p_{noise}/2$.

### 3. Bob Receiver & Measurement
* Bob randomly chooses basis $b_B \in \{Z, X\}$.
* Measures arriving state according to the Born rule.

### 4. Classical Sifting & QBER Engine
* Compares $b_A$ and $b_B$ over public authenticated channel.
* Keeps indices where $b_A = b_B$ (theoretical yield $\approx 50\%$).
* Sacrifices a random subset of sifted bits to calculate:
  $$\text{QBER} = \frac{\text{Number of mismatched sifted bits}}{\text{Number of compared sifted bits}}$$

### 5. Operational Security Policy
* Evaluates $\text{QBER} \le \text{Threshold}$ (default $11.0\%$).
* If passed: Generates usable secret key in Hex and Binary; verifies SCADA One-Time Pad encryption.
* If failed: Discards key, flags session `KEY_REJECTED`, blocks SCADA dispatch, logs `QBER_THRESHOLD_EXCEEDED`.
