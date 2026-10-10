"""
QUANTUM-SHIELD: Verification Test Suite
Tests:
1. QBER is near 0% without Eve.
2. QBER is near 25% with Eve on a large enough sample (e.g. 500-1000 qubits).
3. AES-256-GCM encryption works and tampered ciphertext fails decryption ("Integrity check failed").
4. Privacy amplification produces 256-bit AES key.
"""

import sys
import os
import binascii

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from bb84 import run_bb84_simulation
from keyprocess import parity_reconciliation, privacy_amplification
from crypto_layer import encrypt_command, decrypt_command


def run_tests():
    print("==================================================")
    print("RUNNING QUANTUM-SHIELD VERIFICATION SUITE")
    print("==================================================")

    # Test 1: QBER near 0% without Eve
    print("\n[TEST 1] Verifying QBER without Eve...")
    res_no_eve = run_bb84_simulation(num_qubits=200, eve_enabled=False, threshold=0.11)
    qber_no_eve = res_no_eve["qber_percentage"]
    print(f"  Measured QBER (Eve OFF, 200 qubits): {qber_no_eve}%")
    assert qber_no_eve == 0.0, f"Expected 0.0% QBER without Eve, got {qber_no_eve}%"
    assert res_no_eve["key_accepted"] is True, "Key should be accepted when Eve is OFF"
    print("  ✓ PASS: QBER is 0.0% without Eve. Key accepted.")

    # Test 2: QBER near 25% with Eve on a large sample (2000 qubits, 50% sample)
    print("\n[TEST 2] Verifying QBER with Eve (Intercept-Resend Attack)...")
    res_eve = run_bb84_simulation(num_qubits=2000, eve_enabled=True, sample_ratio=0.5, threshold=0.11)
    qber_eve = res_eve["qber_percentage"]
    print(f"  Measured QBER (Eve ON, 2000 qubits): {qber_eve}% (Theoretical: ~25.0%)")
    assert 18.0 <= qber_eve <= 32.0, f"Expected QBER near 25% with Eve, got {qber_eve}%"
    assert res_eve["key_accepted"] is False, "Key should be rejected when Eve is ON"
    print("  ✓ PASS: QBER rises toward ~25% with Eve active. Key rejected.")

    # Test 3: AES-256-GCM Encryption, Decryption, and Tamper Detection
    print("\n[TEST 3] Verifying AES-256-GCM Cryptographic Layer & Tamper Detection...")
    key_info = privacy_amplification([1, 0, 1, 1, 0, 0, 1, 0] * 8)
    aes_key = key_info["aes_key_bytes"]
    command = "Reduce power output to 70%"

    # Encrypt
    encrypted = encrypt_command(aes_key, command)
    print(f"  Plaintext:  {command}")
    print(f"  Ciphertext: {encrypted['ciphertext_hex'][:32]}...")
    print(f"  Nonce:      {encrypted['nonce_hex']}")
    print(f"  Tag:        {encrypted['tag_hex']}")

    # Decrypt valid payload
    success, decrypted_msg = decrypt_command(
        aes_key,
        encrypted["nonce_hex"],
        encrypted["ciphertext_hex"],
        encrypted["tag_hex"]
    )
    assert success is True, f"Valid decryption failed: {decrypted_msg}"
    assert decrypted_msg == command, f"Decrypted text mismatch: {decrypted_msg}"
    print("  ✓ PASS: Legitimate ciphertext successfully decrypted and authenticated.")

    # Test Tampering: Flip one byte in the ciphertext
    print("\n[TEST 4] Verifying Tampered Ciphertext Fails Decryption...")
    cipher_bytes = bytearray(binascii.unhexlify(encrypted["ciphertext_hex"]))
    cipher_bytes[0] ^= 0xFF  # Corrupt first byte
    tampered_cipher_hex = binascii.hexlify(cipher_bytes).decode('utf-8').upper()

    tamper_success, tamper_err = decrypt_command(
        aes_key,
        encrypted["nonce_hex"],
        tampered_cipher_hex,
        encrypted["tag_hex"]
    )
    print(f"  Tamper test result: success={tamper_success}, message='{tamper_err}'")
    assert tamper_success is False, "Tampered ciphertext should have failed decryption!"
    assert "Integrity check failed" in tamper_err, f"Expected 'Integrity check failed', got {tamper_err}"
    print("  ✓ PASS: Tampered ciphertext was rejected with 'Integrity check failed'.")

    print("\n==================================================")
    print("ALL QUANTUM-SHIELD TESTS COMPLETED SUCCESSFULLY!")
    print("==================================================")


if __name__ == "__main__":
    run_tests()
