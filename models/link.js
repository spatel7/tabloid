var LinkSchema = new mongoose.Schema({
    url: String
  , title: String
  , miniUrl: String
  , image: String
  , note: String
  , user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
  , tags: [{ type: String, unique: true }]
  , added: { type: Date, default: Date.now }
}, {
    shardkey: { _id: 'hashed' }
  , autoIndex: false
})

LinkSchema.index({ _id: 'hashed' })

mongoose.model('Link', LinkSchema)