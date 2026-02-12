// ============================================================================
// LOG TAB
// ============================================================================

var LogTab = {
  sessionType: 'training',
  mediaFiles: [],
  mediaUrls: [],

  render: function(profile) {
    var today = new Date().toISOString().split('T')[0];
    var st = LogTab.sessionType;

    var html = '<div class="tab-content" id="tab-log">';
    html += '<h2 class="tab-title">Log Session</h2>';

    // Session type toggle
    html += '<div class="toggle-group">';
    html += '<button class="toggle-button' + (st === 'training' ? ' active' : '') + '" data-session-type="training">Training</button>';
    html += '<button class="toggle-button' + (st === 'competition' ? ' active' : '') + '" data-session-type="competition">Competition</button>';
    html += '</div>';

    html += '<form id="log-form" class="form">';

    // Date
    html += '<div class="form-group">';
    html += '<label class="label">Date</label>';
    html += '<input type="date" class="input" id="log-date" value="' + today + '" max="' + today + '" />';
    html += '</div>';

    // Meet name (competition only)
    if (st === 'competition') {
      html += '<div class="form-group">';
      html += '<label class="label">Meet Name</label>';
      html += '<input type="text" class="input" id="log-meet-name" placeholder="Conference Championships" />';
      html += '</div>';
    }

    // Event
    html += '<div class="form-group">';
    html += '<label class="label">Event</label>';
    html += '<select class="input" id="log-event">';
    html += '<option value="">Select an event</option>';
    EVENTS.forEach(function(event) {
      html += '<option value="' + event.id + '">' + event.name + '</option>';
    });
    html += '</select>';
    html += '<span class="error-text" id="log-event-error" style="display:none"></span>';
    html += '</div>';

    // RPE
    html += '<div class="form-group">';
    html += '<label class="label">RPE (1-10)</label>';
    html += '<div class="rpe-grid">';
    RPE_SCALE.forEach(function(value) {
      html += '<button type="button" class="rpe-button' + (value === 5 ? ' active' : '') + '" data-rpe="' + value + '">' + value + '</button>';
    });
    html += '</div></div>';

    // Throws & Weight row
    html += '<div class="form-row">';
    html += '<div class="form-group">';
    html += '<label class="label">Throws</label>';
    html += '<input type="number" class="input" id="log-throws" placeholder="20" min="1" />';
    html += '<span class="error-text" id="log-throws-error" style="display:none"></span>';
    html += '</div>';

    html += '<div class="form-group">';
    html += '<label class="label">Weight</label>';
    html += '<div class="input-group">';
    html += '<input type="number" step="0.01" class="input-small" id="log-weight" placeholder="7.26" />';
    html += '<select class="select" id="log-weight-unit"><option value="kg">kg</option><option value="lbs">lbs</option></select>';
    html += '</div>';
    html += '<span class="error-text" id="log-weight-error" style="display:none"></span>';
    html += '</div>';
    html += '</div>';

    // Best & Avg row
    html += '<div class="form-row">';
    html += '<div class="form-group">';
    html += '<label class="label">Best (m)</label>';
    html += '<input type="number" step="0.01" class="input" id="log-best" placeholder="15.50" />';
    html += '<span class="error-text" id="log-best-error" style="display:none"></span>';
    html += '</div>';

    html += '<div class="form-group">';
    html += '<label class="label">Avg (m)</label>';
    html += '<input type="number" step="0.01" class="input" id="log-avg" placeholder="14.20" />';
    html += '<span class="error-text" id="log-avg-error" style="display:none"></span>';
    html += '</div>';
    html += '</div>';

    // Placement (competition only)
    if (st === 'competition') {
      html += '<div class="form-group">';
      html += '<label class="label">Placement (Optional)</label>';
      html += '<input type="text" class="input" id="log-placement" placeholder="1st, 3rd, etc." />';
      html += '</div>';
    }

    // Notes
    html += '<div class="form-group">';
    html += '<label class="label">Notes</label>';
    html += '<textarea class="textarea" id="log-notes" placeholder="How did it feel? Technical notes..." rows="3"></textarea>';
    html += '</div>';

    // Media
    html += '<div class="form-group">';
    html += '<label class="label">Media (Photos/Videos)</label>';
    html += '<input type="file" class="file-input" id="log-file-input" accept="image/*,video/*" multiple />';
    html += '<button type="button" class="media-upload-button" id="log-media-btn">📎 Add Photos/Videos</button>';

    if (LogTab.mediaFiles.length > 0) {
      html += '<div class="media-grid">';
      LogTab.mediaFiles.forEach(function(item, index) {
        html += '<div class="media-item">';
        if (item.type.startsWith('image/')) {
          html += '<img src="' + item.url + '" alt="' + LogTab.escapeHtml(item.name) + '" class="media-thumbnail" />';
        } else {
          html += '<div class="video-placeholder"><span class="video-icon">🎥</span><span class="video-name">' + LogTab.escapeHtml(item.name) + '</span></div>';
        }
        html += '<button type="button" class="remove-media-button" data-media-index="' + index + '">×</button>';
        html += '</div>';
      });
      html += '</div>';
    }
    html += '</div>';

    // Submit
    html += '<button type="submit" class="primary-button" id="log-submit-btn">Save Session</button>';

    html += '</form>';
    html += '</div>';
    return html;
  },

  escapeHtml: function(str) {
    if (!str) return '';
    return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  },

  attachEvents: function(app) {
    // Session type toggle
    var toggleButtons = document.querySelectorAll('#tab-log .toggle-button');
    toggleButtons.forEach(function(btn) {
      btn.addEventListener('click', function() {
        LogTab.sessionType = btn.getAttribute('data-session-type');
        app.renderCurrentTab();
      });
    });

    // RPE buttons
    var rpeButtons = document.querySelectorAll('#tab-log .rpe-button');
    rpeButtons.forEach(function(btn) {
      btn.addEventListener('click', function() {
        rpeButtons.forEach(function(b) { b.classList.remove('active'); });
        btn.classList.add('active');
      });
    });

    // Media upload button
    var mediaBtn = document.getElementById('log-media-btn');
    var fileInput = document.getElementById('log-file-input');
    if (mediaBtn && fileInput) {
      mediaBtn.addEventListener('click', function() {
        fileInput.click();
      });
      fileInput.addEventListener('change', function(e) {
        var files = Array.from(e.target.files);
        files.forEach(function(file) {
          var url = URL.createObjectURL(file);
          LogTab.mediaFiles.push({
            name: file.name,
            type: file.type,
            url: url,
            file: file
          });
          LogTab.mediaUrls.push(url);
        });
        app.renderCurrentTab();
      });
    }

    // Remove media buttons
    var removeButtons = document.querySelectorAll('#tab-log .remove-media-button');
    removeButtons.forEach(function(btn) {
      btn.addEventListener('click', function() {
        var index = parseInt(btn.getAttribute('data-media-index'));
        var removed = LogTab.mediaFiles.splice(index, 1)[0];
        if (removed && removed.url) {
          URL.revokeObjectURL(removed.url);
          LogTab.mediaUrls = LogTab.mediaUrls.filter(function(u) { return u !== removed.url; });
        }
        app.renderCurrentTab();
      });
    });

    // Form submission
    var form = document.getElementById('log-form');
    if (form) {
      form.addEventListener('submit', function(e) {
        e.preventDefault();
        LogTab.handleSubmit(app);
      });
    }
  },

  clearErrors: function() {
    ['event', 'throws', 'weight', 'best', 'avg'].forEach(function(field) {
      var el = document.getElementById('log-' + field + '-error');
      if (el) {
        el.style.display = 'none';
        el.textContent = '';
      }
      var input = document.getElementById('log-' + field);
      if (input) input.classList.remove('error');
    });
  },

  showError: function(field, message) {
    var el = document.getElementById('log-' + field + '-error');
    if (el) {
      el.textContent = message;
      el.style.display = 'block';
    }
    var input = document.getElementById('log-' + field);
    if (input) input.classList.add('error');
  },

  handleSubmit: function(app) {
    LogTab.clearErrors();

    var eventVal = document.getElementById('log-event').value;
    var throwsVal = document.getElementById('log-throws').value;
    var weightVal = document.getElementById('log-weight').value;
    var bestVal = document.getElementById('log-best').value;
    var avgVal = document.getElementById('log-avg').value;

    var hasErrors = false;

    if (!eventVal) { LogTab.showError('event', 'Select event'); hasErrors = true; }
    if (!throwsVal || parseInt(throwsVal) < 1) { LogTab.showError('throws', 'Required'); hasErrors = true; }
    if (!weightVal) { LogTab.showError('weight', 'Required'); hasErrors = true; }
    if (!bestVal) { LogTab.showError('best', 'Required'); hasErrors = true; }
    if (!avgVal) { LogTab.showError('avg', 'Required'); hasErrors = true; }

    if (bestVal && avgVal && parseFloat(avgVal) > parseFloat(bestVal)) {
      LogTab.showError('avg', 'Cannot exceed best');
      hasErrors = true;
    }

    if (hasErrors) return;

    var activeRpe = document.querySelector('#tab-log .rpe-button.active');
    var rpeVal = activeRpe ? parseInt(activeRpe.getAttribute('data-rpe')) : 5;

    var session = {
      id: Date.now().toString(),
      date: document.getElementById('log-date').value,
      event: eventVal,
      sessionType: LogTab.sessionType,
      rpe: rpeVal,
      throws: parseInt(throwsVal),
      implementWeight: parseFloat(weightVal),
      weightUnit: document.getElementById('log-weight-unit').value,
      bestMark: parseFloat(bestVal),
      avgMark: parseFloat(avgVal),
      notes: document.getElementById('log-notes').value,
      meetName: LogTab.sessionType === 'competition' ? (document.getElementById('log-meet-name')?.value || '') : '',
      placement: LogTab.sessionType === 'competition' ? (document.getElementById('log-placement')?.value || '') : ''
    };

    // Save
    var submitBtn = document.getElementById('log-submit-btn');
    submitBtn.disabled = true;
    submitBtn.textContent = 'Saving...';

    setTimeout(function() {
      app.state.sessions.push(session);
      storage.set('throwingSessions', app.state.sessions);

      // Cleanup media
      LogTab.mediaUrls.forEach(function(url) { URL.revokeObjectURL(url); });
      LogTab.mediaFiles = [];
      LogTab.mediaUrls = [];
      LogTab.sessionType = 'training';

      app.setTab('dashboard');
    }, 300);
  }
};
