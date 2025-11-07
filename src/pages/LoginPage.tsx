import {useState, useEffect} from "react";
import type {FormEvent} from 'react';
import {Link, useNavigate, useLocation} from "react-router";
import {useAuth} from "../auths/AuthContext";

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
        } catch (err: unknown) {
            const errorMessage =
                (err as { message?: string })?.message ||
                "Invalid email or password. Please try again.";
            setError(errorMessage);
        } finally {
            setIsSubmitting(false);
        }
    };

    useEffect(() => {
        if (auth.user) {
            navigate(from, {replace: true});
        }
    }, [auth.user, navigate, from]);

    if (auth.user) {
        return null;
    }
    return (
        <div className="login-page center">
            <div className="login-container">
                <div className="login-card">
                    <div className="login-header">
                        <h2>Login</h2>
                    </div>

                    {/* {location.state?.from && (
                        <div className="info-message">
                            You need to log in to access {from}
                        </div>
                    )} */}

                    {error && (
                        <div className="error-message">
                            <span className="error-icon">⚠️</span>
                            <span>{error}</span>
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="login-form">
                        <table className="form-table">
                            <tbody>
                            <tr>
                                <td>email</td>
                                <td>
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
                                </td>
                            </tr>
                            <tr>
                                <td>password</td>
                                <td>
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
                                </td>
                            </tr>
                            </tbody>

                        </table>


                        <div className="form-actions">
                            <button
                                type="submit"
                                disabled={isSubmitting || !email || !password}
                            >
                                {isSubmitting ? "Signing in..." : "Sign In"}
                            </button>
                            <p className="server-info">
                                Please allow up to 90 seconds for the server to initialize if inactive.
                            </p>
                        </div>

                        {/* <div className="form-footer">
                            <Link to="/forgot-password" className="link-text">
                                Forgot your password?
                            </Link>
                        </div> */}
                    </form>

                    {/*<div className="divider">*/}
                    {/*    <span>or</span>*/}
                    {/*</div>*/}

                    <div className="alternative-actions">
                        <p>

                            <Link to="/register" className="link-primary">
                                Don't have an account?
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
    .login-header {
      margin-bottom: 3rem;
      text-align: center;
    }
    .login-form {
      display: flex;
      font-size: 0.7rem;
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
    .divider {
      margin: 2rem 0;
      text-align: center;
    }
    .form-actions {
      margin-top: 2rem;
      text-align: center;
    }
    .server-info {
      margin-top: 1rem;
      font-size: 0.55rem;
      color: #666;
      line-height: 1.3;
    }
    .alternative-actions {
      margin-top: 2rem;
      text-align: center;
      font-size: 0.6rem;
    }
`
