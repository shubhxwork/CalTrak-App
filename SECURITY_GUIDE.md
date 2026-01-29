# 🔒 CalTrak Security Guide

## 🚨 CRITICAL: Credentials Were Exposed

**If you followed the previous setup, your credentials were exposed publicly. You MUST rotate them immediately.**

### ⚠️ What Was Exposed:
- MongoDB connection string with username/password
- Admin API key
- Database cluster information

### 🛡️ Immediate Actions Required:

## 1. Rotate MongoDB Credentials

### Step 1: Change MongoDB Password
1. Go to **MongoDB Atlas Dashboard**
2. **Database Access** → Find your user
3. **Edit** → **Change Password**
4. Generate a **strong, unique password**
5. **Save securely** (use password manager)

### Step 2: Update Railway Environment Variables
1. Go to **Railway Dashboard** → Your Project
2. **Variables** tab
3. Update `MONGODB_URI` with new password:
   ```
   mongodb+srv://username:NEW_PASSWORD@cluster.mongodb.net/caltrak?retryWrites=true&w=majority
   ```

## 2. Generate New Admin Key

### Step 1: Create Secure Admin Key
```bash
# Generate a secure random key
node -e "console.log('admin-' + require('crypto').randomBytes(32).toString('hex'))"
```

### Step 2: Update Railway Variables
```env
ADMIN_KEY=admin-your-new-secure-key-here
```

### Step 3: Update Frontend (Local Only)
Update your local `.env.local` (NOT committed to git):
```env
VITE_ADMIN_KEY=admin-your-new-secure-key-here
```

## 3. Fix CORS Security

### Current Problem:
```env
CORS_ORIGIN=*  # ❌ Allows any website to access your API
```

### Secure Solution:
```env
# For production (after Vercel deployment)
CORS_ORIGIN=https://your-app.vercel.app

# For development + production
CORS_ORIGIN=http://localhost:3002,https://your-app.vercel.app
```

## 4. Frontend Security Issues

### ⚠️ Current Architecture Problem:
```typescript
// ❌ This exposes admin key to anyone
VITE_ADMIN_KEY=your-key-here
```

**Reality**: Anything with `VITE_` prefix is bundled into frontend JavaScript and visible to anyone.

### 🔧 Current Acceptable Use:
- ✅ **Personal/Internal tool**: Acceptable risk
- ❌ **Public production app**: Not secure

### 🛡️ Future Security Improvements:

#### Option 1: Backend-Only Admin Auth
```typescript
// Move admin auth to backend
POST /api/admin/login
{
  "email": "admin@example.com",
  "password": "secure-password"
}
// Returns JWT token for admin requests
```

#### Option 2: Environment-Based Access
```typescript
// Only expose admin features in development
const isAdminMode = import.meta.env.DEV;
```

## 5. Environment Variable Security

### ✅ Secure Storage:
- **Railway**: Environment Variables tab
- **Vercel**: Project Settings → Environment Variables
- **Local**: `.env.local` (gitignored)

### ❌ Never Store In:
- Git repositories
- Chat logs
- Documentation files
- Frontend code
- Public files

## 6. Database Security Checklist

### ✅ MongoDB Atlas Security:
- [ ] Strong, unique passwords
- [ ] IP whitelist (not 0.0.0.0/0 if possible)
- [ ] Database user with minimal permissions
- [ ] Regular credential rotation
- [ ] Connection string encryption

### ✅ API Security:
- [ ] CORS restricted to your domain
- [ ] Rate limiting enabled
- [ ] Input validation
- [ ] Admin key rotation
- [ ] HTTPS only

## 7. Monitoring & Alerts

### Set Up Alerts For:
- Unusual database activity
- High API usage
- Failed authentication attempts
- New IP addresses accessing database

### Regular Security Tasks:
- [ ] Monthly credential rotation
- [ ] Review access logs
- [ ] Update dependencies
- [ ] Security audit

## 8. If Compromised

### Immediate Actions:
1. **Rotate all credentials** immediately
2. **Check database** for unauthorized changes
3. **Review access logs** for suspicious activity
4. **Update IP whitelist** to be more restrictive
5. **Monitor for unusual activity**

### Database Recovery:
```bash
# Export clean backup
mongodump --uri="mongodb+srv://..."

# If data is compromised, restore from backup
mongorestore --uri="mongodb+srv://..." /path/to/backup
```

## 9. Production Deployment Security

### Railway Environment Variables:
```env
MONGODB_URI=mongodb+srv://user:SECURE_PASSWORD@cluster.net/db
ADMIN_KEY=admin-SECURE_RANDOM_KEY
NODE_ENV=production
CORS_ORIGIN=https://your-app.vercel.app
```

### Vercel Environment Variables:
```env
VITE_BACKEND_URL=https://your-backend.railway.app
# Note: VITE_ADMIN_KEY should be avoided for public apps
```

## 10. Security Best Practices

### ✅ Do:
- Use strong, unique passwords
- Rotate credentials regularly
- Restrict CORS to specific domains
- Use HTTPS everywhere
- Monitor access logs
- Keep dependencies updated

### ❌ Don't:
- Commit secrets to git
- Use `CORS_ORIGIN=*` in production
- Store secrets in frontend code
- Share credentials in chat/docs
- Use default passwords
- Ignore security warnings

---

**Remember: Security is not a one-time setup. It requires ongoing attention and regular updates.**