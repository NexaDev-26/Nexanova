import React, { useState } from 'react';
import '../styles/GuidedConversations.css';

const GuidedConversations = ({ onConversationStart }) => {
  const [expandedCategory, setExpandedCategory] = useState(null);

  const conversations = {
    'CBT Techniques': [
      {
        id: 'thought-challenge',
        title: 'Challenge Negative Thoughts',
        icon: '💭',
        description: 'Identify and reframe unhelpful thinking patterns',
        prompt: 'Help me challenge a negative thought I\'m having'
      },
      {
        id: 'behavior-activation',
        title: 'Behavior Activation',
        icon: '🚀',
        description: 'Plan activities to improve your mood',
        prompt: 'Help me plan activities that will boost my mood'
      },
      {
        id: 'problem-solving',
        title: 'Problem Solving',
        icon: '🧩',
        description: 'Break down problems into manageable steps',
        prompt: 'Help me solve a problem I\'m facing'
      }
    ],
    'DBT Skills': [
      {
        id: 'mindfulness',
        title: 'Mindfulness Practice',
        icon: '🧘',
        description: 'Stay present and aware',
        prompt: 'Guide me through a mindfulness exercise'
      },
      {
        id: 'emotion-regulation',
        title: 'Emotion Regulation',
        icon: '🎭',
        description: 'Understand and manage your emotions',
        prompt: 'Help me understand and regulate my emotions'
      },
      {
        id: 'distress-tolerance',
        title: 'Distress Tolerance',
        icon: '🛡️',
        description: 'Cope with difficult moments',
        prompt: 'Help me cope with a difficult situation right now'
      }
    ],
    'Self-Care': [
      {
        id: 'gratitude',
        title: 'Gratitude Practice',
        icon: '🙏',
        description: 'Focus on what you\'re thankful for',
        prompt: 'Help me practice gratitude'
      },
      {
        id: 'self-compassion',
        title: 'Self-Compassion',
        icon: '💚',
        description: 'Be kind to yourself',
        prompt: 'Help me practice self-compassion'
      },
      {
        id: 'values-clarification',
        title: 'Values Clarification',
        icon: '⭐',
        description: 'Identify what matters most to you',
        prompt: 'Help me clarify my values and priorities'
      }
    ]
  };

  const handleConversationClick = (conversation) => {
    onConversationStart(conversation.prompt);
  };

  const toggleCategory = (category) => {
    setExpandedCategory(expandedCategory === category ? null : category);
  };

  return (
    <div className="guided-conversations">
      <div className="conversations-header">
        <h3>Guided Conversations</h3>
        <p>Evidence-based techniques to work through challenges</p>
      </div>
      <div className="conversations-list">
        {Object.entries(conversations).map(([category, items]) => (
          <div key={category} className="conversation-category">
            <button
              className="category-header"
              onClick={() => toggleCategory(category)}
            >
              <span>{category}</span>
              <span className="expand-icon">
                {expandedCategory === category ? '▼' : '▶'}
              </span>
            </button>
            {expandedCategory === category && (
              <div className="category-items">
                {items.map(item => (
                  <button
                    key={item.id}
                    className="conversation-item"
                    onClick={() => handleConversationClick(item)}
                  >
                    <span className="item-icon">{item.icon}</span>
                    <div className="item-content">
                      <h4>{item.title}</h4>
                      <p>{item.description}</p>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default GuidedConversations;

