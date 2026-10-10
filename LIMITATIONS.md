# Q-SHIELD: Scientific Limitations & Assumptions

## 1. Scientific & Engineering Context
Q-SHIELD is a software-based educational simulation platform designed to demonstrate the theoretical mechanics of the BB84 Quantum Key Distribution protocol and Quantum Bit Error Rate (QBER) eavesdropping detection.

It is **NOT** a physical quantum hardware deployment.

---

## 2. Documented Simulation Assumptions

### A. Quantum State Generation
* **In Simulation:** Polarization states $|0\rangle$, $|1\rangle$, $|+\rangle$, $|-\rangle$ are represented as mathematical state vectors.
* **In Real World:** Single-photon sources (attenuated pulsed lasers or parametric down-conversion entangled sources) exhibit multi-photon emission probabilities. Real systems require **Decoy State BB84** to prevent Photon Number Splitting (PNS) attacks.

### B. Optical Channel & Noise
* **In Simulation:** Modeled via a depolarizing and random phase-flip channel matrix.
* **In Real World:** Fiber channels suffer chromatic dispersion, polarization mode dispersion (PMD), Rayleigh backscattering, and distance-dependent exponential attenuation ($\sim 0.2\text{ dB/km}$ at $1550\text{ nm}$). Real QKD links without trusted repeaters have a practical transmission ceiling of approximately $100\text{–}150\text{ km}$.

### C. Detectors & Dark Counts
* **In Simulation:** Bob’s measurement outcomes follow the theoretical Born rule with ideal detectors.
* **In Real World:** Single-Photon Avalanche Diodes (SPADs) or Superconducting Nanowire Single-Photon Detectors (SNSPDs) have non-zero dark count rates, finite detection efficiency ($\sim 10\text{–}85\%$), and detector dead times.

### D. Classical Channel Authentication
* **In Simulation:** Basis reconciliation and error estimation are assumed to travel over an authenticated classical channel.
* **In Real World:** If the classical channel is unauthenticated, Eve can perform a classical man-in-the-middle attack. Practical QKD requires information-theoretically secure authentication schemes, such as **Wegman-Carter polynomial hashing**, pre-seeded with a short shared secret key.

### E. Finite-Key Effects
* **In Simulation:** QBER is computed directly over a sample of sifted bits.
* **In Real World:** Statistical fluctuations in finite sample sizes can mask subtle eavesdropping. Rigorous composable security proofs require finite-key analysis and smooth min-entropy estimators.
