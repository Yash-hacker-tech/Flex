const express = require('express');
const router = express.Router();
const Conversation = require('../models/Conversation');
const Message = require('../models/Message');
const { protect } = require('../middleware/authMiddleware');

router.post('/conversations', protect, async (req, res) => {
  try {
    const { recipientId, projectId } = req.body;
    
    if (recipientId === req.user._id.toString()) {
      return res.status(400).json({ message: 'Cannot message yourself' });
    }
    
    let query = { participants: { $all: [req.user._id, recipientId] } };
    if (projectId) query.project = projectId;
    
    let conversation = await Conversation.findOne(query);
    
    if (!conversation) {
      conversation = await Conversation.create({
        participants: [req.user._id, recipientId],
        project: projectId || undefined
      });
    }
    
    res.json({ conversation });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.get('/conversations', protect, async (req, res) => {
  try {
    const conversations = await Conversation.find({ participants: req.user._id })
      .populate('participants', 'name avatar')
      .populate('project', 'title')
      .sort('-lastMessageAt');
      
    res.json({ conversations });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.get('/:conversationId', protect, async (req, res) => {
  try {
    const conversation = await Conversation.findById(req.params.conversationId);
    if (!conversation || !conversation.participants.includes(req.user._id)) {
      return res.status(404).json({ message: 'Conversation not found' });
    }
    
    const messages = await Message.find({ conversation: req.params.conversationId })
      .populate('sender', 'name avatar')
      .sort('createdAt');
      
    res.json({ messages });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.post('/:conversationId', protect, async (req, res) => {
  try {
    const { content } = req.body;
    const conversation = await Conversation.findById(req.params.conversationId);
    
    if (!conversation || !conversation.participants.includes(req.user._id)) {
      return res.status(404).json({ message: 'Conversation not found' });
    }
    
    const message = await Message.create({
      conversation: req.params.conversationId,
      sender: req.user._id,
      content,
      readBy: [req.user._id]
    });
    
    conversation.lastMessageAt = Date.now();
    await conversation.save();
    
    await message.populate('sender', 'name avatar');
    
    // Emit via socket
    if (global.io) {
      global.io.to(req.params.conversationId).emit('receive_message', message);
    }
    
    res.status(201).json({ message });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
