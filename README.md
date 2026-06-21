# 🌍 EcoTrack — Carbon Footprint Awareness Platform

> **Google Hack 2 Skill — Prompt Wars Challenge 3**
> Built with AI tools · Powered by Google Gemini

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](./LICENSE)
[![Node 20+](https://img.shields.io/badge/Node.js-20+-success?logo=node.js)](https://nodejs.org)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.6-blue?logo=typescript)](https://typescriptlang.org)
[![Gemini AI](https://img.shields.io/badge/Google_Gemini-1.5_Flash-blue?logo=google)](https://aistudio.google.com)
[![Security](https://img.shields.io/badge/Security-10_Layers-green)](./backend/src/middleware/)
[![Tests](https://img.shields.io/badge/Tests-30_passing-brightgreen)](./backend/tests/)

---

## 📌 Overview

**EcoTrack** is a full-stack Carbon Footprint Awareness Platform that helps individuals:

- **Understand** their carbon footprint through detailed activity logging and real-time calculations
- **Track** emissions across 5 categories: Transport, Energy, Food, Shopping, and Waste
- **Reduce** their impact through AI-powered personalized insights (Google Gemini) and gamified challenges

### Key Highlights

| Feature | Details |
|---|---|
| 🤖 **AI-Powered** | Google Gemini 1.5 Flash generates personalized reduction strategies |
| 🔒 **Security-First** | 10+ layers of security, JWT with rotation, rate limiting, CSP headers |
| 📊 **Data-Driven** | 50+ emission factors from IPCC/EPA data, accurate CO₂ calculations |
| 🎮 **Gamified** | Challenges, achievements, points system for sustained engagement |
| 🐳 **Production-Ready** | Docker Compose, GitHub Actions CI/CD, multi-stage builds |
| 📱 **Responsive** | Mobile-first React UI with Tailwind CSS |

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                        CLIENT LAYER                          │
│  React 18 + TypeScript + Vite + Tailwind CSS + Zustand      │
│  React Query (caching) · Recharts (visualizations)          │
│  React Hook Form + Zod (client-side validation)             │
└──────────────────────────┬──────────────────────────────────┘
                           │ HTTPS / REST API
┌──────────────────────────▼──────────────────────────────────┐
│                      GATEWAY LAYER                           │
│  Nginx (reverse proxy, static files, security headers)       │
└──────────────────────────┬──────────────────────────────────┘
                           │
┌──────────────────────────▼──────────────────────────────────┐
│                      API LAYER (Express.js)                  │
│                                                              │
│  Security Middleware Stack:                                  │
│  Helmet → CORS → Rate Limiting → Sanitization → HPP         │
│                                                              │
│  Routes: /api/v1/auth  |  /api/v1/carbon                    │
│                                                              │
│  Controllers → Services → Repositories → Database           │
│  (Clean Architecture: Hexagonal / Ports & Adapters)         │
└───────────┬────────────────────────────┬────────────────────┘
            │                            │
┌───────────▼───────────┐   ┌────────────▼──────────────────┐
│   PostgreSQL           │   │   Google Gemini 1.5 Flash     │
│   (via Prisma ORM)     │   │   (AI Insights & Tips)        │
│   Parameterized queries│   │   Rate-limited · Cached 30min │
└───────────────────────┘   └───────────────────────────────┘
```

### Directory Structure

```
h2s/
├── backend/                    # Node.js + Express + TypeScript API
│   ├── src/
│   │   ├── config/             # Environment validation, DB connection
│   │   ├── controllers/        # Request handlers (thin, delegate to services)
│   │   ├── middleware/         # Auth, security, rate-limiting, validation, error
│   │   ├── repositories/       # Data access layer (Prisma queries)
│   │   ├── routes/             # Route definitions with middleware chains
│   │   ├── services/           # Business logic (auth, carbon, AI)
│   │   ├── types/              # TypeScript types and response helpers
│   │   ├── utils/              # Carbon calculator, logger, token utils
│   │   ├── validators/         # Zod schemas for request validation
│   │   ├── app.ts              # Express app configuration
│   │   └── server.ts           # HTTP server + graceful shutdown
│   ├── prisma/
│   │   ├── schema.prisma       # Database schema (9 models)
│   │   └── seed.ts             # Seed achievements + challenges
│   └── tests/                  # Unit + integration tests
│
├── frontend/                   # React 18 + TypeScript + Vite SPA
│   ├── src/
│   │   ├── components/         # Reusable UI components
│   │   │   ├── ui/             # Button, Card, Input (design system)
│   │   │   ├── layout/         # Sidebar, AppLayout
│   │   │   ├── carbon/         # ActivityLogger, FootprintChart
│   │   │   ├── dashboard/      # StatsCard, RecentActivities
│   │   │   └── insights/       # AIInsightsPanel
│   │   ├── pages/              # Route-level components
│   │   ├── services/           # API layer (axios + interceptors)
│   │   ├── store/              # Zustand auth store
│   │   ├── types/              # Shared TypeScript types
│   │   └── utils/              # Formatters, className helpers
│   └── nginx.conf              # Production nginx config
│
├── .github/workflows/          # CI/CD pipelines
│   ├── ci.yml                  # Lint, test, build, Docker check
│   └── security.yml            # CodeQL, dependency review
│
└── docker-compose.yml          # Full-stack local/prod deployment
```

---

## 🔒 Security Architecture

Security is implemented as a **defense-in-depth** multi-layer approach:

### Layer 1: HTTP Security Headers (Helmet.js)
- Content Security Policy (CSP)
- HSTS (Strict Transport Security, 1 year, preload)
- X-Frame-Options: DENY
- X-Content-Type-Options: nosniff
- Cross-Origin Embedder/Opener/Resource Policy
- Referrer Policy, Permissions Policy
- Removes X-Powered-By header

### Layer 2: CORS (Whitelist-based)
- Strict origin whitelist from environment config
- Suspicious origins logged to security log
- 24-hour preflight cache

### Layer 3: Rate Limiting
| Endpoint | Window | Max Requests |
|---|---|---|
| General API | 15 min | 100 |
| Auth (login/register) | 15 min | 10 (failed only) |
| AI Insights | 1 hour | 20 per user |

Progressive speed-down on repeated requests (express-slow-down)

### Layer 4: Input Validation (Zod + Sanitization)
- All request bodies validated with Zod schemas before reaching controllers
- MongoDB injection prevention (express-mongo-sanitize)
- HTTP Parameter Pollution prevention (hpp)
- Request body size limits (10kb)
- Suspicious pattern detection (path traversal, XSS, SQLi patterns)

### Layer 5: Authentication (JWT with Rotation)
- Short-lived access tokens (15 minutes)
- Long-lived refresh tokens (7 days) with **rotation on every use**
- Refresh token reuse detection → auto-revoke all user tokens
- Tokens stored in DB with IP/UserAgent fingerprint
- Graceful token revocation on logout

### Layer 6: Password Security
- bcrypt with 12 salt rounds
- Constant-time password comparison (prevents timing attacks)
- Dummy hash comparison even when user doesn't exist
- Strong password policy enforced at schema + client level

### Layer 7: Data Access (Prisma ORM)
- 100% parameterized queries — no raw SQL string concatenation
- Soft deletes (isActive flag) — audit trail preserved
- Row-level security: every query scoped to authenticated userId

### Layer 8: Audit Logging
- All auth events logged (login, logout, failed attempts, token reuse)
- Security warnings logged (CORS violations, suspicious inputs)
- Daily rotating log files, 14-day retention
- Request ID tracing across all logs

### Layer 9: Infrastructure
- Docker non-root user (UID 1001)
- `no-new-privileges` security option
- Dumb-init for proper signal handling
- Multi-stage Docker builds (no dev dependencies in production)
- Secret management via environment variables (never in code)

### Layer 10: Frontend Security
- Tokens in sessionStorage (cleared on tab close)
- Automatic token refresh via axios interceptor
- No sensitive data in localStorage
- DOMPurify available for XSS prevention
- React's built-in XSS protection (JSX auto-escaping)

---

## 🌿 Carbon Calculation Methodology

Emission factors sourced from:
- **IPCC** (Intergovernmental Panel on Climate Change) AR6
- **EPA** (US Environmental Protection Agency)
- **GHG Protocol** Corporate Standard

### Categories & Emission Factors

| Category | Example | Factor |
|---|---|---|
| 🚗 Transport | Petrol car | 0.192 kg CO₂e/km |
| ✈️ Transport | Short flight | 0.255 kg CO₂e/km |
| ⚡ Energy | Electricity | 0.233 kg CO₂e/kWh |
| 🥩 Food | Beef | 27.0 kg CO₂e/kg |
| 🌱 Food | Vegetables | 2.0 kg CO₂e/kg |
| 🛍️ Shopping | Clothing item | 10.0 kg CO₂e/item |
| ♻️ Waste | Recycling | -0.15 kg CO₂e/kg (savings!) |

Tree offset: 1 tree absorbs ~21 kg CO₂/year

---

## 🚀 Quick Start

### Prerequisites
- Node.js 20+
- PostgreSQL 16+ (or Docker)
- Google Gemini API key ([Get one free](https://aistudio.google.com))

### 1. Clone & Configure

```bash
git clone https://github.com/pixie0718/ecotrack.git
cd ecotrack

# Backend config
cp backend/.env.example backend/.env
# Edit backend/.env with your secrets
```

### 2. Option A: Docker (Recommended)

```bash
# One command to start everything
docker compose up --build -d

# Run DB migrations
docker compose exec backend npx prisma migrate deploy
docker compose exec backend npm run prisma:seed

# Access the app
open http://localhost
```

### 3. Option B: Local Development

```bash
# Start PostgreSQL (or use an existing instance)
# Update DATABASE_URL in backend/.env

# Backend
cd backend
npm install
npx prisma migrate dev
npm run prisma:seed
npm run dev

# Frontend (new terminal)
cd frontend
npm install
npm run dev
```

Visit `http://localhost:5173`

---

## 🔌 API Reference

Base URL: `/api/v1`

### Authentication

| Method | Endpoint | Description |
|---|---|---|
| POST | `/auth/register` | Create account |
| POST | `/auth/login` | Login, returns tokens |
| POST | `/auth/refresh` | Refresh access token |
| POST | `/auth/logout` | Revoke refresh token |
| PATCH | `/auth/change-password` | Change password |
| GET | `/auth/me` | Current user info |

### Carbon Tracking

| Method | Endpoint | Description |
|---|---|---|
| GET | `/carbon/dashboard` | Stats, trends, recent activities |
| POST | `/carbon/activities` | Log carbon activity |
| GET | `/carbon/activities` | Paginated activity history |
| DELETE | `/carbon/activities/:id` | Delete activity |
| PUT | `/carbon/profile` | Update footprint profile |
| GET | `/carbon/insights` | AI-powered insights (Gemini) |
| GET | `/carbon/challenges` | Available challenges |
| GET | `/carbon/challenges/my` | User's challenges |
| POST | `/carbon/challenges/:id/join` | Join a challenge |

### Health

```
GET /health  → { status: "healthy", version: "v1", ... }
```

---

## 🧪 Testing

```bash
# Backend unit tests
cd backend && npm test

# Run only unit tests
npm run test:unit

# Run with coverage
npm test -- --coverage
```

---

## 🌐 Deployment

### Environment Variables (Required)

```env
# Database
DATABASE_URL=postgresql://...

# JWT (generate with: openssl rand -base64 64)
JWT_ACCESS_SECRET=<64+ char random string>
JWT_REFRESH_SECRET=<64+ char random string>

# Google Gemini
GEMINI_API_KEY=<your-gemini-api-key>

# Security
CORS_ORIGINS=https://yourdomain.com
BCRYPT_SALT_ROUNDS=12
```

### Deploy to Cloud

| Layer | Platform | Notes |
|---|---|---|
| Frontend | **Vercel** | Auto-deploy from GitHub `main` branch |
| Backend + DB | **Railway** | PostgreSQL + Node.js service |

---

## 🤖 AI Integration (Google Gemini)

The AI Insights feature uses **Gemini 1.5 Flash** to:

1. Analyze the user's monthly carbon breakdown
2. Compare against world/Paris averages
3. Generate 5 personalized, priority-ranked reduction tips
4. Create a weekly challenge tailored to their biggest impact area
5. Provide motivational messaging based on progress

**Prompt engineering highlights:**
- Structured JSON output format for reliable parsing
- Safety settings configured to block harmful content
- Temperature 0.4 for factual, practical advice
- Fallback insights if Gemini API is unavailable
- Rate-limited to 20 requests/hour/user

---

## 📊 Database Schema

9 models covering the complete domain:

```
User ──── UserProfile (diet, vehicle, energy use)
     ──── CarbonActivity (each logged activity)
     ──── MonthlyFootprint (pre-aggregated stats)
     ──── RefreshToken (JWT rotation)
     ──── UserAchievement → Achievement
     ──── UserChallenge → Challenge
     ──── AuditLog (security events)
```

---

## 🏆 Design Decisions

| Decision | Rationale |
|---|---|
| PostgreSQL over MongoDB | ACID compliance, better for financial-precision CO₂ data |
| Prisma ORM | Type-safe queries, automatic migration management, prevents SQL injection |
| JWT rotation | Prevents refresh token abuse; stolen tokens auto-expire on reuse detection |
| Gemini Flash model | Best speed/cost for real-time insights; free tier sufficient for hackathon |
| sessionStorage for tokens | Automatically cleared when browser closes — better security than localStorage |
| Zod for validation | Runtime type safety at API boundaries; shared schemas between frontend/backend |
| Recharts | Zero-dependency charts, fully typed, responsive out of the box |

---

## 📄 License

MIT License — See [LICENSE](./LICENSE)

---

## 👥 Built For

**Google Hack 2 Skill — Prompt Wars** · Challenge 3: Carbon Footprint Awareness Platform

*Built with AI assistance (Claude Code) · Frontend on Vercel · Backend on Railway*

---

> 🌱 *"The greatest threat to our planet is the belief that someone else will save it."*  
> — Robert Swan
