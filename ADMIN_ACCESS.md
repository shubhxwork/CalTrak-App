# Admin Access & Security

CalTrak includes admin-only features for data analytics and configuration. These features are protected by authentication to prevent unauthorized access.

## Admin Features

### Protected Features:
- **Data Analytics Dashboard**: View user statistics, trends, and session data
- **Google Sheets Configuration**: Set up and manage data export to Google Sheets
- **User Data Export**: Download all collected user data
- **Console API Access**: Programmatic access to data and configuration

### Public Features (No Authentication Required):
- **Calorie Calculator**: Main app functionality for all users
- **Results Display**: Viewing calculation results
- **Food Recommendations**: Nutritional guidance
- **Print/Export Results**: Individual result exports

## Authentication

### Default Credentials:
- **Password**: `shubh2910`
- **Session Duration**: 24 hours
- **Access Method**: Keyboard shortcut or header button

### Changing Admin Password:
```javascript
// In browser console (while authenticated)
window.CalTrakAuth.updatePassword('current_password', 'new_password');
```

### Access Methods:

**1. Keyboard Shortcut:**
- Mac: `Cmd+Shift+D`
- Windows/Linux: `Ctrl+Shift+D`

**2. Header Button:**
- Click the small chart icon in the top-right corner

**3. Console Command:**
```javascript
window.CalTrakAuth.login('your_password');
```

## Security Features

### Authentication Protection:
- Password-protected admin access
- Session-based authentication with expiration
- Automatic logout after 24 hours
- Console API access only when authenticated

### Data Protection:
- User data stored locally in browser only
- Google Sheets integration uses direct browser-to-sheets communication
- No intermediate servers or data storage
- Admin features hidden from regular users

### Session Management:
```javascript
// Check authentication status
window.CalTrakAuth.isAuthenticated();

// View session info
window.CalTrakAuth.getConfig();

// Manual logout
window.CalTrakAuth.logout();
```

## Development Mode

### Disable Authentication (Development Only):
```javascript
// WARNING: This makes admin features accessible to all users
window.CalTrakAuth.disableAuth();
```

### Re-enable Authentication:
```javascript
window.CalTrakAuth.enableAuth();
```

## Security Best Practices

### For Production:
1. **Change Default Password**: Update the admin password immediately
2. **Regular Password Updates**: Change password periodically
3. **Secure Environment**: Only access admin features on trusted devices
4. **Session Management**: Log out when finished with admin tasks
5. **Monitor Access**: Check session logs regularly

### For Development:
1. **Disable Auth**: Use `disableAuth()` for easier development
2. **Test Security**: Verify authentication works before deployment
3. **Clean Sessions**: Clear localStorage between tests

## Troubleshooting

### Common Issues:

**"Access Denied" Error:**
- Verify the password is correct
- Check if session has expired
- Try logging out and back in

**Console API Not Available:**
- Ensure you're authenticated first
- Check if session is still valid
- Verify authentication is enabled

**Can't Access Admin Panel:**
- Try the keyboard shortcut: Cmd+Shift+D (Mac) or Ctrl+Shift+D (Windows)
- Click the chart icon in the header
- Check browser console for errors

### Reset Authentication:
```javascript
// Clear all auth data and start fresh
localStorage.removeItem('caltrak_admin_session');
window.CalTrakAuth.enableAuth();
```

## Privacy Notice

### For Users:
- Regular app usage requires no authentication
- Personal data is stored locally in your browser
- No personal data is transmitted without your knowledge
- Admin features are only accessible to app owners

### For Admins:
- You have access to aggregated user data for analytics
- Individual user sessions are tracked for improvement purposes
- Google Sheets integration is optional and configurable
- All data handling complies with privacy best practices

---

**Important**: Keep your admin password secure and don't share it with unauthorized users. The admin panel contains sensitive user data and configuration settings.