# MindEase - Project Report

## Executive Summary

MindEase is a full-stack Progressive Web Application (PWA) designed as an emotional wellness companion. The application provides users with tools to track their mood, maintain a personal journal, and interact with an AI-powered chatbot named Serenity. Built with modern web technologies, MindEase emphasizes a calm, ambient user experience with full internationalization support for English and Portuguese (Portugal).

---

## 1. Project Overview

### 1.1 Purpose
MindEase serves as a digital wellness platform that helps users:
- Track daily emotional states through mood check-ins
- Maintain a private journal for thoughts and reflections
- Engage in therapeutic conversations with an AI companion
- Monitor their emotional patterns over time

### 1.2 Target Audience
- Individuals seeking emotional wellness support
- Users looking for a private, non-judgmental space for self-reflection
- Portuguese and English-speaking users
- Mobile-first users who prefer app-like experiences

### 1.3 Key Features
1. **User Authentication**: Secure registration and login system
2. **Mood Tracking**: Daily mood check-ins with visual feedback
3. **Journal Entries**: Private journaling with full CRUD operations
4. **AI Chatbot (Serenity)**: Conversational AI assistant for emotional support
5. **Progressive Web App**: Installable on mobile devices with offline capabilities
6. **Internationalization**: Full support for English and Portuguese (Portugal)
7. **Responsive Design**: Optimized for mobile and desktop experiences

---

## 2. Technology Stack

### 2.1 Frontend Technologies

#### Core Framework
- **React 19.2.0**: Modern UI library for building component-based interfaces
- **TypeScript 5.9.3**: Type-safe JavaScript for improved code quality and maintainability
- **Vite 7.2.4**: Fast build tool and development server with HMR (Hot Module Replacement)

#### Routing & State Management
- **React Router DOM 7.10.0**: Client-side routing for single-page application navigation
- **React Context API**: Global state management for authentication and language preferences
- **React Hooks**: useState, useEffect, useRef for component state and lifecycle management

#### Styling & UI
- **Tailwind CSS 4.1.17**: Utility-first CSS framework for rapid UI development
- **PostCSS 8.5.6**: CSS processing with autoprefixer for cross-browser compatibility
- **Custom CSS Animations**: Keyframe animations for smooth transitions and micro-interactions

#### Additional Libraries
- **date-fns 3.6.0**: Date manipulation and formatting utilities
- **qrcode.react 4.2.0**: QR code generation for desktop entry point
- **react-error-boundary 6.1.0**: Error boundary implementation for graceful error handling
- **@sentry/react 10.35.0**: Error tracking and monitoring in production

#### Build & Development Tools
- **Vite Plugin React SWC**: Fast React compilation using SWC
- **ESLint 9.39.1**: Code linting with TypeScript and React plugins
- **TypeScript ESLint**: TypeScript-specific linting rules

### 2.2 Backend Technologies

#### Core Framework
- **Node.js**: JavaScript runtime environment
- **Express.js 4.21.2**: Web application framework for RESTful API development
- **TypeScript 5.9.3**: Type-safe backend development

#### Database
- **MongoDB**: NoSQL document database for flexible data storage
- **Mongoose 9.0.0**: MongoDB object modeling library with schema validation

#### Authentication & Security
- **JSON Web Tokens (JWT) 9.0.2**: Stateless authentication tokens
- **bcrypt 6.0.0**: Password hashing for secure credential storage
- **express-rate-limit 8.2.1**: API rate limiting to prevent abuse
- **CORS 2.8.5**: Cross-Origin Resource Sharing configuration

#### AI Integration
- **OpenAI API 6.9.1**: Integration with GPT models for conversational AI
- Custom prompt engineering for therapeutic conversation style

#### Utilities
- **dotenv 17.2.3**: Environment variable management
- **date-fns 4.1.0**: Date manipulation and timezone handling

#### Development Tools
- **ts-node-dev 2.0.0**: TypeScript development server with auto-reload
- **nodemon 3.1.11**: File watcher for development

### 2.3 Deployment & Infrastructure

