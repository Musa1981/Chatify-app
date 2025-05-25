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

    useEffect(() => {
        fetchMessages();
    }, [conversationId]);

    const fetchMessages = async () => {
        const url = conversationId
            ? `${(process.env.VITE_BASE_URL || import.meta.env.VITE_BASE_URL)}/messages?conversationId=${conversationId}`
            : `${(process.env.VITE_BASE_URL || import.meta.env.VITE_BASE_URL)}/messages`;
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
            setError("Failed to fetch messages.");
        }
    };

    const handleSendMessage = async () => {
        if (!newMessage.trim()) return;

        const url = `${(process.env.VITE_BASE_URL || import.meta.env.VITE_BASE_URL)}/messages`;
        try {
            const response = await fetch(url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                    'X-CSRF-TOKEN': csrfToken,
                },
                body: JSON.stringify({ text: newMessage, conversationId }),
            });

            if (!response.ok) throw new Error('Failed to send message');
            const sentMessage = await response.json();
            setMessages([...messages, sentMessage]);
            setNewMessage('');
        } catch (error) {
            console.error("Error sending message:", error);
            toast.error("Kunde inte skicka meddelandet.");
        }
    };

    return (
        <div className="container py-4">
            <div className="card shadow rounded" style={{ maxHeight: '70vh', overflowY: 'auto' }}>
                <div className="card-body d-flex flex-column">
                    {messages.map((msg, index) => (
                        <div
                            key={index}
                            className={`d-flex mb-3 ${msg.sender === user?.id ? 'justify-content-end' : 'justify-content-start'}`}
                        >
                            <div
                                className={`p-3 rounded-pill shadow-sm fade show ${msg.sender === user?.id ? 'bg-primary text-white' : 'bg-light text-dark'
                                    }`}
                                style={{ maxWidth: '75%' }}
                            >
                                <div dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(msg.text) }} />
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            <form
                className="mt-3 d-flex"
                onSubmit={(e) => {
                    e.preventDefault();
                    handleSendMessage();
                }}
            >
                <input
                    type="text"
                    className="form-control me-2"
                    placeholder="Skriv ett meddelande..."
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                />
                <button type="submit" className="btn btn-primary">Skicka</button>
            </form>
        </div>
    );
};

export default Chat;
