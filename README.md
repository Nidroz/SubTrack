# SubTrack

Anime & manga tracker full-stack. Recherche, suis ta progression, découvre de nouveaux titres.

## Stack

**Backend** — Spring Boot 3 · Spring Security · JPA/Hibernate · H2 (dev) / PostgreSQL (prod)  
**Frontend** — React 18 · TypeScript · Vite · Tailwind CSS · Zustand  
**API externe** — Jikan v4 (MyAnimeList, pas de clé nécessaire)  
**Email** — JavaMailSender + Mailtrap (dev) / Brevo (prod)  
**Cache** — Caffeine (in-memory, TTL 10 min)  
**Déploiement** — Vercel (frontend) + Render (backend + PostgreSQL)

## Fonctionnalités

- **Auth** — inscription/connexion, JWT access token (15 min) + refresh token (30 jours), blacklist à la déconnexion, rate limiting (10 req/min sur login/register)
- **Sécurité** — reset password par email, changement d'email avec confirmation, tokens UUID à usage unique (1h), rôles USER/ADMIN, compte admin créé automatiquement au démarrage
- **Liste** — ajouter/retirer des anime & manga, suivre sa progression (épisodes/chapitres), changer de statut (Watching, Completed, Plan to watch, Dropped, On hold), pagination côté serveur avec choix du nombre d'items (15/30/50), tri et filtres
- **Search** — recherche avec persistance dans l'URL, pagination avec numéros de page et jump-to-page, choix 12/24 résultats par page, filtre de contenu Safe/All/Not Safe, bouton Surprise me
- **Discover** — Top Airing, Most Popular, For You (recommandations basées sur ta liste), Surprise me, pagination avec jump-to-page, choix 12/24 résultats par page, filtre de contenu Safe/All/Not Safe
- **Filtre de contenu** — Safe (sfw Jikan), All (pas de filtre), Not Safe (rating=rx) — Not Safe visible uniquement si activé dans le profil, avec avertissement 18+ à la première utilisation
- **Profil** — stats (anime/manga trackés, score moyen, temps regardé estimé, distribution des scores), changement de pseudo et photo de profil avec recadrage interactif, changement de mot de passe et d'email, toggle contenu explicite
- **Admin** — gestion des utilisateurs (promouvoir/rétrograder/supprimer), stats globales, gestion du cache média
- **Cache** — résultats Jikan mis en cache en mémoire (Caffeine, TTL 10 min), clé incluant le filtre de contenu pour éviter les collisions
- **UX** — pages 404, loader de démarrage, Error Boundary React, refresh silencieux du token expiré dans AuthGuard

## Démarrage rapide

### Backend

```bash
cd backend
./mvnw spring-boot:run
```

Le serveur démarre sur `http://localhost:8080`.  
Un compte admin est créé automatiquement au premier démarrage (voir `application.properties`).

### Frontend

```bash
cd frontend
npm install
npm run dev
```

Le frontend démarre sur `http://localhost:5173` avec proxy Vite vers le backend.

## Configuration

`backend/src/main/resources/application.properties` :

```properties
# serveur
server.port=8080

# base de données (H2 fichier pour dev)
spring.datasource.url=jdbc:h2:file:./subtrack-dev
spring.h2.console.enabled=true

# JWT
app.jwt.secret=change-me-in-prod-at-least-32-chars-long-secret
app.jwt.expiration-ms=900000
app.jwt.refresh-expiration-days=30

# email (Mailtrap pour dev)
spring.mail.host=sandbox.smtp.mailtrap.io
spring.mail.port=2525
spring.mail.username=MAILTRAP_USERNAME
spring.mail.password=MAILTRAP_PASSWORD
spring.mail.properties.mail.smtp.auth=true
spring.mail.properties.mail.smtp.starttls.enable=true
app.mail.from=noreply@subtrack.dev
app.frontend.url=http://localhost:5173

# compte admin par défaut
app.admin.username=admin
app.admin.email=admin@subtrack.dev
app.admin.password=admin1234
```

## Déploiement (Vercel + Render)

L'application est pensée pour être déployée gratuitement sur :
- **Vercel** pour le frontend React
- **Render** pour le backend Spring Boot + PostgreSQL

### Variables d'environnement Render (backend)

