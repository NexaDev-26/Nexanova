import jsPDF from 'jspdf';
// Import jspdf-autotable as side-effect to add autoTable method to jsPDF
import 'jspdf-autotable';

/**
 * Enhanced PDF Report Generator for NexaNova
 * Generates comprehensive reports with charts, statistics, and formatted data
 */

const TEAL_COLOR = [20, 184, 166];
const GRAY_COLOR = [100, 100, 100];
const LIGHT_GRAY = [240, 240, 240];

/**
 * Generate comprehensive user journey report
 */
export const generateJourneyReport = async (userData, api) => {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  let yPosition = 20;

  try {
    // Fetch all data
    const [habitsRes, financeRes, journalRes, financeSummaryRes, chatRes] = await Promise.allSettled([
      api.get('/habits'),
      api.get('/finance'),
      api.get('/journal'),
      api.get('/finance/summary'),
      api.get('/chat/history')
    ]);

    // Cover Page
    doc.setFillColor(...TEAL_COLOR);
    doc.rect(0, 0, pageWidth, 60, 'F');
    
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(28);
    doc.setFont('helvetica', 'bold');
    doc.text('NexaNova', pageWidth / 2, 30, { align: 'center' });
    
    doc.setFontSize(16);
    doc.setFont('helvetica', 'normal');
    doc.text('Your Personal Growth Journey', pageWidth / 2, 40, { align: 'center' });
    
    doc.setFontSize(12);
    doc.text(`Report Generated: ${new Date().toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    })}`, pageWidth / 2, 50, { align: 'center' });

    yPosition = 80;
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('Executive Summary', 14, yPosition);
    yPosition += 10;

    // User Stats Summary
    const habits = habitsRes.status === 'fulfilled' ? habitsRes.value?.data?.habits || [] : [];
    const finance = financeRes.status === 'fulfilled' ? financeRes.value?.data?.finance || [] : [];
    const journal = journalRes.status === 'fulfilled' ? journalRes.value?.data?.entries || [] : [];
    const financeSummary = financeSummaryRes.status === 'fulfilled' ? financeSummaryRes.value?.data?.summary || {} : {};
    
    const totalStreak = habits.reduce((sum, h) => sum + (h.streak || 0), 0);
    const activeHabits = habits.filter(h => h.is_active).length;
    const totalCompletions = habits.reduce((sum, h) => sum + (h.total_completions || 0), 0);
    const avgMood = journal.length > 0 
      ? Math.round(journal.reduce((sum, e) => sum + (e.mood || 5), 0) / journal.length)
      : userData?.mood_score || 5;

    const summaryData = [
      ['Total Active Habits', activeHabits],
      ['Total Streak Days', totalStreak],
      ['Total Habit Completions', totalCompletions],
      ['Journal Entries', journal.length],
      ['Financial Transactions', finance.length],
      ['Average Mood Score', `${avgMood}/10`],
      ['Current Balance', `${financeSummary.balance || 0} TZS`]
    ];

    doc.autoTable({
      startY: yPosition,
      head: false,
      body: summaryData,
      theme: 'striped',
      headStyles: { fillColor: TEAL_COLOR, textColor: [255, 255, 255] },
      bodyStyles: { fontSize: 10 },
      columnStyles: { 
        0: { fontStyle: 'bold', cellWidth: 80 },
        1: { cellWidth: 80 }
      }
    });

    yPosition = doc.lastAutoTable.finalY + 20;

    // User Information
    addSectionHeader(doc, 'User Information', yPosition);
    yPosition += 8;

    const userInfo = [
      ['Name:', userData?.nickname || 'Anonymous'],
      ['Email:', userData?.email || 'N/A'],
      ['Path:', getPathLabel(userData?.path) || 'N/A'],
      ['AI Mentor:', getPersonalityLabel(userData?.ai_personality) || 'N/A'],
      ['Current Mood:', `${userData?.mood_score || 5}/10`],
      ['Member Since:', userData?.created_at ? new Date(userData.created_at).toLocaleDateString() : 'N/A']
    ];

    doc.autoTable({
      startY: yPosition,
      head: false,
      body: userInfo,
      theme: 'plain',
      styles: { fontSize: 10 },
      columnStyles: { 0: { fontStyle: 'bold', cellWidth: 60 } }
    });

    yPosition = doc.lastAutoTable.finalY + 20;

    // Habits Section
    if (habits.length > 0) {
      if (yPosition > pageHeight - 80) {
        doc.addPage();
        yPosition = 20;
      }

      addSectionHeader(doc, 'Habits & Consistency', yPosition);
      yPosition += 8;

      // Habits Statistics
      const buildHabits = habits.filter(h => h.type === 'build');
      const breakHabits = habits.filter(h => h.type === 'break');
      const habitsByCategory = {};
      habits.forEach(h => {
        const cat = h.category || 'Uncategorized';
        habitsByCategory[cat] = (habitsByCategory[cat] || 0) + 1;
      });

      const habitStats = [
        ['Total Habits', habits.length],
        ['Active Habits', activeHabits],
        ['Build Habits', buildHabits.length],
        ['Break Habits', breakHabits.length],
        ['Longest Streak', Math.max(...habits.map(h => h.longest_streak || 0), 0) + ' days'],
        ['Total Completions', totalCompletions]
      ];

      doc.autoTable({
        startY: yPosition,
        head: [['Metric', 'Value']],
        body: habitStats,
        theme: 'striped',
        headStyles: { fillColor: TEAL_COLOR, textColor: [255, 255, 255] },
        styles: { fontSize: 9 }
      });

      yPosition = doc.lastAutoTable.finalY + 10;

      // Top Habits Table
      const topHabits = habits
        .sort((a, b) => (b.streak || 0) - (a.streak || 0))
        .slice(0, 10)
        .map(habit => [
          habit.title || 'Untitled',
          habit.type === 'build' ? 'Build' : 'Break',
          habit.category || 'N/A',
          (habit.streak || 0) + ' days',
          (habit.longest_streak || 0) + ' days',
          (habit.total_completions || 0)
        ]);

      if (topHabits.length > 0) {
        doc.autoTable({
          startY: yPosition,
          head: [['Habit', 'Type', 'Category', 'Current Streak', 'Longest Streak', 'Completions']],
          body: topHabits,
          theme: 'striped',
          headStyles: { fillColor: TEAL_COLOR, textColor: [255, 255, 255] },
          styles: { fontSize: 8 },
          columnStyles: { 
            0: { cellWidth: 50 },
            1: { cellWidth: 25 },
            2: { cellWidth: 30 },
            3: { cellWidth: 25 },
            4: { cellWidth: 25 },
            5: { cellWidth: 25 }
          }
        });

        yPosition = doc.lastAutoTable.finalY + 20;
      }
    }

    // Finance Section
    if (finance.length > 0 || financeSummary.income || financeSummary.expense) {
      if (yPosition > pageHeight - 80) {
        doc.addPage();
        yPosition = 20;
      }

      addSectionHeader(doc, 'Financial Overview', yPosition);
      yPosition += 8;

      // Finance Summary
      const financeStats = [
        ['Total Income', `${financeSummary.income || 0} TZS`],
        ['Total Expenses', `${financeSummary.expense || 0} TZS`],
        ['Net Balance', `${financeSummary.balance || 0} TZS`],
        ['Total Transactions', finance.length]
      ];

      doc.autoTable({
        startY: yPosition,
        head: [['Metric', 'Amount']],
        body: financeStats,
        theme: 'striped',
        headStyles: { fillColor: TEAL_COLOR, textColor: [255, 255, 255] },
        styles: { fontSize: 10 }
      });

      yPosition = doc.lastAutoTable.finalY + 10;

      // Recent Transactions
      if (finance.length > 0) {
        const recentTransactions = finance
          .slice(0, 15)
          .map(transaction => [
            transaction.type === 'income' ? 'Income' : 'Expense',
            transaction.category || 'N/A',
            `${transaction.amount || 0} TZS`,
            transaction.date || 'N/A'
          ]);

        doc.autoTable({
          startY: yPosition,
          head: [['Type', 'Category', 'Amount', 'Date']],
          body: recentTransactions,
          theme: 'striped',
          headStyles: { fillColor: TEAL_COLOR, textColor: [255, 255, 255] },
          styles: { fontSize: 8 }
        });

        yPosition = doc.lastAutoTable.finalY + 20;
      }
    }

    // Journal Section
    if (journal.length > 0) {
      if (yPosition > pageHeight - 80) {
        doc.addPage();
        yPosition = 20;
      }

      addSectionHeader(doc, 'Journal Entries', yPosition);
      yPosition += 8;

      const journalStats = [
        ['Total Entries', journal.length],
        ['Average Mood', `${avgMood}/10`],
        ['Date Range', journal.length > 0 
          ? `${journal[journal.length - 1].date || 'N/A'} to ${journal[0].date || 'N/A'}`
          : 'N/A']
      ];

      doc.autoTable({
        startY: yPosition,
        head: [['Metric', 'Value']],
        body: journalStats,
        theme: 'striped',
        headStyles: { fillColor: TEAL_COLOR, textColor: [255, 255, 255] },
        styles: { fontSize: 10 }
      });

      yPosition = doc.lastAutoTable.finalY + 10;

      // Recent Journal Entries
      const recentEntries = journal
        .slice(0, 10)
        .map(entry => {
          const content = entry.content || '';
          const preview = content.length > 60 ? content.substring(0, 60) + '...' : content;
          return [
            entry.title || 'Untitled',
            entry.date || 'N/A',
            entry.mood || 5,
            preview
          ];
        });

      doc.autoTable({
        startY: yPosition,
        head: [['Title', 'Date', 'Mood', 'Preview']],
        body: recentEntries,
        theme: 'striped',
        headStyles: { fillColor: TEAL_COLOR, textColor: [255, 255, 255] },
        styles: { fontSize: 8 },
        columnStyles: { 3: { cellWidth: 70 } }
      });

      yPosition = doc.lastAutoTable.finalY + 20;
    }

    // Add footer to all pages
    addFooter(doc, pageWidth, pageHeight);

    return doc;
  } catch (error) {
    console.error('Error generating PDF:', error);
    throw error;
  }
};

