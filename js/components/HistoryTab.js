// ============================================================================
// HISTORY TAB
// ============================================================================

var HistoryTab = {
  view: 'recent',

  render: function(sessions, weeklyStats, monthlyStats) {
    var html = '<div class="tab-content" id="tab-history">';
    html += '<h2 class="tab-title">History</h2>';

    // Toggle
    html += '<div class="toggle-group">';
    html += '<button class="toggle-button' + (HistoryTab.view === 'recent' ? ' active' : '') + '" data-history-view="recent">Recent</button>';
    html += '<button class="toggle-button' + (HistoryTab.view === 'weekly' ? ' active' : '') + '" data-history-view="weekly">Weekly</button>';
    html += '<button class="toggle-button' + (HistoryTab.view === 'monthly' ? ' active' : '') + '" data-history-view="monthly">Monthly</button>';
    html += '</div>';

    if (HistoryTab.view === 'recent') {
      html += HistoryTab.renderRecent(sessions);
    } else if (HistoryTab.view === 'weekly') {
      html += HistoryTab.renderSummary(weeklyStats);
    } else {
      html += HistoryTab.renderSummary(monthlyStats);
    }

    html += '</div>';
    return html;
  },

  renderRecent: function(sessions) {
    var sorted = sessions.slice().sort(function(a, b) {
      return new Date(b.date) - new Date(a.date);
    });

    var html = '<div class="history-list">';

    if (sorted.length === 0) {
      html += '<div class="empty-state">';
      html += '<span class="empty-icon">📝</span>';
      html += '<p class="empty-text">No sessions yet</p>';
      html += '</div>';
    } else {
      sorted.slice(0, 20).forEach(function(session) {
        var event = EVENTS.find(function(e) { return e.id === session.event; });
        var dateObj = new Date(session.date);
        var dateOptions = { month: 'short', day: 'numeric' };
        if (dateObj.getFullYear() !== new Date().getFullYear()) {
          dateOptions.year = 'numeric';
        }
        var dateStr = dateObj.toLocaleDateString('en-US', dateOptions);

        html += '<div class="history-item">';
        html += '<div class="history-header">';
        html += '<span class="history-date">' + dateStr + '</span>';
        html += '<span class="history-event">' + (event ? event.name : session.event) + '</span>';
        if (session.sessionType === 'competition') {
          html += '<span class="competition-badge">⭐</span>';
        }
        html += '</div>';
        html += '<div class="history-stats">';
        html += '<span>Best: ' + session.bestMark + 'm</span>';
        html += '<span>•</span>';
        html += '<span>RPE: ' + session.rpe + '/10</span>';
        html += '<span>•</span>';
        html += '<span>' + session.throws + ' throws</span>';
        html += '</div>';
        if (session.notes) {
          html += '<div class="history-notes">' + HistoryTab.escapeHtml(session.notes) + '</div>';
        }
        html += '</div>';
      });
    }

    html += '</div>';
    return html;
  },

  renderSummary: function(stats) {
    var html = '<div class="summary-view">';

    // Stats grid
    html += '<div class="stats-grid">';
    html += '<div class="stat-card"><div class="stat-value">' + stats.count + '</div><div class="stat-label">Sessions</div></div>';
    html += '<div class="stat-card"><div class="stat-value">' + stats.totalThrows + '</div><div class="stat-label">Throws</div></div>';
    html += '<div class="stat-card"><div class="stat-value">' + (stats.avgRPE || '—') + '</div><div class="stat-label">Avg RPE</div></div>';
    html += '</div>';

    // By Event
    var eventKeys = Object.keys(stats.byEvent);
    if (eventKeys.length > 0) {
      html += '<div class="event-breakdown">';
      html += '<h3 class="section-title">By Event</h3>';

      eventKeys.forEach(function(eventId) {
        var eventData = stats.byEvent[eventId];
        var event = EVENTS.find(function(e) { return e.id === eventId; });

        html += '<div class="event-stats-card">';
        html += '<div class="event-stats-header">';
        html += '<div class="event-icon-small">' + (event ? event.svg : '') + '</div>';
        html += '<span>' + (event ? event.name : eventId) + '</span>';
        html += '</div>';
        html += '<div class="event-stats-grid">';
        html += '<div><div class="mini-stat-label">Best</div><div class="mini-stat-value">' + eventData.bestMark.toFixed(2) + 'm</div></div>';
        html += '<div><div class="mini-stat-label">Avg</div><div class="mini-stat-value">' + eventData.avgMark.toFixed(2) + 'm</div></div>';
        html += '<div><div class="mini-stat-label">Sessions</div><div class="mini-stat-value">' + eventData.count + '</div></div>';
        html += '</div>';
        html += '</div>';
      });

      html += '</div>';
    }

    html += '</div>';
    return html;
  },

  escapeHtml: function(str) {
    if (!str) return '';
    return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  },

  attachEvents: function(app) {
    var toggleButtons = document.querySelectorAll('#tab-history .toggle-button');
    toggleButtons.forEach(function(btn) {
      btn.addEventListener('click', function() {
        HistoryTab.view = btn.getAttribute('data-history-view');
        app.renderCurrentTab();
      });
    });
  }
};
