const express = require("express");
const Promotion = require("../models/promotion");
const authenticate = require("../authenticate");
const verifyAdmin = require("../verifyAdmin");

const promotionRouter = express.Router();

// Error handler middleware
const errorHandler = (err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500);
  res.json({ error: err.message });
};

promotionRouter.use(express.json());

// Middleware to check if the user is an admin
const isAdmin = (req, res, next) => {
  if (req.user && req.user.admin) {
    return next();
  } else {
    const err = new Error("You are not authorized to perform this operation!");
    err.status = 403;
    return next(err);
  }
};

promotionRouter
  .route("/")
  .get((req, res, next) => {
    Promotion.find()
      .then((promotions) => {
        res.statusCode = 200;
        res.setHeader("Content-Type", "application/json");
        res.json(promotions);
      })
      .catch(next);
  })
  .post(authenticate.verifyUser, isAdmin, (req, res, next) => {
    Promotion.create(req.body)
      .then((promotion) => {
        console.log("Promotion Created ", promotion);
        res.statusCode = 200;
        res.setHeader("Content-Type", "application/json");
        res.json(promotion);
      })
      .catch(next);
  })
  .delete(authenticate.verifyUser, isAdmin, (req, res, next) => {
    Promotion.deleteMany()
      .then((response) => {
        res.statusCode = 200;
        res.setHeader("Content-Type", "application/json");
        res.json(response);
      })
      .catch(next);
  });

promotionRouter
  .route("/:promotionId")
  .get((req, res, next) => {
    Promotion.findById(req.params.promotionId)
      .then((promotion) => {
        res.statusCode = 200;
        res.setHeader("Content-Type", "application/json");
        res.json(promotion);
      })
      .catch(next);
  })
  .put(authenticate.verifyUser, isAdmin, (req, res, next) => {
    Promotion.findByIdAndUpdate(
      req.params.promotionId,
      {
        $set: req.body,
      },
      { new: true }
    )
      .then((promotion) => {
        res.statusCode = 200;
        res.setHeader("Content-Type", "application/json");
        res.json(promotion);
      })
      .catch(next);
  })
  .delete(authenticate.verifyUser, isAdmin, (req, res, next) => {
    Promotion.findByIdAndDelete(req.params.promotionId)
      .then((response) => {
        res.statusCode = 200;
        res.setHeader("Content-Type", "application/json");
        res.json(response);
      })
      .catch(next);
  });

module.exports = promotionRouter;
