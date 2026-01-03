# SAYU Project Documentation

> **Generated:** 2026-01-03
> **Type:** Monorepo (Multi-part)
> **Scan Level:** Deep
> **Tool:** BMad Method document-project

---

## 📋 Project Overview

**SAYU** is an AI-powered art life platform that connects users with art through personalized recommendations based on their emotional states and personality types (16 APT types).

**Project Root:** `/c/Users/SAMSUNG/documents/github/sayu`

---

## 🏗️ Architecture

### Repository Structure: Monorepo

SAYU is organized as a monorepo with multiple interconnected parts:

```
sayu/
├── frontend/          # Next.js 15 + React 19 web application
├── backend/           # Node.js Express API server
├── shared/            # Shared TypeScript types and utilities
├── artvee-crawler/    # Artvee art data crawler
├── met-crawler/       # Metropolitan Museum API crawler
├── scripts/           # Utility scripts and automation
├── _bmad/             # BMad Method framework
└── docs/              # Project documentation
```

---

## 🎯 Core Parts

### 1. Frontend (`frontend/`)

**Type:** Web Application
**Framework:** Next.js 15 (App Router)
**Language:** TypeScript 5
**UI Library:** React 19

**Key Technologies:**
- **Styling:** Tailwind CSS 3.4, Framer Motion 12
- **State:** Zustand 5.0, TanStack React Query 5
- **Auth:** Clerk, Supabase Auth
- **Database:** Supabase (PostgreSQL)
- **AI:** OpenAI GPT-4, Groq, Replicate
- **Forms:** React Hook Form, Zod
- **UI Components:** Radix UI, custom components

**Statistics:**
- 494 React components
- 69 API routes (Next.js API)
- App Router architecture

**Key Features:**
- 16 APT personality types system
- Exhibition browsing and recording
- AI art recommendations
- User profiles with personality-based theming
- Real-time exhibition tracking
- Art counselor chatbot
- Community features

**Recent Development:**
- Exhibition recording system (Phase 1 MVP)
  - Start/end visit tracking
  - Artwork emotion recording
  - Real-time timer and progress
  - Toast notifications
  - Error handling improvements

---

### 2. Backend (`backend/`)

**Type:** Backend API Server
**Runtime:** Node.js
**Framework:** Express 4
**Language:** JavaScript (transitioning to TypeScript)

**Key Technologies:**
- **Database:** Supabase PostgreSQL
- **Auth:** Supabase Auth
- **Storage:** Cloudinary (images)
- **Caching:** Planned (Redis)
- **APIs:** Google Places, Foursquare, Culture Data

**Key Services:**
- Art recommendation engine
- Exhibition data collection
- User profile management
- API integrations (museums, galleries)
- Cron jobs for data updates

**Database:**
- 43 SQL migrations
- Supabase PostgreSQL with Row Level Security (RLS)
- pgvector for AI embeddings
- Full-text search

---

### 3. Shared (`shared/`)

**Type:** Library
**Language:** TypeScript

**Purpose:**
- Shared type definitions
- Common utilities
- API contracts between frontend/backend

**Key Exports:**
- `exhibition-recording-types.ts` - Exhibition system types
- Type-safe API contracts

---

### 4. Data Crawlers

#### Artvee Crawler (`artvee-crawler/`)
- Collects public domain artwork data
- Node.js + Cheerio web scraping

#### MET Crawler (`met-crawler/`)
- Metropolitan Museum API integration
- Artwork metadata collection

---

### 5. Scripts (`scripts/`)

**Utility Scripts:**
- Database migrations and seeding
- Exhibition data import
- Image processing
- Data validation
- Automation tools

**Recent Scripts:**
- `insert-exhibition-sample-data.ts` - Sample artwork insertion

---

## 🗄️ Database Architecture

**Platform:** Supabase (PostgreSQL + PostgREST)

**Key Tables:**
- `users` - User profiles with APT personality types
- `exhibitions` - Exhibition data (domestic + global)
- `exhibition_visits` - User visit tracking
- `exhibition_artworks` - Artwork catalog
- `artwork_records` - User emotion records
- `quiz_results` - APT personality quiz results
- `art_profiles` - AI-generated art profiles
- Custom tables for features (matching, chat, collections, etc.)

**Features:**
- Row Level Security (RLS) for data protection
- pgvector extension for AI embeddings
- Full-text search capabilities
- Real-time subscriptions
- Automatic migrations via SQL files

---

## 🔑 Key Features

### 1. APT Personality System
- 16 personality types (e.g., LAEF, SAEF)
- Personality quiz
- Personalized UI themes per type
- Art recommendations based on personality

### 2. Exhibition System
- Browse domestic and global exhibitions
- Exhibition details with venue information
- **NEW: Recording System (Phase 1 MVP)**
  - Start/end visit tracking with timer
  - Search and record artworks
  - Emotion selection (8 base emotions)
  - Real-time progress tracking
  - Offline support foundation

### 3. AI Features
- Art profile generation
- Emotion-based art recommendations
- Art counselor chatbot
- Smart emotion suggestions

### 4. Community
- User profiles
- Following system
- Art collections
- Shared experiences

---

## 🛠️ Technology Stack

### Frontend Stack
```
Next.js 15 (App Router)
React 19
TypeScript 5
Tailwind CSS 3.4
Framer Motion 12
Zustand 5.0
TanStack React Query 5
Supabase Client 2.51
```

