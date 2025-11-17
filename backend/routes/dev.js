const express = require('express');
const router = express.Router();
const { db } = require('../config/database');

// Development route to clear test data (only in development)
if (process.env.NODE_ENV === 'development') {
  router.post('/clear-test-data', (req, res) => {
    db.serialize(() => {
      db.run('DELETE FROM habit_completions', (err) => {
        if (err) console.error('Error clearing habit_completions:', err);
      });
      db.run('DELETE FROM habits', (err) => {
        if (err) console.error('Error clearing habits:', err);
      });
      db.run('DELETE FROM finance', (err) => {
        if (err) console.error('Error clearing finance:', err);
      });
      db.run('DELETE FROM ai_chats', (err) => {
        if (err) console.error('Error clearing ai_chats:', err);
      });
      db.run('DELETE FROM rewards', (err) => {
        if (err) console.error('Error clearing rewards:', err);
      });
      db.run('DELETE FROM journey_blueprints', (err) => {
        if (err) console.error('Error clearing journey_blueprints:', err);
      });
      db.run('DELETE FROM users', (err) => {
        if (err) {
          console.error('Error clearing users:', err);
          return res.status(500).json({ success: false, message: 'Error clearing data' });
        }
        res.json({ success: true, message: 'Test data cleared' });
      });
    });
  });
}

module.exports = router;

