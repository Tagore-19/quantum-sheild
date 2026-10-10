/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * Q-SHIELD: BB84 Quantum Key Distribution Simulation Engine
 * 
 * Faithfully simulates the physics of single-photon polarization encoding,
 * quantum measurement collapse, intercept-resend eavesdropping,
 * classical basis reconciliation, and QBER error-rate estimation.
 */

import {
  ClassicalBit,
  QuantumBasis,
  QuantumStateSymbol,
  QubitTransmission,
  SimulationParameters,
  SimulationSession,
  SimulationMetrics,
  SecurityEvent,
  SecurityStatus,
  CriticalInfrastructureScenario,
  ScenarioDetails,
} from '../types/qkd.ts';

export const SCENARIO_PRESETS: Record<CriticalInfrastructureScenario, ScenarioDetails> = {
  power_grid: {
    id: 'power_grid',
    name: 'High-Voltage Transmission Grid',
    controlCenterName: 'Regional Grid Operations (Alice)',
    substationName: 'Substation 400kV Alpha (Bob)',
    assetDescription: 'Remote protective breaker telemetry & synchrophasor PMU stream',
    impactIfCompromised: 'Cascade blackout across regional transmission network',
    sampleScadaCommand: 'TRIP_BREAKER_SYNC_400KV_BUS_B',
  },
  water_treatment: {
    id: 'water_treatment',
    name: 'Municipal Water Distribution & Purification',
    controlCenterName: 'Central SCADA Dispatch (Alice)',
    substationName: 'Pumping Station East 07 (Bob)',
    assetDescription: 'Chemical dosing controls, valve actuators & reservoir telemetry',
    impactIfCompromised: 'Disruption of potable water supply & chemical overflow',
    sampleScadaCommand: 'SET_PUMP_FLOW_VALVE_EAST_85_PCT',
  },
  transportation: {
    id: 'transportation',
    name: 'High-Speed Rail Signaling System',
    controlCenterName: 'Dispatch Control Center (Alice)',
    substationName: 'Trackside Interlocking Node 12 (Bob)',
    assetDescription: 'Automatic Train Protection (ATP) & switch interlocking telemetry',
    impactIfCompromised: 'False signal clearance risking high-speed collision',
    sampleScadaCommand: 'LOCK_INTERLOCKING_ROUTE_TRACK_04',
  },
  industrial_facility: {
    id: 'industrial_facility',
    name: 'Nuclear Safety Auxiliary Cooling',
    controlCenterName: 'Safety Command Center (Alice)',
    substationName: 'Turbine Coolant Manifold (Bob)',
    assetDescription: 'Emergency coolant feed valves & core temperature sensors',
    impactIfCompromised: 'Critical overheating & automated reactor emergency trip',
    sampleScadaCommand: 'ARM_AUX_COOLANT_LOOP_PRIMARY_ACTIVE',
  },
};

/**
 * Encodes a classical bit in a quantum basis to a quantum polarization state.
 * Basis Z (computational): |0> (horizontal), |1> (vertical)
 * Basis X (diagonal): |+> (diagonal +45°), |- > (diagonal -45°)
 */
export function encodeQubit(bit: ClassicalBit, basis: QuantumBasis): QuantumStateSymbol {
  if (basis === 'Z') {
    return bit === 0 ? '|0⟩' : '|1⟩';
  } else {
    return bit === 0 ? '|+⟩' : '|–⟩';
  }
}

/**
 * Simulates quantum measurement of a photon in a chosen measurement basis.
 * By the Born rule and Heisenberg uncertainty:
 * - If the state's basis aligns with the measurement basis: measurement is deterministic.
 * - If the state's basis is conjugate/orthogonal to the measurement basis:
 *   outcome is uniformly random (50/50) and state collapses!
 */
