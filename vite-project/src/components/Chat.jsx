import React, { useState, useEffect, useContext } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import { AuthContext } from '../contexts/AuthContext';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import DOMPurify from 'dompurify';

const Chat = () => {
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const [error, setError] = useState('');
    const [conversationId, setConversationId] = useState('');
    const [inviteUserId, setInviteUserId] = useState('');
    const { user, token, csrfToken, logout } = useContext(AuthContext);

    const fetchMessages = async () => {
        const url = conversationId ? `${import.meta.env.VITE_BASE_URL}/messages?conversationId=${conversationId}`
            : `${import.meta.env.VITE_BASE_URL}/messages`;
        try {
            const response = await fetch(url, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
            });
            if (!response.ok) throw new Error('Failed to fetch messages');
            const data = await response.json();
            setMessages(data.reverse());
        } catch (error) {
            console.error("Error fetching messages:", error);
            setError("Failed to fetch messages");
        }
    };

    useEffect(() => {
        if (user && token) {
            console.log("User object:", user);
            if (user.invites && user.invites.length > 0) {
                setConversationId(user.invites[0]);
            }
            fetchMessages();
        }
    }, [user, token]);

    const handleCreateMessage = async () => {
        try {
            if (!newMessage.trim()) {
                setError("Message cannot be empty");
                return;
            }

            const sanitizedMessage = DOMPurify.sanitize(newMessage);

            const response = await fetch(`${import.meta.env.VITE_BASE_URL}/messages`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ text: sanitizedMessage, conversationId: conversationId })
            });

            if (!response.ok) {
                throw new Error('Failed to create message');
            }

            const data = await response.json();
            toast.success('Server responded: ' + data.message);

            fetchMessages();
            setNewMessage('');
            setError('');

        } catch (err) {
            console.error("Error creating message:", err);
            toast.error('Failed to create message. Please try again.');
            setError("Failed to create message");
        }
    };

    const handleDeleteMessage = async (msgId) => {
        try {
            const response = await fetch(`${import.meta.env.VITE_BASE_URL}/messages/${msgId}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'X-CSRF-Token': csrfToken,
                },
            });

            if (!response.ok) {
                throw new Error('Failed to delete message');
            }

            setMessages(messages.filter(msg => msg.id !== msgId));
        } catch (error) {
            console.error("Error deleting message:", error);
            setError("Failed to delete message");
        }
    };

    const handleInviteUser = async () => {
        try {
            if (!inviteUserId.trim()) {
                setError("User ID cannot be empty");
                return;
            }

            const conversationId = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, c => (c === 'x' ? Math.floor(Math.random() * 16) : (Math.floor(Math.random() * 4) + 8)).toString(16));
            const response = await fetch(`${import.meta.env.VITE_BASE_URL}/invite/${inviteUserId}`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ conversationId: conversationId })
            });

            if (!response.ok) {
                throw new Error('Failed to send invite');
            }

            toast.success('Invitation sent successfully!');
            setInviteUserId('');
            setError('');

        } catch (error) {
            console.error("Error sending invite:", error);
            toast.error('Failed to send invitation. Please try again.');
            setError("Failed to send invitation");
        }
    };

    return (
        <div className="chat-component">
            <div className="container mt-5" style={{ position: 'relative', maxWidth: '100%' }}>
                <h2>Chat</h2>
                <div className="mb-3">
                    <div className="input-group mb-3">
                        <input
                            type="text"
                            className="form-control"
                            value={conversationId}
                            onChange={(e) => setConversationId(e.target.value)}
                            placeholder="Enter Conversation ID"
                        />
                        <div className="input-group-append">
                            <button
                                disabled={!/^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/.test(conversationId)}
                                onClick={fetchMessages}
                                className="btn btn-primary mt-2"
                                style={{ borderRadius: '0' }}
                                type="button"
                            >
                                Update chat 💬
                            </button>
                        </div>
                    </div>

                    <input
                        type="text"
                        className="form-control mt-2"
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        placeholder="Type your message..."
                    />
                    <button className="btn btn-primary mt-2" onClick={handleCreateMessage}>Send</button>
                    <input
                        type="text"
                        className="form-control mt-2"
                        value={inviteUserId}
                        onChange={(e) => setInviteUserId(e.target.value)}
                        placeholder="Enter User ID to invite..."
                    />
                    <button className="btn btn-success mt-2" onClick={handleInviteUser}>Invite</button>
                    {error && <div className="alert alert-danger mt-2">{error}</div>}
                </div>
                <ul className="list-group">
                    {messages.map(msg => (
                        <li
                            key={msg.id}
                            className={`list-group-item d-flex ${msg.userId === user.id ? 'justify-content-end' : 'justify-content-start'} align-items-center`}
                            style={{
                                textAlign: msg.userId === user.id ? 'right' : 'left',
                                backgroundColor: msg.userId === user.id ? '#d1e7dd' : '#f8d7da',
                                borderRadius: '10px',
                                marginBottom: '10px',
                                maxWidth: '85%',
                                alignSelf: msg.userId === user.id ? 'flex-end' : 'flex-start',
                            }}
                        >
                            {msg.userId !== user.id && (
                                <img
                                    src={msg.avatar || '/default-avatar.png'}
                                    alt="Avatar"
                                    className="rounded-circle mr-2"
                                    style={{ width: '40px', height: '40px' }}
                                />
                            )}
                            <span>{msg.text}</span>
                            {msg.userId === user.id && (
                                <>
                                    <img
                                        src={user.avatar || '/default-avatar.png'}
                                        alt="Avatar"
                                        className="rounded-circle ml-2"
                                        style={{ width: '40px', height: '40px' }}
                                    />
                                    <button className="btn btn-danger ml-2" onClick={() => handleDeleteMessage(msg.id)}>Delete</button>
                                </>
                            )}
                        </li>
                    ))}
                </ul>
            </div>
        </div>
    );
};

export default Chat;

