import {Routes, Route} from "react-router";
import {AuthProvider} from "./auths/AuthProvider";
import {RequireAuth} from "./auths/RequireAuth";
import {Layout} from "./layouts/Layout.jsx";
import {LoginPage} from "./pages/LoginPage";
import {LobbyPage} from "./pages/LobbyPage";
import {RegisterPage} from "./pages/RegisterPage";
import {RoomPage} from "./pages/RoomPage";


import {client} from "./api/client.gen";
import "./App.css";

client.setConfig({
    baseUrl: import.meta.env.VITE_API_URL || "http://localhost:8000/",
    headers: {
        "Content-Type": "application/json",
    },
    throwOnError: false,
});

if (import.meta.env.DEV) {
    client.interceptors.request.use((request, options) => {
        console.log("API Request:", request.method, request.url, options);
        return request;
    });
}

export default function App() {
    return (
        <AuthProvider>
            <Routes>
                <Route element={<Layout/>}>
                    <Route path="/login" element={<LoginPage/>}/>
                    <Route path="/register" element={<RegisterPage/>}/>
                    <Route
                        path="/"
                        element={
                            <RequireAuth>
                                <LobbyPage/>
                            </RequireAuth>
                        }
                    />
                    <Route
                        path="/lobby"
                        element={
                            <RequireAuth>
                                <LobbyPage/>
                            </RequireAuth>
                        }
                    />
                    <Route
                        path="/room/:roomId"
                        element={
                            <RequireAuth>
                                <RoomPage/>
                            </RequireAuth>
                        }
                    />


                    {/*<Route*/}
                    {/*    path="/user"*/}
                    {/*    element={*/}
                    {/*        <RequireAuth>*/}
                    {/*            <UserPage />*/}
                    {/*        </RequireAuth>*/}
                    {/*    }*/}
                    {/*/>*/}
                    {/*<Route*/}
                    {/*    path="/canvas"*/}
                    {/*    element={*/}
                    {/*        <RequireAuth>*/}
                    {/*            <GridCanvas />*/}
                    {/*        </RequireAuth>*/}
                    {/*    }*/}
                    {/*/>*/}

                    <Route
                        path="/unauthorized"
                        element={
                            <div className="unauthorized-page">
                                <h1>Unauthorized</h1>
                                <p>You don't have permission to access this page.</p>
                                <a href="/lobby">Go back to lobby</a>
                            </div>
                        }
                    />
                    <Route
                        path="*"
                        element={
                            <div className="not-found-page">
                                <h1>404 - Page Not Found</h1>
                                <a href="/">Go to home</a>
                            </div>
                        }
                    />
                </Route>
            </Routes>
        </AuthProvider>
    );
}