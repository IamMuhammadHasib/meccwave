const express = require("express");
const router = express.Router();

const authenticate = require("../middlewares/authenticationMiddleware");
const fileUploadMiddleware = require("../middlewares/fileUploadMiddleware");
const PostController = require("../controllers/postController");
const validate = require("../middlewares/validateMiddlware");
const postSchema = require("../validators/postValidator");

router.get("/user/:userId", authenticate, PostController.getUserPosts);
router.post("/", authenticate, fileUploadMiddleware, validate(postSchema), PostController.createPost);

module.exports = router;
