const express = require("express");
const authMiddleware = require("../middlewares/auth-middleware");
const saveController = require("../controller/saveController");
const router = express.Router();

router.post('/:postId', authMiddleware, saveController.onsave);

router.delete('/:postId/unsave', authMiddleware, saveController.saveDenied);

module.exports = router;