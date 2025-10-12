import React, { useState, useEffect, useRef } from 'react';
import { geminiService } from '../../services/api'; 
import { useAuth } from '../../context/AuthContext'; 
import './styles/GeminiChat.css'; 

const GeminiChat = () => {
    const { user } = useAuth();
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);
    const [isOpen, setIsOpen] = useState(false); // NEW: State for open/close
    const messagesEndRef = useRef(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(scrollToBottom, [messages]);
    
    useEffect(() => {
        if (messages.length === 0) {
            setMessages([{ 
                sender: 'bot', 
                text: "Hello! I'm Sahay, your mental wellness assistant. How can I support you today?", 
                id: 1,
                role: 'model'
            }]);
        }
    }, [messages.length]); 

    const formatHistoryForApi = (currentMessages) => {
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
        
        const historyForApi = formatHistoryForApi(messages); 

        setMessages(prev => [...prev, userMessage]);
        setInput('');
        setLoading(true);

        try {
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
            {/* Floating Chat Button - Only shows when closed */}
            {!isOpen && (
                <button 
                    className="chat-toggle-btn"
                    onClick={() => setIsOpen(true)}
                >
                    💬 Sahay AI
                </button>
            )}

            {/* Chat Window - Only shows when open */}
            {isOpen && (
                <div className="chat-window">
                    <div className="chat-header">
                        <div className="header-content">
                            <h3>💬 Sahay AI Assistant</h3>
                            <button 
                                className="close-btn"
                                onClick={() => setIsOpen(false)}
                            >
                                ✕
                            </button>
                        </div>
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
            )}
        </div>
    );
};

export default GeminiChat;