| Variable | Description |
|----------|-------------|
| `SPRING_PROFILES_ACTIVE` | `prod` |
| `DB_URL` | Injecté automatiquement par Render |
| `DB_USER` | Injecté automatiquement par Render |
| `DB_PASSWORD` | Injecté automatiquement par Render |
| `JWT_SECRET` | Généré automatiquement par Render |
| `MAIL_HOST` | ex. `smtp-relay.brevo.com` |
| `MAIL_PORT` | ex. `587` |
| `MAIL_USERNAME` | Login SMTP Brevo |
| `MAIL_PASSWORD` | Clé SMTP Brevo |
| `MAIL_FROM` | ex. `noreply@subtrack.dev` |
| `FRONTEND_URL` | URL Vercel ex. `https://subtrack.vercel.app` |

### Variable d'environnement Vercel (frontend)

| Variable | Description |
|----------|-------------|
| `VITE_API_URL` | URL du backend Render ex. `https://subtrack-backend.onrender.com` |

### Eviter le cold start (Render free tier)

Le backend Render se met en veille après 15 min d'inactivité. Pour l'éviter, configure **UptimeRobot** (gratuit) pour pinger `/api/health` toutes les 5 minutes.

## Structure du projet

```
subtrack/
├── backend/
│   ├── Dockerfile
│   └── src/main/java/com/subtrack/
│       ├── config/          # AppConfig, CacheConfig, DataInitializer
│       ├── controller/      # AuthController, MediaController, ListController,
│       │                    # ProfileController, AdminController, HealthController
│       ├── dto/             # Request/Response DTOs
│       ├── entity/          # User, UserMedia, MediaCache, ContentFilter, tokens...
│       ├── media/           # Strategy pattern providers (Jikan anime/manga), ProviderUtils
│       ├── repository/      # Spring Data JPA repositories
│       ├── security/        # JwtUtil, JwtFilter, RateLimitFilter, SecurityConfig
│       └── service/         # AuthService, MediaService, ProfileService, EmailService...
├── frontend/
│   ├── vercel.json
│   └── src/
│       ├── components/      # AuthGuard, Layout, PasswordInput, AvatarCropper,
│       │                    # FilterSelector, NsfwWarningModal, ErrorBoundary
│       ├── hooks/           # useContentFilter
│       ├── pages/           # Dashboard, Search, Discover, MyList, MediaDetail,
│       │                    # Profile, Admin, Login, Register, ForgotPassword,
│       │                    # NotFound, PageLoader...
│       ├── services/        # api.ts (axios)
│       ├── store/           # authStore, listStore (Zustand)
│       └── types/           # index.ts
└── render.yaml
```

## API endpoints

| Méthode | Route | Auth | Description |
|---------|-------|------|-------------|
| GET | `/api/health` | — | Health check (UptimeRobot) |
| POST | `/api/auth/register` | — | Inscription |
| POST | `/api/auth/login` | — | Connexion |
| POST | `/api/auth/refresh` | — | Refresh access token |
| POST | `/api/auth/logout` | ✓ | Déconnexion + révocation |
| POST | `/api/auth/forgot-password` | — | Demande reset password |
| POST | `/api/auth/reset-password` | — | Reset password via token |
| GET | `/api/media/search?type&query&page&limit&filter` | ✓ | Recherche anime/manga |
| GET | `/api/media/{type}/{id}` | ✓ | Détail d'un média |
| GET | `/api/media/random?type` | ✓ | Média aléatoire |
| GET | `/api/media/top/airing?type&page&limit&filter` | ✓ | Top en cours |
| GET | `/api/media/top/popular?type&page&limit&filter` | ✓ | Top populaires |
| GET | `/api/media/recommendations/me?type` | ✓ | Recommandations personnalisées |
| GET | `/api/lists` | ✓ | Liste de l'utilisateur (paginée) |
| POST | `/api/lists` | ✓ | Ajouter à la liste |
| PATCH | `/api/lists/{id}` | ✓ | Modifier une entrée |
| DELETE | `/api/lists/{id}` | ✓ | Supprimer une entrée |
| GET | `/api/profile` | ✓ | Profil utilisateur |
| PATCH | `/api/profile` | ✓ | Modifier pseudo/avatar/allowExplicit |
| PATCH | `/api/profile/password` | ✓ | Changer de mot de passe |
| POST | `/api/profile/email/change` | ✓ | Demande changement email |
| POST | `/api/profile/email/confirm` | — | Confirme changement email |
| GET | `/api/admin/users` | ADMIN | Liste des utilisateurs |
| GET | `/api/admin/stats` | ADMIN | Stats globales |
| DELETE | `/api/admin/users/{id}` | ADMIN | Supprimer un utilisateur |
| PATCH | `/api/admin/users/{id}/promote` | ADMIN | Promouvoir en admin |
| DELETE | `/api/admin/cache` | ADMIN | Vider le cache média |