/**
 * Generate Finance-specific PDF report
 */
export const generateFinanceReport = async (financeData, summary, api) => {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  let yPosition = 20;

  // Header
  doc.setFillColor(...TEAL_COLOR);
  doc.rect(0, 0, pageWidth, 50, 'F');
  
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(24);
  doc.setFont('helvetica', 'bold');
  doc.text('Financial Report', pageWidth / 2, 30, { align: 'center' });
  
  doc.setFontSize(12);
  doc.text(`Period: ${new Date().toLocaleDateString()}`, pageWidth / 2, 42, { align: 'center' });

  yPosition = 70;
  doc.setTextColor(0, 0, 0);

  // Summary
  addSectionHeader(doc, 'Financial Summary', yPosition);
  yPosition += 8;

  const summaryData = [
    ['Total Income', `${summary.income || 0} TZS`],
    ['Total Expenses', `${summary.expense || 0} TZS`],
    ['Net Balance', `${summary.balance || 0} TZS`],
    ['Transaction Count', financeData.length]
  ];

  doc.autoTable({
    startY: yPosition,
    head: [['Metric', 'Amount']],
    body: summaryData,
    theme: 'striped',
    headStyles: { fillColor: TEAL_COLOR, textColor: [255, 255, 255] },
    styles: { fontSize: 11 }
  });

  yPosition = doc.lastAutoTable.finalY + 15;

  // Transactions by Category
  const categoryBreakdown = {};
  financeData.forEach(t => {
    const cat = t.category || 'Uncategorized';
    if (!categoryBreakdown[cat]) {
      categoryBreakdown[cat] = { income: 0, expense: 0 };
    }
    if (t.type === 'income') {
      categoryBreakdown[cat].income += t.amount || 0;
    } else {
      categoryBreakdown[cat].expense += t.amount || 0;
    }
  });

  if (Object.keys(categoryBreakdown).length > 0) {
    if (yPosition > pageHeight - 80) {
      doc.addPage();
      yPosition = 20;
    }

    addSectionHeader(doc, 'Category Breakdown', yPosition);
    yPosition += 8;

    const categoryData = Object.entries(categoryBreakdown).map(([cat, data]) => [
      cat,
      `${data.income} TZS`,
      `${data.expense} TZS`,
      `${data.income - data.expense} TZS`
    ]);

    doc.autoTable({
      startY: yPosition,
      head: [['Category', 'Income', 'Expenses', 'Net']],
      body: categoryData,
      theme: 'striped',
      headStyles: { fillColor: TEAL_COLOR, textColor: [255, 255, 255] },
      styles: { fontSize: 9 }
    });

    yPosition = doc.lastAutoTable.finalY + 15;
  }

  // Recent Transactions
  if (financeData.length > 0) {
    if (yPosition > pageHeight - 80) {
      doc.addPage();
      yPosition = 20;
    }

    addSectionHeader(doc, 'Recent Transactions', yPosition);
    yPosition += 8;

    const transactions = financeData
      .slice(0, 30)
      .map(t => [
        t.type === 'income' ? 'Income' : 'Expense',
        t.category || 'N/A',
        `${t.amount || 0} TZS`,
        t.date || 'N/A',
        t.description || ''
      ]);

    doc.autoTable({
      startY: yPosition,
      head: [['Type', 'Category', 'Amount', 'Date', 'Description']],
      body: transactions,
      theme: 'striped',
      headStyles: { fillColor: TEAL_COLOR, textColor: [255, 255, 255] },
      styles: { fontSize: 8 },
      columnStyles: { 4: { cellWidth: 50 } }
    });
  }

  addFooter(doc, pageWidth, pageHeight);
  return doc;
};

