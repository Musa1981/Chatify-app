import React, { useContext } from 'react';
import { Routes, Route, useNavigate, Navigate } from 'react-router-dom';
import { ToastContainer } from 'react-toastify'; // För att visa toast-meddelanden
import Register from './components/Register';
import Login from './components/Login';
import Chat from './components/Chat';
import SideNav from './components/SideNav';
import UserManagement from './components/UserManagement';
import { AuthContext } from './contexts/AuthContext'; // För att få tillgång till autentiseringsinformation
import ProtectedRoute from './ProtectedRoute'; // Anpassad komponent för skyddade rutter
import Profile from './components/Profile';
import './App.css';
import * as Sentry from '@sentry/react'; // För felspårning och övervakning

// Initiera Sentry för att övervaka fel och prestanda i applikationen
Sentry.init({
    dsn: "https://5b9d38718beafe5fc48541d85ea821e0@o4507792248012800.ingest.de.sentry.io/4507792251748432", // Ditt Sentry DSN
    integrations: [],
    tracesSampleRate: 1.0, // Hur mycket av trafiken som ska spåras (1.0 = 100%)
    replaysSessionSampleRate: 0.1, // Andel sessioner som ska spelas in
    replaysOnErrorSampleRate: 1.0, // Andel fel som ska spelas in
});

const App = () => {
    const { token } = useContext(AuthContext); // Hämta token från AuthContext för att kontrollera om användaren är inloggad
    const navigate = useNavigate(); // Hook för att programmatisk navigering

    return (
        <div id="root" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
            {token && <SideNav />} {/* Om användaren är inloggad, visa sidomenyn */}
            <div className="main-content">
                <Routes>
                    {/* Rutt för hemsidan, uppmanar användaren att logga in eller registrera sig */}
                    <Route path="/" element={
                        <div style={{ textAlign: 'center' }}>
                            <h1>Please login or register.</h1>
                            <button className="btn btn-primary me-2" onClick={() => navigate('/login')}>Login</button>
                            <button className="btn btn-secondary" onClick={() => navigate('/register')}>Register</button>
                        </div>
                    } />
                    {/* Rutterna för olika sidor i applikationen */}
                    <Route path="/profile" element={<Profile />} />
                    <Route path="/register" element={<Register />} />
                    <Route path="/login" element={<Login />} />
                    <Route path="/user-management" element={<UserManagement />} />

                    {/* Skyddad rutt för chatten, som kräver att användaren är inloggad */}
                    <Route element={<ProtectedRoute />}>
                        <Route path="/chat" element={<Chat />} />
                    </Route>

                    {/* Navigerar till hemsidan om användaren försöker nå en icke-existerande rutt */}
                    <Route path="*" element={<Navigate to="/" />} />
                </Routes>
            </div>
            <ToastContainer /> {/* Container för att visa toast-meddelanden */}
        </div>
    );
};

export default App;