export function measureQubit(
  state: QuantumStateSymbol,
  basis: QuantumBasis,
  randomFloat = Math.random
): { bit: ClassicalBit; collapsedState: QuantumStateSymbol } {
  if (basis === 'Z') {
    if (state === '|0⟩') {
      return { bit: 0, collapsedState: '|0⟩' };
    }
    if (state === '|1⟩') {
      return { bit: 1, collapsedState: '|1⟩' };
    }
    // Conjugate X state measured in Z basis collapses to |0> or |1> with 50% probability
    const bit: ClassicalBit = randomFloat() < 0.5 ? 0 : 1;
    return { bit, collapsedState: bit === 0 ? '|0⟩' : '|1⟩' };
  } else {
    // Measurement in X basis
    if (state === '|+⟩') {
      return { bit: 0, collapsedState: '|+⟩' };
    }
    if (state === '|–⟩') {
      return { bit: 1, collapsedState: '|–⟩' };
    }
    // Conjugate Z state measured in X basis collapses to |+> or |-> with 50% probability
    const bit: ClassicalBit = randomFloat() < 0.5 ? 0 : 1;
    return { bit, collapsedState: bit === 0 ? '|+⟩' : '|–⟩' };
  }
}

/**
 * Deterministic PRNG helper for reproducible tests.
 */
export function createSeededRandom(seed: number) {
  let s = seed % 2147483647;
  if (s <= 0) s += 2147483646;
  return function () {
    s = (s * 16807) % 2147483647;
    return (s - 1) / 2147483646;
  };
}

/**
 * Runs a complete BB84 simulation session.
 */
