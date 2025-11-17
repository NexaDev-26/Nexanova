const express = require('express');
const router = express.Router();
const { db } = require('../config/database');
const { verifyToken } = require('./auth');

// Send message to AI
router.post('/', verifyToken, (req, res) => {
  const { message, mood_score, context } = req.body;

  if (!message) {
    return res.status(400).json({ success: false, message: 'Message required' });
  }

  // Get user info
  db.get('SELECT path, ai_personality FROM users WHERE id = ?', [req.userId], (err, user) => {
    if (err || !user) {
      return res.status(500).json({ success: false, message: 'Error fetching user' });
    }

    // Generate AI response
    const aiResponse = generateAIResponse(message, user.path, user.ai_personality, mood_score);

    // Store chat if user allows
    db.get('SELECT store_chat FROM users WHERE id = ?', [req.userId], (err, userSettings) => {
      if (userSettings && userSettings.store_chat) {
        db.run(
          'INSERT INTO ai_chats (user_id, message, response, mood_score, path_context) VALUES (?, ?, ?, ?, ?)',
          [req.userId, message, aiResponse.response, mood_score || 0, user.path],
          () => {}
        );
      }
    });

    // Update user mood score
    if (mood_score !== undefined) {
      db.run('UPDATE users SET mood_score = ? WHERE id = ?', [mood_score, req.userId], () => {});
    }

    res.json({
      success: true,
      response: aiResponse.response,
      suggestions: aiResponse.suggestions,
      mood_score: mood_score || 0
    });
  });
});

// Get chat history
router.get('/history', verifyToken, (req, res) => {
  db.get('SELECT store_chat FROM users WHERE id = ?', [req.userId], (err, userSettings) => {
    if (!userSettings || !userSettings.store_chat) {
      return res.json({ success: true, chats: [] });
    }

    db.all(
      'SELECT * FROM ai_chats WHERE user_id = ? ORDER BY created_at DESC LIMIT 50',
      [req.userId],
      (err, chats) => {
        if (err) {
          return res.status(500).json({ success: false, message: 'Error fetching chat history' });
        }
        res.json({ success: true, chats: chats.reverse() });
      }
    );
  });
});

// Get AI reflection summary
router.get('/reflection', verifyToken, (req, res) => {
  db.all(
    'SELECT mood_score, created_at FROM ai_chats WHERE user_id = ? AND mood_score IS NOT NULL ORDER BY created_at DESC LIMIT 7',
    [req.userId],
    (err, recentChats) => {
      if (err) {
        return res.status(500).json({ success: false, message: 'Error fetching reflection data' });
      }

      const moodScores = recentChats.map(c => c.mood_score);
      const avgMood = moodScores.length > 0 
        ? Math.round(moodScores.reduce((a, b) => a + b, 0) / moodScores.length)
        : 0;

      const trend = moodScores.length >= 2 
        ? (moodScores[0] > moodScores[moodScores.length - 1] ? 'improving' : 'needs_attention')
        : 'stable';

      const suggestions = generateReflectionSuggestions(trend, avgMood);

      res.json({
        success: true,
        emotion_trend: trend,
        average_mood: avgMood,
        suggested_action: suggestions.action,
        message: suggestions.message
      });
    }
  );
});

