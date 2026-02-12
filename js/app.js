// ============================================================================
// MAIN APP
// ============================================================================

var ThrowingTracker = {
  state: {
    activeTab: 'dashboard',
    profile: {
      name: '',
      height: { value: '', unit: 'cm', feet: '', inches: '' },
      weight: { value: '', unit: 'kg' },
      sex: '',
      events: [],
      notes: ''
    },
    sessions: []
  },

  init: function() {
    // Load saved data
    var savedProfile = storage.get('throwingProfile');
    var savedSessions = storage.get('throwingSessions') || [];

    if (savedProfile) this.state.profile = savedProfile;
    this.state.sessions = savedSessions;

    // Render the app
    this.renderApp();
  },

  renderApp: function() {
    var root = document.getElementById('root');
    var streak = calculateStreak(this.state.sessions);

    var html = '<div class="app">';

    // Floating elements
    html += FloatingElements.render();

    // Header
    html += '<header class="header">';
    html += '<div class="header-content">';
    html += '<h1 class="logo">ThrowingTracker</h1>';
    html += '<div class="streak-badge' + (streak > 0 ? '' : ' hidden') + '">';
    html += '<span class="streak-number">' + streak + '</span>';
    html += '<span class="streak-label">🔥</span>';
    html += '</div>';
    html += '</div></header>';

    // Tab Navigation
    html += '<nav class="tab-nav">';
    html += TabButton.render('dashboard', '◆', 'Dashboard', this.state.activeTab === 'dashboard');
    html += TabButton.render('profile', '👤', 'Profile', this.state.activeTab === 'profile');
    html += TabButton.render('log', '+', 'Log', this.state.activeTab === 'log');
    html += TabButton.render('history', '📊', 'History', this.state.activeTab === 'history');
    html += '</nav>';

    // Main content
    html += '<main class="main" id="main-content">';
    html += this.renderTabContent();
    html += '</main>';

    html += '</div>';

    root.innerHTML = html;
    this.attachEvents();
  },

  renderTabContent: function() {
    var weeklyStats = getWeeklyStats(this.state.sessions);
    var monthlyStats = getMonthlyStats(this.state.sessions);
    var streak = calculateStreak(this.state.sessions);

    switch (this.state.activeTab) {
      case 'dashboard':
        return DashboardTab.render(this.state.sessions, streak, weeklyStats, this.state.profile);
      case 'profile':
        return ProfileTab.render(this.state.profile);
      case 'log':
        return LogTab.render(this.state.profile);
      case 'history':
        return HistoryTab.render(this.state.sessions, weeklyStats, monthlyStats);
      default:
        return '';
    }
  },

  renderCurrentTab: function() {
    var mainContent = document.getElementById('main-content');
    if (mainContent) {
      mainContent.innerHTML = this.renderTabContent();
      this.attachTabEvents();
    }
  },

  attachEvents: function() {
    var self = this;

    // Tab navigation
    var tabButtons = document.querySelectorAll('.tab-nav .tab-button');
    tabButtons.forEach(function(btn) {
      btn.addEventListener('click', function() {
        var tabId = btn.getAttribute('data-tab');
        self.setTab(tabId);
      });
    });

    // Tab-specific events
    this.attachTabEvents();
  },

  attachTabEvents: function() {
    switch (this.state.activeTab) {
      case 'dashboard':
        DashboardTab.attachEvents(this);
        break;
      case 'profile':
        ProfileTab.attachEvents(this);
        break;
      case 'log':
        LogTab.attachEvents(this);
        break;
      case 'history':
        HistoryTab.attachEvents(this);
        break;
    }
  },

  setTab: function(tabId) {
    this.state.activeTab = tabId;
    this.renderApp();
  }
};