/**
 * Generate Habits-specific PDF report
 */
export const generateHabitsReport = async (habits, completions, api) => {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  let yPosition = 20;

  // Header
  doc.setFillColor(...TEAL_COLOR);
  doc.rect(0, 0, pageWidth, 50, 'F');
  
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(24);
  doc.setFont('helvetica', 'bold');
  doc.text('Habits & Consistency Report', pageWidth / 2, 30, { align: 'center' });
  
  doc.setFontSize(12);
  doc.text(`Generated: ${new Date().toLocaleDateString()}`, pageWidth / 2, 42, { align: 'center' });

  yPosition = 70;
  doc.setTextColor(0, 0, 0);

  // Statistics
  const activeHabits = habits.filter(h => h.is_active).length;
  const totalStreak = habits.reduce((sum, h) => sum + (h.streak || 0), 0);
  const longestStreak = Math.max(...habits.map(h => h.longest_streak || 0), 0);
  const totalCompletions = habits.reduce((sum, h) => sum + (h.total_completions || 0), 0);

  addSectionHeader(doc, 'Habits Statistics', yPosition);
  yPosition += 8;

  const statsData = [
    ['Total Habits', habits.length],
    ['Active Habits', activeHabits],
    ['Total Streak Days', totalStreak],
    ['Longest Streak', longestStreak + ' days'],
    ['Total Completions', totalCompletions],
    ['Average Streak', habits.length > 0 ? Math.round(totalStreak / habits.length) + ' days' : '0 days']
  ];

  doc.autoTable({
    startY: yPosition,
    head: [['Metric', 'Value']],
    body: statsData,
    theme: 'striped',
    headStyles: { fillColor: TEAL_COLOR, textColor: [255, 255, 255] },
    styles: { fontSize: 10 }
  });

  yPosition = doc.lastAutoTable.finalY + 15;

  // All Habits
  if (habits.length > 0) {
    const habitsData = habits.map(habit => [
      habit.title || 'Untitled',
      habit.type === 'build' ? 'Build' : 'Break',
      habit.category || 'N/A',
      (habit.streak || 0) + ' days',
      (habit.longest_streak || 0) + ' days',
      (habit.total_completions || 0),
      habit.is_active ? 'Active' : 'Inactive'
    ]);

    doc.autoTable({
      startY: yPosition,
      head: [['Habit', 'Type', 'Category', 'Current Streak', 'Longest Streak', 'Completions', 'Status']],
      body: habitsData,
      theme: 'striped',
      headStyles: { fillColor: TEAL_COLOR, textColor: [255, 255, 255] },
      styles: { fontSize: 8 },
      columnStyles: { 
        0: { cellWidth: 50 },
        1: { cellWidth: 25 },
        2: { cellWidth: 30 }
      }
    });
  }

  addFooter(doc, pageWidth, pageHeight);
  return doc;
};

