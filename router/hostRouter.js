const express = require("express");
const HostController = require("../controller/hostController");
const authMiddleware = require("../middlewares/auth-middleware");
const upload = require("../middlewares/S3-middleware");
const router = express.Router();


// 호스트 숙소 등록
router.post('/', authMiddleware, upload.array('images', 8), HostController.hostCreateAcc)


// 호스트 숙소 전체 조회
router.get('/',  HostController.getAllAcc)

// 숙소 검색하기
router.get('/search', HostController.hostsearch)

// 호스트 숙소 상세 조회
router.get('/:hostId',  HostController.getDetailAcc)


// 호스트 숙소 수정
router.put('/:hostId',  authMiddleware, upload.array('images', 8), HostController.updateAcc)


// 호스트 숙소 삭제
router.delete('/:hostId', authMiddleware, HostController.deleteAcc)

module.exports = router;