# Service App Frontend

## Setup

1. Install dependencies:

```bash
npm install
```

2. Configure API base (optional). Create `.env` in project root with:

```
VITE_API_BASE=http://localhost:5000/api
```

3. Start dev server:

```bash
npm run dev
```

## Routing
- Authenticated users are redirected based on role to `/admin`, `/user`, `/serviceprovider`, `/accountant`.
- Unauthenticated access to protected routes redirects to `/login`.
# service-app-frontend
