const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['client', 'freelancer'], required: true },
  avatar: { type: String },
  
  // Profile
  bio: { type: String },
  location: { type: String },
  phone: { type: String },
  
  // Freelancer specific
  title: { type: String },
  skills: [{ type: String }],
  hourlyRate: { type: Number },
  availability: { type: String, enum: ['available', 'busy', 'unavailable'], default: 'available' },
  portfolio: [{
    title: String,
    description: String,
    url: String
  }],
  
  // Client specific
  company: { type: String },
  industry: { type: String },
  
  // Stats
  rating: { type: Number, default: 0 },
  reviewCount: { type: Number, default: 0 },
  completedProjects: { type: Number, default: 0 },
  totalEarnings: { type: Number, default: 0 },
  totalSpent: { type: Number, default: 0 },
  
  // App related
  profileCompletion: { type: Number, default: 20 },
  createdAt: { type: Date, default: Date.now }
});

// Password hashing middleware
userSchema.pre('save', async function(next) {
  this.updateProfileCompletion();
  
  if (!this.isModified('password')) return next();
  
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Match password
userSchema.methods.matchPassword = async function(enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

// Calculate profile completion
userSchema.methods.updateProfileCompletion = function() {
  let score = 20; // Base score for creating account
  
  if (this.bio) score += 15;
  if (this.location) score += 10;
  if (this.phone) score += 10;
  if (this.avatar) score += 10;
  
  if (this.role === 'freelancer') {
    if (this.skills && this.skills.length > 0) score += 15;
    if (this.title) score += 10;
    if (this.hourlyRate) score += 10;
  } else if (this.role === 'client') {
    if (this.company) score += 15;
    if (this.industry) score += 20;
  }
  
  this.profileCompletion = Math.min(100, score);
};

module.exports = mongoose.model('User', userSchema);
