// ============================================================================
// TAB BUTTON COMPONENT
// ============================================================================

var TabButton = {
  render: function(id, icon, label, isActive) {
    return '<button class="tab-button' + (isActive ? ' active' : '') + '" data-tab="' + id + '">' +
      '<span class="tab-icon">' + icon + '</span>' +
      '<span class="tab-label">' + label + '</span>' +
    '</button>';
  }
};