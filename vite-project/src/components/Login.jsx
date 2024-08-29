import React, { useState, useContext, useEffect } from 'react';
import { AuthContext } from '../contexts/AuthContext';
import { Link } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';
import { jwtDecode } from 'jwt-decode'; // Importerar jwtDecode för att dekoda JWT-token

const Login = () => {
    // State för att hantera användarnamn, lösenord och meddelanden
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [message, setMessage] = useState('');

    // Hämta värden och funktioner från AuthContext
    const { user, login, csrfToken, fetchCsrfToken } = useContext(AuthContext);

    // Effekt som körs när komponenten laddas för att hämta CSRF-token om den inte redan finns
    useEffect(() => {
        if (!csrfToken) {
            fetchCsrfToken();
        }
    }, [csrfToken, fetchCsrfToken]);

    // Funktion som hanterar inloggningsprocessen
    const handleLogin = async () => {
        try {
            // Skicka en POST-begäran till servern för att generera en JWT-token
            const response = await fetch(`${(process.env.VITE_BASE_URL || import.meta.env.VITE_BASE_URL)}/auth/token`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ username, password, csrfToken }),
            });

            const data = await response.json(); // Konvertera svaret till JSON

            // Om inloggningen misslyckas, visa ett felmeddelande
            if (!response.ok) {
                setMessage(data.error);
            } else {
                // Dekodera JWT-token för att extrahera användarinformation
                const decoded = jwtDecode(data.token);
                console.log('Decoded JWT:', decoded);

                // Skapa ett användarobjekt från den dekodade JWT:n
                const user = {
                    id: decoded.id,
                    username: decoded.user,
                    avatar: decoded.avatar,
                    email: decoded.email
                };
                console.log('Constructed User Object:', user);

                // Anropa login-funktionen för att spara användarens information och JWT-token
                login(user, data.token);
                setMessage('Login successful'); // Visa ett meddelande om att inloggningen lyckades
            }
        } catch (error) {
            console.error("Login error:", error);
            setMessage(error.message); // Visa ett felmeddelande om något går fel
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
                    onChange={(e) => setUsername(e.target.value)} // Uppdatera state när användaren skriver
                />
            </div>
            <div className="mb-3">
                <label htmlFor="password" className="form-label">Password</label>
                <input
                    type="password"
                    className="form-control"
                    id="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)} // Uppdaterar state när användaren skriver
                />
            </div>
            <button className="btn btn-primary" onClick={handleLogin}>Login</button>
            <Link to='/*' className="btn btn-success">Home</Link>
            {message && <div className="mt-3 alert alert-info">{message}</div>} {/* Visa ett meddelande om något finns i `message` */}

            {user && ( // Visa användarinformation om användaren är inloggad
                <div className="mt-5">
                    <h3>Logged in as: {user.username}</h3>
                    {user.avatar && <img src={user.avatar} alt="Avatar" style={{ width: '100px', height: '100px' }} />} {/* Visa användarens avatar om den finns */}
                </div>
            )}
        </div>
    );
};

export default Login;
