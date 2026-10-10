/**
 * QUANTUM-SHIELD: Frontend Logic & Chart.js Integration
 */

let qberHistory = [];
let chartInstance = null;
let currentPayload = null;

document.addEventListener("DOMContentLoaded", () => {
  initChart();
  bindControls();
  runSimulation(); // Initial run
});

function initChart() {
  const ctx = document.getElementById("qberChart").getContext("2d");
  chartInstance = new Chart(ctx, {
    type: "line",
    data: {
      labels: [],
      datasets: [
        {
          label: "QBER (%)",
          data: [],
          borderColor: "#06b6d4",
          backgroundColor: "rgba(6, 182, 212, 0.1)",
          borderWidth: 2,
          tension: 0.2,
          fill: true
        },
        {
          label: "Security Threshold (11%)",
          data: [],
          borderColor: "#f43f5e",
          borderDash: [5, 5],
          borderWidth: 1.5,
          pointRadius: 0
        }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        y: {
          min: 0,
          max: 40,
          grid: { color: "rgba(255, 255, 255, 0.05)" },
          ticks: { color: "#9ca3af", font: { family: "monospace" } }
        },
        x: {
          grid: { display: false },
          ticks: { color: "#9ca3af", font: { family: "monospace" } }
        }
      },
      plugins: {
        legend: { labels: { color: "#cbd5e1", font: { size: 10 } } }
      }
    }
  });
}

function bindControls() {
  const qubitRange = document.getElementById("qubit-count");
  const qubitVal = document.getElementById("qubit-count-val");
  qubitRange.addEventListener("input", (e) => {
    qubitVal.textContent = e.target.value;
  });

  const thresholdRange = document.getElementById("threshold-slider");
  const thresholdVal = document.getElementById("threshold-val");
  thresholdRange.addEventListener("input", (e) => {
    thresholdVal.textContent = `${e.target.value}%`;
  });

  const eveToggle = document.getElementById("eve-toggle");
  const eveLabel = document.getElementById("eve-label");
  eveToggle.addEventListener("change", (e) => {
    if (e.target.checked) {
      eveLabel.textContent = "Eve: ACTIVE (Intercept-Resend Attack)";
      eveLabel.style.color = "#f43f5e";
    } else {
      eveLabel.textContent = "Eve: DISABLED (Normal Channel)";
      eveLabel.style.color = "#cbd5e1";
    }
  });

  document.getElementById("btn-run-sim").addEventListener("click", runSimulation);
  document.getElementById("btn-send-command").addEventListener("click", sendCommand);
  document.getElementById("btn-tamper-command").addEventListener("click", tamperCommand);
}

async function runSimulation() {
  const numQubits = parseInt(document.getElementById("qubit-count").value);
  const eveEnabled = document.getElementById("eve-toggle").checked;
  const threshold = parseFloat(document.getElementById("threshold-slider").value) / 100;
  const backend = document.getElementById("backend-select").value;

  const btn = document.getElementById("btn-run-sim");
  btn.textContent = "⏳ Running AerSimulator...";
  btn.disabled = true;

  try {
    const res = await fetch("/api/simulate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        num_qubits: numQubits,
        eve_enabled: eveEnabled,
        threshold: threshold,
        backend: backend
      })
    });
    const data = await res.json();
    renderSimulationResults(data);
  } catch (err) {
    console.error("Simulation error:", err);
  } finally {
    btn.textContent = "⚛️ Run BB84 Simulation";
    btn.disabled = false;
  }
}

