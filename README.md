# MyWeightTracker

## Tracking your weight should be easy.

### Overview
A minimalist weight tracking application that allows users to:
- Sign in with Google
- Set initial weight and goal weight
- Track daily weight entries
- Visualize progress through charts and progress bars
- Toggle between lb/kg units
- Manage weight history and settings

### Tech Stack
1. **Frontend Framework**
   - Vue 3 with Composition API
   - TypeScript
   - Vue Router for navigation
   - Tailwind CSS for styling

2. **Backend/Infrastructure**
   - Firebase Authentication (Google Sign-in)
   - Firebase Firestore (Database)
   - Firebase Hosting
   - Firebase Analytics

3. **Development Tools**
   - Vite as build tool
   - ESLint for linting
   - Prettier for code formatting
   - Playwright for E2E testing
   - Vitest for unit testing

### Key Features

1. **Authentication**
   - Google OAuth integration
   - Protected routes
   - Session management

2. **Weight Management**
   - Add/update weight entries
   - Set/update goal weight
   - Set/update starting weight
   - Unit conversion (lb/kg)

3. **Data Visualization**
   - Progress chart using Chart.js
   - Progress bar showing goal completion
   - Current/Start/Goal weight display

4. **Settings**
   - Toggle measurement units
   - Delete weight history
   - Update goal weight
   - Update starting weight
   - Toggle between dark and light themes

### Setup Instructions

1. **Prerequisites**
   - Node.js installed
   - Firebase account
   - Google Cloud Platform project with OAuth configured

2. **Installation**
```bash
# Clone the repository
git clone https://github.com/steven-the-qa/social-qa-weight-tracker
cd weight-tracker

# Install dependencies
npm install

# Set up environment variables
# Create a .env file with Firebase config

# Run development server
npm run dev

# Build for production
npm run build

# Deploy to Firebase
npm run deploy
```

3. **Firebase Setup**
   - Create a new Firebase project
   - Enable Authentication with Google provider
   - Set up Firestore database
   - Configure Firebase hosting
   - Update Firebase config in `src/firebase.ts`

### Project Structure
The application follows a standard Vue.js project structure with:
- Components in `src/components/`
- Views in `src/views/`
- Router configuration in `src/router/`
- Firebase configuration in `src/firebase.ts`
- Global styles in `src/index.css`

### Testing
The project includes:
- Unit testing setup with Vitest
- E2E testing setup with Playwright
- Run tests with:
```bash
# Unit tests
npm run test:unit

# E2E tests
npm run test:e2e
```

### Deployment
The application is configured for Firebase Hosting deployment:
```bash
npm run deploy
```

This will build the application and deploy it to Firebase Hosting.