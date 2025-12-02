#!/bin/bash

echo "🧠 MindEase Setup Script"
echo "--------------------------------------"

# Check .env file
if [ ! -f "./backend/.env" ]; then
  echo "❌ ERROR: backend/.env not found."
  echo "➡️  Please create backend/.env and paste your environment variables."
  exit 1
fi

echo "✔ .env found."

# Install backend
echo "📦 Installing backend dependencies..."
cd backend
npm install

echo "✔ Backend dependencies installed."

# Install frontend
echo "📦 Installing frontend dependencies..."
cd ../frontend
npm install

echo "✔ Frontend dependencies installed."

# Return to root
cd ..

echo "🚀 Setup complete!"
echo "You can now run:"
echo "  Backend: cd backend && npm run dev"
echo "  Frontend: cd frontend && npm run dev"
