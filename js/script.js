// SE (Search Engine) logic
// TODO: Modify to implement as object
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
    if (classes && classes.search("font-weight-bold") === -1) {
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
})(window);/* The following constants are used internally to indicate
 * the size of the screen, according to the Bootstrap breakpoints. */
const XS = 10;
const SM = 20;
const MD = 30;
const LG = 40;
const XL = 50;

/**
 * The constructor for the class Main
 */
function Main(paramsUrl) {
  this.paramsUrl = paramsUrl || null; // URL of the JSON with the parameters
  this.params = null; // The object with the parameters loaded from the URL
  this.page = null; // The current displayed page
  this.boxes = []; // The array for the boxes of all the pages
}

/**
 * This is the main entry point of the class
 */
Main.prototype.start = function() {
  self = this;
  
  // load the parameters from the provided URL
  $.getJSON(this.paramsUrl, (function(data) { self.execute(data); }));

  // On window resize, make sure the page is redisplayed
  $(window).resize(function() { self.refreshPage(); });
};

/**
 * The method execute is called back by the jQuery getJSON method
 * once the parameter file is downloaded.
 */
Main.prototype.execute = function(params) {
  // Store the downloaded params into the object property
  this.params = params;

  // Initializes the search engine (could be performed outside of
  // the asynchronous function, but will use downloaded parameters
  // soon)
  window.se.init();

  var pages = this.params['pages'] || null;
  if (!pages || !(Object.keys(pages).length)) {
    $('#main').html('<div class="alert alert-danger">' +
                    '<strong>FATAL ERROR!</strong> Missing information to ' +
                    'render the page... <strong>Try to reload the ' +
                    'page</strong> and if problem persists, report it to ' +
                    'the webmaster.</div>');

    return;
  }
  
  // Validate the page to be displayed!
  var page = defaultPage || null;
  if (!page || !pages[page]) {
    // The default page is not known, or not described in the parameters.
    page = Object.keys(pages)[0];
  }

  this.generateMenu(page);
  this.generatePage(page);
};

Main.prototype.generateMenu = function(page) {
  if (!page) {
    if (this.page) {
      page = this.page;
    } else {
      return;
    }
  }

  var self = this;
  var pages = Object.keys(this.params['pages']);

  var html = '';

  for (var i in pages) {
    html += '<li class="nav-item' 

    if (pages[i] === page) html += ' current-page';

    html += '"><a class="nav-link" href="#" ' +
            'onclick="$main.changePage(\''+ pages[i] + '\');">' +
            pages[i] + '</a></li>';
  }

  $('#menu').html(html);

  for (i in pages) {
    $('#menu-' + i).click(function(page) { self.changePage(pages[i]); });
  }
}

/**
 * The method generatePage generates the page indicated in parameter
 * and causes the page to be refreshed.
 */
Main.prototype.generatePage = function(page) {
  if (!page) {
    if (this.page) {
      page = this.page;
    } else {
      return;
    }
  }

  var self = this;
  var boxesCfg = this.params['pages'][page];

  this.boxes = []; // Reinitializes the boxes
  for (var id in boxesCfg) {
    var box = new Box(id, boxesCfg[id]);

    if (box !== null && box['cfg'] != undefined && box['cfg'] != null) {
      this.boxes.push(box);
      // The Box.process() method is asynchronous, as it retrieves the
      // RSS feed. So refreshPage() should be referred as a callback!
      box.process(function() { self.refreshPage(); });
    }
  }

  this.page = page;

  // Make sure the page is refreshed after 5 minutes
  setTimeout(function() { self.generatePage(); }, 300000);
};

Main.prototype.refreshPage = function() {
  var curSize = window.innerWidth;
  var maxCols = 0;

  // Let's clean-up the columns
  for (var i = 0; i < 4; i++) {
    $('#main-col' + i).html('');
  }

  /* The HTML defines 4 cols, but we only use them when the dimensions
   * of the screen are coherent. */
  switch(this.getNormalizedSize(curSize)) {
    case XS: maxCols = 1; break;
    case SM: maxCols = 1; break;
    case MD: maxCols = 2; break;
    case LG: maxCols = 3; break;
    case XL: 
    default: maxCols = 4; break;
  }

  // And fill it again
  for (i = 0; i < this.boxes.length; i++) {
    var col = i % maxCols;
    $('#main-col' + col).html($('#main-col' + col).html() + this.boxes[i].html);
  }

  oldSize = curSize;
};

Main.prototype.changePage = function(page) {
  this.generateMenu(page);
  this.generatePage(page);
}

Main.prototype.resizePage = function() {
  // Only redraw the page, if we cross a Bootstrap breakpoint.
  if (this.getNormalizedSize(window.innerWidth) !== 
      this.getNormalizedSize(oldSize)) {
    this.refreshPage();
  }
};

Main.prototype.getNormalizedSize = function(size) {
  // If size is non numeric or negative, return null
  if (!$.isNumeric(size) || size < 0) return null;

  if (size < 576) {
    return XS;
  } else if (size < 768) {
    return SM;
  } else if (size < 992) {
    return MD;
  } else if (size < 1200) {
    return LG;
  } else {
    return XL;
  }
};

// Launch the application after page has fully loaded
$(document).ready(function() {
  var main = new Main(paramsUrl);
  main.start();

  window.$main = main;
});// CLASS Box

function Box(id, cfg) {
  this.id = id;
  this.cfg = cfg || null;
  this.html = '';
}

Box.prototype.process = function(callback) {
  if (this.getType() == 'rss') {
    var self = this;

    this.rssFeed = new RssFeed(this.cfg['name'], this.cfg['url'], 
        this.cfg['icon']);
    this.rssFeed.load(function(result) {
      var html = '';

      if (!result.error) {
        var name = self.rssFeed['name'];
        var icon = self.rssFeed['icon'];

        html += '<div id="main-box-' + ("0000" + self.id).slice(-4) +
          '" class="box">';
        html += '<header class="box-title font-weight-bold">';
        if (icon) {
          html += '<img src="' + icon + '" class="pr-2">';
        }
        html += '<span class="name">' + name + '</span>';
        html += '</header>';
        html += '<section class="box-content">';

        for (var i = 0; i < Math.min(result.feed.entries.length, 10); i++) {
          var entry = result.feed.entries[i];
          var titlearg = entry.title.replace(/"/g, '&quot;');
          
          html += '<article class="box-article-rss">';
          html += '<a href="' + entry.link + '" target="_blank" title="' + 
            titlearg + '">';
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
google.load('feeds', '1');

// CLASS RssFeed
function RssFeed(name, url, icon) {
  this.name = name || null;
  this.url = url || null;
  this.icon = icon || null;

  this.feed = new google.feeds.Feed(url, {
    api_key: 'n9vz8wbrpqn5kacezscrabnki5ck2ihiakvdrlm9',
    count: 100,
    order_by: 'pubDate',
    order_dir: 'desc'
  });
  this.result = null;
}

RssFeed.prototype.load = function(callback) {
  this.feed.load(function(result) { 
    self.result = result; 
    callback(result);
  });
}
