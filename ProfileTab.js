// ============================================================================
// PROFILE TAB
// ============================================================================

var ProfileTab = {
  render: function(profile) {
    var html = '<div class="tab-content" id="tab-profile">';
    html += '<h2 class="tab-title">Profile</h2>';
    html += '<div class="form">';

    // Name
    html += '<div class="form-group">';
    html += '<label class="label">Name</label>';
    html += '<input type="text" class="input" id="profile-name" value="' + ProfileTab.escapeHtml(profile.name) + '" placeholder="Your name" />';
    html += '</div>';

    // Height & Weight Row
    html += '<div class="form-row">';

    // Height
    html += '<div class="form-group">';
    html += '<label class="label">Height</label>';
    html += '<div class="input-group">';
    if (profile.height.unit === 'cm') {
      html += '<input type="number" class="input-small" id="profile-height-value" value="' + profile.height.value + '" placeholder="180" />';
    } else {
      html += '<div class="feet-inches">';
      html += '<input type="number" class="input-tiny" id="profile-height-feet" value="' + (profile.height.feet || '') + '" placeholder="5" />';
      html += '<span class="unit-text">ft</span>';
      html += '<input type="number" class="input-tiny" id="profile-height-inches" value="' + (profile.height.inches || '') + '" placeholder="11" />';
      html += '<span class="unit-text">in</span>';
      html += '</div>';
    }
    html += '<select class="select" id="profile-height-unit">';
    HEIGHT_UNITS.forEach(function(unit) {
      html += '<option value="' + unit + '"' + (profile.height.unit === unit ? ' selected' : '') + '>' + unit + '</option>';
    });
    html += '</select>';
    html += '</div></div>';

    // Weight
    html += '<div class="form-group">';
    html += '<label class="label">Weight</label>';
    html += '<div class="input-group">';
    html += '<input type="number" class="input-small" id="profile-weight-value" value="' + profile.weight.value + '" placeholder="' + (profile.weight.unit === 'kg' ? '75' : '165') + '" />';
    html += '<select class="select" id="profile-weight-unit">';
    WEIGHT_UNITS.forEach(function(unit) {
      html += '<option value="' + unit + '"' + (profile.weight.unit === unit ? ' selected' : '') + '>' + unit + '</option>';
    });
    html += '</select>';
    html += '</div></div>';

    html += '</div>'; // end form-row

    // Sex
    html += '<div class="form-group">';
    html += '<label class="label">Sex</label>';
    html += '<div class="radio-group">';
    ['M', 'F'].forEach(function(sex) {
      html += '<label class="radio-label">';
      html += '<input type="radio" name="sex" value="' + sex + '"' + (profile.sex === sex ? ' checked' : '') + ' />';
      html += '<span>' + (sex === 'M' ? 'Male' : 'Female') + '</span>';
      html += '</label>';
    });
    html += '</div></div>';

    // Events
    html += '<div class="form-group">';
    html += '<label class="label">Events</label>';
    html += '<div class="event-grid">';
    EVENTS.forEach(function(event) {
      var isActive = profile.events.indexOf(event.id) !== -1;
      html += '<button type="button" class="event-button' + (isActive ? ' active' : '') + '" data-event-id="' + event.id + '">';
      html += '<div class="event-icon">' + event.svg + '</div>';
      html += '<span class="event-name">' + event.name + '</span>';
      html += '</button>';
    });
    html += '</div></div>';

    // Notes
    html += '<div class="form-group">';
    html += '<label class="label">Notes</label>';
    html += '<textarea class="textarea" id="profile-notes" placeholder="Goals, injuries, training notes..." rows="3">' + ProfileTab.escapeHtml(profile.notes || '') + '</textarea>';
    html += '</div>';

    // Save Button
    html += '<button class="primary-button" id="profile-save-btn">Save Profile</button>';

    html += '</div>'; // end form
    html += '</div>'; // end tab-content
    return html;
  },

  escapeHtml: function(str) {
    if (!str) return '';
    return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  },

  attachEvents: function(app) {
    // Event buttons
    var eventButtons = document.querySelectorAll('#tab-profile .event-button');
    eventButtons.forEach(function(btn) {
      btn.addEventListener('click', function() {
        btn.classList.toggle('active');
      });
    });

    // Height unit change - re-render
    var heightUnitSelect = document.getElementById('profile-height-unit');
    if (heightUnitSelect) {
      heightUnitSelect.addEventListener('change', function() {
        var currentProfile = ProfileTab.gatherFormData(app.state.profile);
        currentProfile.height.unit = heightUnitSelect.value;
        currentProfile.height.value = '';
        currentProfile.height.feet = '';
        currentProfile.height.inches = '';
        app.state.profile = currentProfile;
        app.renderCurrentTab();
      });
    }

    // Save button
    var saveBtn = document.getElementById('profile-save-btn');
    if (saveBtn) {
      saveBtn.addEventListener('click', function() {
        var newProfile = ProfileTab.gatherFormData(app.state.profile);
        app.state.profile = newProfile;
        storage.set('throwingProfile', newProfile);
        saveBtn.textContent = '✓ Saved';
        setTimeout(function() {
          saveBtn.textContent = 'Save Profile';
        }, 2000);
      });
    }
  },

  gatherFormData: function(currentProfile) {
    var profile = JSON.parse(JSON.stringify(currentProfile));

    var nameEl = document.getElementById('profile-name');
    if (nameEl) profile.name = nameEl.value;

    var heightUnit = document.getElementById('profile-height-unit');
    if (heightUnit) profile.height.unit = heightUnit.value;

    if (profile.height.unit === 'cm') {
      var hVal = document.getElementById('profile-height-value');
      if (hVal) profile.height.value = hVal.value;
    } else {
      var hFeet = document.getElementById('profile-height-feet');
      var hInches = document.getElementById('profile-height-inches');
      if (hFeet) profile.height.feet = hFeet.value;
      if (hInches) profile.height.inches = hInches.value;
    }

    var weightVal = document.getElementById('profile-weight-value');
    if (weightVal) profile.weight.value = weightVal.value;

    var weightUnit = document.getElementById('profile-weight-unit');
    if (weightUnit) profile.weight.unit = weightUnit.value;

    var sexRadio = document.querySelector('input[name="sex"]:checked');
    if (sexRadio) profile.sex = sexRadio.value;

    // Events
    profile.events = [];
    var activeEvents = document.querySelectorAll('#tab-profile .event-button.active');
    activeEvents.forEach(function(btn) {
      profile.events.push(btn.getAttribute('data-event-id'));
    });

    var notesEl = document.getElementById('profile-notes');
    if (notesEl) profile.notes = notesEl.value;

    return profile;
  }
};