global.db = ( process.env.NODE_ENV === 'production' ? 'mongodb://sahilpatel:12345@kahana.mongohq.com:10049/enthusiast' : 'mongodb://localhost/enthusiast')
global.mongoose = require('mongoose').connect(db)

mongoose.connection.on('error', function (err) { console.log(err) })

// import models here
require('../models/user')
require('../models/link')
require('../models/user-session')
require('../models/link-count')
//require('../models/tag')