# CalTrak User Data Collection

## Overview
CalTrak automatically saves user session data locally in the browser's localStorage for analytics and improvement purposes.

## What Data is Collected
- **User Inputs**: Name, weight, body fat %, activity level, goals, unit system
- **Calculation Results**: Calories, macros, BMR, TDEE, milestones
- **Session Metadata**: Timestamp, session ID, calculation duration

## Data Storage
- **Location**: Browser localStorage (client-side only)
- **Retention**: Last 50 sessions per browser
- **Privacy**: Data never leaves the user's device

## Accessing Your Data

### For Developers/Owners:
1. **Data Panel**: Press `Ctrl+Shift+D` (or `Cmd+Shift+D` on Mac) or click the chart icon in the header
2. **Browser Console**: Use `window.CalTrakData` methods:
   ```javascript
   // View analytics
   window.CalTrakData.analytics()
   
   // View all sessions
   window.CalTrakData.sessions()
   
   // Export data as JSON
   window.CalTrakData.export()
   
   // Clear all data
   window.CalTrakData.clear()
   ```

### Data Panel Features:
- **Analytics**: Usage statistics, user trends, common goals
- **Sessions**: Detailed view of all user sessions
- **Export**: Download data as JSON file
- **Clear**: Remove all stored data

## Analytics Provided:
- Total sessions and unique users
- Most common fitness goals
- Average weight and body fat trends
- Weight/body fat progression tracking
- Session timeline and frequency

## Data Privacy:
- All data is stored locally in the user's browser
- No data is transmitted to external servers
- Users can clear their data at any time
- Data is automatically limited to prevent storage bloat

## Use Cases:
- Track user engagement and popular features
- Understand common user goals and demographics
- Analyze effectiveness of recommendations
- Identify trends in user behavior
- Export data for external analysis tools

## Technical Details:
- Storage: `localStorage` with key `caltrak_user_data`
- Format: JSON with structured session objects
- Limit: 50 most recent sessions
- Size: Approximately 1-2KB per session