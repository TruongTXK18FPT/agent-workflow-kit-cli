# React + TypeScript Style Rules

This ruleset outlines base conventions for React + TypeScript projects. Detail guidelines are split into specialized modules which the agent MUST follow:
- Styling & Aesthetics: See `@premium-ui.md`
- Data Fetching & Server-State: See `@data-fetching.md`
- Form Handling & Zod Validation: See `@forms-validation.md`
- Code Splitting & Routing: See `@routing-splitting.md`
- SEO & Accessibility (a11y): See `@seo-accessibility.md`

---

## 🏷️ Naming Conventions
- **Components**: PascalCase (e.g. `Navbar.tsx`, `InstallSection.tsx`).
- **Custom hooks**: camelCase starting with `use` (e.g. `useAuth.ts`, `useCustomers.ts`).
- **Helpers & variables**: camelCase (e.g. `formatCurrency`, `customerData`).
- **Types & interfaces**: PascalCase (e.g. `ButtonProps`, `CustomerData`).
- **Routes**: `<name>.route.tsx` (e.g. `customers.route.tsx`).
- **Feature Folders**: kebab-case or lowercase (e.g. `billing`, `user-profile`).

---

## 📦 Imports
- **Absolute imports**: Always use absolute alias paths starting with `@/` (e.g. `import { Button } from "@/shared/components"`). Avoid deep relative parent imports (e.g. `../../components`).
- **Type imports**: Always use `import type` when importing types or interfaces to optimize bundle compilation.
- **Encapsulation**: Keep feature-internal files private. Only export public features via the module `index.ts`.

---

## ⚙️ React & JSX Guidelines
- **UI Composition**: Components must focus solely on rendering UI/composition and delegating logic.
- **Logic Delegation**: Keep side effects (fetching, subscriptions, timers, complex state transitions) inside custom hooks.
- **Shorthand Props**: Prefer shorthand for boolean flags (e.g. `<Input disabled />` instead of `<Input disabled={true} />`).
- **Async UI States**: Always explicitly handle async UI transitions (e.g. loading, error, empty, success).

---

## 💾 State Management
- **Local State**: Prefer component-local state (`useState`, `useReducer`) for isolated UI interactions.
- **Context API**: Use the Context API only for low-frequency global values (e.g. theme, locale, user session credentials).
- **Zustand**: Use Zustand for frequent, cross-feature state updates or complex frontend state orchestration.
- **Locality**: Keep state as close to the components consuming it as possible before lifting it up.
