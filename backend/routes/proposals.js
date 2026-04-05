const express = require('express');
const router = express.Router();
const Proposal = require('../models/Proposal');
const Project = require('../models/Project');
const { protect, authorize } = require('../middleware/authMiddleware');

router.post('/', protect, authorize('freelancer'), async (req, res) => {
  try {
    const { projectId, coverLetter, bidAmount, deliveryTime } = req.body;
    
    const project = await Project.findById(projectId);
    if (!project) return res.status(404).json({ message: 'Project not found' });
    if (project.status !== 'open') return res.status(400).json({ message: 'Project is not open for proposals' });
    
    const existingP = await Proposal.findOne({ project: projectId, freelancer: req.user._id });
    if (existingP) return res.status(400).json({ message: 'You have already submitted a proposal for this project' });
    
    const proposal = await Proposal.create({
      project: projectId,
      freelancer: req.user._id,
      coverLetter,
      bidAmount,
      deliveryTime
    });
    
    project.proposalCount += 1;
    await project.save();
    
    res.status(201).json({ proposal });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

router.get('/my', protect, authorize('freelancer'), async (req, res) => {
  try {
    const proposals = await Proposal.find({ freelancer: req.user._id })
      .populate('project', 'title budgetType budgetMin budgetMax')
      .sort('-createdAt');
    res.json({ proposals });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.get('/project/:projectId', protect, authorize('client'), async (req, res) => {
  try {
    const project = await Project.findById(req.params.projectId);
    if (project.client.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized' });
    }
    
    const proposals = await Proposal.find({ project: req.params.projectId })
      .populate('freelancer', 'name title avatar skills rating reviewCount completedProjects')
      .sort('-createdAt');
      
    res.json({ proposals });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.put('/:id/accept', protect, authorize('client'), async (req, res) => {
  try {
    const proposal = await Proposal.findById(req.params.id);
    if (!proposal) return res.status(404).json({ message: 'Proposal not found' });
    
    const project = await Project.findById(proposal.project);
    if (project.client.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized' });
    }
    
    // Accept this proposal, reject others
    proposal.status = 'accepted';
    await proposal.save();
    
    await Proposal.updateMany(
      { project: project._id, _id: { $ne: proposal._id }, status: 'pending' },
      { $set: { status: 'rejected' } }
    );
    
    project.status = 'active';
    await project.save();
    
    res.json({ message: 'Proposal accepted', proposal });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.put('/:id/reject', protect, authorize('client'), async (req, res) => {
  try {
    const proposal = await Proposal.findById(req.params.id);
    if (!proposal) return res.status(404).json({ message: 'Proposal not found' });
    
    const project = await Project.findById(proposal.project);
    if (project.client.toString() !== req.user._id.toString()) return res.status(403).json({ message: 'Not authorized' });
    
    proposal.status = 'rejected';
    await proposal.save();
    res.json({ message: 'Proposal rejected' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.put('/:id/withdraw', protect, authorize('freelancer'), async (req, res) => {
  try {
    const proposal = await Proposal.findById(req.params.id);
    if (proposal.freelancer.toString() !== req.user._id.toString()) return res.status(403).json({ message: 'Not authorized' });
    
    proposal.status = 'withdrawn';
    await proposal.save();
    res.json({ message: 'Proposal withdrawn' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
