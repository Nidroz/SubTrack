# SubTrack

Anime & manga tracker — full-stack side project.

## Stack

- **Frontend**: React + TypeScript + Vite + Zustand + CSS Modules
- **Backend**: FastAPI + SQLite
- **API**: Jikan v4 (MyAnimeList, no API key needed)

## Getting started

### Backend

```bash
cd backend
pip install -r requirements.txt.txt
uvicorn app.main:app --reload
# -> http://localhost:8000
```

### Frontend

```bash
cd frontend
npm install
npm run dev
# -> http://localhost:5173
```

## Features (MVP)

- Search anime & manga via Jikan API
- Add to personal list (watching / completed / plan to watch / dropped / on hold)
- Track episode/chapter progress
- Dashboard with stats
- Media cache to reduce API calls

## Roadmap

- [ ] JWT auth (multi-user)
- [ ] Release radar (new episode notifications)
- [ ] Score & notes per entry
- [ ] Genre stats on dashboard
- [ ] Dark/light theme toggle

## Structure

```
subtrack/
├── backend/
│   └── app/
│       ├── main.py         # FastAPI app + CORS
│       ├── db/             # SQLite init & connection
│       ├── routers/        # auth, media, lists
│       └── services/       # Jikan API client
└── frontend/
    └── src/
        ├── pages/          # Dashboard, Search, MyList
        ├── components/     # Layout
        ├── store/          # Zustand global state
        ├── services/       # axios API client
        └── types/          # TypeScript interfaces
```