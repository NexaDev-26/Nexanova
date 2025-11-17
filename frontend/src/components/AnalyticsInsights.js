import React, { useState, useEffect } from 'react';
import api from '../utils/api';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import '../styles/AnalyticsInsights.css';

const AnalyticsInsights = () => {
  const [insights, setInsights] = useState(null);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState('week'); // week, month, year

  useEffect(() => {
    loadInsights();
  }, [timeRange]);

  const loadInsights = async () => {
    setLoading(true);
    try {
      const [habitsRes, financeRes, journalRes, moodRes] = await Promise.allSettled([
        api.get('/habits'),
        api.get('/finance'),
        api.get('/journal'),
        api.get('/user/stats')
      ]);

      const habits = habitsRes.status === 'fulfilled' ? habitsRes.value?.data?.habits || [] : [];
      const finance = financeRes.status === 'fulfilled' ? financeRes.value?.data?.finance || [] : [];
      const journal = journalRes.status === 'fulfilled' ? journalRes.value?.data?.entries || [] : [];

      // Calculate insights
      const insightsData = calculateInsights(habits, finance, journal, timeRange);
      setInsights(insightsData);
    } catch (error) {
      console.error('Error loading insights:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculateInsights = (habits, finance, journal, range) => {
    const now = new Date();
    const days = range === 'week' ? 7 : range === 'month' ? 30 : 365;
    const startDate = new Date(now.getTime() - days * 24 * 60 * 60 * 1000);

    // Habit insights
    const activeHabits = habits.filter(h => h.is_active);
    const totalStreak = habits.reduce((sum, h) => sum + (h.streak || 0), 0);
    const avgStreak = activeHabits.length > 0 ? Math.round(totalStreak / activeHabits.length) : 0;
    const completionRate = activeHabits.length > 0 
      ? Math.round((habits.filter(h => h.last_completed === new Date().toISOString().split('T')[0]).length / activeHabits.length) * 100)
      : 0;

    // Finance insights
    const recentFinance = finance.filter(f => new Date(f.date) >= startDate);
    const totalIncome = recentFinance.filter(f => f.type === 'income').reduce((sum, f) => sum + (f.amount || 0), 0);
    const totalExpense = recentFinance.filter(f => f.type === 'expense').reduce((sum, f) => sum + (f.amount || 0), 0);
    const savingsRate = totalIncome > 0 ? Math.round((totalIncome - totalExpense) / totalIncome * 100) : 0;

    // Journal insights
    const recentJournal = journal.filter(j => new Date(j.date) >= startDate);
    const avgMood = recentJournal.length > 0
      ? Math.round(recentJournal.reduce((sum, j) => sum + (j.mood || 5), 0) / recentJournal.length)
      : 5;

    // Trend data
    const habitTrend = generateTrendData(habits, days, 'habits');
    const moodTrend = generateTrendData(journal, days, 'mood');

    // Correlations
    const correlations = calculateCorrelations(habits, journal, finance);

    return {
      habits: {
        active: activeHabits.length,
        avgStreak,
        completionRate,
        totalStreak
      },
      finance: {
        income: totalIncome,
        expense: totalExpense,
        savings: totalIncome - totalExpense,
        savingsRate
      },
      mood: {
        average: avgMood,
        trend: moodTrend
      },
      trends: {
        habits: habitTrend,
        mood: moodTrend
      },
      correlations
    };
  };

  const generateTrendData = (data, days, type) => {
    const result = [];
    const now = new Date();
    
    for (let i = days - 1; i >= 0; i--) {
      const date = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
      const dateStr = date.toISOString().split('T')[0];
      const dayName = date.toLocaleDateString('en-US', { weekday: 'short' });
      
      if (type === 'habits') {
        const completed = data.filter(d => d.last_completed === dateStr).length;
        result.push({ date: dayName, value: completed });
      } else if (type === 'mood') {
        const entries = data.filter(d => d.date === dateStr);
        const avgMood = entries.length > 0
          ? entries.reduce((sum, e) => sum + (e.mood || 5), 0) / entries.length
          : null;
        result.push({ date: dayName, value: avgMood || 5 });
      }
    }
    
    return result;
  };

  const calculateCorrelations = (habits, journal, finance) => {
    const insights = [];
    
    // Habit-Mood correlation
    if (habits.length > 0 && journal.length > 0) {
      const daysWithHabits = habits.filter(h => h.last_completed).length;
      const avgMood = journal.reduce((sum, j) => sum + (j.mood || 5), 0) / journal.length;
      if (daysWithHabits > 0 && avgMood > 6) {
        insights.push({
          type: 'positive',
          text: 'Your mood improves when you complete habits! 📈',
          icon: '🌱😊'
        });
      }
    }

    // Savings insight
    const totalIncome = finance.filter(f => f.type === 'income').reduce((sum, f) => sum + (f.amount || 0), 0);
    const totalExpense = finance.filter(f => f.type === 'expense').reduce((sum, f) => sum + (f.amount || 0), 0);
    if (totalIncome > 0 && totalExpense < totalIncome * 0.7) {
      insights.push({
        type: 'positive',
        text: 'Great savings rate! You\'re saving over 30% 💰',
        icon: '💰'
      });
    }

    return insights;
  };

  if (loading) {
    return (
      <div className="analytics-insights">
        <div className="insights-loading">Loading insights...</div>
      </div>
    );
  }

  if (!insights) return null;

  return (
    <div className="analytics-insights">
      <div className="insights-header">
        <h3>📊 Your Insights</h3>
        <div className="time-range-selector">
          <button
            className={timeRange === 'week' ? 'active' : ''}
            onClick={() => setTimeRange('week')}
          >
            Week
          </button>
          <button
            className={timeRange === 'month' ? 'active' : ''}
            onClick={() => setTimeRange('month')}
          >
            Month
          </button>
          <button
            className={timeRange === 'year' ? 'active' : ''}
            onClick={() => setTimeRange('year')}
          >
            Year
          </button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="insights-metrics">
        <div className="metric-card">
          <div className="metric-icon">🌱</div>
          <div className="metric-value">{insights.habits.active}</div>
          <div className="metric-label">Active Habits</div>
          <div className="metric-sub">{insights.habits.completionRate}% completion rate</div>
        </div>
        <div className="metric-card">
          <div className="metric-icon">🔥</div>
          <div className="metric-value">{insights.habits.avgStreak}</div>
          <div className="metric-label">Avg Streak (days)</div>
          <div className="metric-sub">{insights.habits.totalStreak} total streak days</div>
        </div>
        <div className="metric-card">
          <div className="metric-icon">💰</div>
          <div className="metric-value">{insights.finance.savingsRate}%</div>
          <div className="metric-label">Savings Rate</div>
          <div className="metric-sub">{insights.finance.savings.toLocaleString()} TZS saved</div>
        </div>
        <div className="metric-card">
          <div className="metric-icon">😊</div>
          <div className="metric-value">{insights.mood.average}/10</div>
          <div className="metric-label">Avg Mood</div>
          <div className="metric-sub">Based on journal entries</div>
        </div>
      </div>

      {/* Trends */}
      {insights.trends.habits.length > 0 && (
        <div className="insight-chart">
          <h4>Habit Completion Trend</h4>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={insights.trends.habits}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Line type="monotone" dataKey="value" stroke="#14b8a6" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Correlations */}
      {insights.correlations.length > 0 && (
        <div className="insights-correlations">
          <h4>💡 Insights</h4>
          {insights.correlations.map((correlation, idx) => (
            <div key={idx} className={`correlation-item ${correlation.type}`}>
              <span className="correlation-icon">{correlation.icon}</span>
              <span className="correlation-text">{correlation.text}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AnalyticsInsights;

