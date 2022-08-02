const express = require("express");
const authMiddleware = require("../middlewares/auth-middleware");
const roomController = require("../controller/roomController");
const userIdMiddleware = require("../middlewares/userId-middleware");
const router = express.Router();

router.get("/chat/:roomId",  authMiddleware,  roomController.callchats);
router.get("/", roomController.allRoomList);
router.get("/search", userIdMiddleware, roomController.searchRoom); 
router.get("/search/hashTag", userIdMiddleware,roomController.searchRoombyhashtag); 
router.get("/:roomId", authMiddleware, roomController.Roomdetail);
router.post("/", authMiddleware, roomController.createRoom);
router.post("/:roomId", authMiddleware, roomController.enterRoom);
router.delete("/:roomId", authMiddleware, roomController.exitRoom);
router.get("/populer", userIdMiddleware, roomController.populerRoom);
module.exports = router;
