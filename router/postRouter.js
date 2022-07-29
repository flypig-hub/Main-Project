const express = require("express");
const PostController = require("../controller/postController");
const userIdMiddleware = require("../middlewares/userId-middleware");
const authMiddleware = require("../middlewares/auth-middleware");
const ImageController = require("../controller/ImageController");
const upload = require("../middlewares/S3-middleware");
const router = express.Router();

// 게시글 작성 API
router.post('/', authMiddleware, upload.array('images', 8), upload.array('textImages', 8), PostController.WritePosting);


// 게시글 조회 API
router.get("/", userIdMiddleware, PostController.GetPostingList);


// 게시글 상세 조회 API
router.get('/:postId',userIdMiddleware, PostController.GetPost);


// 게시글 수정 API
router.patch('/:postId', authMiddleware, upload.array('images', 8), PostController.ModifyPosting);


// 게시글 삭제 API
router.delete('/:postId', authMiddleware, PostController.DeletePost);


module.exports = router;
