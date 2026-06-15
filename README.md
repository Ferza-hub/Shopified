# Shopified

A production-grade, multi-tenant **Shopify-like e-commerce SaaS engine** built as a TypeScript monorepo. Shopified covers ~61 commerce features benchmarked against Shopify's G2 capability set — from products, variants, and inventory to orders, checkout, discounts, tax, shipping, payments, CMS, reviews, multi-channel selling, webhooks, and analytics.

## Overview

| Layer | Technology |
|-------|-----------|
| Monorepo | pnpm workspaces + Turborepo |
| Backend | Node.js + TypeScript + NestJS (Modular Monolith) |
| ORM / DB | Prisma + PostgreSQL |
| Cache / Queue | Redis + BullMQ |
| Admin UI | Next.js 14 (App Router) + Tailwind CSS + Shadcn-style primitives |
| Storefront | Next.js 14 (App Router) + Tailwind CSS + Zustand |
| Auth | JWT (access + refresh tokens, refresh persisted in DB) |
| API | REST with Swagger/OpenAPI |

## Architecture

```
                          ┌───────────────────────┐
                          │       PostgreSQL        │
                          └───────────▲─────────────┘
                                      │ Prisma
                                      │
   ┌──────────────┐          ┌────────┴─────────┐          ┌──────────────┐
   │   Admin UI   │  REST    │    NestJS API     │  REST    │  Storefront  │
   │ Next.js :3000│ ───────► │   (modular mono)  │ ◄─────── │ Next.js :3002│
   └──────────────┘          │       :3001        │          └──────────────┘
                             └────────┬─────────┘
                                      │ BullMQ
                                      ▼
                              ┌──────────────┐
                              │    Redis     │
                              └──────────────┘

  packages/
    database/   Prisma schema + client (@shopified/database)
    shared/     Types, constants, utils      (@shopified/shared)
    ui/         Shared UI helpers            (@shopified/ui)

  apps/
    api/        NestJS backend — feature modules (auth, stores, products,
                collections, inventory, customers, orders, cart, checkout,
                payments, discounts, shipping, tax, reviews, pages, blogs,
                files, webhooks, analytics, notifications, themes, channels,
                seo, search)
    admin/      Merchant dashboard
    storefront/ Customer-facing shop
```

## Project Structure

```
shopified/
├── apps/
│   ├── api/          # NestJS backend (REST + Swagger)
│   ├── admin/        # Next.js admin dashboard
│   └── storefront/   # Next.js storefront
├── packages/
│   ├── database/     # Prisma schema + generated client
│   ├── shared/       # Shared types, DTOs, utilities
│   └── ui/           # Shared UI helpers
├── turbo.json
├── package.json
├── pnpm-workspace.yaml
├── tsconfig.base.json
├── .env.example
└── README.md
```

## Setup

### Prerequisites
- Node.js >= 20
- pnpm >= 9
- PostgreSQL 14+
- Redis 6+

### Install

```bash
# 1. Install dependencies
pnpm install

# 2. Configure environment
cp .env.example .env
# edit .env with your DATABASE_URL, REDIS_URL, JWT secrets, etc.

# 3. Generate the Prisma client
pnpm db:generate

# 4. Run migrations
pnpm db:migrate

# 5. Seed demo data (creates demo@shopified.com / Demo1234!)
pnpm db:seed
```

### Develop

```bash
pnpm dev            # runs api + admin + storefront via Turborepo
```

| Service | URL |
|---------|-----|
| API | http://localhost:3001/api |
| API Docs (Swagger) | http://localhost:3001/docs |
| Admin | http://localhost:3000 |
| Storefront | http://localhost:3002 |

## Environment Variables

See [`.env.example`](./.env.example). Key groups:

- **Database** — `DATABASE_URL`
- **Redis** — `REDIS_URL`
- **JWT** — `JWT_ACCESS_SECRET`, `JWT_REFRESH_SECRET`, `JWT_ACCESS_EXPIRES_IN`, `JWT_REFRESH_EXPIRES_IN`
- **Ports / URLs** — `API_PORT`, `ADMIN_PORT`, `STOREFRONT_PORT`, `*_URL`
- **Storage** — `STORAGE_DRIVER` (`local` | S3-compatible), `AWS_*`
- **Email** — `SMTP_*`
- **Payments** — `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`

## Scripts

| Command | Description |
|---------|-------------|
| `pnpm dev` | Run all apps in watch mode |
| `pnpm build` | Build all packages and apps |
| `pnpm lint` | Lint the workspace |
| `pnpm format` | Prettier format |
| `pnpm db:generate` | Generate Prisma client |
| `pnpm db:migrate` | Run Prisma migrations |
| `pnpm db:seed` | Seed demo data |

## API Documentation

Interactive Swagger/OpenAPI docs are served at **http://localhost:3001/docs** when the API is running. All endpoints are namespaced under `/api`, authenticated via Bearer JWT, and scoped to a store via the `x-store-id` header (or the authenticated user's store).

## Feature Coverage

| Domain | Features |
|--------|----------|
| **Catalog** | Products, variants, options, images, product types, vendors, tags, draft/active/archived status, duplication |
| **Collections** | Manual & smart (rule-based) collections, ordering |
| **Inventory** | Multi-location stock, available/on-hand/committed/incoming, adjustments, transfers, low-stock thresholds |
| **Customers** | Accounts, addresses, tags, segments, lifetime spend & order counts, marketing consent |
| **Cart & Checkout** | Persistent carts, guest checkout, discount codes, multi-step checkout, totals calculation |
| **Orders** | Lifecycle (pending → confirmed → fulfilled/cancelled/closed), line items, financial & fulfillment status, fulfillments, refunds |
| **Payments** | Gateway abstraction, authorize/capture/refund, payment records |
| **Discounts** | Code & automatic discounts, %/fixed/free-shipping/BXGY, usage & per-customer limits, date windows, minimums |
| **Shipping** | Zones, rate cards, weight/price conditions, carrier services, rate quoting |
| **Tax** | Rates by country/province, inclusive/exclusive, per-order calculation |
| **CMS** | Pages, blogs, blog posts, SEO metadata |
| **Reviews** | Product reviews with moderation (pending/approved/rejected/spam), verified-purchase |
| **Media** | File uploads (local / S3-compatible) |
| **Multi-channel** | Shopee, Tokopedia, Lazada, TikTok Shop, Amazon, eBay, custom — listings & sync |
| **Themes** | Theme records, settings, publish/main role |
| **Webhooks** | Subscriptions, delivery logs, retries |
| **Analytics** | Revenue, orders, customers, AOV, sales-over-time, top products |
| **Notifications** | In-app notifications, read tracking |
| **Search** | Full-text product search |
| **Platform** | Multi-tenant stores, RBAC (owner/admin/staff/viewer), audit logs, store settings |

## License

Proprietary — internal engine. All rights reserved.
