import React, { useState } from 'react';
import { AESCrypto, twoWayDecAes, base64ToTextModern, textToBase64Modern } from '../libs/aes-crypto';

interface AESResult {
    encrypted?: string;
    decrypted?: string;
    error?: string;
}

interface Base64Result {
    encoded?: string;
    decoded?: string;
    error?: string;
}

export const AESDemo: React.FC = () => {
    const [key, setKey] = useState<string>('mySecretKey123');
    const [plaintext, setPlaintext] = useState<string>('Hello, World!');
    const [encryptedText, setEncryptedText] = useState<string>('');
    const [result, setResult] = useState<AESResult>({});
    
    // Base64 states
    const [textToEncode, setTextToEncode] = useState<string>('Hello, World!');
    const [base64TooDecode, setBase64ToDecode] = useState<string>('');
    const [base64Result, setBase64Result] = useState<Base64Result>({});
    
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

    // Base64 handlers
    const handleBase64Encode = (): void => {
        try {
            if (!textToEncode) {
                setBase64Result({ error: 'Please enter text to encode' });
                return;
            }

            const encoded = textToBase64Modern(textToEncode);
            setBase64ToDecode(encoded);
            setBase64Result({ encoded, error: undefined });
        } catch (error) {
            setBase64Result({ error: `Base64 encoding failed: ${error}` });
        }
    };

    const handleBase64Decode = (): void => {
        try {
            if (!base64TooDecode) {
                setBase64Result({ error: 'Please enter base64 text to decode' });
                return;
            }

            const decoded = base64ToTextModern(base64TooDecode);
            setBase64Result({ decoded, error: undefined });
        } catch (error) {
            setBase64Result({ error: `Base64 decoding failed: ${error}` });
        }
    };

    const handleClearBase64 = (): void => {
        setTextToEncode('Hello, World!');
        setBase64ToDecode('');
        setBase64Result({});
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

            {/* Base64 Section */}
            <hr style={{ margin: '30px 0', borderColor: '#ccc' }} />
            
            <h2>Base64 Encoding/Decoding</h2>
            
            <div style={{ marginBottom: '15px' }}>
                <label>
                    Text to encode:
                    <input
                        type="text"
                        value={textToEncode}
                        onChange={(e) => setTextToEncode(e.target.value)}
                        style={{ marginLeft: '10px', width: '300px' }}
                    />
                </label>
            </div>

            <div style={{ marginBottom: '15px' }}>
                <label>
                    Base64 to decode:
                    <textarea
                        value={base64TooDecode}
                        onChange={(e) => setBase64ToDecode(e.target.value)}
                        style={{ marginLeft: '10px', width: '300px', height: '60px' }}
                        placeholder="Base64 encoded text will appear here..."
                    />
                </label>
            </div>

            <div style={{ marginBottom: '20px' }}>
                <button onClick={handleBase64Encode} style={{ marginRight: '10px' }}>
                    Encode to Base64
                </button>
                <button onClick={handleBase64Decode} style={{ marginRight: '10px' }}>
                    Decode from Base64
                </button>
                <button onClick={handleClearBase64}>
                    Clear Base64
                </button>
            </div>

            {base64Result.encoded && (
                <div style={{ marginBottom: '10px' }}>
                    <strong>Base64 Encoded:</strong> {base64Result.encoded}
                </div>
            )}

            {base64Result.decoded !== undefined && (
                <div style={{ marginBottom: '10px' }}>
                    <strong>Base64 Decoded:</strong> "{base64Result.decoded}"
                </div>
            )}

            {base64Result.error && (
                <div style={{ color: 'red', marginBottom: '10px' }}>
                    <strong>Base64 Error:</strong> {base64Result.error}
                </div>
            )}
        </div>
    );
};