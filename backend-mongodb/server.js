require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const Session = require('./models/Session');

const app = express();
const PORT = process.env.PORT || 3001;
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/caltrak';
const ADMIN_KEY = process.env.ADMIN_KEY || 'shubh2910-admin-key';

// Security middleware
app.use(helmet());
app.use(cors({
  origin: process.env.CORS_ORIGIN || '*',
  credentials: true
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: { error: 'Too many requests, please try again later.' }
});
app.use(limiter);

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Request logging middleware
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path} - ${req.ip}`);
  next();
});

// MongoDB connection
mongoose.connect(MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => {
  console.log('✅ Connected to MongoDB');
  console.log(`📊 Database: ${mongoose.connection.name}`);
})
.catch((error) => {
  console.error('❌ MongoDB connection error:', error);
  process.exit(1);
});

// Helper function to extract device info
function extractDeviceInfo(userAgent) {
  const ua = userAgent.toLowerCase();
  let device = 'Desktop';
  let browser = 'Unknown';

  // Device detection
  if (ua.includes('mobile') || ua.includes('android') || ua.includes('iphone')) {
    device = 'Mobile';
  } else if (ua.includes('tablet') || ua.includes('ipad')) {
    device = 'Tablet';
  }

  // Browser detection
  if (ua.includes('chrome')) browser = 'Chrome';
  else if (ua.includes('firefox')) browser = 'Firefox';
  else if (ua.includes('safari')) browser = 'Safari';
  else if (ua.includes('edge')) browser = 'Edge';
  else if (ua.includes('opera')) browser = 'Opera';

  return { device, browser };
}

// Helper function to generate session ID
function generateSessionId() {
  return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

// Routes

// Health check
app.get('/health', async (req, res) => {
  try {
    // Check MongoDB connection
    const dbStatus = mongoose.connection.readyState === 1 ? 'Connected' : 'Disconnected';
    const sessionCount = await Session.countDocuments();
    
    res.json({ 
      status: 'OK', 
      timestamp: new Date().toISOString(),
      message: 'CalTrak MongoDB Backend is running!',
      database: {
        status: dbStatus,
        totalSessions: sessionCount
      },
      version: '2.0.0'
    });
  } catch (error) {
    res.status(500).json({
      status: 'ERROR',
      message: error.message
    });
  }
});

// Save user session data
app.post('/api/sessions', async (req, res) => {
  try {
    const { inputs, results } = req.body;

    // Validate required fields
    if (!inputs || !results) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields: inputs and results'
      });
    }

    if (!inputs.name || !inputs.gender || !inputs.weight || !inputs.bodyFat) {
      return res.status(400).json({
        success: false,
        error: 'Missing required input fields: name, gender, weight, bodyFat'
      });
    }

    if (!results.calories || !results.bmr || !results.tdee) {
      return res.status(400).json({
        success: false,
        error: 'Missing required result fields: calories, bmr, tdee'
      });
    }

    console.log('📊 New session data received:', {
      user: inputs.name,
      goal: inputs.goal,
      calories: results.calories,
      timestamp: new Date().toISOString(),
      ip: req.ip,
      userAgent: req.get('User-Agent')?.substring(0, 100)
    });

    // Extract device and browser info
    const { device, browser } = extractDeviceInfo(req.get('User-Agent') || '');

    // Create session document
    const sessionData = new Session({
      sessionId: generateSessionId(),
      inputs: {
        name: inputs.name,
        age: inputs.age,
        gender: inputs.gender,
        weight: inputs.weight,
        height: inputs.height,
        bodyFat: inputs.bodyFat,
        unitSystem: inputs.unitSystem,
        activityLevel: inputs.activityLevel,
        goal: inputs.goal,
        targetWeight: inputs.targetWeight,
        weeklyRate: inputs.weeklyRate
      },
      results: {
        calories: results.calories,
        proteinG: results.proteinG,
        proteinPct: results.proteinPct,
        carbsG: results.carbsG,
        carbsPct: results.carbsPct,
        fatG: results.fatG,
        fatPct: results.fatPct,
        fiberG: results.fiberG,
        waterLiters: results.waterLiters,
        lbm: results.lbm,
        bmr: results.bmr,
        tdee: results.tdee,
        formulaUsed: results.formulaUsed,
        expectedWeightChange: results.expectedWeightChange,
        safetyLevel: results.safetyLevel,
        monthsToTarget: results.monthsToTarget,
        milestones: results.milestones || []
      },
      metadata: {
        ip: req.ip,
        userAgent: req.get('User-Agent') || 'Unknown',
        referrer: req.get('Referer') || 'Direct',
        country: req.get('CF-IPCountry') || req.get('X-Country') || 'Unknown',
        city: req.get('CF-IPCity') || req.get('X-City') || 'Unknown',
        device,
        browser
      }
    });

    // Save to MongoDB
    const savedSession = await sessionData.save();

    console.log('✅ Session saved to MongoDB:', savedSession.sessionId);

    // Get total session count
    const totalSessions = await Session.countDocuments();

    res.json({ 
      success: true, 
      sessionId: savedSession.sessionId,
      totalSessions,
      message: 'Session saved successfully'
    });

  } catch (error) {
    console.error('❌ Error saving session:', error);
    
    if (error.name === 'ValidationError') {
      return res.status(400).json({ 
        success: false, 
        error: 'Validation error: ' + error.message 
      });
    }

    res.status(500).json({ 
      success: false, 
      error: 'Internal server error: ' + error.message 
    });
  }
});

// Get all sessions (admin only)
app.get('/api/sessions', async (req, res) => {
  try {
    // Admin authentication
    const adminKey = req.get('X-Admin-Key');
    if (adminKey !== ADMIN_KEY) {
      return res.status(401).json({ error: 'Unauthorized: Invalid admin key' });
    }

    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 50;
    const skip = (page - 1) * limit;

    // Get sessions with pagination
    const sessions = await Session.find()
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .select('-__v');

    const totalSessions = await Session.countDocuments();
    const totalPages = Math.ceil(totalSessions / limit);

    res.json({
      sessions,
      pagination: {
        currentPage: page,
        totalPages,
        totalSessions,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1
      }
    });

  } catch (error) {
    console.error('❌ Error fetching sessions:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get analytics (admin only)
app.get('/api/analytics', async (req, res) => {
  try {
    // Admin authentication
    const adminKey = req.get('X-Admin-Key');
    if (adminKey !== ADMIN_KEY) {
      return res.status(401).json({ error: 'Unauthorized: Invalid admin key' });
    }

    console.log('📈 Generating analytics...');
    const analytics = await Session.getAnalytics();

    res.json(analytics);

  } catch (error) {
    console.error('❌ Error calculating analytics:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get user-specific sessions (admin only)
app.get('/api/users/:userName/sessions', async (req, res) => {
  try {
    // Admin authentication
    const adminKey = req.get('X-Admin-Key');
    if (adminKey !== ADMIN_KEY) {
      return res.status(401).json({ error: 'Unauthorized: Invalid admin key' });
    }

    const { userName } = req.params;
    const limit = parseInt(req.query.limit) || 10;

    const sessions = await Session.getUserSessions(userName, limit);

    res.json({
      userName,
      sessions,
      count: sessions.length
    });

  } catch (error) {
    console.error('❌ Error fetching user sessions:', error);
    res.status(500).json({ error: error.message });
  }
});

// Export all data as CSV (admin only)
app.get('/api/export/csv', async (req, res) => {
  try {
    // Admin authentication
    const adminKey = req.get('X-Admin-Key');
    if (adminKey !== ADMIN_KEY) {
      return res.status(401).json({ error: 'Unauthorized: Invalid admin key' });
    }

    console.log('📥 Exporting all data as CSV...');

    // Get all sessions
    const sessions = await Session.find()
      .sort({ createdAt: -1 })
      .select('-__v');

    // Create CSV headers
    const headers = [
      'Timestamp', 'Session ID', 'Name', 'Age', 'Gender', 'Weight', 'Height',
      'Body Fat %', 'Unit System', 'Activity Level', 'Goal', 'Target Weight',
      'Weekly Rate', 'Calories', 'Protein (g)', 'Protein %', 'Carbs (g)',
      'Carbs %', 'Fat (g)', 'Fat %', 'Fiber (g)', 'Water (L)', 'LBM',
      'BMR', 'TDEE', 'Formula Used', 'Expected Change', 'Safety Level',
      'Months to Target', 'Milestone Count', 'IP Address', 'Country', 'City',
      'Device', 'Browser', 'User Agent'
    ];

    // Create CSV rows
    const rows = sessions.map(session => [
      session.createdAt.toISOString(),
      session.sessionId,
      session.inputs.name,
      session.inputs.age || '',
      session.inputs.gender,
      session.inputs.weight,
      session.inputs.height || '',
      session.inputs.bodyFat,
      session.inputs.unitSystem,
      session.inputs.activityLevel,
      session.inputs.goal,
      session.inputs.targetWeight || '',
      session.inputs.weeklyRate || '',
      session.results.calories,
      session.results.proteinG,
      session.results.proteinPct,
      session.results.carbsG,
      session.results.carbsPct,
      session.results.fatG,
      session.results.fatPct,
      session.results.fiberG,
      session.results.waterLiters,
      session.results.lbm,
      session.results.bmr,
      session.results.tdee,
      session.results.formulaUsed,
      session.results.expectedWeightChange,
      session.results.safetyLevel,
      session.results.monthsToTarget || '',
      session.results.milestones.length,
      session.metadata.ip,
      session.metadata.country,
      session.metadata.city,
      session.metadata.device,
      session.metadata.browser,
      session.metadata.userAgent
    ]);

    // Convert to CSV
    const csv = [headers, ...rows]
      .map(row => row.map(field => `"${field}"`).join(','))
      .join('\n');

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename="caltrak-mongodb-data-${new Date().toISOString().split('T')[0]}.csv"`);
    res.send(csv);

    console.log('✅ CSV export completed:', sessions.length, 'sessions');

  } catch (error) {
    console.error('❌ Error exporting CSV:', error);
    res.status(500).json({ error: error.message });
  }
});

