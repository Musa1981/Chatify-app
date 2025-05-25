import React, { useState, useContext, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';
import { AuthContext } from '../contexts/AuthContext';

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
            setMessage('CSRF token saknas');
            return;
        }

        try {
            const response = await fetch(`${(process.env.VITE_BASE_URL || import.meta.env.VITE_BASE_URL)}/auth/register`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    username,
                    password,
                    email,
                    avatar,
                    csrfToken
                }),
            });

            const data = await response.json();

            if (!response.ok) {
                setMessage(data.error || 'Registreringen misslyckades');
            } else {
                setMessage('Registrering lyckades!');
                setTimeout(() => navigate('/login'), 2000);
            }
        } catch (error) {
            console.error("Registration error:", error);
            setMessage(error.message);
        }
    };

    const avatarUrls = Array.from({ length: 9 }, (_, i) => `https://i.pravatar.cc/158?img=${i + 1}`);

    return (
        <div className="container mt-5">
            <h2 className="mb-4 text-center">Skapa konto</h2>

            <div className="mb-3">
                <label className="form-label">Användarnamn</label>
                <input
                    type="text"
                    className="form-control"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                />
            </div>

            <div className="mb-3">
                <label className="form-label">Lösenord</label>
                <input
                    type="password"
                    className="form-control"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                />
            </div>

            <div className="mb-3">
                <label className="form-label">E-post</label>
                <input
                    type="email"
                    className="form-control"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                />
            </div>

            <div className="mb-3 text-center">
                <label className="form-label">Vald avatar</label><br />
                {avatar && (
                    <img
                        src={avatar}
                        alt="Vald avatar"
                        className="rounded-circle border border-primary border-3 mb-3"
                        style={{ width: "120px", height: "120px" }}
                    />
                )}
            </div>

            <div className="mb-3">
                <label className="form-label">Välj en avatar</label>
                <div className="avatar-scroll d-flex overflow-auto gap-3">
                    {avatarUrls.map((img, index) => (
                        <img
                            key={index}
                            src={img}
                            alt={`Avatar ${index + 1}`}
                            className={`rounded-circle avatar-option ${avatar === img ? "border border-primary border-3" : "border"
                                }`}
                            style={{ width: "80px", height: "80px", cursor: "pointer" }}
                            onClick={() => setAvatar(img)}
                        />
                    ))}
                </div>
            </div>

            <button className="btn btn-primary mt-3 w-100" onClick={handleRegister}>
                Registrera
            </button>
            <Link to="/login" className="btn btn-outline-secondary mt-2 w-100">
                Redan medlem? Logga in
            </Link>

            {message && <div className="alert alert-info mt-3">{message}</div>}
        </div>
    );

};

export default Register;
