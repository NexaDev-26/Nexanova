import React, { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useToast } from '../context/ToastContext';
import api from '../utils/api';
import '../styles/Login.css';

const ForgotPassword = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { showToast } = useToast();
  const [step, setStep] = useState(searchParams.get('token') ? 'reset' : 'request');
  const [email, setEmail] = useState('');
  const [resetToken, setResetToken] = useState(searchParams.get('token') || '');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleRequestReset = async (e) => {
    e.preventDefault();
    setLoading(true);

    if (!email) {
      showToast('Please enter your email address', 'error');
      setLoading(false);
      return;
    }

    try {
      const response = await api.post('/password-reset/request-reset', { email });
      if (response.data.success) {
        if (response.data.resetToken) {
          // Development mode - show token
          showToast(`Reset token (dev): ${response.data.resetToken.substring(0, 20)}...`, 'info');
          setResetToken(response.data.resetToken);
          setStep('reset');
        } else {
          showToast('If the email exists, a reset link has been sent.', 'success');
        }
      }
    } catch (error) {
      showToast(error.response?.data?.message || 'Failed to request password reset', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    setLoading(true);

    if (!newPassword || !confirmPassword) {
      showToast('Please fill in all fields', 'error');
      setLoading(false);
      return;
    }

    if (newPassword !== confirmPassword) {
      showToast('Passwords do not match', 'error');
      setLoading(false);
      return;
    }

    try {
      const response = await api.post('/password-reset/reset', {
        token: resetToken,
        newPassword
      });

      if (response.data.success) {
        showToast('Password reset successfully! You can now login.', 'success');
        setTimeout(() => {
          navigate('/login');
        }, 2000);
      }
    } catch (error) {
      showToast(error.response?.data?.message || 'Failed to reset password', 'error');
    } finally {
      setLoading(false);
    }
  };

  if (step === 'reset') {
    return (
      <div className="login-page">
        <div className="login-container">
          <div className="logo">🔐</div>
          <h1>Reset Password</h1>
          <p className="subtitle">Enter your new password</p>

          <form onSubmit={handleResetPassword} className="login-form">
            <div className="form-group">
              <label>New Password</label>
              <div style={{ position: 'relative' }}>
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                  placeholder="Enter new password"
                  minLength={8}
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
                    fontSize: '18px',
                    padding: '5px'
                  }}
                >
                  {showPassword ? '👁️' : '👁️‍🗨️'}
                </button>
              </div>
              <small style={{ fontSize: '12px', color: '#666' }}>
                Must be at least 8 characters with uppercase, lowercase, and number
              </small>
            </div>

            <div className="form-group">
              <label>Confirm Password</label>
              <input
                type={showPassword ? 'text' : 'password'}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                placeholder="Confirm new password"
                minLength={8}
              />
            </div>

            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? 'Resetting...' : 'Reset Password'}
            </button>
          </form>

          <div className="auth-links">
            <p>
              <Link to="/login">Back to Login</Link>
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="login-page">
      <div className="login-container">
        <div className="logo">🔑</div>
        <h1>Forgot Password</h1>
        <p className="subtitle">Enter your email to receive a reset link</p>

        <form onSubmit={handleRequestReset} className="login-form">
          <div className="form-group">
            <label>Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="your@email.com"
            />
          </div>

          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? 'Sending...' : 'Send Reset Link'}
          </button>
        </form>

        <div className="auth-links">
          <p>
            <Link to="/login">Back to Login</Link>
          </p>
          <p className="signup-link">
            Don't have an account? <Link to="/onboarding">Start your journey</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;

