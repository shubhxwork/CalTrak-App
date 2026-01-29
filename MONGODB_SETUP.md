# CalTrak MongoDB Backend Setup

This guide will help you set up CalTrak with MongoDB for unlimited scalability and better data management.

## Why MongoDB?

### Advantages over File Storage:
- ✅ **Unlimited Storage**: No file size limitations
- ✅ **Better Performance**: Optimized queries and indexing
- ✅ **Scalability**: Handles millions of users
- ✅ **Advanced Analytics**: Complex aggregation queries
- ✅ **Data Integrity**: Schema validation and constraints
- ✅ **Search Capabilities**: Full-text search and filtering
- ✅ **Backup & Recovery**: Automated backups
- ✅ **Real-time Updates**: Live data synchronization

## Quick Setup (5 minutes)

### 1. Create MongoDB Atlas Account (Free)

1. **Go to MongoDB Atlas**: [mongodb.com/atlas](https://mongodb.com/atlas)
2. **Sign up** for free account
3. **Create a cluster**:
   - Choose **M0 Sandbox** (Free tier)
   - Select region closest to your users
   - Cluster name: `caltrak-cluster`

### 2. Configure Database Access

1. **Database Access** → **Add New Database User**:
   - Username: `caltrak-admin`
   - Password: Generate secure password
   - Database User Privileges: **Read and write to any database**

2. **Network Access** → **Add IP Address**:
   - Click **Allow Access from Anywhere** (0.0.0.0/0)
   - Or add your specific IP addresses

### 3. Get Connection String

1. **Clusters** → **Connect** → **Connect your application**
2. **Driver**: Node.js
3. **Version**: 4.1 or later
4. **Copy connection string**:
   ```
   mongodb+srv://caltrak-admin:<password>@caltrak-cluster.xxxxx.mongodb.net/?retryWrites=true&w=majority
   ```

## Local Development Setup

### 1. Install Dependencies
```bash
cd backend-mongodb
npm install
```

### 2. Create Environment File
```bash
cp .env.example .env
```

### 3. Configure Environment Variables
Edit `.env` file:
```env
MONGODB_URI=mongodb+srv://caltrak-admin:YOUR_PASSWORD@caltrak-cluster.xxxxx.mongodb.net/caltrak?retryWrites=true&w=majority
PORT=3001
ADMIN_KEY=shubh2910-admin-key
NODE_ENV=development
```

### 4. Start Server
```bash
npm start
```

### 5. Test Connection
```bash
curl http://localhost:3001/health
```

Should return:
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

## Production Deployment

### Option 1: Railway (Recommended)

1. **Create Railway Account**: [railway.app](https://railway.app)
2. **New Project** → **Deploy from GitHub repo**
3. **Settings**:
   - Root Directory: `/backend-mongodb`
   - Build Command: `npm install`
   - Start Command: `npm start`
4. **Environment Variables**:
   ```
   MONGODB_URI=your_mongodb_connection_string
   ADMIN_KEY=your_secure_admin_key
   NODE_ENV=production
   ```

### Option 2: Render

1. **Create Render Account**: [render.com](https://render.com)
2. **New Web Service**:
   - Repository: Your GitHub repo
   - Root Directory: `backend-mongodb`
   - Build Command: `npm install`
   - Start Command: `npm start`
3. **Environment Variables**: Same as above

### Option 3: Heroku

```bash
cd backend-mongodb
heroku create your-caltrak-mongodb-backend
heroku config:set MONGODB_URI="your_connection_string"
heroku config:set ADMIN_KEY="your_admin_key"
git subtree push --prefix backend-mongodb heroku main
```

## Configure CalTrak Frontend

### 1. Update Backend URL
```javascript
// In CalTrak admin panel (Cmd+Shift+D, password: shubh2910):
window.CalTrakBackend.updateConfig('https://your-mongodb-backend-url.com');
window.CalTrakBackend.testConnection();
```

### 2. Test Integration
```javascript
// Should return MongoDB health status
window.CalTrakBackend.testConnection();
```

## MongoDB Features

### 1. Advanced Analytics
The MongoDB backend provides enhanced analytics:
- **Goal Distribution**: Popular fitness goals
- **Country Analytics**: Users by location
- **Device Analytics**: Mobile vs Desktop usage
- **Time-based Analytics**: Daily/weekly/monthly trends
- **Safety Level Tracking**: User safety distributions

### 2. Search & Filtering
```javascript
// Search by user name
GET /api/search?q=john

// Filter by goal
GET /api/search?goal=cut

// Filter by country
GET /api/search?country=India

// Combined filters
GET /api/search?goal=bulk&country=USA&limit=10
```

### 3. Pagination
```javascript
// Get sessions with pagination
GET /api/sessions?page=1&limit=50
```

### 4. User-specific Data
```javascript
// Get all sessions for a specific user
GET /api/users/john-doe/sessions?limit=20
```

## Data Schema

### Session Document Structure:
```javascript
{
  sessionId: "session_1234567890_abc123",
  inputs: {
    name: "John Doe",
    age: 25,
    gender: "male",
    weight: 70,
    bodyFat: 15,
    // ... other inputs
  },
  results: {
    calories: 2000,
    proteinG: 150,
    bmr: 1800,
    // ... other results
  },
  metadata: {
    ip: "192.168.1.1",
    country: "India",
    city: "Mumbai",
    device: "Mobile",
    browser: "Chrome"
  },
  createdAt: "2024-01-29T12:00:00.000Z",
  updatedAt: "2024-01-29T12:00:00.000Z"
}
```

## Performance Optimizations

### 1. Database Indexes
The schema includes optimized indexes for:
- User name + creation date
- Goal + creation date  
- Country + creation date
- Safety level + creation date
- Recent sessions (creation date)

### 2. Query Optimization
- Aggregation pipelines for analytics
- Efficient pagination
- Selective field projection
- Compound indexes for complex queries

### 3. Validation
- Schema validation for data integrity
- Input sanitization and validation
- Error handling and logging

## Monitoring & Maintenance

### 1. MongoDB Atlas Monitoring
- **Performance Advisor**: Query optimization suggestions
- **Real-time Performance Panel**: Live metrics
- **Profiler**: Slow query analysis
- **Alerts**: Custom alerts for issues

### 2. Application Monitoring
```javascript
// Check database status
GET /health

// View recent activity
GET /api/analytics

// Monitor error logs in deployment platform
```

### 3. Backup Strategy
- **Atlas Automatic Backups**: Enabled by default
- **Point-in-time Recovery**: Available
- **Export Options**: CSV export via API

## Security Features

### 1. Authentication
- Admin key authentication
- IP-based access control
- Rate limiting (100 requests/15 minutes)

### 2. Data Protection
- Helmet.js security headers
- Input validation and sanitization
- MongoDB injection prevention
- CORS configuration

### 3. Environment Security
- Environment variables for secrets
- Secure connection strings
- Production/development separation

## Troubleshooting

### Common Issues:

**"MongoNetworkError":**
- Check internet connection
- Verify MongoDB Atlas IP whitelist
- Confirm connection string format

**"Authentication failed":**
- Verify database username/password
- Check user permissions in Atlas
- Ensure correct database name

**"Validation Error":**
- Check required fields in request
- Verify data types match schema
- Review error message details

### Debug Commands:
```javascript
// Test backend connection
window.CalTrakBackend.testConnection();

// View configuration
window.CalTrakBackend.getConfig();

// Check recent sessions
window.CalTrakBackend.getAllSessions().then(console.log);
```

## Migration from File Backend

If you're switching from the file-based backend:

1. **Deploy MongoDB backend**
2. **Update frontend configuration**
3. **Test with new sessions**
4. **Export old data** (if needed)
5. **Switch DNS/URL** to new backend

---

**With MongoDB, you now have enterprise-grade data storage that can handle unlimited users worldwide!** 🚀