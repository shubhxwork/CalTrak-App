require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const { MongoClient } = require('mongodb');

const app = express();
const PORT = Number(process.env.PORT || 3001);
const MONGODB_URI = process.env.MONGODB_URI;
const MONGODB_DB = process.env.MONGODB_DB || 'caltrak';
const ADMIN_KEY = process.env.ADMIN_KEY || '';
const CORS_ORIGIN = process.env.CORS_ORIGIN || '*';

const mongoClient = MONGODB_URI ? new MongoClient(MONGODB_URI) : null;
let sessionsCollection;
let dbConnected = false;
let lastDbError = null;

function parseCorsOrigin(value) {
  if (!value || value === '*') return '*';
  return value.split(',').map((v) => v.trim()).filter(Boolean);
}

function getIp(req) {
  const forwarded = req.headers['x-forwarded-for'];
  if (typeof forwarded === 'string' && forwarded.length) return forwarded.split(',')[0].trim();
  return req.socket?.remoteAddress || 'Unknown';
}

function requireAdmin(req, res) {
  const provided = req.get('X-Admin-Key');
  if (!ADMIN_KEY || provided !== ADMIN_KEY) {
    res.status(401).json({ error: 'Unauthorized' });
    return false;
  }
  return true;
}

function ensureDb(res) {
  if (sessionsCollection) return true;
  return res.status(503).json({
    error: 'Database unavailable',
    message: 'MongoDB is not connected yet. Please retry in a few seconds.',
    lastDbError,
  });
}

function distribution(values) {
  return values.reduce((acc, value) => {
    const key = value || 'Unknown';
    acc[key] = (acc[key] || 0) + 1;
    return acc;
  }, {});
}

function average(numbers) {
  const valid = numbers.filter((n) => Number.isFinite(n));
  if (!valid.length) return 0;
  return valid.reduce((sum, current) => sum + current, 0) / valid.length;
}

function mostCommon(values) {
  const counts = distribution(values);
  let best = 'Unknown';
  let max = 0;
  for (const [key, count] of Object.entries(counts)) {
    if (count > max) {
      max = count;
      best = key;
    }
  }
  return best;
}

app.use(helmet());
app.use(cors({ origin: parseCorsOrigin(CORS_ORIGIN), credentials: true }));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

app.get('/health', async (_req, res) => {
  const totalSessions = sessionsCollection ? await sessionsCollection.countDocuments() : 0;
  res.json({
    status: dbConnected ? 'OK' : 'DEGRADED',
    timestamp: new Date().toISOString(),
    message: 'CalTrak Railway backend is running',
    database: {
      status: dbConnected ? 'Connected' : 'Disconnected',
      totalSessions,
      lastError: lastDbError,
    },
  });
});

app.post('/api/sessions', async (req, res) => {
  try {
    if (!ensureDb(res)) return;
    const { inputs, results } = req.body || {};
    if (!inputs || !results) return res.status(400).json({ success: false, error: 'Missing required fields: inputs and results' });
    if (!inputs.name || !inputs.gender || inputs.weight == null || inputs.bodyFat == null) {
      return res.status(400).json({ success: false, error: 'Missing required input fields: name, gender, weight, bodyFat' });
    }
    if (results.calories == null || results.bmr == null || results.tdee == null) {
      return res.status(400).json({ success: false, error: 'Missing required result fields: calories, bmr, tdee' });
    }

    const now = new Date();
    const sessionId = `session_${Date.now()}_${Math.random().toString(36).slice(2, 11)}`;
    await sessionsCollection.insertOne({
      sessionId,
      inputs,
      results,
      metadata: {
        ip: getIp(req),
        userAgent: req.get('User-Agent') || 'Unknown',
        referrer: req.get('Referer') || 'Direct',
        country: req.get('CF-IPCountry') || req.get('X-Country') || 'Unknown',
        city: req.get('CF-IPCity') || req.get('X-City') || 'Unknown',
        device: 'Unknown',
        browser: 'Unknown',
        timestamp: now.toISOString(),
      },
      createdAt: now,
      updatedAt: now,
    });

    const totalSessions = await sessionsCollection.countDocuments();
    return res.json({ success: true, sessionId, totalSessions });
  } catch (error) {
    return res.status(500).json({ success: false, error: error.message });
  }
});

