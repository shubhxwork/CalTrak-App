const mongoose = require('mongoose');

// User Inputs Schema
const userInputsSchema = new mongoose.Schema({
  name: { type: String, required: true, index: true },
  age: { type: Number, min: 10, max: 120 },
  gender: { type: String, required: true, enum: ['male', 'female'], index: true },
  weight: { type: Number, required: true, min: 20, max: 500 },
  height: { type: Number, min: 100, max: 250 },
  bodyFat: { type: Number, required: true, min: 3, max: 50 },
  unitSystem: { type: String, required: true, enum: ['metric', 'imperial'], index: true },
  activityLevel: { 
    type: String, 
    required: true, 
    enum: ['sedentary', 'light', 'moderate', 'heavy', 'extra_active'],
    index: true 
  },
  goal: { 
    type: String, 
    required: true, 
    enum: ['cut', 'recomp', 'bulk'], 
    index: true 
  },
  targetWeight: { type: Number, min: 20, max: 500 },
  weeklyRate: { type: Number, min: 0, max: 2, default: 0 }
}, { _id: false });

// Calculation Results Schema
const calculationResultsSchema = new mongoose.Schema({
  calories: { type: Number, required: true, min: 800, max: 8000 },
  proteinG: { type: Number, required: true, min: 20, max: 500 },
  proteinPct: { type: Number, required: true, min: 10, max: 70 },
  carbsG: { type: Number, required: true, min: 0, max: 1000 },
  carbsPct: { type: Number, required: true, min: 0, max: 80 },
  fatG: { type: Number, required: true, min: 10, max: 300 },
  fatPct: { type: Number, required: true, min: 10, max: 70 },
  fiberG: { type: Number, required: true, min: 10, max: 100 },
  waterLiters: { type: Number, required: true, min: 1, max: 10 },
  lbm: { type: Number, required: true, min: 20, max: 200 },
  bmr: { type: Number, required: true, min: 800, max: 4000 },
  tdee: { type: Number, required: true, min: 1000, max: 6000 },
  formulaUsed: { 
    type: String, 
    required: true, 
    enum: ['Katch-McArdle', 'Mifflin-St Jeor'],
    index: true 
  },
  expectedWeightChange: { type: String, required: true },
  safetyLevel: { 
    type: String, 
    required: true, 
    enum: ['OPTIMAL', 'CAUTION', 'CRITICAL'],
    index: true 
  },
  monthsToTarget: { type: String },
  milestones: [{
    label: String,
    weeks: Number,
    description: String,
    icon: String
  }]
}, { _id: false });

// Metadata Schema
const metadataSchema = new mongoose.Schema({
  ip: { type: String, required: true, index: true },
  userAgent: { type: String, required: true },
  referrer: { type: String, default: 'Direct' },
  country: { type: String, default: 'Unknown', index: true },
  city: { type: String, default: 'Unknown' },
  device: { type: String, default: 'Unknown' },
  browser: { type: String, default: 'Unknown' }
}, { _id: false });

// Main Session Schema
const sessionSchema = new mongoose.Schema({
  sessionId: { 
    type: String, 
    required: true, 
    unique: true, 
    index: true 
  },
  inputs: { 
    type: userInputsSchema, 
    required: true 
  },
  results: { 
    type: calculationResultsSchema, 
    required: true 
  },
  metadata: { 
    type: metadataSchema, 
    required: true 
  },
  createdAt: { 
    type: Date, 
    default: Date.now, 
    index: true 
  },
  updatedAt: { 
    type: Date, 
    default: Date.now 
  }
}, {
  timestamps: true,
  collection: 'sessions'
});

// Indexes for better query performance
sessionSchema.index({ 'inputs.name': 1, createdAt: -1 });
sessionSchema.index({ 'inputs.goal': 1, createdAt: -1 });
sessionSchema.index({ 'metadata.country': 1, createdAt: -1 });
sessionSchema.index({ 'results.safetyLevel': 1, createdAt: -1 });
sessionSchema.index({ createdAt: -1 }); // For recent sessions

