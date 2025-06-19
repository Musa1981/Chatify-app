import React, { useState, useContext } from 'react';
import { AuthContext } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';

/* deterministic fallback avatar */
const fallbackAvatar = id => `https://i.pravatar.cc/158?u=${id}`;

const UserManagement = () => {
    const { user: me, token, fetchUser, updateUser, deleteUser, logout } =
        useContext(AuthContext);

    const [searchId, setSearchId] = useState('');
    const [target, setTarget] = useState(null);   // the user we look up
    const [form, setForm] = useState({ username: '', email: '', avatar: '' });
    const [msg, setMsg] = useState('');
    const navigate = useNavigate();

    /* helpers */
    const flash = txt => {
        setMsg(txt);
        setTimeout(() => setMsg(''), 3000);
    };

    const handleLookup = async () => {
        if (!searchId.trim()) return flash('Ange ett ID');
        try {
            const data = await fetchUser(searchId.trim());
            setTarget(data);
            setForm({
                username: data.username || '',
                email: data.email || '',
                avatar: data.avatar || fallbackAvatar(data.id)
            });
            flash('');
        } catch {
            flash('Kunde inte hämta användaren.');
            setTarget(null);
        }
    };

    const handleChange = e =>
        setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));

    const handleUpdate = async () => {
        try {
            const updated = await updateUser({ id: target.id, ...form });
            setTarget(updated);
            flash('Användare uppdaterad!');
            /* If you updated yourself, sync avatar in localStorage */
            if (updated.id === me.id) {
                localStorage.setItem(
                    'user',
                    JSON.stringify({ ...me, avatar: updated.avatar })
                );
            }
        } catch {
            flash('Fel vid uppdatering.');
        }
    };

    const handleDelete = async () => {
        if (
            window.confirm(
                target.id === me.id
                    ? 'Radera DITT konto?'
                    : `Radera användare ${target.username}?`
            )
        ) {
            try {
                await deleteUser(target.id);
                flash('Användare raderad.');
                setTarget(null);
                if (target.id === me.id) {
                    logout();
                    navigate('/login');
                }
            } catch {
                flash('Fel vid borttagning.');
            }
        }
    };

    return (
        <div className="container py-5">
            <h2 className="mb-4 text-center">Användar­hantering</h2>

            {msg && <div className="alert alert-info text-center">{msg}</div>}

            {/* lookup */}
            <form
                className="input-group mb-4"
                onSubmit={e => {
                    e.preventDefault();
                    handleLookup();
                }}
            >
                <input
                    className="form-control"
                    placeholder="Ange användar-ID"
                    value={searchId}
                    onChange={e => setSearchId(e.target.value)}
                />
                <button type="submit" className="btn btn-primary">
                    Hämta
                </button>
            </form>

            {/* user card */}
            {target && (
                <div className="card shadow-sm">
                    <div className="row g-0">
                        <div className="col-md-4 d-flex align-items-center justify-content-center p-3 bg-light">
                            <img
                                src={form.avatar || fallbackAvatar(target.id)}
                                alt="Avatar"
                                className="rounded-circle border border-3 border-primary"
                                style={{ width: 150, height: 150, objectFit: 'cover' }}
                            />
                        </div>
                        <div className="col-md-8 p-4">
                            <div className="mb-3">
                                <label className="form-label">Användarnamn</label>
                                <input
                                    name="username"
                                    className="form-control"
                                    value={form.username}
                                    onChange={handleChange}
                                />
                            </div>
                            <div className="mb-3">
                                <label className="form-label">E-post</label>
                                <input
                                    name="email"
                                    type="email"
                                    className="form-control"
                                    value={form.email}
                                    onChange={handleChange}
                                />
                            </div>
                            <div className="mb-3">
                                <label className="form-label">Avatar-URL</label>
                                <input
                                    name="avatar"
                                    className="form-control"
                                    value={form.avatar}
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
