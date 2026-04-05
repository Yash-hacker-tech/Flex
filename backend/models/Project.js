const mongoose = require('mongoose');

const projectSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  category: { type: String, required: true },
  client: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  
  skills: [{ type: String }],
  tags: [{ type: String }],
  
  budgetType: { type: String, enum: ['fixed', 'hourly'], default: 'fixed' },
  budgetMin: { type: Number, required: true },
  budgetMax: { type: Number, required: true },
  
  experienceLevel: { type: String, enum: ['entry', 'intermediate', 'expert'], default: 'intermediate' },
  projectLength: { type: String, enum: ['short', 'medium', 'long'], default: 'medium' },
  deadline: { type: Date },
  
  visibility: { type: String, enum: ['public', 'invite_only'], default: 'public' },
  status: { type: String, enum: ['draft', 'open', 'active', 'completed', 'cancelled'], default: 'open' },
  
  milestones: [{
    title: { type: String, required: true },
    description: String,
    amount: { type: Number, required: true },
    status: { type: String, enum: ['pending', 'submitted', 'approved', 'paid'], default: 'pending' }
  }],
  
  proposalCount: { type: Number, default: 0 },
  views: { type: Number, default: 0 },
  
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

projectSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model('Project', projectSchema);
