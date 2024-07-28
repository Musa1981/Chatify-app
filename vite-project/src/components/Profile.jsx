import React, { useEffect, useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../contexts/AuthContext';
import 'bootstrap/dist/css/bootstrap.min.css';

const Profile = () => {
    const { user, updateUser, deleteUser, logout } = useContext(AuthContext);
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [avatar, setAvatar] = useState('');
    const [newAvatar, setNewAvatar] = useState('');
    const [message, setMessage] = useState('');
    const navigate = useNavigate();

    useEffect(() => {
        if (user) {
            console.log('User object:', user);
            setUsername(user.username || '');
            setEmail(user.email || '');
            setAvatar(user.avatar || '');
        } else {
            console.warn('No user found in context');
        }
    }, [user]);

    const handleUpdateUser = async () => {

        const updatedData = {
            id: user.id,
            username: username || user.username,
            email: email || user.email,
            avatar: newAvatar || avatar
        };

        console.log('Updating user with data:', updatedData);

        try {
            await updateUser(updatedData);
            setMessage('User updated successfully.');
        } catch (error) {
            console.error('Error updating user:', error);
            setMessage('Error updating user.');
        }
    };

    const handleDeleteUser = async () => {
        if (!user || !user.id) {
            setMessage('User not logged in or user ID is missing');
            console.error('User not logged in or user ID is missing', user);
            return;
        }

        const confirmDeletion = window.confirm('Are you sure you want to delete your account? This action cannot be undone.');
        if (confirmDeletion) {
            console.log('Deleting user with ID:', user.id);

            try {
                await deleteUser(user.id);
                setMessage('User deleted successfully.');
                logout();
                navigate('/login');
            } catch (error) {
                console.error('Error deleting user:', error);
                setMessage('Error deleting user.');
            }
        }
    };

    const handleAvatarChange = (e) => {
        setNewAvatar(e.target.value);
    };

    return (
        <div className="profile-component">
            <div className="container mt-5">
                <div className="content">
                    <h2>Profile</h2>
                    {avatar && <img src={avatar} alt={`${username}'s avatar`} style={{ maxWidth: '100px', marginTop: '10px' }} />}
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
                            value={newAvatar}
                            onChange={handleAvatarChange}
                        />
                        {newAvatar && <img src={newAvatar} alt="New Avatar Preview" style={{ maxWidth: '100px', marginTop: '10px' }} />}
                    </div>
                    <button className="btn btn-primary" onClick={handleUpdateUser}>Update Profile</button>
                    <button className="btn btn-danger mt-2" onClick={handleDeleteUser}>Delete Account</button>
                    {message && <div className="alert alert-info mt-3">{message}</div>}
                </div>
            </div>
        </div>
    );
};

export default Profile;
