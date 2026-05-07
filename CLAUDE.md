@AGENTS.md

# Project: Lunatech Agency

## Stack qısa xülasəsi
- **Frontend**: Next.js 16.2.2 (App Router) + React 19.2.4 + TypeScript strict
- **Styling**: Tailwind CSS v4 + qonşu CSS modules (`*.module.css`)
- **Animasiya/3D**: framer-motion, gsap, lenis, three + @react-three/{fiber,drei}
- **UI primitives**: @radix-ui/react-{dialog,avatar}, lucide-react
- **i18n**: next-intl (locales: az, en, ru) — `[locale]` dinamik segment, `messages/{az,en,ru}.json`
- **Backend**: Next.js Route Handlers / Server Actions (hazırda istifadə yoxdur — statik məzmun)
- **DB**: yoxdur
- **Tests**: Playwright E2E (unit framework yoxdur)
- **CI/Docker**: hələ qurulmayıb
- **Path alias**: `@/*` → `./src/*`

## Agent komandası
Bu proyektdə ixtisaslaşmış sub-agent komandası var (`.claude/agents/`):

| Agent | Nə vaxt çağrılır |
|---|---|
| `planner` | Yeni feature və ya böyük dəyişiklik — BİRİNCİ |
| `frontend-engineer` | UI komponent, App Router səhifə, Tailwind, animasiya, i18n stringləri |
| `backend-engineer` | Route Handlers, Server Actions, metadata, sitemap/robots, i18n server config |
| `db-specialist` | DB tətbiq olunduqda fəal — schema, migration, query (hazırda passive) |
| `test-engineer` | Playwright E2E spec-ləri (`e2e/*.spec.ts`) |
| `code-reviewer` | Kommit/PR öncəsi review — type, perf, a11y, Next.js 16, i18n |
| `debugger` | Bug investigation: hydration, scroll/Lenis, Three dispose, locale mismatch |
| `devops` | Build/lint/CI/Docker/env — infrastructure işləri |

## İş axını qaydası
1. Yeni feature gələndə: `planner`-ə tapşır → plan al.
2. Plan əsasında müvafiq agentləri (frontend-engineer / backend-engineer / db-specialist) paralel/ardıcıl işə sal.
3. Kod dəyişikliyindən sonra: `test-engineer` (E2E spec) → `code-reviewer`.
4. Debug halında: `debugger` → fix → `test-engineer` (regression spec).
5. Build/deploy/CI: `devops`.

## Komandalar
- Dev: `npm run dev`
- Build: `npm run build`
- Start: `npm run start`
- Lint: `npm run lint`
- Type check: `npx tsc --noEmit` (dedicated script yoxdur)
- E2E: `npm run test:e2e`
