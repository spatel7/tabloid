var ff = require('ff')
  , async = require('async')
  , Link = mongoose.model('Link')
  , LinkCount = mongoose.model('LinkCount')

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

  app.get('/jobs/links/addLinkCounts', function (req, res) {
    var mapping = {};
    var linkCounts = {};
    var f = ff(function() {
      Link.find({}).exec(f.slot())
    }, function (links) {
      links.forEach(function(link){
        if (!mapping[link.url]) {
          mapping[link.url] = [];
        }
        mapping[link.url].push(link.user);
      })
    }, function () {
      LinkCount.find({ url: {$in: Object.keys(mapping)} }).exec(f.slot());
    }, function (docs) {
      docs.forEach(function(doc) {
        linkCounts[doc.url] = doc;
      });
      async.eachSeries(Object.keys(mapping), function (url, next) {
        var linkCount;
        if (!linkCounts[url]) {
          linkCount = new LinkCount({
              url: url
            , users: []
          });
        } else {
          linkCount = linkCounts[url];
        }
        linkCount.users = mapping[url];
        linkCount.updated = new Date();
        linkCount.save();
        setImmediate(next);
      }, f.wait());
    }).onError(function(err){
      console.log(err.stack || err);
      res.send(400, err);
    }).onSuccess(function() {
      res.send('link counts made');
    })
  })
}