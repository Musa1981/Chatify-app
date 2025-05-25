import React, { useState, useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../contexts/AuthContext';
import 'bootstrap/dist/css/bootstrap.min.css';

const UserManagement = () => {
    const { fetchUser, updateUser, deleteUser, logout } = useContext(AuthContext);
    const [userId, setUserId] = useState('');
    const [user, setUser] = useState(null);
    const [formData, setFormData] = useState({ username: '', email: '', avatar: '' });
    const [message, setMessage] = useState('');
    const navigate = useNavigate();

    useEffect(() => {
        if (userId.trim()) {
            fetchUser(userId.trim())
                .then(data => {
                    setUser(data);
                    setFormData({
                        username: data.username || '',
                        email: data.email || '',
                        avatar: data.avatar || ''
                    });
                    setMessage('');
                })
                .catch(() => setMessage('Kunde inte hämta användaren.'));
        }
    }, [userId]);

    const handleChange = e => {
        setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const handleUpdate = () => {
        updateUser({ id: userId, ...formData })
            .then(data => {
                setUser(data);
                setMessage('Användare uppdaterad!');
            })
            .catch(() => setMessage('Fel vid uppdatering.'));
    };

    const handleDelete = () => {
        if (window.confirm('Är du säker på att du vill radera ditt konto?')) {
            deleteUser(userId)
                .then(() => {
                    logout();
                    navigate('/login');
                })
                .catch(() => setMessage('Fel vid borttagning.'));
        }
    };

    return (
        <div className="container py-5">
            <h2 className="mb-4 text-center">Användarhantering</h2>
            {message && <div className="alert alert-info text-center">{message}</div>}

            <div className="input-group mb-4">
                <input
                    type="text"
                    className="form-control"
                    placeholder="Ange användar-ID"
                    value={userId}
                    onChange={e => setUserId(e.target.value)}
                />
                <button className="btn btn-primary" onClick={() => setUserId(userId)}>
                    Hämta
                </button>
            </div>

            {user && (
                <div className="card shadow-sm">
                    <div className="row g-0">
                        <div className="col-md-4 d-flex align-items-center justify-content-center p-3 bg-light">
                            <img
                                src={formData.avatar || 'https://via.placeholder.com/150'}
                                alt="Avatar"
                                className="rounded-circle border border-3 border-primary"
                                style={{ width: '150px', height: '150px', objectFit: 'cover' }}
                            />
                        </div>
                        <div className="col-md-8 p-4">
                            <div className="mb-3">
                                <label className="form-label">Användarnamn</label>
                                <input
                                    type="text"
                                    name="username"
                                    className="form-control"
                                    value={formData.username}
                                    onChange={handleChange}
                                />
                            </div>
                            <div className="mb-3">
                                <label className="form-label">E-post</label>
                                <input
                                    type="email"
                                    name="email"
                                    className="form-control"
                                    value={formData.email}
                                    onChange={handleChange}
                                />
                            </div>
                            <div className="mb-3">
                                <label className="form-label">Avatar-URL</label>
                                <input
                                    type="text"
                                    name="avatar"
                                    className="form-control"
                                    value={formData.avatar}
                                    onChange={handleChange}
                                />
                            </div>
                            <div className="d-flex justify-content-end gap-2">
                                <button className="btn btn-success" onClick={handleUpdate}>
                                    Uppdatera
                                </button>
                                <button className="btn btn-danger" onClick={handleDelete}>
                                    Radera
                                </button>
                                <button className="btn btn-secondary" onClick={logout}>
                                    Logga ut
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default UserManagement;
