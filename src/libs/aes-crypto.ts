// First, install crypto-js and its types:
// npm install crypto-js
// npm install --save-dev @types/crypto-js

// utils/aes-crypto.ts
import CryptoJS from 'crypto-js';

export class AESCrypto {
    
    /**
     * Prepare key by truncating or padding to 16 bytes
     * @param key - The encryption key
     * @returns 16-byte key as WordArray
     */
    private prepareKey(key: string): CryptoJS.lib.WordArray {
        let keyBytes = CryptoJS.enc.Utf8.parse(key);
        
        if (keyBytes.sigBytes > 16) {
            // Truncate to 16 bytes
            keyBytes = CryptoJS.lib.WordArray.create(keyBytes.words.slice(0, 4));
            keyBytes.sigBytes = 16;
        } else if (keyBytes.sigBytes < 16) {
            // Pad with null bytes to 16 bytes
            const paddedArray = new Uint8Array(16);
            
            // Convert existing bytes
            for (let i = 0; i < keyBytes.sigBytes; i++) {
                paddedArray[i] = (keyBytes.words[Math.floor(i / 4)] >>> (24 - (i % 4) * 8)) & 0xff;
            }
            
            keyBytes = CryptoJS.lib.WordArray.create(paddedArray);
        }
        
        return keyBytes;
    }

    /**
     * Two-way encryption using AES-CBC
     * @param key - The encryption key
     * @param value - The plaintext to encrypt
     * @returns Base64 encoded ciphertext
     */
    public twoWayEncAes(key: string, value: string): string {
        try {
            const keyBytes = this.prepareKey(key);
            
            // Use the same key as IV (matching Python behavior)
            const iv = keyBytes;
            
            // Encrypt using AES-CBC
            const encrypted = CryptoJS.AES.encrypt(value, keyBytes, {
                iv: iv,
                mode: CryptoJS.mode.CBC,
                padding: CryptoJS.pad.Pkcs7
            });
            
            return encrypted.toString(); // Returns base64 by default
        } catch (error) {
            console.error('Encryption error:', error);
            throw error;
        }
    }

    /**
     * Two-way decryption using AES-CBC
     * @param key - The decryption key
     * @param value - Base64 encoded ciphertext
     * @returns Decrypted plaintext (empty string on error)
     */
    public twoWayDecAes(key: string, value: string): string {
        try {
            const keyBytes = this.prepareKey(key);
            
            // Use the same key as IV (matching Python behavior)
            const iv = keyBytes;
            
            // Decrypt using AES-CBC
            const decrypted = CryptoJS.AES.decrypt(value, keyBytes, {
                iv: iv,
                mode: CryptoJS.mode.CBC,
                padding: CryptoJS.pad.Pkcs7
            });
            
            return decrypted.toString(CryptoJS.enc.Utf8);
        } catch (error) {
            console.error('Decryption error:', error);
            return ''; // Return empty string on error (matching Python behavior)
        }
    }
}

// Standalone functions with TypeScript types
export function twoWayEncAes(key: string, value: string): string {
    try {
        // Prepare key
        let keyBytes = CryptoJS.enc.Utf8.parse(key);
        if (keyBytes.sigBytes > 16) {
            keyBytes = CryptoJS.lib.WordArray.create(keyBytes.words.slice(0, 4));
            keyBytes.sigBytes = 16;
        } else if (keyBytes.sigBytes < 16) {
            const paddedArray = new Uint8Array(16);
            for (let i = 0; i < keyBytes.sigBytes; i++) {
                paddedArray[i] = (keyBytes.words[Math.floor(i / 4)] >>> (24 - (i % 4) * 8)) & 0xff;
            }
            keyBytes = CryptoJS.lib.WordArray.create(paddedArray);
        }
        
        // Encrypt
        const encrypted = CryptoJS.AES.encrypt(value, keyBytes, {
            iv: keyBytes,
            mode: CryptoJS.mode.CBC,
            padding: CryptoJS.pad.Pkcs7
        });
        
        return encrypted.toString();
    } catch (error) {
        console.error('Encryption error:', error);
        throw error;
    }
}

export function twoWayDecAes(key: string, value: string): string {
    try {
        // Prepare key
        let keyBytes = CryptoJS.enc.Utf8.parse(key);
        if (keyBytes.sigBytes > 16) {
            keyBytes = CryptoJS.lib.WordArray.create(keyBytes.words.slice(0, 4));
            keyBytes.sigBytes = 16;
        } else if (keyBytes.sigBytes < 16) {
            const paddedArray = new Uint8Array(16);
            for (let i = 0; i < keyBytes.sigBytes; i++) {
                paddedArray[i] = (keyBytes.words[Math.floor(i / 4)] >>> (24 - (i % 4) * 8)) & 0xff;
            }
            keyBytes = CryptoJS.lib.WordArray.create(paddedArray);
        }
        
        // Decrypt
        const decrypted = CryptoJS.AES.decrypt(value, keyBytes, {
            iv: keyBytes,
            mode: CryptoJS.mode.CBC,
            padding: CryptoJS.pad.Pkcs7
        });
        
        return decrypted.toString(CryptoJS.enc.Utf8);
    } catch (error) {
        console.error('Decryption error:', error);
        return '';
    }
}


export function textToBase64Modern(text: string): string {
    const encoder = new TextEncoder();
    const data = encoder.encode(text);
    return btoa(String.fromCharCode(...data));
}

export function base64ToTextModern(base64String: string): string {
    try {
        const binaryString = atob(base64String);
        const bytes = new Uint8Array(binaryString.length);
        for (let i = 0; i < binaryString.length; i++) {
            bytes[i] = binaryString.charCodeAt(i);
        }
        const decoder = new TextDecoder();
        return decoder.decode(bytes);
    } catch (error) {
        console.error('Decoding error:', error);
        return '';
    }
}