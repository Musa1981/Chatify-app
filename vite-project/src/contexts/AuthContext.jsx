import React, { createContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [token, setToken] = useState(localStorage.getItem('token'));
    const [user, setUser] = useState(() => {
        try {
            const storedUser = localStorage.getItem('user');
            console.log("Stored User:", storedUser); // Log user from localStorage
            return storedUser && storedUser !== "undefined" ? JSON.parse(storedUser) : null;
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
            if (user) {
                localStorage.setItem('user', JSON.stringify(user));
                console.log("User saved to localStorage:", user); // Log user save to localStorage
            }
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
        console.log("Logging in with user:", user); // Log user at login
        setToken(token);
        setUser(user);
        localStorage.setItem('user', JSON.stringify(user));
        localStorage.setItem('token', token);
        navigate('/chat');
    };

    const logout = () => {
        setToken(null);
        setUser(null);
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        navigate('/login');
    };

    const registerUser = async (username, password) => {
        try {
            const response = await fetch(`${import.meta.env.VITE_BASE_URL}/auth/register`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ username, password }),
            });
            if (!response.ok) throw new Error('Failed to register user');
            return response.json();
        } catch (error) {
            console.error("Error registering user:", error);
            throw error;
        }
    };

    const generateToken = async (username, password) => {
        try {
            const response = await fetch(`${import.meta.env.VITE_BASE_URL}/auth/token`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ username, password }),
            });
            if (!response.ok) throw new Error('Failed to generate token');
            const data = await response.json();
            setToken(data.token);
            return data;
        } catch (error) {
            console.error("Error generating token:", error);
            throw error;
        }
    };

    const fetchUser = async (userId) => {
        try {
            const response = await fetch(`${import.meta.env.VITE_BASE_URL}/users/${userId}`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
            });
            if (!response.ok) throw new Error('Failed to fetch user');
            return response.json();
        } catch (error) {
            console.error("Error fetching user:", error);
            throw error;
        }
    };

    const updateUser = async (user) => {
        try {
            const response = await fetch(`${import.meta.env.VITE_BASE_URL}/user`, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    userId: user.id,
                    updatedData: user
                }),
            });
            if (!response.ok) throw new Error('Failed to update user');
            const updatedUser = await response.json();
            setUser(updatedUser);
            localStorage.setItem('user', JSON.stringify(updatedUser));  // Update localStorage
            console.log("User updated in localStorage:", updatedUser); // Log updated user
            return updatedUser;
        } catch (error) {
            console.error("Error updating user:", error);
            throw error;
        }
    };

    const deleteUser = async (userId) => {
        try {
            const response = await fetch(`${import.meta.env.VITE_BASE_URL}/users/${userId}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'X-CSRF-Token': csrfToken,
                },
            });
            if (!response.ok) throw new Error('Failed to delete user');
            return response.json();
        } catch (error) {
            console.error("Error deleting user:", error);
            throw error;
        }
    };

    useEffect(() => {
        fetchCsrfToken();
    }, []);

    return (
        <AuthContext.Provider value={{
            token,
            user,
            csrfToken,
            login,
            logout,
            fetchCsrfToken,
            registerUser,
            generateToken,
            fetchUser,
            updateUser,
            deleteUser,
        }}>
            {children}
        </AuthContext.Provider>
    );
};
