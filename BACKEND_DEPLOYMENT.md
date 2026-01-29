# CalTrak Backend Deployment Guide

## 🚀 Quick Deployment (5 minutes)

### Option 1: Railway (Recommended - Free Tier Available)

1. **Create Railway Account**: [railway.app](https://railway.app)
2. **New Project** → **Deploy from GitHub repo**
3. **Configure Service**:
   - **Root Directory**: `backend-mongodb`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
   - **Port**: `3001` (Railway auto-detects)

4. **Environment Variables**:
   ```env
   MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/caltrak?retryWrites=true&w=majority
   ADMIN_KEY=shubh2910-admin-key
   NODE_ENV=production
   CORS_ORIGIN=https://your-caltrak-domain.com
   ```

5. **Deploy**: Railway will automatically deploy and provide a URL like `https://your-app.railway.app`

### Option 2: Render (Free Tier)

1. **Create Render Account**: [render.com](https://render.com)
2. **New Web Service**:
   - **Repository**: Your GitHub repo
   - **Root Directory**: `backend-mongodb`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
   - **Environment**: Node

3. **Environment Variables**: Same as Railway
4. **Deploy**: Render provides URL like `https://your-app.onrender.com`

### Option 3: Heroku

```bash
cd backend-mongodb
heroku create your-caltrak-backend
heroku config:set MONGODB_URI="your_mongodb_connection_string"
heroku config:set ADMIN_KEY="shubh2910-admin-key"
heroku config:set NODE_ENV="production"
git subtree push --prefix backend-mongodb heroku main
```

## 🗄️ MongoDB Atlas Setup (Free)

1. **Create Account**: [mongodb.com/atlas](https://mongodb.com/atlas)
2. **Create Cluster**:
   - **Tier**: M0 Sandbox (Free)
   - **Region**: Closest to your users
   - **Name**: `caltrak-cluster`

3. **Database Access**:
   - **Username**: `caltrak-admin`
   - **Password**: Generate secure password
   - **Privileges**: Read and write to any database

4. **Network Access**:
   - **IP Whitelist**: `0.0.0.0/0` (Allow from anywhere)
   - Or add specific IPs for better security

5. **Get Connection String**:
   ```
   mongodb+srv://caltrak-admin:PASSWORD@caltrak-cluster.xxxxx.mongodb.net/caltrak?retryWrites=true&w=majority
   ```

## 🔧 Frontend Configuration

After deploying the backend, update your CalTrak frontend:

### Method 1: Admin Panel (Recommended)
1. Open CalTrak app
2. Press `Cmd+Shift+D` (Mac) or `Ctrl+Shift+D` (Windows)
3. Enter password: `shubh2910`
4. Go to browser console and run:
   ```javascript
   window.CalTrakBackend.updateConfig('https://your-backend-url.com');
   window.CalTrakBackend.testConnection();
   ```

### Method 2: Code Update
Edit `CalTrak-App/services/backendService.ts`:
```typescript
const BACKEND_CONFIG = {
  baseUrl: 'https://your-backend-url.com',
  adminKey: 'shubh2910-admin-key',
  enabled: true,
  type: 'mongodb'
};
```

## ✅ Testing Deployment

### 1. Health Check
```bash
curl https://your-backend-url.com/health
```

Expected response:
```json
{
  "status": "OK",
  "message": "CalTrak MongoDB Backend is running!",
  "database": {
    "status": "Connected",
    "totalSessions": 0
  }
}
```

### 2. Frontend Integration Test
1. Open CalTrak app
2. Generate a blueprint with test data
3. Check admin panel for worldwide data
4. Verify data appears in MongoDB Atlas

### 3. Admin API Test
```bash
curl -H "X-Admin-Key: shubh2910-admin-key" https://your-backend-url.com/api/sessions
```

## 🔒 Security Configuration

### Production Environment Variables
```env
# Required
MONGODB_URI=mongodb+srv://...
ADMIN_KEY=your-secure-admin-key-here
NODE_ENV=production

# Recommended
CORS_ORIGIN=https://your-caltrak-domain.com
JWT_SECRET=your-jwt-secret-here
```

### Security Features Enabled
- ✅ Rate limiting (100 requests/15 minutes)
- ✅ Helmet.js security headers
- ✅ CORS protection
- ✅ Input validation and sanitization
- ✅ Admin key authentication
- ✅ MongoDB injection prevention

## 📊 Features Available

### Worldwide Data Collection
- ✅ Automatic saving when users generate blueprints
- ✅ Real-time analytics and insights
- ✅ Country and device tracking
- ✅ Goal and demographic analysis

### Admin Dashboard Features
- ✅ View all worldwide user sessions
- ✅ Advanced analytics and trends
- ✅ Search and filter capabilities
- ✅ CSV export for data analysis
- ✅ User-specific session history

### API Endpoints
- `GET /health` - Health check
- `POST /api/sessions` - Save user session
- `GET /api/sessions` - Get all sessions (admin)
- `GET /api/analytics` - Get analytics (admin)
- `GET /api/search` - Search sessions (admin)
- `GET /api/export/csv` - Export CSV (admin)
- `GET /api/users/:name/sessions` - User sessions (admin)

## 🚨 Troubleshooting

### Common Issues

**"Cannot connect to MongoDB"**
- Verify MongoDB Atlas connection string
- Check IP whitelist in Atlas
- Ensure database user has correct permissions

**"Backend connection failed"**
- Check if backend URL is correct
- Verify environment variables are set
- Check deployment logs for errors

**"Admin authentication failed"**
- Verify ADMIN_KEY matches in both frontend and backend
- Check if admin key is properly set in environment

### Debug Commands
```javascript
// Test backend connection
window.CalTrakBackend.testConnection();

// View current configuration
window.CalTrakBackend.getConfig();

// Get analytics
window.CalTrakBackend.getAnalytics().then(console.log);
```

## 📈 Monitoring

### Railway Monitoring
- **Metrics**: CPU, Memory, Network usage
- **Logs**: Real-time application logs
- **Alerts**: Set up alerts for downtime

### MongoDB Atlas Monitoring
- **Performance Advisor**: Query optimization
- **Real-time Performance Panel**: Live metrics
- **Alerts**: Custom alerts for issues

### Application Health
- Health endpoint: `GET /health`
- Monitor response times and error rates
- Set up uptime monitoring (UptimeRobot, etc.)

## 🔄 Updates and Maintenance

### Updating Backend
1. Push changes to GitHub
2. Railway/Render will auto-deploy
3. Monitor logs for any issues
4. Test health endpoint

### Database Maintenance
- MongoDB Atlas handles backups automatically
- Monitor storage usage (512MB free tier limit)
- Set up alerts for storage approaching limits

### Scaling
- **Free Tier**: ~1000 sessions/month
- **Paid Tier**: Unlimited sessions
- **Performance**: Optimized indexes for fast queries

---

**Your CalTrak backend is now ready to collect worldwide user data! 🌍**

Users from any device, anywhere in the world, will have their blueprint data automatically saved to your MongoDB database for analysis and insights.