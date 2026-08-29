# نَسَق NASAQ

منصة للفن اليدوي ومستلزمات الحرف في مصر.

## Tech Stack

- Next.js 15 (App Router) + TypeScript
- Tailwind CSS 4 with NASAQ brand colors
- Prisma ORM + PostgreSQL (Supabase)
- Supabase Storage for media uploads
- Vercel hosting

## Quick Start

```bash
npm install
cp .env.example .env
npx prisma db push
npm run db:seed
npm run dev
```

## Default Accounts (after seed)

| Role  | Email           | Password  |
|-------|-----------------|-----------|
| Admin | admin@nasaq.eg  | admin123  |
| Maker | maker@nasaq.eg  | maker123  |

## Add Intro Video

Place your splash video at: `public/assets/intro.mp4`
