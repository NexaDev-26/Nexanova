const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { db } = require('../config/database');

/* -------------------------
   JWT SECRET CONFIGURATION
---------------------------- */
const JWT_SECRET =
  process.env.JWT_SECRET ||
  (() => {
    if (process.env.NODE_ENV === 'production') {
      console.error('❌ ERROR: Missing JWT_SECRET in production.');
      process.exit(1);
    }
    console.log('⚠️ Using fallback JWT secret (development only).');
    return 'nexanova-secret-key-change-in-production';
  })();

/* -------------------------
       VALIDATION HELPERS
---------------------------- */
const validateEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

const validatePassword = (password) => {
  if (!password || password.length < 8)
    return { valid: false, message: 'Password must be at least 8 characters' };
  if (!/[a-z]/.test(password))
    return { valid: false, message: 'Password must contain a lowercase letter' };
  if (!/[A-Z]/.test(password))
    return { valid: false, message: 'Password must contain an uppercase letter' };
  if (!/[0-9]/.test(password))
    return { valid: false, message: 'Password must contain a number' };

  return { valid: true };
};

/* -------------------------
        REGISTER USER
---------------------------- */
router.post('/register', (req, res) => {
  console.log('📝 Registration payload:', {
    keys: Object.keys(req.body),
    email: !!req.body.email,
    password: !!req.body.password,
    path: !!req.body.path,
    personality: !!req.body.ai_personality
  });

  const {
    nickname,
    email,
    password,
    path,
    ai_personality,
    anonymous_mode,
    offline_mode,
    store_chat
  } = req.body;

  if (!email || !password || !path || !ai_personality) {
    return res
      .status(400)
      .json({ success: false, message: 'Missing required fields' });
  }

  if (!validateEmail(email)) {
    return res.status(400).json({ success: false, message: 'Invalid email' });
  }

  const pwdCheck = validatePassword(password);
  if (!pwdCheck.valid) {
    return res.status(400).json({ success: false, message: pwdCheck.message });
  }

  const sanitizedEmail = email.trim().toLowerCase();
  const sanitizedPath = path.trim().toLowerCase();
  const sanitizedPersonality = ai_personality.trim().toLowerCase();

  // Check if email exists
  db.get(
    'SELECT id FROM users WHERE email = ?',
    [sanitizedEmail],
    (err, userExists) => {
      if (err) {
        console.error('❌ DB error checking email:', err);
        return res.status(500).json({ success: false, message: 'DB error' });
      }

      if (userExists) {
        return res
          .status(400)
          .json({ success: false, message: 'Email already registered' });
      }

      const finalNickname =
        anonymous_mode || !nickname || nickname.trim() === ''
          ? null
          : nickname.trim();

      // Check nickname
      if (finalNickname) {
        return db.get(
          'SELECT id FROM users WHERE nickname = ?',
          [finalNickname],
          (err, nickExists) => {
            if (err) {
              return res.status(500).json({ success: false, message: 'DB error' });
            }
            if (nickExists) {
              return res.status(400).json({
                success: false,
                message: 'Nickname already taken'
              });
            }
            proceed();
          }
        );
      }

      proceed();

      function proceed() {
        bcrypt.hash(password, 10, (err, hash) => {
          if (err) {
            return res
              .status(500)
              .json({ success: false, message: 'Error hashing password' });
          }

          const moodScore = Math.max(
            1,
            Math.min(10, parseInt(req.body.mood_score) || 5)
          );

          db.run(
            `INSERT INTO users 
            (nickname, email, password_hash, path, ai_personality, mood_score, anonymous_mode, offline_mode, store_chat)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
              finalNickname,
              sanitizedEmail,
              hash,
              sanitizedPath,
              sanitizedPersonality,
              moodScore,
              anonymous_mode ? 1 : 0,
              offline_mode !== false ? 1 : 0,
              store_chat !== false ? 1 : 0
            ],
            function (err) {
              if (err) {
                console.error('❌ Registration error:', err.message);
                return res.status(500).json({
                  success: false,
                  message: 'Registration failed: ' + err.message
                });
              }

              const token = jwt.sign(
                { userId: this.lastID },
                JWT_SECRET,
                { expiresIn: '30d' }
              );

              db.get(
                `SELECT id, nickname, email, path, ai_personality, mood_score, 
                anonymous_mode, offline_mode, store_chat, created_at 
                FROM users WHERE id = ?`,
                [this.lastID],
                (err, newUser) => {
                  if (err || !newUser) {
                    return res.status(500).json({
                      success: false,
                      message: 'User created but cannot retrieve data'
                    });
                  }
                  res.json({
                    success: true,
                    user_id: this.lastID,
                    token,
                    user: newUser
                  });
                }
              );
            }
          );
        });
      }
    }
  );
});

/* -------------------------
            LOGIN
---------------------------- */
router.post('/login', (req, res) => {
  const { email, password } = req.body;

  if (!email || !password)
    return res
      .status(400)
      .json({ success: false, message: 'Email and password required' });

  if (!validateEmail(email))
    return res.status(400).json({ success: false, message: 'Invalid email' });

  const sanitizedEmail = email.trim().toLowerCase();

  db.get(
    'SELECT * FROM users WHERE email = ?',
    [sanitizedEmail],
    (err, user) => {
      if (err)
        return res.status(500).json({ success: false, message: 'DB error' });

      if (!user)
        return res
          .status(401)
          .json({ success: false, message: 'Invalid credentials' });

      bcrypt.compare(password, user.password_hash, (err, match) => {
        if (err || !match)
          return res
            .status(401)
            .json({ success: false, message: 'Invalid credentials' });

        const token = jwt.sign(
          { userId: user.id },
          JWT_SECRET,
          { expiresIn: '30d' }
        );

        const { password_hash, ...userData } = user;

        res.json({ success: true, token, user: userData });
      });
    }
  );
});

/* -------------------------
        VERIFY TOKEN
---------------------------- */
const verifyToken = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];

  if (!token)
    return res.status(401).json({ success: false, message: 'No token provided' });

  jwt.verify(token, JWT_SECRET, (err, decoded) => {
    if (err)
      return res.status(401).json({ success: false, message: 'Invalid token' });

    req.userId = decoded.userId;
    next();
  });
};

module.exports = router;
module.exports.verifyToken = verifyToken;
