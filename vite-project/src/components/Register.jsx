import React, { useState, useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';
import { AuthContext } from '../contexts/AuthContext';
import { Link } from 'react-router-dom';


const Register = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [email, setEmail] = useState('');
    const [avatar, setAvatar] = useState('');
    const [message, setMessage] = useState('');
    const { csrfToken, fetchCsrfToken } = useContext(AuthContext);
    const navigate = useNavigate();

    useEffect(() => {
        if (!csrfToken) {
            fetchCsrfToken();
        }
    }, [csrfToken, fetchCsrfToken]);

    const handleRegister = async () => {
        if (!csrfToken) {
            setMessage('CSRF token is missing');
            return;
        }

        try {


            const response = await fetch(`${(process.env.VITE_BASE_URL || import.meta.env.VITE_BASE_URL)}/auth/register`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    username: username,
                    password: password,
                    email: email,
                    avatar: avatar,
                    csrfToken: csrfToken
                }),
            });

            const data = await response.json();

            if (!response.ok) {
                setMessage(data.error);
            } else {
                setMessage('Registration successful');
                setTimeout(() => navigate('/login'), 2000);
            }
        } catch (error) {
            console.error("Registration error:", error);
            setMessage(error.message);
        }
    };

    return (
        <div className="container mt-5">
            <h2>Register</h2>
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
            <div className="mb-3">
                <label htmlFor="email" className="form-label">Email</label>
                <input
                    type="email"
                    className="form-control"
                    id="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                />
            </div>
            <div className="mb-3">
                <label htmlFor="avatar" className="form-label">Avatar URL</label>
                <input
                    type="text"
                    className="form-control"
                    id="avatar"
                    value={avatar}
                    onChange={(e) => setAvatar(e.target.value)}
                />
            </div>
            <button className="btn btn-primary" onClick={handleRegister}>Register</button>
            <Link to='/*' className="btn btn-success">Home</Link>
            {message && <div className="mt-3 alert alert-info">{message}</div>}
        </div>
    );
};

export default Register;  