const mongoose = require('mongoose');

const proposalSchema = new mongoose.Schema({
  project: { type: mongoose.Schema.Types.ObjectId, ref: 'Project', required: true },
  freelancer: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  
  coverLetter: { type: String, required: true },
  bidAmount: { type: Number, required: true },
  deliveryTime: { type: Number, required: true }, // in days
  
  status: { type: String, enum: ['pending', 'shortlisted', 'accepted', 'rejected', 'withdrawn'], default: 'pending' },
  
  createdAt: { type: Date, default: Date.now }
});

// A freelancer can only submit one proposal per project
proposalSchema.index({ project: 1, freelancer: 1 }, { unique: true });

module.exports = mongoose.model('Proposal', proposalSchema);
