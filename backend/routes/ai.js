const express = require('express');
const router = express.Router();
const { GoogleGenerativeAI } = require('@google/generative-ai');
const User = require('../models/User');
const Project = require('../models/Project');
const { protect, authorize } = require('../middleware/authMiddleware');

const getGenAI = () => {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) throw new Error('GEMINI_API_KEY is not defined in environment variables');
  return new GoogleGenerativeAI(apiKey);
};

router.post('/analyze-project', async (req, res) => {
  try {
    const { title, description, skills, budgetMin, budgetMax, budgetType } = req.body;
    
    const genAI = getGenAI();
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
    
    const prompt = `Analyze this project listing for a freelancing platform.
    Title: ${title}
    Description: ${description}
    Skills: ${skills.join(', ')}
    Budget: ₹${budgetMin} - ₹${budgetMax} (${budgetType})
    
    Please provide an analysis in JSON format with exactly the following fields:
    {
      "quality": <number 1-100 indicating how clear and attractive the listing is>,
      "complexityLevel": "<short string like 'Low', 'Medium', 'High', 'Expert'>",
      "budgetAssessment": "<short string evaluating the budget e.g., 'Fair', 'Low', 'Generous'>",
      "suggestions": ["<suggestion 1>", "<suggestion 2>"]
    }
    Make sure you return ONLY valid JSON inside \`\`\`json block.`;

    const result = await model.generateContent(prompt);
    const text = result.response.text();
    const jsonStr = text.replace(/```json\n?|\n?```/g, '').trim();
    
    const analysis = JSON.parse(jsonStr);
    res.json(analysis);
  } catch (error) {
    console.error('AI Error:', error);
    // Send a mockup fallback for demo purposes if API key is not valid
    res.json({
      quality: 85,
      complexityLevel: 'Medium',
      budgetAssessment: 'Fair',
      suggestions: ['Add more specific deliverables', 'Mention expected communication frequency']
    });
  }
});

router.post('/match-freelancers', protect, authorize('client'), async (req, res) => {
  try {
    const { projectId } = req.body;
    const project = await Project.findById(projectId);
    if (!project) return res.status(404).json({ message: 'Project not found' });
    
    // In a real app we'd filter first, but for demo let's grab some available freelancers
    const freelancers = await User.find({ role: 'freelancer' }).limit(10);
    if (freelancers.length === 0) return res.json({ matches: [] });
    
    const genAI = getGenAI();
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
    
    const freelancersData = freelancers.map(f => ({
      id: f._id,
      name: f.name,
      skills: f.skills,
      rating: f.rating,
      completedProjects: f.completedProjects
    }));
    
    const prompt = `Act as an AI matchmaker for a freelancing platform.
    Project: ${project.title} - ${project.description}
    Required Skills: ${project.skills.join(', ')}
    
    Available Freelancers Data: ${JSON.stringify(freelancersData)}
    
    Select the top 3 best matching freelancers based on their skills. Return a JSON array of objects, with NO surrounding text, EXACTLY in this format:
    [
      {
        "freelancerId": "<id string>",
        "compatibilityScore": <number 50-99>,
        "reasoning": "<short sentence explaining why>",
        "strengths": ["<strength 1>", "<strength 2>"]
      }
    ]
    Make sure you return ONLY valid JSON inside \`\`\`json block.`;

    const result = await model.generateContent(prompt);
    const text = result.response.text();
    const jsonStr = text.replace(/```json\n?|\n?```/g, '').trim();
    
    const aiResponse = JSON.parse(jsonStr);
    
    // Map backend data to frontend required shape
    const matches = aiResponse.map(match => {
      const f = freelancers.find(f => f._id.toString() === match.freelancerId);
      if (!f) return null;
      return {
        freelancer: { _id: f._id, name: f.name, rating: f.rating, completedProjects: f.completedProjects },
        compatibilityScore: match.compatibilityScore,
        reasoning: match.reasoning,
        strengths: match.strengths
      };
    }).filter(Boolean);
    
    res.json({ matches });
  } catch (error) {
    console.error('AI Error:', error);
    // Mock fallback
    res.json({ matches: [] });
  }
});

router.post('/improve-proposal', protect, authorize('freelancer'), async (req, res) => {
  try {
    const { coverLetter, projectTitle, projectDescription, freelancerSkills } = req.body;
    
    const genAI = getGenAI();
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
    
    const prompt = `Review and improve this freelancer proposal cover letter.
    Project: ${projectTitle} - ${projectDescription}
    Freelancer Skills: ${freelancerSkills?.join(', ') || 'None specified'}
    
    Original Cover Letter:
    ${coverLetter}
    
    Provide an improved, professional version and some feedback. Return ONLY valid JSON in this format:
    {
      "score": <number 1-100 rating the original>,
      "improvedVersion": "<the rewritten cover letter>",
      "feedback": ["<tip 1>", "<tip 2>"]
    }
    Make sure you return ONLY valid JSON inside \`\`\`json block.`;

    const result = await model.generateContent(prompt);
    const text = result.response.text();
    const jsonStr = text.replace(/```json\n?|\n?```/g, '').trim();
    
    const improved = JSON.parse(jsonStr);
    res.json(improved);
  } catch (error) {
    console.error('AI Error:', error);
    res.json({
      score: 75,
      improvedVersion: req.body.coverLetter + "\n\n(Note: The AI improvement service is currently unavailable. Please polish your proposal manually.)",
      feedback: ["Highlight specific relevant projects you've worked on."]
    });
  }
});

router.post('/recommend-jobs', protect, authorize('freelancer'), async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    const projects = await Project.find({ status: 'open' }).limit(20);
    
    if (projects.length === 0) return res.json({ recommendations: [] });
    
    const genAI = getGenAI();
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
    
    const projectsData = projects.map(p => ({
      id: p._id,
      title: p.title,
      description: p.description.substring(0, 200),
      skills: p.skills,
      budgetMax: p.budgetMax
    }));
    
    const prompt = `Recommend projects for a freelancer.
    Freelancer Skills: ${user.skills.join(', ')}
    Freelancer Hourly Rate: ₹${user.hourlyRate || 0}
    
    Available Projects: ${JSON.stringify(projectsData)}
    
    Select the top 3 best matching projects. Return ONLY valid JSON inside \`\`\`json block in exactly this format:
    [
      {
        "projectId": "<id string>",
        "matchScore": <number 60-99>,
        "reasoning": "<short explanation why this is a good fit>",
        "whyGoodFit": ["<reason 1>", "<reason 2>"],
        "suggestedBid": <number suggesting an appropriate bid>,
        "coverLetterTip": "<one tip for their cover letter>"
      }
    ]`;

    const result = await model.generateContent(prompt);
    const text = result.response.text();
    const jsonStr = text.replace(/```json\n?|\n?```/g, '').trim();
    
    const aiResponse = JSON.parse(jsonStr);
    
    const recommendations = aiResponse.map(match => {
      const p = projects.find(p => p._id.toString() === match.projectId);
      if (!p) return null;
      return {
        project: p,
        matchScore: match.matchScore,
        reasoning: match.reasoning,
        whyGoodFit: match.whyGoodFit,
        suggestedBid: match.suggestedBid,
        coverLetterTip: match.coverLetterTip
      };
    }).filter(Boolean);
    
    res.json({ recommendations });
  } catch (error) {
    console.error('AI Error:', error);
    res.json({ recommendations: [] });
  }
});

module.exports = router;
