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
