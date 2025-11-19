import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import '../styles/Onboarding.css';
import React from 'react';
const Onboarding = () => <div style={{ padding: 20 }}>Welcome to NexaNova Onboarding</div>;
export default Onboarding;


// Password strength checker
const checkPasswordStrength = (password) => {
  if (!password) return { strength: 'none', score: 0, feedback: [], isValid: false };
  
  const feedback = [];
  let score = 0;
  
  if (password.length >= 8) score += 1;
  else feedback.push('At least 8 characters');
  
  if (/[a-z]/.test(password)) score += 1;
  else feedback.push('One lowercase letter');
  
  if (/[A-Z]/.test(password)) score += 1;
  else feedback.push('One uppercase letter');
  
  if (/[0-9]/.test(password)) score += 1;
  else feedback.push('One number');
  
  if (/[^a-zA-Z0-9]/.test(password)) score += 1;
  else feedback.push('One special character');
  
  let strength = 'weak';
  if (score >= 4) strength = 'strong';
  else if (score >= 3) strength = 'medium';
  else if (score >= 1) strength = 'weak';
  
  return { strength, score, feedback, isValid: score >= 3 };
};

const Onboarding = () => {
  const navigate = useNavigate();
  const { register, isAuthenticated } = useAuth();
  const { showToast } = useToast();

  // Redirect if already logged in
  useEffect(() => {
    if (isAuthenticated) {
      navigate('/dashboard');
    }
  }, [isAuthenticated, navigate]);
  const [step, setStep] = useState(1);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    nickname: '',
    path: '',
    ai_personality: '',
    anonymous_mode: false,
    offline_mode: true,
    store_chat: true,
    emotional_scan: {}
  });

  const handleNext = () => {
    if (step < 4) {
      setStep(step + 1);
    } else {
      handleComplete();
    }
  };

  // Convert emotional scan answers to mood score
  const calculateMoodScore = (emotionalScan) => {
    if (!emotionalScan || Object.keys(emotionalScan).length === 0) {
      return 5; // Default neutral mood
    }
    
    // Question 1 is about current feeling
    const feelingAnswer = emotionalScan[1];
    if (!feelingAnswer) return 5;
    
    // Map feeling answers to mood scores (1-10)
    const feelingMap = {
      '😢 Struggling': 2,
      '😐 Okay': 5,
      '🙂 Good': 7,
      '😄 Great': 9
    };
    
    // Find matching feeling
    for (const [key, value] of Object.entries(feelingMap)) {
      if (feelingAnswer.includes(key) || feelingAnswer.includes(key.replace('😢', 'Struggling').replace('😐', 'Okay').replace('🙂', 'Good').replace('😄', 'Great'))) {
        return value;
      }
    }
    
    // Fallback: check for keywords
    if (feelingAnswer.toLowerCase().includes('struggling') || feelingAnswer.toLowerCase().includes('sad')) return 2;
    if (feelingAnswer.toLowerCase().includes('okay') || feelingAnswer.toLowerCase().includes('neutral')) return 5;
    if (feelingAnswer.toLowerCase().includes('good') || feelingAnswer.toLowerCase().includes('happy')) return 7;
    if (feelingAnswer.toLowerCase().includes('great') || feelingAnswer.toLowerCase().includes('excellent')) return 9;
    
    return 5; // Default
  };

  const handleComplete = async () => {
    setError('');
    setLoading(true);

    // Validate required fields
    if (!formData.email || !formData.password || !formData.path || !formData.ai_personality) {
      setError('Please complete all required fields');
      setLoading(false);
      return;
    }

    // Validate password strength
    const passwordCheck = checkPasswordStrength(formData.password);
    if (!passwordCheck.isValid) {
      setError('Password is too weak. Please use a stronger password with at least 8 characters, including uppercase, lowercase, and numbers.');
      setLoading(false);
      return;
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      setError('Please enter a valid email address');
      setLoading(false);
      return;
    }

    // If not anonymous, require nickname
    if (!formData.anonymous_mode && (!formData.nickname || formData.nickname.trim() === '')) {
      setError('Please enter a nickname or enable anonymous mode');
      setLoading(false);
      return;
    }

    // Calculate mood score from emotional scan
    const moodScore = calculateMoodScore(formData.emotional_scan);
    
    // Prepare registration data with mood score
    const registrationData = {
      ...formData,
      mood_score: moodScore
    };

    try {
      const result = await register(registrationData);
      setLoading(false);
      
      if (result.success) {
        showToast('Account created successfully! Welcome to NexaNova 🌱', 'success');
        navigate('/dashboard');
      } else {
        const errorMsg = result.message || 'Registration failed. Please try again.';
        setError(errorMsg);
        showToast(errorMsg, 'error');
      }
    } catch (error) {
      setLoading(false);
      console.error('❌ Onboarding error:', error);
      
      // Handle network errors more gracefully
      if (error.code === 'ECONNREFUSED' || error.code === 'ERR_NETWORK' || error.message === 'Network Error' || error.message?.includes('Network')) {
        const networkError = 'Cannot connect to server.\n\nPlease check:\n1. Backend server is running (npm run server)\n2. You are connected to the internet\n3. Firewall allows connections on port 5000\n4. Both frontend and backend are on the same network';
        setError(networkError);
        showToast('Network error: Cannot reach backend server', 'error');
      } else if (error.code === 'ECONNABORTED') {
        const timeoutError = 'Request timed out. The server may be slow or unreachable.\n\nPlease try again or check your connection.';
        setError(timeoutError);
        showToast('Request timeout. Please try again.', 'error');
      } else if (error.response?.status === 404 || result?.message?.includes('not found') || result?.message?.includes('endpoint')) {
        const notFoundError = 'Registration endpoint not found.\n\nPlease check:\n1. Backend server is running\n2. Routes are properly loaded\n3. API URL is correct';
        setError(notFoundError);
        showToast('Registration endpoint not found. Check backend server.', 'error');
      } else {
        const errorMsg = result?.message || error.message || 'Registration failed. Please try again.';
        setError(errorMsg);
        showToast(errorMsg, 'error');
      }
    }
  };

  const updateFormData = (field, value) => {
    setFormData({ ...formData, [field]: value });
  };

  return (
    <div className="onboarding">
      <div className="onboarding-container">
        {error && (
          <div className="error-banner">
            <span>⚠️</span>
            <span>{error}</span>
            <button onClick={() => setError('')}>✕</button>
          </div>
        )}
        {step === 1 && <WelcomeStep onNext={handleNext} />}
        {step === 2 && (
          <PathSelectionStep
            selectedPath={formData.path}
            onSelect={(path) => updateFormData('path', path)}
            onNext={handleNext}
            formData={formData}
            updateFormData={updateFormData}
          />
        )}
        {step === 3 && (
          <PrivacySetupStep
            formData={formData}
            updateFormData={updateFormData}
            onNext={handleNext}
          />
        )}
        {step === 4 && (
          <EmotionalScanStep
            formData={formData}
            updateFormData={updateFormData}
            onComplete={handleComplete}
            loading={loading}
          />
        )}
      </div>
    </div>
  );
};

