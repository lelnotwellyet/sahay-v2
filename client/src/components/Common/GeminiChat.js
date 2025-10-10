import React, { useState, useEffect, useRef } from 'react';
// FIX 1: Corrected path to navigate from components/Common/ to services/
import { geminiService } from '../../services/api'; 
// FIX 2: Corrected path to navigate from components/Common/ to context/
import { useAuth } from '../../context/AuthContext'; 
// FIX 3: Local styles path is correct
import './styles/GeminiChat.css'; 

const GeminiChat = () => {
    const { user } = useAuth();
    // Chat history stores objects like { sender: 'user'/'bot', text: 'message', role: 'user'/'model' }
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);
    const messagesEndRef = useRef(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(scrollToBottom, [messages]);
    
    // Initial welcome message from Sahay
    useEffect(() => {
        // Only set initial message if the chat is empty
        if (messages.length === 0) {
            setMessages([{ 
                sender: 'bot', 
                text: "Hello! I'm Sahay, your mental wellness assistant. How can I support you today?", 
                id: 1,
                role: 'model'
            }]);
        }
    }, [messages.length]); 

    // Formats client-side message objects into the structure required by the Gemini API
    const formatHistoryForApi = (currentMessages) => {
        // We filter out the initial welcome message if it was the only thing there
        return currentMessages
            .filter(msg => msg.role === 'user' || msg.role === 'model')
            .map(msg => ({
                role: msg.sender === 'user' ? 'user' : 'model',
                parts: [{ text: msg.text }]
            }));
    };

    const handleSend = async (e) => {
        e.preventDefault();
        if (!input.trim() || loading) return;

        const userMessageText = input.trim();
        const userMessage = { sender: 'user', text: userMessageText, id: Date.now(), role: 'user' };
        
        // Use history BEFORE adding the userMessage for the network call
        const historyForApi = formatHistoryForApi(messages); 

        // Optimistically update the UI 
        setMessages(prev => [...prev, userMessage]);
        setInput('');
        setLoading(true);

        try {
            // Send the new message along with the history
            const response = await geminiService.sendMessage(userMessageText, historyForApi);

            if (response.data.success) {
                const botMessage = { 
                    sender: 'bot', 
                    text: response.data.response, 
                    id: Date.now() + 1,
                    role: 'model'
                };
                setMessages(prev => [...prev, botMessage]);
            } else {
                 setMessages(prev => [...prev, { sender: 'bot', text: `Error: ${response.data.message}`, id: Date.now() + 1, role: 'model' }]);
            }

        } catch (error) {
            console.error('Chat error:', error);
            setMessages(prev => [...prev, { sender: 'bot', text: 'Sorry, I am having trouble connecting right now.', id: Date.now() + 1, role: 'model' }]);
        } finally {
            setLoading(false);
        }
    };
    
    const anonymousName = user?.anonymousName || 'Client';

    return (
        <div className="gemini-chat-container">
            <div className="chat-header">
                <h2>💬 Sahay AI Assistant</h2>
                <p>Welcome, {anonymousName}. Your mental wellness companion.</p>
            </div>
            
            <div className="chat-messages">
                {messages.map((msg) => (
                    <div 
                        key={msg.id} 
                        className={`chat-bubble ${msg.sender}`}
                    >
                        <strong>{msg.sender === 'user' ? 'You' : 'Sahay'}:</strong> {msg.text}
                    </div>
                ))}
                {loading && (
                    <div className="chat-bubble bot loading">
                        <div className="loading-dots">
                            <span></span><span></span><span></span>
                        </div>
                    </div>
                )}
                <div ref={messagesEndRef} />
            </div>

            <form onSubmit={handleSend} className="chat-input-form">
                <input
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="Type your message..."
                    disabled={loading}
                />
                <button type="submit" disabled={loading || !input.trim()}>
                    {loading ? 'Sending...' : 'Send'}
                </button>
            </form>
        </div>
    );
};

export default GeminiChat;
