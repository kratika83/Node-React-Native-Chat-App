import conversationModel from '../models/conversationModel.js';
import messageModel from '../models/messageModel.js';

// list conversations for current user (with lastMessage)
const conversations = async (req, res) => {
    const me = req.user.id;
    const convs = await conversationModel.find({ participants: me })
        .populate('participants', 'name email')
        .sort({ updatedAt: -1 });
    res.json(convs);
};

// create or get 1:1 conversation
const oneToOneConversation = async (req, res) => {
    const { withUserId } = req.body;
    const me = req.user.id;
    let conv = await conversationModel.findOne({ participants: { $all: [me, withUserId], $size: 2 } });
    if (!conv) {
        conv = await conversationModel.create({ participants: [me, withUserId] });
    }
    res.json(conv);
};

// get messages for conversation
const messagesForConversation = async (req, res) => {
    const messages = await messageModel.find({ conversation: req.params.id }).sort({ createdAt: 1 });
    res.json(messages);
};

let conversationController = {
    conversations: conversations,
    oneToOneConversation: oneToOneConversation,
    messagesForConversation: messagesForConversation
}

export default conversationController;