import React, { useState } from 'react';
import { soundEffects } from '../utils/soundEffects';
import '../styles/HabitTemplates.css';

const HabitTemplates = ({ onSelectTemplate }) => {
  const [selectedCategory, setSelectedCategory] = useState('all');

  const templates = {
    build: [
      {
        id: 'exercise',
        title: 'Daily Exercise',
        icon: '🏃',
        category: 'health',
        type: 'build',
        description: 'Build a consistent exercise routine',
        template: {
          title: 'Exercise Daily',
          type: 'build',
          category: 'health',
          difficulty: 'medium',
          frequency: 'daily',
          description: 'Commit to 30 minutes of physical activity each day',
          trigger: 'After morning coffee',
          replacement: ''
        }
      },
      {
        id: 'meditation',
        title: 'Daily Meditation',
        icon: '🧘',
        category: 'mindfulness',
        type: 'build',
        description: 'Cultivate mindfulness and inner peace',
        template: {
          title: 'Meditate Daily',
          type: 'build',
          category: 'mindfulness',
          difficulty: 'easy',
          frequency: 'daily',
          description: 'Spend 10-15 minutes in meditation or mindfulness practice',
          trigger: 'Before bed',
          replacement: ''
        }
      },
      {
        id: 'reading',
        title: 'Daily Reading',
        icon: '📚',
        category: 'learning',
        type: 'build',
        description: 'Expand knowledge through daily reading',
        template: {
          title: 'Read Daily',
          type: 'build',
          category: 'learning',
          difficulty: 'easy',
          frequency: 'daily',
          description: 'Read for at least 20 minutes each day',
          trigger: 'During lunch break',
          replacement: ''
        }
      },
      {
        id: 'gratitude',
        title: 'Gratitude Practice',
        icon: '🙏',
        category: 'mindfulness',
        type: 'build',
        description: 'Practice daily gratitude',
        template: {
          title: 'Daily Gratitude',
          type: 'build',
          category: 'mindfulness',
          difficulty: 'easy',
          frequency: 'daily',
          description: 'Write down 3 things you\'re grateful for each day',
          trigger: 'Morning routine',
          replacement: ''
        }
      },
      {
        id: 'hydration',
        title: 'Stay Hydrated',
        icon: '💧',
        category: 'health',
        type: 'build',
        description: 'Drink enough water daily',
        template: {
          title: 'Drink 8 Glasses of Water',
          type: 'build',
          category: 'health',
          difficulty: 'easy',
          frequency: 'daily',
          description: 'Drink at least 8 glasses of water throughout the day',
          trigger: 'Every hour',
          replacement: ''
        }
      },
      {
        id: 'journaling',
        title: 'Daily Journaling',
        icon: '📔',
        category: 'mindfulness',
        type: 'build',
        description: 'Reflect and process your day',
        template: {
          title: 'Journal Daily',
          type: 'build',
          category: 'mindfulness',
          difficulty: 'easy',
          frequency: 'daily',
          description: 'Write in your journal for at least 10 minutes',
          trigger: 'Evening routine',
          replacement: ''
        }
      },
      {
        id: 'sleep',
        title: 'Better Sleep',
        icon: '😴',
        category: 'health',
        type: 'build',
        description: 'Establish healthy sleep habits',
        template: {
          title: 'Sleep 8 Hours',
          type: 'build',
          category: 'health',
          difficulty: 'medium',
          frequency: 'daily',
          description: 'Get 7-8 hours of quality sleep each night',
          trigger: '10 PM bedtime',
          replacement: ''
        }
      },
      {
        id: 'savings',
        title: 'Daily Savings',
        icon: '💰',
        category: 'finance',
        type: 'build',
        description: 'Build a savings habit',
        template: {
          title: 'Save Daily',
          type: 'build',
          category: 'finance',
          difficulty: 'easy',
          frequency: 'daily',
          description: 'Save a small amount of money each day',
          trigger: 'After checking account',
          replacement: ''
        }
      }
    ],
    break: [
      {
        id: 'social-media',
        title: 'Reduce Social Media',
        icon: '📱',
        category: 'digital',
        type: 'break',
        description: 'Break the social media scrolling habit',
        template: {
          title: 'Limit Social Media',
          type: 'break',
          category: 'digital',
          difficulty: 'hard',
          frequency: 'daily',
          description: 'Reduce social media usage to 30 minutes per day',
          trigger: 'Boredom or free time',
          replacement: 'Read a book or go for a walk'
        }
      },
      {
        id: 'procrastination',
        title: 'Stop Procrastinating',
        icon: '⏰',
        category: 'productivity',
        type: 'break',
        description: 'Overcome procrastination',
        template: {
          title: 'No Procrastination',
          type: 'break',
          category: 'productivity',
          difficulty: 'hard',
          frequency: 'daily',
          description: 'Do important tasks immediately instead of putting them off',
          trigger: 'Feeling overwhelmed',
          replacement: 'Break task into smaller steps'
        }
      },
      {
        id: 'junk-food',
        title: 'Reduce Junk Food',
        icon: '🍔',
        category: 'health',
        type: 'break',
        description: 'Break unhealthy eating patterns',
        template: {
          title: 'No Junk Food',
          type: 'break',
          category: 'health',
          difficulty: 'medium',
          frequency: 'daily',
          description: 'Avoid processed and fast food',
          trigger: 'Cravings or stress',
          replacement: 'Eat a healthy snack or drink water'
        }
      },
      {
        id: 'smoking',
        title: 'Quit Smoking',
        icon: '🚭',
        category: 'health',
        type: 'break',
        description: 'Break the smoking habit',
        template: {
          title: 'No Smoking',
          type: 'break',
          category: 'health',
          difficulty: 'hard',
          frequency: 'daily',
          description: 'Stop smoking completely',
          trigger: 'Stress or social situations',
          replacement: 'Deep breathing or call a friend'
        }
      },
      {
        id: 'late-night',
        title: 'Stop Late Night Snacking',
        icon: '🌙',
        category: 'health',
        type: 'break',
        description: 'Break late-night eating habits',
        template: {
          title: 'No Late Night Snacks',
          type: 'break',
          category: 'health',
          difficulty: 'medium',
          frequency: 'daily',
          description: 'Stop eating after 8 PM',
          trigger: 'Evening boredom',
          replacement: 'Drink herbal tea or brush teeth'
        }
      },
      {
        id: 'negative-thoughts',
        title: 'Break Negative Thinking',
        icon: '💭',
        category: 'mindfulness',
        type: 'break',
        description: 'Replace negative thought patterns',
        template: {
          title: 'Positive Thinking',
          type: 'break',
          category: 'mindfulness',
          difficulty: 'hard',
          frequency: 'daily',
          description: 'Catch and reframe negative thoughts',
          trigger: 'Stress or self-doubt',
          replacement: 'Practice gratitude or affirmations'
        }
      }
    ]
  };

  const categories = [
    { id: 'all', label: 'All', icon: '📋' },
    { id: 'health', label: 'Health', icon: '💚' },
    { id: 'mindfulness', label: 'Mindfulness', icon: '🧘' },
    { id: 'productivity', label: 'Productivity', icon: '⚡' },
    { id: 'finance', label: 'Finance', icon: '💰' },
    { id: 'learning', label: 'Learning', icon: '📚' },
    { id: 'digital', label: 'Digital', icon: '📱' }
  ];

  const allTemplates = [...templates.build, ...templates.break];
  const filteredTemplates = selectedCategory === 'all'
    ? allTemplates
    : allTemplates.filter(t => t.category === selectedCategory);

  const handleTemplateSelect = (template) => {
    soundEffects.click();
    if (onSelectTemplate) {
      onSelectTemplate(template.template);
    }
  };

  return (
    <div className="habit-templates">
      <div className="templates-header">
        <h3>✨ Habit Templates</h3>
        <p>Quick start with pre-made habits</p>
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
                <div className="template-badge">{template.type === 'build' ? 'Build' : 'Break'}</div>
                <h4>{template.title}</h4>
                <p>{template.description}</p>
              </div>
            </div>

            <div className="template-details">
              <div className="detail-item">
                <span className="detail-label">Difficulty:</span>
                <span className={`detail-value difficulty-${template.template.difficulty}`}>
                  {template.template.difficulty}
                </span>
              </div>
              {template.template.trigger && (
                <div className="detail-item">
                  <span className="detail-label">Trigger:</span>
                  <span className="detail-value">{template.template.trigger}</span>
                </div>
              )}
            </div>

            <button
              className="btn-use-template"
              onClick={() => handleTemplateSelect(template)}
            >
              Use Template ✨
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default HabitTemplates;


