const express = require('express');
const router = express.Router();
const Review = require('../models/Review');
const Project = require('../models/Project');
const User = require('../models/User');
const { protect } = require('../middleware/authMiddleware');

router.get('/project/:projectId', async (req, res) => {
  try {
    const reviews = await Review.find({ project: req.params.projectId })
      .populate('reviewer', 'name avatar')
      .sort('-createdAt');
    res.json({ reviews });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.post('/', protect, async (req, res) => {
  try {
    const { projectId, rating, comment } = req.body;
    
    const project = await Project.findById(projectId);
    if (!project) return res.status(404).json({ message: 'Project not found' });
    
    const isClient = project.client.toString() === req.user._id.toString();
    // Assuming there is a field for assigned freelancer in a real app, let's just make it possible for demo
    
    let revieweeId = isClient ? null : project.client; // Simplified for demo
    
    // Cannot review twice
    const existing = await Review.findOne({ project: projectId, reviewer: req.user._id });
    if (existing) return res.status(400).json({ message: 'You have already reviewed this project' });
    
    const review = await Review.create({
      project: projectId,
      reviewer: req.user._id,
      reviewee: revieweeId || project.client, // fallback
      rating,
      comment
    });
    
    // Update reviewee stats (mocking the update)
    if (revieweeId) {
      const user = await User.findById(revieweeId);
      if (user) {
        user.reviewCount += 1;
        user.rating = ((user.rating * (user.reviewCount - 1)) + rating) / user.reviewCount;
        await user.save();
      }
    }
    
    res.status(201).json({ review });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
