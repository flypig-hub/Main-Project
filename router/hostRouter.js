const express = require("express");
const HostController = require("../controller/hostController");
const authMiddleware = require("../middlewares/auth-middleware");
const upload = require("../middlewares/S3-middleware");
const router = express.Router();


// 호스트 숙소 작성
router.post('/', authMiddleware, upload.array('images', 8), HostController.hostCreateAcc)



module.exports = router;