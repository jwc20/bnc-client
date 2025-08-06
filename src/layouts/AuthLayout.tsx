import { Outlet } from "react-router";

export function AuthLayout() {
    return (
        <div style={{ padding: "2rem", maxWidth: "400px", margin: "0 auto" }}>
            <h2>Login/Regster</h2>
            <Outlet />
        </div>
    );
}