const WelcomeStep = ({ onNext }) => {
  return (
    <div className="onboarding-step">
      <div className="logo-animation">🌱</div>
      <h1>Welcome to NexaNova</h1>
      <p className="tagline">Your Private Healing Space</p>
      <p className="description">
        Transform your mind, habits, and finances with AI-powered guidance.
        Built for African youth, designed for growth.
      </p>
      <div className="button-group">
        <button className="btn btn-primary" onClick={onNext}>
          Start My Journey
        </button>
        <button className="btn btn-secondary" onClick={() => window.open('#', '_blank')}>
          Learn More
        </button>
      </div>
      <p className="login-prompt">
        Already have an account? <Link to="/login" className="login-link">Login here</Link>
      </p>
    </div>
  );
};

const PathSelectionStep = ({ selectedPath, onSelect, onNext, formData, updateFormData }) => {
  const paths = [
    {
      id: 'mind_reset',
      title: 'Mind Reset',
      icon: '🧠',
      description: 'Heal your mind, find peace, build resilience'
    },
    {
      id: 'money_builder',
      title: 'Money Builder',
      icon: '💰',
      description: 'Build financial habits, save, and grow wealth'
    },
    {
      id: 'habit_transformer',
      title: 'Habit Transformer',
      icon: '✨',
      description: 'Break bad habits, build good ones, transform your life'
    },
    {
      id: 'all',
      title: 'All of the Above',
      icon: '🌟',
      description: 'Complete transformation journey'
    }
  ];

  return (
    <div className="onboarding-step">
      <h2>Choose Your Path</h2>
      <p className="step-description">Select the journey that calls to you</p>
      <div className="path-cards">
        {paths.map((path) => (
          <div
            key={path.id}
            className={`path-card ${selectedPath === path.id ? 'selected' : ''}`}
            onClick={() => onSelect(path.id)}
          >
            <div className="path-icon">{path.icon}</div>
            <h3>{path.title}</h3>
            <p>{path.description}</p>
          </div>
        ))}
      </div>
      <div className="personality-selection">
        <h3>Choose Your AI Mentor</h3>
        <div className="personality-options">
          <label>
            <input
              type="radio"
              name="personality"
              value="wise_sage"
              checked={formData.ai_personality === 'wise_sage'}
              onChange={(e) => updateFormData('ai_personality', e.target.value)}
            />
            <span>Wise Sage 🌿</span>
          </label>
          <label>
            <input
              type="radio"
              name="personality"
              value="coach"
              checked={formData.ai_personality === 'coach'}
              onChange={(e) => updateFormData('ai_personality', e.target.value)}
            />
            <span>Coach 💪</span>
          </label>
          <label>
            <input
              type="radio"
              name="personality"
              value="friend"
              checked={formData.ai_personality === 'friend'}
              onChange={(e) => updateFormData('ai_personality', e.target.value)}
            />
            <span>Friend 🤝</span>
          </label>
        </div>
      </div>
      <button
        className="btn btn-primary"
        onClick={onNext}
        disabled={!selectedPath || !formData.ai_personality}
      >
        Continue
      </button>
    </div>
  );
};

