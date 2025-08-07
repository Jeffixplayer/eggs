# Work Order Management App

A modern, responsive work order management application built with React, Firebase, and Tailwind CSS. This application allows users to create, manage, and track work orders with a clean and intuitive interface.

## Features

- 🔐 **User Authentication** - Secure login and registration using Firebase Auth
- 📋 **Work Order Management** - Create, edit, delete, and view work orders
- 🎨 **Modern UI** - Beautiful, responsive design with Tailwind CSS
- ⚡ **Real-time Updates** - Live data synchronization with Firestore
- 📱 **Mobile Responsive** - Works seamlessly on desktop and mobile devices
- 🚪 **Navigation** - Sidebar navigation with multiple sections
- 🏷️ **Priority & Status Tracking** - Color-coded priority and status indicators

## Technology Stack

- **Frontend**: React 18
- **Backend**: Firebase (Authentication, Firestore Database)
- **Styling**: Tailwind CSS
- **Routing**: React Router DOM
- **State Management**: React Hooks
- **Icons**: Emoji icons for navigation

## Project Structure

```
my-workorder-app/
├── public/
│   └── index.html
├── src/
│   ├── components/
│   │   ├── Sidebar.js              # Navigation sidebar
│   │   ├── RegistrationForm.js     # User registration form
│   │   └── WorkOrderForm.js        # Create/edit work orders
│   ├── pages/
│   │   ├── LoginPage.js            # Login page
│   │   ├── RegisterPage.js         # Registration page
│   │   └── Dashboard.js            # Main dashboard
│   ├── firebase.js                 # Firebase configuration
│   ├── App.js                      # Main app component
│   ├── index.js                    # App entry point
│   └── index.css                   # Global styles
├── tailwind.config.js              # Tailwind configuration
├── package.json                    # Dependencies and scripts
└── README.md                       # This file
```

## Prerequisites

Before running this application, make sure you have:

- Node.js (version 14 or higher)
- npm or yarn package manager
- A Firebase project with Authentication and Firestore enabled

## Setup Instructions

### 1. Clone the Repository

```bash
cd my-workorder-app
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Firebase Configuration

1. Create a new Firebase project at [Firebase Console](https://console.firebase.google.com/)
2. Enable Authentication with Email/Password provider
3. Create a Firestore database
4. Get your Firebase configuration object
5. Update `src/firebase.js` with your Firebase configuration:

```javascript
const firebaseConfig = {
  apiKey: "your-api-key",
  authDomain: "your-project-id.firebaseapp.com",
  projectId: "your-project-id",
  storageBucket: "your-project-id.appspot.com",
  messagingSenderId: "your-sender-id",
  appId: "your-app-id"
};
```

### 4. Firestore Security Rules

Add these security rules to your Firestore database:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Users can read/write their own user document
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    
    // Authenticated users can read/write work orders
    match /workOrders/{document} {
      allow read, write: if request.auth != null;
    }
  }
}
```

### 5. Run the Application

```bash
npm start
```

The application will open in your browser at `http://localhost:3000`.

## Available Scripts

- `npm start` - Runs the app in development mode
- `npm run build` - Builds the app for production
- `npm test` - Launches the test runner
- `npm run eject` - Ejects from Create React App (one-way operation)

## Features Overview

### Authentication
- User registration with email/password
- Secure login functionality
- Protected routes requiring authentication
- User profile information stored in Firestore

### Work Order Management
- Create new work orders with detailed information
- Edit existing work orders
- Delete work orders with confirmation
- Real-time updates across all connected clients
- Priority levels: Low, Medium, High, Urgent
- Status tracking: Pending, In Progress, Completed, Cancelled
- Assignment to team members
- Due date tracking
- Location and materials specification

### User Interface
- Clean, modern design with Tailwind CSS
- Responsive layout for all device sizes
- Color-coded priority and status indicators
- Loading states and error handling
- Form validation and user feedback

## Data Structure

### Work Order Object
```javascript
{
  id: "auto-generated",
  title: "string",
  description: "string",
  priority: "low|medium|high|urgent",
  status: "pending|in-progress|completed|cancelled",
  assignedTo: "string",
  dueDate: "datetime",
  category: "maintenance|repair|installation|inspection|cleaning|other",
  location: "string",
  estimatedHours: "number",
  materials: "string",
  createdAt: "timestamp",
  createdBy: "userId",
  updatedAt: "timestamp",
  updatedBy: "userId"
}
```

### User Object
```javascript
{
  id: "userId",
  username: "string",
  email: "string",
  createdAt: "timestamp",
  role: "user"
}
```

## Customization

### Adding New Fields
To add new fields to work orders:
1. Update the form in `WorkOrderForm.js`
2. Modify the display logic in `Dashboard.js`
3. Update the data structure documentation

### Styling Changes
The app uses Tailwind CSS. You can:
- Modify colors in `tailwind.config.js`
- Update component styles by changing Tailwind classes
- Add custom CSS in `src/index.css`

### Adding New Sections
To add new sections to the sidebar:
1. Add the section to the `menuItems` array in `Sidebar.js`
2. Create a render function in `Dashboard.js`
3. Update the switch statement in `renderContent()`

## Deployment

### Build for Production
```bash
npm run build
```

### Deploy to Firebase Hosting
```bash
npm install -g firebase-tools
firebase login
firebase init hosting
firebase deploy
```

## Troubleshooting

### Common Issues

1. **Firebase Configuration Error**
   - Make sure all Firebase config values are correct
   - Ensure Authentication and Firestore are enabled

2. **Permission Denied**
   - Check Firestore security rules
   - Verify user is authenticated

3. **Styling Issues**
   - Make sure Tailwind CSS is properly configured
   - Check that `@tailwind` directives are in `index.css`

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is open source and available under the [MIT License](LICENSE).

## Support

For questions or issues, please:
- Check the troubleshooting section
- Review Firebase documentation
- Create an issue in the repository