var ff = require('ff')
  , User = mongoose.model('User')
  , UserSession = mongoose.model('UserSession')

var pages = {
    index: function (req, res) {
      res.render('index', { title: 'Mainstream' })
    }
  , register: function (req, res) {
      res.render('register', { title: 'Mainstream - Registration'});
    }
  , login: function (req, res) {
      res.render('login', { title: 'Mainstream - Login'});
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

var saveUserSession = function (type, user) {
  var session;
  if (type === 'login') {
    session = new UserSession({
        user: user._id
      , loggedIn: new Date()
      , last: true
    })
    session.save();
    UserSession.update({ user: user._id, last: true, _id: {$ne: session._id }}, {$set: { last: false }}, { multi: true });
  } else if (type === 'logout') {
    var f = ff(function() {
      UserSession.findOne({ user: user._id, last: true }).exec(f.slot());
    }, function (doc) {
      if (!doc) f.fail('user logged out of a session that was not logged into: ' + user.username);
      session = doc;
      session.loggedOut = new Date();
      session.duration = session.loggedOut - session.loggedIn;
      session.save();
    }).onError(function(err) {
      console.log(err);
    })
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
        saveUserSession('login', user);
        return res.redirect('/home')
      });
    })(req, res, next);
  })

  app.get('/logout', function (req, res) {
    if (req.user) {
      saveUserSession('logout', req.user);
    }
    req.logout();
    res.redirect('/');
  })
}