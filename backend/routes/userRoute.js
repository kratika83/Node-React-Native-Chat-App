import userController from '../controllers/userController.js';
import authMiddleware from '../middlewares/authMiddleware.js';
import express from 'express';
const userRouter = express.Router();

userRouter.post('/register', userController.register);

userRouter.post('/login', userController.login);

userRouter.get(
    '/',
    authMiddleware,
    userController.userList
);

export default userRouter;