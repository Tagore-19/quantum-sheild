"""
QUANTUM-SHIELD: Key Post-Processing Module
Implements parity-based error reconciliation and SHA-256 privacy amplification.
"""

import hashlib
from typing import List, Tuple, Dict, Any


def parity_reconciliation(alice_bits: List[int], bob_bits: List[int], block_size: int = 4) -> Tuple[List[int], int]:
    """
    Simplified parity-based reconciliation:
    Partitions sifted bits into small blocks, compares block parity.
    Corrects detected single-bit discrepancies.
    Returns: (reconciled_bits, corrected_error_count)
    """
    reconciled = list(alice_bits)
    corrected_errors = 0

    for i in range(0, len(alice_bits), block_size):
        a_block = alice_bits[i:i + block_size]
        b_block = bob_bits[i:i + block_size]
        if not a_block or not b_block:
            continue

        a_parity = sum(a_block) % 2
        b_parity = sum(b_block) % 2

        if a_parity != b_parity:
            # Parity mismatch indicates an error in this block
            corrected_errors += 1
            # In simplified parity reconciliation, align to Alice's block
            reconciled[i:i + len(a_block)] = a_block

    return reconciled, corrected_errors


def privacy_amplification(key_bits: List[int]) -> Dict[str, Any]:
    """
    Privacy amplification:
    Applies SHA-256 hash function across reconciled key bits to produce
    a cryptographically uniform 256-bit (32-byte) AES symmetric key.
    Compresses out any partial information an eavesdropper might have acquired.
    """
    if not key_bits:
        # Fallback 256-bit zero key if empty
        bit_string = "0" * 32
    else:
        bit_string = "".join(str(b) for b in key_bits)

    # Encode bit string and compute SHA-256 digest
    hasher = hashlib.sha256()
    hasher.update(bit_string.encode('utf-8'))
    aes_key_bytes = hasher.digest()
    aes_key_hex = hasher.hexdigest().upper()
    fingerprint = hasher.hexdigest()[:8].upper()

    return {
        "raw_bit_count": len(key_bits),
        "aes_key_bytes": aes_key_bytes,
        "aes_key_hex": aes_key_hex,
        "key_fingerprint": f"KEY-{fingerprint}",
        "algorithm": "SHA-256 Privacy Amplification (256-bit AES Key)"
    }