function renderSimulationResults(data) {
  const sim = data.simulation;
  const keyInfo = data.key_info;
  const ai = data.ai_monitor;

  // QBER Gauge
  const qberElem = document.getElementById("qber-metric");
  qberElem.textContent = `${sim.qber_percentage}%`;
  qberElem.style.color = sim.key_accepted ? "#10b981" : "#f43f5e";
  document.getElementById("qber-comparison").textContent = `Threshold: ${sim.threshold_percentage}%`;

  // System status badge
  const sysBadge = document.getElementById("system-status-indicator");
  if (sim.key_accepted) {
    sysBadge.className = "status-indicator status-ready";
    sysBadge.textContent = "CHANNEL SECURE · KEY ACTIVE";
  } else {
    sysBadge.className = "status-indicator status-alert";
    sysBadge.textContent = "SUSPICIOUS CHANNEL · KEY REJECTED";
  }

  // Key Status
  document.getElementById("sifted-bits-count").textContent = `${sim.sifted_length} bits`;
  document.getElementById("reconciled-errors-count").textContent = `${keyInfo.reconciled_errors}`;
  const keyDecision = document.getElementById("key-decision-status");
  keyDecision.textContent = sim.key_accepted ? "KEY ACCEPTED" : "KEY REJECTED";
  keyDecision.style.color = sim.key_accepted ? "#10b981" : "#f43f5e";
  document.getElementById("aes-key-hex").textContent = keyInfo.aes_key_hex;

  // Flow Table
  const tbody = document.getElementById("flow-tbody");
  tbody.innerHTML = "";
  sim.flow_table.forEach((row) => {
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${row.index}</td>
      <td><strong>${row.alice_bit}</strong></td>
      <td>${row.alice_basis}</td>
      <td>${row.circuit_gate}</td>
      <td>${row.eve_basis}</td>
      <td>${row.eve_result}</td>
      <td>${row.bob_basis}</td>
      <td><strong>${row.bob_result}</strong></td>
      <td class="${row.basis_match ? 'match-yes' : 'match-no'}">${row.basis_match ? 'MATCH' : 'DISCARD'}</td>
      <td class="${row.error ? 'error-yes' : ''}">${row.error ? 'ERROR' : '-'}</td>
    `;
    tbody.appendChild(tr);
  });

  // Chart Update
  updateChart(sim.qber_percentage, sim.threshold_percentage, sim.eve_enabled);

  // AI Monitor
  const aiStatus = document.getElementById("ai-status-label");
  aiStatus.textContent = ai.label.toUpperCase();
  aiStatus.style.color = ai.is_anomaly ? "#f43f5e" : "#10b981";
  document.getElementById("ai-score-num").textContent = (ai.anomaly_score >= 0 ? "+" : "") + ai.anomaly_score.toFixed(3);
  document.getElementById("ai-explanation-text").textContent = `Isolation Forest evaluated: QBER=${ai.features.qber * 100}%, Sifted=${ai.features.sifted_key_length}. Model classification: ${ai.label}. ${ai.note}`;

  // Log Stream
  renderLogs(data.events);

  // Clear previous decryption box
  document.getElementById("decryption-result-text").textContent = "Awaiting command transmission...";
  document.getElementById("decryption-result-box").style.background = "#022c22";
  document.getElementById("decryption-result-box").style.borderColor = "#059669";
  document.getElementById("crypto-nonce").textContent = "--";
  document.getElementById("crypto-tag").textContent = "--";
  document.getElementById("crypto-ciphertext").textContent = "--";
}

function updateChart(qber, threshold, eveEnabled) {
  const runNum = chartInstance.data.labels.length + 1;
  const label = `Run ${runNum} (${eveEnabled ? 'Eve' : 'Clean'})`;
  chartInstance.data.labels.push(label);
  chartInstance.data.datasets[0].data.push(qber);
  chartInstance.data.datasets[1].data.push(threshold);

  if (chartInstance.data.labels.length > 8) {
    chartInstance.data.labels.shift();
    chartInstance.data.datasets[0].data.shift();
    chartInstance.data.datasets[1].data.shift();
  }
  chartInstance.update();
}

function renderLogs(events) {
  const container = document.getElementById("log-stream");
  container.innerHTML = "";
  events.forEach((ev) => {
    const item = document.createElement("div");
    item.className = "log-item";
    item.innerHTML = `
      <div class="log-meta">
        <span>${ev.timestamp}</span>
        <span class="log-badge-${ev.severity}">${ev.severity} · ${ev.event_type}</span>
      </div>
      <div class="log-desc">${ev.description}</div>
    `;
    container.appendChild(item);
  });
}

async function sendCommand() {
  const command = document.getElementById("command-input").value;
  try {
    const res = await fetch("/api/encrypt", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ command })
    });

    const data = await res.json();
    if (!res.ok || data.blocked) {
      document.getElementById("decryption-result-box").style.background = "#4c0519";
      document.getElementById("decryption-result-box").style.borderColor = "#e11d48";
      document.getElementById("decryption-result-text").textContent = "⚠️ Command blocked: suspicious key. (Transmission refused)";
      return;
    }

    currentPayload = data.payload;
    document.getElementById("crypto-nonce").textContent = currentPayload.nonce_hex;
    document.getElementById("crypto-tag").textContent = currentPayload.tag_hex;
    document.getElementById("crypto-ciphertext").textContent = currentPayload.ciphertext_hex;

    // Bob decrypts
    const decRes = await fetch("/api/decrypt", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        nonce_hex: currentPayload.nonce_hex,
        ciphertext_hex: currentPayload.ciphertext_hex,
        tag_hex: currentPayload.tag_hex
      })
    });
    const decData = await decRes.json();
    if (decData.success) {
      document.getElementById("decryption-result-box").style.background = "#022c22";
      document.getElementById("decryption-result-box").style.borderColor = "#059669";
      document.getElementById("decryption-result-text").textContent = `✓ Bob Verified & Executed: "${decData.message}" (Integrity Confirmed)`;
    } else {
      document.getElementById("decryption-result-box").style.background = "#4c0519";
      document.getElementById("decryption-result-box").style.borderColor = "#e11d48";
      document.getElementById("decryption-result-text").textContent = `❌ ${decData.message}`;
    }
  } catch (err) {
    console.error("Command error:", err);
  }
}

async function tamperCommand() {
  if (!currentPayload) {
    alert("Please encrypt and send a command first before simulating tampering.");
    return;
  }

  try {
    const tamperRes = await fetch("/api/tamper", { method: "POST" });
    const tamperData = await tamperRes.json();

    document.getElementById("crypto-ciphertext").textContent = `${tamperData.tampered_ciphertext} (TAMPERED BYTE IN FLIGHT)`;

    // Attempt decryption with tampered ciphertext
    const decRes = await fetch("/api/decrypt", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        nonce_hex: tamperData.nonce_hex,
        ciphertext_hex: tamperData.tampered_ciphertext,
        tag_hex: tamperData.tag_hex
      })
    });

    const decData = await decRes.json();
    document.getElementById("decryption-result-box").style.background = "#4c0519";
    document.getElementById("decryption-result-box").style.borderColor = "#e11d48";
    document.getElementById("decryption-result-text").textContent = `❌ ${decData.message}`;
  } catch (err) {
    console.error("Tamper error:", err);
  }
}
