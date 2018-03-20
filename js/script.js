$(document).ready(function () {
  // This code will be called when the page has fully loaded
  function init() {
    $("#search-query").keypress(function(event) { if ((event.keyCode || event.which) == '13') submitSearchEngineForm(); });
    $("#search-icon").click(function() { submitSearchEngineForm(); });
  }

  function submitSearchEngineForm() {
    var value = $("#search-query").val();

    if (!value) {
      // We don't have a valid entry, don't do anything!
      return;
    }

    value = encodeURIComponent(value);

    var url = 'https://www.google.com/search?q=';
    url += value;

    var win = window.open(url, "_blank");
  }

  // MAIN
  init();
});