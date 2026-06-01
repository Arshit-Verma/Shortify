# Shortify Setup Guide

## Step-by-Step Setup Instructions

### 1. Database Setup (Supabase)

1. Go to [supabase.com](https://supabase.com) and create a project
2. Once created, go to **Settings → API**
3. Copy and save:
   - **Project URL** (looks like `https://xxxxx.supabase.co`)
   - **Service Role Secret** (⚠️ NOT the Anon key)

4. Open **SQL Editor** in Supabase and run this migration:

```sql
create extension if not exists pgcrypto;

create table if not exists links (
  id uuid primary key default gen_random_uuid(),
  short_code varchar(12) not null unique,
  target_url text not null,
  owner_token varchar(64),
  click_count bigint not null default 0,
  created_at timestamptz not null default now(),
  last_click_at timestamptz
);

create index if not exists idx_links_short_code on links(short_code);
create index if not exists idx_links_owner_token on links(owner_token);

create table if not exists clicks (
  id bigserial primary key,
  link_id uuid references links(id) on delete cascade not null,
  occurred_at timestamptz not null default now(),
  ip_hash varchar(128),
  user_agent text,
  referrer text
);

create index if not exists idx_clicks_link_id on clicks(link_id);

create or replace function increment_click_count(link_id uuid)
returns bigint as $$
  declare
    new_count bigint;
  begin
    update links
    set click_count = click_count + 1,
        last_click_at = now()
    where id = link_id
    returning click_count into new_count;
    return new_count;
  end;
$$ language plpgsql;
```

### 2. Backend Setup

```bash
cd backend
cp .env.example .env
```

Edit `backend/.env` with your Supabase credentials:

```env
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here
BASE_URL=http://localhost:5173
PORT=4000
IP_HASH_SECRET=generate_a_random_32_character_string_here
ALLOWED_ORIGINS=http://localhost:5173,http://localhost:3000
NODE_ENV=development
```

Then install and run:

```bash
npm install
npm run dev
```

Output should show:
```
✓ Shortify backend running on http://localhost:4000
```

### 3. Frontend Setup

```bash
cd frontend
cp .env.example .env.local
```

Edit `frontend/.env.local`:

```env
VITE_API_URL=http://localhost:4000
```

Then install and run:

```bash
npm install
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

### 4. Test It Out

1. **Create a short link**: Paste a URL like `https://www.example.com/very/long/path?param=value` into the form
2. **Copy the short link**: Click the "Copy" button to copy the short URL
3. **Visit the link**: Click "Open" to test the redirect
4. **Check analytics**: The click count should increment on the dashboard

## Troubleshooting

### "SUPABASE_SERVICE_ROLE_KEY is invalid"

- Make sure you're using the **Service Role Secret** (not the Anon key)
- Service Role Secret starts with `sb_service_role_`
- Check that there are no extra spaces or line breaks when copying

### "CORS error in browser console"

- Check that `ALLOWED_ORIGINS` in `backend/.env` includes `http://localhost:5173`
- Make sure you restarted the backend after changing .env

### "Cannot POST /api/shorten"

- Backend is not running; make sure `npm run dev` is executed in the backend folder
- Check that the backend is listening on port 4000

### "Cannot reach backend from frontend"

- Check that the frontend's `VITE_API_URL` matches the backend's listening address
- Should be `http://localhost:4000` for local development

### "Frontend won't load"

- Frontend is not running; make sure `npm run dev` is executed in the frontend folder
- Check that you're accessing http://localhost:5173 (not http://localhost:4000)

### "Click count not updating"

- Click recording happens asynchronously; wait a few seconds and refresh
- Check backend logs for errors
- Ensure the `clicks` table was created in the database migration

## Development Commands

### Backend

```bash
cd backend
npm run dev       # Start with hot-reload (ts-node-dev)
npm run build     # Compile TypeScript to dist/
npm run lint      # Check code style
```

### Frontend

```bash
cd frontend
npm run dev       # Start Vite dev server (hot-reload)
npm run build     # Create production build
npm run preview   # Preview production build locally
npm run lint      # Check code style
```

## Next Steps

- Read the main [README.md](../README.md) for full documentation
- Check the [QUICKREF.md](../QUICKREF.md) for API examples and shortcuts
- Review the code in `backend/src/` and `frontend/src/`
- Deploy to production when ready
