// Require express
const express = require('express')
const passport = require('passport')

// We will require our product model
const Cart = require('./../models/cart')

// require custom errors
const { handle404, requireOwnership } = require('../../lib/custom_errors')

const requireToken = passport.authenticate('bearer', { session: false })
const router = express.Router()

// Create a new cart
router.post('/cart', requireToken, (req, res, next) => {
  // set the owner of the cart to the user's id
  req.body.cart.owner = req.user._id
  Cart.create(req.body.cart)
    .then(cart => {
      res.status(201).json({ cart: cart.toObject() })
    })
    .catch(next)
})

// Set order completed to true (Turn cart into order)
router.patch('/orders/:id', requireToken, (req, res, next) => {
  const id = req.params.id
  Cart.findById(id)
    .then(handle404)
    .then(res => requireOwnership(req, res))
    .then(cart => cart.updateOne({completed: true}))
    .then(() => res.sendStatus(204))
    .catch(next)
})

// Add item to cart
router.patch('/cart/:id', requireToken, (req, res, next) => {
  const id = req.params.id
  Cart.findById(id)
    .then(handle404)
    .then(res => requireOwnership(req, res))
    .then(cart => {
      cart.products.push(req.body.products.id)
      return cart.save()
    })
    .then(() => res.sendStatus(204))
    .catch(next)
})

// Delete item from cart
router.patch('/cart-delete/:id', requireToken, (req, res, next) => {
  const id = req.params.id
  Cart.findById(id)
    .then(handle404)
    .then(res => requireOwnership(req, res))
    .then(cart => {
      const index = cart.products.indexOf(req.body.products.id)
      if (index > -1) {
        cart.products.splice(index, 1)
      }

      return cart.save()
    })
    .then(() => res.sendStatus(204))
    .catch(next)
})

// Retrieve all carts
router.get('/cart', requireToken, (req, res, next) => {
  Cart.find({owner: req.user.id})
    .populate('products')
    .then(carts => {
      return carts.map(cart => cart.toObject())
    })
    .then(carts => res.status(200).json({ carts: carts }))
    .catch(next)
})

// Show cart
router.get('/cart/:id', requireToken, (req, res, next) => {
  Cart.findById(req.params.id)
    .populate('products')
    .then(handle404)
    .then(cart => {
      cart.map(res.status(200).json({ cart: cart.toObject() }))
    })
    .catch(next)
})

module.exports = router
