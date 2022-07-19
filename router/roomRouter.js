const express = require("express");
const authMiddleware = require("../middlewares/auth-middleware");
const roomController = require("../controller/roomController");
const router = express.Router();

router.get("/chat/:roomId",  authMiddleware,  roomController.callchats);
router.get("/", roomController.allRoomList);
// router.get("/list/:roomId", authMiddleware, studyRoomCtl.keywordList);
router.post("/", authMiddleware, roomController.createRoom);
router.post("/:roomId", authMiddleware, roomController.enterRoom);
router.delete("/:roomId", authMiddleware, roomController.exitRoom);
// router.post("/checkRoomPw/:roomId", authMiddleware, studyRoomCtl.checkRoomPw);

module.exports = router;