export function runBB84Simulation(
  params: SimulationParameters,
  randomFn = Math.random
): SimulationSession {
  const startTime = Date.now();
  const sessionId = `qkd-${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 6)}`;
  const count = Math.max(10, Math.min(2000, params.qubitCount));

  const qubits: QubitTransmission[] = [];
  let rawAliceBitsStr = '';
  let rawBobBitsStr = '';

  let eveInterceptedCount = 0;
  let eveErrorsIntroduced = 0;

  // STEP 1-7: Generation, Encoding, Channel/Eve Transmission, Bob Measurement
  for (let i = 0; i < count; i++) {
    // 1. Alice generates random bit and basis
    const aliceBit: ClassicalBit = randomFn() < 0.5 ? 0 : 1;
    const aliceBasis: QuantumBasis = randomFn() < 0.5 ? 'Z' : 'X';
    const aliceState = encodeQubit(aliceBit, aliceBasis);
    rawAliceBitsStr += aliceBit.toString();

    let transmittedState = aliceState;
    let interceptedByEve = false;
    let eveBasis: QuantumBasis | null = null;
    let eveMeasuredBit: ClassicalBit | null = null;
    let eveResentState: QuantumStateSymbol | null = null;

    // 2. Optional Eve Intercept-Resend Attack
    if (params.eveEnabled && randomFn() < params.eveInterceptionRate) {
      interceptedByEve = true;
      eveInterceptedCount++;
      // Eve randomly guesses a measurement basis
      eveBasis = randomFn() < 0.5 ? 'Z' : 'X';
      const eveMeasurement = measureQubit(transmittedState, eveBasis, randomFn);
      eveMeasuredBit = eveMeasurement.bit;
      eveResentState = eveMeasurement.collapsedState;
      // Eve resends her prepared state down the quantum channel
      transmittedState = eveResentState;

      // Track if Eve's intervention corrupted the original state
      if (transmittedState !== aliceState) {
        eveErrorsIntroduced++;
      }
    }

    // 3. Channel Noise Simulation (Depolarizing / phase disturbance)
    let channelNoiseApplied = false;
    if (params.channelNoise > 0 && randomFn() < params.channelNoise) {
      channelNoiseApplied = true;
      // Flip state with 50% probability under environmental thermal noise
      if (randomFn() < 0.5) {
        if (transmittedState === '|0⟩') transmittedState = '|1⟩';
        else if (transmittedState === '|1⟩') transmittedState = '|0⟩';
        else if (transmittedState === '|+⟩') transmittedState = '|–⟩';
        else if (transmittedState === '|–⟩') transmittedState = '|+⟩';
      }
    }

    // 4. Bob chooses a random measurement basis
    const bobBasis: QuantumBasis = randomFn() < 0.5 ? 'Z' : 'X';
    const bobMeasurement = measureQubit(transmittedState, bobBasis, randomFn);
    const bobMeasuredBit = bobMeasurement.bit;
    rawBobBitsStr += bobMeasuredBit.toString();

    // 5. Check basis matching (Reconciliation)
    const basisMatched = aliceBasis === bobBasis;
    const bitError = basisMatched && aliceBit !== bobMeasuredBit;

    qubits.push({
      index: i,
      aliceBit,
      aliceBasis,
      aliceState,
      interceptedByEve,
      eveBasis,
      eveMeasuredBit,
      eveResentState,
      channelNoiseApplied,
      bobBasis,
      bobMeasuredBit,
      basisMatched,
      isSampleTested: false,
      bitError,
    });
  }

  // STEP 8: Sifting - Keep only basis-matched events
  const siftedIndices = qubits
    .filter((q) => q.basisMatched)
    .map((q) => q.index);
  
  const siftedBitsCount = siftedIndices.length;

  // STEP 9: Sample error estimation for QBER calculation
  // In BB84, a random subset (typically ~50%) of sifted bits is sacrificed to estimate QBER
  // For small simulation sizes (<= 50 bits), we use 40% of sifted bits or at least 10 bits
  const sampleFraction = 0.5;
  const sampleCount = Math.max(
    4,
    Math.min(siftedBitsCount - 2, Math.floor(siftedBitsCount * sampleFraction))
  );

  // Shuffle sifted indices to select unbiased sample
  const shuffledSifted = [...siftedIndices].sort(() => randomFn() - 0.5);
  const sampleTestIndices = shuffledSifted.slice(0, sampleCount);
  const keySecretIndices = shuffledSifted.slice(sampleCount);

  let errorCount = 0;
  for (const idx of sampleTestIndices) {
    qubits[idx].isSampleTested = true;
    if (qubits[idx].bitError) {
      errorCount++;
    }
  }

  // Calculate QBER = errorCount / sampleCount
  const qber = sampleCount > 0 ? errorCount / sampleCount : 0;
  const qberPercentage = parseFloat((qber * 100).toFixed(2));

  // Theoretical QBER calculation:
  // Eve introduces 25% error on intercepted qubits when bases match (since she picks wrong basis 50% of the time,
  // and when wrong, Bob gets wrong result 50% of the time => 0.5 * 0.5 = 25%).
  // Channel noise contributes ~50% bit-error on affected photons.
  const theoreticalEveQber = params.eveEnabled ? params.eveInterceptionRate * 0.25 : 0;
  const theoreticalNoiseQber = params.channelNoise * 0.5 * (1 - (params.eveEnabled ? params.eveInterceptionRate : 0));
  const theoreticalQber = parseFloat(((theoreticalEveQber + theoreticalNoiseQber) * 100).toFixed(2));

  // Sifted key string
  let siftedKeyStr = '';
  for (const idx of siftedIndices) {
    siftedKeyStr += qubits[idx].aliceBit.toString();
  }

  // Final secret key formed from un-sacrificed sifted bits
  let finalKeyBinStr = '';
  for (const idx of keySecretIndices) {
    // If not corrupted by error, aliceBit === bobMeasuredBit
    finalKeyBinStr += qubits[idx].aliceBit.toString();
  }

  // Convert binary key to Hex for cryptographic key management display
  const finalKeyHex = binaryStringToHex(finalKeyBinStr);

  // Determine security status based on user's configured threshold
  let securityStatus: SecurityStatus = 'SECURE';
  let keyStatus: SimulationMetrics['keyStatus'] = 'VALID_FOR_SIMULATION';

  if (qber > params.securityThreshold) {
    securityStatus = params.eveEnabled && params.eveInterceptionRate > 0.05
      ? 'POTENTIAL_EAVESDROPPING'
      : 'KEY_REJECTED';
    keyStatus = 'REJECTED';
  } else if (qber > params.securityThreshold * 0.75) {
    securityStatus = 'WARNING';
    keyStatus = 'VALID_FOR_SIMULATION';
  } else {
    securityStatus = 'SECURE';
    keyStatus = 'VALID_FOR_SIMULATION';
  }

  const executionTimeMs = Date.now() - startTime;

  // One-Time Pad encryption demonstration using the generated simulation key
  const scenarioInfo = SCENARIO_PRESETS[params.scenario] || SCENARIO_PRESETS.power_grid;
  const sampleMessage = scenarioInfo.sampleScadaCommand;
  const encryptedPayload = demonstrateOneTimePad(sampleMessage, finalKeyBinStr, keyStatus === 'VALID_FOR_SIMULATION');

  const metrics: SimulationMetrics = {
    totalQubitsSent: count,
    siftedBitsCount,
    siftingRatio: parseFloat(((siftedBitsCount / count) * 100).toFixed(1)),
    sampleComparedCount: sampleCount,
    errorCount,
    qber,
    qberPercentage,
    finalKeyLength: finalKeyBinStr.length,
    eveInterceptedCount,
    eveErrorsIntroduced,
    securityStatus,
    keyStatus,
    executionTimeMs,
    theoreticalQber,
  };

  return {
    sessionId,
    timestamp: new Date().toISOString(),
    parameters: { ...params },
    metrics,
    rawAliceBits: rawAliceBitsStr,
    rawBobBits: rawBobBitsStr,
    siftedKey: siftedKeyStr,
    sampleTestIndices,
    finalSecretKeyHex: finalKeyHex,
    finalSecretKeyBin: finalKeyBinStr,
    qubits,
    encryptedSampleMessage: encryptedPayload,
  };
}

