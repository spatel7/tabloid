var ff = require('ff')
  , cheerio = require('cheerio')
  , request = require('request');

module.exports = function (app) {
  app.get('/api/scrape', function (req, res) {
    var url = req.query.url;
    var title;
    var images = [];
    var count;
    if (!url) {
      return res.send(400, 'No such website found.');
    }
    var f = ff(function () {
      request.get(url, f.slotMulti(2));
    }, function (r, body) {
      var $ = cheerio.load(body, {
          lowerCaseTags: true
        , lowerCaseAttributeNames: true
      });

      $('title').each(function () {
        title = $(this).text().trim();
        return false;
      });

      count = $('img').length;

      // overall, need a much better algorithm to catch all images on a page
      $('img, div').each(function () {
        var src;
        if ($(this).is('img')) {
          src = $(this).attr('src');
        } else if ($(this).is('div') && $(this).css('background-image')) {
          src = $(this).css('background-image').replace('url(','').replace(')','');
          if (src === 'https') {
            var s = $(this).attr('style');
            if (s) {
              s = s.slice(s.indexOf('background-image'));
              if (s) {
                s = s.slice(s.indexOf('url(') + 4, s.indexOf(')')).replace('"', '').replace("'", "");
                src = s;
              }
            }
          }
        }
        if (src) {
          if (src.slice(0, 1) === '/') {
            src = url + src;
          }
          images.push(src);
        }
      })
    }).onError(function (err) {
      console.log(err);
      if (err.message.indexOf('Invalid URI') === 0) {
        return res.send(400, "No such website found.");
      } else {
        return res.send(400, "Sorry something went wrong");
      }
    }).onSuccess(function () {
      return res.send({ title: title, images: images, count: count })
    })
  })

  app.get('/api/scrape/title', function (req, res) {
    var url = req.query.url;
    if (!url) {
      return res.send(400, 'No such website found.');
    }
    var f = ff(function () {
      request.get(url, f.slotMulti(2));
    }, function (r, body) {
      var $ = cheerio.load(body, {
          lowerCaseTags: true
        , lowerCaseAttributeNames: true
      });

      $('title').each(function () {
        f.pass($(this).text());
        return false;
      });
    }, function (title) {
      return res.send(title);
    }).onError(function (err) {
      console.log(err);
      if (err.message.indexOf('Invalid URI') === 0) {
        return res.send(400, "No such website found.");
      } else {
        return res.send(400, "Sorry something went wrong");
      }
    })
  })

  app.get('/api/scrape/images', function (req, res) {
    var url = req.query.url;
    if (!url) {
      return res.send(400, 'No such website found.');
    }
    var f = ff(function () {
      request.get(url, f.slotMulti(2));
    }, function (r, body) {
      var $ = cheerio.load(body, {
          lowerCaseTags: true
        , lowerCaseAttributeNames: true
      });

      var images = "";

      $('img').each(function () {
        var src = $(this).attr('src');
        if (src.slice(0, 1) === '/') {
          src = url + src;
        }
        images += src + ",";
      });

      f.pass(images);
    }, function (images) {
      return res.send(images);
    }).onError(function (err) {
      console.log(err);
      if (err.message.indexOf('Invalid URI') === 0) {
        return res.send(400, "No such website found.");
      } else {
        return res.send(400, "Sorry something went wrong");
      }
    })
  })
}