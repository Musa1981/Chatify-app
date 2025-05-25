import React, { useState, useContext, useEffect } from 'react';
import { AuthContext } from '../contexts/AuthContext';
import { Link } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';
import { jwtDecode } from 'jwt-decode';

const Login = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [message, setMessage] = useState('');

    const { user, login, csrfToken, fetchCsrfToken } = useContext(AuthContext);

    useEffect(() => {
        if (!csrfToken) {
            fetchCsrfToken();
        }
    }, [csrfToken, fetchCsrfToken]);

    const handleLogin = async () => {
        try {
            const response = await fetch(`${(process.env.VITE_BASE_URL || import.meta.env.VITE_BASE_URL)}/auth/token`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ username, password, csrfToken }),
            });

            const data = await response.json();

            if (!response.ok) {
                setMessage(data.error || 'Login failed');
            } else {
                const decoded = jwtDecode(data.token);
                const user = {
                    id: decoded.id,
                    username: decoded.user,
                    avatar: decoded.avatar,
                    email: decoded.email,
                };

                login(user, data.token);
                setMessage('Login successful');
            }
        } catch (error) {
            console.error("Login error:", error);
            setMessage('Något gick fel vid inloggning');
        }
    };

    return (
        <div className="login-wrapper d-flex align-items-center justify-content-center">
            <div className="login-card p-4 rounded shadow bg-white text-center">
                <h2 className="mb-4">Logga in till Chatiffy</h2>

                {message && <div className="alert alert-info">{message}</div>}

                <div className="form-group mb-3">
                    <input
                        type="text"
                        className="form-control"
                        placeholder="Användarnamn"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                    />
                </div>

                <div className="form-group mb-4">
                    <input
                        type="password"
                        className="form-control"
                        placeholder="Lösenord"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                    />
                </div>

                <button className="btn btn-primary w-100 mb-2" onClick={handleLogin}>
                    Logga in
                </button>

                <Link to="/register" className="btn btn-outline-secondary w-100">
                    Registrera
                </Link>

                {user && (
                    <div className="mt-4">
                        <h5>Inloggad som: {user.username}</h5>
                        {user.avatar && <img src={user.avatar} alt="Avatar" className="rounded-circle mt-2" style={{ width: '80px', height: '80px' }} />}
                    </div>
                )}
            </div>
        </div>
    );
};

export default Login;
