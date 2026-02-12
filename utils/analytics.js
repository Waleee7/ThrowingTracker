// ============================================================================
// ANALYTICS UTILITIES
// ============================================================================

var calculateStreak = function(sessions) {
  if (!sessions || sessions.length === 0) return 0;

  var sortedSessions = sessions.slice().sort(function(a, b) {
    return new Date(b.date) - new Date(a.date);
  });

  var today = new Date(); 
  today.setHours(0, 0, 0, 0);

  var streak = 0;
  var checkDate = new Date(today);

  for (var i = 0; i < 365; i++) {
    var dateStr = checkDate.toISOString().split('T')[0];
    var hasSession = sortedSessions.some(function(s) { return s.date === dateStr; });

    if (hasSession) {
      streak++;
      checkDate.setDate(checkDate.getDate() - 1);
    } else {
      if (i === 0) {
        checkDate.setDate(checkDate.getDate() - 1);
        continue;
      }
      break;
    }
  }

  return streak;
};

var getWeeklyStats = function(sessions) {
  var oneWeekAgo = new Date();
  oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

  var weeklySessions = sessions.filter(function(s) {
    return new Date(s.date) >= oneWeekAgo;
  });

  return {
    count: weeklySessions.length,
    totalThrows: weeklySessions.reduce(function(sum, s) { return sum + s.throws; }, 0),
    avgRPE: weeklySessions.length > 0
      ? (weeklySessions.reduce(function(sum, s) { return sum + s.rpe; }, 0) / weeklySessions.length).toFixed(1)
      : 0,
    byEvent: weeklySessions.reduce(function(acc, s) {
      if (!acc[s.event]) acc[s.event] = { count: 0, bestMark: 0, avgMark: 0, totalMark: 0 };
      acc[s.event].count++;
      acc[s.event].bestMark = Math.max(acc[s.event].bestMark, s.bestMark);
      acc[s.event].totalMark += s.avgMark;
      acc[s.event].avgMark = acc[s.event].totalMark / acc[s.event].count;
      return acc;
    }, {})
  };
};

var getMonthlyStats = function(sessions) {
  var oneMonthAgo = new Date();
  oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);

  var monthlySessions = sessions.filter(function(s) {
    return new Date(s.date) >= oneMonthAgo;
  });

  return {
    count: monthlySessions.length,
    totalThrows: monthlySessions.reduce(function(sum, s) { return sum + s.throws; }, 0),
    avgRPE: monthlySessions.length > 0
      ? (monthlySessions.reduce(function(sum, s) { return sum + s.rpe; }, 0) / monthlySessions.length).toFixed(1)
      : 0,
    byEvent: monthlySessions.reduce(function(acc, s) {
      if (!acc[s.event]) acc[s.event] = { count: 0, bestMark: 0, avgMark: 0, totalMark: 0 };
      acc[s.event].count++;
      acc[s.event].bestMark = Math.max(acc[s.event].bestMark, s.bestMark);
      acc[s.event].totalMark += s.avgMark;
      acc[s.event].avgMark = acc[s.event].totalMark / acc[s.event].count;
      return acc;
    }, {})
  };
};
