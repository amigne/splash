$(document).ready(function () {

  var boxes = [];

  var boxesCfg = {
    "1" : {
      "type" : "rss",
      "name" : "RTS",
      "url" : "http://www.rts.ch/info/toute-info/?format=rss/news",
    },
    "2" : {
      'type' : "rss",
      "name" : "Le Temps - Généraliste",
      "url" : "https://www.letemps.ch/feed",
    },
  };

  // This code will be called when the page has fully loaded
  function init() {
    window.se.init();

    var id;
    var i = boxes.length;
    for (id in boxesCfg) {
      var box = new Box(i, boxesCfg[id]);
      if (box !== null && box['cfg'] != undefined && box['cfg'] != null) {
        boxes.push(box);
        box.process(refreshPage);
        i++;
      }
    }
  }

  function refreshPage() {
    // Let's clean-up the columns
    for (var i = 0; i < 4; i++) {
      $('#main-col' + i).html('');
    }

    // And fill it again
    for (i = 0; i < boxes.length; i++) {
      var col = i % 4;
      $('#main-col' + col).html($('#main-col' + col).html() + boxes[i].html);
    }

  }

  // MAIN
  init();
});

///////////////////////////////////////////////////////////////////////////////

// SE (Search Engine) logic
(function(global) {
  var se = {}

  var current = null; // Current search engine in use

  // se_engines is a list of all predefined and supported search engines.
  // TODO: Obtain this list from the server!
  var engines = {
    "bing": {
      "name": "Bing",
      "icon": "images/icon_bing_016x016.png",
      "url": "https://www.bing.com/search?q="
    },
    "ddg": {
      "name": "DuckDuckGo",
      "icon": "images/icon_duckduckgo_016x016.png",
      "url": "https://duckduckgo.com/?q="
    },
    "ecosia": {
      "name": "Ecosia",
      "icon": "images/icon_ecosia_016x016.png",
      "url": "https://www.ecosia.org/search?q="
    },
    "google": {
      "name": "Google",
      "icon": "images/icon_google_016x016.png",
      "url": "https://www.google.com/search?q="
    },
    "yahoo": {
      "name": "Yahoo!",
      "icon": "images/icon_yahoo_016x016.png",
      "url": "https://search.yahoo.com/search?p="
    },
  };
  var initial = "google";

  se.init = function() {
    // 1. Make sure the default value is valid, otherwise we'll use the first
    // search engine.
    if (!engines[initial] || !engines[initial]["name"] || 
        !engines[initial]["icon"] || !engines[initial]["url"]) {
      initial = null;
    }

    // 2. Initializes the event handlers when the enter key is pressed in the
    // input field or the Go button is clicked
    $("#se-in-query").keypress(function(event) { if ((event.keyCode || event.which) == '13') submitForm(); });
    $("#se-btn-go").click(function() { submitForm(); });

    // 3. Fill-in the drop-down table with the search engines
    var i = 0;
    var html = '';
    for (var key in engines) {
      var name = engines[key]['name'];
      var icon = engines[key]['icon'];

      html += '<a id="se-itm-' + key + '" class="dropdown-item" href="#">';
      html += '<img src="' + icon + '" class="pr-3"> ' + name;
      html += "</a>\n";

      if (initial === null) {
        // If we have no valid default, we reach this condition at
        // the first loop. Let's set the default value.
        initial = key;
      }
    }
    $("#se-dropdown").html(html);

    // 4. Initializes the event handler for the new objects
    // MUST be performed after having updated the DOM!
    for (key in engines) {
      $("#se-itm-" + key).click(function(event){ changeEngine(event['currentTarget']['id'].slice(7)); });
    }

    // 5. Finally sets the GUI for the default search engine
    changeEngine(initial);
  };

  var changeEngine = function(engine) {
    var classes;

    // 1. Update the icon
    $("#se-img-engine").attr("src", engines[engine]['icon']);

    // 2. Update the input search placeholder
    // TODO: Use a sentence with I18N
    $("#se-in-query").attr("placeholder", engines[engine]['name']);

    // 3. Unactivate the old SE in the list
    if (current) {
      classes = $("#se-itm-" + current).attr('class');
      classes = classes.replace(new RegExp('font-weight-bold'), ''); // deactivated: not bold anymore
      classes = classes.replace(/\s{2,}/g, ' '); // clean-up: let's remove multiple spaces
      classes = classes.replace(/^\s+|\s{2,}|\s+$/g, ''); // clean-up: remove leading+trailing spaces
      $("#se-itm-" + current).attr('class', classes);
    }

    // 4. Activate the new SE in the list
    classes = $("#se-itm-" + engine).attr('class');
    if (classes.search("font-weight-bold") === -1) {
      classes += (classes ? " " : "") + "font-weight-bold";
    }
    $("#se-itm-" + engine).attr('class', classes);

    // 5. Let's store the new engine as the current one
    current = engine;
  };

  function submitForm() {
    var value = $("#se-in-query").val();

    if (!value) {
      // We don't have a valid entry, don't do anything!
      return;
    }

    value = encodeURIComponent(value);

    var url = engines[current]['url'];
    url += value;

    var win = window.open(url, "_blank");
  }

  window.se = se;
})(window);

///////////////////////////////////////////////////////////////////////////////

// CLASS Box

function Box(id, cfg) {
  this.id = id;
  this.cfg = cfg || null;
  this.html = '';
}

Box.prototype.process = function(callback) {
  if (this.getType() == 'rss') {
    var self = this;

    this.rssFeed = new RssFeed(this.cfg['name'], this.cfg['url']);
    this.rssFeed.load(function(result) {
      var html = '';

      if (!result.error) {
        var name = self.rssFeed['name'];
        console.log('name = ' + name);

        html += '<div id="main-box-' + ("0000" + self.id).slice(-4) +
          '" class="box">';
        html += '<header class="box-title font-weight-bold">';
        html += '<img class="pr-2" src="">' + name + '</a>';
        html += '</header>';
        html += '<section class="box-content">';

        for (var i = 0; i < Math.min(result.feed.entries.length, 10); i++) {
          var entry = result.feed.entries[i];
          
          html += '<article class="box-article-rss">';
          html += '<a href="' + entry.link + '">';
          html += '<span class="material-icons rp-2 bullet">chevron_right</span>';
          html += '<span class="title">' + entry.title + '</span>';
          html += '</a>';
          html += '</article>';
        }
        html += '</section>';
        html += '<nav>';
        html += '&nbsp;';
        html += '</nav>';
        html += '</div>';

        self.html = html;
        callback();
      }
    });
  }
}

Box.prototype.getType = function() {
  return (this.cfg && this.cfg['type']) ? this.cfg['type'].toLowerCase() : null;
}

Box.prototype.toString = function() {
  return this.html;
}

///////////////////////////////////////////////////////////////////////////////

google.load('feeds', '1');

// CLASS RssFeed
function RssFeed(name, url) {
  this.name = name || null;
  this.url = url || null;

  this.feed = new google.feeds.Feed(url);
  this.result = null;
}

RssFeed.prototype.load = function(callback) {
  this.feed.load(function(result) { 
    self.result = result; 
    callback(result);
  });
}
