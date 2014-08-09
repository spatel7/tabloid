var LinkCountSchema = new mongoose.Schema({
    url: String
  , users: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User', distinct: true }]
  , created: { type: Date, default: Date.now }
  , updated: Date
}, {
    shardkey: { _id: 'hashed' }
  , autoIndex: false
})

LinkCountSchema.index({ _id: 'hashed' })

mongoose.model('LinkCount', LinkCountSchema)