// Search sessions (admin only)
app.get('/api/search', async (req, res) => {
  try {
    // Admin authentication
    const adminKey = req.get('X-Admin-Key');
    if (adminKey !== ADMIN_KEY) {
      return res.status(401).json({ error: 'Unauthorized: Invalid admin key' });
    }

    const { q, goal, country, safetyLevel, limit = 20 } = req.query;
    
    let query = {};
    
    // Build search query
    if (q) {
      query['inputs.name'] = { $regex: q, $options: 'i' };
    }
    if (goal) {
      query['inputs.goal'] = goal;
    }
    if (country) {
      query['metadata.country'] = country;
    }
    if (safetyLevel) {
      query['results.safetyLevel'] = safetyLevel;
    }

    const sessions = await Session.find(query)
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .select('-__v');

    res.json({
      query: req.query,
      results: sessions,
      count: sessions.length
    });

  } catch (error) {
    console.error('❌ Error searching sessions:', error);
    res.status(500).json({ error: error.message });
  }
});

// Delete specific sessions (admin only)
app.delete('/api/sessions/delete', async (req, res) => {
  try {
    // Admin authentication
    const adminKey = req.get('X-Admin-Key');
    if (adminKey !== ADMIN_KEY) {
      return res.status(401).json({ error: 'Unauthorized: Invalid admin key' });
    }

    const { sessionIds } = req.body;
    
    if (!sessionIds || !Array.isArray(sessionIds) || sessionIds.length === 0) {
      return res.status(400).json({ error: 'sessionIds array is required' });
    }

    console.log(`🗑️ Deleting ${sessionIds.length} sessions...`);

    const result = await Session.deleteMany({ sessionId: { $in: sessionIds } });

    console.log(`✅ Deleted ${result.deletedCount} sessions`);

    res.json({
      success: true,
      deletedCount: result.deletedCount,
      message: `Successfully deleted ${result.deletedCount} sessions`
    });

  } catch (error) {
    console.error('❌ Error deleting sessions:', error);
    res.status(500).json({ error: error.message });
  }
});

