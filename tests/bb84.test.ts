/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * Q-SHIELD: BB84 Protocol Simulation & Security Tests
 */

import {
  encodeQubit,
  measureQubit,
  runBB84Simulation,
  createSeededRandom,
  demonstrateOneTimePad,
  binaryStringToHex
} from '../src/services/bb84Simulation.ts';
import { SimulationParameters } from '../src/types/qkd.ts';

function assert(condition: boolean, message: string) {
  if (!condition) {
    throw new Error(`TEST FAILED: ${message}`);
  }
  console.log(`  ✓ ${message}`);
}

function runAllTests() {
  console.log('========================================');
  console.log('RUNNING Q-SHIELD SCIENTIFIC VERIFICATION');
  console.log('========================================\n');

  // Test 1: Basis Encoding
  console.log('Test 1: Polarization State Encoding');
  assert(encodeQubit(0, 'Z') === '|0⟩', 'Bit 0 in Z basis encodes to |0⟩ (Horizontal)');
  assert(encodeQubit(1, 'Z') === '|1⟩', 'Bit 1 in Z basis encodes to |1⟩ (Vertical)');
  assert(encodeQubit(0, 'X') === '|+⟩', 'Bit 0 in X basis encodes to |+⟩ (Diagonal +45°)');
  assert(encodeQubit(1, 'X') === '|–⟩', 'Bit 1 in X basis encodes to |–⟩ (Diagonal -45°)');

  // Test 2: Quantum Measurement Determinism & Collapse
  console.log('\nTest 2: Quantum Measurement Collapse');
  const m1 = measureQubit('|0⟩', 'Z');
  assert(m1.bit === 0 && m1.collapsedState === '|0⟩', 'Measuring |0⟩ in Z basis yields bit 0 deterministically');

  const m2 = measureQubit('|1⟩', 'Z');
  assert(m2.bit === 1 && m2.collapsedState === '|1⟩', 'Measuring |1⟩ in Z basis yields bit 1 deterministically');

  const m3 = measureQubit('|+⟩', 'X');
  assert(m3.bit === 0 && m3.collapsedState === '|+⟩', 'Measuring |+⟩ in X basis yields bit 0 deterministically');

  const m4 = measureQubit('|–⟩', 'X');
  assert(m4.bit === 1 && m4.collapsedState === '|–⟩', 'Measuring |–⟩ in X basis yields bit 1 deterministically');

  // Test 2b: Conjugate measurement creates 50/50 superposition collapse
  let zeroCount = 0;
  let oneCount = 0;
  for (let i = 0; i < 1000; i++) {
    const outcome = measureQubit('|0⟩', 'X');
    if (outcome.bit === 0) zeroCount++;
    else oneCount++;
  }
  assert(zeroCount > 400 && zeroCount < 600, `Conjugate measurement of |0⟩ in X basis yields ~50% 0s (${zeroCount}/1000)`);

  // Test 3: Normal Secure Channel (No Eve, 0 Noise)
  console.log('\nTest 3: Normal Secure Channel Simulation (No Eve, 0 Noise)');
  const normalParams: SimulationParameters = {
    qubitCount: 200,
    channelNoise: 0.0,
    eveEnabled: false,
    eveInterceptionRate: 0.0,
    securityThreshold: 0.11,
    scenario: 'power_grid',
  };
  const normalSession = runBB84Simulation(normalParams);
  assert(normalSession.metrics.qber === 0, `No-Eve, noiseless channel yields QBER = 0.00% (measured: ${normalSession.metrics.qberPercentage}%)`);
  assert(normalSession.metrics.securityStatus === 'SECURE', `Security status is SECURE when QBER < threshold`);
  assert(normalSession.metrics.siftedBitsCount > 70 && normalSession.metrics.siftedBitsCount < 130, `Sifting efficiency is approximately ~50% (measured: ${normalSession.metrics.siftedBitsCount}/200)`);
  assert(normalSession.finalSecretKeyBin.length > 20, `Final simulation secret key generated successfully (length: ${normalSession.finalSecretKeyBin.length})`);

  // Test 4: Eavesdropping Attack (Eve 100% Intercept-Resend)
  console.log('\nTest 4: Eve Intercept-Resend Attack (100% Interception)');
  const eveParams: SimulationParameters = {
    qubitCount: 1000,
    channelNoise: 0.0,
    eveEnabled: true,
    eveInterceptionRate: 1.0,
    securityThreshold: 0.11,
    scenario: 'power_grid',
  };
  const eveSession = runBB84Simulation(eveParams);
  // Theoretical BB84 QBER for 100% intercept-resend is 25% (0.25)
  console.log(`  Eve 100% attack measured QBER: ${eveSession.metrics.qberPercentage}% (Theoretical: ~25.0%)`);
  assert(eveSession.metrics.qberPercentage >= 18.0 && eveSession.metrics.qberPercentage <= 32.0, `Observed QBER is consistent with theoretical 25% intercept-resend expectation`);
  assert(eveSession.metrics.securityStatus === 'POTENTIAL_EAVESDROPPING' || eveSession.metrics.securityStatus === 'KEY_REJECTED', `Compromised session correctly flagged as POTENTIAL_EAVESDROPPING / KEY_REJECTED`);
  assert(eveSession.metrics.keyStatus === 'REJECTED', `Compromised key is rejected`);

  // Test 5: Partial Eavesdropping (50% Interception)
  console.log('\nTest 5: Partial Eavesdropping Attack (50% Interception)');
  const partialEveParams: SimulationParameters = {
    qubitCount: 1000,
    channelNoise: 0.0,
    eveEnabled: true,
    eveInterceptionRate: 0.5,
    securityThreshold: 0.11,
    scenario: 'water_treatment',
  };
  const partialSession = runBB84Simulation(partialEveParams);
  // Theoretical BB84 QBER for 50% intercept-resend is 0.5 * 25% = 12.5%
  console.log(`  Eve 50% attack measured QBER: ${partialSession.metrics.qberPercentage}% (Theoretical: ~12.5%)`);
  assert(partialSession.metrics.qberPercentage >= 8.0 && partialSession.metrics.qberPercentage <= 18.0, `Observed QBER matches theoretical ~12.5% expectation`);

  // Test 6: One-Time Pad Cryptography Verification
  console.log('\nTest 6: Simulated One-Time Pad Encryption & Decryption');
  const sampleMsg = 'TRIP_BREAKER_400KV_BUS_B';
  const key = '10110011100011110101010111001101';
  const otpResult = demonstrateOneTimePad(sampleMsg, key, true);
  assert(otpResult.verified, `Plaintext accurately decrypted back from ciphertext: "${otpResult.decryptedText}" === "${sampleMsg}"`);
  assert(otpResult.ciphertextHex.length > 0, `Ciphertext hex produced: ${otpResult.ciphertextHex.substring(0, 16)}...`);

  const rejectedOtp = demonstrateOneTimePad(sampleMsg, key, false);
  assert(!rejectedOtp.verified, `Transmission is blocked when key status is marked rejected`);

  // Test 7: Hex conversion
  console.log('\nTest 7: Binary to Hex conversion');
  assert(binaryStringToHex('11110000') === 'F0', '11110000 converts to F0 in hex');
  assert(binaryStringToHex('10101100') === 'AC', '10101100 converts to AC in hex');

  console.log('\n========================================');
  console.log('ALL SCIENTIFIC & SECURITY TESTS PASSED!');
  console.log('========================================\n');
}

runAllTests();
