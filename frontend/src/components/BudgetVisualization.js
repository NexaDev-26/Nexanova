import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import '../styles/BudgetVisualization.css';

const BudgetVisualization = ({ budget, spent, savingsGoal }) => {
  const remaining = Math.max(0, budget - spent);
  const overBudget = spent > budget ? spent - budget : 0;
  
  const budgetData = [
    { name: 'Spent', value: Math.min(spent, budget), color: '#ef4444' },
    { name: 'Remaining', value: remaining, color: '#10b981' },
    ...(overBudget > 0 ? [{ name: 'Over Budget', value: overBudget, color: '#dc2626' }] : [])
  ];

  const savingsProgress = savingsGoal?.target > 0 
    ? (savingsGoal.current / savingsGoal.target) * 100 
    : 0;

  const daysRemaining = savingsGoal?.deadline 
    ? Math.ceil((new Date(savingsGoal.deadline) - new Date()) / (1000 * 60 * 60 * 24))
    : null;

  const dailySavingsNeeded = savingsGoal?.target > 0 && daysRemaining > 0
    ? Math.ceil((savingsGoal.target - savingsGoal.current) / daysRemaining)
    : null;

  return (
    <div className="budget-visualization">
      <div className="visualization-grid">
        {/* Budget Pie Chart */}
        {budget > 0 && (
          <div className="visualization-card">
            <h4>📊 Budget Breakdown</h4>
            <div className="chart-container">
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie
                    data={budgetData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {budgetData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => `${value.toLocaleString()} TZS`} />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="budget-stats">
              <div className="stat-item">
                <span className="stat-label">Budget</span>
                <span className="stat-value">{budget.toLocaleString()} TZS</span>
              </div>
              <div className="stat-item">
                <span className="stat-label">Spent</span>
                <span className={`stat-value ${spent > budget ? 'over' : ''}`}>
                  {spent.toLocaleString()} TZS
                </span>
              </div>
              <div className="stat-item">
                <span className="stat-label">Remaining</span>
                <span className="stat-value positive">
                  {remaining.toLocaleString()} TZS
                </span>
              </div>
              {overBudget > 0 && (
                <div className="stat-item warning">
                  <span className="stat-label">Over Budget</span>
                  <span className="stat-value negative">
                    {overBudget.toLocaleString()} TZS
                  </span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Savings Goal Visualization */}
        {savingsGoal?.target > 0 && (
          <div className="visualization-card">
            <h4>🎯 Savings Goal Progress</h4>
            <div className="savings-progress-container">
              <div className="savings-circle">
                <div className="progress-ring">
                  <svg width="200" height="200" viewBox="0 0 200 200">
                    <circle
                      cx="100"
                      cy="100"
                      r="80"
                      fill="none"
                      stroke="var(--border)"
                      strokeWidth="12"
                    />
                    <circle
                      cx="100"
                      cy="100"
                      r="80"
                      fill="none"
                      stroke="var(--teal)"
                      strokeWidth="12"
                      strokeDasharray={`${2 * Math.PI * 80}`}
                      strokeDashoffset={`${2 * Math.PI * 80 * (1 - savingsProgress / 100)}`}
                      strokeLinecap="round"
                      transform="rotate(-90 100 100)"
                    />
                  </svg>
                  <div className="progress-text-overlay">
                    <span className="progress-percentage">{savingsProgress.toFixed(0)}%</span>
                    <span className="progress-label">Complete</span>
                  </div>
                </div>
              </div>
              <div className="savings-details">
                <div className="detail-item">
                  <span className="detail-label">Current Savings</span>
                  <span className="detail-value">{savingsGoal.current.toLocaleString()} TZS</span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Target</span>
                  <span className="detail-value">{savingsGoal.target.toLocaleString()} TZS</span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Remaining</span>
                  <span className="detail-value">
                    {(savingsGoal.target - savingsGoal.current).toLocaleString()} TZS
                  </span>
                </div>
                {daysRemaining && daysRemaining > 0 && (
                  <>
                    <div className="detail-item">
                      <span className="detail-label">Days Remaining</span>
                      <span className="detail-value">{daysRemaining} days</span>
                    </div>
                    {dailySavingsNeeded && (
                      <div className="detail-item highlight">
                        <span className="detail-label">Daily Savings Needed</span>
                        <span className="detail-value">{dailySavingsNeeded.toLocaleString()} TZS/day</span>
                      </div>
                    )}
                  </>
                )}
                {savingsGoal.deadline && (
                  <div className="detail-item">
                    <span className="detail-label">Deadline</span>
                    <span className="detail-value">
                      {new Date(savingsGoal.deadline).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric'
                      })}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Budget Health Indicator */}
        {budget > 0 && (
          <div className="visualization-card">
            <h4>💚 Budget Health</h4>
            <div className="health-indicator">
              {spent <= budget * 0.5 ? (
                <div className="health-status excellent">
                  <div className="health-icon">✅</div>
                  <div className="health-text">
                    <h5>Excellent</h5>
                    <p>You're spending less than 50% of your budget. Great job!</p>
                  </div>
                </div>
              ) : spent <= budget * 0.75 ? (
                <div className="health-status good">
                  <div className="health-icon">👍</div>
                  <div className="health-text">
                    <h5>Good</h5>
                    <p>You're on track. Keep monitoring your spending.</p>
                  </div>
                </div>
              ) : spent <= budget ? (
                <div className="health-status warning">
                  <div className="health-icon">⚠️</div>
                  <div className="health-text">
                    <h5>Caution</h5>
                    <p>You're approaching your budget limit. Be mindful of expenses.</p>
                  </div>
                </div>
              ) : (
                <div className="health-status critical">
                  <div className="health-icon">🚨</div>
                  <div className="health-text">
                    <h5>Over Budget</h5>
                    <p>You've exceeded your budget. Review your expenses and adjust.</p>
                  </div>
                </div>
              )}
              <div className="health-bar">
                <div 
                  className={`health-fill ${spent <= budget * 0.5 ? 'excellent' : spent <= budget * 0.75 ? 'good' : spent <= budget ? 'warning' : 'critical'}`}
                  style={{ width: `${Math.min((spent / budget) * 100, 100)}%` }}
                ></div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default BudgetVisualization;