/**
 * Converts a binary string to formatted hex string.
 */
export function binaryStringToHex(binStr: string): string {
  if (!binStr || binStr.length === 0) return '00';
  let hex = '';
  // Pad to multiple of 4
  const padded = binStr.padEnd(Math.ceil(binStr.length / 4) * 4, '0');
  for (let i = 0; i < padded.length; i += 4) {
    const chunk = padded.substring(i, i + 4);
    const val = parseInt(chunk, 2);
    hex += val.toString(16).toUpperCase();
  }
  return hex;
}

/**
 * Demonstrates simulated One-Time Pad / symmetric stream XOR encryption using the generated quantum key.
 */
export function demonstrateOneTimePad(
  plaintext: string,
  keyBin: string,
  keyValid: boolean
): { plaintext: string; ciphertextHex: string; decryptedText: string; verified: boolean } {
  if (!keyValid || keyBin.length < 8) {
    return {
      plaintext,
      ciphertextHex: 'UNTRUSTED_KEY_ABORTED',
      decryptedText: '[TRANSMISSION REJECTED: UNTRUSTED KEY DISCARDED]',
      verified: false,
    };
  }

  // Convert plaintext string into bit array
  const textBytes = Array.from(new TextEncoder().encode(plaintext));
  const textBits: number[] = [];
  for (const b of textBytes) {
    for (let bitIdx = 7; bitIdx >= 0; bitIdx--) {
      textBits.push((b >> bitIdx) & 1);
    }
  }

  // XOR with repeating simulation key bits
  const cipherBits: number[] = [];
  const decryptedBytes: number[] = [];
  let currentByte = 0;

  for (let i = 0; i < textBits.length; i++) {
    const keyBit = parseInt(keyBin[i % keyBin.length], 10);
    const cBit = textBits[i] ^ keyBit;
    cipherBits.push(cBit);

    // Decrypt (Bob XORs with the same shared secret key)
    const recoveredBit = cBit ^ keyBit;
    const bitPosInByte = 7 - (i % 8);
    currentByte |= (recoveredBit << bitPosInByte);

    if (bitPosInByte === 0) {
      decryptedBytes.push(currentByte);
      currentByte = 0;
    }
  }

  // Format ciphertext as hex
  let cipherHex = '';
  for (let i = 0; i < cipherBits.length; i += 4) {
    const chunk = cipherBits.slice(i, i + 4).join('').padEnd(4, '0');
    cipherHex += parseInt(chunk, 2).toString(16).toUpperCase();
  }

  const decryptedText = new TextDecoder().decode(new Uint8Array(decryptedBytes));

  return {
    plaintext,
    ciphertextHex: cipherHex,
    decryptedText,
    verified: plaintext === decryptedText,
  };
}

/**
 * Creates audit log events for a simulation session.
 */
