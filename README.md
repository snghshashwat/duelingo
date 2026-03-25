# Duolingo Duel - Real-time Language Learning MVP

A full-stack web application for real-time 1v1 language learning duels with two game modes, rich profiles, and scalable matchmaking.

## 🎯 Features

- **Real-time Matchmaking**: Find opponents and start playing immediately
- **Two Game Modes**:
  - `QUIZ_SPRINT`: 60-second continuous quiz race
  - `MATCH_PAIRS`: 5 rounds of EN/IT word matching (speed + accuracy)
- **ELO Rating System**: Dynamic rating based on opponent strength
- **Leaderboard**: Global rankings based on rating
- **Rich Profiles**: Bio, avatar URL, native language, learning language, country
- **Friend System**: Add friends, see online/offline presence, challenge directly
- **Session Persistence**: Users stay logged in on refresh with profile re-hydration
- **WebSocket Integration**: Real-time gameplay using Socket.IO
- **Match Safety**: Auto-abort for disconnect or 20s inactivity

## 🏗️ Tech Stack

### Backend

- **Node.js + Express** - REST API server
- **MongoDB + Mongoose** - Database
- **Socket.IO** - Real-time WebSocket communication
- **JWT** - Authentication tokens
- **bcryptjs** - Password hashing

### Frontend

- **React 18** - UI library
- **Vite** - Build tool and dev server
- **Zustand** - State management
- **Socket.IO Client** - WebSocket client
- **Axios** - HTTP client
- **Tailwind CSS** - Styling
- **React Router** - Page routing

## 📋 Prerequisites

- Node.js (v16 or higher)
- MongoDB (local or Atlas)
- npm or yarn

## 🚀 Quick Start

### 1. Backend Setup

```bash
cd backend

# Install dependencies
npm install

# Create .env file
cp .env.example .env

# Update .env with your MongoDB URI
# MONGODB_URI=mongodb://localhost:27017/duolingo-duel
# JWT_SECRET=your_super_secret_key
# PORT=5000

# Seed questions to database
npm run seed

# Start development server
npm run dev
```

Backend will be available at `http://localhost:5000`

### 2. Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Create .env file
cp .env.example .env

# Update .env if needed (default values work for local dev)
# VITE_API_BASE_URL=http://localhost:5000
# VITE_SOCKET_URL=http://localhost:5000

# Start dev server
npm run dev
```

Frontend will be available at `http://localhost:5173`

## 🎮 How to Play

1. **Sign Up / Login**: Create an account or login with existing credentials
2. **Dashboard**: View your rating and stats
3. **Find Match**: Click "Find Match" button to enter matchmaking queue
4. **Game Modes**:
   - **Quiz Sprint**: Solve as many questions as possible in 60 seconds
   - **Match Pairs**: Match English words to Italian words over 5 rounds
5. **Results Screen**: See winner, stats, rating changes, and mode-specific breakdown

## 🧙 API Endpoints

### Authentication

- `POST /api/auth/signup` - Create new user account
- `POST /api/auth/login` - Login user

### User

- `GET /api/user/profile` - Get logged-in user profile (requires auth)
- `PUT /api/user/profile` - Update profile details
- `GET /api/user/leaderboard?limit=20` - Get leaderboard
- `GET /api/user/friends` - Get friend list
- `GET /api/user/friends/presence` - Get online friends
- `POST /api/user/friends/add` - Add friend by username

## 🔌 WebSocket Events

### Client → Server

- `user_connected` - Register user socket
- `find_match` - Enter matchmaking queue with selected game mode
- `submit_answer` - Submit quiz sprint answer
- `pairs_attempt` - Submit match-the-following pair attempt
- `challenge_friend` / `challenge_response` - Friend duel flow

### Server → Client

- `match_found`, `match_countdown`
- `quiz_started`, `question_sent`
- `pairs_started`, `pairs_round_sent`, `pairs_attempt_result`
- `score_update`, `match_result`
- `match_aborted` (disconnect/inactivity)
- `waiting_for_opponent`

## 📊 Scoring System

### Quiz Sprint (60s)

- Correct answer: +1
- Incorrect answer: +0
- Next question appears immediately
- Winner: most correct answers in 60s

### Match Pairs (5 rounds)

- Correct pair: +1
- Wrong pair: -1
- Already matched words become locked/non-selectable
- Winner: fastest total solve time (score as tie-breaker)

## 🏆 ELO Rating

The system uses a standard ELO rating calculation:

- Base rating: 1000
- K-factor: 32
- Updates after each match based on match outcome and opponent strength
- No decay (ratings persist)

