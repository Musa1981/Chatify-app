import React, { createContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

// Skapar en Context för autentisering som kan användas i hela applikationen.
export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    // State för att lagra JWT-token från localStorage.
    const [token, setToken] = useState(localStorage.getItem('token'));

    // State för att lagra användaruppgifter. Försöker hämta och parsa användardata från localStorage.
    const [user, setUser] = useState(() => {
        try {
            const storedUser = localStorage.getItem('user');
            console.log("Stored User:", storedUser);
            return storedUser && storedUser !== "undefined" ? JSON.parse(storedUser) : null;
        } catch (error) {
            console.error('Error parsing user data from localStorage:', error);
            return null;
        }
    });

    // State för att lagra CSRF-token från sessionStorage.
    const [csrfToken, setCsrfToken] = useState(sessionStorage.getItem('csrf'));

    // Används för att navigera mellan olika rutter.
    const navigate = useNavigate();

    // Effekt som körs när `token` eller `user` ändras, för att uppdatera localStorage med den senaste informationen.
    useEffect(() => {
        if (token) {
            localStorage.setItem('token', token);
            if (user) {
                localStorage.setItem('user', JSON.stringify(user));
                console.log("User saved to localStorage:", user);
            }
        } else {
            localStorage.removeItem('token');
            localStorage.removeItem('user');
        }
    }, [token, user]);

    // Funktion för att hämta CSRF-token från servern och lagra den i sessionStorage.
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

    // Funktion för att logga in användaren, uppdatera state och lagra användarens information i localStorage.
    const login = (user, token) => {
        if (!user.id) {
            console.error("User object is missing 'id' field:", user);
            throw new Error("User object is missing 'id' field.");
        }

        setToken(token);
        setUser(user);
        localStorage.setItem('user', JSON.stringify(user));
        localStorage.setItem('token', token);
        navigate('/chat');  // Navigerar användaren till chattsidan efter inloggning.
    };

    // Funktion för att logga ut användaren, rensa state och ta bort användarens information från localStorage.
    const logout = () => {
        setToken(null);
        setUser(null);
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        navigate('/login');  // Navigerar användaren till inloggningssidan efter utloggning.
    };

    // Funktion för att registrera en ny användare.
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

    // Funktion för att generera en JWT-token vid inloggning.
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

    // Funktion för att hämta användaruppgifter från servern baserat på användar-ID.
    const fetchUser = async (userId) => {
        try {
            const BASE_URL = import.meta.env.VITE_BASE_URL;
            const response = await fetch(`${BASE_URL}/users/${userId}`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
            });
            if (!response.ok) throw new Error('Failed to fetch user');

            const data = await response.json();

            // Om data är en array, returnera första elementet
            const user = Array.isArray(data) ? data[0] : data;

            console.log('Fetched user:', user);
            return user;
        } catch (error) {
            console.error("Error fetching user:", error);
            throw error;
        }
    };


    // Funktion för att uppdatera användaruppgifter på servern.
    const BASE_URL = import.meta.env.VITE_BASE_URL;

    const updateUser = async (payload) => {
        const res = await fetch(`${BASE_URL}/user`, {
            method: 'PUT',
            headers: {
                Authorization: `Bearer ${token}`,
                'Content-Type': 'application/json',
                'X-CSRF-Token': csrfToken,
            },
            body: JSON.stringify({
                userId: payload.id,
                updatedData: payload,
            }),
        });

        if (!res.ok) throw new Error(await res.text());

        const data = await res.json();


        let updated =
            Array.isArray(data) ? data[0] :
                data.updatedUser ? data.updatedUser :
                    data.user ? data.user :
                        null;

        if (!updated || !updated.username) {
            updated = await fetchUser(payload.id);
        }

        setUser(updated);
        localStorage.setItem('user', JSON.stringify(updated));

        return updated;
    };



    // Funktion för att radera en användare från servern baserat på användar-ID.
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

    // Effekt som körs när komponenten laddas för att hämta CSRF-token.
    useEffect(() => {
        fetchCsrfToken();
    }, []);

    // Tillhandahåller all autentiseringsrelaterad state och funktioner till komponentens barn.
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