### Backend Stack
```
Node.js
Express 4
Supabase PostgreSQL
Cloudinary (images)
PM2 (process management)
```

### Development Tools
```
TypeScript 5
ESLint
Prettier
Git
BMad Method (AI-assisted development)
```

### AI/ML
```
OpenAI GPT-4 (recommendations, chatbot)
Groq (fast inference)
Replicate (art generation)
pgvector (embeddings)
```

---

## 📦 Dependencies

### Production
- **UI:** `@radix-ui/*`, `framer-motion`, `lucide-react`
- **State:** `zustand`, `@tanstack/react-query`
- **Forms:** `react-hook-form`, `zod`
- **Database:** `@supabase/supabase-js`
- **AI:** `openai`, `groq-sdk`, `replicate`
- **Utils:** `axios`, `cheerio`, `dotenv`

### Development
- **Build:** `next`, `typescript`, `cross-env`
- **Linting:** `eslint`, `@typescript-eslint/*`
- **Testing:** Planned (Jest, Playwright)

---

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- npm or yarn
- Supabase account
- API keys (OpenAI, Cloudinary, etc.)

### Installation

```bash
# Clone repository
git clone https://github.com/commet/SAYU.git
cd sayu

# Install dependencies (monorepo)
npm install

# Setup environment variables
cp frontend/.env.example frontend/.env.local
cp backend/.env.example backend/.env

# Configure .env files with your API keys
```

### Development

```bash
# Run frontend (port 3000)
npm run dev:frontend

# Run backend (port 3007)
npm run dev:backend

# Run both
npm run dev:frontend & npm run dev:backend
```

### Build

```bash
# Build shared types
npm run build:shared

# Build frontend
cd frontend && npm run build

# Type check
npm run typecheck
```

---

## 📁 Key Directories

### Frontend Structure
```
frontend/
├── app/                    # Next.js App Router
│   ├── api/               # API routes (69 routes)
│   ├── exhibitions/       # Exhibition pages
│   ├── profile/           # User profiles
│   └── ...
├── components/            # React components (494 files)
│   ├── exhibition/        # Exhibition recording components
│   ├── chatbot/          # AI chatbot
│   ├── ui/               # Reusable UI components
│   └── ...
├── lib/                   # Utilities
│   ├── stores/           # Zustand stores
│   ├── supabase/         # Supabase client
│   └── ...
├── hooks/                # Custom React hooks
├── contexts/             # React contexts
└── styles/               # Global styles
```

### Backend Structure
```
backend/
├── src/
│   ├── server.js         # Express server
│   ├── routes/           # API routes
│   ├── services/         # Business logic
│   └── scripts/          # Database scripts
├── migrations/           # SQL migrations (43 files)
└── sayu-living-server.js # Main entry point
```

---

## 🔄 Recent Changes

### Latest Updates (2026-01-03)

1. **Exhibition Recording System (Phase 1 MVP)**
   - Database schema (3 tables)
   - API routes (4 endpoints)
   - Frontend components (6 components)
   - Error handling improvements
   - Toast notifications
   - Sample data automation

2. **Error Handling Enhancements**
   - Network timeout handling (AbortController)
   - HTTP status-specific errors
   - User-friendly Korean messages
   - Authentication checks
   - Data validation (UUID, emotions limit)

3. **BMad Method Integration**
   - Installed BMad Method v6 alpha
   - Workflow tracking system
   - Project documentation workflow

---

## 🎨 Design Philosophy

**Core Principles:**
- **User-centered:** 16 APT personality types for personalization
- **Emotion-driven:** Art recommendations based on feelings
- **Community-focused:** Shared experiences and connections
- **AI-powered:** Intelligent recommendations and chatbot
- **Beautiful UX:** Framer Motion animations, Tailwind styling

---

## 🔐 Environment Variables

### Frontend (.env.local)
```
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
OPENAI_API_KEY=
GROQ_API_KEY=
REPLICATE_API_TOKEN=
NEXT_PUBLIC_KAKAO_CLIENT_ID=
```

### Backend (.env)
```
SUPABASE_URL=
SUPABASE_SERVICE_KEY=
CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=
OPENAI_API_KEY=
```

---

## 📊 Project Metrics

- **Total Components:** 494 (Frontend)
- **API Routes:** 69 (Next.js API)
- **Database Migrations:** 43
- **Languages:** TypeScript, JavaScript
- **Framework:** Next.js 15, React 19
- **Database:** PostgreSQL (Supabase)
- **Lines of Code:** ~100,000+ (estimated)

---

## 🗺️ Development Roadmap

### Completed ✅
- Phase 1 MVP: Exhibition Recording System
- 16 APT Personality System
- Basic AI recommendations
- User authentication
- Exhibition browsing

### In Progress 🚧
- BMad Method integration
- Project documentation
- Performance optimization

### Planned 📅
- Phase 2: Photo recognition (pHash)
- Phase 3: Full offline support
- Phase 4: AI insights and analytics
- Mobile app (React Native)
- Advanced AI features

---

## 🤝 Contributing

This is a personal project currently under active development with BMad Method framework.

---

## 📄 License

Private - All rights reserved

---

## 📞 Contact

For questions or collaboration: [GitHub](https://github.com/commet/SAYU)

---

**Last Updated:** 2026-01-03
**Documentation Tool:** BMad Method document-project (Deep Scan)
**Status:** Active Development
