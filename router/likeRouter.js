const express = require("express");
const authMiddleware = require("../middlewares/auth-middleware");
const likeController = require("../controller/likeController");
const router = express.Router();


router.post('/:postId/like', authMiddleware, likeController.onlike);


router.delete('/:postId/unlike', authMiddleware, likeController.unlike);


module.exports = router;