const PrivacySetupStep = ({ formData, updateFormData, onNext }) => {
  const [passwordStrength, setPasswordStrength] = React.useState({ strength: 'none', score: 0, feedback: [], isValid: false });
  const [showPassword, setShowPassword] = React.useState(false);
  
  const handlePasswordChange = (e) => {
    const password = e.target.value;
    updateFormData('password', password);
    setPasswordStrength(checkPasswordStrength(password));
  };
  
  return (
    <div className="onboarding-step">
      <h2>Privacy Setup</h2>
      <p className="step-description">Your data, your control</p>
      
      <div className="form-group">
        <label>Stay Anonymous?</label>
        <div className="toggle-group">
          <button
            className={`toggle-btn ${formData.anonymous_mode ? 'active' : ''}`}
            onClick={() => updateFormData('anonymous_mode', true)}
          >
            Yes, Stay Anonymous
          </button>
          <button
            className={`toggle-btn ${!formData.anonymous_mode ? 'active' : ''}`}
            onClick={() => updateFormData('anonymous_mode', false)}
          >
            Use Nickname
          </button>
        </div>
        {!formData.anonymous_mode && (
          <input
            type="text"
            placeholder="Choose a nickname (required)"
            value={formData.nickname || ''}
            onChange={(e) => updateFormData('nickname', e.target.value)}
            className="input-field"
            required
          />
        )}
      </div>

      <div className="form-group">
        <label>Email (for account recovery)</label>
        <input
          type="email"
          placeholder="your@email.com"
          value={formData.email}
          onChange={(e) => updateFormData('email', e.target.value)}
          className="input-field"
          required
        />
      </div>

      <div className="form-group">
        <label>Password</label>
        <div style={{ position: 'relative' }}>
          <input
            type={showPassword ? 'text' : 'password'}
            placeholder="Create a strong password"
            value={formData.password}
            onChange={handlePasswordChange}
            className="input-field"
            required
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            style={{
              position: 'absolute',
              right: '10px',
              top: '50%',
              transform: 'translateY(-50%)',
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              fontSize: '18px'
            }}
          >
            {showPassword ? '👁️' : '👁️‍🗨️'}
          </button>
        </div>
        {formData.password && (
          <div className="password-strength-indicator" style={{ marginTop: '8px' }}>
            <div style={{ 
              display: 'flex', 
              gap: '4px', 
              marginBottom: '4px',
              alignItems: 'center'
            }}>
              <span style={{ fontSize: '12px', color: '#666' }}>Strength: </span>
              <div style={{
                width: '60px',
                height: '4px',
                backgroundColor: '#e0e0e0',
                borderRadius: '2px',
                overflow: 'hidden'
              }}>
                <div style={{
                  width: `${(passwordStrength.score / 5) * 100}%`,
                  height: '100%',
                  backgroundColor: passwordStrength.strength === 'strong' ? '#4caf50' : 
                                  passwordStrength.strength === 'medium' ? '#ff9800' : '#f44336',
                  transition: 'all 0.3s'
                }} />
              </div>
              <span style={{ 
                fontSize: '12px', 
                fontWeight: 'bold',
                color: passwordStrength.strength === 'strong' ? '#4caf50' : 
                       passwordStrength.strength === 'medium' ? '#ff9800' : '#f44336'
              }}>
                {passwordStrength.strength.toUpperCase()}
              </span>
            </div>
            {passwordStrength.feedback.length > 0 && (
              <div style={{ fontSize: '11px', color: '#666', marginTop: '4px' }}>
                <div>Requirements:</div>
                <ul style={{ margin: '4px 0', paddingLeft: '20px' }}>
                  {passwordStrength.feedback.map((req, idx) => (
                    <li key={idx} style={{ color: '#999' }}>{req}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}
      </div>

      <div className="toggle-option">
        <label>
          <input
            type="checkbox"
            checked={formData.offline_mode}
            onChange={(e) => updateFormData('offline_mode', e.target.checked)}
          />
          <span>Enable Offline Mode</span>
        </label>
      </div>

      <div className="toggle-option">
        <label>
          <input
            type="checkbox"
            checked={formData.store_chat}
            onChange={(e) => updateFormData('store_chat', e.target.checked)}
          />
          <span>Store Chat History</span>
        </label>
      </div>

      <p className="login-prompt-small">
        Already have an account? <Link to="/login" className="login-link">Login here</Link>
      </p>

      <button
        className="btn btn-primary"
        onClick={onNext}
        disabled={!formData.email || !formData.password || !passwordStrength.isValid}
        title={!passwordStrength.isValid && formData.password ? 'Password must meet minimum requirements' : ''}
      >
        Continue
      </button>
    </div>
  );
};

const EmotionalScanStep = ({ formData, updateFormData, onComplete, loading }) => {
  const [answers, setAnswers] = useState({});

  const questions = [
    {
      id: 1,
      question: 'How are you feeling right now?',
      options: ['😢 Struggling', '😐 Okay', '🙂 Good', '😄 Great']
    },
    {
      id: 2,
      question: 'What area needs the most support?',
      options: ['Mental wellness', 'Financial stability', 'Habit building', 'All of the above']
    },
    {
      id: 3,
      question: 'What motivates you?',
      options: ['Personal growth', 'Financial freedom', 'Better habits', 'Overall transformation']
    },
    {
      id: 4,
      question: 'How do you prefer to learn?',
      options: ['Through reflection', 'Action steps', 'Stories & proverbs', 'All methods']
    },
    {
      id: 5,
      question: 'What is your biggest challenge?',
      options: ['Staying consistent', 'Managing emotions', 'Financial planning', 'Breaking bad habits']
    }
  ];

  const handleAnswer = (questionId, answer) => {
    setAnswers({ ...answers, [questionId]: answer });
  };

  const handleSubmit = () => {
    updateFormData('emotional_scan', answers);
    onComplete();
  };

  const allAnswered = Object.keys(answers).length === questions.length;

  return (
    <div className="onboarding-step">
      <h2>Emotional Scan</h2>
      <p className="step-description">Help us understand you better</p>
      
      <div className="questions-list">
        {questions.map((q) => (
          <div key={q.id} className="question-card">
            <h4>{q.question}</h4>
            <div className="options-grid">
              {q.options.map((option, idx) => (
                <button
                  key={idx}
                  className={`option-btn ${answers[q.id] === option ? 'selected' : ''}`}
                  onClick={() => handleAnswer(q.id, option)}
                >
                  {option}
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>

      <button
        className="btn btn-primary"
        onClick={handleSubmit}
        disabled={!allAnswered || loading}
      >
        {loading ? 'Setting up your journey...' : 'Complete Journey Setup'}
      </button>
    </div>
  );
};

export default Onboarding;

