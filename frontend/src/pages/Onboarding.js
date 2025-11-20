import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import '../styles/Onboarding.css';

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

  return { strength, score, feedback, isValid: score >= 3 };
};

const Onboarding = () => {
  const navigate = useNavigate();
  const { register, isAuthenticated } = useAuth();
  const { showToast } = useToast();

  useEffect(() => {
    if (isAuthenticated) navigate('/dashboard');
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
    if (step < 4) setStep(step + 1);
    else handleComplete();
  };

  const calculateMoodScore = (emotionalScan) => {
    if (!emotionalScan || Object.keys(emotionalScan).length === 0) return 5;

    const feelingAnswer = emotionalScan[1];
    if (!feelingAnswer) return 5;

    const feelingMap = {
      '😢 Struggling': 2,
      '😐 Okay': 5,
      '🙂 Good': 7,
      '😄 Great': 9
    };

    for (const [key, value] of Object.entries(feelingMap)) {
      if (feelingAnswer.includes(key)) return value;
    }

    const answer = feelingAnswer.toLowerCase();
    if (answer.includes('struggling') || answer.includes('sad')) return 2;
    if (answer.includes('okay') || answer.includes('neutral')) return 5;
    if (answer.includes('good') || answer.includes('happy')) return 7;
    if (answer.includes('great') || answer.includes('excellent')) return 9;

    return 5;
  };

  const handleComplete = async () => {
    setError('');
    setLoading(true);

    if (!formData.email || !formData.password || !formData.path || !formData.ai_personality) {
      setError('Please complete all required fields');
      setLoading(false);
      return;
    }

    const passwordCheck = checkPasswordStrength(formData.password);
    if (!passwordCheck.isValid) {
      setError('Password too weak. Must have 8+ chars, uppercase, lowercase, number, special char.');
      setLoading(false);
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      setError('Please enter a valid email address');
      setLoading(false);
      return;
    }

    if (!formData.anonymous_mode && (!formData.nickname || formData.nickname.trim() === '')) {
      setError('Please enter a nickname or enable anonymous mode');
      setLoading(false);
      return;
    }

    const moodScore = calculateMoodScore(formData.emotional_scan);
    const registrationData = { ...formData, mood_score: moodScore };

    try {
      const result = await register(registrationData);
      setLoading(false);

      if (result.success) {
        showToast('Account created successfully! Welcome to NexaNova 🌱', 'success');
        navigate('/dashboard');
      } else {
        const msg = result.message || 'Registration failed. Please try again.';
        setError(msg);
        showToast(msg, 'error');
      }
    } catch (error) {
      setLoading(false);
      console.error('❌ Onboarding error:', error);

      const networkErrors = ['ECONNREFUSED', 'ERR_NETWORK', 'Network Error'];

      if (networkErrors.includes(error.code) || error.message?.includes('Network')) {
        const msg = 'Cannot connect to server. Check backend running, network, firewall, ports.';
        setError(msg);
        showToast('Network error', 'error');
      } else if (error.code === 'ECONNABORTED') {
        const msg = 'Request timed out. Try again or check connection.';
        setError(msg);
        showToast('Request timeout', 'error');
      } else if (error.response?.status === 404 || error.message?.includes('endpoint')) {
        const msg = 'Registration endpoint not found. Check backend and routes.';
        setError(msg);
        showToast('Endpoint not found', 'error');
      } else {
        const msg = error.message || 'Registration failed. Please try again.';
        setError(msg);
        showToast(msg, 'error');
      }
    }
  };

  const updateFormData = (field, value) => setFormData({ ...formData, [field]: value });

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

        {/* Add your onboarding steps UI here */}
        <div className="onboarding-step">
          {/* Example Step */}
          {step === 1 && (
            <div>
              <h2>Step 1: Create Account</h2>
              <input
                type="email"
                placeholder="Email"
                value={formData.email}
                onChange={(e) => updateFormData('email', e.target.value)}
              />
              <input
                type="password"
                placeholder="Password"
                value={formData.password}
                onChange={(e) => updateFormData('password', e.target.value)}
              />
              <button onClick={handleNext} disabled={loading}>
                {loading ? 'Loading...' : 'Next'}
              </button>
            </div>
          )}
          {/* Add steps 2-4 similarly */}
        </div>
      </div>
    </div>
  );
};

export default Onboarding;
