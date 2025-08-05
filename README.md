# AuctionHub - Mobile Auction App

A full-stack auction application built with React Native (frontend) and Node.js (backend).

## Features

- User registration and authentication
- Upload items for auction with photos
- Browse and search auction items
- Place bids on items
- View your listings and bid history
- Real-time bid updates



**Frontend:**
- React Native with Expo
- React Navigation
- Firebase Authentication
- Image picker for photos

**Backend:**
- Node.js with Express
- MongoDB database
- RESTful API

## Setup Instructions

### Prerequisites
- Node.js (version 16 or higher)
- MongoDB Atlas account (free)
- Expo CLI
- iOS Simulator or Android device

### Backend Setup

1. Navigate to backend folder:
   ```bash
   cd backend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create `.env` file in backend folder:
   ```
   MONGODB_URI=your_mongodb_connection_string
 
   PORT=5000
   NODE_ENV=development
   ```

4. Start the backend server:
   ```bash
   npm run dev
   ```

   You should see: "Server running on http://localhost:5000"

### Frontend Setup

1. Navigate to frontend folder:
   ```bash
   cd frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   npx expo install react-native-screens react-native-safe-area-context @react-native-async-storage/async-storage expo-image-picker
   ```

3. Update API configuration:
   - Open `src/services/api.js`
   - Replace the IP address with your computer's IP address
   - Find your IP: `ipconfig` (Windows) or `ifconfig` (Mac/Linux)

4. Start the Expo development server:
   ```bash
   npx expo start
   ```

5. Scan QR code with Expo Go app or press 'w' for web version

## Project Structure

```
auction-app/
├── frontend/           # React Native app
│   ├── src/
│   │   ├── screens/    # App screens
│   │   ├── components/ # Reusable components
│   │   ├── context/    # State management
│   │   └── services/   # API calls
│   └── App.js
├── backend/            # Node.js API
│   ├── src/
│   │   ├── models/     # Database models
│   │   ├── routes/     # API endpoints
│   │   └── controllers/# Business logic
│   └── server.js
└── README.md
```

## User Flow

1. **Registration**: Create account with email verification
2. **Browse**: View available auction items
3. **Upload**: List your items for auction
4. **Bid**: Place bids on items you want
5. **Manage**: Track your items and bids in profile

## API Endpoints

### Authentication
- `POST /api/auth/signup` - Register new user
- `POST /api/auth/signin` - User login
- `POST /api/auth/verify-email` - Verify email address

### Items
- `GET /api/items` - Get all auction items
- `POST /api/items` - Create new auction item
- `GET /api/items/:id` - Get specific item

### Bids
- `POST /api/bids` - Place a bid
- `GET /api/bids/user/:id` - Get user's bids

## Database Setup

1. Create MongoDB Atlas account at https://cloud.mongodb.com
2. Create a new cluster (free tier available)
3. Create database user with read/write permissions
4. Get connection string and add to `.env` file
5. Whitelist your IP address in Network Access

## Troubleshooting

**Backend won't start:**
- Check MongoDB connection string
- Ensure all environment variables are set
- Verify Node.js is installed

**Frontend connection issues:**
- Update IP address in `api.js`
- Check that backend server is running
- Ensure phone/simulator is on same network

**Build errors:**
- Clear Expo cache: `npx expo start --clear`
- Delete node_modules and reinstall: `rm -rf node_modules && npm install`

## Development

To modify the app:
1. Frontend changes: Edit files in `frontend/src/`
2. Backend changes: Edit files in `backend/src/`
3. Database models: Check `backend/src/models/`

The app uses React Context for state management and Axios for API calls.





