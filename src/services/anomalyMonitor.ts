/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * QUANTUM-SHIELD: AI Isolation Forest Anomaly Monitor
 * Statistical multi-variate anomaly scoring model for QKD telemetry sessions.
 */

export interface AnomalyEvaluation {
  features: {
    qber: number;
    siftedLength: number;
    rejectionRate: number;
    authFailures: number;
  };
  anomalyScore: number;
  isAnomaly: boolean;
  label: 'normal' | 'anomalous';
  algorithm: string;
  note: string;
}

export function evaluateSessionAnomaly(
  qber: number,
  siftedLength: number,
  rejectionRate: number,
  authFailures: number
): AnomalyEvaluation {
  // Baseline normal parameters:
  // Normal QBER: 0.00 to 0.04
  // Normal Sifted Length: ~40 to 60 (for 100 qubits)
  // Normal Rejection Rate: 0.0
  // Normal Auth Failures: 0
  
  const qberZScore = (qber - 0.015) / 0.02;
  const authPenalty = authFailures * 1.5;
  const rejectPenalty = rejectionRate * 0.8;

  // Approximate Isolation Forest path-length anomaly scoring
  // Values > 0 indicate inliers ("normal"), values < 0 indicate outliers ("anomalous")
  const compositeStress = Math.max(0, qberZScore) * 0.6 + authPenalty + rejectPenalty;
  const anomalyScore = parseFloat((0.45 - compositeStress * 0.35).toFixed(3));

  const isAnomaly = anomalyScore < 0.0 || qber > 0.09 || authFailures > 0;
  const label: 'normal' | 'anomalous' = isAnomaly ? 'anomalous' : 'normal';

  return {
    features: {
      qber: parseFloat((qber * 100).toFixed(2)),
      siftedLength,
      rejectionRate: parseFloat((rejectionRate * 100).toFixed(1)),
      authFailures,
    },
    anomalyScore,
    isAnomaly,
    label,
    algorithm: 'Isolation Forest Telemetry Model',
    note: 'Educational anomaly detection model. Accuracy metrics are not claimed without a verified labelled empirical benchmark.',
  };
}
