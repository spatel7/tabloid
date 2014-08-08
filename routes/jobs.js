var ff = require('ff')
  , async = require('async')
  , Link = mongoose.model('Link')

module.exports = function (app) {
  app.get('/jobs/links/addUpdated', function (req, res) {
    var f = ff(function() {
      Link.find({}).exec(f.slot())
    }, function (links) {
      async.eachSeries(links, function (link, next) {
        if (!link.updated) link.updated = link.added;
        link.save();
        setImmediate(next);
      }, f.wait());
    }).onError(function (err) {
      console.log(err.stack || err);
      res.send(400, 'Something went wrong');
    }).onSuccess(function() {
      res.send('Links updated');
    })
  })
}