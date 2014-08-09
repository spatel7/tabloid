var UserSessionSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
  , loggedIn: Date
  , loggedOut: Date
  , duration: Number
  , last: Boolean
}, {
    shardkey: { _id: 'hashed' }
  , autoIndex: false
})

UserSessionSchema.index({ _id: 'hashed' })

mongoose.model('UserSession', UserSessionSchema)