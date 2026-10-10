# Q-SHIELD: Future Engineering Roadmap

## Vision
To transition Q-SHIELD from an educational software simulation into an operational, hybrid Quantum-Classical Security Operations Center (Q-SOC) platform for regional energy grids and critical infrastructure networks.

---

## Roadmap Phases

### Phase 1: Advanced Protocol Simulation
* **Decoy-State BB84:** Model vacuum + weak decoy pulses to simulate protection against Photon Number Splitting (PNS) attacks.
* **Continuous-Variable QKD (CV-QKD):** Support coherent state modulation for standard telecom fiber without requiring cryogenic single-photon detectors.
* **E91 Entangled-Photon Protocol:** Simulate Ekert 91 protocol with Bell inequality ($S \le 2\sqrt{2}$) tests for device-independent QKD.

### Phase 2: Quantum Cloud & Hardware Integration
* **Qiskit Aer Integration:** Support quantum circuit execution via Qiskit Aer noise models.
* **IBM Quantum / IonQ Backends:** Interface with real cloud QPUs for quantum entropy sourcing.
* **Hardware Security Module (HSM) PKCS#11:** Deliver quantum-seeded keys directly to hardware cryptographic accelerators.

### Phase 3: Critical Infrastructure & OT Protocol Drivers
* **IEC 61850 & IEC 60870-5-104:** Quantum-secured Substation Automation System (SAS) communication.
* **DNP3 Secure Authentication (SAv5):** Seamless key rotation for distributed RTUs.
* **Quantum Trusted Relays & Repeaters:** Model multi-hop mesh topologies spanning national electrical grids.