#### Frontend Deployment
- **Vercel**: Hosting platform for frontend deployment
- **Vercel Configuration**: Custom build commands, output directories, and routing rules
- **Static Asset Optimization**: Cache headers for icons and assets

#### Backend Deployment
- **Render**: Cloud platform for backend API hosting
- **Environment Variables**: Secure configuration management
- **Health Check Endpoints**: Monitoring and uptime verification

#### PWA Configuration
- **Web App Manifest**: PWA metadata for installability
- **Service Worker**: Offline functionality (via Vite PWA plugin)
- **App Icons**: Multiple sizes (192x192, 512x512) for various devices

---

## 3. Architecture & Design

### 3.1 Application Architecture

#### Frontend Architecture
The frontend follows a component-based architecture with clear separation of concerns:

```
frontend/src/
├── pages/          # Route-level page components
├── components/     # Reusable UI components
├── features/       # Feature-specific modules (chat, auth)
├── contexts/       # React Context providers
├── providers/      # Higher-level providers (Auth, Language)
├── services/       # API communication layer
├── utils/          # Utility functions
├── i18n/           # Internationalization
└── config/         # Configuration files
```

**Key Architectural Decisions:**
- **Component Composition**: Small, focused components for reusability
- **Custom Hooks**: Encapsulated logic (useChat, useAuth, useLanguage)
- **Context API**: Global state without external state management libraries
- **Service Layer**: Centralized API communication with error handling

#### Backend Architecture
The backend follows a layered MVC-inspired architecture:

```
backend/src/
├── server.ts       # Application entry point
├── routes/         # API route definitions
├── controllers/    # Request handling logic
├── services/       # Business logic layer
├── models/         # Database schemas (Mongoose)
├── middleware/     # Express middleware (auth, rate limiting)
└── config/         # Configuration (DB, environment)
```

**Key Architectural Decisions:**
- **RESTful API Design**: Standard HTTP methods and status codes
- **Middleware Chain**: Authentication, rate limiting, and error handling
- **Service Layer**: Business logic separated from controllers
- **Type Safety**: Full TypeScript coverage for type safety

### 3.2 Database Schema

#### User Model
```typescript
{
  email: String (unique, required)
  password: String (hashed, required)
  firstName: String (optional)
  createdAt: Date
  updatedAt: Date
}
```

#### MoodCheckIn Model
```typescript
{
  user: ObjectId (reference to User, required)
  value: Number (0-100, required)
  label: String (required)
  date: Date (normalized to start of day UTC, required)
  createdAt: Date
  updatedAt: Date
}
// Compound unique index: (user, date) - one mood per user per day
```

#### JournalEntry Model
```typescript
{
  user: ObjectId (reference to User, required)
  content: String (required)
  allowSerenityAccess: Boolean (default: false)
  createdAt: Date
  updatedAt: Date
}
```

#### AIMemory Model
```typescript
{
  user: ObjectId (reference to User, optional for guests)
  conversationHistory: Array of messages
  moodContext: String (optional)
  language: String ('en' | 'pt', default: 'en')
  createdAt: Date
  updatedAt: Date
}
```

### 3.3 API Endpoints

#### Authentication Routes (`/api/auth`)
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `GET /api/auth/me` - Get current user (protected)

#### Serenity Chat Routes (`/api/serenity`)
- `POST /api/serenity/chat` - Send message to AI chatbot (protected)
- Rate limited: 30 requests per 15 minutes
- Daily limit: 50 messages per user per day

#### Mood Routes (`/api/mood`)
- `POST /api/mood/check-in` - Create or update daily mood (protected)
- `GET /api/mood/today` - Get today's mood (protected)
- `GET /api/mood/history` - Get mood history (protected)

#### Journal Routes (`/api/journal`)
- `POST /api/journal/entries` - Create journal entry (protected)
- `GET /api/journal/entries` - Get all journal entries (protected)
- `GET /api/journal/entries/:id` - Get specific entry (protected)
- `PUT /api/journal/entries/:id` - Update journal entry (protected)
- `DELETE /api/journal/entries/:id` - Delete journal entry (protected)

