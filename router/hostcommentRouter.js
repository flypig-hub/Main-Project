const express = require("express");
const authMiddleware = require("../middlewares/auth-middleware");
const router = express.Router();
const hostcommentController = require("../controller/hostcommentController");


//review 남기기
router.post("/:hostId/review", authMiddleware, hostcommentController.writeReview);


//review 불러오기
router.get("/:hostId/review", hostcommentController.readReview);

//review 수정하기
router.put("/:hostId/:reviewId", authMiddleware, hostcommentController.updateReview);

//review 삭제하기

router.delete("/:hostId/:reviewId", authMiddleware, hostcommentController.deleteReivew);

module.exports = router;