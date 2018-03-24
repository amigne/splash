// CLASS Box

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
