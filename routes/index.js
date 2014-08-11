var ff = require('ff')
  , async = require('async')
  , User = mongoose.model('User')
  , Link = mongoose.model('Link')
  , LinkCount = mongoose.model('LinkCount')
  , moment = require('moment')
  //, Tag = mongoose.model('Tag');

var responseTrack = function (count, goal, next) {
  if (count === goal) {
    next();
  }
}

// use regex so theres no need for so many replaces
var _minifyUrl = function (url) {
  url = url.replace('https://', '').replace('http://', '').replace('www.','');
  return url.slice(0, (url.indexOf('/') !== -1 ? url.indexOf('/') : url.length));
}

var _countLinks = function (links, next) {
  var map = {};
  var count = 0;
  var goal = links.length;
  var f = ff(function () {
    async.eachSeries(links, function (link, next) {
      LinkCount.findOne({ url: link.url }, function (err, linkCount) {
        map[link.url] = linkCount.users.length;
        next();
      });
    }, f.wait());
  }).onError(function(err) {
    console.log(err);
    return {};
  }).onSuccess(function() {
    next(map);
  })
}

module.exports = function (app) {
  app.get('/home', ensureAuthenticated, function (req, res) {
    var user = req.user;
    var f = ff(function() {
      if (req.query.tag) {
        User.findOne({ _id: user._id }).populate({path: 'links', match: { tags: {$in: [req.query.tag]} }, options: { sort: { added: -1 }}}).exec(f.slot()); 
      } else {
        User.findOne({ _id: user._id }).populate({path: 'links', options: { sort: { updated: -1 }}}).exec(f.slot());
      }
    }).onSuccess(function (doc) {
      user = doc;
      _countLinks(user.links, function (mapping) {
        user.linkMap = mapping;
        return res.render('home', { user: user, title: 'Tabloid for ' + user.name.firstname, tagSelected: req.params.tag, moment: moment })
      })
    });
  });

  app.get('/home/pin', ensureAuthenticated, function (req, res) {
    res.render('pin', { title: 'Pin a new link' })
  })

  app.post('/home/pin', ensureAuthenticated, function (req, res) {
    var user = req.user;
    var url = req.body.url;
    var title = req.body.title;
    var tags = req.body.tags;
    var image = req.body.image;
    var note = req.body.note;
    var link;
    var linkCount;
    if (!url || !title) {
      return res.send(400, 'All fields required!');
    } else {
      var tags = tags ? tags.split(',').map(function(v) { return v.trim(); }) : [];
      var f = ff(function() {
        Link.findOne({ user: user._id, url: url }).exec(f.slot())
        LinkCount.findOne({ url: url }).exec(f.slot());
      }, function (doc, doc2) {
        if (!doc) {
          link = new Link({
              url: url
            , title: title
            , miniUrl: _minifyUrl(url)
            , user: user._id
            , tags: tags
            , image: image
            , note: note
          });
        } else {
          link = doc;
          link.tags = tags;
          link.title = title;
          link.image = image;
          link.note = note;
        }
        link.updated = new Date();
        link.save(f.wait());

        if (!doc2) {
          linkCount = new LinkCount({
              url: url
            , users: []
          });
        } else {
          linkCount = doc2;
        }
        linkCount.users.addToSet(user._id);
        linkCount.updated = new Date();
        linkCount.save(f.wait());

        async.eachSeries(tags, function (tag, next) {
          user.tags.addToSet(tag);
          setImmediate(next);
        }, f.wait());
      }, function () {
        user.links.addToSet(link._id);
        user.save(f.wait());
      }).onError(function (err) {
        console.log(err);
        return res.render('pin', { title: 'Pin a new link', messages: [err] })
      }).onSuccess(function() {
        res.redirect('/home');
      })
    }
  })

  app.get('/home/delete/:id', ensureAuthenticated, function (req, res) {
    var link;
    var f = ff(function () {
      Link.findOne({ _id: req.params.id, user: req.user._id }).exec(f.slot())
    }, function (doc) {
      if (!doc) {
        f.fail("No such link found.")
      } else {
        link = doc;
        LinkCount.findOne({ url: link.url }).exec(f.slot());
      }
    }, function (linkCount) {
      if (!linkCount) f.fail('no link count found for link')
      var index = linkCount.users.indexOf(user._id);
      if (index !== -1) {
        linkCount.users.splice(index, 1);
        linkCount.updated = new Date();
        linkCount.save(f.wait());
      }
      Link.remove(link).exec(f.wait());
    }).onError(function (err) {
      console.log(err);
    }).onComplete(function() {
      res.redirect('/home');
    })
  })

  require('./auth')(app);
  require('./api')(app);
  require('./jobs')(app);
}