function generateAIResponse(userMessage, path, personality, moodScore) {
  const mood = moodScore || 5;
  const isLowMood = mood < 4;
  const messageLower = userMessage.toLowerCase();

  let response = '';
  let suggestions = [];

  // Handle tool-specific requests
  if (messageLower.includes('breathing') || messageLower.includes('4-7-8')) {
    return generateBreathingExercise(personality);
  }
  if (messageLower.includes('grounding') || messageLower.includes('5-4-3-2-1')) {
    return generateGroundingTechnique(personality);
  }
  if (messageLower.includes('mood check') || messageLower.includes('how am i feeling')) {
    return generateMoodCheckIn(mood, personality);
  }
  if (messageLower.includes('sleep story') || messageLower.includes('bedtime')) {
    return generateSleepStory(personality);
  }
  if (messageLower.includes('meditation') || messageLower.includes('mindfulness')) {
    return generateMeditationGuide(personality);
  }
  if (messageLower.includes('crisis') || messageLower.includes('immediate support') || messageLower.includes('emergency')) {
    return generateCrisisSupport(personality);
  }
  if (messageLower.includes('challenge') && messageLower.includes('thought')) {
    return generateCBTThoughtChallenge(personality);
  }
  if (messageLower.includes('gratitude')) {
    return generateGratitudePractice(personality);
  }
  if (messageLower.includes('self-compassion') || messageLower.includes('be kind')) {
    return generateSelfCompassion(personality);
  }

  const personalities = {
    wise_sage: {
      greeting: 'My child,',
      tone: 'gentle and wise',
      proverbs: [
        'As the Swahili say: "Haba na haba hujaza kibaba" - Little by little fills the pot.',
        'Remember: "Mtu ni watu" - A person is people. You are not alone.',
        'As our elders teach: "Haraka haraka haina baraka" - Haste has no blessing. Take it slow.'
      ]
    },
    coach: {
      greeting: 'Hey champion,',
      tone: 'motivational and energetic',
      proverbs: [
        'You got this! "Kupanda mlima huanza na hatua moja" - Climbing a mountain starts with one step.',
        'Keep pushing! "Mvumilivu hula mbivu" - The patient one eats the ripe fruit.',
        'Stay strong! "Juhudi zako hazitakosa matokeo" - Your efforts will not lack results.'
      ]
    },
    friend: {
      greeting: 'Hey friend,',
      tone: 'warm and supportive',
      proverbs: [
        'I hear you. "Pamoja tunaweza" - Together we can.',
        'You\'re doing great! "Kila siku ni fursa mpya" - Every day is a new opportunity.',
        'Remember: "Usiache mbachao kwa msala upitao" - Don\'t abandon your mat for a passing prayer.'
      ]
    }
  };

  const personalityData = personalities[personality] || personalities.friend;
  const proverb = personalityData.proverbs[Math.floor(Math.random() * personalityData.proverbs.length)];

  if (path === 'mind_reset' || path === 'all') {
    if (isLowMood) {
      response = `${personalityData.greeting} I can feel you're going through a tough time. Your feelings are valid, and it's okay to not be okay right now. ${proverb}\n\nTake a deep breath. Can you name one small thing that made you smile today, even briefly? Sometimes, acknowledging the tiny moments of light helps us see that darkness isn't permanent.`;
      suggestions = [
        { type: 'action', text: 'Write 3 things you\'re grateful for', icon: '📝' },
        { type: 'action', text: 'Take 5 deep breaths', icon: '🌬️' },
        { type: 'action', text: 'Listen to calming music', icon: '🎵' }
      ];
    } else {
      response = `${personalityData.greeting} I'm glad you're here. ${proverb}\n\nHow are you feeling today? Sometimes just talking about what's on your mind can help lighten the load. What's one thing you'd like to work on or understand better about yourself?`;
      suggestions = [
        { type: 'action', text: 'Journal your thoughts', icon: '📔' },
        { type: 'action', text: 'Practice gratitude', icon: '🙏' },
        { type: 'action', text: 'Set a small daily intention', icon: '✨' }
      ];
    }
  } else if (path === 'money_builder') {
    response = `${personalityData.greeting} Let's talk about your financial journey. ${proverb}\n\nEvery small step counts. What's one financial goal you have right now? Whether it's saving 500 TZS today or learning about a new way to earn, I'm here to help you build.`;
    suggestions = [
      { type: 'action', text: 'Save 500 TZS today', icon: '💰' },
      { type: 'action', text: 'Track today\'s expenses', icon: '📊' },
      { type: 'action', text: 'Explore side hustle ideas', icon: '💡' }
    ];
  } else if (path === 'habit_transformer') {
    response = `${personalityData.greeting} Building habits is like planting seeds - they grow with consistent care. ${proverb}\n\nWhat habit are you working on today? Remember, even doing it for 2 minutes counts. Progress, not perfection.`;
    suggestions = [
      { type: 'action', text: 'Complete your habit for today', icon: '✅' },
      { type: 'action', text: 'Reflect on what triggered you', icon: '🤔' },
      { type: 'action', text: 'Celebrate your streak', icon: '🎉' }
    ];
  } else {
    response = `${personalityData.greeting} I'm here to support you on your journey. ${proverb}\n\nHow can I help you today?`;
    suggestions = [
      { type: 'action', text: 'Check your progress', icon: '📈' },
      { type: 'action', text: 'Set a small goal', icon: '🎯' }
    ];
  }

  return { response, suggestions };
}

