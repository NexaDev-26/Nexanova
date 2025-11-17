import React, { useState } from 'react';
import '../styles/AITools.css';

const AITools = ({ onToolSelect }) => {
  const [activeTool, setActiveTool] = useState(null);

  const tools = [
    {
      id: 'breathing',
      name: 'Breathing Exercise',
      icon: '🌬️',
      description: '4-7-8 breathing technique',
      duration: '2 min',
      color: '#3A7BFF'
    },
    {
      id: 'grounding',
      name: 'Grounding',
      icon: '🌍',
      description: '5-4-3-2-1 technique',
      duration: '3 min',
      color: '#8A5CFF'
    },
    {
      id: 'mood-check',
      name: 'Mood Check-in',
      icon: '💭',
      description: 'Quick emotional assessment',
      duration: '1 min',
      color: '#56E0E0'
    },
    {
      id: 'sleep',
      name: 'Sleep Story',
      icon: '🌙',
      description: 'Relaxing bedtime story',
      duration: '10 min',
      color: '#FFB84C'
    },
    {
      id: 'meditation',
      name: 'Meditation',
      icon: '🧘',
      description: 'Mindfulness practice',
      duration: '5 min',
      color: '#4CD4A9'
    },
    {
      id: 'crisis',
      name: 'Crisis Support',
      icon: '🆘',
      description: 'Immediate help resources',
      duration: 'Instant',
      color: '#EF4444'
    }
  ];

  const handleToolClick = (tool) => {
    setActiveTool(tool.id);
    onToolSelect(tool);
  };

  return (
    <div className="ai-tools">
      <div className="tools-header">
        <h3>Quick Tools</h3>
        <p>Evidence-based techniques to help you feel better</p>
      </div>
      <div className="tools-grid">
        {tools.map(tool => (
          <button
            key={tool.id}
            className={`tool-card ${activeTool === tool.id ? 'active' : ''}`}
            onClick={() => handleToolClick(tool)}
            style={{ '--tool-color': tool.color }}
          >
            <div className="tool-icon">{tool.icon}</div>
            <div className="tool-info">
              <h4>{tool.name}</h4>
              <p>{tool.description}</p>
              <span className="tool-duration">{tool.duration}</span>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
};

export default AITools;

