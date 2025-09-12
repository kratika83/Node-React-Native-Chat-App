import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
const app = express();
app.use(express.json());

import cors from 'cors';
app.use(cors());

import connect from './config/db.js';
connect();

import { Server } from 'socket.io';
import jwt from 'jsonwebtoken';
import userModel from './models/userModel.js';
import messageModel from './models/messageModel.js';
import conversationModel from './models/conversationModel.js';

import userRouter from './routes/userRoute.js';
app.use('/api/users', userRouter);

import conversationRouter from './routes/conversationRoute.js';
app.use('/api/conversations', conversationRouter);

import http from 'http';
const server = http.createServer(app);
const io = new Server(server, { cors: { origin: '*' } });

const onlineUsers = new Map(); // userId -> Set(socketIds)

io.use((socket, next) => {
    const token = socket.handshake.auth?.token;
    if (!token) return next(new Error('no token'));
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        socket.userId = decoded.id;
        return next();
    } catch (err) {
        return next(new Error('invalid token'));
    }
});

io.on('connection', socket => {
    const userId = socket.userId;
    if (!userId) return;
    // add socket id to online map
    const s = onlineUsers.get(userId) || new Set();
    s.add(socket.id);
    onlineUsers.set(userId, s);

    // mark user online
    userModel.findByIdAndUpdate(userId, { online: true, lastSeen: new Date() }).exec().catch(console.error);
    io.emit('user:online', { userId });

    socket.on('join:conversation', convId => {
        if (convId) socket.join(convId);
    });

    socket.on('message:send', async (payload) => {
        // payload = { conversationId, to, text }
        const msg = await messageModel.create({
            conversation: payload.conversationId,
            sender: userId,
            recipient: payload.to,
            text: payload.text || '',
            status: 'sent'
        });
        // update conversation lastMessage
        await conversationModel.findByIdAndUpdate(payload.conversationId, {
            lastMessage: { text: payload.text || '', sender: userId, createdAt: new Date() },
            updatedAt: new Date()
        });
        // emit to room
        io.to(payload.conversationId).emit('message:new', msg);
        const recipientSockets = onlineUsers.get(payload.to);
        if (recipientSockets) {
            for (const sid of recipientSockets) {
                io.to(sid).emit('notification:message', { conversationId, message: msg });
            }
        }
    });

    socket.on('message:delivered', async ({ messageId }) => {
        try {
            if (!messageId) return;
            const m = await messageModel.findByIdAndUpdate(messageId, {
                status: 'delivered', deliveredAt: new Date()
            }, { new: true });
            if (!m) return;
            const senderSockets = onlineUsers.get(m.sender.toString());
            if (senderSockets) for (const sid of senderSockets) io.to(sid).emit('message:delivered', { messageId });
        } catch (err) {
            console.error(err);
        }
        // optionally: notify specific sockets
    });

    socket.on('message:read', async ({ messageId }) => {
        try {
            if (!messageId) return;
            const m = await messageModel.findByIdAndUpdate(messageId, { status: 'read', readAt: new Date() }, { new: true });
            if (!m) return;
            const senderSockets = onlineUsers.get(m.sender.toString());
            if (senderSockets) for (const sid of senderSockets) io.to(sid).emit('message:read', { messageId });
        } catch (err) {
            console.error(err);
        }
    });

    socket.on('typing:start', ({ conversationId }) => {
        if (conversationId) socket.to(conversationId).emit('typing:start', { conversationId, userId });
    });

    socket.on('typing:stop', ({ conversationId }) => {
        if (conversationId) socket.to(conversationId).emit('typing:stop', { conversationId, userId });
    });

    socket.on('disconnect', () => {
        // remove socket id
        const set = onlineUsers.get(userId);
        if (set) {
            set.delete(socket.id);
            if (set.size === 0) {
                onlineUsers.delete(userId);
                userModel.findByIdAndUpdate(userId, { online: false, lastSeen: new Date() }).exec().catch(console.error);
                io.emit('user:offline', { userId });
            } else {
                onlineUsers.set(userId, set);
            }
        }
    });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log('Server running on', PORT));