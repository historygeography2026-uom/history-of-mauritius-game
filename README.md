# History of Mauritius Game

Interactive Next.js game for learning the history and geography of Mauritius, with an admin interface for managing questions, local image uploads, and PostgreSQL-backed authentication and progress tracking.

## Stack

- Next.js 15 and React 19
- PostgreSQL via `pg`
- NextAuth credentials plus optional Google OAuth
- Render web service, PostgreSQL, and persistent disk storage for uploaded images

## Development

Install dependencies:

```bash
pnpm install
```

Run the development server:

```bash
pnpm dev
```

Build for production:

```bash
pnpm build
```

Start the production server locally:

```bash
pnpm start
```

## Environment

Use `.env.example` as the template for required settings.

Common variables:

- `DATABASE_URL`
- `NEXTAUTH_URL`
- `NEXTAUTH_SECRET`
- `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET` if Google OAuth is enabled
- `RENDER_DISK_PATH` on Render for persistent image storage

## Deployment

Render deployment is defined in `render.yaml`. The production container starts through `scripts/start.sh`, and uploaded images are served from `/api/images/...` using Render persistent disk storage when `RENDER_DISK_PATH` is available.

## Retained Database Scripts

The `scripts/` folder has been trimmed to the files still useful for bootstrap or repair work:

- schema setup and seed SQL migrations
- `create-questions-schema.mjs`
- `insert-defaults.mjs`
- `setup-nextauth-schema.mjs`
- `seed-demo-user.cjs`
- `fix-constraint.mjs`

These are manual operational helpers. The application runtime does not invoke them automatically.
