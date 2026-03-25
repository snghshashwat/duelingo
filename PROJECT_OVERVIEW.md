# 🎮 Duolingo Duel - Project Overview

## Project Successfully Built! ✅

Your complete full-stack MVP for real-time language learning duels is ready!

---

## 📦 What's Included

### Backend (Node.js + Express + MongoDB)

- ✅ REST API with authentication
- ✅ WebSocket real-time game system (Socket.IO)
- ✅ ELO rating calculation
- ✅ MongoDB database models (User, Question, Match)
- ✅ JWT token-based authentication
- ✅ 20 pre-loaded English-Italian questions

### Frontend (React + Vite + Tailwind CSS)

- ✅ Authentication pages (Login/Signup)
- ✅ Dashboard with stats and leaderboard
- ✅ Real-time game screen with 10-second timer
- ✅ Results screen with rating changes
- ✅ Global leaderboard view
- ✅ Zustand state management
- ✅ Socket.IO client integration

---

## 🚀 Quick Start (5 Minutes)

### Step 1: Install Dependencies

```bash
chmod +x install.sh
./install.sh
```

### Step 2: Start MongoDB

```bash
# Option A: Local MongoDB
mongod

# Option B: Use MongoDB Atlas (update backend/.env with your URI)
```

### Step 3: Start Backend

```bash
cd backend
npm run seed    # Load questions into database
npm run dev     # Start server on port 5000
```

### Step 4: Start Frontend

```bash
cd frontend
npm run dev     # Start dev server on port 5173
```

### Step 5: Open in Browser

```
http://localhost:5173
```

---

## 🎯 How to Use

### Test the Application

1. **Sign Up**: Create 2 test accounts (e.g., "player1" and "player2")
2. **Login**: Login with first account
3. **Find Match**: Click "Find Match" button
4. **Open New Window**: Open another browser/incognito window
5. **Login Again**: Login with second account and click "Find Match"
6. **Play**: Both matches will connect and game starts
7. **Answer Questions**: You have 10 seconds per question
8. **See Results**: Final winner on results screen with rating changes

---

## 📊 Architecture Overview

```
User → Frontend (React) ↔ WebSocket (Socket.IO) ↔ Backend (Node.js)
                  ↓                                      ↓
            REST API (Axios)              Database (MongoDB)
```

### Key Features

#### 1. **Authentication Flow**

- User signs up/logs in
- Backend validates credentials and returns JWT token
- Frontend stores token in localStorage
- All API requests include JWT token

#### 2. **Matchmaking System**

- Players click "Find Match"
- Socket.IO adds them to a queue
- When 2 players are in queue, match is created
- Both players are notified via WebSocket

#### 3. **Game Flow**

- 5 questions are randomly selected
- Timer starts at 10 seconds per question
- Player selects an answer
- Score calculated (10 pts for correct + 5 pts for speed)
- Next question sent when both players answer
- After 5 questions → Results screen

#### 4. **Rating Update**

- ELO rating calculated after match
- Winner gains rating based on opponent strength
- Loser loses rating accordingly
- Match saved to history

---

## 📁 File Structure Explained

### Backend Core Files

```
backend/src/
├── index.js              # Express server setup & Socket.IO initialization
├── models/               # Database schemas
│   ├── User.js          # User profile, stats, match history
│   ├── Question.js      # Languages, correct answer, options
│   └── Match.js         # Match data, player answers, scores
├── controllers/         # Business logic for routes
│   ├── authController.js # JWT generation, password hashing
│   └── userController.js # Profile retrieval, leaderboard
├── routes/              # API endpoints
│   ├── auth.js          # /signup, /login
│   └── user.js          # /profile, /leaderboard
├── middleware/          # Middleware functions
│   └── auth.js          # JWT verification
├── websocket/           # Real-time game logic
│   ├── gameManager.js   # Match creation, answer validation, scoring
│   └── socketHandlers.js # Socket event handlers
└── utils/               # Helper functions
    ├── elo.js           # ELO rating calculations
    ├── questionHelper.js # Random question selection
    └── seedQuestions.js # Database population script
```

### Frontend Core Files

```
frontend/src/
├── main.jsx             # React entry point
├── App.jsx              # Router setup & auth check
├── index.css            # Global styles & Tailwind
├── pages/               # Full pages with routing
│   ├── LoginPage.jsx
│   ├── SignupPage.jsx
│   ├── DashboardPage.jsx
│   ├── GamePage.jsx     # Real-time game with timer & questions
│   ├── ResultsPage.jsx
│   └── LeaderboardPage.jsx
├── components/          # Reusable components
│   └── Navbar.jsx
├── store/               # Zustand state management
│   └── gameStore.js     # Auth store, Game store, Leaderboard store
└── api/                 # External communication
    ├── client.js        # Axios HTTP client with auth
    └── socket.js        # Socket.IO event handlers
```

---

## 🔌 WebSocket Events Reference

### Client Sends

```javascript
socket.emit("user_connected", { userId, username });
socket.emit("find_match", { userId, username });
socket.emit("submit_answer", { matchId, userId, questionIndex, answer });
```

### Server Sends

```javascript
socket.emit('match_found', { matchId, player1Username, player2Username, questions })
socket.emit('question_sent', { questionIndex, question, totalQuestions })
socket.emit('score_update', { isCorrect, points, player1Score, player2Score })
socket.emit('match_result', { player1: {...}, player2: {...} })
socket.emit('waiting_for_opponent', { message: '...' })
```

---

## 📚 Database Schema

### User

```javascript
{
  username: String,           // Unique username
  email: String,              // Unique email
  password: String,           // Hashed with bcryptjs
  rating: Number,             // ELO rating (default 1000)
  wins: Number,               // Total wins
  losses: Number,             // Total losses
  totalMatches: Number,       // W + L
  matchHistory: [{            // Last 50 matches
    opponentId: ObjectId,
    opponentUsername: String,
    won: Boolean,
    timestamp: Date
  }]
}
```

