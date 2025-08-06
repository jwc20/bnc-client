import { BrowserRouter as Router, Routes, Route } from 'react-router';
import AuthLayout from './layouts/AuthLayout';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import LobbyPage from './pages/LobbyPage';
import { RequireAuth } from './components/auth/RequireAuth';
import { RedirectIfAuthenticated } from './components/auth/RedirectIfAuthenticated';

export default function App() {
    return (
        <Router >
            <Routes>
                <Route element={<AuthLayout />}>
                    <Route
                        path="/"
                        element={
                            <RequireAuth>
                                <LobbyPage />
                            </RequireAuth>
                        }
                    />
                    <Route
                        path="/login"
                        element={
                            <RedirectIfAuthenticated>
                                <LoginPage />
                            </RedirectIfAuthenticated>
                        }
                    />
                    <Route
                        path="/register"
                        element={
                            <RedirectIfAuthenticated>
                                <RegisterPage />
                            </RedirectIfAuthenticated>
                        }
                    />
                    <Route
                        path="/lobby"
                        element={
                            <RequireAuth>
                                <LobbyPage />
                            </RequireAuth>
                        }
                    />
                    {/* Add other protected pages here */}
                </Route>
            </Routes>
        </Router>
    );
}
