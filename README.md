This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Database

Posts are stored in Postgres, accessed via a small `sql` tagged-template helper in `lib/db.ts` (`pg` under the hood). Point it at any Postgres instance with:

```bash
DATABASE_URL=postgres://user:password@host:5432/dbname
```

Schema migrations live in `db/migrations` (managed with [Drizzle Kit](https://orm.drizzle.team/), config in `drizzle.config.ts`, which also reads `DATABASE_URL`). Seed sample posts with:

```bash
npm run db:seed
```

## Deploy on DigitalOcean

This app deploys to [DigitalOcean App Platform](https://www.digitalocean.com/products/app-platform). An app spec is provided at `.do/app.yaml`:

1. In the DigitalOcean control panel, create a new App from this GitHub repo (or run `doctl apps create --spec .do/app.yaml`).
2. Add a **Managed PostgreSQL Database** (the spec provisions one and wires `DATABASE_URL` automatically via `${savankong-db.DATABASE_URL}`).
3. Set the `NEXT_PUBLIC_ADMIN_PASSWORD` secret in the app's environment variables.
4. Run the SQL in `db/migrations` against the new database (e.g. `npx drizzle-kit push` with `DATABASE_URL` set, or apply `migration.sql` directly), then optionally `npm run db:seed`.
5. Point your domain's DNS at the app (App Platform issues a managed TLS cert automatically once the domain is added in the app's Settings → Domains).
