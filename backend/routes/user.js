const express = require('express');
const router = express.Router();
const { db } = require('../config/database');
const { verifyToken } = require('./auth');
const { cacheMiddleware, invalidateUserCache } = require('../utils/cache');

// Get current user profile (from token) - cached for 5 minutes
router.get('/profile', verifyToken, cacheMiddleware({ ttl: 5 * 60 * 1000, prefix: 'user' }), (req, res) => {
  db.get('SELECT id, nickname, email, path, ai_personality, mood_score, anonymous_mode, offline_mode, store_chat, language, currency, country_code, city, region, points, level, created_at FROM users WHERE id = ?', [req.userId], (err, user) => {
    if (err) {
      return res.status(500).json({ success: false, message: 'Error fetching user' });
    }
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }
    res.json({ success: true, user });
  });
});

// Get user points and level
router.get('/points', verifyToken, (req, res) => {
  db.get('SELECT points, level FROM users WHERE id = ?', [req.userId], (err, user) => {
    if (err) {
      return res.status(500).json({ success: false, message: 'Error fetching points' });
    }
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }
    
    const points = user.points || 0;
    const level = user.level || 1;
    const nextLevelPoints = level * 100;
    
    res.json({ 
      success: true, 
      points, 
      level, 
      next_level_points: nextLevelPoints 
    });
  });
});

// Award points (internal use)
function awardPoints(userId, pointsToAdd, reason = '') {
  return new Promise((resolve, reject) => {
    db.get('SELECT points, level FROM users WHERE id = ?', [userId], (err, user) => {
      if (err) {
        return reject(err);
      }
      
      const currentPoints = (user.points || 0) + pointsToAdd;
      const currentLevel = user.level || 1;
      const pointsForNextLevel = currentLevel * 100;
      let newLevel = currentLevel;
      
      // Check for level up
      if (currentPoints >= pointsForNextLevel) {
        newLevel = currentLevel + 1;
      }
      
      db.run(
        'UPDATE users SET points = ?, level = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
        [currentPoints, newLevel, userId],
        (err) => {
          if (err) {
            return reject(err);
          }
          invalidateUserCache(userId);
          resolve({ points: currentPoints, level: newLevel, leveledUp: newLevel > currentLevel });
        }
      );
    });
  });
}

module.exports.awardPoints = awardPoints;

// Get user profile by ID
router.get('/:id', verifyToken, (req, res) => {
  const { id } = req.params;

  if (parseInt(id) !== req.userId) {
    return res.status(403).json({ success: false, message: 'Unauthorized' });
  }

  db.get('SELECT id, nickname, email, path, ai_personality, mood_score, anonymous_mode, offline_mode, store_chat, language, currency, country_code, city, region, created_at FROM users WHERE id = ?', [id], (err, user) => {
    if (err) {
      return res.status(500).json({ success: false, message: 'Error fetching user' });
    }
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }
    res.json({ success: true, user });
  });
});

// Update user preferences (language, currency)
router.patch('/preferences', verifyToken, (req, res) => {
  const { language, currency, country_code, city, region } = req.body;
  
  const updates = [];
  const values = [];
  
  if (language !== undefined) {
    updates.push('language = ?');
    values.push(language);
  }
  if (currency !== undefined) {
    updates.push('currency = ?');
    values.push(currency);
  }
  if (country_code !== undefined) {
    updates.push('country_code = ?');
    values.push(country_code);
  }
  if (city !== undefined) {
    updates.push('city = ?');
    values.push(city);
  }
  if (region !== undefined) {
    updates.push('region = ?');
    values.push(region);
  }
  
  if (updates.length === 0) {
    return res.status(400).json({ success: false, message: 'No fields to update' });
  }
  
  updates.push('updated_at = CURRENT_TIMESTAMP');
  values.push(req.userId);
  
  db.run(
    `UPDATE users SET ${updates.join(', ')} WHERE id = ?`,
    values,
    function(err) {
      if (err) {
        return res.status(500).json({ success: false, message: 'Error updating preferences' });
      }
      // Invalidate user cache
      invalidateUserCache(req.userId);
      res.json({ success: true });
    }
  );
});

