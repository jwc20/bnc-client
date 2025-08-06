import './App.css'
import {BrowserRouter, Routes, Route} from "react-router";
import Login from "./components/auth/Login";
import Register from "./components/auth/Register";
import {AuthLayout} from "./layouts/AuthLayout";

function App() {
    return (
        <>
            <BrowserRouter>
                <Routes>
                    <Route index element={<h1>Home</h1>}/>
                    <Route element={<AuthLayout/>}>
                        <Route path="login" element={<Login/>}/>
                        <Route path="register" element={<Register/>}/>
                    </Route>
                </Routes>
            </BrowserRouter>
        </>
    )
}

export default App