function generateReflectionSuggestions(trend, avgMood) {
  if (trend === 'improving') {
    return {
      action: 'Continue your current practices',
      message: 'Great progress! Your mood is improving. Keep doing what you\'re doing.'
    };
  } else if (trend === 'needs_attention') {
    return {
      action: 'Take a break and practice self-care',
      message: 'I notice you might need some extra support. Consider reaching out or trying a calming activity.'
    };
  } else {
    return {
      action: 'Maintain consistency',
      message: 'You\'re on a steady path. Keep up the good work!'
    };
  }
}

// Wysa-like tool functions
function generateBreathingExercise(personality) {
  const personalities = {
    wise_sage: { greeting: 'My child,' },
    coach: { greeting: 'Hey champion,' },
    friend: { greeting: 'Hey friend,' }
  };
  const personalityData = personalities[personality] || personalities.friend;
  
  return {
    response: `${personalityData.greeting} Let's practice the 4-7-8 breathing technique. This helps calm your nervous system.\n\nHere's how:\n1. Breathe in through your nose for 4 counts\n2. Hold your breath for 7 counts\n3. Exhale slowly through your mouth for 8 counts\n\nRepeat this cycle 4 times. Focus on the rhythm and let your body relax with each breath. You're doing great! 🌬️`,
    suggestions: [
      { type: 'action', text: 'Start breathing exercise', icon: '🌬️' },
      { type: 'action', text: 'Try grounding technique', icon: '🌍' },
      { type: 'action', text: 'Check my mood', icon: '💭' }
    ]
  };
}

function generateGroundingTechnique(personality) {
  const personalities = {
    wise_sage: { greeting: 'My child,' },
    coach: { greeting: 'Hey champion,' },
    friend: { greeting: 'Hey friend,' }
  };
  const personalityData = personalities[personality] || personalities.friend;
  
  return {
    response: `${personalityData.greeting} The 5-4-3-2-1 grounding technique helps bring you back to the present moment.\n\nLet's do this together:\n\n**5 things you can SEE** - Look around and name 5 things you see\n**4 things you can TOUCH** - Notice 4 textures or surfaces\n**3 things you can HEAR** - Listen for 3 different sounds\n**2 things you can SMELL** - Identify 2 scents around you\n**1 thing you can TASTE** - Notice 1 taste in your mouth\n\nTake your time with each step. This helps your mind focus on the present. 🌍`,
    suggestions: [
      { type: 'action', text: 'Try breathing exercise', icon: '🌬️' },
      { type: 'action', text: 'Practice mindfulness', icon: '🧘' },
      { type: 'action', text: 'Do a mood check-in', icon: '💭' }
    ]
  };
}

function generateMoodCheckIn(mood, personality) {
  const personalities = {
    wise_sage: { greeting: 'My child,' },
    coach: { greeting: 'Hey champion,' },
    friend: { greeting: 'Hey friend,' }
  };
  const personalityData = personalities[personality] || personalities.friend;
  
  let moodResponse = '';
  if (mood < 4) {
    moodResponse = 'I notice you\'re feeling low right now. Your feelings are completely valid. What\'s one small thing that might help you feel even slightly better?';
  } else if (mood < 7) {
    moodResponse = 'You\'re in a moderate space. What\'s contributing to how you\'re feeling today?';
  } else {
    moodResponse = 'It\'s wonderful that you\'re feeling good! What\'s helping you feel this way?';
  }
  
  return {
    response: `${personalityData.greeting} Let's check in with how you're feeling.\n\nYour current mood: ${mood}/10\n\n${moodResponse}\n\nRemember, moods change like weather - they come and go. What you're feeling right now won't last forever. 💭`,
    suggestions: [
      { type: 'action', text: 'Try breathing exercise', icon: '🌬️' },
      { type: 'action', text: 'Practice gratitude', icon: '🙏' },
      { type: 'action', text: 'Journal my thoughts', icon: '📔' }
    ]
  };
}