// Helper functions
const addSectionHeader = (doc, title, yPosition) => {
  const pageWidth = doc.internal.pageSize.getWidth();
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...TEAL_COLOR);
  doc.text(title, 14, yPosition);
  doc.setDrawColor(...TEAL_COLOR);
  doc.setLineWidth(0.5);
  doc.line(14, yPosition + 2, pageWidth - 14, yPosition + 2);
  doc.setTextColor(0, 0, 0);
};

const addFooter = (doc, pageWidth, pageHeight) => {
  const pageCount = doc.internal.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setTextColor(...GRAY_COLOR);
    doc.text(
      `Page ${i} of ${pageCount} - NexaNova Personal Growth Platform`,
      pageWidth / 2,
      pageHeight - 10,
      { align: 'center' }
    );
    doc.text(
      'Generated with ❤️ for your journey of growth',
      pageWidth / 2,
      pageHeight - 5,
      { align: 'center' }
    );
  }
};

const getPathLabel = (path) => {
  const paths = {
    'mind': 'Mind Reset',
    'money': 'Money Builder',
    'habit': 'Habit Transformer',
    'all': 'Complete Transformation'
  };
  return paths[path] || path;
};

const getPersonalityLabel = (personality) => {
  const personalities = {
    'sage': 'Wise Sage',
    'coach': 'Motivational Coach',
    'friend': 'Supportive Friend'
  };
  return personalities[personality] || personality;
};

