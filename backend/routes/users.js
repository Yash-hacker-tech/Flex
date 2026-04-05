const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Project = require('../models/Project');
const Proposal = require('../models/Proposal');
const { protect } = require('../middleware/authMiddleware');

router.get('/freelancers', async (req, res) => {
  try {
    const { search, skill } = req.query;
    let query = { role: 'freelancer' };
    
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { title: { $regex: search, $options: 'i' } }
      ];
    }
    
    if (skill) {
      query.skills = { $regex: skill, $options: 'i' };
    }
    
    const freelancers = await User.find(query)
      .select('-password -email -phone')
      .sort('-rating')
      .limit(20);
      
    res.json({ freelancers });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.get('/:id/profile', async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password');
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json({ user });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.put('/portfolio/add', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    user.portfolio.push(req.body);
    await user.save();
    res.json({ portfolio: user.portfolio });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.delete('/portfolio/:itemId', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    user.portfolio = user.portfolio.filter(item => item._id.toString() !== req.params.itemId);
    await user.save();
    res.json({ portfolio: user.portfolio });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.get('/dashboard/stats', protect, async (req, res) => {
  try {
    const userId = req.user._id;
    let stats = {};
    
    if (req.user.role === 'client') {
      stats.totalProjects = await Project.countDocuments({ client: userId });
      stats.activeProjects = await Project.countDocuments({ client: userId, status: 'active' });
      stats.completedProjects = await Project.countDocuments({ client: userId, status: 'completed' });
      const user = await User.findById(userId);
      stats.totalSpent = user.totalSpent || 0;
    } else {
      stats.totalProposals = await Proposal.countDocuments({ freelancer: userId });
      stats.activeProjects = await Proposal.countDocuments({ freelancer: userId, status: 'accepted' });
      const user = await User.findById(userId);
      stats.completedProjects = user.completedProjects || 0;
      stats.totalEarnings = user.totalEarnings || 0;
    }
    
    res.json({ stats });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
