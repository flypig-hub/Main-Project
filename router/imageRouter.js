const express = require("express");
const authMiddleware = require("../middlewares/auth-middleware");
const ImageController = require("../controller/ImageController");
const upload = require("../middlewares/S3-middleware");
const router = express.Router();


// 이미지 업로드
router.post('/images', authMiddleware, upload.array('images', 8), ImageController.PostImage)


// 이미지 가져오기
router.get('/images', ImageController.GetImages)


// 이미지 삭제
router.delete('/images', upload.array('images', 8), ImageController.DeleteImages)

module.exports = router;