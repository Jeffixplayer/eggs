# Firebase Beállítási Útmutató / Firebase Setup Guide

## 🇭🇺 Magyar nyelvű útmutató

### 1. Firebase Projekt Létrehozása
1. Menj a [Firebase Console](https://console.firebase.google.com/) oldalra
2. Kattints a "Create a project" vagy "Projekt létrehozása" gombra
3. Add meg a projekt nevét (pl. "munkalapadatok" vagy "work-orders-app")
4. Válaszd ki, hogy szeretnél-e Google Analytics-et használni (opcionális)
5. Kattints a "Create project" gombra

### 2. Web App Hozzáadása
1. A Firebase projekt dashboardján kattints a `</>` (web) ikonra
2. Add meg az app nevét (pl. "Work Order App")
3. Kattints a "Register app" gombra
4. Másold ki a konfigurációs objektumot (firebaseConfig)

### 3. Firebase Konfigurációs Adatok Frissítése
Cseréld ki a `src/firebase.js` fájlban a placeholder értékeket a valódi konfigurációs adatokra:

```javascript
const firebaseConfig = {
  apiKey: "AIzaSyC...", // A valódi API kulcsod
  authDomain: "your-project.firebaseapp.com", // A projekt domain
  projectId: "your-project-id", // A projekt azonosító
  storageBucket: "your-project.appspot.com", // Storage bucket
  messagingSenderId: "123456789", // Messaging ID
  appId: "1:123456789:web:abc123def456" // App ID
};
```

### 4. Authentication Beállítása
1. A Firebase Console-ban menj az "Authentication" menüpontra
2. Kattints a "Get started" gombra
3. Menj a "Sign-in method" fülre
4. Engedélyezd az "Email/Password" bejelentkezést
5. Kattints a "Save" gombra

### 5. Firestore Database Beállítása
1. Menj a "Firestore Database" menüpontra
2. Kattints a "Create database" gombra
3. Válaszd a "Start in test mode" opciót (később frissítjük a biztonsági szabályokkal)
4. Válassz egy lokációt (pl. europe-west1)
5. Kattints a "Done" gombra

### 6. Biztonsági Szabályok Beállítása
1. A Firestore Database-ben menj a "Rules" fülre
2. Másold be a `firestore.rules` fájl tartalmát
3. Kattints a "Publish" gombra

### 7. Firebase Storage Beállítása
1. Menj a "Storage" menüpontra
2. Kattints a "Get started" gombra
3. Fogadd el az alapértelmezett biztonsági szabályokat (később frissítjük)
4. Válassz egy lokációt
5. A "Rules" fülön másold be a következő szabályokat:

```javascript
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /work-orders/{allPaths=**} {
      allow read, write: if request.auth != null;
    }
    match /{allPaths=**} {
      allow read, write: if false;
    }
  }
}
```

### 8. Alkalmazás Indítása
```bash
npm install
npm start
```

---

## 🇺🇸 English Setup Guide

### 1. Create Firebase Project
1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click "Create a project"
3. Enter project name (e.g., "work-orders-app")
4. Choose whether to enable Google Analytics (optional)
5. Click "Create project"

### 2. Add Web App
1. In the Firebase project dashboard, click the `</>` (web) icon
2. Enter app nickname (e.g., "Work Order App")
3. Click "Register app"
4. Copy the configuration object (firebaseConfig)

### 3. Update Firebase Configuration
Replace the placeholder values in `src/firebase.js` with your actual configuration:

```javascript
const firebaseConfig = {
  apiKey: "AIzaSyC...", // Your actual API key
  authDomain: "your-project.firebaseapp.com", // Your project domain
  projectId: "your-project-id", // Your project ID
  storageBucket: "your-project.appspot.com", // Storage bucket
  messagingSenderId: "123456789", // Messaging ID
  appId: "1:123456789:web:abc123def456" // App ID
};
```

### 4. Setup Authentication
1. Go to "Authentication" in Firebase Console
2. Click "Get started"
3. Go to "Sign-in method" tab
4. Enable "Email/Password" provider
5. Click "Save"

### 5. Setup Firestore Database
1. Go to "Firestore Database"
2. Click "Create database"
3. Choose "Start in test mode" (we'll update with security rules later)
4. Select a location (e.g., europe-west1)
5. Click "Done"

### 6. Setup Security Rules
1. In Firestore Database, go to "Rules" tab
2. Copy the content from `firestore.rules` file
3. Click "Publish"

### 7. Setup Firebase Storage
1. Go to "Storage"
2. Click "Get started"
3. Accept default security rules (we'll update later)
4. Choose a location
5. In the "Rules" tab, paste the following:

```javascript
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /work-orders/{allPaths=**} {
      allow read, write: if request.auth != null;
    }
    match /{allPaths=**} {
      allow read, write: if false;
    }
  }
}
```

### 8. Start the Application
```bash
npm install
npm start
```

## 🔐 Default Admin Account Setup

After setting up Firebase, you can create an admin account by:

1. Register a new user through the app
2. Go to Firestore Database in Firebase Console
3. Find the user document in the `users` collection
4. Edit the document and change `role` from "worker" to "admin"

## 📊 Data Collections

The app will automatically create these Firestore collections:

### `users` Collection
- `username`: string
- `email`: string
- `role`: "admin" | "worker"
- `status`: "active"
- `createdAt`: timestamp

### `workOrders` Collection
- `workOrderNumber`: string (auto-generated)
- `companyName`: string
- `contactPerson`: string
- `postalAddress`: string
- `phoneNumber`: string
- `title`: string
- `workDescription`: string
- `category`: string
- `priority`: "low" | "medium" | "high" | "urgent"
- `status`: "pending" | "in-progress" | "completed" | "cancelled"
- `images`: array of image objects
- `signature`: base64 string
- `createdAt`: timestamp
- `createdBy`: userId
- `submittedBy`: user display name

## 🛠️ Troubleshooting

### Common Issues:

1. **"Firebase: Error (auth/configuration-not-found)"**
   - Check that you've properly configured the firebaseConfig object
   - Ensure Authentication is enabled in Firebase Console

2. **"Missing or insufficient permissions"**
   - Verify that Firestore security rules are properly set
   - Check that the user has the correct role

3. **Image upload fails**
   - Ensure Firebase Storage is enabled
   - Check storage security rules
   - Verify that the storage bucket name is correct

4. **App doesn't load**
   - Check browser console for errors
   - Verify all Firebase services are enabled
   - Ensure npm packages are installed correctly

## 📱 Mobile Testing

For mobile testing:
1. The app is fully responsive
2. Test digital signature functionality on touch devices
3. Verify image upload works on mobile browsers
4. Check that all forms are accessible on small screens

## 🚀 Production Deployment

Before deploying to production:
1. Review and tighten Firestore security rules if needed
2. Set up proper error tracking (e.g., Sentry)
3. Configure environment variables for Firebase config
4. Set up Firebase Hosting for deployment
5. Configure proper backup strategies for Firestore

```bash
# Deploy to Firebase Hosting
npm run build
firebase deploy
```