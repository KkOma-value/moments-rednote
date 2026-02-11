# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**Moments RedNote** is an AI-powered content studio for generating social media content for two Chinese platforms:
- **WeChat** (朋友圈 - Moments)
- **RedNote** (小红书 - Xiaohongshu)

Users can upload images, select styles/products, provide prompts, and preview how content will appear on each platform in both mobile and desktop views.

## Tech Stack

- **Framework**: Next.js 16.1.6 (App Router)
- **React**: 19.2.3
- **Database**: PostgreSQL via Supabase with Prisma 7.3.0
- **Storage**: Vercel Blob for image uploads
- **Styling**: Tailwind CSS v4
- **Language**: TypeScript

## Development Commands

```bash
# Development
npm run dev              # Start development server

# Build & Deploy
npm run build           # Production build
npm run start           # Start production server
npm run lint            # Run ESLint

# Database
npm run prisma:generate # Generate Prisma Client (run after schema changes)
npm run prisma:push     # Push schema to database without migration
npm run prisma:migrate  # Create and apply migrations
npm run prisma:studio   # Open Prisma Studio GUI
```

## Environment Variables

Required in `.env`:
```bash
DATABASE_URL="postgresql://..."          # Connection pooler URL
DIRECT_URL="postgresql://..."            # Direct connection for migrations
BLOB_READ_WRITE_TOKEN="..."             # Vercel Blob token
```

## Architecture

### Database Schema
Located in `prisma/schema.prisma`:
- `Conversation`: Stores content generation sessions with platform, style, product
- `Message`: Stores user/assistant messages with images (Vercel Blob URLs)

### Prisma Client Pattern
The project uses a custom Prisma setup with the `@prisma/adapter-pg` adapter for connection pooling. The client is defined in `lib/prisma.ts` and dynamically imported in API routes to prevent Edge Runtime issues:

```typescript
async function getPrisma() {
    const { prisma } = await import('@/lib/prisma');
    return prisma;
}
```

### API Routes
- `GET/POST /api/conversations` - List/create conversations
- `GET/POST /api/conversations/[id]/messages` - List/add messages to a conversation
- `POST /api/upload` - Upload images to Vercel Blob (multi-file support)

All API routes use `export const dynamic = 'force-dynamic'`.

### App Structure
```
app/
├── api/
│   ├── conversations/
│   │   ├── route.ts              # List/create conversations
│   │   └── [id]/messages/route.ts  # Messages for a conversation
│   └── upload/route.ts           # Image upload to Vercel Blob
├── layout.tsx                    # Root layout with Outfit font
├── page.tsx                      # Main content editor interface
└── globals.css                   # Custom glassmorphism design system

components/
└── PreviewRenderers.tsx          # WeChatPreview and RedNotePreview components

lib/
├── prisma.ts                    # Prisma client with Pg adapter
└── constants.ts                 # STYLES, PRODUCTS, MOCK_HISTORY

types/
└── index.ts                     # Platform, DeviceMode, PreviewData, HistoryItem
```

### Design System
The app uses a custom "Liquid Glass" glassmorphism design system in `globals.css`:
- `.glass` - Standard glassmorphism
- `.glass-dark` - Dark variant for sidebar
- `.input-glass` - Form inputs with glass style
- Platform-specific gradients: `.bg-mesh-gradient-wechat`, `.bg-mesh-gradient-rednote`

### Platform System
Platforms are defined as constants in `types/index.ts`:
- `Platform.WeChat` - Uses emerald/teal color scheme
- `Platform.RedNote` - Uses rose/pink color scheme

Platform-specific colors are defined in `app/page.tsx` as `PLATFORM_COLORS` object, providing gradients, shadows, and icon styles for each platform.

### Preview Components
- `WeChatPreview` - Renders WeChat Moments-style post with iOS status bar, image grid (1-9 images), likes/comments section
- `RedNotePreview` - Renders Xiaohongshu-style feed with main image, author info, tags, and comments