app.get('/api/sessions', async (req, res) => {
  if (!ensureDb(res)) return;
  if (!requireAdmin(req, res)) return;
  const page = Number(req.query.page || 1);
  const limit = Math.min(Number(req.query.limit || 50), 200);
  const skip = (page - 1) * limit;
  const [sessions, totalSessions] = await Promise.all([
    sessionsCollection.find({}, { projection: { _id: 0 } }).sort({ createdAt: -1 }).skip(skip).limit(limit).toArray(),
    sessionsCollection.countDocuments(),
  ]);
  const totalPages = Math.max(1, Math.ceil(totalSessions / limit));
  res.json({ sessions, pagination: { currentPage: page, totalPages, totalSessions, hasNextPage: page < totalPages, hasPrevPage: page > 1 } });
});

app.get('/api/analytics', async (req, res) => {
  if (!ensureDb(res)) return;
  if (!requireAdmin(req, res)) return;
  const sessions = await sessionsCollection.find({}, { projection: { _id: 0 } }).sort({ createdAt: 1 }).toArray();
  if (!sessions.length) return res.json({ message: 'No data available' });

  const goals = sessions.map((s) => s.inputs?.goal);
  const countries = sessions.map((s) => s.metadata?.country);
  const genders = sessions.map((s) => s.inputs?.gender);
  const weights = sessions.map((s) => Number(s.inputs?.weight));
  const bodyFats = sessions.map((s) => Number(s.inputs?.bodyFat));
  const now = Date.now();

  res.json({
    totalSessions: sessions.length,
    uniqueUsers: new Set(sessions.map((s) => s.inputs?.name).filter(Boolean)).size,
    firstSession: sessions[0]?.metadata?.timestamp || sessions[0]?.createdAt,
    lastSession: sessions[sessions.length - 1]?.metadata?.timestamp || sessions[sessions.length - 1]?.createdAt,
    mostCommonGoal: mostCommon(goals),
    mostCommonCountry: mostCommon(countries),
    genderDistribution: distribution(genders),
    goalDistribution: distribution(goals),
    countryDistribution: distribution(countries),
    averageWeight: average(weights),
    averageBodyFat: average(bodyFats),
    sessionsLast24h: sessions.filter((s) => now - new Date(s.createdAt).getTime() < 24 * 60 * 60 * 1000).length,
    sessionsLast7days: sessions.filter((s) => now - new Date(s.createdAt).getTime() < 7 * 24 * 60 * 60 * 1000).length,
  });
});

app.post('/api/sessions/:sessionId/feedback', async (req, res) => {
  if (!ensureDb(res)) return;
  const { sessionId } = req.params;
  const { rating, recommendation } = req.body || {};
  if (typeof rating !== 'number' || rating < 1 || rating > 5) return res.status(400).json({ success: false, error: 'Rating must be a number between 1 and 5' });
  if (typeof recommendation !== 'string' || !recommendation.trim()) return res.status(400).json({ success: false, error: 'Recommendation must be a non-empty string' });

  const update = await sessionsCollection.updateOne(
    { sessionId },
    { $set: { feedback: { rating, recommendation: recommendation.trim().slice(0, 1000), timestamp: new Date().toISOString() }, updatedAt: new Date() } },
  );
  if (!update.matchedCount) return res.status(404).json({ success: false, error: 'Session not found' });
  return res.json({ success: true, message: 'Feedback saved successfully', sessionId });
});

app.get('/api/feedback', async (req, res) => {
  if (!ensureDb(res)) return;
  if (!requireAdmin(req, res)) return;
  const page = Number(req.query.page || 1);
  const limit = Math.min(Number(req.query.limit || 50), 200);
  const skip = (page - 1) * limit;
  const query = { feedback: { $exists: true } };
  const [feedback, totalFeedback] = await Promise.all([
    sessionsCollection.find(query, { projection: { _id: 0, sessionId: 1, createdAt: 1, 'inputs.name': 1, 'inputs.goal': 1, 'results.calories': 1, feedback: 1 } })
      .sort({ 'feedback.timestamp': -1 }).skip(skip).limit(limit).toArray(),
    sessionsCollection.countDocuments(query),
  ]);
  const ratings = feedback.map((item) => item.feedback?.rating).filter((n) => Number.isFinite(n));
  const ratingDistribution = distribution(ratings.map(String));
  const averageRating = ratings.length ? ratings.reduce((a, b) => a + b, 0) / ratings.length : 0;
  const totalPages = Math.max(1, Math.ceil(totalFeedback / limit));
  res.json({ feedback, pagination: { currentPage: page, totalPages, totalFeedback, hasNextPage: page < totalPages, hasPrevPage: page > 1 }, stats: { averageRating: Math.round(averageRating * 10) / 10, totalFeedback, ratingDistribution } });
});

