import authMiddleware from '../middlewares/authMiddleware.js';
import conversationController from '../controllers/conversationController.js';
import express from 'express';
const conversationRouter = express.Router();

conversationRouter.get(
    '/',
    authMiddleware,
    conversationController.conversations
);

conversationRouter.post(
    '/',
    authMiddleware,
    conversationController.oneToOneConversation
);

conversationRouter.get(
    '/:id/messages',
    authMiddleware,
    conversationController.messagesForConversation
);

export default conversationRouter;