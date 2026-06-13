# Next.js Naming Conventions & Coding Style

This document defines conventions for directory structures, naming patterns, imports, and feature organization inside Next.js App Router projects.

---

## 🏷️ Naming Conventions

| Element | Naming Convention | Example |
| :--- | :--- | :--- |
| **Route Folders (`app/`)** | lowercase or kebab-case | `app/dashboard/`, `app/user-profile/` |
| **Route Groups** | Wrapped in parentheses `(group-name)` | `app/(auth)/login/`, `app/(dashboard)/layout.tsx` |
| **Dynamic Routes** | Wrapped in brackets `[paramName]` | `app/blog/[id]/page.tsx`, `app/shop/[...slug]/page.tsx` |
| **Special Routing Files** | Next.js standard filenames (lowercase) | `page.tsx`, `layout.tsx`, `loading.tsx`, `error.tsx` |
| **Route Handlers** | Next.js API endpoint filenames | `route.ts` |
| **UI Components** | PascalCase.tsx | `Button.tsx`, `ProductCard.tsx`, `SidebarSkeleton.tsx` |
| **Custom Hooks** | camelCase starting with the `use` prefix | `useAuth.ts`, `useLocalStorage.ts` |

---

## 📦 Imports & Aliasing
- **Absolute Imports:** Always use absolute imports with the `@/` alias pointing to the root or `src/` directory (e.g., `import { Button } from "@/components/ui/Button"`). Do not use relative imports with deep directory nesting (e.g., `../../../../Button`).
- **CSS / Styles Imports:** Import global styles only in the root `layout.tsx` file (e.g., via `globals.css` or `index.css`). Do not import raw CSS files inside individual components.

---

## 📁 Directory Organization
- Keep directories within the `app/` folder focused strictly on routing and layout definitions.
- Locate business components, custom hooks, services, and types inside `src/features/` or `src/components/` outside the `app/` folder. Every feature (e.g., `billing`) should encapsulate its related resources:
  - `src/features/billing/components/BillingForm.tsx`
  - `src/features/billing/hooks/useBilling.ts`
- Expose the public API of each feature via a clean entrypoint file: `index.ts`.
