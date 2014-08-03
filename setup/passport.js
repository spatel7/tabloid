global.passport = require('passport')
var LocalStrategy = require('passport-local').Strategy;
var User = mongoose.model('User')

passport.serializeUser(function(user, done) {
  done(null, user._id)
})

passport.deserializeUser(function(id, done) {
  User.findOne({ _id: id }, function(err, user) {
    done(err, user);
  })
})

passport.use(new LocalStrategy(
  function (username, password, callback) {
    User.findOne({ username: username }, function (err, user) {
      if (err) { return callback(err); }
      if (!user) { return callback(null, false, { message: 'Unknown user ' + username }); }
      if (user.password !== password) { return callback(null, false, { message: 'Invalid password' }); }
      return callback(null, user);
    });
  }
));