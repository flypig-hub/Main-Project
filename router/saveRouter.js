const express = require("express");
const authMiddleware = require("../middlewares/auth-middleware");
const saveController = require("../controller/saveController");
const router = express.Router();

router.post('/:hostId', authMiddleware, saveController.onsave);

router.delete('/:hostId/unsave', authMiddleware, saveController.saveDenied);

module.exports = router;