"""
QUANTUM-SHIELD: Flask Web Application Backend
Serves the REST API and dashboard for the BB84 QKD Critical Infrastructure Prototype.
"""

import os
from flask import Flask, request, jsonify, render_template
from bb84 import run_bb84_simulation
from keyprocess import parity_reconciliation, privacy_amplification
from crypto_layer import encrypt_command, decrypt_command
from monitor import monitor
from logger import logger

app = Flask(__name__, static_folder="static", template_folder="templates")

# In-memory session state
current_session = {
    "key_accepted": False,
    "aes_key_bytes": None,
    "aes_key_hex": None,
    "key_fingerprint": None,
    "last_simulation": None,
    "last_encrypted": None
}

history_runs = []


@app.route("/")
def index():
    return render_template("index.html")


@app.route("/api/simulate", methods=["POST"])
def simulate():
    data = request.get_json() or {}
    num_qubits = int(data.get("num_qubits", 100))
    eve_enabled = bool(data.get("eve_enabled", False))
    threshold = float(data.get("threshold", 0.11))
    backend_choice = str(data.get("backend", "AerSimulator"))

    # Log start
    logger.log(
        "SIMULATION_INITIATED",
        "INFO",
        f"BB84 session started with {num_qubits} qubits. Eve: {'ENABLED' if eve_enabled else 'DISABLED'}, Backend: {backend_choice}"
    )

    # 1. BB84 Simulation
    sim_result = run_bb84_simulation(
        num_qubits=num_qubits,
        eve_enabled=eve_enabled,
        threshold=threshold,
        backend_choice=backend_choice
    )

    # 2. Key Processing
    reconciled_bits, errors_corrected = parity_reconciliation(
        sim_result["final_key_bits"],
        sim_result["final_bob_bits"]
    )
    key_info = privacy_amplification(reconciled_bits)

    # Store in session state
    current_session["key_accepted"] = sim_result["key_accepted"]
    current_session["aes_key_bytes"] = key_info["aes_key_bytes"] if sim_result["key_accepted"] else None
    current_session["aes_key_hex"] = key_info["aes_key_hex"] if sim_result["key_accepted"] else "REJECTED_SUSPICIOUS_KEY"
    current_session["key_fingerprint"] = key_info["key_fingerprint"] if sim_result["key_accepted"] else "NONE"
    current_session["last_simulation"] = sim_result
    current_session["last_encrypted"] = None

    # 3. AI Monitor Scoring
    ai_score = monitor.score_session(
        qber=sim_result["qber"],
        sifted_length=sim_result["sifted_length"],
        rejection_rate=0.0 if sim_result["key_accepted"] else 1.0,
        auth_failures=0
    )

    # 4. Security Events
    if sim_result["key_accepted"]:
        logger.log(
            "KEY_ESTABLISHED",
            "INFO",
            f"BB84 key verified: QBER {sim_result['qber_percentage']}% <= {sim_result['threshold_percentage']}%. Final 256-bit AES key derived.",
            {"qber": sim_result["qber_percentage"]}
        )
    else:
        logger.log(
            "KEY_REJECTED",
            "ALERT",
            f"SECURITY ALERT: QBER {sim_result['qber_percentage']}% exceeded threshold {sim_result['threshold_percentage']}%. Potential eavesdropping! Key marked suspicious and discarded.",
            {"qber": sim_result["qber_percentage"]}
        )

    # History entry
    history_entry = {
        "run_id": len(history_runs) + 1,
        "eve_enabled": eve_enabled,
        "qber_percentage": sim_result["qber_percentage"],
        "threshold_percentage": sim_result["threshold_percentage"],
        "key_accepted": sim_result["key_accepted"],
        "sifted_length": sim_result["sifted_length"]
    }
    history_runs.append(history_entry)

    return jsonify({
        "success": True,
        "simulation": sim_result,
        "key_info": {
            "key_accepted": sim_result["key_accepted"],
            "raw_key_length": len(reconciled_bits),
            "reconciled_errors": errors_corrected,
            "aes_key_hex": current_session["aes_key_hex"],
            "key_fingerprint": current_session["key_fingerprint"]
        },
        "ai_monitor": ai_score,
        "events": logger.get_events()[:10]
    })


@app.route("/api/encrypt", methods=["POST"])
def encrypt():
    data = request.get_json() or {}
    command = data.get("command", "Reduce power output to 70%")

    if not current_session.get("key_accepted") or not current_session.get("aes_key_bytes"):
        logger.log(
            "COMMAND_BLOCKED",
            "ALERT",
            f"Command dispatch blocked: suspicious key. Refused to encrypt '{command}'"
        )
        return jsonify({
            "success": False,
            "blocked": True,
            "error": "Command blocked: suspicious key",
            "message": "Security policy prevented transmission. The quantum key was rejected due to excessive QBER."
        }), 403

    encrypted_payload = encrypt_command(current_session["aes_key_bytes"], command)
    current_session["last_encrypted"] = encrypted_payload

    logger.log(
        "COMMAND_ENCRYPTED",
        "INFO",
        f"Encrypted command '{command}' using AES-256-GCM. Tag: {encrypted_payload['tag_hex'][:8]}..."
    )

    return jsonify({
        "success": True,
        "payload": encrypted_payload
    })


@app.route("/api/decrypt", methods=["POST"])
def decrypt():
    data = request.get_json() or {}
    nonce_hex = data.get("nonce_hex")
    ciphertext_hex = data.get("ciphertext_hex")
    tag_hex = data.get("tag_hex")

    if not current_session.get("key_accepted") or not current_session.get("aes_key_bytes"):
        return jsonify({"success": False, "error": "No valid active key to decrypt with"}), 400

    success, message = decrypt_command(
        current_session["aes_key_bytes"],
        nonce_hex,
        ciphertext_hex,
        tag_hex
    )

    if success:
        logger.log(
            "COMMAND_DECRYPTED",
            "INFO",
            f"Bob successfully verified and executed: '{message}'"
        )
    else:
        logger.log(
            "AUTHENTICATION_FAILED",
            "ALERT",
            f"Security Alert: AES-GCM integrity check failed! Message was tampered or corrupted."
        )

    return jsonify({
        "success": success,
        "message": message
    })


@app.route("/api/tamper", methods=["POST"])
def tamper():
    """Simulates an attacker modifying a byte of the in-flight ciphertext"""
    last_enc = current_session.get("last_encrypted")
    if not last_enc:
        return jsonify({"success": False, "error": "No command has been encrypted yet"}), 400

    cipher_hex = last_enc["ciphertext_hex"]
    # Corrupt first 2 hex chars
    corrupted_byte = "FF" if cipher_hex[:2] != "FF" else "00"
    tampered_cipher = corrupted_byte + cipher_hex[2:]

    logger.log(
        "TAMPER_SIMULATED",
        "WARNING",
        "Attacker tampered with ciphertext in transit. Testing AES-GCM authentication tag verification."
    )

    return jsonify({
        "success": True,
        "original_ciphertext": cipher_hex,
        "tampered_ciphertext": tampered_cipher,
        "nonce_hex": last_enc["nonce_hex"],
        "tag_hex": last_enc["tag_hex"]
    })


@app.route("/api/logs", methods=["GET"])
def get_logs():
    return jsonify({"events": logger.get_events()})


@app.route("/api/history", methods=["GET"])
def get_history():
    return jsonify({"history": history_runs})


if __name__ == "__main__":
    port = int(os.environ.get("PORT", 5000))
    app.run(host="0.0.0.0", port=port, debug=True)
