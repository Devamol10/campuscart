import express from "express";
import {
  getMyConversations,
  getOrCreateConversation,
  getMessages,
  sendMessage,
} from "../controllers/chatController.js";
import { protect } from "../middlewares/authMiddleware.js";

const router = express.Router();

router.use(protect);

router.get("/conversations", getMyConversations);
router.post("/conversations", getOrCreateConversation);
router.get("/conversations/:id/messages", getMessages);
router.post("/messages", sendMessage);

export default router;
