const express = require('express');
const router = express.Router();
const { db } = require('../config/database');
const { verifyToken } = require('./auth');
const { cacheMiddleware, invalidateUserCache } = require('../utils/cache');

// Get all rewards (cached for 5 minutes)
router.get('/', verifyToken, cacheMiddleware({ ttl: 5 * 60 * 1000, prefix: 'rewards' }), (req, res) => {
  db.all(
    'SELECT * FROM rewards WHERE user_id = ? ORDER BY awarded_at DESC',
    [req.userId],
    (err, rewards) => {
      if (err) {
        return res.status(500).json({ success: false, message: 'Error fetching rewards' });
      }
      res.json({ success: true, rewards });
    }
  );
});

// Award reward (system use)
router.post('/award', verifyToken, (req, res) => {
  const { type, title, description } = req.body;

  if (!type || !title) {
    return res.status(400).json({ success: false, message: 'Type and title required' });
  }

  db.run(
    'INSERT INTO rewards (user_id, type, title, description) VALUES (?, ?, ?, ?)',
    [req.userId, type, title, description || ''],
    function(err) {
      if (err) {
        return res.status(500).json({ success: false, message: 'Error awarding reward' });
      }
      // Invalidate user's rewards cache
      invalidateUserCache(req.userId);
      res.json({ success: true, reward_id: this.lastID });
    }
  );
});

module.exports = router;

