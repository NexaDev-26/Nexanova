import React, { useState } from 'react';
import '../styles/JournalPrompts.css';

const JournalPrompts = ({ onSelectPrompt }) => {
  const [selectedCategory, setSelectedCategory] = useState('all');

  const prompts = {
    gratitude: [
      "What are three things you're grateful for today?",
      "Who made a positive impact on your day?",
      "What small moment brought you joy today?",
      "What challenge are you grateful for because it made you stronger?",
      "What are you grateful for in your current situation?"
    ],
    reflection: [
      "What did you learn about yourself today?",
      "How did you grow today?",
      "What would you tell your past self?",
      "What patterns do you notice in your thoughts?",
      "What's one thing you'd do differently?"
    ],
    goals: [
      "What progress did you make toward your goals today?",
      "What's one step you can take tomorrow toward your dream?",
      "What obstacles are you facing, and how can you overcome them?",
      "What does success look like to you?",
      "What habits are helping you reach your goals?"
    ],
    emotions: [
      "How are you feeling right now, and why?",
      "What emotion do you want to feel more of?",
      "What triggered your strongest emotion today?",
      "How do you handle difficult emotions?",
      "What makes you feel most alive?"
    ],
    growth: [
      "What's one thing you're proud of yourself for?",
      "How have you changed in the last month?",
      "What skill would you like to develop?",
      "What advice would you give to someone facing your challenges?",
      "What's your biggest strength?"
    ],
    african: [
      "Haba na haba hujaza kibaba - What small steps are you taking?",
      "Mvumilivu hula mbivu - What are you being patient about?",
      "Kupanda mlima huanza na hatua moja - What's your first step?",
      "Juhudi zako hazitakosa matokeo - What efforts are you making?",
      "Pamoja tunaweza - Who supports you in your journey?"
    ]
  };

  const categories = [
    { id: 'all', label: 'All', icon: '📝' },
    { id: 'gratitude', label: 'Gratitude', icon: '🙏' },
    { id: 'reflection', label: 'Reflection', icon: '🤔' },
    { id: 'goals', label: 'Goals', icon: '🎯' },
    { id: 'emotions', label: 'Emotions', icon: '💭' },
    { id: 'growth', label: 'Growth', icon: '🌱' },
    { id: 'african', label: 'African Wisdom', icon: '🌍' }
  ];

  const getFilteredPrompts = () => {
    if (selectedCategory === 'all') {
      return Object.values(prompts).flat();
    }
    return prompts[selectedCategory] || [];
  };

  const handlePromptClick = (prompt) => {
    if (onSelectPrompt) {
      onSelectPrompt(prompt);
    }
  };

  return (
    <div className="journal-prompts">
      <div className="prompts-header">
        <h4>💡 Journal Prompts</h4>
        <p>Get inspired with these writing prompts</p>
      </div>

      <div className="prompt-categories">
        {categories.map(category => (
          <button
            key={category.id}
            className={`category-btn ${selectedCategory === category.id ? 'active' : ''}`}
            onClick={() => setSelectedCategory(category.id)}
          >
            <span className="category-icon">{category.icon}</span>
            <span className="category-label">{category.label}</span>
          </button>
        ))}
      </div>

      <div className="prompts-list">
        {getFilteredPrompts().map((prompt, index) => (
          <button
            key={index}
            className="prompt-item"
            onClick={() => handlePromptClick(prompt)}
          >
            <span className="prompt-text">{prompt}</span>
            <span className="prompt-icon">→</span>
          </button>
        ))}
      </div>
    </div>
  );
};

export default JournalPrompts;