app.get('/api/export/csv', async (req, res) => {
  if (!ensureDb(res)) return;
  if (!requireAdmin(req, res)) return;
  const sessions = await sessionsCollection.find({}, { projection: { _id: 0 } }).sort({ createdAt: -1 }).toArray();
  const headers = ['Timestamp', 'Session ID', 'Name', 'Age', 'Gender', 'Weight', 'Height', 'Body Fat %', 'Unit System', 'Activity Level', 'Goal', 'Target Weight', 'Weekly Rate', 'Calories', 'Protein (g)', 'Protein %', 'Carbs (g)', 'Carbs %', 'Fat (g)', 'Fat %', 'Fiber (g)', 'Water (L)', 'LBM', 'BMR', 'TDEE', 'Formula Used', 'Expected Change', 'Safety Level', 'Months to Target', 'Milestone Count', 'IP Address', 'Country', 'City', 'Device', 'Browser', 'User Agent'];
  const escape = (value) => `"${String(value ?? '').replace(/"/g, '""')}"`;
  const rows = sessions.map((s) => [s.metadata?.timestamp || s.createdAt, s.sessionId, s.inputs?.name, s.inputs?.age || '', s.inputs?.gender, s.inputs?.weight, s.inputs?.height || '', s.inputs?.bodyFat, s.inputs?.unitSystem, s.inputs?.activityLevel, s.inputs?.goal, s.inputs?.targetWeight || '', s.inputs?.weeklyRate || '', s.results?.calories, s.results?.proteinG, s.results?.proteinPct, s.results?.carbsG, s.results?.carbsPct, s.results?.fatG, s.results?.fatPct, s.results?.fiberG, s.results?.waterLiters, s.results?.lbm, s.results?.bmr, s.results?.tdee, s.results?.formulaUsed, s.results?.expectedWeightChange, s.results?.safetyLevel, s.results?.monthsToTarget || '', Array.isArray(s.results?.milestones) ? s.results.milestones.length : 0, s.metadata?.ip, s.metadata?.country, s.metadata?.city, s.metadata?.device, s.metadata?.browser, s.metadata?.userAgent]);
  const csv = [headers, ...rows].map((row) => row.map(escape).join(',')).join('\n');
  res.setHeader('Content-Type', 'text/csv; charset=utf-8');
  res.setHeader('Content-Disposition', `attachment; filename="caltrak-data-${new Date().toISOString().slice(0, 10)}.csv"`);
  return res.send(csv);
});

app.delete('/api/sessions/delete', async (req, res) => {
  if (!ensureDb(res)) return;
  if (!requireAdmin(req, res)) return;
  const { sessionIds } = req.body || {};
  if (!Array.isArray(sessionIds) || !sessionIds.length) return res.status(400).json({ error: 'sessionIds array is required' });
  const result = await sessionsCollection.deleteMany({ sessionId: { $in: sessionIds } });
  return res.json({ success: true, deletedCount: result.deletedCount });
});

app.delete('/api/sessions/delete-all', async (req, res) => {
  if (!ensureDb(res)) return;
  if (!requireAdmin(req, res)) return;
  const result = await sessionsCollection.deleteMany({});
  return res.json({ success: true, deletedCount: result.deletedCount });
});

app.use((_req, res) => res.status(404).json({ error: 'Not found' }));

async function connectMongoWithRetry(delayMs = 3000) {
  if (!mongoClient) {
    lastDbError = 'Missing MONGODB_URI';
    console.error('Missing required env var: MONGODB_URI');
    return;
  }

  try {
    await mongoClient.connect();
    const db = mongoClient.db(MONGODB_DB);
    sessionsCollection = db.collection('sessions');
    await sessionsCollection.createIndex({ createdAt: -1 });
    await sessionsCollection.createIndex({ sessionId: 1 }, { unique: true });
    dbConnected = true;
    lastDbError = null;
    console.log('MongoDB connected');
  } catch (error) {
    dbConnected = false;
    lastDbError = error.message || String(error);
    console.error('MongoDB connection failed, retrying...', lastDbError);
    setTimeout(() => {
      connectMongoWithRetry(Math.min(delayMs * 2, 30000));
    }, delayMs);
  }
}

async function startServer() {
  app.listen(PORT, () => console.log(`CalTrak backend running on port ${PORT}`));
  connectMongoWithRetry();
}

startServer().catch((error) => {
  console.error('Failed to start backend:', error);
  process.exit(1);
});
