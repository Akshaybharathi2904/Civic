# CivicSwarm 🐝🤖

### AI-Powered Multi-Agent Civic Issue Resolution Platform (Google Gemini Engine)

> An enterprise-grade, full-stack GovTech platform built for real-time citizen complaint reporting, geospatial duplicate merging, computer vision hazard detection, automated multi-agent triage, department routing, officer command centers, and predictive analytics.

---

## 🌟 Key Capabilities & Features

1. **10 Autonomous AI Agents Engine (Google Gemini 2.5 Flash)**:
   - **Complaint Understanding Agent**: Natural Language Processing, issue type classification, severity estimation, keyword extraction & non-English translation via Google Gemini.
   - **Computer Vision Image Analysis Agent**: Multimodal visual hazard detection (potholes, garbage piles, burst pipes, broken streetlights) using Google Gemini 2.5 Flash vision capabilities.
   - **Location Intelligence Agent**: GPS reverse-geocoding to municipal ward, zone, district, and GeoJSON spatial point creation.
   - **Geospatial Duplicate Detection Agent**: MySQL spatial proximity calculation (within 500m radius), merging citizen citations & tracking affected population count.
   - **Department Routing Agent**: Automatic ticket dispatching to PWD, BWSSB, BESCOM, BBMP, Traffic Police, Forest, or Disaster Management.
   - **Priority Scoring Agent**: 0-100 public safety score calculation matrix.
   - **Workflow Tracking Agent**: Resolution SLA timeline management (Reported -> Acknowledged -> Assigned -> Inspection -> In Progress -> Resolved -> Verified).
   - **Escalation Agent**: Automated SLA breach sweeps & officer alerts.
   - **Citizen Notification Agent**: Real-time Socket.io streaming updates.
   - **Government Analytics Agent**: Live municipal leaderboard, category trends, ward statistics, and resolution benchmarks.

2. **Live AI Visualizer Panel**:
   - Animated streaming execution visualizer powered by Socket.io, displaying step-by-step agent outputs, confidence scores, execution timers, and raw JSON inspection.

3. **Government Command Center**:
   - Interactive Leaflet GIS heatmap & marker clustering with priority color indicators (Critical = Red, High = Orange, Medium = Yellow, Low = Green).
   - Department filters, ward filters, status updates, manual priority score overrides, department reassignment, and escalation sweeps.

---

## 🛠️ Technology Stack

- **AI Engine**: Google GenAI SDK (`@google/genai`), Model `gemini-2.5-flash` with multimodal vision support.
- **Frontend**: React 19, Vite, Tailwind CSS, TypeScript, React Router v7, React Query v5, Framer Motion, Axios, Leaflet Maps, Recharts, Socket.io Client, Lucide Icons.
- **Backend**: Node.js, Express.js, MySQL + Prisma ORM, Socket.io, Multer, JWT, bcryptjs.

---

## 🔑 Environment Variables Setup

Configure `.env` in the `backend/` directory:

```env
PORT=5000
DATABASE_URL="mysql://root:password@localhost:3306/civicswarm"
JWT_SECRET=civicswarm_super_secret_jwt_key_2026_hackathon
GEMINI_API_KEY=your_google_gemini_api_key_here
CLIENT_URL=http://localhost:5173
NODE_ENV=development
```

---

## 🚀 Installation & Quick Start

### 1. Backend Setup

```bash
cd backend
npm install
npx prisma generate
npm run seed  # Populates MySQL database via Prisma
npm run dev   # Starts backend server on http://localhost:5000
```

### 2. Frontend Setup

```bash
cd frontend
npm install
npm run dev   # Starts frontend server on http://localhost:5173
```
