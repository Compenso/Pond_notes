// Express docs: http://expressjs.com/en/api.html
const express = require('express')
const passport = require('passport')
// pull in Mongoose model for a comment
const Comment = require('../models/comment')

// this is a collection of methods that help us detect situations when we need
// to throw a custom error
const customErrors = require('../../lib/custom_errors')

// we'll use this function to send 404 when non-existant document is requested
const handle404 = customErrors.handle404

// this is middleware that will remove blank fields from `req.body`, e.g.
// { example: { title: '', text: 'foo' } } -> { example: { text: 'foo' } }
const removeBlanks = require('../../lib/remove_blank_fields')
const requireOwnership = customErrors.requireOwnership
// instantiate a router (mini app that only handles routes)
const router = express.Router()
const requireToken = passport.authenticate('bearer', { session: false })
// INDEX
// GET /comment
router.get('/comment', requireToken, (req, res, next) => {
  console.log('we are in the index route', Comment)
  Comment.find()
    .then(comments => {
      // `posts` will be an array of Mongoose documents
      // we want to convert each one to a POJO, so we use `.map` to
      // apply `.toObject` to each one
      return comments.map(comment => comment.toObject())
    })
    // respond with status 200 and JSON of the examples
    .then(comments => res.status(200).json({ comments: comments }))
    // if an error occurs, pass it to the handler
    .catch(next)
})

// SHOW
// GET /comment/5a7db6c74d55bc51bdf39793
router.get('/comment/:id', requireToken, (req, res, next) => {
  // req.params.id will be set based on the `:id` in the route
  Comment.findById(req.params.id)
    .then(handle404)
    // if `findById` is succesful, respond with 200 and "example" JSON
    .then(comment => res.status(200).json({ comment: comment.toObject() }))
    // if an error occurs, pass it to the handler
    .catch(next)
})

// CREATE
// POST /comment
router.post('/comment', requireToken, (req, res, next) => {
  req.body.comment.owner = req.user.id

  Comment.create(req.body.comment)
    // respond to succesful `create` with status 201 and JSON of new "post"
    .then(comment => {
      res.status(201).json({ comment: comment.toObject() })
    })
    // if an error occurs, pass it off to our error handler
    // the error handler needs the error message and the `res` object so that it
    // can send an error message back to the client
    .catch(next)
})

// UPDATE
// PATCH /comment/5a7db6c74d55bc51bdf39793
router.patch('/comment/:id', requireToken, removeBlanks, (req, res, next) => {
  // if the client attempts to change the `owner` property by including a new
  // owner, prevent that by deleting that key/value pair
  delete req.body.comment.owner

  Comment.findById(req.params.id)
    .then(handle404)
    .then(comment => {
      requireOwnership(req, comment)
      return comment.updateOne(req.body.comment)
    })
    // if that succeeded, return 204 and no JSON
    .then(() => res.sendStatus(204))
    // if an error occurs, pass it to the handler
    .catch(next)
})

// DESTROY
// DELETE /comment/5a7db6c74d55bc51bdf39793
router.delete('/comment/:id', requireToken, (req, res, next) => {
  Comment.findById(req.params.id)
    .then(handle404)
    .then(comment => {
      // delete the post ONLY IF the above didn't throw
      requireOwnership(req, comment)
      comment.deleteOne()
    })
    // send back 204 and no content if the deletion succeeded
    .then(() => res.sendStatus(204))
    // if an error occurs, pass it to the handler
    .catch(next)
})

module.exports = router
