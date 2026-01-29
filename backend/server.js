const express = require('express');
const cors = require('cors');
const fs = require('fs').promises;
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3001;
const DATA_FILE = path.join(__dirname, 'user-data.json');

// Middleware
app.use(cors());
app.use(express.json({ limit: '10mb' }));

// Ensure data file exists
async function ensureDataFile() {
  try {
    await fs.access(DATA_FILE);
  } catch (error) {
    // File doesn't exist, create it
    await fs.writeFile(DATA_FILE, JSON.stringify({ sessions: [], totalSessions: 0 }));
  }
}

// Read data from file
async function readData() {
  try {
    const data = await fs.readFile(DATA_FILE, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    console.error('Error reading data:', error);
    return { sessions: [], totalSessions: 0 };
  }
}

// Write data to file
async function writeData(data) {
  try {
    await fs.writeFile(DATA_FILE, JSON.stringify(data, null, 2));
  } catch (error) {
    console.error('Error writing data:', error);
  }
}

// Routes

// Health check
app.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    message: 'CalTrak Backend is running!'
  });
});

// Save user session data
app.post('/api/sessions', async (req, res) => {
  try {
    console.log('📊 New session data received:', {
      user: req.body.inputs?.name,
      timestamp: new Date().toISOString(),
      ip: req.ip,
      userAgent: req.get('User-Agent')
    });

    const sessionData = {
      id: `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      timestamp: Date.now(),
      inputs: req.body.inputs,
      results: req.body.results,
      metadata: {
        ip: req.ip,
        userAgent: req.get('User-Agent'),
        referrer: req.get('Referer') || 'Direct',
        country: req.get('CF-IPCountry') || 'Unknown', // Cloudflare header
        timestamp: new Date().toISOString()
      }
    };

    // Read current data
    const data = await readData();
    
    // Add new session
    data.sessions.push(sessionData);
    data.totalSessions++;
    data.lastUpdated = new Date().toISOString();

    // Keep only last 1000 sessions to prevent file from getting too large
    if (data.sessions.length > 1000) {
      data.sessions = data.sessions.slice(-1000);
    }

    // Save data
    await writeData(data);

    console.log('✅ Session saved successfully:', sessionData.id);

    res.json({ 
      success: true, 
      sessionId: sessionData.id,
      totalSessions: data.totalSessions
    });

  } catch (error) {
    console.error('❌ Error saving session:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
});

// Get all sessions (admin only)
app.get('/api/sessions', async (req, res) => {
  try {
    // Simple admin authentication
    const adminKey = req.get('X-Admin-Key');
    if (adminKey !== 'shubh2910-admin-key') {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const data = await readData();
    
    res.json({
      sessions: data.sessions,
      totalSessions: data.totalSessions,
      lastUpdated: data.lastUpdated
    });

  } catch (error) {
    console.error('Error fetching sessions:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get analytics (admin only)
app.get('/api/analytics', async (req, res) => {
  try {
    // Simple admin authentication
    const adminKey = req.get('X-Admin-Key');
    if (adminKey !== 'shubh2910-admin-key') {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const data = await readData();
    const sessions = data.sessions;

    if (sessions.length === 0) {
      return res.json({ message: 'No data available' });
    }

    // Calculate analytics
    const goals = sessions.map(s => s.inputs.goal);
    const weights = sessions.map(s => s.inputs.weight);
    const bodyFats = sessions.map(s => s.inputs.bodyFat);
    const countries = sessions.map(s => s.metadata.country);
    const genders = sessions.map(s => s.inputs.gender);

    const analytics = {
      totalSessions: data.totalSessions,
      uniqueUsers: [...new Set(sessions.map(s => s.inputs.name))].length,
      firstSession: sessions[0]?.metadata.timestamp,
      lastSession: sessions[sessions.length - 1]?.metadata.timestamp,
      mostCommonGoal: getMostCommon(goals),
      mostCommonCountry: getMostCommon(countries),
      genderDistribution: getDistribution(genders),
      goalDistribution: getDistribution(goals),
      averageWeight: getAverage(weights),
      averageBodyFat: getAverage(bodyFats),
      sessionsLast24h: sessions.filter(s => 
        Date.now() - s.timestamp < 24 * 60 * 60 * 1000
      ).length,
      sessionsLast7days: sessions.filter(s => 
        Date.now() - s.timestamp < 7 * 24 * 60 * 60 * 1000
      ).length
    };

    res.json(analytics);

  } catch (error) {
    console.error('Error calculating analytics:', error);
    res.status(500).json({ error: error.message });
  }
});

// Export all data as CSV (admin only)
app.get('/api/export/csv', async (req, res) => {
  try {
    // Simple admin authentication
    const adminKey = req.get('X-Admin-Key');
    if (adminKey !== 'shubh2910-admin-key') {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const data = await readData();
    const sessions = data.sessions;

    // Create CSV headers
    const headers = [
      'Timestamp', 'Session ID', 'Name', 'Age', 'Gender', 'Weight', 'Height',
      'Body Fat %', 'Unit System', 'Activity Level', 'Goal', 'Target Weight',
      'Weekly Rate', 'Calories', 'Protein (g)', 'Protein %', 'Carbs (g)',
      'Carbs %', 'Fat (g)', 'Fat %', 'Fiber (g)', 'Water (L)', 'LBM',
      'BMR', 'TDEE', 'Formula Used', 'Expected Change', 'Safety Level',
      'Months to Target', 'Milestone Count', 'IP Address', 'Country', 'User Agent'
    ];

    // Create CSV rows
    const rows = sessions.map(session => [
      session.metadata.timestamp,
      session.id,
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
      session.metadata.userAgent
    ]);

    // Convert to CSV
    const csv = [headers, ...rows]
      .map(row => row.map(field => `"${field}"`).join(','))
      .join('\n');

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename="caltrak-data-${new Date().toISOString().split('T')[0]}.csv"`);
    res.send(csv);

  } catch (error) {
    console.error('Error exporting CSV:', error);
    res.status(500).json({ error: error.message });
  }
});

// Helper functions
function getMostCommon(arr) {
  if (arr.length === 0) return null;
  const counts = arr.reduce((acc, val) => {
    acc[val] = (acc[val] || 0) + 1;
    return acc;
  }, {});
  return Object.keys(counts).reduce((a, b) => counts[a] > counts[b] ? a : b);
}

function getDistribution(arr) {
  const counts = arr.reduce((acc, val) => {
    acc[val] = (acc[val] || 0) + 1;
    return acc;
  }, {});
  return counts;
}

function getAverage(arr) {
  return arr.length > 0 ? arr.reduce((a, b) => a + b, 0) / arr.length : 0;
}

// Start server
async function startServer() {
  await ensureDataFile();
  
  app.listen(PORT, () => {
    console.log(`🚀 CalTrak Backend running on port ${PORT}`);
    console.log(`📊 Health check: http://localhost:${PORT}/health`);
    console.log(`🔐 Admin key: shubh2910-admin-key`);
  });
}

startServer().catch(console.error);