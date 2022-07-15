const express = require("express");
const PostController = require("../controller/postController");
const authMiddleware = require("../middlewares/auth-middleware");
const upload = require("../middlewares/S3-middleware");
const router = express.Router();

// 게시글 작성 API
router.post('/', authMiddleware, upload.array('images', 8), PostController.WritePosting);


// 게시글 조회 API
router.get('/', PostController.GetPostingList);


// 게시글 상세 조회 API
router.get('/:postId', PostController.GetPost);


// 게시글 수정 API
router.patch('/:postId', authMiddleware, upload.array('images', 8), PostController.ModifyPosting);


// 게시글 삭제 API(email, articleId 같이 맞으면 삭제)
router.delete('/:postId', PostController.DeletePost);

module.exports = router;