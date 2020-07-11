// Express docs: http://expressjs.com/en/api.html
const express = require('express')
// const passport = require('passport')
const Post = require('../models/post')

const customErrors = require('../../lib/custom_errors')

const handle404 = customErrors.handle404

// this is middleware that will remove blank fields from `req.body`, e.g.
// { example: { title: '', text: 'foo' } } -> { example: { text: 'foo' } }
// const removeBlanks = require('../../lib/remove_blank_fields')
// const requireOwnership = customErrors.requireOwnership
const router = express.Router()
// const requireToken = passport.authenticate('bearer', { session: false })

// router.get('/comment', requireToken, (req, res, next) => {
//   console.log('we are in the index route', Comment)
//   Comment.find()
// .then(comments => {
// `posts` will be an array of Mongoose documents
// we want to convert each one to a POJO, so we use `.map` to
// apply `.toObject` to each one
// return comments.map(comment => comment.toObject())
// })
// respond with status 200 and JSON of the examples
// .then(comments => res.status(200).json({ comments: comments }))
// if an error occurs, pass it to the handler
// .catch(next)
// })

// SHOW
// GET /comment/5a7db6c74d55bc51bdf39793
// router.get('/comment/:id', requireToken, (req, res, next) => {
//   Comment.findById(req.params.id)
//     .then(handle404)
//     .then(comment => res.status(200).json({ comment: comment.toObject() }))
//     .catch(next)
// })

// CREATE
// POST /comment
router.post('/comment/:id', (req, res, next) => {
  console.log('line 44', req.body)
  // req.body.comment.owner = req.user.id
  const commentData = req.body.comment
  const postId = req.params.id
  Post.findById(postId)
    .then(handle404)
    .then(post => {
      console.log('what is post, post is ', post)
      post.comments.push(commentData)
      return post.save()
    })
    .then(post => {
      res.status(201).json({ post: post })
    })
    .catch(next)
})

// UPDATE
// PATCH /comment/5a7db6c74d55bc51bdf39793
// router.patch('/comment/:id', requireToken, removeBlanks, (req, res, next) => {
// if the client attempts to change the `owner` property by including a new
// owner, prevent that by deleting that key/value pair
// delete req.body.comment.owner

// Comment.findById(req.params.id)
//   .then(handle404)
//   .then(comment => {
//     requireOwnership(req, comment)
//     return comment.updateOne(req.body.comment)
//   })
// if that succeeded, return 204 and no JSON
// .then(() => res.sendStatus(204))
// if an error occurs, pass it to the handler
// .catch(next)
// })

// DESTROY
// DELETE /comment/5a7db6c74d55bc51bdf39793
// router.delete('/comment/:id', requireToken, (req, res, next) => {
//   Comment.findById(req.params.id)
//     .then(handle404)
//     .then(comment => {
// delete the post ONLY IF the above didn't throw
// requireOwnership(req, comment)
// comment.deleteOne()
// })
// send back 204 and no content if the deletion succeeded
// .then(() => res.sendStatus(204))
// if an error occurs, pass it to the handler
//     .catch(next)
// })

module.exports = router