#### Health Check
- `GET /health` - Server health status

---

## 4. Key Features & Implementation

### 4.1 User Authentication

**Implementation:**
- JWT-based authentication with secure token storage
- Password hashing using bcrypt (10 salt rounds)
- Token expiration handling with automatic logout
- Protected routes with middleware verification
- Session persistence using localStorage

**Security Features:**
- Password validation (minimum 8 characters)
- Email validation
- Token refresh on activity
- Automatic token expiry detection

### 4.2 Mood Tracking System

**Features:**
- Visual mood slider (0-100 scale)
- Five mood categories with color-coded feedback:
  - Very Bad (0)
  - Bad (25)
  - Calm (50)
  - All Good (75)
  - Feeling Amazing (100)
- Daily mood enforcement (one mood per day, updatable)
- Mood history tracking
- Animated visual feedback with organic shapes
- Confirmation dialog for mood updates

**Technical Implementation:**
- Date normalization to start-of-day UTC for consistency
- Compound unique index preventing duplicate daily entries
- Smooth animations using CSS keyframes
- Responsive design for mobile and desktop

### 4.3 Journal System

**Features:**
- Create, read, update, and delete journal entries
- Auto-expanding textarea for comfortable writing
- Date-based organization (Today, Yesterday, or formatted date)
- Entry preview with truncated content
- Full entry view with edit capabilities
- Privacy control (allow/disallow AI access to entries)

**Technical Implementation:**
- Rich text support with whitespace preservation
- Local storage caching for offline access
- Optimistic UI updates
- Error handling with graceful degradation

### 4.4 AI Chatbot (Serenity)

**Features:**
- Conversational AI powered by OpenAI GPT models
- Context-aware responses using conversation history
- Mood context integration (uses recent mood data)
- Multi-language support (English and Portuguese)
- Rate limiting and daily message limits
- Fallback responses for API failures
- Typing indicators for better UX
- Suggestion chips for conversation starters

**Technical Implementation:**
- Custom prompt engineering for therapeutic tone
- Conversation history management
- Token limit handling
- Error recovery with user-friendly messages
- Mock responses for development/testing

**AI Prompt Engineering:**
- System prompts designed for empathetic, supportive responses
- Context injection from mood check-ins
- Language-specific response formatting
- Safety measures to prevent inappropriate content

### 4.5 Progressive Web App (PWA)

**Features:**
- Installable on mobile devices
- Standalone app experience (no browser UI)
- Offline capability support
- App icons for home screen
- Splash screen configuration
- Mobile-first design approach

**Implementation:**
- Web App Manifest with proper metadata
- Service worker for offline functionality
- Install prompt handling for various browsers
- Platform-specific installation instructions
- QR code generation for desktop entry

### 4.6 Internationalization (i18n)

**Supported Languages:**
- English (en)
- Portuguese - Portugal (pt)

**Implementation:**
- Centralized translation file (`lang.ts`)
- React Context for language management
- Persistent language preference (localStorage)
- Language switcher component
- All UI text translated (280+ translation keys)

**Coverage:**
- All page content
- Error messages
- Button labels
- Form placeholders
- Mood labels and affirmations
- Chat interface
- Installation instructions

### 4.7 Responsive Design & UX

**Design Principles:**
- Mobile-first approach
- Ambient, calming color palette (green/teal gradients)
- Smooth animations and transitions
- Consistent spacing and typography
- Accessibility considerations

**Responsive Breakpoints:**
- Mobile: Default (< 640px)
- Tablet: `sm:` (≥ 640px)
- Desktop: `md:` and above (≥ 768px)

**Key UX Features:**
- Loading states with animated indicators
- Error boundaries with user-friendly messages
- Empty states with helpful messaging
- Smooth page transitions
- Touch-optimized interactions (44px minimum touch targets)
- Safe area insets for iPhone notches

---

## 5. Security & Performance

### 5.1 Security Measures

**Authentication Security:**
- JWT tokens with expiration
- Password hashing with bcrypt
- Secure token storage (httpOnly cookies considered, localStorage used)
- Token validation on every protected request

