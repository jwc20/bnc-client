import { useState } from "react";
import type { FormEvent } from 'react';
import { Link, useNavigate } from "react-router";
import { useAuth } from "../auths/AuthContext";

interface ValidationErrors {
    email?: string;
    password?: string;
    confirmPassword?: string;
    username?: string;
}

export function RegisterPage() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [username, setUsername] = useState("");
    const [errors, setErrors] = useState<ValidationErrors>({});
    const [serverError, setServerError] = useState<string | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const auth = useAuth();
    const navigate = useNavigate();

    const validateForm = (): boolean => {
        const newErrors: ValidationErrors = {};

        // TODO: Add additional form validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            newErrors.email = "Please enter a valid email address";
        }

        if (username.length < 3) {
            newErrors.username = "Username must be at least 3 characters long";
        } else if (username.length > 20) {
            newErrors.username = "Username must be less than 20 characters";
        } else if (!/^[a-zA-Z0-9_]+$/.test(username)) {
            newErrors.username = "Username can only contain letters, numbers, and underscores";
        }

        if (password.length < 6) {
            newErrors.password = "Password must be at least 6 characters long";
        } else if (password.length > 50) {
            newErrors.password = "Password must be less than 50 characters";
        }

        if (password !== confirmPassword) {
            newErrors.confirmPassword = "Passwords do not match";
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setServerError(null);

        if (!validateForm()) {
            return;
        }


        setIsSubmitting(true);

        try {
            await auth.register(email, password, username);
        } catch (err: unknown) {
            const errorMessage =
                (err as { message?: string })?.message ||
                "Registration failed. Please try again.";
            setServerError(errorMessage);
        } finally {
            setIsSubmitting(false);
        }
    };

    // redirect if already logged in
    if (auth.user) {
        navigate("/lobby", { replace: true });
        return null;
    }
    return (
        <div className="register-page center">
            <div className="register-container">
                <div className="register-card">
                    <div className="register-header">
                        <h2>Sign Up</h2>
                    </div>

                    {serverError && (
                        <div className="error-message">
                            <span className="error-icon">⚠️</span>
                            <span>{serverError}</span>
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="register-form">
                        <table className="form-table">
                            <tr>
                                <td>username</td>
                                <td>
                                    <input
                                        id="username"
                                        type="text"
                                        value={username}
                                        onChange={(e) => {
                                            setUsername(e.target.value);
                                            if (errors.username) {
                                                setErrors({ ...errors, username: undefined });
                                            }
                                        }}
                                        placeholder="Choose a username"
                                        required
                                        disabled={isSubmitting}
                                        autoComplete="username"
                                        autoFocus
                                    />
                                    {errors.username && (
                                        <div className="field-error">{errors.username}</div>
                                    )}
                                </td>
                            </tr>
                            <tr>
                                <td>email</td>
                                <td>
                                    <input
                                        id="email"
                                        type="email"
                                        value={email}
                                        onChange={(e) => {
                                            setEmail(e.target.value);
                                            if (errors.email) {
                                                setErrors({ ...errors, email: undefined });
                                            }
                                        }}
                                        placeholder="Enter your email"
                                        required
                                        disabled={isSubmitting}
                                        autoComplete="email"
                                    />
                                    {errors.email && (
                                        <div className="field-error">{errors.email}</div>
                                    )}
                                </td>
                            </tr>
                            <tr>
                                <td>password</td>
                                <td>
                                    <input
                                        id="password"
                                        type="password"
                                        value={password}
                                        onChange={(e) => {
                                            setPassword(e.target.value);
                                            if (errors.password) {
                                                setErrors({ ...errors, password: undefined });
                                            }
                                        }}
                                        placeholder="Create a password"
                                        required
                                        disabled={isSubmitting}
                                        autoComplete="new-password"
                                        minLength={6}
                                    />
                                    {errors.password && (
                                        <div className="field-error">{errors.password}</div>
                                    )}
                                    <small className="field-hint">
                                        Must be at least 6 characters
                                    </small>
                                </td>
                            </tr>
                            <tr>
                                <td>confirm password</td>
                                <td>
                                    <input
                                        id="confirmPassword"
                                        type="password"
                                        value={confirmPassword}
                                        onChange={(e) => {
                                            setConfirmPassword(e.target.value);
                                            if (errors.confirmPassword) {
                                                setErrors({ ...errors, confirmPassword: undefined });
                                            }
                                        }}
                                        placeholder="Confirm your password"
                                        required
                                        disabled={isSubmitting}
                                        autoComplete="new-password"
                                    />
                                    {errors.confirmPassword && (
                                        <div className="field-error">{errors.confirmPassword}</div>
                                    )}
                                </td>
                            </tr>
                        </table>

                        <div className="form-actions">
                            <button
                                type="submit"
                                className="btn btn-primary btn-block"
                                disabled={
                                    isSubmitting ||
                                    !email ||
                                    !password ||
                                    !confirmPassword ||
                                    !username
                                }
                            >
                                {isSubmitting ? "Creating account..." : "Sign Up"}
                            </button>
                        </div>
                    </form>

                    <div className="divider">
                        <span>or</span>
                    </div>

                    <div className="alternative-actions">
                        <p>
                            <Link to="/login" className="link-primary">
                                Already have an account?
                            </Link>
                        </p>
                    </div>
                </div>
            </div>
            <style>{styles}</style>
        </div>
    );
}

const styles = `
    .register-header {
      margin-bottom: 3rem;
      text-align: center;
    }
    .register-form {
      display: flex;
      font-size: 0.5rem;
      flex-direction: column;
      align-items: center;
    }
    .form-table {
      border-collapse: collapse;
    }
    .form-table td {
      vertical-align: center;
      padding: 0.4rem;
    }
    .form-table td:first-child {
      text-align: right;
    }
    .form-table td:last-child {
      text-align: left;
    }
    .form-table input {
      width: 100%;
      height: 1rem;
      padding: 0.5rem;
      border-radius: 4px;
    }
    .field-error {
      display: block;
      color: #e74c3c;
      font-size: 0.6rem;
      margin-top: 0.2rem;
    }
    .field-hint {
      display: block;
      color: #666;
      font-size: 0.3rem;
      margin-top: 0.2rem;
    }
    .divider {
      margin: 2rem 0;
      text-align: center;
    }
    .form-actions {
      margin-top: 2rem;
      text-align: center;
    }
    .alternative-actions {
      margin-top: 2rem;
      text-align: center;
      font-size: 0.6rem;
    }
`