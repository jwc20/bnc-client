/* eslint-disable @typescript-eslint/no-explicit-any */

import { useState, useEffect } from "react";
import type { FormEvent } from 'react';
import { Link, useNavigate, useLocation } from "react-router";
import { useAuth } from "../auths/AuthContext";

export function LoginPage() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState<string | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const auth = useAuth();
    const navigate = useNavigate();
    const location = useLocation();

    const from = location.state?.from?.pathname || "/lobby";

    const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setError(null);
        setIsSubmitting(true);

        try {
            await auth.login(email, password);
        } catch (err: any) {
            setError(err.message || "Invalid email or password. Please try again.");
        } finally {
            setIsSubmitting(false);
        }
    };

    useEffect(() => {
        if (auth.user) {
            navigate(from, { replace: true });
        }
    }, [auth.user, navigate, from]);

    if (auth.user) {
        return null;
    }
    return (
        <div className="login-page">
            <div className="login-container">
                <div className="login-card">
                    <div className="login-header">
                        <h1>Welcome Back</h1>
                        <p>Sign in to your account to continue</p>
                    </div>

                    {location.state?.from && (
                        <div className="info-message">
                            You need to log in to access {from}
                        </div>
                    )}

                    {error && (
                        <div className="error-message">
                            <span className="error-icon">⚠️</span>
                            <span>{error}</span>
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="login-form">
                        <div className="form-group">
                            <label htmlFor="email">Email</label>
                            <input
                                id="email"
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="Enter your email"
                                required
                                disabled={isSubmitting}
                                autoComplete="email"
                                autoFocus
                            />
                        </div>

                        <div className="form-group">
                            <label htmlFor="password">Password</label>
                            <input
                                id="password"
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="Enter your password"
                                required
                                disabled={isSubmitting}
                                autoComplete="current-password"
                                minLength={6}
                            />
                        </div>

                        <div className="form-actions">
                            <button
                                type="submit"
                                className="btn btn-primary btn-block"
                                disabled={isSubmitting || !email || !password}
                            >
                                {isSubmitting ? "Signing in..." : "Sign In"}
                            </button>
                        </div>

                        <div className="form-footer">
                            <Link to="/forgot-password" className="link-text">
                                Forgot your password?
                            </Link>
                        </div>
                    </form>

                    <div className="divider">
                        <span>or</span>
                    </div>

                    <div className="alternative-actions">
                        <p>
                            Don't have an account?{" "}
                            <Link to="/register" className="link-primary">
                                Sign up
                            </Link>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}