import React, { useContext } from 'react';
import { Routes, Route, useNavigate, Navigate } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import Register from './components/Register';
import Login from './components/Login';
import Chat from './components/Chat';
import SideNav from './components/SideNav';
import UserManagement from './components/UserManagement';
import { AuthContext } from './contexts/AuthContext';
import ProtectedRoute from './ProtectedRoute';
import Profile from './components/Profile';
import './App.css';
import * as Sentry from '@sentry/react';

Sentry.init({
    dsn: "https://5b9d38718beafe5fc48541d85ea821e0@o4507792248012800.ingest.de.sentry.io/4507792251748432",
    integrations: [],
    tracesSampleRate: 1.0,
    replaysSessionSampleRate: 0.1,
    replaysOnErrorSampleRate: 1.0,
});

const App = () => {
    const { token } = useContext(AuthContext);
    const navigate = useNavigate();

    return (
        <div id="root" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
            {token && <SideNav />}
            <div className="main-content">
                <Routes>
                    <Route path="/" element={
                        <div style={{ textAlign: 'center' }}>
                            <h1>Please login or register.</h1>
                            <button className="btn btn-primary me-2" onClick={() => navigate('/login')}>Login</button>
                            <button className="btn btn-secondary" onClick={() => navigate('/register')}>Register</button>
                        </div>
                    } />
                    <Route path="/profile" element={<Profile />} />
                    <Route path="/register" element={<Register />} />
                    <Route path="/login" element={<Login />} />
                    <Route path="/user-management" element={<UserManagement />} />
                    <Route element={<ProtectedRoute />}>
                        <Route path="/chat" element={<Chat />} />
                    </Route>
                    <Route path="*" element={<Navigate to="/" />} />
                </Routes>
            </div>
            <ToastContainer />
        </div>
    );
};

export default App;
