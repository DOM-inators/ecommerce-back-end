const mongoose = require('mongoose')

const cartSchema = new mongoose.Schema({
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  products: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product'
  }],
  completed: false
})

module.exports = mongoose.model('Cart', cartSchema)
