"""
QUANTUM-SHIELD: BB84 Quantum Key Distribution Simulation Module
Implements single-qubit circuits with Qiskit and AerSimulator (with standard-library fallback).
"""

import random
from typing import Dict, List, Tuple, Any

# Try importing Qiskit and AerSimulator; if not installed, use faithful state-vector simulation fallback
HAS_QISKIT = False
try:
    from qiskit import QuantumCircuit
    from qiskit_aer import AerSimulator
    HAS_QISKIT = True
except ImportError:
    HAS_QISKIT = False


def simulate_single_qubit_qiskit(
    alice_bit: int,
    alice_basis: str,
    eve_enabled: bool,
    eve_basis: str,
    bob_basis: str,
    simulator: Any
) -> Tuple[int, int, int]:
    """
    Executes a BB84 single-qubit transmission using real Qiskit circuits on AerSimulator.
    Returns: (eve_measured_bit, bob_measured_bit, final_circuit_depth)
    """
    # Phase 1: Alice prepares state
    # Basis Z: bit 0 -> |0>, bit 1 -> |1> (via X gate)
    # Basis X: bit 0 -> |+>, bit 1 -> |-> (via X gate then H gate)
    qc = QuantumCircuit(1, 1)
    if alice_bit == 1:
        qc.x(0)
    if alice_basis == 'X':
        qc.h(0)

    eve_measured_bit = None

    # Phase 2: Optional Eve Intercept-Resend Attack
    if eve_enabled:
        eve_qc = qc.copy()
        if eve_basis == 'X':
            eve_qc.h(0)
        eve_qc.measure(0, 0)
        
        result_eve = simulator.run(eve_qc, shots=1).result()
        counts_eve = result_eve.get_counts()
        eve_measured_bit = int(list(counts_eve.keys())[0])

        # Eve prepares resent state
        qc = QuantumCircuit(1, 1)
        if eve_measured_bit == 1:
            qc.x(0)
        if eve_basis == 'X':
            qc.h(0)

    # Phase 3: Bob measures state
    if bob_basis == 'X':
        qc.h(0)
    qc.measure(0, 0)

    result_bob = simulator.run(qc, shots=1).result()
    counts_bob = result_bob.get_counts()
    bob_measured_bit = int(list(counts_bob.keys())[0])

    return eve_measured_bit, bob_measured_bit, qc.depth()


def simulate_single_qubit_fallback(
    alice_bit: int,
    alice_basis: str,
    eve_enabled: bool,
    eve_basis: str,
    bob_basis: str
) -> Tuple[int, int]:
    """
    Exact mathematical quantum state simulation fallback adhering to the Born rule
    and Heisenberg measurement collapse when Qiskit is not yet installed.
    """
    current_state_basis = alice_basis
    current_bit = alice_bit
    eve_measured = None

    if eve_enabled:
        if eve_basis == current_state_basis:
            eve_measured = current_bit
        else:
            # Orthogonal conjugate measurement collapses to 50/50 superposition
            eve_measured = random.choice([0, 1])
        # Eve reprepairs state
        current_state_basis = eve_basis
        current_bit = eve_measured

    if bob_basis == current_state_basis:
        bob_measured = current_bit
    else:
        # Conjugate measurement
        bob_measured = random.choice([0, 1])

    return eve_measured, bob_measured