function generateSleepStory(personality) {
  const personalities = {
    wise_sage: { greeting: 'My child,' },
    coach: { greeting: 'Hey champion,' },
    friend: { greeting: 'Hey friend,' }
  };
  const personalityData = personalities[personality] || personalities.friend;
  
  const stories = [
    'Imagine you\'re walking through a peaceful forest at twilight. The trees sway gently, and you hear the soft rustle of leaves. With each step, you feel more relaxed. The path leads to a clearing where fireflies dance in the evening air. You find a comfortable spot and watch them, feeling your body grow heavier and more peaceful...',
    'Picture yourself on a quiet beach at sunset. The waves gently lap the shore in a steady rhythm. Each wave washes away any tension, leaving you feeling lighter. The sky turns from orange to purple to deep blue. Stars begin to appear, and you feel yourself drifting into peaceful rest...',
    'Envision a cozy cabin in the mountains. Snow falls softly outside, and you\'re wrapped in a warm blanket by the fireplace. The crackling fire creates a gentle, rhythmic sound. You watch the flames dance, feeling safe and comfortable. Your breathing slows, and you drift into deep relaxation...'
  ];
  
  const story = stories[Math.floor(Math.random() * stories.length)];
  
  return {
    response: `${personalityData.greeting} Let me tell you a calming story to help you relax...\n\n${story}\n\nTake deep, slow breaths as you imagine this scene. Let your body relax completely. Sweet dreams. 🌙`,
    suggestions: [
      { type: 'action', text: 'Try breathing exercise', icon: '🌬️' },
      { type: 'action', text: 'Practice meditation', icon: '🧘' },
      { type: 'action', text: 'Another sleep story', icon: '🌙' }
    ]
  };
}

function generateMeditationGuide(personality) {
  const personalities = {
    wise_sage: { greeting: 'My child,' },
    coach: { greeting: 'Hey champion,' },
    friend: { greeting: 'Hey friend,' }
  };
  const personalityData = personalities[personality] || personalities.friend;
  
  return {
    response: `${personalityData.greeting} Let's practice a 5-minute mindfulness meditation.\n\n**Find a comfortable position** - Sit or lie down comfortably\n\n**Close your eyes** and take 3 deep breaths\n\n**Body scan** - Starting from your toes, slowly notice each part of your body. Don't judge, just observe.\n\n**Focus on your breath** - Feel the air entering and leaving your body. When your mind wanders (it will!), gently bring it back to your breath.\n\n**Continue for 5 minutes** - Set a timer if needed. There's no right or wrong way to meditate.\n\n**Open your eyes slowly** when you're ready.\n\nRemember: meditation is practice, not perfection. 🧘`,
    suggestions: [
      { type: 'action', text: 'Try breathing exercise', icon: '🌬️' },
      { type: 'action', text: 'Practice grounding', icon: '🌍' },
      { type: 'action', text: 'Check my mood', icon: '💭' }
    ]
  };
}

