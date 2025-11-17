import React, { useState } from 'react';
import { soundEffects } from '../utils/soundEffects';
import '../styles/JournalTemplates.css';

const JournalTemplates = ({ onSelectTemplate }) => {
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [expandedTemplate, setExpandedTemplate] = useState(null);

  const templates = {
    all: [
      {
        id: 'gratitude',
        title: 'Gratitude Journal',
        icon: '🙏',
        category: 'gratitude',
        description: 'Reflect on what you\'re grateful for today',
        prompts: [
          'What are three things you\'re grateful for today?',
          'Who made a positive impact on your day?',
          'What small moment brought you joy?',
          'What challenge taught you something valuable?'
        ],
        template: `Today I'm grateful for:

1. 
2. 
3. 

Reflection: `
      },
      {
        id: 'reflection',
        title: 'Daily Reflection',
        icon: '🤔',
        category: 'reflection',
        description: 'Review your day and learn from it',
        prompts: [
          'What went well today?',
          'What could have gone better?',
          'What did you learn about yourself?',
          'How did you grow today?'
        ],
        template: `Today's Reflection:

What went well:
- 

What could improve:
- 

Key learning: `
      },
      {
        id: 'mood',
        title: 'Mood Exploration',
        icon: '💭',
        category: 'mood',
        description: 'Explore and understand your emotions',
        prompts: [
          'How am I feeling right now?',
          'What triggered these emotions?',
          'What do I need right now?',
          'How can I support myself?'
        ],
        template: `Mood Check-In:

Current feeling: 
Intensity (1-10): 

What's causing this feeling:
- 

What I need:
- 

Self-care action: `
      },
      {
        id: 'goals',
        title: 'Goal Progress',
        icon: '🎯',
        category: 'goals',
        description: 'Track progress toward your goals',
        prompts: [
          'What progress did I make today?',
          'What obstacles did I face?',
          'What will I do differently tomorrow?',
          'How am I celebrating small wins?'
        ],
        template: `Goal Progress Update:

Goal: 
Progress today:
- 

Challenges faced:
- 

Tomorrow's plan:
- 

Celebration: `
      },
      {
        id: 'dreams',
        title: 'Dreams & Aspirations',
        icon: '✨',
        category: 'dreams',
        description: 'Explore your dreams and future vision',
        prompts: [
          'What do I dream of achieving?',
          'What would my ideal life look like?',
          'What steps am I taking toward my dreams?',
          'What\'s holding me back?'
        ],
        template: `Dreams & Aspirations:

My biggest dream: 

Why this matters to me:

Steps I'm taking:
1. 
2. 
3. 

What's holding me back:

How I'll overcome it: `
      },
      {
        id: 'relationships',
        title: 'Relationships',
        icon: '💕',
        category: 'relationships',
        description: 'Reflect on your connections with others',
        prompts: [
          'Who did I connect with today?',
          'How did I show care to someone?',
          'What relationship needs attention?',
          'What boundaries do I need to set?'
        ],
        template: `Relationship Reflection:

Connections today:
- 

How I showed care:
- 

Relationship needing attention:

Boundaries to set:

Gratitude for relationships: `
      },
      {
        id: 'self-care',
        title: 'Self-Care Check-In',
        icon: '💚',
        category: 'self-care',
        description: 'Assess your self-care practices',
        prompts: [
          'How did I care for myself today?',
          'What do I need more of?',
          'What boundaries did I set?',
          'How can I be kinder to myself?'
        ],
        template: `Self-Care Check-In:

Self-care activities today:
- 

What I need more of:
- 

Boundaries I set:
- 

How I'll be kinder to myself:

Affirmation: `
      },
      {
        id: 'challenges',
        title: 'Challenge Reflection',
        icon: '💪',
        category: 'challenges',
        description: 'Process difficult experiences',
        prompts: [
          'What challenge did I face?',
          'How did I handle it?',
          'What did I learn?',
          'How am I stronger now?'
        ],
        template: `Challenge Reflection:

The challenge:
- 

How I handled it:
- 

What I learned:
- 

How I'm stronger:
- 

Next steps: `
      }
    ],
    gratitude: [],
    reflection: [],
    mood: [],
    goals: [],
    dreams: [],
    relationships: [],
    'self-care': [],
    challenges: []
  };

  // Filter templates by category
  const filteredTemplates = selectedCategory === 'all' 
    ? templates.all 
    : templates.all.filter(t => t.category === selectedCategory);

  const categories = [
    { id: 'all', label: 'All Templates', icon: '📚' },
    { id: 'gratitude', label: 'Gratitude', icon: '🙏' },
    { id: 'reflection', label: 'Reflection', icon: '🤔' },
    { id: 'mood', label: 'Mood', icon: '💭' },
    { id: 'goals', label: 'Goals', icon: '🎯' },
    { id: 'self-care', label: 'Self-Care', icon: '💚' }
  ];

  const handleTemplateSelect = (template) => {
    soundEffects.click();
    if (onSelectTemplate) {
      onSelectTemplate(template.template, template.title);
    }
  };

  const toggleExpand = (templateId) => {
    setExpandedTemplate(expandedTemplate === templateId ? null : templateId);
  };

  return (
    <div className="journal-templates">
      <div className="templates-header">
        <h3>📝 Journal Templates</h3>
        <p>Choose a template to get started</p>
      </div>

      <div className="template-categories">
        {categories.map(category => (
          <button
            key={category.id}
            className={`category-btn ${selectedCategory === category.id ? 'active' : ''}`}
            onClick={() => {
              setSelectedCategory(category.id);
              soundEffects.click();
            }}
          >
            <span className="category-icon">{category.icon}</span>
            <span>{category.label}</span>
          </button>
        ))}
      </div>

      <div className="templates-grid">
        {filteredTemplates.map(template => (
          <div key={template.id} className="template-card">
            <div className="template-header">
              <div className="template-icon">{template.icon}</div>
              <div className="template-info">
                <h4>{template.title}</h4>
                <p>{template.description}</p>
              </div>
            </div>

            <div className="template-actions">
              <button
                className="btn-expand"
                onClick={() => toggleExpand(template.id)}
              >
                {expandedTemplate === template.id ? '👆 Hide' : '👇 See Prompts'}
              </button>
              <button
                className="btn-use-template"
                onClick={() => handleTemplateSelect(template)}
              >
                Use Template ✨
              </button>
            </div>

            {expandedTemplate === template.id && (
              <div className="template-prompts">
                <h5>Guiding Questions:</h5>
                <ul>
                  {template.prompts.map((prompt, idx) => (
                    <li key={idx}>{prompt}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default JournalTemplates;


