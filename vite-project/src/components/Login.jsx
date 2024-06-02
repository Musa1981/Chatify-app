import React, { useState, useContext, useEffect } from 'react';
import { AuthContext } from '../contexts/AuthContext';
import 'bootstrap/dist/css/bootstrap.min.css';

const Login = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [message, setMessage] = useState('');
    const { login, csrfToken, fetchCsrfToken } = useContext(AuthContext);

    useEffect(() => {
        if (!csrfToken) {
            fetchCsrfToken();
        }
    }, [csrfToken, fetchCsrfToken]);

    const handleLogin = async () => {
        try {
            const response = await fetch(`${import.meta.env.VITE_BASE_URL}/auth/token`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ username, password, csrfToken }),
            });

            const data = await response.json();
            if (!response.ok) {
                setMessage(data.error);
            } else {
                login(data.user, data.token);
                setMessage('Login successful');
            }
        } catch (error) {
            console.error("Login error:", error);
            setMessage(error.message);
        }
    };

    return (
        <div className="container mt-5">
            <h2>Login</h2>
            <div className="mb-3">
                <label htmlFor="username" className="form-label">Username</label>
                <input
                    type="text"
                    className="form-control"
                    id="username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                />
            </div>
            <div className="mb-3">
                <label htmlFor="password" className="form-label">Password</label>
                <input
                    type="password"
                    className="form-control"
                    id="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                />
            </div>
            <button className="btn btn-primary" onClick={handleLogin}>Login</button>
            {message && <div className="mt-3 alert alert-info">{message}</div>}
        </div>
    );
};

export default Login;
