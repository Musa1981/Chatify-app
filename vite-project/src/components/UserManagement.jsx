import React, { useState, useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../contexts/AuthContext';


const UserManagement = () => {
    const { fetchUser, updateUser, deleteUser, logout } = useContext(AuthContext);
    const [user, setUser] = useState(null);
    const [userId, setUserId] = useState('');
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [avatar, setAvatar] = useState('');
    const [message, setMessage] = useState('');
    const navigate = useNavigate();

    useEffect(() => {
        if (userId) {
            fetchUser(userId).then(data => {
                setUser(data);
                setUsername(data.username || '');
                setEmail(data.email || '');
                setAvatar(data.avatar || '');
            }).catch(error => {
                console.error('Error fetching user:', error);
                setMessage('Error fetching user.');
            });
        }
    }, [userId, fetchUser]);

    const handleUpdateUser = () => {
        const updatedUser = { id: userId };
        if (username) updatedUser.username = username;
        if (email) updatedUser.email = email;
        if (avatar) updatedUser.avatar = avatar;

        updateUser(updatedUser).then(data => {
            setMessage('User updated successfully.');
            setUser(data);
            setUsername('');
            setEmail('');
            setAvatar('');
        }).catch(error => {
            setMessage('Error updating user.');
            console.error('Error updating user:', error);
        });
    };

    const handleDeleteUser = () => {
        const confirmDeletion = window.confirm('Are you sure you want to delete your account? This action cannot be undone.');
        if (confirmDeletion) {
            deleteUser(userId).then(data => {
                setMessage('User deleted successfully.');
                logout();
                navigate('/login');
            }).catch(error => {
                setMessage('Error deleting user.');
                console.error('Error deleting user:', error);
            });
        }
    };

    return (
        <div className="container">
            <h2>User Management</h2>
            {message && <div className="alert alert-info">{message}</div>}
            <div className="mb-3">
                <input
                    type="text"
                    className="form-control"
                    placeholder="User ID"
                    value={userId}
                    onChange={e => setUserId(e.target.value)}
                />
                <button className="btn btn-primary" onClick={() => fetchUser(userId)}>Fetch User</button>
            </div>
            {user && (
                <div className="mb-3">
                    <h3>{user.username}</h3>
                    <input
                        type="text"
                        className="form-control"
                        placeholder="New Username"
                        value={username}
                        onChange={e => setUsername(e.target.value)}
                    />
                    <input
                        type="email"
                        className="form-control"
                        placeholder="New Email"
                        value={email}
                        onChange={e => setEmail(e.target.value)}
                    />
                    <input
                        type="text"
                        className="form-control"
                        placeholder="New Avatar URL"
                        value={avatar}
                        onChange={e => setAvatar(e.target.value)}
                    />
                    {avatar && <img src={avatar} alt="Avatar Preview" style={{ maxWidth: '100px', marginTop: '10px' }} />}
                    <button className="btn btn-success me-2" onClick={handleUpdateUser}>Update User</button>
                    <button className="btn btn-danger" onClick={handleDeleteUser}>Delete User</button>
                </div>
            )}
        </div>
    );
};

export default UserManagement; 
