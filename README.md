<div align="center">

# Moments RedNote

**AI-Powered Content Studio for Chinese Social Media Platforms**

Generate and preview content for WeChat Moments (朋友圈) and RedNote (小红书/Xiaohongshu)

[![Tech Stack](https://img.shields.io/badge/Next.js-16.1-black?style=for-the-badge&logo=next.js)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19.2-blue?style=for-the-badge&logo=react)](https://react.dev/)
[![Prisma](https://img.shields.io/badge/Prisma-7.3-2D3748?style=for-the-badge&logo=prisma)](https://www.prisma.io/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178C6?style=for-the-badge&logo=typescript)](https://www.typescriptlang.org/)

</div>

---

## Features

- **Dual Platform Support** - Create content for WeChat and RedNote with platform-specific styling
- **Real-time Preview** - See how your content looks on mobile and desktop views
- **Image Upload** - Upload multiple images with Vercel Blob storage
- **Style & Product Templates** - Pre-configured styles and product categories
- **Conversation History** - Track all your content generation sessions
- **Glassmorphism UI** - Beautiful "Liquid Glass" design system

---

## Tech Stack

| Component | Technology |
|-----------|------------|
| Framework | [Next.js 16.1.6](https://nextjs.org/) (App Router) |
| UI Library | [React 19.2.3](https://react.dev/) |
| Database | [PostgreSQL](https://www.postgresql.org/) via [Supabase](https://supabase.com/) |
| ORM | [Prisma 7.3.0](https://www.prisma.io/) |
| Storage | [Vercel Blob](https://vercel.com/docs/storage/vercel-blob) |
| Styling | [Tailwind CSS v4](https://tailwindcss.com/) |
| Language | [TypeScript](https://www.typescriptlang.org/) |

---

## Quick Start

### Prerequisites

- Node.js 18+
- A Supabase project
- Vercel Blob storage account

### Installation

```bash
# 1. Clone the repository
git clone https://github.com/KkOma-value/moments-rednote.git
cd moments-rednote

# 2. Install dependencies
npm install

# 3. Configure environment variables
cp env.example .env
```

### Environment Setup

Edit `.env` with your credentials:

```bash
# Vercel Blob token for image uploads
BLOB_READ_WRITE_TOKEN="vercel_blob_xxx"

# Supabase Transaction Pooler (for Prisma Client runtime)
DATABASE_URL="postgresql://postgres:[PASSWORD]@[PROJECT-POOLER]:6543/postgres?pgbouncer=true"

# Supabase Direct Connection (for migrations)
DIRECT_URL="postgresql://postgres:[PASSWORD]@db.[PROJECT].supabase.co:5432/postgres"
```

> **Note:** Use Session Pooler for `DIRECT_URL` if direct connection fails (see [Troubleshooting](#troubleshooting))

### Database Setup

```bash
# Generate Prisma Client
npm run prisma:generate

# Push schema to database
npm run prisma:push

# (Optional) Open Prisma Studio to manage data
npm run prisma:studio
```

### Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## Project Structure

```
moments-rednote/
├── app/
│   ├── api/
│   │   ├── conversations/
│   │   │   ├── route.ts              # List/create conversations
│   │   │   └── [id]/messages/route.ts # Message API
│   │   └── upload/route.ts            # Image upload
│   ├── layout.tsx                     # Root layout
│   ├── page.tsx                       # Main editor
│   └── globals.css                    # Design system
├── components/
│   └── PreviewRenderers.tsx           # Platform previews
├── lib/
│   ├── prisma.ts                      # Prisma client
│   └── constants.ts                   # Styles, products
├── prisma/
│   ├── schema.prisma                  # Database schema
│   └── prisma.config.ts               # Prisma v7 config
├── types/
│   └── index.ts                       # TypeScript types
└── CLAUDE.md                          # Developer guide
```

---

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/conversations` | List all conversations |
| `POST` | `/api/conversations` | Create new conversation |
| `GET` | `/api/conversations/[id]/messages` | Get conversation messages |
| `POST` | `/api/conversations/[id]/messages` | Add message to conversation |
| `POST` | `/api/upload` | Upload images to Vercel Blob |

---

## Database Schema

```prisma
model Conversation {
  id        String   @id @default(cuid())
  platform  String
  style     String?
  product   String?
  messages  Message[]
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}

model Message {
  id             String       @id @default(cuid())
  role           String        // 'user' | 'assistant'
  content        String?       @db.Text
  images         String[]
  conversationId String
  conversation   Conversation @relation(fields: [conversationId])
  createdAt      DateTime     @default(now())
}
```

---

## Design System

The app uses a custom "Liquid Glass" glassmorphism design:

| Class | Description |
|-------|-------------|
| `.glass` | Standard glassmorphism effect |
| `.glass-dark` | Dark variant for sidebar |
| `.input-glass` | Glass-styled form inputs |
| `.bg-mesh-gradient-wechat` | WeChat platform gradient |
| `.bg-mesh-gradient-rednote` | RedNote platform gradient |

---

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Build for production |
| `npm run start` | Start production server |
| `npm run lint` | Run ESLint |
| `npm run prisma:generate` | Generate Prisma Client |
| `npm run prisma:push` | Push schema to database |
| `npm run prisma:migrate` | Create and apply migrations |
| `npm run prisma:studio` | Open Prisma Studio |

---

## Troubleshooting

### Prisma v7 Connection Issues

**Error:** `P1017: Server has closed the connection`

**Solution:** Ensure `prisma.config.ts` uses `DIRECT_URL` (non-pooled connection) for CLI operations.

### Supabase Direct Connection Fails

**Error:** `P1001: Can't reach database server`

**Solution:** Use Supabase **Session Pooler** instead of direct connection:

```bash
# Replace direct connection
DIRECT_URL="postgresql://postgres:[PWD]@db.xxx.supabase.co:5432/postgres"

# With Session Pooler
DIRECT_URL="postgresql://postgres.xxx:[PWD]@aws-1-ap-southeast-2.pooler.supabase.com:5432/postgres"
```

### Build Errors

**Error:** `Module '"@prisma/client"' has no exported member 'PrismaClient'`

**Solution:** Run `npm run prisma:generate` before building.

---

## Deployment

This project is ready for deployment on [Vercel](https://vercel.com/):

1. Connect your GitHub repository
2. Add environment variables in Vercel dashboard
3. Deploy

---

## License

MIT

---

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

---

<div align="center">

Made with [Next.js](https://nextjs.org/) + [Prisma](https://www.prisma.io/) + [Supabase](https://supabase.com/)

</div>
