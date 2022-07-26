const express = require("express");
const authMiddleware = require("../middlewares/auth-middleware");
const router = express.Router();
const reviewController = require("../controller/reviewController");


//review 남기기
router.post("/:hostId/review", authMiddleware, reviewController.writeReview);


//review 불러오기
router.get("/:hostId/review", reviewController.readReview);

//review 수정하기
router.put("/:hostId/:reviewId", authMiddleware, reviewController.updateReview);

//review 삭제하기

router.delete("/:hostId/:reviewId", authMiddleware, reviewController.deleteReivew);

module.exports = router;