### Question

```javascript
{
  question: String,           // "How do you say X in Y?"
  correctAnswer: String,      // "Answer"
  options: [String],          // 4 options including correct answer
  languageDirection: String,  // "EN_IT" or "IT_EN"
  difficulty: String          // "easy", "medium", "hard"
}
```

### Match

```javascript
{
  player1: {
    userId: ObjectId,
    username: String,
    score: Number,
    answers: [{
      questionId: ObjectId,
      answer: String,
      isCorrect: Boolean,
      timeSpent: Number
    }]
  },
  player2: { ... },           // Same as player1
  winner: ObjectId,           // User ID of winner
  questions: [ObjectId],      // 5 question IDs
  status: String,             // "waiting", "in_progress", "completed"
  createdAt: Date,
  completedAt: Date
}
```

---

## 🎮 Game Mechanics Explained

### Scoring

- **Correct Answer**: 10 points
- **Speed Bonus**: +5 points if answered within 5 seconds
- **Max per Question**: 15 points
- **Max per Match**: 75 points

### Timer

- 10 seconds per question (JS `setInterval`)
- Timer counts down on both clients
- Auto-submits empty answer if timeout
- Moves to next question when both players submit

### ELO Calculation

```
Expected Score = 1 / (1 + 10^((opponentRating - yourRating) / 400))
New Rating = Current Rating + 32 × (Actual Score - Expected Score)
```

- Actual Score = 1 if win, 0 if loss
- K-factor = 32 (standard chess rating)

---

## 🔐 Security Features

- ✅ Passwords hashed with bcryptjs (10 salt rounds)
- ✅ JWT tokens with 7-day expiration
- ✅ Protected routes require authentication
- ✅ CORS configured for frontend origin
- ✅ Environment variables for secrets (not in code)

---

## 🚀 Deployment Guide

### Backend (Heroku)

```bash
# 1. Create Heroku app
heroku create your-app-name

# 2. Set config vars
heroku config:set MONGODB_URI=your_mongodb_uri
heroku config:set JWT_SECRET=your_secret_key
heroku config:set FRONTEND_URL=https://your-frontend.com

# 3. Deploy
git push heroku main
```

### Frontend (Vercel)

```bash
# 1. Push to GitHub
git push origin main

# 2. Import in Vercel dashboard
# - Select GitHub repo
# - Set build command: npm run build
# - Set output dir: dist

# 3. Set environment variables
# VITE_API_BASE_URL=https://your-backend.herokuapp.com
# VITE_SOCKET_URL=https://your-backend.herokuapp.com
```

---

## 🎓 Learning Resources

### Technologies Used

- **Socket.IO**: Real-time bidirectional communication
- **JWT**: Stateless authentication tokens
- **ELO Rating**: Chess-based competitive rating system
- **Zustand**: Lightweight state management
- **Vite**: Next-gen frontend tooling
- **Mongoose**: MongoDB object modeling

### Key Concepts Implemented

- REST API design
- WebSocket event handling
- State management in React
- Real-time synchronization
- User authentication & authorization
- Database modeling & validation
- Game engine basics (scoring, matchmaking)

---

## 🐛 Debugging Tips

### Backend Debugging

```bash
# Enable verbose logging
DEBUG=* npm run dev

# Test API endpoints
curl http://localhost:5000/api/health

# Check MongoDB connection
mongosh mongodb://localhost:27017/duolingo-duel
```

### Frontend Debugging

- Open Chrome DevTools (F12)
- Check Network tab for API calls
- Check Console for JavaScript errors
- React DevTools extension recommended

### WebSocket Debugging

```javascript
// In browser console
const socket = getSocket();
socket.on("*", (eventName, ...args) => {
  console.log("Event:", eventName, args);
});
```

---

## 📈 Performance Optimizations (Future)

- [ ] Database indexing on frequently queried fields
- [ ] Redis caching for leaderboard
- [ ] Question pagination/lazy loading
- [ ] Connection pooling for MongoDB
- [ ] Code splitting in React for faster loads
- [ ] Image optimization for avatars
- [ ] Compression for API responses

---

## 🎯 MVP Checklist

✅ Authentication (email/password)
✅ User profiles with stats
✅ Real-time matchmaking
✅ 5-question game with timer
✅ Multiple choice questions
✅ English ↔ Italian translations
✅ Score calculation with bonuses
✅ Winner determination
✅ ELO rating system
✅ Match history
✅ Global leaderboard
✅ WebSocket real-time updates
✅ Clean UI with Tailwind CSS
✅ Responsive design
✅ Environment configuration
✅ README with setup

---

## 🤝 Support & Next Steps

### If Something Doesn't Work

1. Check error messages in console
2. Verify all environment variables
3. Ensure MongoDB is running
4. Check port availability
5. Review backend/frontend logs

### To Add Features

- New question types: Add to `Question.js` model
- New languages: Seed more questions with `IT_EN` or other pairs
- Email verification: Add `nodemailer` to backend
- Password reset: Implement JWT reset tokens
- Social features: Add `Friend.js` model and routes

---

## 🎉 You're All Set!

Your real-time language learning duel platform is ready to demonstrate. The system handles:

✅ Real-time multiplayer gaming
✅ Competitive rating system
✅ Persistent data storage
✅ Scalable WebSocket architecture
✅ Modern React UI

This is a production-ready MVP that can be:

- Presented to stakeholders
- Extended with more features
- Deployed to production
- Scaled to thousands of users

Happy coding! 🚀

---

**Questions?** Check the README.md or SETUP.md files for more details.
