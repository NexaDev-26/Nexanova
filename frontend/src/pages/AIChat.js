import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import api from '../utils/api';
import Navigation from '../components/Navigation';
import LoadingSpinner from '../components/LoadingSpinner';
import AITools from '../components/AITools';
import GuidedConversations from '../components/GuidedConversations';
import '../styles/AIChat.css';

const AIChat = () => {
  const { user } = useAuth();
  const { showToast } = useToast();
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [loadingHistory, setLoadingHistory] = useState(true);
  const [suggestions, setSuggestions] = useState([]);
  const [showTools, setShowTools] = useState(false);
  const [showGuided, setShowGuided] = useState(false);
  const [activeTool, setActiveTool] = useState(null);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    loadChatHistory();
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const loadChatHistory = async () => {
    setLoadingHistory(true);
    try {
      const response = await api.get('/chat/history');
      if (response.data.success) {
        const chats = response.data.chats || [];
        const formattedMessages = chats.flatMap(chat => [
          { type: 'user', text: chat.message },
          { type: 'ai', text: chat.response, suggestions: [] }
        ]);
        setMessages(formattedMessages);
        if (chats.length > 0) {
          showToast(`Loaded ${chats.length} previous conversation${chats.length > 1 ? 's' : ''}`, 'info');
        }
      }
    } catch (error) {
      console.error('Error loading chat history:', error);
      // Don't show error toast for history loading - it's not critical
    } finally {
      setLoadingHistory(false);
    }
  };

  const handleSend = async () => {
    if (!input.trim() || loading) return;

    const userMessage = input.trim();
    setInput('');
    setLoading(true);

    // Add user message
    const newUserMessage = { type: 'user', text: userMessage };
    setMessages(prev => [...prev, newUserMessage]);

    try {
      const response = await api.post('/chat', {
        message: userMessage,
        mood_score: user?.mood_score || 5,
        context: { path: user?.path }
      });

      if (response.data.success) {
        const aiMessage = {
          type: 'ai',
          text: response.data.response,
          suggestions: response.data.suggestions || []
        };
        setMessages(prev => [...prev, aiMessage]);
        setSuggestions(response.data.suggestions || []);
      }
    } catch (error) {
      console.error('Error sending message:', error);
      const errorMessage = error.response?.data?.message || 'Connection error';
      showToast(`Failed to send message: ${errorMessage}`, 'error');
      const errorAiMessage = {
        type: 'ai',
        text: 'I apologize, but I encountered an error. Please try again or check your connection.',
        suggestions: []
      };
      setMessages(prev => [...prev, errorAiMessage]);
    } finally {
      setLoading(false);
    }
  };

  const handleSuggestion = (suggestion) => {
    setInput(suggestion.text);
  };

  const handleToolSelect = (tool) => {
    setActiveTool(tool);
    setShowTools(false);
    
    // Generate appropriate message based on tool
    let toolMessage = '';
    switch(tool.id) {
      case 'breathing':
        toolMessage = 'Guide me through a 4-7-8 breathing exercise';
        break;
      case 'grounding':
        toolMessage = 'Help me with the 5-4-3-2-1 grounding technique';
        break;
      case 'mood-check':
        toolMessage = 'Let\'s do a mood check-in. How am I feeling?';
        break;
      case 'sleep':
        toolMessage = 'Tell me a relaxing sleep story';
        break;
      case 'meditation':
        toolMessage = 'Guide me through a 5-minute mindfulness meditation';
        break;
      case 'crisis':
        toolMessage = 'I need immediate support and resources';
        break;
      default:
        toolMessage = `Help me with ${tool.name.toLowerCase()}`;
    }
    
    setInput(toolMessage);
    setTimeout(() => handleSend(), 100);
  };

  const handleConversationStart = (prompt) => {
    setShowGuided(false);
    setInput(prompt);
    setTimeout(() => handleSend(), 100);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="ai-chat">
      <div className="container">
        <div className="chat-header">
          <h2>Chat with NeNo</h2>
          <p>Your private space to reflect and grow</p>
          <div className="header-actions">
            <button
              className={`header-btn ${showTools ? 'active' : ''}`}
              onClick={() => {
                setShowTools(!showTools);
                setShowGuided(false);
              }}
            >
              🛠️ Tools
            </button>
            <button
              className={`header-btn ${showGuided ? 'active' : ''}`}
              onClick={() => {
                setShowGuided(!showGuided);
                setShowTools(false);
              }}
            >
              💬 Guided
            </button>
          </div>
        </div>

        {showTools && (
          <AITools onToolSelect={handleToolSelect} />
        )}

        {showGuided && (
          <GuidedConversations onConversationStart={handleConversationStart} />
        )}

        <div className="messages-container">
          {loadingHistory ? (
            <LoadingSpinner size="medium" text="Loading your conversations..." />
          ) : messages.length === 0 ? (
            <div className="empty-chat">
              <div className="empty-icon">💬</div>
              <h3>Start a conversation</h3>
              <p>Share what's on your mind, and I'll be here to listen and guide you.</p>
            </div>
          ) : null}

          {messages.map((msg, idx) => (
            <div key={idx} className={`message ${msg.type}`}>
              <div className="message-content">
                {msg.type === 'ai' && <span className="ai-avatar">🌱</span>}
                <div className="message-text">{msg.text}</div>
              </div>
              {msg.suggestions && msg.suggestions.length > 0 && (
                <div className="suggestions">
                  {msg.suggestions.map((suggestion, sIdx) => (
                    <button
                      key={sIdx}
                      className="suggestion-btn"
                      onClick={() => handleSuggestion(suggestion)}
                    >
                      <span>{suggestion.icon}</span>
                      <span>{suggestion.text}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          ))}

          {loading && (
            <div className="message ai">
              <div className="message-content">
                <span className="ai-avatar">🌱</span>
                <div className="typing-indicator">
                  <span></span>
                  <span></span>
                  <span></span>
                </div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        <div className="chat-input-container">
          <div className="suggestions-bar">
            {suggestions.map((suggestion, idx) => (
              <button
                key={idx}
                className="quick-suggestion"
                onClick={() => handleSuggestion(suggestion)}
              >
                {suggestion.icon} {suggestion.text}
              </button>
            ))}
          </div>
          <div className="input-wrapper">
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Type your message..."
              rows="2"
              className="chat-input"
            />
            <button
              onClick={handleSend}
              disabled={!input.trim() || loading}
              className="send-btn"
            >
              ➤
            </button>
          </div>
        </div>
      </div>
      <Navigation />
    </div>
  );
};

export default AIChat;

