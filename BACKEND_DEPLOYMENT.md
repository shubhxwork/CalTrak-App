# CalTrak Backend Deployment Guide

This guide will help you deploy the CalTrak backend to collect user data from all devices worldwide.

## Quick Setup (Local Testing)

### 1. Install Dependencies
```bash
cd backend
npm install
```

### 2. Start Local Server
```bash
npm start
# Server runs on http://localhost:3001
```

### 3. Test Backend
```bash
curl http://localhost:3001/health
# Should return: {"status":"OK","timestamp":"...","message":"CalTrak Backend is running!"}
```

## Production Deployment Options

### Option 1: Railway (Recommended - Free & Easy)

1. **Create Railway Account**: Go to [railway.app](https://railway.app)
2. **Connect GitHub**: Link your GitHub account
3. **Deploy Project**:
   - Click "New Project"
   - Select "Deploy from GitHub repo"
   - Choose your CalTrak repository
   - Set root directory to `/backend`
4. **Environment Variables**: None needed for basic setup
5. **Get URL**: Railway will provide a URL like `https://your-app.railway.app`

### Option 2: Render (Free Tier)

1. **Create Render Account**: Go to [render.com](https://render.com)
2. **New Web Service**:
   - Connect GitHub repository
   - Root Directory: `backend`
   - Build Command: `npm install`
   - Start Command: `npm start`
3. **Get URL**: Render provides URL like `https://your-app.onrender.com`

### Option 3: Heroku

1. **Install Heroku CLI**
2. **Create App**:
   ```bash
   cd backend
   heroku create your-caltrak-backend
   ```
3. **Deploy**:
   ```bash
   git subtree push --prefix backend heroku main
   ```

### Option 4: Vercel (Serverless)

1. **Install Vercel CLI**: `npm i -g vercel`
2. **Deploy**:
   ```bash
   cd backend
   vercel
   ```

## Configure CalTrak Frontend

### 1. Update Backend URL
Once deployed, update the frontend configuration:

```javascript
// In CalTrak admin panel (Cmd+Shift+D, password: shubh2910):
window.CalTrakBackend.updateConfig('https://your-backend-url.com');
window.CalTrakBackend.testConnection();
```

### 2. Test Connection
```javascript
// Should return true if working
window.CalTrakBackend.testConnection();
```

## Backend API Endpoints

### Public Endpoints:
- `GET /health` - Health check
- `POST /api/sessions` - Save user session data

### Admin Endpoints (require X-Admin-Key header):
- `GET /api/sessions` - Get all sessions
- `GET /api/analytics` - Get analytics
- `GET /api/export/csv` - Export data as CSV

### Admin Key:
- Default: `shubh2910-admin-key`
- Change in `backend/server.js` line 15

## Data Storage

### Local File Storage (Default):
- Data stored in `backend/user-data.json`
- Automatically created on first run
- Keeps last 1000 sessions

### Database Options (Advanced):
You can modify the backend to use:
- **MongoDB**: For cloud storage
- **PostgreSQL**: For relational data
- **Firebase**: For real-time updates

## Security Considerations

### 1. Change Admin Key
```javascript
// In backend/server.js, line 15:
const adminKey = 'your-secure-admin-key-here';
```

### 2. Add Rate Limiting
```javascript
const rateLimit = require('express-rate-limit');
app.use(rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
}));
```

### 3. Add CORS Restrictions
```javascript
app.use(cors({
  origin: ['https://your-caltrak-domain.com']
}));
```

## Monitoring & Analytics

### 1. View Real-time Data
```javascript
// In CalTrak admin panel:
window.CalTrakBackend.getAnalytics();
window.CalTrakBackend.getAllSessions();
```

### 2. Export Data
```javascript
// Downloads CSV with all worldwide data:
window.CalTrakBackend.exportCSV();
```

### 3. Server Logs
Check your deployment platform's logs for:
- New session saves
- Error messages
- Performance metrics

## Troubleshooting

### Common Issues:

**"Backend connection failed":**
- Check if backend URL is correct
- Verify backend is running
- Check CORS settings

**"Unauthorized" errors:**
- Verify admin key is correct
- Check X-Admin-Key header

**"No data appearing":**
- Check browser console for errors
- Verify POST requests are being sent
- Check backend logs for incoming requests

### Debug Commands:
```javascript
// Check configuration
window.CalTrakBackend.getConfig();

// Test connection
window.CalTrakBackend.testConnection();

// View recent sessions
window.CalTrakBackend.getAllSessions().then(console.log);
```

## Scaling Considerations

### For High Traffic:
1. **Database**: Switch from file storage to database
2. **Caching**: Add Redis for session caching
3. **Load Balancing**: Use multiple backend instances
4. **CDN**: Serve static assets via CDN

### Performance Optimization:
- Enable gzip compression
- Add request caching
- Implement database indexing
- Use connection pooling

## Data Privacy

### GDPR Compliance:
- Add user consent mechanisms
- Implement data deletion endpoints
- Provide data export for users
- Add privacy policy endpoints

### Data Retention:
- Current: 1000 sessions max
- Configurable in `server.js`
- Consider implementing automatic cleanup

---

**Once deployed, you'll have a centralized backend collecting user data from all devices worldwide!**