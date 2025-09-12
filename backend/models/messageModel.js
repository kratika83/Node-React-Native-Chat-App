import mongoose from "mongoose";

const messageSchema = new mongoose.Schema({
    conversation: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Conversations'
    },
    sender: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Users'
    },
    recipient: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Users'
    },
    text: String,
    status: {
        type: String,
        enum: ['sent', 'delivered', 'read'],
        default: 'sent'
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    deliveredAt: Date,
    readAt: Date
},
    {
        timestamps: true,
        collection: 'Messages'
    }
);

const messageModel = mongoose.model('Messages', messageSchema);
export default messageModel;