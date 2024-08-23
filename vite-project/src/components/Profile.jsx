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
        <div className="profile-component">
            <div className="container mt-5">
                <div className="content">
                    <h2>Profile</h2>
                    {avatar && <img src={avatar} alt={`${username}'s avatar`} style={{ maxWidth: '100px', marginTop: '10px' }} />}
                    {/* Visar nuvarande avatar om den finns */}
                    <div className="mb-3">
                        <label htmlFor="username" className="form-label">Username</label>
                        <input
                            type="text"
                            className="form-control"
                            id="username"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)} // Uppdaterar användarnamnet i state när användaren skriver
                        />
                    </div>
                    <div className="mb-3">
                        <label htmlFor="email" className="form-label">Email</label>
                        <input
                            type="email"
                            className="form-control"
                            id="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)} // Uppdaterar e-postadressen i state när användaren skriver
                        />
                    </div>
                    <div className="mb-3">
                        <label htmlFor="avatar" className="form-label">Avatar URL</label>
                        <input
                            type="text"
                            className="form-control"
                            id="avatar"
                            value={newAvatar}
                            onChange={handleAvatarChange} // Uppdaterar avatar-URL:n i state när användaren skriver
                        />
                        {newAvatar && <img src={newAvatar} alt="New Avatar Preview" style={{ maxWidth: '100px', marginTop: '10px' }} />}
                        {/* Visar en förhandsvisning av den nya avatar-URL:n om den finns */}
                    </div>
                    <button className="btn btn-primary" onClick={handleUpdateUser}>Update Profile</button>
                    {/* Knappar för att uppdatera profilen */}
                    <button className="btn btn-danger mt-2" onClick={handleDeleteUser}>Delete Account</button>
                    {/* Knappar för att radera kontot */}
                    {message && <div className="alert alert-info mt-3">{message}</div>}
                    {/* Visar ett meddelande om det finns något */}
                </div>
            </div>
        </div>
    );
};

export default Profile;