// Virtual for session age
sessionSchema.virtual('ageInDays').get(function() {
  return Math.floor((Date.now() - this.createdAt) / (1000 * 60 * 60 * 24));
});

// Static methods for analytics
sessionSchema.statics.getAnalytics = async function() {
  const now = new Date();
  const last24h = new Date(now - 24 * 60 * 60 * 1000);
  const last7days = new Date(now - 7 * 24 * 60 * 60 * 1000);
  const last30days = new Date(now - 30 * 24 * 60 * 60 * 1000);

  const [
    totalSessions,
    uniqueUsers,
    sessionsLast24h,
    sessionsLast7days,
    sessionsLast30days,
    goalDistribution,
    countryDistribution,
    genderDistribution,
    safetyDistribution,
    averageStats,
    firstSession,
    lastSession
  ] = await Promise.all([
    this.countDocuments(),
    this.distinct('inputs.name').then(names => names.length),
    this.countDocuments({ createdAt: { $gte: last24h } }),
    this.countDocuments({ createdAt: { $gte: last7days } }),
    this.countDocuments({ createdAt: { $gte: last30days } }),
    this.aggregate([
      { $group: { _id: '$inputs.goal', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]),
    this.aggregate([
      { $group: { _id: '$metadata.country', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 10 }
    ]),
    this.aggregate([
      { $group: { _id: '$inputs.gender', count: { $sum: 1 } } }
    ]),
    this.aggregate([
      { $group: { _id: '$results.safetyLevel', count: { $sum: 1 } } }
    ]),
    this.aggregate([
      {
        $group: {
          _id: null,
          avgWeight: { $avg: '$inputs.weight' },
          avgBodyFat: { $avg: '$inputs.bodyFat' },
          avgCalories: { $avg: '$results.calories' },
          avgAge: { $avg: '$inputs.age' }
        }
      }
    ]),
    this.findOne().sort({ createdAt: 1 }).select('createdAt'),
    this.findOne().sort({ createdAt: -1 }).select('createdAt')
  ]);

  return {
    totalSessions,
    uniqueUsers,
    sessionsLast24h,
    sessionsLast7days,
    sessionsLast30days,
    goalDistribution: goalDistribution.reduce((acc, item) => {
      acc[item._id] = item.count;
      return acc;
    }, {}),
    countryDistribution: countryDistribution.reduce((acc, item) => {
      acc[item._id] = item.count;
      return acc;
    }, {}),
    genderDistribution: genderDistribution.reduce((acc, item) => {
      acc[item._id] = item.count;
      return acc;
    }, {}),
    safetyDistribution: safetyDistribution.reduce((acc, item) => {
      acc[item._id] = item.count;
      return acc;
    }, {}),
    averageWeight: averageStats[0]?.avgWeight || 0,
    averageBodyFat: averageStats[0]?.avgBodyFat || 0,
    averageCalories: averageStats[0]?.avgCalories || 0,
    averageAge: averageStats[0]?.avgAge || 0,
    mostCommonGoal: goalDistribution[0]?._id || 'Unknown',
    mostCommonCountry: countryDistribution[0]?._id || 'Unknown',
    firstSession: firstSession?.createdAt,
    lastSession: lastSession?.createdAt
  };
};

// Static method for recent sessions
sessionSchema.statics.getRecentSessions = function(limit = 50) {
  return this.find()
    .sort({ createdAt: -1 })
    .limit(limit)
    .select('-__v');
};

// Static method for user sessions
sessionSchema.statics.getUserSessions = function(userName, limit = 10) {
  return this.find({ 'inputs.name': userName })
    .sort({ createdAt: -1 })
    .limit(limit)
    .select('-__v');
};

module.exports = mongoose.model('Session', sessionSchema);