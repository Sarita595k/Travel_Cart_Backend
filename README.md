# ⚙️ Travel Cart - Backend (Node/Express)

The robust engine powering Travel Cart, handling secure authentication, AI orchestration, and data management.

## 🏗 High-Level Architecture
The backend follows a **Controller-Route-Model** pattern. It serves as a secure bridge between the MongoDB Atlas database and external service integrations (AI and News).

## 🛠 Tech Stack
- **Node.js & Express:** Server environment and routing.
- **MongoDB Atlas:** NoSQL database for flexible travel data storage.
- **JWT & Bcrypt:** Industry-standard security for auth and password hashing.
- **Nodemailer:** Automated email system with HTML templates for Welcome and Reset Password flows.

## 🤖 AI Agent & News API Integration
### 1. The AI Travel Agent
- **Purpose:** Acts as a virtual travel consultant.
- **Design:** Uses strict prompt engineering to ensure the AI returns structured JSON data, allowing the frontend to display precise day-by-day activities.
  
### 2. News API Integration
- **Purpose:** Keeps users informed about global travel conditions.
- **Functionality:** The backend fetches, caches, and filters data from external News APIs, providing an optimized endpoint (`/api/news`) for the frontend to consume safely.

## ⚖️ Key Design Decisions & Trade-offs
- **Rate Limiting:** Implemented `express-rate-limit` on AI and Auth routes. While this prevents spam, it limits high-frequency requests to save on API costs.
- **Trust Proxy:** Configured to work seamlessly with Render's load balancer for secure HTTPS communication.

## ⚙️ Setup Instructions
1. **Install Dependencies:** `npm install`
2. **Environment Variables:** Create a `.env` file:
   ```env
   PORT=2100
   MONGO_URI=your_mongodb_uri
   JWT_SECRET_KEY=your_secret
   USER_EMAIL=your_email
   USER_PASSWORD=your_app_password
   GEMINI_API_KEY=your_gemini_api_key
   NEWS_API=your_news_api_key
   FRONTEND_URL=http://localhost:5173
        ```
    * Start: `npm run dev`.
   ### Deployment Settings
* **Netlify (Frontend):** Set `VITE_BASE_URL` to your Render API link. Use a `_redirects` file for routing support.
* **Render (Backend):** Set `FRONTEND_URL` to your Netlify link.

---

## 🔐 Authentication & Authorization
* **Security:** Passwords are encrypted using **Bcrypt** with 10 salt rounds.
---

## 🤖 AI Agent Design & Purpose
The **AI Planner Agent** is the core of the experience.
* **Design:** It utilizes a structured prompt to convert user constraints (budget, days, location) into a clean, parsed JSON object.
* **Purpose:** It acts as a 24/7 travel consultant, providing instantly generated, logical, and diverse travel plans that would otherwise take hours of manual research.

---

## ✨ Creative Features
* **Discover Mode:** A feature that highlights trending global destinations using a specialized "Discover" route.

---

## ⚖️ Key Design Decisions & Trade-offs
* **Case-Sensitive Routing:** All components and imports follow strict PascalCase to ensure 100% compatibility with Linux-based deployment servers (Netlify/Render).
* **Rate Limiting:** Implemented `express-rate-limit` to prevent API abuse, accepting a minor trade-off in speed for high-volume users in exchange for server stability.

---

## ⚠️ Known Limitations
* **Backend Latency:** Render's free tier involves a "cold start" (approx. 30s) if the API hasn't been used in 15 minutes.
* **Email Delivery:** Some emails may land in "Promotions" or "Spam" due to shared SMTP IP reputations.

---

**Developed by SARITA**
