var ff = require('ff')
  , async = require('async')
  , User = mongoose.model('User')
  , Link = mongoose.model('Link')
  //, Tag = mongoose.model('Tag');

var _minifyUrl = function (url) {
  url = url.replace('https://', '').replace('http://', '').replace('www.','');
  return url.slice(0, (url.indexOf('/') !== -1 ? url.indexOf('/') : url.length));
}

module.exports = function (app) {
  app.get('/home', ensureAuthenticated, function (req, res) {
    var user = req.user;
    var f = ff(function() {
      User.findOne({ _id: user._id }).populate({path: 'links', options: { sort: { added: -1 }}}).exec(f.slot());
    }).onSuccess(function (doc) {
      user = doc;
      return res.render('home', { user: user, title: 'Enthusiast for ' + user.name.firstname, tagSelected: req.params.tag })
    });
  });

  app.get('/home/tag/:tag?', ensureAuthenticated, function (req, res) {
    var user = req.user;
    var f = ff(function() {
      if (req.params.tag) {
        User.findOne({ _id: user._id }).populate({path: 'links', match: { tags: {$in: [req.params.tag]} }, options: { sort: { added: -1 }}}).exec(f.slot());
      } else {
        User.findOne({ _id: user._id }).populate({path: 'links', options: { sort: { added: -1 }}}).exec(f.slot());
      }
    }).onSuccess(function (doc) {
      user = doc;
      return res.render('home', { user: user, title: 'Enthusiast for ' + user.name.firstname, tagSelected: req.params.tag })
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
    console.log(image);
    var link;
    if (!url || !title || !tags) {
      return res.send(400, 'All fields required!');
    } else {
      var tags = tags.split(',').map(function(v) { return v.trim(); });
      var f = ff(function() {
        Link.findOne({ user: user._id, url: url }).exec(f.slot())
      }, function (doc) {
        if (!doc) {
          link = new Link({
              url: url
            , title: title
            , miniUrl: _minifyUrl(url)
            , user: user._id
            , tags: tags
            , image: image
          });
        } else {
          link = doc;
          link.tags = tags;
          link.title = title;
          link.image = image;
        }
        link.save(f.wait());
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

  app.get('/home/delete/:id', function (req, res) {
    var f = ff(function () {
      Link.findOne({ _id: req.params.id, user: req.user._id }).exec(f.slot())
    }, function (doc) {
      if (!doc) {
        f.fail("No such link found.")
      } else {
        Link.remove(doc).exec(f.slot());
      }
    }).onError(function (err) {
      console.log(err);
    }).onComplete(function() {
      res.redirect('/home');
    })
  })

  require('./auth')(app);
  require('./api')(app);
}