## 踩坑记录

### 1. Prisma v7 不再支持在 schema 中配置 `url` / `directUrl`

**问题**: `prisma/schema.prisma` 中写 `url = env("DATABASE_URL")` 会报错 `P1012`。

**原因**: Prisma v7 移除了 schema 文件中的 `url` 和 `directUrl` 属性，连接配置必须放在 `prisma.config.ts` 中。

**正确做法**:
```prisma
// prisma/schema.prisma — 只保留 provider
datasource db {
  provider = "postgresql"
}
```
```ts
// prisma.config.ts — 在这里配置连接
export default defineConfig({
  datasource: {
    url: process.env["DIRECT_URL"], // CLI 用直连
  },
});
```

### 2. Prisma CLI（db push / migrate）必须用非池化连接

**问题**: `npx prisma db push` 报 `P1017: Server has closed the connection`。

**原因**: `prisma.config.ts` 中 `datasource.url` 指向了 PgBouncer 池化连接（端口 6543），而 `db push` / `migrate` 需要支持事务的非池化连接。

**正确做法**: `prisma.config.ts` 的 `datasource.url` 必须指向 `DIRECT_URL`（非 `DATABASE_URL`）。

### 3. Supabase 直连地址可能不通，改用 Session Pooler

**问题**: `DIRECT_URL` 用 `db.xxx.supabase.co:5432` 直连地址，报 `P1001: Can't reach database server`。

**原因**: 本地网络/防火墙可能阻断 Supabase 直连端口。

**解决**: 改用 Supabase **Session Pooler**（端口 5432）替代直连：
```
# 不通
DIRECT_URL="postgresql://postgres:pwd@db.xxx.supabase.co:5432/postgres"

# 可用 (Session Pooler)
DIRECT_URL="postgresql://postgres.xxx:pwd@aws-1-ap-southeast-2.pooler.supabase.com:5432/postgres"
```

### 4. Prisma v7 运行时必须使用 Driver Adapter

**问题**: `PrismaClient` 默认构造报连接错误，API 全部返回 500。

**原因**: Prisma v7 中 `PrismaClient` 不再自动从 env 读取 `DATABASE_URL`，需要通过 adapter 传入连接。

**正确做法**:
```ts
// lib/prisma.ts
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });
```

需要安装依赖：`npm install @prisma/adapter-pg pg`

### 5. Supabase 连接字符串速查

| 用途 | 环境变量 | 端口 | 说明 |
|------|----------|------|------|
| Prisma Client 运行时 | `DATABASE_URL` | 6543 | Transaction Pooler，加 `?pgbouncer=true` |
| Prisma CLI (migrate/push) | `DIRECT_URL` | 5432 | Session Pooler 或直连 |

### 6. 线上构建必须先执行 `prisma generate`

**问题**: Vercel 等平台部署时 `npm run build` 报错 `Module '"@prisma/client"' has no exported member 'PrismaClient'`。

**原因**: Prisma v7 的类型定义和运行时代码在 `npm install` 后不会自动生成到 `node_modules/.prisma/client`，必须先执行 `prisma generate`。线上构建只运行 `next build` 会导致 TypeScript 找不到导出。

**正确做法**: 在 `package.json` 中加双重保障：
```json
{
  "scripts": {
    "build": "prisma generate && next build",
    "postinstall": "prisma generate"
  }
}
```
- `build` 脚本前置 `prisma generate`，确保构建前生成
- `postinstall` 在 `npm install` 完成后自动生成（适配 Vercel 等 CI 平台）

## 项目启动检查清单

1. 复制 `env.example` 为 `.env`，填写真实密码
2. `npm install`
3. `npm run prisma:generate` — 生成 Prisma Client
4. `npm run prisma:push` — 同步 schema 到数据库
5. `npm run dev` — 启动开发服务器
