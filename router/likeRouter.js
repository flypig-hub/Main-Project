const express = require("express");
const authMiddleware = require("../middlewares/auth-middleware");
const likeController = require("../controller/likeController");
const router = express.Router();


router.post('/:postId', authMiddleware, likeController.like);


router.get('/:postId', likeController.totalLike);


router.delete('/:postId/unlike', authMiddleware, likeController.deletelike);


module.exports = router;