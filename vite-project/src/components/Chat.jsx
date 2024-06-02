import React, { useState, useEffect, useContext } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import { AuthContext } from '../contexts/AuthContext';

const Chat = () => {
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const [error, setError] = useState('');
    const { user, token, logout } = useContext(AuthContext);

    useEffect(() => {
        const fetchMessages = async () => {
            try {
                const response = await fetch(`${import.meta.env.VITE_BASE_URL}/messages`, {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                    },
                });

                if (!response.ok) throw new Error('Failed to fetch messages');

                const data = await response.json();
                setMessages(data);
            } catch (error) {
                console.error("Error fetching messages:", error);
                setError("Failed to fetch messages");
            }
        };

        if (token) {
            fetchMessages();
        }
    }, [token]);

    const handleCreateMessage = async () => {
        try {
            const response = await fetch(`${import.meta.env.VITE_BASE_URL}/messages`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
                body: JSON.stringify({ content: newMessage }),
            });

            if (!response.ok) {
                throw new Error('Failed to create message');
            }

            const createdMessage = await response.json();
            setMessages([...messages, createdMessage]);
            setNewMessage('');
        } catch (error) {
            console.error("Error creating message:", error);
            setError("Failed to create message");
        }
    };

    const handleDeleteMessage = async (msgId) => {
        try {
            const response = await fetch(`${import.meta.env.VITE_BASE_URL}/messages/${msgId}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`,
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

    return (
        <div className="container mt-5">
            <h2>Chat</h2>
            <button className="btn btn-secondary mb-3" onClick={logout}>Logout</button>
            <div className="mb-3">
                <input
                    type="text"
                    className="form-control"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder="Type your message..."
                />
                <button className="btn btn-primary mt-2" onClick={handleCreateMessage}>Send</button>
                {error && <div className="alert alert-danger mt-2">{error}</div>}
            </div>
            <ul className="list-group">
                {messages.map(msg => (
                    <li
                        key={msg.id}
                        className={`list-group-item d-flex justify-content-between align-items-center ${msg.user === user.username ? 'text-right' : 'text-left'}`}
                    >
                        <span>{msg.user}: {msg.content}</span>
                        {msg.user === user.username && (
                            <button className="btn btn-danger" onClick={() => handleDeleteMessage(msg.id)}>Delete</button>
                        )}
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default Chat;
