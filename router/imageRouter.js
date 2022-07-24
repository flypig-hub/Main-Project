const express = require("express");
const ImageController = require("../controller/ImageController");
const authMiddleware = require("../middlewares/auth-middleware");
const upload = require("../middlewares/S3-middleware");
const router = express.Router();


// 이미지 업로드
router.post('/', upload.array('images', 8), ImageController.PostImage)

// 이미지 삭제
router.delete('/deleteimages', ImageController.DeleteImages)

module.exports = router;