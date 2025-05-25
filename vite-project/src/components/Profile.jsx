import React, { useEffect, useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../contexts/AuthContext';
import 'bootstrap/dist/css/bootstrap.min.css';

const Profile = () => {
    const { user, updateUser, deleteUser, logout } = useContext(AuthContext);
    const [username, setUsername] = useState(''); // Håller användarnamnet i state
    const [email, setEmail] = useState(''); // Håller e-postadressen i state
    const [avatar, setAvatar] = useState(''); // Håller nuvarande avatar-URL i state
    const [newAvatar, setNewAvatar] = useState(''); // Håller ny avatar-URL i state om användaren ändrar den
    const [message, setMessage] = useState(''); // Håller meddelanden till användaren (ex. om uppdatering eller fel)
    const navigate = useNavigate(); // Används för att navigera användaren mellan olika sidor

    // useEffect används för att extrahera och sätta användardata från JWT-token när komponenten laddas
    useEffect(() => {
        const decodedJwt = JSON.parse(atob(localStorage.getItem('token').split('.')[1].replace(/-/g, '+').replace(/_/g, '/')));
        setUsername(decodedJwt.user || ''); // Sätter användarnamnet från JWT-token
        setEmail(decodedJwt.email || ''); // Sätter e-postadressen från JWT-token
        setAvatar(decodedJwt.avatar || ''); // Sätter avatar-URL från JWT-token
    }, []);

    // Funktion för att hantera uppdatering av användarens profil
    const handleUpdateUser = async () => {
        const updatedData = {
            id: user.id, // Användarens ID
            username: username || user.username, // Användarnamn, använder det aktuella om inget nytt anges
            email: email || user.email, // E-postadress, använder den aktuella om ingen ny anges
            avatar: newAvatar || avatar // Avatar-URL, använder den aktuella om ingen ny anges
        };

        console.log('Updating user with data:', updatedData); // Loggar uppdaterad data för felsökning

        try {
            await updateUser(updatedData); // Försöker uppdatera användarens information
            setMessage('User updated successfully.'); // Sätter ett meddelande om att uppdateringen lyckades
        } catch (error) {
            console.error('Error updating user:', error); // Loggar eventuellt fel
            setMessage('Error updating user.'); // Sätter ett felmeddelande om uppdateringen misslyckades
        }
    };

    // Funktion för att hantera radering av användarens konto
    const handleDeleteUser = async () => {
        if (!user || !user.id) { // Kontrollerar att användaren är inloggad och har ett ID
            setMessage('User not logged in or user ID is missing');
            console.error('User not logged in or user ID is missing', user); // Loggar felet om användaren inte är inloggad
            return;
        }

        const confirmDeletion = window.confirm('Are you sure you want to delete your account? This action cannot be undone.');
        // Visar en bekräftelseprompt för användaren innan kontot raderas
        if (confirmDeletion) {
            console.log('Deleting user with ID:', user.id); // Loggar användarens ID för radering

            try {
                await deleteUser(user.id); // Försöker radera användarens konto
                setMessage('User deleted successfully.'); // Sätter ett meddelande om att raderingen lyckades
                logout(); // Loggar ut användaren efter radering
                navigate('/login'); // Navigerar användaren till inloggningssidan
            } catch (error) {
                console.error('Error deleting user:', error); // Loggar eventuellt fel
                setMessage('Error deleting user.'); // Sätter ett felmeddelande om raderingen misslyckades
            }
        }
    };

    // Funktion för att hantera ändringar av avatar-URL:n
    const handleAvatarChange = (e) => {
        setNewAvatar(e.target.value); // Sätter den nya avatar-URL:n baserat på användarens input
    };

    return (
        <div className="container py-5">
            <div className="card shadow-lg p-4 text-center">
                <h2 className="mb-4">Din profil</h2>

                {avatar && (
                    <img
                        src={avatar}
                        alt="Profilbild"
                        className="rounded-circle mb-3 border border-3 border-primary"
                        style={{ width: "120px", height: "120px", objectFit: "cover" }}
                    />
                )}

                <div className="mb-3">
                    <label className="form-label">Användarnamn</label>
                    <input
                        type="text"
                        className="form-control text-center"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                    />
                </div>

                <div className="mb-3">
                    <label className="form-label">E-post</label>
                    <input
                        type="email"
                        className="form-control text-center"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                    />
                </div>

                <div className="mb-3">
                    <label className="form-label">Uppdatera avatar</label>
                    <input
                        type="text"
                        className="form-control text-center"
                        value={newAvatar}
                        onChange={(e) => setNewAvatar(e.target.value)}
                        placeholder="Klistra in ny avatar-URL här"
                    />
                </div>

                <div className="d-grid gap-2 mt-4">
                    <button
                        className="btn btn-outline-primary"
                        onClick={() => updateUser(username, email, newAvatar || avatar)}
                    >
                        Uppdatera profil
                    </button>

                    <button
                        className="btn btn-outline-danger"
                        onClick={() => {
                            if (window.confirm("Vill du verkligen ta bort ditt konto?")) {
                                deleteUser();
                                navigate('/');
                            }
                        }}
                    >
                        Radera konto
                    </button>

                    <button className="btn btn-secondary" onClick={logout}>
                        Logga ut
                    </button>
                </div>

                {message && <div className="alert alert-info mt-3">{message}</div>}
            </div>
        </div>
    );

};

export default Profile;
