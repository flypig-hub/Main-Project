const express = require("express");
const HostController = require("../controller/hostController");
const authMiddleware = require("../middlewares/auth-middleware");
const userIdMiddleware = require("../middlewares/userId-middleware");
const upload = require("../middlewares/S3-middleware");
const router = express.Router();


// 호스트 숙소 등록
router.post('/', authMiddleware, upload.array('images', 8), HostController.hostCreateAcc)


// 호스트 숙소 전체 조회
router.get('/', userIdMiddleware, HostController.getAllAcc)


// 숙소 검색하기
router.get("/address/search", userIdMiddleware, HostController.hostAddresssearch);

// 숙소 타입 검색하기
router.get("/type/search", userIdMiddleware, HostController.hosTypesearch);


// 호스트 숙소 상세 조회
router.get("/:hostId", userIdMiddleware, HostController.getDetailAcc);


// 호스트 숙소 수정
router.put('/:hostId',  authMiddleware, upload.array('images', 8), HostController.updateAcc)


// 호스트 숙소 삭제
router.delete('/:hostId', authMiddleware, HostController.deleteAcc)

module.exports = router;
