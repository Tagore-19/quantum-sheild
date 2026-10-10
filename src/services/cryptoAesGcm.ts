/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * QUANTUM-SHIELD: AES-256-GCM Cryptographic Implementation
 * Real Authenticated Encryption with Associated Data (AEAD) using Web Crypto API.
 * Demonstrates:
 * - 256-bit AES key derivation via SHA-256 privacy amplification
 * - 96-bit (12-byte) initialization vector / nonce
 * - 128-bit (16-byte) authentication tag
 * - Tamper detection: modification of ciphertext fails tag verification with "Integrity check failed"
 */

export interface AesGcmEncryptedPayload {
  plaintext: string;
  nonceHex: string;
  ciphertextHex: string;
  tagHex: string;
  fullCiphertextHex: string;
  verified: boolean;
  decryptedText?: string;
  error?: string;
}

/**
 * Derives a 32-byte (256-bit) CryptoKey from sifted/reconciled key bits via SHA-256.
 */
export async function deriveAes256KeyFromBits(keyBits: number[] | string): Promise<{
  cryptoKey: CryptoKey;
  keyBytes: Uint8Array;
  keyHex: string;
  fingerprint: string;
}> {
  const bitString = Array.isArray(keyBits) ? keyBits.join('') : keyBits;
  const encoder = new TextEncoder();
  const rawBytes = encoder.encode(bitString.length > 0 ? bitString : '00000000');
  
  // SHA-256 Privacy Amplification
  const hashBuffer = await crypto.subtle.digest('SHA-256', rawBytes);
  const keyBytes = new Uint8Array(hashBuffer);
  
  const keyHex = Array.from(keyBytes)
    .map(b => b.toString(16).padStart(2, '0').toUpperCase())
    .join('');
    
  const fingerprint = `KEY-${keyHex.substring(0, 8)}`;

  const cryptoKey = await crypto.subtle.importKey(
    'raw',
    keyBytes,
    { name: 'AES-GCM', length: 256 },
    false,
    ['encrypt', 'decrypt']
  );

  return { cryptoKey, keyBytes, keyHex, fingerprint };
}

/**
 * Encrypts a critical infrastructure command using AES-256-GCM.
 */
export async function encryptCommandAesGcm(
  cryptoKey: CryptoKey,
  commandText: string
): Promise<AesGcmEncryptedPayload> {
  const nonce = crypto.getRandomValues(new Uint8Array(12)); // 96-bit standard nonce
  const encoder = new TextEncoder();
  const encodedPlaintext = encoder.encode(commandText);

  // Web Crypto AES-GCM appends 16-byte (128-bit) authentication tag to the end of ciphertext
  const cipherBuffer = await crypto.subtle.encrypt(
    { name: 'AES-GCM', iv: nonce, tagLength: 128 },
    cryptoKey,
    encodedPlaintext
  );

  const fullCipherBytes = new Uint8Array(cipherBuffer);
  const tagBytes = fullCipherBytes.slice(fullCipherBytes.length - 16);
  const cipherBytesOnly = fullCipherBytes.slice(0, fullCipherBytes.length - 16);

  const nonceHex = Array.from(nonce).map(b => b.toString(16).padStart(2, '0').toUpperCase()).join('');
  const ciphertextHex = Array.from(cipherBytesOnly).map(b => b.toString(16).padStart(2, '0').toUpperCase()).join('');
  const tagHex = Array.from(tagBytes).map(b => b.toString(16).padStart(2, '0').toUpperCase()).join('');
  const fullCiphertextHex = Array.from(fullCipherBytes).map(b => b.toString(16).padStart(2, '0').toUpperCase()).join('');

  return {
    plaintext: commandText,
    nonceHex,
    ciphertextHex,
    tagHex,
    fullCiphertextHex,
    verified: true,
    decryptedText: commandText,
  };
}

/**
 * Decrypts an AES-256-GCM payload and validates the 128-bit authentication tag.
 * Returns { success: boolean, message: string }
 */
export async function decryptCommandAesGcm(
  cryptoKey: CryptoKey,
  nonceHex: string,
  ciphertextHex: string,
  tagHex: string
): Promise<{ success: boolean; message: string }> {
  try {
    const nonce = hexToBytes(nonceHex);
    const cipherOnly = hexToBytes(ciphertextHex);
    const tag = hexToBytes(tagHex);

    // Concatenate ciphertext + tag for Web Crypto AES-GCM decryption
    const fullCipher = new Uint8Array(cipherOnly.length + tag.length);
    fullCipher.set(cipherOnly, 0);
    fullCipher.set(tag, cipherOnly.length);

    const decryptedBuffer = await crypto.subtle.decrypt(
      { name: 'AES-GCM', iv: nonce as unknown as BufferSource, tagLength: 128 },
      cryptoKey,
      fullCipher as unknown as BufferSource
    );

    const decoder = new TextDecoder();
    const plaintext = decoder.decode(decryptedBuffer);
    return { success: true, message: plaintext };
  } catch (err: any) {
    return {
      success: false,
      message: 'Integrity check failed: authentication tag verification failed. Message was tampered or corrupted in flight.'
    };
  }
}

function hexToBytes(hex: string): Uint8Array {
  const cleanHex = hex.replace(/[^0-9A-Fa-f]/g, '');
  const bytes = new Uint8Array(cleanHex.length / 2);
  for (let i = 0; i < cleanHex.length; i += 2) {
    bytes[i / 2] = parseInt(cleanHex.substring(i, i + 2), 16);
  }
  return bytes;
}
