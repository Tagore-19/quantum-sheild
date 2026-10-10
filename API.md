# Q-SHIELD REST API Documentation

Base URL: `http://localhost:3000/api`

---

### 1. `POST /api/simulation/run`
Runs a full BB84 simulation cycle with configurable parameters.

#### Request Body
```json
{
  "qubitCount": 100,
  "channelNoise": 0.01,
  "eveEnabled": true,
  "eveInterceptionRate": 0.50,
  "securityThreshold": 0.11,
  "scenario": "power_grid"
}
```

#### Response
```json
{
  "success": true,
  "session": {
    "sessionId": "qkd-m3q1...-8f2a",
    "timestamp": "2026-10-10T02:30:00.000Z",
    "parameters": { ... },
    "metrics": {
      "totalQubitsSent": 100,
      "siftedBitsCount": 49,
      "siftingRatio": 49.0,
      "sampleComparedCount": 24,
      "errorCount": 3,
      "qber": 0.125,
      "qberPercentage": 12.5,
      "finalKeyLength": 25,
      "eveInterceptedCount": 51,
      "eveErrorsIntroduced": 13,
      "securityStatus": "POTENTIAL_EAVESDROPPING",
      "keyStatus": "REJECTED",
      "theoreticalQber": 12.5
    },
    "rawAliceBits": "1001...",
    "rawBobBits": "1011...",
    "finalSecretKeyHex": "A4F2...",
    "encryptedSampleMessage": {
      "plaintext": "TRIP_BREAKER_SYNC_400KV_BUS_B",
      "ciphertextHex": "UNTRUSTED_KEY_ABORTED",
      "verified": false
    }
  },
  "recentEvents": [ ... ]
}
```

---

### 2. `POST /api/qkd/bb84`
Shortcut endpoint to execute a clean, baseline secure BB84 run (Eve disabled, 0% noise).

---

### 3. `POST /api/qkd/attack`
Shortcut endpoint to execute an active Eve intercept-resend attack run.

#### Request Body (Optional)
```json
{
  "interceptionRate": 0.75
}
```

---

### 4. `POST /api/simulation/reset`
Resets the in-memory simulation store and audit events back to the baseline initial state.

---

### 5. `GET /api/simulation/:id`
Retrieves a specific stored simulation session by ID.

---

### 6. `GET /api/metrics`
Retrieves aggregated telemetry across all sessions.

#### Response
```json
{
  "success": true,
  "metrics": {
    "totalSessions": 12,
    "totalQubitsSent": 2400,
    "totalBitsTested": 600,
    "avgQberPercentage": 7.4,
    "secureSessionsCount": 8,
    "rejectedSessionsCount": 4,
    "channelUptimePercentage": 99.98,
    "activeCriticalLinks": 4
  }
}
```

---

### 7. `GET /api/events`
Fetches real-time security audit logs.
* **Query Parameter:** `?severity=ALL | INFO | NOTICE | WARNING | CRITICAL`

---

### 8. `GET /api/health`
Checks backend engine and quantum simulator operational health.

---

### 9. `POST /api/ai/analyze`
Generates natural-language quantum security analysis using Gemini 3.8 Flash or deterministic rule engine.

#### Request Body
Accepts the full `session` object returned by `/api/simulation/run`.