**API Security:**
- CORS configuration for allowed origins
- Rate limiting (30 requests per 15 minutes for chat)
- Daily limits (50 messages per user per day)
- Input validation and sanitization
- Error message sanitization (no sensitive data exposure)

**Data Protection:**
- MongoDB connection with secure credentials
- Environment variable management
- No sensitive data in client-side code
- Secure API endpoints with authentication middleware

### 5.2 Performance Optimizations

**Frontend:**
- Code splitting with Vite
- Lazy loading of routes
- Optimized bundle size
- Image optimization
- CSS purging with Tailwind
- Memoization where appropriate

**Backend:**
- Efficient database queries with indexes
- Connection pooling (MongoDB)
- Response caching where applicable
- Async/await for non-blocking operations

**Network:**
- API request optimization
- Error retry logic
- Graceful degradation
- Offline support preparation

### 5.3 Error Handling

**Frontend Error Handling:**
- React Error Boundaries for component errors
- Try-catch blocks for async operations
- User-friendly error messages
- Sentry integration for production error tracking
- Local error logging as fallback

**Backend Error Handling:**
- Express error middleware
- Graceful API error responses
- Detailed error logging
- Fallback responses for AI failures
- Validation error handling

---

## 6. Development Process

### 6.1 Project Structure

The project is organized as a monorepo with separate frontend and backend directories:

```
mindease/
├── frontend/          # React frontend application
│   ├── src/          # Source code
│   ├── public/       # Static assets
│   ├── dist/         # Build output
│   └── package.json  # Frontend dependencies
├── backend/          # Node.js backend API
│   ├── src/         # Source code
│   ├── dist/        # Compiled JavaScript
│   └── package.json # Backend dependencies
└── package.json      # Root workspace configuration
```

### 6.2 Development Workflow

**Local Development:**
- Frontend: `npm run dev` (Vite dev server on port 5173)
- Backend: `npm run dev` (Express server on port 5050)
- Hot module replacement for rapid development
- TypeScript compilation with type checking

**Build Process:**
- Frontend: `npm run build` (TypeScript compilation + Vite build)
- Backend: `npm run build` (TypeScript to JavaScript compilation)
- Production optimizations enabled
- Environment variable validation

**Testing Approach:**
- Manual testing on multiple devices
- Cross-browser testing
- Mobile device testing (iOS Safari, Android Chrome)
- API endpoint testing
- Error scenario testing

### 6.3 Version Control

- Git for version control
- Feature branch workflow
- Commit messages following conventional format
- Code review process

---

## 7. Deployment

### 7.1 Frontend Deployment (Vercel)

**Configuration:**
- Build command: `cd frontend && npm run build`
- Output directory: `frontend/dist`
- Framework: Vite
- Node.js version: 20.x or 22.x

**Environment Variables:**
- `VITE_API_URL`: Backend API endpoint
- `VITE_SENTRY_DSN`: Error tracking (optional)

**Deployment Features:**
- Automatic deployments on git push
- Preview deployments for pull requests
- Custom routing for SPA
- Asset caching headers
- HTTPS enabled

### 7.2 Backend Deployment (Render)

**Configuration:**
- Runtime: Node.js
- Build command: `npm run build`
- Start command: `npm start`
- Environment: Production

**Environment Variables:**
- `MONGO_URI`: MongoDB connection string
- `JWT_SECRET`: JWT signing secret
- `FRONTEND_URL`: Allowed CORS origin
- `OPENAI_API_KEY`: OpenAI API key (optional)
- `AI_ENABLED`: Feature flag for AI (optional)
- `PORT`: Server port (default: 5050)

**Server Configuration:**
- Listens on `0.0.0.0` for Render compatibility
- Health check endpoint at `/health`
- Graceful MongoDB connection handling
- Error logging and monitoring

---

## 8. Challenges & Solutions

### 8.1 Technical Challenges

**Challenge: Mobile Keyboard Viewport Issues**
- **Problem**: iPhone keyboard pushing content up and hiding top elements
- **Solution**: Implemented dynamic viewport height (dvh) and fixed positioning to prevent layout shifts

