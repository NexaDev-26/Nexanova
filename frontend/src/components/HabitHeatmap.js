import React, { useState, useEffect } from 'react';
import api from '../utils/api';
import '../styles/HabitHeatmap.css';

const HabitHeatmap = ({ habitId, completions = [] }) => {
  const [heatmapData, setHeatmapData] = useState({});
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());

  useEffect(() => {
    generateHeatmapData();
  }, [completions, selectedYear, selectedMonth]);

  const generateHeatmapData = () => {
    const data = {};
    const startDate = new Date(selectedYear, selectedMonth, 1);
    const endDate = new Date(selectedYear, selectedMonth + 1, 0);
    
    // Initialize all days in month
    for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
      const dateStr = d.toISOString().split('T')[0];
      data[dateStr] = 0;
    }

    // Mark completed days
    completions.forEach(completion => {
      const dateStr = completion.completion_date;
      if (data.hasOwnProperty(dateStr)) {
        data[dateStr] = 1;
      }
    });

    setHeatmapData(data);
  };

  const getDayIntensity = (dateStr) => {
    return heatmapData[dateStr] || 0;
  };

  const getIntensityClass = (intensity) => {
    if (intensity === 0) return 'intensity-0';
    return 'intensity-1';
  };

  const getDayLabel = (date) => {
    return date.getDate();
  };

  const getWeekdayLabel = (dayIndex) => {
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    return days[dayIndex];
  };

  const renderCalendar = () => {
    const year = selectedYear;
    const month = selectedMonth;
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    const weeks = [];
    let currentWeek = [];

    // Add empty cells for days before month starts
    for (let i = 0; i < startingDayOfWeek; i++) {
      currentWeek.push(null);
    }

    // Add days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(year, month, day);
      const dateStr = date.toISOString().split('T')[0];
      const intensity = getDayIntensity(dateStr);
      
      currentWeek.push({
        day,
        date,
        dateStr,
        intensity
      });

      if (currentWeek.length === 7) {
        weeks.push(currentWeek);
        currentWeek = [];
      }
    }

    // Add empty cells for remaining days in last week
    while (currentWeek.length < 7) {
      currentWeek.push(null);
    }
    if (currentWeek.some(d => d !== null)) {
      weeks.push(currentWeek);
    }

    return weeks;
  };

  const totalCompletions = Object.values(heatmapData).filter(v => v === 1).length;
  const totalDays = Object.keys(heatmapData).length;
  const completionRate = totalDays > 0 ? Math.round((totalCompletions / totalDays) * 100) : 0;

  const weeks = renderCalendar();

  return (
    <div className="habit-heatmap">
      <div className="heatmap-header">
        <div className="heatmap-title">
          <h4>📅 Activity Calendar</h4>
          <p>{new Date(selectedYear, selectedMonth).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}</p>
        </div>
        <div className="heatmap-stats">
          <div className="stat-item">
            <span className="stat-value">{totalCompletions}</span>
            <span className="stat-label">Days Completed</span>
          </div>
          <div className="stat-item">
            <span className="stat-value">{completionRate}%</span>
            <span className="stat-label">Completion Rate</span>
          </div>
        </div>
      </div>

      <div className="month-selector">
        <button 
          className="month-nav-btn"
          onClick={() => {
            if (selectedMonth === 0) {
              setSelectedMonth(11);
              setSelectedYear(selectedYear - 1);
            } else {
              setSelectedMonth(selectedMonth - 1);
            }
          }}
        >
          ← Previous
        </button>
        <span className="current-month">
          {new Date(selectedYear, selectedMonth).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
        </span>
        <button 
          className="month-nav-btn"
          onClick={() => {
            if (selectedMonth === 11) {
              setSelectedMonth(0);
              setSelectedYear(selectedYear + 1);
            } else {
              setSelectedMonth(selectedMonth + 1);
            }
          }}
        >
          Next →
        </button>
      </div>

      <div className="heatmap-calendar">
        <div className="weekday-labels">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
            <div key={day} className="weekday-label">{day}</div>
          ))}
        </div>
        
        <div className="calendar-grid">
          {weeks.map((week, weekIndex) => (
            <div key={weekIndex} className="calendar-week">
              {week.map((day, dayIndex) => {
                if (day === null) {
                  return <div key={dayIndex} className="calendar-day empty"></div>;
                }
                
                const isToday = day.dateStr === new Date().toISOString().split('T')[0];
                const intensity = day.intensity;
                
                return (
                  <div
                    key={dayIndex}
                    className={`calendar-day ${getIntensityClass(intensity)} ${isToday ? 'today' : ''}`}
                    title={`${day.dateStr}: ${intensity === 1 ? 'Completed' : 'Not completed'}`}
                  >
                    <span className="day-number">{day.day}</span>
                    {intensity === 1 && <span className="check-mark">✓</span>}
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      </div>

      <div className="heatmap-legend">
        <div className="legend-item">
          <div className="legend-box intensity-0"></div>
          <span>Not completed</span>
        </div>
        <div className="legend-item">
          <div className="legend-box intensity-1"></div>
          <span>Completed</span>
        </div>
        <div className="legend-item">
          <div className="legend-box today"></div>
          <span>Today</span>
        </div>
      </div>
    </div>
  );
};

export default HabitHeatmap;

