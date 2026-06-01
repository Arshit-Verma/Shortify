# Shortify - Quick Reference Card

## 🚀 Getting Started (5 minutes)

### 1. Set Supabase Keys
```bash
# Fill these in backend/.env
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

### 2. Run Migration
Copy/paste SQL from `backend/src/db/migrations/001-initial-schema.sql` into Supabase SQL Editor

### 3. Start Backend
```bash
cd backend
npm install
npm run dev
# Listen on http://localhost:4000
```

### 4. Start Frontend
```bash
cd frontend
npm install
npm run dev
# Open http://localhost:5173
```

---

## 📝 Core Features

| Feature | Implementation |
|---------|---|
| **Create short link** | POST /api/shorten with URL validation & SSRF check |
| **Redirect** | GET /r/:code with async click recording |
| **List links** | GET /api/links filtered by owner_token |
| **Click tracking** | Incremented on redirect, stored in DB |
| **Session** | UUID owner_token in localStorage (anonymous) |
| **Theme** | Dark (#0a0e27) + Yellow (#ffd400), no glows |
| **Mobile** | Hamburger icon, responsive layout |

---

## 🔒 Security Built-In

✅ SSRF blocking (private IPs)
✅ URL validation & length limits
✅ Rate limiting (10/15min per IP)
✅ Owner token auth
✅ Hashed IPs (no raw logs)
✅ CORS restricted
✅ No stack traces exposed

---

## 📂 Project Layout

```
backend/
  src/
    index.ts          # Start here
    app.ts            # Express setup
    routes/           # API endpoints
    services/         # Business logic
    middleware/       # Auth, rate limit
    utils/            # Validators, config
  package.json
  .env.example       ← Fill this in

frontend/
  src/
    main.tsx          # React entry
    App.tsx           # Root layout
    pages/            # Dashboard
    components/       # UI components
    styles/           # theme.css (dark-yellow)
    utils/            # API client
  index.html
  package.json
  .env.example       ← Fill this in

database/
  migrations/
    001-initial-schema.sql ← Run in Supabase

README.md          # Full docs
SETUP.md           # Setup guide
```

---

## 🧪 Test It

```bash
# Terminal 1: Backend
cd backend && npm run dev

# Terminal 2: Frontend  
cd frontend && npm run dev

# Browser: http://localhost:5173
# 1. Paste URL → click "Shorten URL"
# 2. Click "Copy" to get short link
# 3. Click "Open" to test redirect
# 4. Check click count incremented
```

---

## 🌐 API Cheat Sheet

### Create Link
```bash
curl -X POST http://localhost:4000/api/shorten \
  -H "Content-Type: application/json" \
  -d '{"target_url":"https://example.com"}'

# Response: { short_url, short_code, ... }
# Response header: X-Owner-Token (if new)
```

### List Links
```bash
curl http://localhost:4000/api/links \
  -H "X-Owner-Token: your-token-here"

# Response: [{ short_code, click_count, ... }]
```

### Redirect
```bash
curl -L http://localhost:4000/r/aZ3x9k

# Response: 302 redirect to target_url
# Side effect: click_count +1
```

### Health
```bash
curl http://localhost:4000/health
# Response: { status: "ok" }
```

---

## 📊 Database Schema (Quick)

### links
- `id` (uuid, pk)
- `short_code` (varchar 12, unique)
- `target_url` (text)
- `owner_token` (varchar 64)
- `click_count` (bigint)
- `created_at`, `last_click_at` (timestamptz)

### clicks
- `id` (bigserial, pk)
- `link_id` (uuid fk)
- `ip_hash` (varchar 128, hashed)
- `user_agent`, `referrer` (text)
- `occurred_at` (timestamptz)

---

## 🚨 Common Issues

| Problem | Solution |
|---------|----------|
| **"CORS error"** | Add frontend URL to ALLOWED_ORIGINS in backend/.env |
| **"SUPABASE_SERVICE_ROLE_KEY invalid"** | Use Service Role Secret (not Anon key) |
| **"Cannot POST /api/shorten"** | Backend not running; check port 4000 |
| **"Cannot reach backend"** | Check VITE_API_URL in frontend/.env |
| **"Click count not updating"** | Wait 2-3 seconds, refresh page |
| **"404 on /r/:code"** | Short code not found; check Supabase links table |

---

## 📈 Performance

- Redirect latency: ~50ms (single DB read + 302 response)
- Click write: Async (non-blocking)
- Throughput: 100-1000 redirects/sec per instance
- Scaling: Horizontal (stateless servers)

---

## 🎨 Customization

### Theme Colors
Edit `frontend/src/styles/theme.css`:
```css
:root {
  --color-bg-primary: #0a0e27;    /* Dark background */
  --color-text-primary: #ffd400;  /* Yellow text */
  --color-accent: #ffd400;         /* Yellow buttons */
}
```

### Short Code Length
Edit `backend/src/services/shortener.ts`:
```ts
const SHORT_CODE_LENGTH = 6; // Change to 8 for longer codes
```

### Rate Limit
Edit `backend/src/middleware/rateLimiter.ts`:
```ts
max: 10,                          // Requests per window
windowMs: 15 * 60 * 1000,        # 15 minutes
```

---

## 📚 Full Documentation

- **README.md**: Architecture, features, API reference
- **SETUP.md**: Step-by-step local setup

---

## 🎯 Development Commands

```bash
# Backend
cd backend && npm run dev        # Start dev server
cd backend && npm run build      # Build for production
cd backend && npm run lint       # Check code style

# Frontend
cd frontend && npm run dev       # Start Vite dev server
cd frontend && npm run build     # Build for production
cd frontend && npm run lint      # Check code style
```

---

**Ready to launch? Start with SETUP.md!**
