# Firebase Setup Guide for Ryan AI GPT 1

## Overview
This guide will help you set up Firebase Authentication and Firestore to enable Google Sign-In and cloud data sync for your Ryan AI application.

## Step 1: Create a Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click "Add project"
3. Enter project name: `ryan-ai-gpt` (or your preferred name)
4. Disable Google Analytics (optional)
5. Click "Create project"

## Step 2: Enable Authentication

1. In your Firebase project, click "Authentication" in the left sidebar
2. Click "Get started"
3. Click on "Sign-in method" tab
4. Enable "Google" sign-in provider:
   - Click on "Google"
   - Toggle "Enable"
   - Enter a support email
   - Click "Save"
5. Enable "Email/Password" sign-in provider:
   - Click on "Email/Password"
   - Toggle "Enable"
   - Click "Save"

## Step 3: Enable Firestore Database

1. Click "Firestore Database" in the left sidebar
2. Click "Create database"
3. Select "Start in test mode" (you can secure it later)
4. Choose your preferred location
5. Click "Enable"

## Step 4: Register Your Web App

1. In Project Overview, click the web icon `</>`
2. Enter app nickname: `Ryan AI Web`
3. Check "Also set up Firebase Hosting" (optional)
4. Click "Register app"
5. Copy the Firebase configuration object

## Step 5: Update Your Code

Replace the Firebase configuration in both `auth.html` and `index.html`:

```javascript
const firebaseConfig = {
    apiKey: "YOUR_API_KEY",
    authDomain: "YOUR_PROJECT_ID.firebaseapp.com",
    projectId: "YOUR_PROJECT_ID",
    storageBucket: "YOUR_PROJECT_ID.appspot.com",
    messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
    appId: "YOUR_APP_ID"
};
```

## Step 6: Configure Firestore Security Rules

In Firestore Database > Rules, update to:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
  }
}
```

This ensures users can only read/write their own data.

## Step 7: Test Your Application

1. Open `auth.html` in your browser
2. Click "Continue with Google"
3. Sign in with your Google account
4. You should be redirected to `index.html`
5. Your chats and settings will now sync to the cloud!

## Features Enabled

✅ **Google Sign-In** - One-click authentication
✅ **Email Sign-In** - Simple email-based auth
✅ **Cloud Sync** - All chats saved to Firestore
✅ **API Key Sync** - Settings synced across devices
✅ **Auto-Sync** - Data syncs every 30 seconds
✅ **Sign Out** - Secure logout with final sync

## Troubleshooting

### "Firebase: Error (auth/unauthorized-domain)"
- Go to Firebase Console > Authentication > Settings > Authorized domains
- Add your domain (e.g., `localhost` for local testing)

### "Missing or insufficient permissions"
- Check Firestore security rules
- Ensure user is authenticated

### Data not syncing
- Check browser console for errors
- Verify Firebase configuration is correct
- Ensure you're signed in

## Security Best Practices

1. **Never commit Firebase config with real keys to public repos**
2. **Use environment variables** for production
3. **Enable App Check** for additional security
4. **Review Firestore rules** regularly
5. **Monitor usage** in Firebase Console

## Next Steps

- Set up Firebase Hosting for deployment
- Add email verification
- Implement password reset
- Add user profile management
- Set up Firebase Analytics

---

**Need Help?** Check the [Firebase Documentation](https://firebase.google.com/docs)
