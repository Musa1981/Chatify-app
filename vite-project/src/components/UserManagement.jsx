import React, { useState, useContext, useEffect } from 'react';
import { AuthContext } from '../contexts/AuthContext';

const UserManagement = () => {
    const { fetchUser, updateUser, deleteUser } = useContext(AuthContext);
    const [user, setUser] = useState(null);
    const [userId, setUserId] = useState('');
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');

    useEffect(() => {
        if (userId) {
            fetchUser(userId).then(data => setUser(data));
        }
    }, [userId, fetchUser]);

    const handleUpdateUser = () => {
        const updatedUser = { id: userId, username, password };
        updateUser(updatedUser).then(data => {
            console.log('User updated:', data);
        }).catch(error => {
            console.error('Error updating user:', error);
        });
    };

    const handleDeleteUser = () => {
        deleteUser(userId).then(data => {
            console.log('User deleted:', data);
        }).catch(error => {
            console.error('Error deleting user:', error);
        });
    };

    return (
        <div className="container">
            <h2>User Management</h2>
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
                        type="password"
                        className="form-control"
                        placeholder="New Password"
                        value={password}
                        onChange={e => setPassword(e.target.value)}
                    />
                    <button className="btn btn-success me-2" onClick={handleUpdateUser}>Update User</button>
                    <button className="btn btn-danger" onClick={handleDeleteUser}>Delete User</button>
                </div>
            )}
        </div>
    );
};

export default UserManagement;
