import React, { useState, useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../contexts/AuthContext';
import 'bootstrap/dist/css/bootstrap.min.css';

const Profile = () => {
    const { user, updateUser, deleteUser, logout } = useContext(AuthContext);
    const [form, setForm] = useState({ username: '', email: '', avatar: '' });
    const [msg, setMsg] = useState('');
    const navigate = useNavigate();

    useEffect(() => {
        if (user) {
            setForm({
                username: user.username || '',
                email: user.email || '',
                avatar: user.avatar || ''
            });
        }
    }, [user]);

    const handleChange = e => {
        setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const handleSave = async () => {
        try {
            const id = user?.id;
            if (!id) {
                setMsg('Ingen användare är inloggad.');
                return;
            }

            const updated = await updateUser({ id: user.id, ...form });
            console.log('Uppdaterad användare:', updated);

            setForm({
                username: updated.username || updated.user || '',
                email: updated.email || '',
                avatar: updated.avatar || '',
            });

            setMsg('Profil uppdaterad!');
        } catch (err) {
            console.error(err);
            setMsg('Fel vid uppdatering.');
        }
    };


    const handleDelete = async () => {
        if (window.confirm('Är du säker på att du vill ta bort ditt konto?')) {
            try {
                await deleteUser(user.id);
                logout();
                navigate('/login');
            } catch {
                setMsg('Fel vid radering.');
            }
        }
    };

    if (!user) return <div className="text-center mt-5">Du är inte inloggad.</div>;

    return (
        <div className="container py-5">
            <div className="card shadow-lg p-4 text-center">
                <h2 className="mb-4">
                    {form.username || 'Din profil'}
                </h2>

                <img
                    src={form.avatar || 'https://i.pravatar.cc/158?u=fallback'}
                    alt="avatar"
                    className="rounded-circle mb-3 border border-3 border-primary"
                    style={{ width: 120, height: 120, objectFit: 'cover' }}
                />

                <div className="mb-3">
                    <label className="form-label">Användarnamn</label>
                    <input
                        name="username"
                        className="form-control text-center"
                        value={form.username}
                        onChange={handleChange}
                    />
                </div>

                <div className="mb-3">
                    <label className="form-label">E-post</label>
                    <input
                        name="email"
                        type="email"
                        className="form-control text-center"
                        value={form.email}
                        onChange={handleChange}
                    />
                </div>

                <div className="mb-3">
                    <label className="form-label">Avatar-URL</label>
                    <input
                        name="avatar"
                        className="form-control text-center"
                        value={form.avatar}
                        onChange={handleChange}
                    />
                </div>

                <div className="d-grid gap-2 mt-4">
                    <button className="btn btn-outline-primary" onClick={handleSave}>
                        Uppdatera profil
                    </button>

                    <button className="btn btn-outline-danger" onClick={handleDelete}>
                        Radera konto
                    </button>

                    <button className="btn btn-secondary" onClick={logout}>
                        Logga ut
                    </button>
                </div>

                {msg && <div className="alert alert-info mt-3">{msg}</div>}
            </div>
        </div>
    );
};

export default Profile;
