#!/bin/bash

echo "🎮 Duolingo Duel - Start Script"
echo "=============================="
echo ""

# Check if backend and frontend directories exist

if [ ! -d "backend" ] || [ ! -d "frontend" ]; then
echo "❌ Backend or frontend directory not found!"
echo "Please run this script from the duolingo project root directory."
exit 1
fi

# Check if MongoDB is available (optional check)

echo "Checking prerequisites..."

# Check Node.js

if ! command -v node &> /dev/null; then
echo "❌ Node.js is not installed"
exit 1
fi

echo "✓ Node.js: $(node --version)"
echo "✓ npm: $(npm --version)"
echo ""

echo "📝 Setup Instructions:"
echo "====================="
echo ""
echo "1️⃣ MongoDB Setup"
echo " Option A: Local MongoDB"
echo " - Make sure MongoDB is running on localhost:27017"
echo " - Command: mongod"
echo ""
echo " Option B: MongoDB Atlas (Cloud)"
echo " - Get your connection string from: https://cloud.mongodb.com"
echo " - Update MONGODB_URI in backend/.env"
echo ""

echo "2️⃣ Backend Setup"
echo " - Navigate to: cd backend"
echo " - The .env file is already configured for local development"
echo " - Run: npm run seed (to populate questions)"
echo " - Then: npm run dev"
echo ""

echo "3️⃣ Frontend Setup"
echo " - Navigate to: cd frontend"
echo " - Run: npm run dev"
echo " - Open: http://localhost:5173"
echo ""

echo "4️⃣ Test the Application"
echo " - Sign up with test account"
echo " - Create 2 accounts to test matchmaking"
echo " - Click 'Find Match' to start a game"
echo ""

echo "📞 Troubleshooting"
echo "=================="
echo "Port 5000 already in use? Change PORT in backend/.env"
echo "Port 5173 already in use? Vite will auto-increment"
echo "MongoDB connection error? Check MONGODB_URI in backend/.env"
echo ""

echo "Ready to go! 🚀"
