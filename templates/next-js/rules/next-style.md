# Next.js Coding Style & Conventions Rules

This ruleset outlines files naming conventions, imports, and folder structures for Next.js App Router projects.

---

## 🏷️ Naming Conventions

| Object | Convention | Example |
| :--- | :--- | :--- |
| **Route Directory (`app/`)** | lowercase or kebab-case | `app/dashboard/`, `app/user-profile/` |
| **Route Groups** | Bọc in parenthesis `(group-name)` | `app/(auth)/login/`, `app/(dashboard)/layout.tsx` |
| **Dynamic Routes** | Bọc in brackets `[paramName]` | `app/blog/[id]/page.tsx`, `app/shop/[...slug]/page.tsx` |
| **Special Layout Files** | Standard Next.js names (lowercase) | `page.tsx`, `layout.tsx`, `loading.tsx`, `error.tsx` |
| **Route Handlers** | Next.js API endpoint name | `route.ts` |
| **UI Components** | PascalCase | `Button.tsx`, `ProductCard.tsx`, `SidebarSkeleton.tsx` |
| **Custom Hooks** | camelCase starting with `use` | `useAuth.ts`, `useLocalStorage.ts` |

---

## 📦 Imports & Aliasing
- **Absolute Imports**: Always use absolute imports with `@/` aliasing pointing to `src/` or root directory (e.g. `import { Button } from "@/components/ui/Button"`). Do not use relative imports containing deep directory jumps (e.g. `../../../../Button`).
- **CSS / Styles Imports**: Place global styles inside a single file (like `globals.css` or `index.css`) imported inside the root `layout.tsx`. Do not import CSS files arbitrarily in layout sub-components.

---

## 📁 Folder Organization
- Keep the folders inside `app/` exclusively dedicated to routing declarations.
- Place feature components, hooks, services, and types inside a dedicated `features/` directory outside or inside `src/`. For example:
  - `src/features/billing/components/BillingForm.tsx`
  - `src/features/billing/hooks/useBilling.ts`
  Expose public APIs for feature components using a clean index file (`index.ts`).