export function generateSessionEvents(session: SimulationSession): SecurityEvent[] {
  const events: SecurityEvent[] = [];
  const ts = session.timestamp;
  const sid = session.sessionId;

  events.push({
    id: `ev-${sid}-1`,
    timestamp: ts,
    eventType: 'QKD_SESSION_STARTED',
    severity: 'INFO',
    description: `Initiated BB84 session with ${session.parameters.qubitCount} quantum states for ${session.parameters.scenario.toUpperCase()}`,
    qber: 0,
    sessionId: sid,
  });

  events.push({
    id: `ev-${sid}-2`,
    timestamp: new Date(new Date(ts).getTime() + 120).toISOString(),
    eventType: 'QUBITS_TRANSMITTED',
    severity: 'INFO',
    description: `Alice encoded and transmitted ${session.parameters.qubitCount} polarized photons across simulated optical channel`,
    qber: 0,
    sessionId: sid,
  });

  if (session.parameters.eveEnabled) {
    events.push({
      id: `ev-${sid}-3`,
      timestamp: new Date(new Date(ts).getTime() + 240).toISOString(),
      eventType: 'EVE_SIMULATION_ENABLED',
      severity: session.parameters.eveInterceptionRate > 0.3 ? 'WARNING' : 'NOTICE',
      description: `Eve intercept-resend attack active: ${Math.round(session.parameters.eveInterceptionRate * 100)}% interception rate configured (${session.metrics.eveInterceptedCount} qubits intercepted)`,
      qber: 0,
      sessionId: sid,
    });
  }

  if (session.parameters.channelNoise > 0) {
    events.push({
      id: `ev-${sid}-4`,
      timestamp: new Date(new Date(ts).getTime() + 320).toISOString(),
      eventType: 'CHANNEL_NOISE_DETECTED',
      severity: 'NOTICE',
      description: `Simulated fiber attenuation and thermal birefringence added ${(session.parameters.channelNoise * 100).toFixed(1)}% depolarizing noise`,
      qber: 0,
      sessionId: sid,
    });
  }

  events.push({
    id: `ev-${sid}-5`,
    timestamp: new Date(new Date(ts).getTime() + 450).toISOString(),
    eventType: 'BASIS_RECONCILIATION_COMPLETED',
    severity: 'INFO',
    description: `Classical sifting announced: ${session.metrics.siftedBitsCount} compatible basis measurements preserved (${session.metrics.siftingRatio}% efficiency)`,
    qber: 0,
    sessionId: sid,
  });

  if (session.metrics.securityStatus === 'POTENTIAL_EAVESDROPPING' || session.metrics.securityStatus === 'KEY_REJECTED') {
    events.push({
      id: `ev-${sid}-6`,
      timestamp: new Date(new Date(ts).getTime() + 600).toISOString(),
      eventType: 'QBER_THRESHOLD_EXCEEDED',
      severity: 'CRITICAL',
      description: `QBER parameter estimation measured ${session.metrics.qberPercentage}% (threshold: ${(session.parameters.securityThreshold * 100).toFixed(1)}%). Potential eavesdropping detected in the simulation!`,
      qber: session.metrics.qber,
      sessionId: sid,
    });

    events.push({
      id: `ev-${sid}-7`,
      timestamp: new Date(new Date(ts).getTime() + 700).toISOString(),
      eventType: 'KEY_REJECTED',
      severity: 'CRITICAL',
      description: 'Security policy aborted key exchange: Generated simulation key marked UNTRUSTED and discarded to prevent compromise',
      qber: session.metrics.qber,
      sessionId: sid,
    });
  } else {
    events.push({
      id: `ev-${sid}-6`,
      timestamp: new Date(new Date(ts).getTime() + 600).toISOString(),
      eventType: 'KEY_GENERATED',
      severity: 'INFO',
      description: `QBER verification passed at ${session.metrics.qberPercentage}% (below threshold). Shared secret key established (${session.metrics.finalKeyLength} bits)`,
      qber: session.metrics.qber,
      sessionId: sid,
    });

    events.push({
      id: `ev-${sid}-7`,
      timestamp: new Date(new Date(ts).getTime() + 750).toISOString(),
      eventType: 'SCADA_MESSAGE_ENCRYPTED',
      severity: 'INFO',
      description: `Secured critical infrastructure payload "${session.encryptedSampleMessage?.plaintext}" via quantum-seeded One-Time Pad`,
      qber: session.metrics.qber,
      sessionId: sid,
    });
  }

  return events;
}
