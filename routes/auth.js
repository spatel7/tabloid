var ff = require('ff')
  , User = mongoose.model('User');

var pages = {
    index: function (req, res) {
      res.render('index', { title: 'Enthusiast' })
    }
  , register: function (req, res) {
      res.render('register', { title: 'Enthusiast - Registration'});
    }
  , login: function (req, res) {
      res.render('login', { title: 'Enthusiast - Login'});
    }
}

var _rerouteUser = function (requested) {
  return function (req, res) {
    if (req.isAuthenticated()) {
      return res.redirect('/home');
    }

    pages[requested](req, res);
  }
}

module.exports = function (app) {
  app.get('/', _rerouteUser('index'))
  app.get('/index', _rerouteUser('index'))
  app.get('/register', _rerouteUser('register'));
  app.get('/login', _rerouteUser('login'));

  app.post('/register', function (req, res) {
    var firstname = req.body.firstname;
    var lastname = req.body.lastname;
    var email = req.body.email;
    var username = req.body.username;
    var password = req.body.password;
    var user;
    if (!firstname || !lastname || !email || !username || !password) {
      return res.send(400, 'All fields required!')
    }
    var f = ff(function () {
      User.findOne({ username: username }).exec(f.slot())
    }, function (doc) {
      if (doc) {
        f.fail(username + ' is already taken!')
      } else {
        user = new User({
            username: username
          , password: password
          , email: email
          , name: {
                firstname: firstname
              , lastname: lastname
              , full: firstname + " " + lastname
            }
          , milestones: []
          , tags: []
        });
        user.save(f.wait());
      }
    }).onError(function (err) {
      return res.send(400, err);
    }).onSuccess(function () {
      req.logIn(user, function (err) {
        if (err) { console.log(err.stack || err); return res.send(400, 'Something went wrong. Please try again in a few seconds.'); }
        return res.send({ success: 'good' });
      })
    })
  })
  
  app.post('/login', function (req, res, next) {
    passport.authenticate('local', function (err, user, info) {
      if (err) { return next(err) }
      if (!user) { return res.send(400, info.message) }
      req.logIn(user, function (err) {
        if (err) { return next(err); }
        return res.redirect('/home')
      });
    })(req, res, next);
  })

  app.get('/logout', function (req, res) {
    req.logout();
    res.redirect('/');
  })
}