## 📁 Project Structure

```
duolingo/
├── backend/
│   ├── src/
│   │   ├── index.js           # Main server file
│   │   ├── models/            # Mongoose schemas
│   │   │   ├── User.js
│   │   │   ├── Question.js
│   │   │   └── Match.js
│   │   ├── routes/            # API routes
│   │   │   ├── auth.js
│   │   │   └── user.js
│   │   ├── controllers/       # Route handlers
│   │   │   ├── authController.js
│   │   │   └── userController.js
│   │   ├── middleware/        # Custom middleware
│   │   │   └── auth.js
│   │   ├── websocket/         # WebSocket handlers
│   │   │   ├── socketHandlers.js
│   │   │   └── gameManager.js
│   │   └── utils/             # Utility functions
│   │       ├── elo.js
│   │       ├── questionHelper.js
│   │       └── seedQuestions.js
│   ├── package.json
│   └── .env.example
│
├── frontend/
│   ├── src/
│   │   ├── main.jsx           # Entry point
│   │   ├── App.jsx            # Root component
│   │   ├── index.css          # Global styles
│   │   ├── pages/             # Page components
│   │   │   ├── LoginPage.jsx
│   │   │   ├── SignupPage.jsx
│   │   │   ├── DashboardPage.jsx
│   │   │   ├── GamePage.jsx
│   │   │   ├── ResultsPage.jsx
│   │   │   └── LeaderboardPage.jsx
│   │   ├── components/        # Reusable components
│   │   │   └── Navbar.jsx
│   │   ├── store/             # Zustand stores
│   │   │   └── gameStore.js
│   │   └── api/               # API clients & WebSocket
│   │       ├── client.js
│   │       └── socket.js
│   ├── index.html
│   ├── vite.config.js
│   ├── tailwind.config.cjs
│   ├── postcss.config.cjs
│   ├── package.json
│   └── .env.example
│
└── README.md (this file)
```

## 🐛 Common Issues

### MongoDB Connection Error

- Ensure MongoDB is running locally or update `MONGODB_URI` in backend `.env`
- For MongoDB Atlas, use: `mongodb+srv://username:password@cluster.mongodb.net/duolingo-duel`

### Port Already in Use

- Backend default: 5000 (change `PORT` in `.env`)
- Frontend default: 5173 (will auto-increment if in use)

### CORS Errors

- Ensure `FRONTEND_URL` in backend or Socket.IO CORS settings match your frontend URL
- Default: `http://localhost:5173`

### Socket.IO Connection Issues

- Verify both frontend and backend are running
- Check that `VITE_SOCKET_URL` matches backend URL in frontend `.env`

## 📝 Database Seeding

Questions are automatically seeded on server start, but to manually seed:

```bash
cd backend
npm run seed
```

This generates and seeds 400+ EN/IT translation questions from a large curated word bank.

## 🚀 Deployment (Low/No Cost)

### Option A: Free-ish managed stack

1. Frontend: Cloudflare Pages (free)
2. Backend: Render/Fly.io/Koyeb free tier
3. Database: MongoDB Atlas free M0 tier

Environment variables for backend:

- `MONGODB_URI`
- `JWT_SECRET`
- `PORT`
- `NODE_ENV=production`
- `FRONTEND_URL=https://your-frontend-domain.com`

Environment variables for frontend:

- `VITE_API_BASE_URL=https://your-backend-domain.com`
- `VITE_SOCKET_URL=https://your-backend-domain.com`

### Option B: Zero-provider-cost self-host

Use Docker Compose on your own machine/VM:

```bash
docker compose up --build -d
```

This project includes:

- [backend/Dockerfile](backend/Dockerfile)
- [frontend/Dockerfile](frontend/Dockerfile)
- [docker-compose.yml](docker-compose.yml)

### Multiplayer note

Single backend instance supports many simultaneous players and many concurrent matches. For horizontal scaling later, add a shared Socket.IO adapter (Redis) and sticky sessions.

## 🎯 Next Steps / Future Enhancements

- [ ] More language pairs (Spanish, French, German, etc.)
- [ ] Typing-based answer mode
- [ ] Rematch features
- [ ] Daily challenges
- [ ] Achievement badges
- [ ] Friends system
- [ ] Mobile app
- [ ] Analytics dashboard
- [ ] Admin panel for question management

## 📄 License

MIT License - Feel free to use this for learning or as a basis for other projects!

## 🤝 Contributing

Contributions are welcome! Feel free to submit issues and pull requests.

---

Built with ❤️ for language learners everywhere! 🌍
