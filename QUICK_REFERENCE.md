# Quick Reference Guide

## 🚀 Start Development (60 seconds)

```bash
# Terminal 1 - Backend
cd backend
npm run dev

# Terminal 2 - Frontend
cd frontend
npm run dev

# Terminal 3 (Optional) - MongoDB
mongod
```

Visit: `http://localhost:5173`

---

## 📝 Command Reference

### Backend

```bash
npm install        # Install dependencies
npm run dev        # Start with nodemon (auto-reload)
npm start          # Start production server
npm run seed       # Populate questions database
```

### Frontend

```bash
npm install        # Install dependencies
npm run dev        # Start dev server
npm run build      # Build for production
npm run preview    # Preview production build
```

---

## 🔌 Key Files to Modify

### To Add Questions

Edit: `backend/src/utils/seedQuestions.js`

- Add more entries to the `questions` array
- Run: `npm run seed` to update database

### To Change Game Rules

Edit: `backend/src/websocket/gameManager.js`

- Scoring logic: Line ~81 (`let points = 0`)
- Time limit: Line ~20 (5 in questions)
- Questions per match: Line ~30 (`getRandomQuestions(5)`)

### To Modify Frontend Styling

Edit: `frontend/tailwind.config.cjs` or `frontend/src/index.css`

- Colors defined in Tailwind config
- Global styles in index.css

### To Add New Pages

1. Create file: `frontend/src/pages/NewPage.jsx`
2. Add route in `frontend/src/App.jsx`
3. Link in navigation

---

## 📊 Ports & URLs

| Service  | Port  | URL                       |
| -------- | ----- | ------------------------- |
| Backend  | 5000  | http://localhost:5000     |
| Frontend | 5173  | http://localhost:5173     |
| MongoDB  | 27017 | mongodb://localhost:27017 |
| API      | 5000  | http://localhost:5000/api |

---

## 🧪 Test Scenarios

### Test 1: Create Account & Login

1. Sign up with email/password
2. Login with same credentials
3. Check profile shows up

### Test 2: Matchmaking

1. Open 2 browser windows
2. Create 2 accounts
3. Both click "Find Match"
4. Should connect automatically

### Test 3: Game Flow

1. Both players answer all 5 questions
2. Verify scores update correctly
3. Check winner determined
4. Verify rating changes

### Test 4: Leaderboard

1. Play multiple matches
2. Check leaderboard updates
3. Verify sorting by rating

---

## 🐛 Common Issues & Fixes

| Issue                    | Solution                                           |
| ------------------------ | -------------------------------------------------- |
| MongoDB connection error | Ensure `mongod` is running or update `MONGODB_URI` |
| CORS error               | Check `FRONTEND_URL` in backend `.env`             |
| Socket.IO not connecting | Verify both ports are accessible                   |
| Port already in use      | Change PORT in `.env` or kill process              |
| Authentication fails     | Check JWT_SECRET is set in `.env`                  |
| Questions not loading    | Run `npm run seed` in backend                      |
| Styling looks broken     | Install Tailwind: `npm install tailwindcss`        |

---

## 💀 Useful Mongo Commands

```bash
# Connect to local MongoDB
mongosh

# Use duolingo database
use duolingo-duel

# View all users
db.users.find()

# View all questions
db.questions.find()

# View all matches
db.matches.find()

# Count documents
db.users.countDocuments()

# Delete all data (careful!)
db.users.deleteMany({})

# Exit
exit
```

---

## 🔑 Environment Variables Needed

### Backend `.env`

```
MONGODB_URI=mongodb://localhost:27017/duolingo-duel
JWT_SECRET=your_super_secret_key
PORT=5000
NODE_ENV=development
FRONTEND_URL=http://localhost:5173
```

### Frontend `.env`

```
VITE_API_BASE_URL=http://localhost:5000
VITE_SOCKET_URL=http://localhost:5000
```

---

## 📦 Dependencies Summary

### Backend

- `express` - Web framework
- `mongoose` - MongoDB ORM
- `socket.io` - WebSocket library
- `jsonwebtoken` - JWT tokens
- `bcryptjs` - Password hashing
- `dotenv` - Environment variables
- `cors` - Cross-origin requests

### Frontend

- `react` - UI library
- `react-router-dom` - Routing
- `zustand` - State management
- `socket.io-client` - WebSocket client
- `axios` - HTTP client
- `tailwindcss` - Styling

---

## 🚀 Deploy Checklist

- [ ] Set strong `JWT_SECRET` in production
- [ ] Use MongoDB Atlas for production database
- [ ] Set `NODE_ENV=production`
- [ ] Update `FRONTEND_URL` to production domain
- [ ] Update `VITE_API_BASE_URL` to production API
- [ ] Update `VITE_SOCKET_URL` to production backend
- [ ] Enable HTTPS for Socket.IO
- [ ] Set up monitoring/logging
- [ ] Test all features before deploying
- [ ] Backup database before deployment

---

## 📱 Frontend Component Tree

```
App
├── LoginPage
├── SignupPage
├── DashboardPage
│   └── Navbar
├── GamePage
│   └── (Timer, Question, Options)
├── ResultsPage
├── LeaderboardPage
│   └── Navbar
```

---

## 🎯 Key Algorithms

### ELO Rating

```javascript
expectedScore = 1 / (1 + Math.pow(10, (opponentRating - yourRating) / 400));
newRating = currentRating + 32 * (actualScore - expectedScore);
```

### Score Calculation

```javascript
let points = 0;
if (isCorrect) {
  points = 10;
  if (timeSpent < 5000) {
    points += 5;
  }
}
```

### Matchmaking

1. User joins queue with socket ID
2. Server checks if opponent exists
3. If yes: Create match, send to both
4. If no: Keep in queue, wait for next user

---

## 📚 Useful Links

- [Socket.IO Docs](https://socket.io/docs/)
- [JWT.io](https://jwt.io/)
- [MongoDB Docs](https://docs.mongodb.com/)
- [React Docs](https://react.dev/)
- [Tailwind CSS](https://tailwindcss.com/)
- [Zustand](https://github.com/pmndrs/zustand)

---

**Last Updated**: March 24, 2026
**Version**: 1.0.0 MVP
