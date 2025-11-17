import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import AIChatPopup from './AIChatPopup';
import '../styles/FloatingAIChat.css';

const FloatingAIChat = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  if (!isAuthenticated) {
    return null;
  }

  const handleToggle = () => {
    setIsOpen(!isOpen);
  };

  const handleClose = () => {
    setIsOpen(false);
  };

  return (
    <>
      <button
        className={`floating-ai-button ${isOpen ? 'active' : ''}`}
        onClick={handleToggle}
        aria-label="Open AI Chat"
        title="Chat with NeNo"
      >
        <span className="ai-button-icon">💬</span>
        {isOpen && <span className="ai-button-close">✕</span>}
      </button>
      
      {isOpen && (
        <AIChatPopup onClose={handleClose} />
      )}
    </>
  );
};

export default FloatingAIChat;

