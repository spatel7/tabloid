var UserSchema = new mongoose.Schema({
    username: String
  , password: String
  , email: String
  , name: {}
  , links: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Link' }]
  , tags: [{ type: String, unique: true }]
  , joined: { type: Date, default: Date.now }
}, {
    shardkey: { _id: 'hashed' }
  , autoIndex: false
})

UserSchema.index({ _id: 'hashed' })

mongoose.model('User', UserSchema)