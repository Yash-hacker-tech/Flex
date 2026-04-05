const express = require('express');
const router = express.Router();
const Project = require('../models/Project');
const { protect, authorize } = require('../middleware/authMiddleware');

router.get('/', async (req, res) => {
  try {
    const { page = 1, limit = 10, search, category, budgetType, minBudget, maxBudget, experienceLevel, sort } = req.query;
    
    let query = { visibility: 'public', status: 'open' };
    
    if (search) query.title = { $regex: search, $options: 'i' };
    if (category) query.category = category;
    if (budgetType) query.budgetType = budgetType;
    if (minBudget) query.budgetMin = { $gte: Number(minBudget) };
    if (maxBudget) query.budgetMax = { $lte: Number(maxBudget) };
    if (experienceLevel) query.experienceLevel = experienceLevel;
    
    let sortObj = { createdAt: -1 };
    if (sort === 'budget_high') sortObj = { budgetMax: -1 };
    if (sort === 'budget_low') sortObj = { budgetMin: 1 };
    if (sort === 'most_proposals') sortObj = { proposalCount: -1 };
    
    const projects = await Project.find(query)
      .populate('client', 'name avatar rating')
      .sort(sortObj)
      .skip((page - 1) * limit)
      .limit(Number(limit));
      
    const total = await Project.countDocuments(query);
    
    res.json({
      projects,
      total,
      page: Number(page),
      pages: Math.ceil(total / limit)
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.get('/my', protect, async (req, res) => {
  try {
    const { limit, status } = req.query;
    let query = { client: req.user._id };
    if (status) query.status = status;
    
    let q = Project.find(query).sort('-createdAt');
    if (limit) q = q.limit(Number(limit));
    
    const projects = await q;
    res.json({ projects });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const project = await Project.findById(req.params.id).populate('client', 'name company rating reviewCount avatar createdAt');
    if (!project) return res.status(404).json({ message: 'Project not found' });
    
    project.views += 1;
    await project.save();
    
    res.json({ project });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.post('/', protect, authorize('client'), async (req, res) => {
  try {
    const project = await Project.create({
      ...req.body,
      client: req.user._id,
      status: req.body.saveAsDraft ? 'draft' : 'open'
    });
    res.status(201).json({ project });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

module.exports = router;
