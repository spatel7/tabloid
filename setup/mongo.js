global.mongoose = require('mongoose').connect('mongodb://sahilpatel:12345@kahana.mongohq.com:10049/enthusiast')

mongoose.connection.on('error', function (err) { console.log(err) })

// import models here
require('../models/user')
require('../models/link')
//require('../models/tag')