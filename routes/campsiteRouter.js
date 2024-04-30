const express = require("express");
const Campsite = require("../models/campsite");
const authenticate = require("../authenticate");

const campsiteRouter = express.Router();

// Middleware to check if the user is the author of the comment
const isCommentAuthor = (req, res, next) => {
  const commentId = req.params.commentId;
  const userId = req.user._id;
  Campsite.findById(req.params.campsiteId)
    .then((campsite) => {
      const comment = campsite.comments.id(commentId);
      if (!comment) {
        const err = new Error("Comment not found");
        err.status = 404;
        return next(err);
      }
      if (comment.author.equals(userId)) {
        return next();
      } else {
        const err = new Error("You are not authorized to perform this action");
        err.status = 403;
        return next(err);
      }
    })
    .catch(next);
};

campsiteRouter
  .route("/:campsiteId/comments/:commentId")
  .put(authenticate.verifyUser, isCommentAuthor, (req, res, next) => {
    Campsite.findById(req.params.campsiteId)
      .then((campsite) => {
        if (campsite) {
          let comment = campsite.comments.id(req.params.commentId);
          if (comment) {
            if (req.body.rating) {
              comment.rating = req.body.rating;
            }
            if (req.body.text) {
              comment.text = req.body.text;
            }
            campsite
              .save()
              .then((campsite) => {
                res.statusCode = 200;
                res.setHeader("Content-Type", "application/json");
                res.json(campsite);
              })
              .catch((err) => next(err));
          } else {
            const err = new Error("Comment not found");
            err.status = 404;
            return next(err);
          }
        } else {
          const err = new Error("Campsite not found");
          err.status = 404;
          return next(err);
        }
      })
      .catch((err) => next(err));
  })
  .delete(authenticate.verifyUser, isCommentAuthor, (req, res, next) => {
    Campsite.findById(req.params.campsiteId)
      .then((campsite) => {
        if (campsite) {
          let comment = campsite.comments.id(req.params.commentId);
          if (comment) {
            comment.remove();
            campsite
              .save()
              .then((campsite) => {
                res.statusCode = 200;
                res.setHeader("Content-Type", "application/json");
                res.json(campsite);
              })
              .catch((err) => next(err));
          } else {
            const err = new Error("Comment not found");
            err.status = 404;
            return next(err);
          }
        } else {
          const err = new Error("Campsite not found");
          err.status = 404;
          return next(err);
        }
      })
      .catch((err) => next(err));
  });

module.exports = campsiteRouter;
