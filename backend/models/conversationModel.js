import mongoose from "mongoose";

const conversationSchema = new mongoose.Schema({
    participants: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Users'
    }],
    lastMessage: {
        text: String,
        sender: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Users'
        },
        createdAt: Date
    }
},
    {
        timestamps: true,
        collection: 'Conversations'
    }
);

const conversationModel = mongoose.model('Conversations', conversationSchema);
export default conversationModel;