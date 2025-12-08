# MindEase — Emotional Wellness Companion

MindEase is a mobile-first wellness application designed to give users a calm, supportive space to understand and manage their emotions.  
The core of the experience is **Serenity**, a conversational guide that uses clinically informed emotional support techniques such as reframing, grounding prompts, gentle questioning, and emotional labeling.

MindEase is built as a **Progressive Web App (PWA)**, allowing instant access, offline support, and an app-like experience without requiring the App Store.

---

## 🌱 Purpose

Modern mental wellness apps are often:
- cluttered and overwhelming  
- locked behind paywalls  
- too clinical or formal  
- slow to deliver support when users need it most

MindEase focuses on:
- **simplicity**  
- **privacy**  
- **emotional clarity**  
- **fast, accessible support**

No long onboarding.  
No friction.  
Just a calm space for clarity — anytime, anywhere.

---

## ✨ Core Features

### **Serenity Chat**
A supportive conversational guide that helps users explore emotions through:
- grounding techniques  
- reframing questions  
- gentle questioning  
- emotional labeling  
- non-clinical reflective support  

### **Mood Check-Ins**
- quick mood selection  
- optional notes  
- emotional labeling  
- daily self-awareness reminders  

### **Micro-Journaling**
- short expressive entries  
- timestamped reflections  
- private, secure storage  

### **Mood Trends**
- simple visual patterns  
- emotional progression over time  
- optional integration with Serenity  

### **PWA Experience**
- installable on mobile  
- offline capability  
- fast loading  
- automatic updates  

---

## 🧱 Tech Stack

### **Frontend**
- React  
- Vite  
- TypeScript  
- TailwindCSS  
- PWA configuration (manifest + service worker)

### **Backend**
- Node.js  
- Express  
- TypeScript  
- JWT authentication  
- Secure password hashing (bcrypt)

### **Database**
- MongoDB Atlas  
- Mongoose for schemas and validation

### **AI Integration**
Serenity’s conversational behavior is built through structured prompts and safely handled within the backend.  
The model does **not** store private user data — conversations remain ephemeral unless the user chooses to save journal notes.

---

## 🔐 Security & Privacy

MindEase is designed with privacy as a priority:

- minimal data collection  
- user authentication secured via JWT  
- hashed passwords  
- protected routes  
- encrypted network communication (HTTPS)  
- journaling and mood data stored securely  
- users maintain full control over their data  

No analytics or unnecessary tracking is included.

---

## 🗂️ Project Structure

```
/frontend        # React + Vite frontend
/backend         # Node + Express API
  /src
    /config      # database config, env
    /controllers # route controllers
    /models      # mongoose schemas
    /routes      # API routes
    /middleware  # auth middleware
```

---

## 🚀 Getting Started

### **1. Clone the repository**
```bash
git clone https://github.com/<your-username>/mindease.git
```

### **2. Install dependencies**
Backend:
```bash
cd backend
npm install
```

Frontend:
```bash
cd frontend
npm install
```

### **3. Environment setup**

Create a `.env` file in `/backend`:

```
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_secret_key
OPENAI_API_KEY=your_api_key
```

### **4. Run the backend**
```bash
npm run dev
```

### **5. Run the frontend**
```bash
npm run dev
```

---

## 🧭 Development Roadmap

### **Sprint 1 — Authentication & Setup**  
✔ Project initialization  
✔ JWT authentication  
✔ MongoDB setup  
✔ Folder structure

### **Sprint 2 — Serenity AI Chat**  
□ AI endpoint  
□ Structured prompt design  
□ Safety filtering  

### **Sprint 3 — Mood Tracking**  
□ Model + CRUD routes  
□ UI components  
□ Integration with Serenity  

### **Sprint 4 — Journaling**  
□ Journal model  
□ CRUD routes  
□ UI writing space  

### **Sprint 5 — Mood Analytics**  
□ Trend calculations  
□ Data visualizations in UI  

### **Sprint 6 — PWA Setup & Release**  
□ PWA manifest  
□ Offline caching  
□ Install prompts  
□ Final polish & deployment  

---

## 🌿 Contribution Workflow

MindEase follows a feature-branch workflow:

1. Create a new branch  
```bash
git checkout -b feature/branch-name
```

2. Make changes and commit  
```bash
git add .
git commit -m "feat: short description of what you added"
```

3. Push your branch  
```bash
git push origin feature/branch-name
```

4. Open a pull request (optional for bootcamp)  
5. Merge into `main` when stable

---

## 📄 License
This project is for educational and portfolio purposes.

---

## 💬 Contact
For questions or feedback, please open an issue on the repository.
