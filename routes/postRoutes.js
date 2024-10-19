const express = require("express");
const router = express.Router();

const authenticate = require("../middlewares/authenticationMiddleware");
const PostController = require("../controllers/postController");
const validate = require("../middlewares/validateMiddlware");
const postSchema = require("../validators/postValidator");

router.get("/user/:userId", authenticate, PostController.getUserPosts);
router.post("/", authenticate, validate(postSchema), PostController.createPost);

module.exports = router;
