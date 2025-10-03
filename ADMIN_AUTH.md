# Admin Authentication Guide

## 🔐 Admin Panel Security

The admin panel now requires authentication to access contest management features.

---

## Default Credentials

**Username:** `admin`  
**Password:** `admin123`

⚠️ **IMPORTANT**: Change these credentials in production!

---

## How to Access Admin Panel

### Step 1: Navigate to Admin Panel
Visit: `http://localhost:3000/admin` (or your deployed URL + `/admin`)

### Step 2: Login
You'll see a login screen. Enter:
- **Username**: `admin`
- **Password**: `admin123`

### Step 3: Access Granted
After successful login, you can:
- Create contests
- Add problems
- Manage existing contests
- Copy contest URLs

---

## Features

### Login Page
- ✅ Username and password authentication
- ✅ Error messages for invalid credentials
- ✅ Default credentials displayed for reference
- ✅ Clean, professional UI
- ✅ Link back to homepage

### Admin Dashboard
- ✅ Logout button in navigation bar
- ✅ Session persistence (stays logged in on refresh)
- ✅ Admin indicator (👤 Admin) in navbar
- ✅ Full contest management access

---

## Session Management

### How it Works:
1. Login credentials are validated against defaults
2. On success, `localStorage` stores authentication state
3. Session persists across page refreshes
4. Clicking "Logout" clears the session

### To Logout:
- Click the **"Logout"** button in the top-right corner
- You'll be redirected to the login screen
- Session is cleared from browser

---

## Changing Default Credentials

### For Development (Current Implementation):

The credentials are hardcoded in `src/app/admin/page.tsx`:

```typescript
const DEFAULT_ADMIN_USERNAME = 'admin';
const DEFAULT_ADMIN_PASSWORD = 'admin123';
```

**To change them:**
1. Open `src/app/admin/page.tsx`
2. Modify the constants at the top:
   ```typescript
   const DEFAULT_ADMIN_USERNAME = 'your_username';
   const DEFAULT_ADMIN_PASSWORD = 'your_secure_password';
   ```
3. Save and restart the dev server

### For Production (Recommended):

**Option 1: Environment Variables**
1. Add to `.env.local`:
   ```
   ADMIN_USERNAME=your_username
   ADMIN_PASSWORD=your_secure_password
   ```

2. Update `src/app/admin/page.tsx`:
   ```typescript
   const DEFAULT_ADMIN_USERNAME = process.env.NEXT_PUBLIC_ADMIN_USERNAME || 'admin';
   const DEFAULT_ADMIN_PASSWORD = process.env.NEXT_PUBLIC_ADMIN_PASSWORD || 'admin123';
   ```

3. Add to Vercel environment variables

**Option 2: Database Authentication**
- Create an `admins` table in your database
- Store hashed passwords (use bcrypt)
- Implement proper authentication flow
- Add user management features

**Option 3: OAuth/SSO**
- Integrate with Google/GitHub OAuth
- Use NextAuth.js for authentication
- More secure for production use

---

## Security Considerations

### Current Implementation (Development)
⚠️ The current implementation is suitable for:
- Development and testing
- Internal use only
- Trusted environments
- Demo purposes

### NOT Suitable For:
❌ Public production deployments
❌ Sensitive data
❌ Multiple admin users
❌ Compliance requirements

### Recommended for Production:
1. **Use Environment Variables**: Don't hardcode credentials
2. **Hash Passwords**: Never store plain text passwords
3. **Add HTTPS**: Ensure secure connection
4. **Implement Rate Limiting**: Prevent brute force attacks
5. **Add Session Timeout**: Auto-logout after inactivity
6. **Use JWT Tokens**: More secure than localStorage
7. **Add Multi-Factor Authentication**: Extra security layer
8. **Log Access Attempts**: Monitor for suspicious activity

---

## Implementation Details

### Files Modified:
- `src/app/admin/page.tsx` - Added authentication logic

### State Management:
```typescript
const [isAuthenticated, setIsAuthenticated] = useState(false);
const [username, setUsername] = useState('');
const [password, setPassword] = useState('');
const [loginError, setLoginError] = useState('');
```

### Authentication Flow:
```
User visits /admin
  ↓
Check localStorage for existing session
  ↓
If authenticated → Show admin dashboard
If not → Show login form
  ↓
User enters credentials
  ↓
Validate against defaults
  ↓
If valid → Save to localStorage → Show dashboard
If invalid → Show error message
  ↓
User clicks Logout
  ↓
Clear localStorage → Show login form
```

---

## Testing the Authentication

### Test Valid Login:
1. Go to `/admin`
2. Enter: `admin` / `admin123`
3. Should see admin dashboard

### Test Invalid Login:
1. Go to `/admin`
2. Enter wrong credentials
3. Should see error: "Invalid username or password"

### Test Session Persistence:
1. Login successfully
2. Refresh the page
3. Should stay logged in

### Test Logout:
1. Click "Logout" button
2. Should redirect to login screen
3. Try to access admin features - should be blocked

---

## Deployment Notes

### For Vercel:

If using environment variables:
1. Add to Vercel Dashboard → Settings → Environment Variables:
   ```
   NEXT_PUBLIC_ADMIN_USERNAME=your_username
   NEXT_PUBLIC_ADMIN_PASSWORD=your_secure_password
   ```

2. Redeploy the application

### For Other Platforms:

Add the environment variables according to your platform's documentation.

---

## Troubleshooting

### Can't Login:
- Verify you're using correct credentials (`admin` / `admin123`)
- Check browser console for errors
- Clear browser cache and localStorage
- Try incognito/private mode

### Logged Out Unexpectedly:
- Check if localStorage was cleared
- Verify browser allows localStorage
- Check for JavaScript errors

### Login Loop:
- Clear browser localStorage manually:
  ```javascript
  localStorage.removeItem('adminAuthenticated');
  ```
- Refresh the page

---

## Future Enhancements

Potential improvements for production:

1. **User Management**
   - Multiple admin accounts
   - Role-based access control
   - User registration/invitation

2. **Enhanced Security**
   - Password hashing (bcrypt)
   - JWT tokens instead of localStorage
   - Session timeout (auto-logout)
   - CSRF protection
   - Rate limiting on login attempts

3. **Better UX**
   - "Remember Me" checkbox
   - Password reset functionality
   - Email verification
   - Activity logs

4. **Integration**
   - OAuth (Google, GitHub)
   - SSO (Single Sign-On)
   - LDAP/Active Directory
   - Database-backed authentication

---

## Summary

✅ **Current State**:
- Basic username/password authentication
- Default credentials: `admin` / `admin123`
- Session persistence via localStorage
- Logout functionality
- Clean login UI

⚠️ **For Production**:
- Change default credentials
- Use environment variables
- Implement proper password hashing
- Consider OAuth/SSO
- Add rate limiting
- Enable HTTPS

🎯 **Quick Start**:
1. Visit `/admin`
2. Login with `admin` / `admin123`
3. Create and manage contests
4. Logout when done

---

## Related Documentation

- `README.md` - Main project documentation
- `DEPLOYMENT.md` - Deployment instructions
- `TROUBLESHOOTING.md` - Common issues

---

**Security Reminder**: The current implementation is for development purposes. Implement proper authentication for production use!
