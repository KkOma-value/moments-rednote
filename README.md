<div align="center">

# Moments RedNote

**AI-Powered Content Studio for Chinese Social Media Platforms**

Generate and preview content for WeChat Moments (朋友圈) and RedNote (小红书/Xiaohongshu)

[![Tech Stack](https://img.shields.io/badge/Next.js-16.1-black?style=for-the-badge&logo=next.js)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19.2-blue?style=for-the-badge&logo=react)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178C6?style=for-the-badge&logo=typescript)](https://www.typescriptlang.org/)
[![shadcn/ui](https://img.shields.io/badge/shadcn/ui-latest-000?style=for-the-badge)](https://ui.shadcn.com/)

</div>

---

## Features

- **Dual Platform Support** — Create content for WeChat and RedNote with platform-specific styling
- **AI Content Generation** — Generate social media copy via OpenAI, with configurable style and purpose
- **Real-time Preview** — See how your content looks on mobile and desktop device frames
- **Image Upload** — Upload multiple images with Vercel Blob storage
- **Style & Purpose Templates** — Pre-configured creative styles (商务/专业/亲和/精致) and purpose categories
- **Feishu Sync** — One-click copy to clipboard and sync generated content to Feishu (Lark) spreadsheet
- **Editorial Luxury UI** — Refined warm-toned design with Playfair Display serif + DM Sans typography, built on shadcn/ui

---

## Tech Stack

| Component | Technology |
|-----------|------------|
| Framework | [Next.js 16.1.6](https://nextjs.org/) (App Router + Turbopack) |
| UI Library | [React 19.2.3](https://react.dev/) |
| UI Components | [shadcn/ui](https://ui.shadcn.com/) (Radix UI + Tailwind CSS) |
| Storage | [Vercel Blob](https://vercel.com/docs/storage/vercel-blob) |
| AI | [OpenAI SDK](https://github.com/openai/openai-node) |
| Feishu Integration | [@larksuiteoapi/node-sdk](https://github.com/larksuite/node-sdk) |
| Styling | [Tailwind CSS v4](https://tailwindcss.com/) |
| Language | [TypeScript](https://www.typescriptlang.org/) |

---

## Quick Start

### Prerequisites

- Node.js 18+
- Vercel Blob storage account
- OpenAI API key
- (Optional) Feishu/Lark App credentials for spreadsheet sync

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

# OpenAI API key for content generation
OPENAI_API_KEY="sk-xxx"

# (Optional) Feishu / Lark sync
FEISHU_APP_ID="cli_xxx"
FEISHU_APP_SECRET="xxx"
FEISHU_BITABLE_APP_TOKEN="xxx"
FEISHU_BITABLE_TABLE_ID="xxx"
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
│   │   ├── generate/route.ts          # AI content generation
│   │   ├── upload/route.ts            # Image upload to Vercel Blob
│   │   └── feishu-sync/route.ts       # Feishu spreadsheet sync
│   ├── playground-modern/page.tsx     # Playground: Editorial Luxury
│   ├── playground-glass/page.tsx      # Playground: Neon Cyber
│   ├── playground-minimal/page.tsx    # Playground: Aurora Dreamscape
│   ├── layout.tsx                     # Root layout (Outfit font, TooltipProvider)
│   ├── page.tsx                       # Main editor (Editorial Luxury design)
│   └── globals.css                    # Global styles + shadcn/ui CSS variables
├── components/
│   ├── ui/                            # shadcn/ui components
│   │   ├── button.tsx
│   │   ├── card.tsx
│   │   ├── input.tsx
│   │   ├── label.tsx
│   │   ├── resizable.tsx
│   │   ├── scroll-area.tsx
│   │   ├── select.tsx
│   │   ├── separator.tsx
│   │   ├── tabs.tsx
│   │   ├── textarea.tsx
│   │   └── tooltip.tsx
│   └── PreviewRenderers.tsx           # WeChat & RedNote preview components
├── lib/
│   ├── constants.ts                   # Styles, purposes, label maps
│   ├── prompts.ts                     # AI system prompts
│   └── utils.ts                       # Utility functions (cn helper)
├── types/
│   └── index.ts                       # TypeScript types
├── prompt/                            # Prompt templates
├── public/                            # Static assets
├── components.json                    # shadcn/ui configuration
└── CLAUDE.md                          # Developer guide
```

---

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/generate` | Generate AI content for WeChat/RedNote |
| `POST` | `/api/upload` | Upload images to Vercel Blob |
| `POST` | `/api/feishu-sync` | Sync generated content to Feishu spreadsheet |

---

## Design System

The app uses an **Editorial Luxury** design with shadcn/ui components:

| Element | Details |
|---------|---------|
| Background | Warm cream/ivory `#FAF8F5` |
| Accent | Burnt sienna gold `#C4956A` — `#A67C52` |
| WeChat Theme | Forest green `#4A7C59` — `#5B9A6E` |
| RedNote Theme | Warm rose `#C25B5B` — `#D4696E` |
| Display Font | [Playfair Display](https://fonts.google.com/specimen/Playfair+Display) (serif) |
| Body Font | [DM Sans](https://fonts.google.com/specimen/DM+Sans) (sans-serif) |
| UI Components | shadcn/ui (Button, Select, Textarea, ScrollArea, etc.) |

---

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server (Turbopack) |
| `npm run build` | Build for production |
| `npm run start` | Start production server |
| `npm run lint` | Run ESLint |

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

Made with [Next.js](https://nextjs.org/) + [shadcn/ui](https://ui.shadcn.com/) + [OpenAI](https://openai.com/)

</div>
