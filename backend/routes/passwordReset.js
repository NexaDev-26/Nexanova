const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { db } = require('../config/database');
const { verifyToken } = require('./auth');

const JWT_SECRET = process.env.JWT_SECRET || 'nexanova-secret-key-change-in-production';

// Request password reset (in production, this would send an email)
router.post('/request-reset', (req, res) => {
  const { email } = req.body;

  if (!email) {
    return res.status(400).json({ success: false, message: 'Email required' });
  }

  // Check if user exists
  db.get('SELECT id, email FROM users WHERE email = ?', [email.trim().toLowerCase()], (err, user) => {
    if (err) {
      return res.status(500).json({ success: false, message: 'Database error' });
    }

    if (!user) {
      // Don't reveal if email exists for security
      return res.json({ 
        success: true, 
        message: 'If the email exists, a reset link has been sent.' 
      });
    }

    // Generate reset token (valid for 1 hour)
    const resetToken = jwt.sign(
      { userId: user.id, type: 'password-reset' }, 
      JWT_SECRET, 
      { expiresIn: '1h' }
    );

    // In production, send email with reset link
    // For now, return token (in production, this would be sent via email)
    console.log(`Password reset token for ${user.email}: ${resetToken}`);
    
    // In development, return token for testing
    if (process.env.NODE_ENV === 'development') {
      return res.json({
        success: true,
        message: 'Reset token generated (dev mode)',
        resetToken: resetToken // Only in development!
      });
    }

    res.json({
      success: true,
      message: 'If the email exists, a reset link has been sent.'
    });
  });
});

// Reset password with token
router.post('/reset', (req, res) => {
  const { token, newPassword } = req.body;

  if (!token || !newPassword) {
    return res.status(400).json({ success: false, message: 'Token and new password required' });
  }

  // Validate password strength
  if (newPassword.length < 8) {
    return res.status(400).json({ success: false, message: 'Password must be at least 8 characters long' });
  }
  if (!/[a-z]/.test(newPassword)) {
    return res.status(400).json({ success: false, message: 'Password must contain at least one lowercase letter' });
  }
  if (!/[A-Z]/.test(newPassword)) {
    return res.status(400).json({ success: false, message: 'Password must contain at least one uppercase letter' });
  }
  if (!/[0-9]/.test(newPassword)) {
    return res.status(400).json({ success: false, message: 'Password must contain at least one number' });
  }

  // Verify token
  jwt.verify(token, JWT_SECRET, (err, decoded) => {
    if (err || decoded.type !== 'password-reset') {
      return res.status(400).json({ success: false, message: 'Invalid or expired reset token' });
    }

    // Hash new password
    bcrypt.hash(newPassword, 10, (hashErr, hash) => {
      if (hashErr) {
        return res.status(500).json({ success: false, message: 'Error hashing password' });
      }

      // Update password
      db.run('UPDATE users SET password_hash = ? WHERE id = ?', [hash, decoded.userId], (updateErr) => {
        if (updateErr) {
          return res.status(500).json({ success: false, message: 'Error updating password' });
        }

        res.json({ success: true, message: 'Password reset successfully' });
      });
    });
  });
});

// Change password (for logged-in users)
router.post('/change', verifyToken, (req, res) => {
  const { currentPassword, newPassword } = req.body;

  if (!currentPassword || !newPassword) {
    return res.status(400).json({ success: false, message: 'Current and new password required' });
  }

  // Validate new password strength
  if (newPassword.length < 8) {
    return res.status(400).json({ success: false, message: 'Password must be at least 8 characters long' });
  }
  if (!/[a-z]/.test(newPassword)) {
    return res.status(400).json({ success: false, message: 'Password must contain at least one lowercase letter' });
  }
  if (!/[A-Z]/.test(newPassword)) {
    return res.status(400).json({ success: false, message: 'Password must contain at least one uppercase letter' });
  }
  if (!/[0-9]/.test(newPassword)) {
    return res.status(400).json({ success: false, message: 'Password must contain at least one number' });
  }

  // Get current user
  db.get('SELECT password_hash FROM users WHERE id = ?', [req.userId], (err, user) => {
    if (err || !user) {
      return res.status(500).json({ success: false, message: 'Error fetching user' });
    }

    // Verify current password
    bcrypt.compare(currentPassword, user.password_hash, (compareErr, match) => {
      if (compareErr || !match) {
        return res.status(401).json({ success: false, message: 'Current password is incorrect' });
      }

      // Hash new password
      bcrypt.hash(newPassword, 10, (hashErr, hash) => {
        if (hashErr) {
          return res.status(500).json({ success: false, message: 'Error hashing password' });
        }

        // Update password
        db.run('UPDATE users SET password_hash = ? WHERE id = ?', [hash, req.userId], (updateErr) => {
          if (updateErr) {
            return res.status(500).json({ success: false, message: 'Error updating password' });
          }

          res.json({ success: true, message: 'Password changed successfully' });
        });
      });
    });
  });
});

module.exports = router;

