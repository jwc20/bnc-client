import React, { useState } from 'react';
import { AESCrypto, twoWayEncAes, twoWayDecAes } from '../libs/aes-crypto';

interface AESResult {
    encrypted?: string;
    decrypted?: string;
    error?: string;
}

export const AESDemo: React.FC = () => {
    const [key, setKey] = useState<string>('mySecretKey123');
    const [plaintext, setPlaintext] = useState<string>('Hello, World!');
    const [encryptedText, setEncryptedText] = useState<string>('');
    const [result, setResult] = useState<AESResult>({});
    
    // Using class instance
    const aesCrypto = new AESCrypto();

    const handleEncrypt = (): void => {
        try {
            if (!key || !plaintext) {
                setResult({ error: 'Please enter both key and text' });
                return;
            }

            // Using class method
            const encrypted = aesCrypto.twoWayEncAes(key, plaintext);
            setEncryptedText(encrypted);
            setResult({ encrypted, error: undefined });
        } catch (error) {
            setResult({ error: `Encryption failed: ${error}` });
        }
    };

    const handleDecrypt = (): void => {
        try {
            if (!key || !encryptedText) {
                setResult({ error: 'Please enter both key and encrypted text' });
                return;
            }

            // Using standalone function
            const decrypted = twoWayDecAes(key, encryptedText);
            setResult({ decrypted, error: undefined });
        } catch (error) {
            setResult({ error: `Decryption failed: ${error}` });
        }
    };

    const handleTestWrongKey = (): void => {
        if (!encryptedText) {
            setResult({ error: 'Please encrypt some text first' });
            return;
        }

        const wrongDecrypted = aesCrypto.twoWayDecAes('wrongKey', encryptedText);
        setResult({ 
            decrypted: wrongDecrypted, 
            error: wrongDecrypted ? undefined : 'Wrong key returned empty string (as expected)'
        });
    };

    return (
        <div style={{ padding: '20px', maxWidth: '600px' }}>
            <h2>AES Encryption/Decryption Demo</h2>
            
            <div style={{ marginBottom: '15px' }}>
                <label>
                    Key:
                    <input
                        type="text"
                        value={key}
                        onChange={(e) => setKey(e.target.value)}
                        style={{ marginLeft: '10px', width: '200px' }}
                    />
                </label>
            </div>

            <div style={{ marginBottom: '15px' }}>
                <label>
                    Text to encrypt:
                    <input
                        type="text"
                        value={plaintext}
                        onChange={(e) => setPlaintext(e.target.value)}
                        style={{ marginLeft: '10px', width: '300px' }}
                    />
                </label>
            </div>

            <div style={{ marginBottom: '15px' }}>
                <label>
                    Encrypted text:
                    <textarea
                        value={encryptedText}
                        onChange={(e) => setEncryptedText(e.target.value)}
                        style={{ marginLeft: '10px', width: '300px', height: '60px' }}
                        placeholder="Encrypted text will appear here..."
                    />
                </label>
            </div>

            <div style={{ marginBottom: '20px' }}>
                <button onClick={handleEncrypt} style={{ marginRight: '10px' }}>
                    Encrypt
                </button>
                <button onClick={handleDecrypt} style={{ marginRight: '10px' }}>
                    Decrypt
                </button>
                <button onClick={handleTestWrongKey}>
                    Test Wrong Key
                </button>
            </div>

            {result.encrypted && (
                <div style={{ marginBottom: '10px' }}>
                    <strong>Encrypted:</strong> {result.encrypted}
                </div>
            )}

            {result.decrypted !== undefined && (
                <div style={{ marginBottom: '10px' }}>
                    <strong>Decrypted:</strong> "{result.decrypted}"
                </div>
            )}

            {result.error && (
                <div style={{ color: 'red', marginBottom: '10px' }}>
                    <strong>Error:</strong> {result.error}
                </div>
            )}
        </div>
    );
};
