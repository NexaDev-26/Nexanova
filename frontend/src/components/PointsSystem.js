import React, { useState, useEffect } from 'react';
import api from '../utils/api';
import { soundEffects } from '../utils/soundEffects';
import '../styles/PointsSystem.css';

const PointsSystem = ({ compact = false }) => {
  const [points, setPoints] = useState(0);
  const [level, setLevel] = useState(1);
  const [nextLevelPoints, setNextLevelPoints] = useState(100);
  const [loading, setLoading] = useState(true);
  const [levelUpAnimation, setLevelUpAnimation] = useState(false);

  useEffect(() => {
    loadPoints();
    // Poll for points updates every 30 seconds
    const interval = setInterval(loadPoints, 30000);
    return () => clearInterval(interval);
  }, []);

  const loadPoints = async () => {
    try {
      const response = await api.get('/user/points');
      if (response.data.success) {
        const { points: userPoints, level: userLevel, next_level_points } = response.data;
        const oldLevel = level;
        
        setPoints(userPoints || 0);
        setLevel(userLevel || 1);
        setNextLevelPoints(next_level_points || 100);

        // Check for level up
        if (userLevel > oldLevel && oldLevel > 0) {
          handleLevelUp(userLevel);
        }
      }
    } catch (error) {
      console.error('Error loading points:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLevelUp = (newLevel) => {
    setLevelUpAnimation(true);
    soundEffects.achievement();
    setTimeout(() => setLevelUpAnimation(false), 3000);
  };

  const calculateProgress = () => {
    if (nextLevelPoints === 0) return 100;
    const currentLevelPoints = (level - 1) * 100;
    const progressPoints = points - currentLevelPoints;
    const progressNeeded = nextLevelPoints - currentLevelPoints;
    return Math.min(100, Math.max(0, (progressPoints / progressNeeded) * 100));
  };

  if (loading) {
    return (
      <div className="points-system">
        <div className="points-loading">Loading...</div>
      </div>
    );
  }

  return (
    <>
      {levelUpAnimation && (
        <div className="level-up-celebration">
          <div className="celebration-content">
            <div className="celebration-icon">⭐</div>
            <div className="celebration-text">
              <h2>Level Up!</h2>
              <p>You've reached Level {level}!</p>
            </div>
          </div>
        </div>
      )}

      <div className={`points-system ${compact ? 'compact' : ''}`}>
        {!compact && (
          <div className="points-header">
            <h3>Your Progress</h3>
          </div>
        )}
        <div className="points-content">
          <div className="level-badge">
            <span className="level-number">Lv.{level}</span>
          </div>
          <div className="points-info">
            <div className="points-display">
              <span className="points-value">{points.toLocaleString()}</span>
              <span className="points-label">Points</span>
            </div>
            {!compact && (
              <div className="progress-bar-container">
                <div className="progress-bar">
                  <div 
                    className="progress-fill" 
                    style={{ width: `${calculateProgress()}%` }}
                  />
                </div>
                <div className="progress-text">
                  {nextLevelPoints - points > 0 
                    ? `${(nextLevelPoints - points).toLocaleString()} to next level`
                    : 'Max Level!'}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default PointsSystem;

