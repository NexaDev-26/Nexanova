import React, { useState, useEffect } from 'react';
import api from '../utils/api';
import { soundEffects } from '../utils/soundEffects';
import '../styles/AchievementBadges.css';

const AchievementBadges = ({ limit = 5, showAll = false }) => {
  const [badges, setBadges] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newBadge, setNewBadge] = useState(null);

  useEffect(() => {
    loadBadges();
  }, []);

  const loadBadges = async () => {
    try {
      const response = await api.get('/rewards');
      if (response.data.success) {
        const allBadges = response.data.rewards || [];
        setBadges(allBadges);
        
        // Check for new badge (awarded in last 5 seconds)
        const recentBadge = allBadges.find(badge => {
          const awardedAt = new Date(badge.awarded_at);
          const now = new Date();
          return (now - awardedAt) < 5000;
        });
        
        if (recentBadge && !badges.find(b => b.id === recentBadge.id)) {
          setNewBadge(recentBadge);
          soundEffects.achievement();
          setTimeout(() => setNewBadge(null), 3000);
        }
      }
    } catch (error) {
      console.error('Error loading badges:', error);
    } finally {
      setLoading(false);
    }
  };

  const getBadgeIcon = (type) => {
    const icons = {
      habit: '🌱',
      finance: '💰',
      mood: '😊',
      journal: '📔',
      streak: '🔥',
      milestone: '⭐',
      achievement: '🏆'
    };
    return icons[type] || '🎖️';
  };

  const getBadgeColor = (type) => {
    const colors = {
      habit: '#10b981',
      finance: '#f59e0b',
      mood: '#8b5cf6',
      journal: '#3b82f6',
      streak: '#ef4444',
      milestone: '#14b8a6',
      achievement: '#ec4899'
    };
    return colors[type] || '#6b7280';
  };

  if (loading) {
    return (
      <div className="achievement-badges">
        <div className="badges-loading">Loading achievements...</div>
      </div>
    );
  }

  const displayBadges = showAll ? badges : badges.slice(0, limit);

  return (
    <>
      {/* New Badge Celebration */}
      {newBadge && (
        <div className="badge-celebration">
          <div className="celebration-content">
            <div className="celebration-icon">{getBadgeIcon(newBadge.type)}</div>
            <div className="celebration-text">
              <h3>🎉 Achievement Unlocked!</h3>
              <p>{newBadge.title}</p>
            </div>
          </div>
        </div>
      )}

      <div className="achievement-badges">
        {displayBadges.length > 0 ? (
          <div className="badges-grid">
            {displayBadges.map((badge) => (
              <div
                key={badge.id}
                className="badge-item"
                style={{ '--badge-color': getBadgeColor(badge.type) }}
                title={badge.description || badge.title}
              >
                <div className="badge-icon">{getBadgeIcon(badge.type)}</div>
                <div className="badge-info">
                  <div className="badge-title">{badge.title}</div>
                  {badge.description && (
                    <div className="badge-description">{badge.description}</div>
                  )}
                  <div className="badge-date">
                    {new Date(badge.awarded_at).toLocaleDateString()}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="no-badges">
            <div className="no-badges-icon">🎖️</div>
            <p>Start your journey to unlock achievements!</p>
          </div>
        )}
      </div>
    </>
  );
};

export default AchievementBadges;

