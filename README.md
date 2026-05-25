# SubTrack

Anime & manga tracker full-stack. Recherche, suis ta progression, découvre de nouveaux titres.

## Stack

**Backend** — Spring Boot 3 · Spring Security · JPA/Hibernate · H2 (dev) / PostgreSQL (prod)  
**Frontend** — React 18 · TypeScript · Vite · Tailwind CSS · Zustand  
**API externe** — Jikan v4 (MyAnimeList, pas de clé nécessaire)  
**Email** — JavaMailSender + Mailtrap (dev)

## Fonctionnalités

- **Auth** — inscription/connexion, JWT access token (15 min) + refresh token (30 jours), blacklist à la déconnexion, rate limiting (10 req/min sur login/register)
- **Sécurité** — reset password par email, changement d'email avec confirmation, tokens UUID à usage unique (1h)
- **Liste** — ajouter/retirer des anime & manga, suivre sa progression (épisodes/chapitres), changer de statut (Watching, Completed, Plan to watch, Dropped, On hold), pagination côté serveur
- **Discover** — Top Airing, Most Popular, For You (basé sur ta liste), Surprise me (anime/manga aléatoire)
- **Search** — recherche avec persistance dans l'URL (retour arrière conserve la recherche)
- **Profil** — stats (anime/manga trackés, score moyen, temps regardé estimé), distribution des scores, changement de pseudo et photo de profil, changement de mot de passe et d'email
- **Admin** — gestion des utilisateurs (promouvoir/rétrograder/supprimer), stats globales, gestion du cache média
- **Cache** — les métadonnées Jikan sont mises en cache en base pour réduire les appels API

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

## Structure du projet

```
subtrack/
├── backend/
│   └── src/main/java/com/subtrack/
│       ├── config/          # AppConfig, DataInitializer
│       ├── controller/      # AuthController, MediaController, ListController,
│       │                    # ProfileController, AdminController
│       ├── dto/             # Request/Response DTOs
│       ├── entity/          # User, UserMedia, MediaCache, tokens...
│       ├── media/           # Strategy pattern providers (Jikan anime/manga)
│       ├── repository/      # Spring Data JPA repositories
│       ├── security/        # JwtUtil, JwtFilter, RateLimitFilter, SecurityConfig
│       └── service/         # AuthService, MediaService, ProfileService...
└── frontend/
    └── src/
        ├── components/      # AuthGuard, Layout, PasswordInput
        ├── pages/           # Dashboard, Search, Discover, MyList, MediaDetail,
        │                    # Profile, Admin, Login, Register, ForgotPassword...
        ├── services/        # api.ts (axios)
        ├── store/           # authStore, listStore (Zustand)
        └── types/           # index.ts
```

## API endpoints

| Méthode | Route | Auth | Description |
|---------|-------|------|-------------|
| POST | `/api/auth/register` | — | Inscription |
| POST | `/api/auth/login` | — | Connexion |
| POST | `/api/auth/refresh` | — | Refresh access token |
| POST | `/api/auth/logout` | ✓ | Déconnexion + révocation |
| POST | `/api/auth/forgot-password` | — | Demande reset password |
| POST | `/api/auth/reset-password` | — | Reset password via token |
| GET | `/api/media/search` | ✓ | Recherche anime/manga |
| GET | `/api/media/{type}/{id}` | ✓ | Détail d'un média |
| GET | `/api/media/random` | ✓ | Média aléatoire |
| GET | `/api/media/top/airing` | ✓ | Top en cours |
| GET | `/api/media/top/popular` | ✓ | Top populaires |
| GET | `/api/media/recommendations/me` | ✓ | Recommendations personnalisées |
| GET | `/api/lists` | ✓ | Liste de l'utilisateur (paginée) |
| POST | `/api/lists` | ✓ | Ajouter à la liste |
| PATCH | `/api/lists/{id}` | ✓ | Modifier une entrée |
| DELETE | `/api/lists/{id}` | ✓ | Supprimer une entrée |
| GET | `/api/profile` | ✓ | Profil utilisateur |
| PATCH | `/api/profile` | ✓ | Modifier pseudo/avatar |
| PATCH | `/api/profile/password` | ✓ | Changer de mot de passe |
| POST | `/api/profile/email/change` | ✓ | Demande changement email |
| POST | `/api/profile/email/confirm` | — | Confirme changement email |
| GET | `/api/admin/users` | ADMIN | Liste des utilisateurs |
| GET | `/api/admin/stats` | ADMIN | Stats globales |
| DELETE | `/api/admin/users/{id}` | ADMIN | Supprimer un utilisateur |
| PATCH | `/api/admin/users/{id}/promote` | ADMIN | Promouvoir en admin |
| DELETE | `/api/admin/cache` | ADMIN | Vider le cache média |