// convert minutes added in component settings to milliseconds
const TIMEOUT = settings.cache_timeout * 60 * 1000;

const ajaxUrl = `${settings.article_source}/wp-json/wp/v2/${
  settings.filter
}&_embed`;

export default Ember.Component.extend({
  classNames: "article-feed-component",

  init() {
    this._super(...arguments);

    if (!this.site._articleFeed) {
      this.site._articleFeed = [];
    }

    $.ajax({
      url: ajaxUrl,
      beforeSend: () => {
        if (this.site._articleFeed.length) {
          this.pushFeed(this.site._articleFeed[0]);

          return false;
        }
        return true;
      },
      complete: result => {
        this.site._articleFeed.push(result.responseJSON);
        this.pushFeed(result.responseJSON);
      }
    });
  },

  pushFeed(feed) {
    const articles = [];

    let i;
    for (i = 0; i < feed.length; ++i) {
      const article = [];

      article.title = feed[i].title.rendered;
      article.thumbnail =
        feed[i]._embedded["wp:featuredmedia"].firstObject.source_url +
        settings.thumbnail_size;
      article.thumbnailTitle =
        feed[i]._embedded["wp:featuredmedia"].firstObject.title.rendered;
      article.link = feed[i].link;
      articles.push(article);
    }

    this.set("args", { articles: articles });

    $(function() {
      $(".jcarousel").jcarousel();
    });

    Ember.run.later(() => this.refreshCache(), TIMEOUT);
  },

  refreshCache() {
    this.set("args", "");
    this.site._articleFeed = "";
  }
});