def run_bb84_simulation(
    num_qubits: int = 100,
    eve_enabled: bool = False,
    threshold: float = 0.11,
    sample_ratio: float = 0.20,
    backend_choice: str = "AerSimulator"
) -> Dict[str, Any]:
    """
    Executes full BB84 protocol:
    1. Alice generates random bits and random bases
    2. Quantum circuit execution (shots=1 per qubit)
    3. Optional Eve intercept-resend attack
    4. Bob measurement
    5. Basis sifting
    6. QBER parameter estimation
    7. Decision threshold evaluation
    """
    simulator = None
    if HAS_QISKIT and backend_choice == "AerSimulator":
        simulator = AerSimulator()

    alice_bits = [random.choice([0, 1]) for _ in range(num_qubits)]
    alice_bases = [random.choice(['Z', 'X']) for _ in range(num_qubits)]
    bob_bases = [random.choice(['Z', 'X']) for _ in range(num_qubits)]

    eve_bases = [random.choice(['Z', 'X']) if eve_enabled else None for _ in range(num_qubits)]
    eve_results = []
    bob_results = []

    for i in range(num_qubits):
        a_bit = alice_bits[i]
        a_basis = alice_bases[i]
        b_basis = bob_bases[i]
        e_basis = eve_bases[i]

        if simulator:
            e_meas, b_meas, _ = simulate_single_qubit_qiskit(
                a_bit, a_basis, eve_enabled, e_basis, b_basis, simulator
            )
        else:
            e_meas, b_meas = simulate_single_qubit_fallback(
                a_bit, a_basis, eve_enabled, e_basis, b_basis
            )

        eve_results.append(e_meas)
        bob_results.append(b_meas)

    # 3. Sifting: keep only matching bases
    sifted_indices = [i for i in range(num_qubits) if alice_bases[i] == bob_bases[i]]
    discarded_indices = [i for i in range(num_qubits) if alice_bases[i] != bob_bases[i]]

    sifted_alice = [alice_bits[i] for i in sifted_indices]
    sifted_bob = [bob_results[i] for i in sifted_indices]
    sifted_length = len(sifted_indices)

    # 4. QBER Calculation (sample subset e.g. 20%)
    sample_size = max(1, int(sifted_length * sample_ratio)) if sifted_length > 2 else sifted_length
    
    # Shuffle or select random sample of sifted indices
    shuffled_sifted = list(range(sifted_length))
    random.shuffle(shuffled_sifted)
    sample_indices = set(shuffled_sifted[:sample_size])

    compared_alice = []
    compared_bob = []
    final_alice_key_bits = []
    final_bob_key_bits = []

    mismatches = 0
    for idx in range(sifted_length):
        if idx in sample_indices:
            compared_alice.append(sifted_alice[idx])
            compared_bob.append(sifted_bob[idx])
            if sifted_alice[idx] != sifted_bob[idx]:
                mismatches += 1
        else:
            final_alice_key_bits.append(sifted_alice[idx])
            final_bob_key_bits.append(sifted_bob[idx])

    qber = (mismatches / sample_size) if sample_size > 0 else 0.0

    # 5. Key decision
    key_accepted = qber <= threshold

    # Flow traces for visualization (first 25 qubits)
    flow_table = []
    for i in range(min(num_qubits, 30)):
        matched = alice_bases[i] == bob_bases[i]
        bit_error = matched and (alice_bits[i] != bob_results[i])
        flow_table.append({
            "index": i,
            "alice_bit": alice_bits[i],
            "alice_basis": alice_bases[i],
            "circuit_gate": f"X({'yes' if alice_bits[i] else 'no'}), H({'yes' if alice_bases[i]=='X' else 'no'})",
            "eve_basis": eve_bases[i] if eve_enabled else "-",
            "eve_result": eve_results[i] if eve_enabled else "-",
            "bob_basis": bob_bases[i],
            "bob_result": bob_results[i],
            "basis_match": matched,
            "error": bit_error
        })

    return {
        "num_qubits": num_qubits,
        "eve_enabled": eve_enabled,
        "backend": "Qiskit AerSimulator" if simulator else "State-Vector Simulation Engine (Qiskit-aligned)",
        "sifted_length": sifted_length,
        "discarded_length": len(discarded_indices),
        "sample_size": sample_size,
        "mismatches": mismatches,
        "qber": round(qber, 4),
        "qber_percentage": round(qber * 100, 2),
        "threshold": threshold,
        "threshold_percentage": round(threshold * 100, 1),
        "key_accepted": key_accepted,
        "final_key_bits": final_alice_key_bits,
        "final_bob_bits": final_bob_key_bits,
        "flow_table": flow_table,
    }
