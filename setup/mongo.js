global.mongoose = require('mongoose').connect('mongodb://localhost/enthusiast')

mongoose.connection.on('error', function (err) { console.log(err) })

// import models here
require('../models/user')
require('../models/link')
//require('../models/tag')