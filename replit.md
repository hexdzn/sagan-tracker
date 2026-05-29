# Sagan Tracker

A mobile-first app for tracking cash gifts (sagan) received and given during Indian functions and ceremonies.

## Run & Operate

- `pnpm --filter @workspace/api-server run dev` — run the API server (port 5000)
- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas from the OpenAPI spec
- `pnpm --filter @workspace/db run push` — push DB schema changes (dev only)
- Required env: `DATABASE_URL` — Postgres connection string

## Stack

- pnpm workspaces, Node.js 24, TypeScript 5.9
- Mobile: Expo (React Native) with Expo Router
- API: Express 5
- DB: PostgreSQL + Drizzle ORM
- Validation: Zod (`zod/v4`), `drizzle-zod`
- API codegen: Orval (from OpenAPI spec)
- Build: esbuild (CJS bundle)

## Where things live

- `artifacts/sagan-tracker/` — Expo mobile app
  - `app/(tabs)/` — 4 tab screens (Home, Events, Log, People)
  - `context/SaganContext.tsx` — all data + CRUD with AsyncStorage
  - `components/` — shared UI (BottomSheet, TopBar, EntryCard, sheets)
  - `constants/colors.ts` — saffron/green brand palette
  - `types/index.ts` — Entry, SaganEvent types + suggestion lists
- `artifacts/api-server/` — Express API server

## Architecture decisions

- All data stored in AsyncStorage (no backend for sagan data) — offline-first by design
- SaganContext manages global state including modal visibility (showAddEntry, showSettings) so TopBar can trigger sheets from any tab
- Bottom sheets are Modal-based (not Expo Router formSheet) since they're triggered by buttons not navigation
- AddEntry and Settings sheets rendered at tab layout level to overlay all screens
- Event Detail is inline conditional render within events.tsx (no separate route)

## Product

- Track cash gifts received and given at Indian ceremonies
- Link entries to events (weddings, Diwali, etc.)
- View summaries per event and per person
- Full log with filter/search/sort
- Backup & restore via JSON export/import

## User preferences

_Populate as you build — explicit user instructions worth remembering across sessions._

## Gotchas

- Version warnings for datetimepicker/document-picker/file-system are benign — they run fine on Expo Go SDK 54
- Web preview insets differ from native — trust Expo Go for layout verification

## Pointers

- See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details
