const express = require("express");
const PostController = require("../controller/postController");
const authMiddleware = require("../middlewares/auth-middleware");
const ImageController = require("../controller/ImageController");
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


// ******************************************************************
// 게시글 삭제 API(email, articleId 같이 맞으면 삭제)
router.delete('/:postId', PostController.DeletePost);

// 이미지 업로드
router.post('/images', authMiddleware, upload.array('images', 8), ImageController.PostImage)

// 이미지 가져오기
// router.get('/images', ImageController.GetImages)

// 이미지 삭제
// router.delete('/images', upload.array('images', 8), ImageController.DeleteImages)

module.exports = router;