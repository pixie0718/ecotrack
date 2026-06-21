# 🌍 EcoTrack — Carbon Footprint Awareness Platform

> **Google Hack 2 Skill — Prompt Wars Challenge 3**
> Built with AI tools · Powered by Google Gemini

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](./LICENSE)
[![Node 20+](https://img.shields.io/badge/Node.js-20+-success?logo=node.js)](https://nodejs.org)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.6-blue?logo=typescript)](https://typescriptlang.org)
[![Gemini AI](https://img.shields.io/badge/Google_Gemini-1.5_Flash-blue?logo=google)](https://aistudio.google.com)
[![Security](https://img.shields.io/badge/Security-10_Layers-green)](./backend/src/middleware/)
[![Tests](https://img.shields.io/badge/Tests-passing-brightgreen)](./frontend/src/__tests__/)

### 🚀 Live Demo

| | URL |
|---|---|
| 🌐 **Frontend** | https://ecotrack-hope07.vercel.app |
| ⚙️ **Backend API** | https://ecotrack-production-b8c0.up.railway.app |
| ❤️ **Health Check** | https://ecotrack-production-b8c0.up.railway.app/health |

### 🔑 Demo Account

A pre-populated demo account is available to explore all features without signing up:

| Field | Value |
|---|---|
| **Email** | `demo@ecotrack.app` |
| **Password** | `Demo@1234` |

> The demo account has sample activities logged across all 5 categories so the dashboard, charts, streak, and AI insights are all populated and ready to explore.

---

## 🎯 Hackathon Submission Details

### Chosen Vertical

**Climate & Environment Tech** — Individual Carbon Footprint Awareness

EcoTrack addresses the growing need for personal climate action by giving individuals a clear, data-driven picture of their carbon footprint and an AI-powered path to reduce it.

---

### Approach & Logic

The core approach is: **measure → understand → reduce → track progress**.

**1. Measurement — Accurate CO₂ Calculation**

Every activity logged by the user (driving, flights, food consumption, energy use, shopping, waste) is converted to kilograms of CO₂-equivalent (CO₂e) using emission factors sourced from IPCC AR6, EPA, and GHG Protocol. For example:

```
Petrol car: 10 km × 0.192 kg CO₂e/km = 1.92 kg CO₂e
Beef:        1 kg × 27.0 kg CO₂e/kg  = 27.0 kg CO₂e
Electricity: 5 kWh × 0.233 kg CO₂e/kWh = 1.165 kg CO₂e
```

**2. Understanding — Contextual Benchmarking**

Raw CO₂ numbers are hard to interpret. EcoTrack contextualises every figure against:
- **World average**: ~475 kg CO₂/month per person
- **Paris Agreement target**: 167 kg CO₂/month per person (2,000 kg/year)
- **Tree equivalents**: 1 mature tree absorbs ~21 kg CO₂/year

**3. Reduce — AI-Powered Personalisation (Google Gemini)**

A structured prompt containing the user's monthly breakdown, world comparison, and profile data is sent to **Gemini 1.5 Flash**. The model returns JSON-structured insights including:
- A plain-language summary
- 5 prioritised, difficulty-tagged tips ranked by potential CO₂ saving
- A weekly challenge targeting the user's biggest impact category
- Motivational messaging calibrated to their progress

**4. Track Progress — Streak + Trend System**

Daily logging is incentivised through a 7-day streak widget. Monthly trend charts show reduction over time, and a baseline footprint (calculated from the user's profile: diet type, vehicle, home energy) gives a personalised reduction goal.

---

### How the Solution Works

```
User logs activity
       │
       ▼
Frontend (React + React Hook Form + Zod)
  ─ validates input client-side
  ─ sends POST /api/v1/carbon/activities
       │
       ▼
Backend (Express + TypeScript)
  ─ auth middleware verifies JWT
  ─ Zod schema validates body
  ─ CarbonService multiplies quantity × emission factor
  ─ stores CarbonActivity in PostgreSQL via Prisma
  ─ invalidates cached dashboard stats
       │
       ▼
Dashboard stats recomputed on next GET /carbon/dashboard
  ─ today / thisWeek / thisMonth aggregations
  ─ category breakdown (transport, energy, food, shopping, waste)
  ─ comparison to world avg + Paris target
  ─ recentActivities list
       │
       ▼
AI Insights (GET /carbon/insights)
  ─ builds structured prompt from user's data snapshot
  ─ calls Gemini 1.5 Flash API
  ─ parses JSON response → 5 tips + challenge + summary
  ─ cached 30 min / rate-limited 20 req/hour/user
       │
       ▼
Frontend renders:
  ─ StatsCards (today / week / month / reduction)
  ─ TrendChart + CategoryPieChart (Recharts)
  ─ Streak widget (7-day dot grid)
  ─ AI chatbot (pattern-matched + Gemini fallback)
```

**Key architectural decisions:**

| Decision | Rationale |
|---|---|
| PostgreSQL + Prisma | ACID compliance for financial-precision CO₂ data; type-safe, parameterised queries |
| JWT with rotation | Refresh token reuse detection auto-revokes all tokens — prevents credential stuffing |
| Gemini Flash | Best speed/cost ratio; free tier supports hackathon scale; structured JSON output |
| React Query | Server-state caching with staleTime avoids redundant API calls; instant UI via cache |
| Zod (frontend + backend) | Runtime schema validation at every trust boundary — prevents malformed data |
| sessionStorage for tokens | Auto-cleared on tab close; better security than localStorage |
| Custom hooks (`useStreak`, `useDashboardStats`) | Encapsulates data-fetching logic; keeps page components focused on rendering |

---

### Assumptions Made

1. **Emission factors are averages** — country-specific grid electricity factors, regional transport emissions, and local food production vary. We use global averages from IPCC/EPA as a reasonable baseline for a general-audience tool.

2. **Paris target per capita** — the 167 kg/month figure (2,000 kg/year) is a simplified per-capita interpretation of the Paris Agreement target. In practice, targets are set at a national level and vary by development status.

3. **Tree absorption rate** — 21 kg CO₂/year per mature tree is the commonly cited IPCC midpoint. Real absorption varies by species, age, and climate.

4. **Single user = single household contributor** — we calculate individual footprint without splitting household shared emissions (e.g., home energy is attributed fully to the logged user).

5. **Waste savings are real savings** — recycling and composting entries are entered as negative CO₂e (savings), which reduces the user's net monthly footprint. This models the avoided emissions from displaced virgin material production.

6. **Gemini API availability** — AI Insights require a valid `GEMINI_API_KEY`. A static fallback is shown if the API is unavailable or rate-limited.

---

## 📌 Overview

**EcoTrack** is a full-stack Carbon Footprint Awareness Platform that helps individuals:

- **Understand** their carbon footprint through detailed activity logging and real-time calculations
- **Track** emissions across 5 categories: Transport, Energy, Food, Shopping, and Waste
- **Reduce** their impact through AI-powered personalised insights (Google Gemini) and gamified challenges

### Key Highlights

| Feature | Details |
|---|---|
| 🤖 **AI-Powered** | Google Gemini 1.5 Flash generates personalised reduction strategies |
| 🔒 **Security-First** | 10+ layers of security, JWT with rotation, rate limiting, CSP headers |
| 📊 **Data-Driven** | 50+ emission factors from IPCC/EPA data, accurate CO₂ calculations |
| 🎮 **Gamified** | Daily streak, challenges, points system for sustained engagement |
| 🐳 **Production-Ready** | Docker Compose, GitHub Actions CI/CD, multi-stage builds |
| 📱 **Responsive** | Mobile-first React UI — bottom nav, full touch support |
| ✅ **Tested** | Unit tests for utility functions and streak logic (Vitest) |

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                        CLIENT LAYER                          │
│  React 18 + TypeScript + Vite + Tailwind CSS + Zustand      │
│  React Query (caching) · Recharts (visualisations)          │
│  React Hook Form + Zod (client-side validation)             │
│  Custom hooks: useStreak · useDashboardStats                 │
└──────────────────────────┬──────────────────────────────────┘
                           │ HTTPS / REST API
┌──────────────────────────▼──────────────────────────────────┐
│                      API LAYER (Express.js)                  │
│                                                              │
│  Security Middleware Stack:                                  │
│  Helmet → CORS → Rate Limiting → Sanitisation → HPP         │
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
│   Parameterised queries│   │   Rate-limited · Cached 30min │
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
│   │   │   ├── ui/             # Button, Card, Input, ErrorBoundary (design system)
│   │   │   ├── layout/         # Sidebar, AppLayout (mobile bottom nav)
│   │   │   ├── carbon/         # ActivityLogger, FootprintChart
│   │   │   ├── dashboard/      # StatsCard, DashboardChat (AI chatbot)
│   │   │   └── insights/       # AIInsightsPanel
│   │   ├── constants/          # carbon.ts — Paris target, stale times, tips
│   │   ├── hooks/              # useStreak, useDashboardStats (custom React hooks)
│   │   ├── pages/              # Route-level components
│   │   ├── services/           # API layer (axios + interceptors)
│   │   ├── store/              # Zustand auth + theme stores
│   │   ├── types/              # Shared TypeScript types
│   │   ├── utils/              # formatters.ts, streak.ts, cn.ts
│   │   └── __tests__/          # Vitest unit tests
│   └── vitest.config.ts        # Test configuration
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

### Layer 2: CORS (Whitelist-based)
- Strict origin whitelist from environment config
- Suspicious origins logged to security log

### Layer 3: Rate Limiting
| Endpoint | Window | Max Requests |
|---|---|---|
| General API | 15 min | 100 |
| Auth (login/register) | 15 min | 10 (failed only) |
| AI Insights | 1 hour | 20 per user |

### Layer 4: Input Validation (Zod + Sanitisation)
- All request bodies validated with Zod schemas before reaching controllers
- HTTP Parameter Pollution prevention (hpp)
- Request body size limits (10kb)

### Layer 5: Authentication (JWT with Rotation)
- Short-lived access tokens (15 minutes)
- Long-lived refresh tokens (7 days) with **rotation on every use**
- Refresh token reuse detection → auto-revoke all user tokens

### Layer 6: Password Security
- bcrypt with 12 salt rounds
- Constant-time comparison (prevents timing attacks)
- Dummy hash comparison even when user doesn't exist

### Layer 7: Data Access (Prisma ORM)
- 100% parameterised queries — no raw SQL string concatenation
- Row-level security: every query scoped to authenticated userId

### Layer 8: Audit Logging
- All auth events logged (login, logout, failed attempts, token reuse)
- Security warnings logged (CORS violations, suspicious inputs)

### Layer 9: Infrastructure
- Docker non-root user (UID 1001)
- Multi-stage Docker builds (no dev dependencies in production)
- Secret management via environment variables

### Layer 10: Frontend Security
- Tokens in sessionStorage (cleared on tab close)
- Automatic token refresh via axios interceptor
- React ErrorBoundary for graceful failure handling
- DOMPurify available for XSS prevention

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
Paris target: 167 kg CO₂/month per person

---

## 🧪 Testing

```bash
# Frontend unit tests (Vitest)
cd frontend
npm install
npm test

# Backend unit + integration tests
cd backend
npm test

# Run with coverage
npm test -- --coverage
```

**Frontend test coverage:**
- `formatters.test.ts` — CO₂ formatting, percentage, tree equivalent
- `streak.test.ts` — streak calculation, edge cases (gaps, deduplication, empty)

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
docker compose up --build -d
docker compose exec backend npx prisma migrate deploy
docker compose exec backend npm run prisma:seed
open http://localhost
```

### 3. Option B: Local Development

```bash
# Backend
cd backend && npm install
npx prisma migrate dev
npm run prisma:seed
npm run dev

# Frontend (new terminal)
cd frontend && npm install
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
| POST | `/carbon/challenges/:id/join` | Join a challenge |

### Health

```
GET /health  → { status: "healthy", version: "v1", ... }
```

---

## 🌐 Deployment

### Environment Variables (Required)

```env
DATABASE_URL=postgresql://...
JWT_ACCESS_SECRET=<64+ char random string>
JWT_REFRESH_SECRET=<64+ char random string>
GEMINI_API_KEY=<your-gemini-api-key>
CORS_ORIGINS=https://yourdomain.com
BCRYPT_SALT_ROUNDS=12
```

### Live Deployment

| Layer | Platform | URL |
|---|---|---|
| Frontend | **Vercel** | https://ecotrack-hope07.vercel.app |
| Backend API | **Railway** | https://ecotrack-production-b8c0.up.railway.app |
| Database | **Railway PostgreSQL** | Internal (not public) |

---

## 🤖 AI Integration (Google Gemini)

The AI Insights feature uses **Gemini 1.5 Flash** to:

1. Analyse the user's monthly carbon breakdown by category
2. Compare against world average and Paris Climate Target
3. Generate 5 personalised, priority-ranked reduction tips
4. Create a weekly challenge targeting the user's biggest impact area
5. Provide motivational messaging calibrated to their progress

**Prompt engineering highlights:**
- Structured JSON output format for reliable parsing
- Safety settings configured to block harmful content
- Temperature 0.4 for factual, practical advice
- Graceful fallback if Gemini API is unavailable
- Rate-limited to 20 requests/hour/user, cached 30 minutes

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

## 📄 License

MIT License — See [LICENSE](./LICENSE)

---

## 👥 Built For

**Google Hack 2 Skill — Prompt Wars** · Challenge 3: Carbon Footprint Awareness Platform

*Frontend on Vercel · Backend on Railway · AI by Google Gemini*

---

> 🌱 *"The greatest threat to our planet is the belief that someone else will save it."*
> — Robert Swan
