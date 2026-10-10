# Q-SHIELD: Hackathon Demo & Presentation Guide

## 🏆 Project Core Message
> **"Q-SHIELD is a simulation-based quantum-security monitoring platform that demonstrates BB84 Quantum Key Distribution for critical-infrastructure communication and identifies simulated eavesdropping through QBER-based monitoring."**

---

## ⏱️ 5-Minute Pitch Outline

| Time | Phase | Narrative Focus | Demo Action |
|---|---|---|---|
| **00:00 - 01:00** | The Problem | Quantum computers breaking classical RSA/ECC; "Harvest Now, Decrypt Later" threat to power grids & SCADA. | Show Dashboard in Power Grid mode. |
| **01:00 - 02:00** | The Solution | Introduce Q-SHIELD & BB84 Quantum Key Distribution. Show clean key agreement with 0% noise. | Click "Run Simulation" in Mode A. Show QBER = 0.0%, Status = SECURE, OTP verified. |
| **02:00 - 03:15** | The Attack | Activate Eve (50% intercept-resend). Explain No-Cloning Theorem & wave-function collapse. | Click "Mode C: Attack". Watch QBER spike to ~12.5%, crossing the 11% threshold. |
| **03:15 - 04:00** | Policy Action | Explain automated key rejection, blocked SCADA transmission, and microscopic qubit inspection. | Open Qubit Inspector Table, show Eve corrupted rows. Point to blocked SCADA command. |
| **04:00 - 05:00** | Architecture & Close | Highlight modular full-stack code, automated test suite, and operational vision. | Show Architecture tab, conclude with call to action. |

---

## 🎯 1-Click Automated Demo Instructions
For live judge demonstrations where you want guaranteed smooth pacing:
1. Click the **"1-Click Demo"** button in the top navigation bar.
2. In the modal, click **"Start Automated Demo"**.
3. Watch as Q-SHIELD automatically transitions through:
   * **Phase 1:** Baseline secure BB84 link ($\text{QBER} = 0.0\%$, key accepted).
   * **Phase 2:** Adversary Eve engages with $50\%$ intercept-resend wiretap.
   * **Phase 3:** Measured QBER jumps to $\sim 12.5\%$, violating the $11.0\%$ threshold.
   * **Phase 4:** Key marked untrusted and discarded; SCADA dispatch blocked.
   * **Phase 5:** Quantum channel re-calibrated; fresh verified key established.
4. Click **"Reset Demo"** to repeat at any time!
