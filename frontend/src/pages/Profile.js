import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { useToast } from '../context/ToastContext';
import { useLocale } from '../context/LocaleContext';
import api from '../utils/api';
import Navigation from '../components/Navigation';
// PDF generator will be imported dynamically when needed
import '../styles/Profile.css';

const Profile = () => {
  const { user, logout, updateUser } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const { showToast } = useToast();
  const { 
    language, 
    currency, 
    location, 
    detecting,
    languages, 
    currencies, 
    updateLanguage, 
    updateCurrency,
    detectLocation 
  } = useLocale();
  const navigate = useNavigate();
  const [rewards, setRewards] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadRewards();
  }, []);

  const loadRewards = async () => {
    try {
      const response = await api.get('/rewards');
      if (response.data.success) {
        setRewards(response.data.rewards || []);
      }
    } catch (error) {
      console.error('Error loading rewards:', error);
    }
  };

  const handleLogout = () => {
    showToast('Logged out successfully. See you soon! 👋', 'success');
    logout();
    navigate('/login');
  };

  const handleExportJSON = async () => {
    setLoading(true);
    try {
      // Fetch all user data
      const [habitsRes, financeRes, journalRes, chatRes] = await Promise.allSettled([
        api.get('/habits'),
        api.get('/finance'),
        api.get('/journal'),
        api.get('/chat/history')
      ]);

      const exportData = {
        user: {
          id: user?.id,
          nickname: user?.nickname,
          email: user?.email,
          path: user?.path,
          ai_personality: user?.ai_personality,
          created_at: user?.created_at
        },
        habits: habitsRes.status === 'fulfilled' ? (habitsRes.value?.data?.habits || []) : [],
        finance: financeRes.status === 'fulfilled' ? (financeRes.value?.data?.transactions || []) : [],
        journal: journalRes.status === 'fulfilled' ? (journalRes.value?.data?.entries || []) : [],
        chats: chatRes.status === 'fulfilled' ? (chatRes.value?.data?.chats || []) : [],
        rewards: rewards,
        exportDate: new Date().toISOString()
      };

      // Create and download JSON file
      const dataStr = JSON.stringify(exportData, null, 2);
      const dataBlob = new Blob([dataStr], { type: 'application/json' });
      const url = URL.createObjectURL(dataBlob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `nexanova-export-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      showToast('Data exported successfully! 📥', 'success');
    } catch (error) {
      console.error('Error exporting data:', error);
      showToast('Failed to export data. Please try again.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleExportCSV = async () => {
    setLoading(true);
    try {
      // Fetch all user data
      const [habitsRes, financeRes, journalRes] = await Promise.allSettled([
        api.get('/habits'),
        api.get('/finance'),
        api.get('/journal')
      ]);

      let csvContent = 'NexaNova Data Export\n';
      csvContent += `Export Date: ${new Date().toLocaleString()}\n\n`;

      // Export Habits
      if (habitsRes.status === 'fulfilled' && habitsRes.value?.data?.habits) {
        csvContent += 'HABITS\n';
        csvContent += 'Title,Type,Category,Streak,Last Completed,Status\n';
        habitsRes.value.data.habits.forEach(habit => {
          csvContent += `"${habit.title}","${habit.type}","${habit.category || ''}","${habit.streak || 0}","${habit.last_completed || ''}","${habit.is_active ? 'Active' : 'Inactive'}"\n`;
        });
        csvContent += '\n';
      }

      // Export Finance
      if (financeRes.status === 'fulfilled' && financeRes.value?.data?.transactions) {
        csvContent += 'FINANCE TRANSACTIONS\n';
        csvContent += 'Type,Category,Amount,Date\n';
        financeRes.value.data.transactions.forEach(transaction => {
          csvContent += `"${transaction.type}","${transaction.category || ''}","${transaction.amount}","${transaction.date}"\n`;
        });
        csvContent += '\n';
      }

      // Export Journal
      if (journalRes.status === 'fulfilled' && journalRes.value?.data?.entries) {
        csvContent += 'JOURNAL ENTRIES\n';
        csvContent += 'Title,Date,Mood,Content Preview\n';
        journalRes.value.data.entries.forEach(entry => {
          const preview = entry.content ? entry.content.substring(0, 50).replace(/"/g, '""') : '';
          csvContent += `"${entry.title || ''}","${entry.date}","${entry.mood || 5}","${preview}..."\n`;
        });
      }

      // Create and download CSV file
      const dataBlob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(dataBlob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `nexanova-export-${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      showToast('Data exported as CSV successfully! 📊', 'success');
    } catch (error) {
      console.error('Error exporting CSV:', error);
      showToast('Failed to export data. Please try again.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleExportPDF = async () => {
    setLoading(true);
    try {
      // Dynamically import pdfGenerator to avoid chunk loading issues
      const { generateJourneyReport } = await import('../utils/pdfGenerator');
      const doc = await generateJourneyReport(user, api);
      const fileName = `nexanova-journey-report-${new Date().toISOString().split('T')[0]}.pdf`;
      doc.save(fileName);
      showToast('PDF report generated successfully! 📄', 'success');
    } catch (error) {
      console.error('Error exporting PDF:', error);
      if (error.message?.includes('chunk') || error.message?.includes('Loading')) {
        showToast('PDF module is loading. Please try again in a moment.', 'info');
      } else {
        showToast('Failed to generate PDF report. Please try again.', 'error');
      }
    } finally {
      setLoading(false);
    }
  };

  const getPersonalityLabel = (personality) => {
    const labels = {
      wise_sage: 'Wise Sage 🌿',
      coach: 'Coach 💪',
      friend: 'Friend 🤝'
    };
    return labels[personality] || personality;
  };

  const getPathLabel = (path) => {
    const labels = {
      mind_reset: 'Mind Reset 🧠',
      money_builder: 'Money Builder 💰',
      habit_transformer: 'Habit Transformer ✨',
      all: 'All of the Above 🌟'
    };
    return labels[path] || path;
  };

  return (
    <div className="profile">
      <div className="container">
        <div className="profile-header">
          <div className="profile-avatar">
            {user?.nickname ? user.nickname.charAt(0).toUpperCase() : '👤'}
          </div>
          <h2>{user?.nickname || 'Anonymous User'}</h2>
          <p className="user-email">{user?.email}</p>
        </div>

        <div className="profile-info">
          <div className="info-card">
            <div className="info-label">Your Path</div>
            <div className="info-value">{getPathLabel(user?.path)}</div>
          </div>
          <div className="info-card">
            <div className="info-label">AI Mentor</div>
            <div className="info-value">{getPersonalityLabel(user?.ai_personality)}</div>
          </div>
          <div className="info-card">
            <div className="info-label">Current Mood</div>
            <div className="info-value">{user?.mood_score || 5}/10</div>
          </div>
        </div>

        <div className="rewards-section">
          <h3>Your Badges & Rewards</h3>
          {rewards.length === 0 ? (
            <div className="empty-state">
              <div className="empty-state-icon">🏆</div>
              <p>No badges yet. Keep working on your goals to earn rewards!</p>
            </div>
          ) : (
            <div className="rewards-grid">
              {rewards.map((reward) => (
                <div key={reward.id} className="reward-badge">
                  <div className="badge-icon">
                    {reward.type === 'habit' && '✨'}
                    {reward.type === 'financial' && '💰'}
                    {reward.type === 'mind_reset' && '🧠'}
                  </div>
                  <div className="badge-title">{reward.title}</div>
                  <div className="badge-date">
                    {new Date(reward.awarded_at).toLocaleDateString()}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="settings-section">
          <h3>Settings</h3>
          <div className="settings-list">
            <div className="setting-item setting-item-toggle" onClick={toggleTheme}>
              <div className="setting-label-wrapper">
                <span>Theme</span>
                <span className="setting-description">
                  {theme === 'light' ? 'Light Mode' : 'Dark Mode'}
                </span>
              </div>
              <div className="theme-toggle-inline">
                <span className="theme-icon-inline">
                  {theme === 'light' ? '☀️' : '🌙'}
                </span>
                <span className="theme-label-inline">
                  {theme === 'light' ? 'Light' : 'Dark'}
                </span>
              </div>
            </div>
            
            <div className="setting-item">
              <div className="setting-label-wrapper">
                <span>Language</span>
                <span className="setting-description">
                  {languages[language]?.nativeName || languages[language]?.name || 'English'}
                </span>
              </div>
              <select
                value={language}
                onChange={(e) => updateLanguage(e.target.value)}
                className="setting-select"
                onClick={(e) => e.stopPropagation()}
              >
                {Object.entries(languages).map(([code, lang]) => (
                  <option key={code} value={code}>
                    {lang.flag} {lang.nativeName} ({lang.name})
                  </option>
                ))}
              </select>
            </div>
            
            <div className="setting-item">
              <div className="setting-label-wrapper">
                <span>Currency</span>
                <span className="setting-description">
                  {currencies[currency]?.name || 'Tanzanian Shilling'}
                </span>
              </div>
              <select
                value={currency}
                onChange={(e) => updateCurrency(e.target.value)}
                className="setting-select"
                onClick={(e) => e.stopPropagation()}
              >
                {Object.entries(currencies).map(([code, curr]) => (
                  <option key={code} value={code}>
                    {curr.flag} {curr.symbol} - {curr.name} ({curr.country})
                  </option>
                ))}
              </select>
            </div>
            
            {location && (
              <div className="setting-item">
                <div className="setting-label-wrapper">
                  <span>Detected Location</span>
                  <span className="setting-description">
                    {location.city && location.region 
                      ? `${location.city}, ${location.region}, ${location.countryName}`
                      : location.countryName || 'Unknown'}
                  </span>
                </div>
                <button
                  className="btn btn-small"
                  onClick={detectLocation}
                  disabled={detecting}
                >
                  {detecting ? '🔄 Detecting...' : '🔄 Re-detect Location'}
                </button>
              </div>
            )}
            
            {!location && (
              <div className="setting-item">
                <div className="setting-label-wrapper">
                  <span>Location</span>
                  <span className="setting-description">
                    Auto-detect your location for better suggestions
                  </span>
                </div>
                <button
                  className="btn btn-small"
                  onClick={detectLocation}
                  disabled={detecting}
                >
                  {detecting ? '🔄 Detecting...' : '📍 Detect Location'}
                </button>
              </div>
            )}
            <div className="setting-item">
              <span>Offline Mode</span>
              <span className="setting-value">
                {user?.offline_mode ? 'Enabled' : 'Disabled'}
              </span>
            </div>
            <div className="setting-item">
              <span>Store Chat History</span>
              <span className="setting-value">
                {user?.store_chat ? 'Yes' : 'No'}
              </span>
            </div>
            <div className="setting-item">
              <span>Anonymous Mode</span>
              <span className="setting-value">
                {user?.anonymous_mode ? 'Yes' : 'No'}
              </span>
            </div>
          </div>
        </div>

        <div className="data-section">
          <h3>Data Management</h3>
          <div className="data-actions">
            <button 
              className="btn btn-secondary" 
              onClick={handleExportJSON}
              disabled={loading}
            >
              📥 Export Data (JSON)
            </button>
            <button 
              className="btn btn-secondary" 
              onClick={handleExportCSV}
              disabled={loading}
            >
              📊 Export Data (CSV)
            </button>
            <button 
              className="btn btn-secondary" 
              onClick={handleExportPDF}
              disabled={loading}
            >
              📄 Generate PDF Report
            </button>
          </div>
        </div>

        <div className="qr-link-section">
          <button 
            className="btn btn-primary qr-link-btn" 
            onClick={() => navigate('/qr')}
          >
            📱 Get QR Code for Mobile Access
          </button>
        </div>

        <button className="btn btn-secondary logout-btn" onClick={handleLogout}>
          Logout
        </button>
      </div>
      <Navigation />
    </div>
  );
};

export default Profile;

