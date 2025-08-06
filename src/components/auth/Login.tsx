import { useState } from "react";

function Login() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    const handleSubmit = (e) => {
        e.preventDefault();
        console.log("Logging in with:", { email, password });
        // TODO: Replace with actual login logic
    };

    return (
        <form onSubmit={handleSubmit}>
            <div>
                <label>Email:</label><br />
                <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                />
            </div>
            <div style={{ marginTop: "1rem" }}>
                <label>Password:</label><br />
                <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                />
            </div>
            <button type="submit" style={{ marginTop: "1.5rem" }}>
                Login
            </button>
        </form>
    );
}

export default Login;