// Delete all sessions (admin only)
app.delete('/api/sessions/delete-all', async (req, res) => {
  try {
    // Admin authentication
    const adminKey = req.get('X-Admin-Key');
    if (adminKey !== ADMIN_KEY) {
      return res.status(401).json({ error: 'Unauthorized: Invalid admin key' });
    }

    console.log('🗑️ Deleting ALL sessions...');

    const result = await Session.deleteMany({});

    console.log(`✅ Deleted all sessions: ${result.deletedCount} total`);

    res.json({
      success: true,
      deletedCount: result.deletedCount,
      message: `Successfully deleted all ${result.deletedCount} sessions`
    });

  } catch (error) {
    console.error('❌ Error deleting all sessions:', error);
    res.status(500).json({ error: error.message });
  }
});

// Error handling middleware
app.use((error, req, res, next) => {
  console.error('❌ Unhandled error:', error);
  res.status(500).json({
    error: 'Internal server error',
    message: process.env.NODE_ENV === 'development' ? error.message : 'Something went wrong'
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    error: 'Not found',
    message: `Route ${req.method} ${req.path} not found`
  });
});

// Graceful shutdown
process.on('SIGTERM', async () => {
  console.log('🔄 SIGTERM received, shutting down gracefully...');
  await mongoose.connection.close();
  process.exit(0);
});

process.on('SIGINT', async () => {
  console.log('🔄 SIGINT received, shutting down gracefully...');
  await mongoose.connection.close();
  process.exit(0);
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 CalTrak MongoDB Backend running on port ${PORT}`);
  console.log(`📊 Health check: http://localhost:${PORT}/health`);
  console.log(`🔐 Admin key: ${ADMIN_KEY}`);
  console.log(`🗄️  Database: ${MONGODB_URI.includes('mongodb+srv') ? 'MongoDB Atlas' : 'Local MongoDB'}`);
  console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
});