// Update user profile
router.patch('/:id', verifyToken, (req, res) => {
  const { id } = req.params;
  const { nickname, path, ai_personality, mood_score, anonymous_mode, offline_mode, store_chat, language, currency, country_code, city, region } = req.body;

  if (parseInt(id) !== req.userId) {
    return res.status(403).json({ success: false, message: 'Unauthorized' });
  }

  const updates = [];
  const values = [];

  if (nickname !== undefined) {
    updates.push('nickname = ?');
    values.push(nickname);
  }
  if (path !== undefined) {
    updates.push('path = ?');
    values.push(path);
  }
  if (ai_personality !== undefined) {
    updates.push('ai_personality = ?');
    values.push(ai_personality);
  }
  if (mood_score !== undefined) {
    updates.push('mood_score = ?');
    values.push(mood_score);
  }
  if (anonymous_mode !== undefined) {
    updates.push('anonymous_mode = ?');
    values.push(anonymous_mode ? 1 : 0);
  }
  if (offline_mode !== undefined) {
    updates.push('offline_mode = ?');
    values.push(offline_mode ? 1 : 0);
  }
  if (store_chat !== undefined) {
    updates.push('store_chat = ?');
    values.push(store_chat ? 1 : 0);
  }
  if (language !== undefined) {
    updates.push('language = ?');
    values.push(language);
  }
  if (currency !== undefined) {
    updates.push('currency = ?');
    values.push(currency);
  }
  if (country_code !== undefined) {
    updates.push('country_code = ?');
    values.push(country_code);
  }
  if (city !== undefined) {
    updates.push('city = ?');
    values.push(city);
  }
  if (region !== undefined) {
    updates.push('region = ?');
    values.push(region);
  }

  if (updates.length === 0) {
    return res.status(400).json({ success: false, message: 'No fields to update' });
  }

  updates.push('updated_at = CURRENT_TIMESTAMP');
  values.push(id);

  db.run(
    `UPDATE users SET ${updates.join(', ')} WHERE id = ?`,
    values,
    function(err) {
      if (err) {
        return res.status(500).json({ success: false, message: 'Error updating user' });
      }
      // Invalidate user cache
      invalidateUserCache(req.userId);
      res.json({ success: true });
    }
  );
});

// Save journey blueprint
router.post('/:id/blueprint', verifyToken, (req, res) => {
  const { id } = req.params;
  const { plan_data } = req.body;

  if (parseInt(id) !== req.userId) {
    return res.status(403).json({ success: false, message: 'Unauthorized' });
  }

  db.get('SELECT path, ai_personality FROM users WHERE id = ?', [id], (err, user) => {
    if (err || !user) {
      return res.status(500).json({ success: false, message: 'Error fetching user' });
    }

    db.run(
      'INSERT INTO journey_blueprints (user_id, path, ai_personality, plan_data) VALUES (?, ?, ?, ?)',
      [id, user.path, user.ai_personality, JSON.stringify(plan_data)],
      function(err) {
        if (err) {
          return res.status(500).json({ success: false, message: 'Error saving blueprint' });
        }
        res.json({ success: true, blueprint_id: this.lastID });
      }
    );
  });
});

// Get journey blueprint
router.get('/:id/blueprint', verifyToken, (req, res) => {
  const { id } = req.params;

  if (parseInt(id) !== req.userId) {
    return res.status(403).json({ success: false, message: 'Unauthorized' });
  }

  db.get(
    'SELECT * FROM journey_blueprints WHERE user_id = ? ORDER BY created_at DESC LIMIT 1',
    [id],
    (err, blueprint) => {
      if (err) {
        return res.status(500).json({ success: false, message: 'Error fetching blueprint' });
      }
      if (blueprint) {
        blueprint.plan_data = JSON.parse(blueprint.plan_data);
      }
      res.json({ success: true, blueprint });
    }
  );
});

module.exports = router;

