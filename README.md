<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# CalTrak - Advanced Calorie & Macro Calculator

**CalTrak** is a precision fitness calculator that generates personalized nutrition blueprints based on body composition, activity level, and fitness goals. Built with React, TypeScript, and MongoDB for worldwide data collection.

## 🚀 Features

### Core Calculator
- **Precision Macros**: Protein, carbs, fat distribution based on lean body mass
- **Multiple Formulas**: Katch-McArdle and Mifflin-St Jeor BMR calculations  
- **Smart Goals**: Cut, bulk, and recomposition with safety validation
- **Timeline Projections**: Milestone tracking and target achievement dates
- **Safety Monitoring**: Metabolic floor protection and warning system

### Data Collection & Analytics
- **Worldwide Backend**: MongoDB-powered global user data collection
- **Google Sheets Integration**: Automatic data export to spreadsheets
- **Admin Dashboard**: Real-time analytics and user insights
- **Local Storage**: Client-side session management
- **CSV Export**: Complete data export capabilities

### Security & Access
- **Admin Authentication**: Password-protected developer console
- **Session Management**: Secure admin access with timeouts
- **Rate Limiting**: API protection and abuse prevention
- **Data Privacy**: Secure handling of user information

## 🛠️ Quick Start

### Prerequisites
- Node.js 18+
- MongoDB (local or Atlas)
- Google Apps Script (optional, for Sheets integration)

### 1. Frontend Setup
```bash
# Clone and install
git clone <your-repo>
cd CalTrak-App
npm install

# Start development server
npm run dev
```

### 2. MongoDB Backend Setup
```bash
# Install backend dependencies
cd backend-mongodb
npm install

# Configure environment
cp .env.example .env
# Edit .env with your MongoDB connection string

# Start backend server
npm start
```

### 3. Access Admin Panel
- Press `Cmd+Shift+D` (Mac) or `Ctrl+Shift+D` (Windows)
- Enter password: `shubh2910`
- View worldwide data and analytics

## 📊 Backend Architecture

### MongoDB Backend (`/backend-mongodb`)
- **Express.js API** with MongoDB integration
- **Advanced Analytics** with aggregation pipelines
- **Search & Filtering** capabilities
- **Pagination** for large datasets
- **Admin Authentication** with secure API keys
- **Rate Limiting** and security middleware

### File-based Backend (`/backend`)
- **Simple JSON storage** for basic deployments
- **Local file management** with session tracking
- **Lightweight alternative** to MongoDB

## 🌍 Deployment

### MongoDB Backend (Recommended)
1. **Deploy to Railway/Render/Heroku** (see `BACKEND_DEPLOYMENT.md`)
2. **Setup MongoDB Atlas** (free tier available)
3. **Configure environment variables**
4. **Update frontend backend URL**

### Frontend Deployment
- **Vercel/Netlify**: Static deployment
- **GitHub Pages**: Free hosting option
- **Custom Domain**: Configure CORS for production

## 📋 Documentation

- **[MongoDB Setup Guide](MONGODB_SETUP.md)** - Complete MongoDB backend setup
- **[Backend Deployment](BACKEND_DEPLOYMENT.md)** - Production deployment guide
- **[Google Sheets Setup](GOOGLE_SHEETS_SETUP.md)** - Sheets integration guide
- **[Admin Access Guide](ADMIN_ACCESS.md)** - Admin panel documentation
- **[Troubleshooting](TROUBLESHOOTING_SHEETS.md)** - Common issues and fixes

## 🔧 Configuration

### Backend Configuration
```typescript
// services/backendService.ts
const BACKEND_CONFIG = {
  baseUrl: 'https://your-backend-url.com',
  adminKey: 'your-admin-key',
  enabled: true,
  type: 'mongodb' // or 'file'
};
```

### Admin Access
- **Password**: `shubh2910` (configurable in `authService.ts`)
- **Session Duration**: 30 minutes
- **Keyboard Shortcut**: `Cmd+Shift+D` / `Ctrl+Shift+D`

## 🧪 Testing

### Backend Testing
```bash
# Test MongoDB backend
curl http://localhost:3001/health

# Test admin endpoints
curl -H "X-Admin-Key: your-key" http://localhost:3001/api/analytics
```

### Frontend Testing
```bash
# Run development server
npm run dev

# Generate test blueprint
# Check admin panel for data
# Verify backend integration
```

## 📈 Analytics & Insights

### Available Metrics
- **Total Sessions**: Worldwide user count
- **Goal Distribution**: Popular fitness goals
- **Demographics**: Country, age, gender analysis
- **Device Analytics**: Mobile vs desktop usage
- **Safety Tracking**: User safety level distribution
- **Time-based Trends**: Daily/weekly/monthly patterns

### Admin API Endpoints
- `GET /api/sessions` - All user sessions
- `GET /api/analytics` - Comprehensive analytics
- `GET /api/search` - Search and filter sessions
- `GET /api/export/csv` - Export all data
- `GET /api/users/:name/sessions` - User-specific data

## 🔒 Security Features

- **Admin Key Authentication**: Secure API access
- **Rate Limiting**: 100 requests per 15 minutes
- **Input Validation**: Schema validation and sanitization
- **CORS Protection**: Configurable origin restrictions
- **Helmet.js**: Security headers and protection
- **MongoDB Injection Prevention**: Query sanitization

## 🤝 Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **MongoDB Atlas** for database hosting
- **Railway/Render** for backend deployment
- **Google Apps Script** for Sheets integration
- **React & TypeScript** for frontend framework

---

**CalTrak - Precision Nutrition for Serious Athletes** 💪
