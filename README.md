# SubTrack

Anime & manga tracker — full-stack side project.

## Stack

- **Frontend**: React + TypeScript + Vite + Tailwind CSS + Zustand
- **Backend**: Spring Boot 3 + Spring Security + JPA/Hibernate
- **Database**: H2 (dev) / PostgreSQL (prod)
- **API**: Jikan v4 (MyAnimeList, no API key needed)

## Getting started

### Backend

```bash
cd backend
mvn spring-boot:run
# -> http://localhost:8080
# H2 console -> http://localhost:8080/h2-console (JDBC URL: jdbc:h2:file:./subtrack-dev)
```

### Frontend

```bash
cd frontend
npm install
npm run dev
# -> http://localhost:5173
```

The frontend proxies `/api` requests to the backend via Vite — no CORS configuration needed in development.

## Features

- JWT authentication (register / login / logout)
- Search anime & manga via Jikan API
- Add to personal list with status tracking (watching / completed / plan to watch / dropped / on hold)
- Detect already-tracked entries in search results — toggle add/remove directly
- Edit progress inline and change status from the list view
- Dashboard with stats (total, watching, completed, average score)
- Media metadata cache to reduce redundant Jikan API calls
- Strategy pattern for media providers — add new sources (AniList, Kitsu...) without touching existing code

## Architecture

### Backend

```
com.subtrack/
├── config/         AppConfig (WebClient bean)
├── controller/     AuthController, MediaController, ListController
├── dto/            Request/Response objects (LoginRequest, ListEntryResponse...)
├── entity/         User, UserMedia, MediaCache, MediaType, WatchStatus
├── media/          MediaProvider interface, JikanAnimeProvider, JikanMangaProvider, MediaProviderRegistry
├── repository/     UserRepository, UserMediaRepository, MediaCacheRepository
├── security/       JwtUtil, JwtFilter, SecurityConfig, UserDetailsServiceImpl
└── service/        AuthService, MediaService, ListService
```

### Frontend

```
src/
├── components/
│   ├── auth/       AuthGuard
│   └── layout/     Layout (sidebar + nav)
├── pages/          Dashboard, Search, MyList, Login, Register
├── services/       api.ts (axios + JWT interceptor)
├── store/          authStore, listStore (Zustand)
└── types/          TypeScript interfaces
```

## Roadmap

- [ ] Release radar (notifications for new episodes)
- [ ] Score & notes per entry
- [ ] Genre breakdown on dashboard
- [ ] PWA / mobile support (React Native reuse of store + API logic)
- [ ] Switch to PostgreSQL for production deployment