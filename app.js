var express = require('express')
  , http = require('http')
  , app = express()
  , path = require('path')
  , dir = path.dirname(require.main.filename)
  , MongoStore = require('connect-mongo')(express)
  , stylus = require('stylus')
  , nib = require('nib')

var compile = function (str, path) {
  return stylus(str).set('filename', path).use(nib())
}

global.ensureAuthenticated = function (req, res, next) {
  if (req.isAuthenticated()) { return next(); }
  res.redirect('/login');
}

appserver = http.createServer(app)

require('./setup/mongo')
require('./setup/passport')

app.set('trust proxy', true)
app.set('view engine', 'jade')
app.set('views', dir + '/views')

app.configure(function() {
  app.use(stylus.middleware({
      src: dir + '/public'
    , compile: compile
  }))
  
  app.use(express.static(path.join(__dirname, 'public')))

  app.use(express.cookieParser());
  app.use(express.json())
  app.use(express.urlencoded())

  app.use(express.session({
      secret: 'enthusiasticabouterrythin'
    , store: new MongoStore({
          url: "mongodb://sahilpatel:12345@kahana.mongohq.com:10049/enthusiast"
        , 'auto_reconnect': true
      })
    , cookie: {
          maxAge: 604800000
    }
  }))  

  app.use(passport.initialize());
  app.use(passport.session());

  app.use(app.router);
});

app.get('/ping', function (req, res) {
  res.send('pong');
})

require('./routes')(app)

appserver.listen(3000, function () {
  console.log('enthusiast server accepting requests on port 3000')
})

process.on('SIGTERM', function () {
  appserver.close()
})