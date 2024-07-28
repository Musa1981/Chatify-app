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
    const { user, token, csrfToken, logout } = useContext(AuthContext);

    const fetchMessages = async () => {
        try {
            const response = await fetch(`${import.meta.env.VITE_BASE_URL}/messages`, {
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
        if (token) {
            fetchMessages();
            console.log("User object:", user);
        }
    }, [token]);

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
                    'Authorization': 'Bearer ' + token,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ text: sanitizedMessage, conversationId: null })
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
            toast.error(JSON.stringify(err));
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

    return (
        <div className="container mt-5" style={{ position: 'relative' }}>
            <h2>Chat</h2>
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
                        className="list-group-item d-flex justify-content-between align-items-center"
                    >
                        <span>{msg.text}</span>
                        <button className="btn btn-danger" onClick={() => handleDeleteMessage(msg.id)}>Delete</button>
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default Chat;
