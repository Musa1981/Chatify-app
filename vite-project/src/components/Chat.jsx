import React, { useState, useEffect, useContext, useRef } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import DOMPurify from 'dompurify';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { AuthContext } from '../contexts/AuthContext';

const BASE_URL = import.meta.env.VITE_BASE_URL;

/* ---------- ladda avatar-cache från localStorage ---------- */
const loadCache = () => {
    try { return JSON.parse(localStorage.getItem('avatarCache') || '{}'); }
    catch { return {}; }
};

const Chat = () => {
    const { user, token, csrfToken, logout } = useContext(AuthContext);

    const [messages, setMessages] = useState([]);
    const [newMsg, setNewMsg] = useState('');
    const [error, setError] = useState('');
    const avatarCache = useRef(loadCache());

    /* ---------- hjälpare ---------- */
    const storeAvatar = (id, url) => {
        avatarCache.current[id] = url;
        localStorage.setItem('avatarCache', JSON.stringify(avatarCache.current));
    };

    const getAvatar = async (userId) => {
        if (avatarCache.current[userId]) return avatarCache.current[userId];
        try {
            const res = await fetch(`${BASE_URL}/users/${userId}`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            const data = res.ok ? await res.json() : {};
            const url = data.avatar || 'https://i.pravatar.cc/158?img=66';
            storeAvatar(userId, url);
            return url;
        } catch {
            const fallback = 'https://i.pravatar.cc/158?img=66';
            storeAvatar(userId, fallback);
            return fallback;
        }
    };

    /* ---------- hämta historik ---------- */
    const fetchMessages = async () => {
        try {
            const res = await fetch(`${BASE_URL}/messages`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (res.status === 401) { logout(); return; }
            if (!res.ok) throw new Error(await res.text());

            const raw = await res.json();
            const enriched = await Promise.all(
                raw.map(async m => ({
                    ...m,
                    avatar: m.userId === user.id ? user.avatar : await getAvatar(m.userId)
                }))
            );
            setMessages(enriched.reverse());
        } catch (err) {
            console.error(err);
            setError('Kunde inte hämta meddelanden.');
        }
    };

    useEffect(() => { fetchMessages(); }, []);   // en gång vid mount

    /* ---------- skicka meddelande ---------- */
    const sendMessage = async () => {
        if (!newMsg.trim()) return;
        try {
            const res = await fetch(`${BASE_URL}/messages`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                    'X-CSRF-Token': csrfToken,
                },
                body: JSON.stringify({ text: newMsg }),
            });
            if (res.status === 401) { logout(); return; }
            if (!res.ok) throw new Error(await res.text());

            const { latestMessage } = await res.json();
            setMessages(prev => [
                ...prev,
                { ...latestMessage, avatar: user.avatar }
            ]);
            setNewMsg('');
        } catch (err) {
            console.error(err);
            toast.error('Kunde inte skicka meddelandet.');
        }
    };

    /* ---------- radera meddelande ---------- */
    const deleteMessage = async (id) => {
        try {
            const res = await fetch(`${BASE_URL}/messages/${id}`, {
                method: 'DELETE',
                headers: {
                    Authorization: `Bearer ${token}`,
                    'X-CSRF-Token': csrfToken,
                },
            });
            if (!res.ok) throw new Error(await res.text());
            setMessages(prev => prev.filter(m => m.id !== id));
        } catch (err) {
            console.error(err);
            toast.error('Kunde inte radera meddelandet.');
        }
    };

    /* ---------- render ---------- */
    return (
        <div className="container py-4">
            <div className="card shadow rounded" style={{ maxHeight: '70vh', overflowY: 'auto' }}>
                <div className="card-body d-flex flex-column">
                    {messages.map(m => {
                        const isMine = m.userId === user.id;
                        const avatar = m.avatar || (isMine ? user.avatar : 'https://i.pravatar.cc/158?img=66');
                        return (
                            <div key={m.id}
                                className={`d-flex mb-3 ${isMine ? 'flex-row-reverse' : ''}`}>
                                {/* avatar */}
                                <img src={avatar}
                                    alt="avatar"
                                    className={isMine ? 'rounded-circle ms-2' : 'rounded-circle me-2'}
                                    style={{ width: 32, height: 32, objectFit: 'cover' }} />
                                {/* bubbla */}
                                <div className={`p-3 rounded-pill shadow-sm ${isMine ? 'bg-primary text-white' : 'bg-light text-dark'}`}
                                    style={{ maxWidth: '75%' }}>
                                    <div dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(m.text) }} />
                                </div>
                                {/* radera-ikon för egna meddelanden */}
                                {isMine && (
                                    <button onClick={() => deleteMessage(m.id)}
                                        className="btn btn-sm btn-link text-danger ms-1"
                                        title="Radera">
                                        ✖
                                    </button>
                                )}
                            </div>
                        );
                    })}
                    {error && <p className="text-danger">{error}</p>}
                </div>
            </div>

            {/* fält + knapp */}
            <form className="mt-3 d-flex" onSubmit={e => { e.preventDefault(); sendMessage(); }}>
                <input type="text"
                    className="form-control me-2"
                    placeholder="Skriv ett meddelande…"
                    value={newMsg}
                    onChange={e => setNewMsg(e.target.value)} />
                <button type="submit" className="btn btn-primary">Skicka</button>
            </form>
        </div>
    );
};

export default Chat;
