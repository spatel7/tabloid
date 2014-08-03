var TagSchema = new mongoose.Schema({
    name: String
  , user: { type: mongoose.Schema.Types.ObjectId, ref: 'User '}
  , links: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Link' }]
}, {
    shardkey: { _id: 'hashed' }
  , autoIndex: false
})

TagSchema.index({ _id: 'hashed' })

mongoose.model('Tag', TagSchema)