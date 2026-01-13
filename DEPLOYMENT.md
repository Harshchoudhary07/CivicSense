# 🚀 Civic Sense - Deployment Guide

## Quick Setup (5 Minutes)

### Step 1: Firebase Configuration ✅ DONE
Your Firebase is already configured in `.env` file.

### Step 2: Enable Email/Password Authentication

**IMPORTANT**: You need to enable Email/Password authentication in Firebase Console:

1. Go to [Firebase Console](https://console.firebase.google.com)
2. Select your project: `sfsfssf-8246e`
3. Click **Authentication** in the left sidebar
4. Click **Sign-in method** tab
5. Click **Email/Password**
6. Toggle **Enable** to ON
7. Click **Save**

### Step 3: Create Demo Officer Account

In Firebase Console → Authentication → Users:
1. Click **Add user**
2. Email: `officer@demo.com`
3. Password: `demo123`
4. Click **Add user**
5. Click on the new user
6. Go to Firestore Database
7. Create a document in `users` collection:
   ```
   Document ID: <the user's UID from Authentication>
   Fields:
     - email: "officer@demo.com"
     - role: "officer"
     - name: "Demo Officer"
     - createdAt: <current timestamp>
   ```

### Step 4: Deploy to Vercel (Recommended)

#### Option A: Deploy via Vercel CLI
```bash
# Install Vercel CLI
npm install -g vercel

# Build the project
npm run build

# Deploy
vercel --prod
```

#### Option B: Deploy via Vercel Dashboard
1. Go to [vercel.com](https://vercel.com)
2. Click **Add New Project**
3. Import your GitHub repository (or upload the project)
4. Framework Preset: **Vite**
5. Add Environment Variables:
   - `VITE_FIREBASE_API_KEY`: AIzaSyDs3vsQqvSQ4J4Jic3rAfRh7Ck35hqMYZc
   - `VITE_FIREBASE_AUTH_DOMAIN`: sfsfssf-8246e.firebaseapp.com
   - `VITE_FIREBASE_PROJECT_ID`: sfsfssf-8246e
   - `VITE_FIREBASE_STORAGE_BUCKET`: sfsfssf-8246e.firebasestorage.app
   - `VITE_FIREBASE_MESSAGING_SENDER_ID`: 852604461242
   - `VITE_FIREBASE_APP_ID`: 1:852604461242:web:bbb3e6085277f60e5aa283
6. Click **Deploy**
7. Wait 2-3 minutes
8. Your app will be live at `https://your-project.vercel.app`

### Step 5: Deploy to Netlify (Alternative)

```bash
# Install Netlify CLI
npm install -g netlify-cli

# Build the project
npm run build

# Deploy
netlify deploy --prod --dir=dist
```

Or use Netlify Dashboard:
1. Go to [netlify.com](https://netlify.com)
2. Drag and drop the `dist` folder
3. Add environment variables in Site Settings

### Step 6: Deploy to Firebase Hosting

```bash
# Install Firebase CLI
npm install -g firebase-tools

# Login to Firebase
firebase login

# Initialize hosting
firebase init hosting

# Build the project
npm run build

# Deploy
firebase deploy --only hosting
```

## Testing the Deployed App

### Test Citizen Flow:
1. Visit your deployed URL
2. Click "Get Started Now"
3. Sign up with email/password
4. Report an issue
5. Check "My Complaints"
6. See notifications (bell icon)

### Test Officer Flow:
1. Go to `/officer/login`
2. Login with `officer@demo.com` / `demo123`
3. View assigned complaints
4. Update status

### Test Admin Flow:
1. Go to `/admin/dashboard`
2. View analytics
3. Manage departments

## Features Implemented ✅

- ✅ Landing Page with hero section
- ✅ User Authentication (Email, Phone, Guest)
- ✅ Report Issues with photo upload & GPS
- ✅ My Complaints with timeline
- ✅ Nearby Issues map view
- ✅ Officer Dashboard
- ✅ Admin Dashboard & Analytics
- ✅ **NEW: Real-time Notifications**
- ✅ **NEW: Toast Notifications**
- ✅ **NEW: Notification Center**
- ✅ Auto-assignment to departments
- ✅ Priority calculation engine
- ✅ Feedback system

## Troubleshooting

### Issue: "auth/configuration-not-found"
**Solution**: Enable Email/Password authentication in Firebase Console (see Step 2)

### Issue: Admin pages stuck loading
**Solution**: Make sure you're logged in and Firebase is properly configured

### Issue: Notifications not working
**Solution**: Check Firestore rules allow read/write to `notifications` collection

### Issue: Build fails
**Solution**: 
```bash
# Clear cache and reinstall
rm -rf node_modules package-lock.json
npm install
npm run build
```

## Firestore Security Rules

Add these rules in Firebase Console → Firestore Database → Rules:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Users collection
    match /users/{userId} {
      allow read, write: if request.auth != null;
    }
    
    // Complaints collection
    match /complaints/{complaintId} {
      allow read: if request.auth != null;
      allow create: if request.auth != null;
      allow update: if request.auth != null;
    }
    
    // Notifications collection
    match /notifications/{notificationId} {
      allow read: if request.auth != null && resource.data.userId == request.auth.uid;
      allow create: if request.auth != null;
      allow update: if request.auth != null && resource.data.userId == request.auth.uid;
    }
    
    // Departments collection
    match /departments/{departmentId} {
      allow read: if request.auth != null;
      allow write: if request.auth != null;
    }
  }
}
```

## Need Help?

- Check the browser console for errors
- Verify Firebase configuration in `.env`
- Make sure all Firebase services are enabled
- Check Firestore security rules

---

**Built with ❤️ for better communities**