function generateCrisisSupport(personality) {
  const personalities = {
    wise_sage: { greeting: 'My child,' },
    coach: { greeting: 'Hey champion,' },
    friend: { greeting: 'Hey friend,' }
  };
  const personalityData = personalities[personality] || personalities.friend;
  
  return {
    response: `${personalityData.greeting} I'm here with you right now. You're not alone.\n\n**Immediate Support Resources:**\n\n• **Crisis Text Line**: Text HOME to 741741 (available 24/7)\n• **National Suicide Prevention Lifeline**: 988 (US) or your local crisis line\n• **Emergency Services**: 911 or your local emergency number\n\n**Right now, try:**\n1. Take 5 deep breaths\n2. Use the 5-4-3-2-1 grounding technique\n3. Reach out to someone you trust\n4. Remember: This feeling will pass\n\nYou matter. Your life matters. Help is available. 🆘`,
    suggestions: [
      { type: 'action', text: 'Try breathing exercise', icon: '🌬️' },
      { type: 'action', text: 'Practice grounding', icon: '🌍' },
      { type: 'action', text: 'Talk to me more', icon: '💬' }
    ]
  };
}

function generateCBTThoughtChallenge(personality) {
  const personalities = {
    wise_sage: { greeting: 'My child,' },
    coach: { greeting: 'Hey champion,' },
    friend: { greeting: 'Hey friend,' }
  };
  const personalityData = personalities[personality] || personalities.friend;
  
  return {
    response: `${personalityData.greeting} Let's challenge that negative thought together using CBT techniques.\n\n**Step 1: Identify the thought**\nWhat's the specific thought that's bothering you?\n\n**Step 2: Examine the evidence**\n- What evidence supports this thought?\n- What evidence contradicts it?\n\n**Step 3: Consider alternatives**\n- What's another way to look at this?\n- What would you tell a friend in this situation?\n\n**Step 4: Reframe**\n- What's a more balanced, realistic thought?\n\nShare your thought with me, and we'll work through it together. 💭`,
    suggestions: [
      { type: 'action', text: 'Try gratitude practice', icon: '🙏' },
      { type: 'action', text: 'Practice self-compassion', icon: '💚' },
      { type: 'action', text: 'Do a mood check-in', icon: '💭' }
    ]
  };
}

function generateGratitudePractice(personality) {
  const personalities = {
    wise_sage: { greeting: 'My child,' },
    coach: { greeting: 'Hey champion,' },
    friend: { greeting: 'Hey friend,' }
  };
  const personalityData = personalities[personality] || personalities.friend;
  
  return {
    response: `${personalityData.greeting} Gratitude practice can shift your perspective. Let's do this together.\n\n**Think of 3 things you're grateful for today:**\n\n1. Something small that happened today\n2. A person in your life\n3. Something about yourself\n\nTake a moment to really feel the gratitude for each one. Notice how it feels in your body.\n\n**Reflection:** How does focusing on gratitude change how you feel right now?\n\nRemember: "Haba na haba hujaza kibaba" - Little by little fills the pot. Small moments of gratitude add up. 🙏`,
    suggestions: [
      { type: 'action', text: 'Practice self-compassion', icon: '💚' },
      { type: 'action', text: 'Try breathing exercise', icon: '🌬️' },
      { type: 'action', text: 'Journal my thoughts', icon: '📔' }
    ]
  };
}

function generateSelfCompassion(personality) {
  const personalities = {
    wise_sage: { greeting: 'My child,' },
    coach: { greeting: 'Hey champion,' },
    friend: { greeting: 'Hey friend,' }
  };
  const personalityData = personalities[personality] || personalities.friend;
  
  return {
    response: `${personalityData.greeting} Let's practice self-compassion. You deserve the same kindness you'd show a friend.\n\n**Self-Compassion Exercise:**\n\n1. **Acknowledge your pain** - "I'm struggling right now, and that's okay."\n\n2. **Remember common humanity** - "Others feel this way too. I'm not alone."\n\n3. **Be kind to yourself** - "What would I say to a friend in this situation?"\n\n4. **Place your hand on your heart** - Feel the warmth and care.\n\n5. **Repeat:** "May I be kind to myself. May I accept myself as I am."\n\nYou are worthy of compassion, especially from yourself. 💚`,
    suggestions: [
      { type: 'action', text: 'Practice gratitude', icon: '🙏' },
      { type: 'action', text: 'Try breathing exercise', icon: '🌬️' },
      { type: 'action', text: 'Check my mood', icon: '💭' }
    ]
  };
}

module.exports = router;

