/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * Q-SHIELD: Quantum Key Distribution Protocol Types & Interfaces
 * Demonstrating BB84 Protocol Simulation & QBER Threat Detection
 */

export type QuantumBasis = 'Z' | 'X'; // Z = Computational {|0>, |1>}, X = Diagonal {|+>, |->}
export type ClassicalBit = 0 | 1;

export type QuantumStateSymbol = '|0⟩' | '|1⟩' | '|+⟩' | '|–⟩';

export interface QubitTransmission {
  index: number;
  aliceBit: ClassicalBit;
  aliceBasis: QuantumBasis;
  aliceState: QuantumStateSymbol;
  
  // Channel & Eve
  interceptedByEve: boolean;
  eveBasis: QuantumBasis | null;
  eveMeasuredBit: ClassicalBit | null;
  eveResentState: QuantumStateSymbol | null;
  channelNoiseApplied: boolean;
  
  // Bob
  bobBasis: QuantumBasis;
  bobMeasuredBit: ClassicalBit;
  
  // Post-processing
  basisMatched: boolean; // Kept in sifting (aliceBasis === bobBasis)
  isSampleTested: boolean; // Selected for QBER parameter estimation
  bitError: boolean; // true if basisMatched and aliceBit !== bobMeasuredBit
}

export type SecurityStatus = 'SECURE' | 'WARNING' | 'POTENTIAL_EAVESDROPPING' | 'KEY_REJECTED';

export type SimulationMode = 'NORMAL' | 'NOISY' | 'ATTACK';

export interface SimulationParameters {
  qubitCount: number; // 50, 100, 500, 1000
  channelNoise: number; // 0.00 to 0.20 (0% to 20%)
  eveEnabled: boolean;
  eveInterceptionRate: number; // 0.00 to 1.00 (0% to 100%)
  securityThreshold: number; // Application QBER threshold, e.g. 0.11 (11%)
  scenario: CriticalInfrastructureScenario;
}

export type CriticalInfrastructureScenario = 
  | 'power_grid' 
  | 'water_treatment' 
  | 'transportation' 
  | 'industrial_facility';

export interface ScenarioDetails {
  id: CriticalInfrastructureScenario;
  name: string;
  substationName: string;
  controlCenterName: string;
  assetDescription: string;
  impactIfCompromised: string;
  sampleScadaCommand: string;
}

export interface SimulationMetrics {
  totalQubitsSent: number;
  siftedBitsCount: number;
  siftingRatio: number; // ~50%
  sampleComparedCount: number;
  errorCount: number;
  qber: number; // 0.000 to 1.000
  qberPercentage: number; // 0.0% to 100.0%
  finalKeyLength: number;
  eveInterceptedCount: number;
  eveErrorsIntroduced: number;
  securityStatus: SecurityStatus;
  keyStatus: 'VALID_FOR_SIMULATION' | 'REJECTED' | 'EXPIRED' | 'REGENERATING';
  executionTimeMs: number;
  theoreticalQber: number;
}

export interface SecurityEvent {
  id: string;
  timestamp: string;
  eventType: 
    | 'QKD_SESSION_STARTED'
    | 'QUBITS_TRANSMITTED'
    | 'BASIS_RECONCILIATION_COMPLETED'
    | 'KEY_GENERATED'
    | 'CHANNEL_NOISE_DETECTED'
    | 'EVE_SIMULATION_ENABLED'
    | 'EVE_INTERCEPTION_DETECTED'
    | 'QBER_THRESHOLD_EXCEEDED'
    | 'KEY_REJECTED'
    | 'KEY_ROTATED'
    | 'SCADA_MESSAGE_ENCRYPTED';
  severity: 'INFO' | 'NOTICE' | 'WARNING' | 'CRITICAL';
  description: string;
  qber: number;
  sessionId: string;
}

export interface SimulationSession {
  sessionId: string;
  timestamp: string;
  parameters: SimulationParameters;
  metrics: SimulationMetrics;
  rawAliceBits: string;
  rawBobBits: string;
  siftedKey: string;
  sampleTestIndices: number[];
  finalSecretKeyHex: string;
  finalSecretKeyBin: string;
  qubits: QubitTransmission[];
  encryptedSampleMessage?: {
    plaintext: string;
    ciphertextHex: string;
    decryptedText: string;
    verified: boolean;
  };
}
