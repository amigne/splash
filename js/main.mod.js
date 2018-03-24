/* The following constants are used internally to indicate
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
});