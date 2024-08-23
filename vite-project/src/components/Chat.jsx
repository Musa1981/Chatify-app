import React, { useState, useEffect, useContext } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import { AuthContext } from '../contexts/AuthContext'; // Importerar AuthContext för att hantera autentisering och användarinformation
import { toast } from 'react-toastify'; // Importerar toast för att visa notifieringar
import 'react-toastify/dist/ReactToastify.css';
import DOMPurify from 'dompurify'; // Importerar DOMPurify för att sanera användarinmatning

const Chat = () => {
    // State för att hantera meddelanden, nytt meddelande, felmeddelanden, samtals-ID och inbjudan av användare
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const [error, setError] = useState('');
    const [conversationId, setConversationId] = useState('');
    const [inviteUserId, setInviteUserId] = useState('');

    // Hämta nödvändiga värden och funktioner från AuthContext
    const { user, token, csrfToken, logout } = useContext(AuthContext);

    // Funktion för att hämta meddelanden från servern
    const fetchMessages = async () => {
        // Dynamiskt skapa URL baserat på om ett samtals-ID är tillgängligt
        const url = conversationId ? `${(process.env.VITE_BASE_URL || import.meta.env.VITE_BASE_URL)}/messages?conversationId=${conversationId}`
            : `${(process.env.VITE_BASE_URL || import.meta.env.VITE_BASE_URL)}/messages`;
        try {
            const response = await fetch(url, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`, // Lägg till JWT-token i begäran
                },
            });
            if (!response.ok) throw new Error('Failed to fetch messages');
            const data = await response.json();
            setMessages(data.reverse()); // Uppdatera meddelanden i state och vänd ordningen
        } catch (error) {
            console.error("Error fetching messages:", error);
            setError("Failed to fetch messages"); // Sätt felmeddelande om något går fel
        }
    };

    // useEffect som körs när komponenten laddas eller när användar- eller token-information ändras
    useEffect(() => {
        if (user && token) {
            console.log("User object:", user);
            if (user.invites && user.invites.length > 0) {
                setConversationId(user.invites[0]); // Sätt samtals-ID om användaren har inbjudningar
            }
            fetchMessages(); // Hämta meddelanden
        }
    }, [user, token]);

    // Funktion för att skicka ett nytt meddelande
    const handleCreateMessage = async () => {
        try {
            if (!newMessage.trim()) {
                setError("Message cannot be empty"); // Kontrollera att meddelandet inte är tomt
                return;
            }

            const sanitizedMessage = DOMPurify.sanitize(newMessage); // Sanera meddelandet för att undvika XSS-attacker

            const response = await fetch(`${(process.env.VITE_BASE_URL || import.meta.env.VITE_BASE_URL)}/messages`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`, // Lägg till JWT-token i begäran
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ text: sanitizedMessage, conversationId: conversationId }) // Skicka meddelande och samtals-ID till servern
            });

            if (!response.ok) {
                throw new Error('Failed to create message');
            }

            const data = await response.json();
            toast.success('Server responded: ' + data.message); // Visa notifiering om meddelandet lyckades skickas

            fetchMessages(); // Uppdatera meddelanden
            setNewMessage(''); // Rensa textfältet för meddelande
            setError('');

        } catch (err) {
            console.error("Error creating message:", err);
            toast.error('Failed to create message. Please try again.');
            setError("Failed to create message"); // Sätt felmeddelande om något går fel
        }
    };

    // Funktion för att ta bort ett meddelande
    const handleDeleteMessage = async (msgId) => {
        try {
            const response = await fetch(`${(process.env.VITE_BASE_URL || import.meta.env.VITE_BASE_URL)}/messages/${msgId}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`, // Lägg till JWT-token i begäran
                    'X-CSRF-Token': csrfToken, // Lägg till CSRF-token i begäran
                },
            });

            if (!response.ok) {
                throw new Error('Failed to delete message');
            }

            setMessages(messages.filter(msg => msg.id !== msgId)); // Uppdatera meddelandelistan genom att filtrera bort det borttagna meddelandet
        } catch (error) {
            console.error("Error deleting message:", error);
            setError("Failed to delete message"); // Sätt felmeddelande om något går fel
        }
    };

    // Funktion för att bjuda in en annan användare till en konversation
    const handleInviteUser = async () => {
        try {
            if (!inviteUserId.trim()) {
                setError("User ID cannot be empty"); // Kontrollera att användar-ID inte är tomt
                return;
            }

            // Skapa ett unikt samtals-ID
            const conversationId = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, c => (c === 'x' ? Math.floor(Math.random() * 16) : (Math.floor(Math.random() * 4) + 8)).toString(16));
            const response = await fetch(`${(process.env.VITE_BASE_URL || import.meta.env.VITE_BASE_URL)}/invite/${inviteUserId}`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`, // Lägg till JWT-token i begäran
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ conversationId: conversationId }) // Skicka inbjudan med samtals-ID till servern
            });

            if (!response.ok) {
                throw new Error('Failed to send invite');
            }

            toast.success('Invitation sent successfully!'); // Visa notifiering om inbjudan lyckades skickas
            setInviteUserId(''); // Rensa textfältet för användar-ID
            setError('');

        } catch (error) {
            console.error("Error sending invite:", error);
            toast.error('Failed to send invitation. Please try again.');
            setError("Failed to send invitation"); // Sätt felmeddelande om något går fel
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
                            onChange={(e) => setConversationId(e.target.value)} // Uppdatera state för samtals-ID
                            placeholder="Enter Conversation ID"
                        />
                        <div className="input-group-append">
                            <button
                                disabled={!/^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/.test(conversationId)} // Kontrollera att samtals-ID är i rätt format
                                onClick={fetchMessages} // Uppdatera meddelandelistan
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
                        onChange={(e) => setNewMessage(e.target.value)} // Uppdatera state för nytt meddelande
                        placeholder="Type your message..."
                    />
                    <button className="btn btn-primary mt-2" onClick={handleCreateMessage}>Send</button> {/* Skicka meddelande */}
                    <input
                        type="text"
                        className="form-control mt-2"
                        value={inviteUserId}
                        onChange={(e) => setInviteUserId(e.target.value)} // Uppdatera state för inbjudan
                        placeholder="Enter User ID to invite..."
                    />
                    <button className="btn btn-success mt-2" onClick={handleInviteUser}>Invite</button> {/* Skicka inbjudan */}
                    {error && <div className="alert alert-danger mt-2">{error}</div>} {/* Visa felmeddelande om något är fel */}
                </div>
                <ul className="list-group">
                    {messages.map(msg => (
                        <li
                            key={msg.id}
                            className={`list-group-item d-flex ${msg.userId === user.id ? 'justify-content-end' : 'justify-content-start'} align-items-center`}
                            style={{
                                textAlign: msg.userId === user.id ? 'right' : 'left',
                                backgroundColor: msg.userId === user.id ? '#d1e7dd' : '#f8d7da', // Anpassa bakgrundsfärgen baserat på vem som skickat meddelandet
                                borderRadius: '10px',
                                marginBottom: '10px',
                                maxWidth: '85%',
                                alignSelf: msg.userId === user.id ? 'flex-end' : 'flex-start',
                            }}
                        >
                            {msg.userId !== user.id && (
                                <img
                                    src={msg.avatar || '/default-avatar.png'} // Visa avatar om meddelandet inte skickats av den inloggade användaren
                                    alt="Avatar"
                                    className="rounded-circle mr-2"
                                    style={{ width: '40px', height: '40px' }}
                                />
                            )}
                            <span>{msg.text}</span>
                            {msg.userId === user.id && ( // Visa radera-knappen och avatar om meddelandet skickats av den inloggade användaren
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
