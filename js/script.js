$(document).ready(function () {
  // se_engines is a list of all predefined and supported search engines.
  // TODO: Obtain this list from the server!
  var se_engines = {
    "bing": {
      "name": "Bing",
      "icon": "images/icon_bing_16.png",
      "url": "https://www.bing.com/search?q="
    },
    "ddg": {
      "name": "DuckDuckGo",
      "icon": "images/icon_duckduckgo_16.png",
      "url": "https://duckduckgo.com/?q="
    },
    "ecosia": {
      "name": "Ecosia",
      "icon": "images/icon_ecosia_16.png",
      "url": "https://www.ecosia.org/search?q="
    },
    "google": {
      "name": "Google",
      "icon": "images/icon_google_16.png",
      "url": "https://www.google.com/search?q="
    },
    "yahoo": {
      "name": "Yahoo!",
      "icon": "images/icon_yahoo_16.png",
      "url": "https://search.yahoo.com/search?p="
    },
  };
  var default_se = "google";
  var current_se = null;
  var old_se     = null;

  // This code will be called when the page has fully loaded
  function init() {
    init_se();
  }

  // init_se() initializes the Search Engine form
  function init_se() {
    var dropdown = $("#se-dropdown");
    var i; // Used for counting
    var key; // Used for looping in tables
    var html = ""; // Code to be inserted
    var new_se = null;

    // Initializes the event handlers when the enter key is pressed in the
    // input field or the Go button is clicked
    $("#se-in-query").keypress(function(event) { if ((event.keyCode || event.which) == '13') submitSearchEngineForm(); });
    $("#se-btn-go").click(function() { submitSearchEngineForm(); });

    // Make sure the default value exists, otherwise we'll use the first
    // search engine.
    if (!se_engines[default_se] || !se_engines[default_se]["name"] || 
        !se_engines[default_se]["icon"] || !se_engines[default_se]["url"]) {
      default_se = null;
    }

    // Initializes the list of supported search engines in the dropdown
    i = 0;
    for (key in se_engines) {
      var name = se_engines[key]["name"];
      var icon = se_engines[key]["icon"];
      var url = se_engines[key]["url"];

      html += '<a id="se-itm-' + key + '" class="dropdown-item';
      if (default_se === key || (default_se === null && i === 0)) {
        // html += ' font-weight-bold'; // Active engine is highlighted in bold
        new_se = key;
      }
      html += '" href="#">';
      html += '<img src="' + icon + '" class="pr-3"> ' + name;
      html += '</a>' + "\n";
    }
    dropdown.html(html);

    // Initializes the event handler for the new objects
    // MUST BE performed after having updated the DOM!
    for (key in se_engines) {
      $("#se-itm-" + key).click(function(event){ seChangeEngine(event['currentTarget']['id'].slice(7)); });
    }

    // Sets the icon for the default search engine
    seChangeEngine(new_se);
  }

  function seChangeEngine(engine) {
    // console.log("seChangeEngine(\"" + engine + "\")");
    var img = $("#se-img-engine");
    var item = null;

    var icon = se_engines[engine]["icon"];
    var name = se_engines[engine]["name"];

    // 1. Update the icon
    $("#se-img-engine").attr("src", icon);

    // 2. Update the input search placeholder
    $("#se-in-query").attr("placeholder", name);

    // 3. Unactivate the old SE in the list
    if (current_se) {
      item = $("#se-itm-" + current_se);
      var classes = item.attr('class').split(/\s+/);
      var newClasses = "";
      for (var key in classes) {
        if (classes[key] !== "font-weight-bold") {
          newClasses += (newClasses ? " " : "") + classes[key];
        }
      }
      item.attr('class', newClasses);
    }

    // 4. Activate the new SE in the list
    item = $("#se-itm-" + engine);
    classes = item.attr('class');
    if (classes.search("font-weight-bold") === -1) {
      classes += (classes ? " " : "") + "font-weight-bold";
    }
    item.attr('class', classes);

    current_se = engine;
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