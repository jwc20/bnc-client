import { useState, useEffect, useCallback } from "react";
import type { ReactNode } from "react";
import { useNavigate, useLocation } from "react-router";
import { AuthContext } from "./AuthContext";
import type { User } from "./AuthContext";
import { client } from "../api/client.gen";
import type { Config } from "../api/client";
import {
    usersApiLogin,
    usersApiSignup,
    usersApiMe
} from "../api/sdk.gen";

interface AuthProviderProps {
    children: ReactNode;
}

// TODO: move to env
const TOKEN_KEY = "auth_token";
const USER_KEY = "user_data";

export function AuthProvider({ children }: AuthProviderProps) {
    const [user, setUser] = useState<User | null>(null);
    const [token, setToken] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const navigate = useNavigate();
    const location = useLocation();

    useEffect(() => {
        const initAuth = async () => {
            try {
                const storedToken = localStorage.getItem(TOKEN_KEY);
                const storedUser = localStorage.getItem(USER_KEY);

                if (storedToken && storedUser) {
                    const userData = JSON.parse(storedUser);
                    setToken(storedToken);
                    setUser(userData);

                    client.setConfig({
                        auth: storedToken,
                        headers: {
                            Authorization: `Bearer ${storedToken}`,
                        },
                    } as Config);

                    // validate token with backend
                    await validateToken(storedToken);
                }
            } catch (error) {
                console.error("Auth initialization error:", error);
                clearAuth();
            } finally {
                setIsLoading(false);
            }
        };

        initAuth();
    }, []);

    
    const validateToken = async (validationToken: string) => {
        try {
            // TODO: check if token is valid
            console.log("Validating token:", validationToken);
            const response = await usersApiMe({
                throwOnError: true,
            });
            console.log("Token validation successful:", response);
            if (response.data) {
                console.log("Token validation successful:", response.data);
                setUser(response.data);
                localStorage.setItem(USER_KEY, JSON.stringify(response.data));
                return true;
            }
        } catch (error) {
            console.error("Token validation failed:", error);
            throw error;
        }
    };

    const clearAuth = () => {
        localStorage.removeItem(TOKEN_KEY);
        localStorage.removeItem(USER_KEY);
        setUser(null);
        setToken(null);

        client.setConfig({
            auth: undefined,
            headers: {},
        } as Config);
    };

    const login = useCallback(async (email: string, password: string) => {
        try {
            setIsLoading(true);

            const response = await usersApiLogin({
                body: {
                    email,
                    password
                },
                throwOnError: true,
            });

            console.log("Full login response:", response);
            console.log("Response type:", typeof response);
            console.log("Response keys:", Object.keys(response || {}));

            const responseData = response?.data || response;

            console.log("Response data:", responseData);

            if (!responseData) {
                throw new Error("No data received from login");
            }

            const { token: authToken, username } = responseData;

            const userData: User = {
                id: username, // sing username as id
                email: email,
                username: username
            };

            localStorage.setItem(TOKEN_KEY, authToken);
            localStorage.setItem(USER_KEY, JSON.stringify(userData));

            setToken(authToken);
            setUser(userData);

            client.setConfig({
                auth: authToken,
                headers: {
                    Authorization: `Bearer ${authToken}`,
                },
            } as Config);


            const from = location.state?.from?.pathname || "/lobby";
            navigate(from, { replace: true });
        } catch (error: unknown) {
            console.error("Login error:", error);
            const errorMessage = 
                (error as { error?: { message?: string } })?.error?.message || 
                (error as Error)?.message || 
                "Login failed";
            throw new Error(errorMessage);
        } finally {
            setIsLoading(false);
        }
    }, [navigate, location]);

    const register = useCallback(async (
        email: string,
        password: string,
        username: string
    ) => {
        try {
            setIsLoading(true);

            const response = await usersApiSignup({
                body: {
                    email,
                    password,
                    username
                },
                throwOnError: true,
            });

            console.log("Full register response:", response);
            console.log("Response type:", typeof response);
            console.log("Response keys:", Object.keys(response || {}));

            const responseData = response?.data || response;

            console.log("Response data:", responseData);

            if (!responseData) {
                throw new Error("No data received from registration");
            }

            const { token: authToken, username: returnedUsername } = responseData;

            const userData: User = {
                id: returnedUsername || username, // Use returned username or the one provided
                email: email,
                username: returnedUsername || username
            };

            localStorage.setItem(TOKEN_KEY, authToken);
            localStorage.setItem(USER_KEY, JSON.stringify(userData));

            setToken(authToken);
            setUser(userData);

            client.setConfig({
                auth: authToken,
                headers: {
                    Authorization: `Bearer ${authToken}`,
                },
            } as Config);

            navigate("/lobby");
        } catch (error: unknown) {
            console.error("Registration error:", error);
            const errorMessage = 
                (error as { error?: { message?: string } })?.error?.message || 
                (error as Error)?.message || 
                "Registration failed";
            throw new Error(errorMessage);
        } finally {
            setIsLoading(false);
        }
    }, [navigate]);

    const logout = useCallback(() => {
        // client.post({
        //     url: "/auth/logout",
        //     throwOnError: false,
        // }).catch(console.error);

        clearAuth();
        navigate("/login");
    }, [navigate]);

    const refreshToken = useCallback(async () => {
        try {
            console.warn("Token refresh not implemented - no refresh token available");
            clearAuth();
            navigate("/login");
            throw new Error("Session expired. Please login again.");
        } catch (error) {
            console.error("Token refresh error:", error);
            clearAuth();
            navigate("/login");
            throw error;
        }
    }, [navigate]);

    useEffect(() => {
        const interceptorId = client.interceptors.response.use(async (response, request) => {
            // If we get a 401, redirect to login
            if (response.status === 401 && !request.url.includes("/auth/")) {
                console.log("401 Unauthorized - redirecting to login");
                clearAuth();
                navigate("/login", {
                    state: { from: location },
                    replace: true
                });
            }
            return response;
        });

        return () => {
            client.interceptors.response.eject(interceptorId);
        };
    }, [navigate, location]);

    const value = {
        user,
        token,
        isLoading,
        login,
        register,
        logout,
        refreshToken,
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}