**Challenge: PWA Installation Across Browsers**
- **Problem**: Different installation flows for iOS Safari, Android Chrome, etc.
- **Solution**: Platform detection with browser-specific installation instructions and inline guides

**Challenge: Real-time Chat Experience**
- **Problem**: Maintaining conversation context and smooth UX
- **Solution**: Local storage for conversation history, typing indicators, and optimistic UI updates

**Challenge: Date Normalization for Mood Tracking**
- **Problem**: Timezone differences causing duplicate mood entries
- **Solution**: Normalize all dates to start-of-day UTC in database while displaying in user's local timezone

### 8.2 Design Challenges

**Challenge: Creating Calming, Non-Intrusive UI**
- **Solution**: Ambient color palette, soft gradients, smooth animations, and minimal UI elements

**Challenge: Mobile-First Responsive Design**
- **Solution**: Mobile-first Tailwind approach with progressive enhancement for larger screens

**Challenge: Accessibility and Touch Targets**
- **Solution**: Minimum 44px touch targets, proper ARIA labels, keyboard navigation support

---

## 9. Future Enhancements

### 9.1 Potential Features
- Mood analytics and visualization (charts, trends)
- Journal entry search and filtering
- Export functionality (PDF, CSV)
- Push notifications for mood check-in reminders
- Social features (optional sharing, community support)
- Additional language support
- Dark/light theme toggle
- Offline mode with sync

### 9.2 Technical Improvements
- Unit and integration testing
- End-to-end testing with Playwright/Cypress
- Performance monitoring and optimization
- Advanced caching strategies
- GraphQL API consideration
- Microservices architecture for scalability

---

## 10. Conclusion

MindEase represents a comprehensive full-stack web application that combines modern web technologies with thoughtful UX design to create a valuable emotional wellness tool. The project demonstrates proficiency in:

- **Frontend Development**: React, TypeScript, modern build tools, responsive design
- **Backend Development**: Node.js, Express, MongoDB, RESTful API design
- **AI Integration**: OpenAI API integration with custom prompt engineering
- **PWA Development**: Progressive Web App implementation with offline capabilities
- **Internationalization**: Multi-language support with proper i18n implementation
- **Security**: Authentication, authorization, rate limiting, input validation
- **Deployment**: Cloud platform deployment (Vercel, Render) with CI/CD
- **User Experience**: Mobile-first design, smooth animations, accessibility

The application successfully addresses real-world user needs while maintaining code quality, security, and performance standards. The modular architecture ensures maintainability and scalability for future enhancements.

---

## 11. Technical Specifications Summary

### Frontend
- **Framework**: React 19.2.0 with TypeScript 5.9.3
- **Build Tool**: Vite 7.2.4
- **Styling**: Tailwind CSS 4.1.17
- **Routing**: React Router DOM 7.10.0
- **State Management**: React Context API
- **Error Tracking**: Sentry React 10.35.0
- **Bundle Size**: Optimized with code splitting

### Backend
- **Runtime**: Node.js
- **Framework**: Express.js 4.21.2
- **Database**: MongoDB with Mongoose 9.0.0
- **Authentication**: JWT with bcrypt
- **AI Integration**: OpenAI API 6.9.1
- **Rate Limiting**: express-rate-limit 8.2.1

### Infrastructure
- **Frontend Hosting**: Vercel
- **Backend Hosting**: Render
- **Database**: MongoDB Atlas (cloud)
- **CDN**: Vercel Edge Network
- **Monitoring**: Sentry for error tracking

### Development Tools
- **Language**: TypeScript 5.9.3
- **Linting**: ESLint 9.39.1
- **Package Manager**: npm
- **Version Control**: Git

---

**Project Status**: Production-ready, deployed and accessible

**Total Development Time**: Comprehensive full-stack application development

**Lines of Code**: 
- Frontend: ~5,000+ lines (TypeScript/TSX)
- Backend: ~2,000+ lines (TypeScript)
- Total: ~7,000+ lines of production code

---

*This report documents the complete technical implementation of the MindEase application as developed for academic presentation.*
