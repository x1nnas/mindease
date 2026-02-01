# MindEase 🌿

> A Progressive Web Application for Emotional Wellness and Self-Reflection

[![TypeScript](https://img.shields.io/badge/TypeScript-5.9-blue.svg)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-19.2-blue.svg)](https://react.dev/)
[![Node.js](https://img.shields.io/badge/Node.js-Express-green.svg)](https://nodejs.org/)
[![MongoDB](https://img.shields.io/badge/MongoDB-9.0-green.svg)](https://www.mongodb.com/)
[![License](https://img.shields.io/badge/License-ISC-blue.svg)](LICENSE)

MindEase is a full-stack Progressive Web Application (PWA) designed as an emotional wellness companion. The application provides users with tools to track their mood, maintain a personal journal, and interact with an AI-powered chatbot named Serenity. Built with modern web technologies, MindEase emphasizes a calm, ambient user experience with full internationalization support for English and Portuguese (Portugal).

## ✨ Features

### Core Functionality
- **🔐 User Authentication**: Secure registration and login system with JWT tokens
- **😊 Mood Tracking**: Daily mood check-ins with visual feedback and historical data
- **📝 Journal Entries**: Private journaling with full CRUD operations
- **🤖 AI Chatbot (Serenity)**: Conversational AI assistant powered by OpenAI GPT for emotional support
- **📱 Progressive Web App**: Installable on mobile devices with offline capabilities
- **🌍 Internationalization**: Full support for English and Portuguese (Portugal)
- **📱 Responsive Design**: Optimized for mobile and desktop experiences
- **🎨 Ambient UI**: Calm, soothing interface with smooth animations

### Technical Features
- **Type-Safe Development**: Full TypeScript implementation across frontend and backend
- **Error Tracking**: Integrated Sentry for production error monitoring
- **Rate Limiting**: API protection against abuse
- **Daily Limits**: AI usage limits to manage costs
- **Secure Storage**: Encrypted password storage with bcrypt
- **CORS Protection**: Secure cross-origin resource sharing

## 🏗️ Architecture

### Frontend
- **Framework**: React 19.2 with TypeScript
- **Build Tool**: Vite 7.2 for fast development and optimized builds
- **Routing**: React Router DOM 7.10 for client-side navigation
- **State Management**: React Context API for global state
- **Styling**: Tailwind CSS 4.1 with custom animations
- **Error Handling**: React Error Boundary with Sentry integration

### Backend
- **Runtime**: Node.js with Express.js 4.21
- **Database**: MongoDB with Mongoose 9.0 for data modeling
- **Authentication**: JWT tokens for stateless authentication
- **AI Integration**: OpenAI API 6.9 for conversational AI
- **Security**: bcrypt for password hashing, rate limiting, CORS

### Deployment
- **Frontend**: Vercel (automatic deployments from main branch)
- **Backend**: Render (Node.js service with MongoDB Atlas)
- **Database**: MongoDB Atlas (cloud-hosted)

## 🚀 Quick Start

### Prerequisites
- Node.js 20.19+ or 22.12+
- npm or yarn
- MongoDB database (local or Atlas)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/mindease.git
   cd mindease
   ```

2. **Install dependencies**
   ```bash
   npm run install:all
   ```

3. **Set up environment variables**

   **Backend** (`backend/.env`):
   ```env
   PORT=5050
   MONGODB_URI=your_mongodb_connection_string
   JWT_SECRET=your_jwt_secret_key
   FRONTEND_URL=http://localhost:5173
   OPENAI_API_KEY=your_openai_api_key
   AI_ENABLED=true
   NODE_ENV=development
   ```

   **Frontend** (`frontend/.env`):
   ```env
   VITE_API_URL=http://localhost:5050
   VITE_SENTRY_DSN=your_sentry_dsn (optional)
   ```

4. **Start development servers**
   ```bash
   # Start both frontend and backend
   npm run dev

   # Or start separately:
   npm run dev:backend  # Backend on http://localhost:5050
   npm run dev:frontend # Frontend on http://localhost:5173
   ```

5. **Open your browser**
   - Frontend: http://localhost:5173
   - Backend API: http://localhost:5050/api

## 📁 Project Structure

```
mindease/
├── backend/                 # Backend API server
│   ├── src/
│   │   ├── ai/             # AI chatbot implementation
│   │   │   ├── controllers/
│   │   │   ├── prompts/    # AI prompt engineering
│   │   │   └── services/
│   │   ├── config/         # Database and environment config
│   │   ├── controllers/    # Request handlers
│   │   ├── middleware/     # Auth, rate limiting, daily limits
│   │   ├── models/         # Mongoose schemas
│   │   ├── routes/         # API route definitions
│   │   └── server.ts       # Express server setup
│   └── dist/              # Compiled JavaScript
│
├── frontend/               # React frontend application
│   ├── src/
│   │   ├── components/    # Reusable UI components
│   │   ├── contexts/       # React Context providers
│   │   ├── features/       # Feature-specific code (chat, etc.)
│   │   ├── i18n/          # Internationalization
│   │   ├── pages/         # Page components
│   │   ├── providers/     # Context providers
│   │   ├── services/      # API service layer
│   │   └── utils/         # Utility functions
│   └── public/            # Static assets
│
├── docs/                  # Project documentation
├── smoke-test.sh          # Automated testing script
└── PROJECT_REPORT.md      # Detailed project report
```

## 🧪 Testing

### Automated Smoke Tests
Run the comprehensive smoke test suite:

```bash
./smoke-test.sh
```

This script tests:
- ✅ Backend startup and MongoDB connection
- ✅ API endpoint availability
- ✅ Frontend build process
- ✅ User authentication flow
- ✅ Mood check-in functionality
- ✅ Journal entry operations
- ✅ AI chatbot integration

### Manual Testing
See `docs/SMOKE_TEST_README.md` for detailed manual testing procedures.

## 📚 API Documentation

### Authentication Endpoints

#### Register User
```http
POST /api/auth/register
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "securepassword",
  "firstName": "John"
}
```

#### Login
```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "securepassword"
}
```

### Mood Check-In Endpoints

#### Create/Update Mood Check-In
```http
POST /api/mood
Authorization: Bearer <token>
Content-Type: application/json

{
  "value": 75,
  "label": "Feeling Good"
}
```

#### Get Today's Mood
```http
GET /api/mood/today
Authorization: Bearer <token>
```

### Journal Endpoints

#### Create Journal Entry
```http
POST /api/journal
Authorization: Bearer <token>
Content-Type: application/json

{
  "content": "Today I felt...",
  "allowSerenityAccess": false
}
```

#### Get All Journal Entries
```http
GET /api/journal
Authorization: Bearer <token>
```

#### Update Journal Entry
```http
PUT /api/journal/:id
Authorization: Bearer <token>
Content-Type: application/json

{
  "content": "Updated content..."
}
```

### AI Chatbot Endpoints

#### Send Message to Serenity
```http
POST /api/serenity/chat
Authorization: Bearer <token>
Content-Type: application/json

{
  "message": "Hello, how are you?",
  "history": [...],
  "moodContext": "...",
  "language": "en"
}
```

## 🛠️ Development

### Code Style
- TypeScript strict mode enabled
- ESLint for code quality
- Consistent formatting with Prettier (recommended)

### Key Development Practices
- **Type Safety**: Full TypeScript coverage
- **Error Handling**: Comprehensive error boundaries and try-catch blocks
- **Security**: Password hashing, JWT tokens, rate limiting
- **Performance**: Code splitting, lazy loading, optimized builds
- **Accessibility**: Semantic HTML, ARIA labels where needed

### Building for Production

**Frontend:**
```bash
cd frontend
npm run build
```

**Backend:**
```bash
cd backend
npm run build
npm start
```

## 🌐 Deployment

### Frontend (Vercel)
1. Connect GitHub repository to Vercel
2. Set environment variables in Vercel dashboard
3. Deployments are automatic on push to main branch

### Backend (Render)
1. Create new Web Service on Render
2. Connect GitHub repository
3. Set build command: `cd backend && npm install && npm run build`
4. Set start command: `cd backend && npm start`
5. Configure environment variables

### Environment Variables for Production

**Backend (Render):**
- `PORT`: 5050 (or Render-assigned port)
- `MONGODB_URI`: MongoDB Atlas connection string
- `JWT_SECRET`: Strong secret key
- `FRONTEND_URL`: Production frontend URL
- `OPENAI_API_KEY`: OpenAI API key
- `AI_ENABLED`: true
- `NODE_ENV`: production

**Frontend (Vercel):**
- `VITE_API_URL`: Production backend URL
- `VITE_SENTRY_DSN`: Sentry DSN (optional)

## 🔒 Security Features

- **Password Hashing**: bcrypt with salt rounds
- **JWT Authentication**: Stateless token-based auth
- **Rate Limiting**: Prevents API abuse
- **CORS Protection**: Configured for specific origins
- **Input Validation**: Server-side validation for all inputs
- **Error Sanitization**: No sensitive data in error messages
- **Daily Limits**: AI usage limits to prevent abuse

## 📱 Progressive Web App

MindEase is a fully functional PWA:
- **Installable**: Add to home screen on mobile devices
- **Offline Support**: Service worker for offline functionality
- **App-like Experience**: Full-screen mode, custom icons
- **Responsive**: Optimized for all screen sizes

## 🌍 Internationalization

Full i18n support for:
- **English (en)**: Default language
- **Portuguese - Portugal (pt)**: Complete translation

Language switching is available throughout the application.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the ISC License.

## 👤 Author

**José Ferreira**

- GitHub: [@yourusername](https://github.com/yourusername)
- Project Link: [https://github.com/yourusername/mindease](https://github.com/yourusername/mindease)

## 🙏 Acknowledgments

- OpenAI for GPT API access
- React and TypeScript communities
- MongoDB for database solutions
- Vercel and Render for hosting platforms
- All open-source contributors whose libraries made this project possible

## 📖 Additional Documentation

- [Project Report](./PROJECT_REPORT.md) - Comprehensive project documentation
- [Production Audit](./docs/PRODUCTION_AUDIT.md) - Production readiness checklist
- [Code Review](./docs/CODE_REVIEW.md) - Code quality and best practices
- [Smoke Test Guide](./docs/SMOKE_TEST_README.md) - Testing procedures

---

**Built with ❤️ for emotional wellness**
