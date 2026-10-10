"""
QUANTUM-SHIELD: AI Anomaly Monitor Module
Implements Isolation Forest anomaly detection based on session telemetry features.
"""

import numpy as np
from typing import Dict, Any, List

HAS_SKLEARN = False
try:
    from sklearn.ensemble import IsolationForest
    HAS_SKLEARN = True
except ImportError:
    HAS_SKLEARN = False


class QuantumAnomalyMonitor:
    def __init__(self):
        self.model = None
        self.fitted = False
        self._init_baseline_model()

    def _init_baseline_model(self):
        """
        Synthesizes a baseline of 100 normal QKD sessions (Eve disabled):
        Feature 1: QBER (0.00 to 0.04)
        Feature 2: Sifted Key Length (40 to 60 for 100 qubits)
        Feature 3: Rejection Rate (0.0)
        Feature 4: Authentication Failures (0.0)
        """
        np.random.seed(42)
        n_samples = 150
        qber = np.random.uniform(0.00, 0.035, n_samples)
        sifted_len = np.random.normal(50.0, 5.0, n_samples)
        rejection_rate = np.zeros(n_samples)
        auth_failures = np.zeros(n_samples)

        X_train = np.column_stack([qber, sifted_len, rejection_rate, auth_failures])

        if HAS_SKLEARN:
            self.model = IsolationForest(
                n_estimators=100,
                contamination=0.05,
                random_state=42
            )
            self.model.fit(X_train)
            self.fitted = True

    def score_session(
        self,
        qber: float,
        sifted_length: int,
        rejection_rate: float = 0.0,
        auth_failures: int = 0
    ) -> Dict[str, Any]:
        """
        Scores a session feature vector:
        Returns: anomaly_score (-1.0 to +1.0), is_anomaly (bool), label ("normal" | "anomalous")
        """
        features = np.array([[qber, float(sifted_length), rejection_rate, float(auth_failures)]])

        if HAS_SKLEARN and self.fitted:
            # decision_function returns anomaly score (negative = anomaly)
            score = float(self.model.decision_function(features)[0])
            pred = int(self.model.predict(features)[0])
            is_anomaly = (pred == -1) or (qber > 0.09) or (auth_failures > 0)
        else:
            # Statistical fallback: z-score threshold heuristic
            is_anomaly = (qber > 0.08) or (auth_failures > 0)
            score = 0.5 - (qber * 4.0)

        label = "anomalous" if is_anomaly else "normal"

        return {
            "features": {
                "qber": round(qber, 4),
                "sifted_key_length": sifted_length,
                "rejection_rate": round(rejection_rate, 2),
                "auth_failures": auth_failures
            },
            "anomaly_score": round(score, 3),
            "is_anomaly": is_anomaly,
            "label": label,
            "model_type": "Isolation Forest (scikit-learn)" if HAS_SKLEARN else "Heuristic Density Evaluator",
            "note": "Educational prototype model. Accuracy is not claimed without a verified labelled test set."
        }


# Global singleton instance
monitor = QuantumAnomalyMonitor()
