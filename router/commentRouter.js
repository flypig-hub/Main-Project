const express = require("express");
const authMiddleware = require("../middlewares/auth-middleware");
const router = express.Router();
const commentController = require("../controller/commentController");


//post
router.post("/:postId", authMiddleware, commentController.writeComment);

// get
router.get("/:postId/comment", commentController.readComment);

// patch
router.patch("/:postId/:commentId", authMiddleware, commentController.updateComment);

// delete
router.delete("/:postId/:commentId", authMiddleware, commentController.deleteComment);
module.exports = router;