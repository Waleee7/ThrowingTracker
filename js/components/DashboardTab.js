// ============================================================================
// DASHBOARD TAB
// ============================================================================

var DashboardTab = {
  render: function(sessions, streak, weeklyStats, profile) {
    var lastSession = null;
    if (sessions.length > 0) {
      var sorted = sessions.slice().sort(function(a, b) {
        return new Date(b.date) - new Date(a.date);
      });
      lastSession = sorted[0];
    }

    var hasProfile = profile.name && profile.sex;

    var html = '<div class="tab-content" id="tab-dashboard">';
    html += '<h2 class="tab-title">Dashboard</h2>';

    // Reminder
    if (!hasProfile) {
      html += '<div class="reminder">' +
        '<span>💡</span>' +
        '<span>Complete your profile to get the most out of the app</span>' +
      '</div>';
    }

    // Stats Grid
    html += '<div class="stats-grid">';
    html += '<div class="stat-card"><div class="stat-value">' + streak + '</div><div class="stat-label">Day Streak</div></div>';
    html += '<div class="stat-card"><div class="stat-value">' + weeklyStats.count + '</div><div class="stat-label">Week</div></div>';
    html += '<div class="stat-card"><div class="stat-value">' + weeklyStats.totalThrows + '</div><div class="stat-label">Throws</div></div>';
    html += '<div class="stat-card"><div class="stat-value">' + (weeklyStats.avgRPE || '—') + '</div><div class="stat-label">Avg RPE</div></div>';
    html += '</div>';

    // Last Session
    if (lastSession) {
      var event = EVENTS.find(function(e) { return e.id === lastSession.event; });
      var dateObj = new Date(lastSession.date);
      var dateStr = dateObj.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });

      html += '<div class="last-session">';
      html += '<h3 class="section-title">Last Session</h3>';
      html += '<div class="session-card">';
      html += '<div class="session-header">';
      html += '<span class="session-event">' + (event ? event.name : lastSession.event) + '</span>';
      html += '<span class="session-date">' + dateStr + '</span>';
      html += '</div>';
      html += '<div class="session-stats">';
      html += '<div class="session-stat"><span class="session-stat-label">Best</span><span class="session-stat-value">' + lastSession.bestMark + 'm</span></div>';
      html += '<div class="session-stat"><span class="session-stat-label">RPE</span><span class="session-stat-value">' + lastSession.rpe + '/10</span></div>';
      html += '<div class="session-stat"><span class="session-stat-label">Throws</span><span class="session-stat-value">' + lastSession.throws + '</span></div>';
      html += '</div>';
      html += '</div>';
      html += '</div>';
    }

    // Log Button
    html += '<button class="primary-button" id="dashboard-log-btn">+ Log Session</button>';

    html += '</div>';
    return html;
  },

  attachEvents: function(app) {
    var btn = document.getElementById('dashboard-log-btn');
    if (btn) {
      btn.addEventListener('click', function() {
        app.setTab('log');
      });
    }
  }
};
