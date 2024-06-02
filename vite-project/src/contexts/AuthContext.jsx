import React, { createContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [token, setToken] = useState(localStorage.getItem('token'));
    const [user, setUser] = useState(() => {
        try {
            const storedUser = localStorage.getItem('user');
            return storedUser ? JSON.parse(storedUser) : null;
        } catch (error) {
            console.error('Error parsing user data from localStorage:', error);
            return null;
        }
    });
    const [csrfToken, setCsrfToken] = useState(sessionStorage.getItem('csrf'));
    const navigate = useNavigate();

    useEffect(() => {
        if (token) {
            localStorage.setItem('token', token);
            localStorage.setItem('user', JSON.stringify(user));
        } else {
            localStorage.removeItem('token');
            localStorage.removeItem('user');
        }
    }, [token, user]);

    const fetchCsrfToken = async () => {
        try {
            const response = await fetch(`${import.meta.env.VITE_BASE_URL}/csrf`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                },
            });
            if (!response.ok) throw new Error('Failed to fetch CSRF token');
            const data = await response.json();
            setCsrfToken(data.csrfToken);
            sessionStorage.setItem('csrf', data.csrfToken);
            console.log("CSRF Token fetched:", data.csrfToken);
        } catch (error) {
            console.error("Error fetching CSRF token:", error);
        }
    };

    const login = (user, token) => {
        setToken(token);
        setUser(user);
        navigate('/chat');
    };

    const logout = () => {
        setToken(null);
        setUser(null);
        navigate('/login');
    };

    useEffect(() => {
        fetchCsrfToken();
    }, []);

    return (
        <AuthContext.Provider value={{ token, user, csrfToken, login, logout, fetchCsrfToken }}>
            {children}
        </AuthContext.Provider>
    );
};
