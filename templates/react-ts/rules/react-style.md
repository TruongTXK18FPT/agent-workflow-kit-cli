# React + TypeScript Style Rules

All React + TypeScript code in this project must follow these rules.

## Naming
- Components use PascalCase and live in PascalCase files: `Navbar.tsx`, `InstallSection.tsx`.
- Custom hooks use camelCase, start with `use`, and live in matching files: `useAuth.ts`, `useBillingData.ts`.
- Helper functions and variables use camelCase: `formatCurrency`, `isSubmitting`.
- Interfaces and type aliases use PascalCase: `ButtonProps`, `AuthState`.
- Constants that represent fixed configuration may use SCREAMING_SNAKE_CASE only when already established locally.

## Imports
- Use absolute imports from the `@/` alias for source modules.
- Do not use parent-chain relative imports such as `../../components/Button`.
- Prefer `import type` for type-only imports.
- Keep feature internals private unless exported through a feature `index.ts`.

## React and JSX
- Keep components focused on rendering and composition.
- Move data fetching, subscriptions, timers, storage access, and other side effects into custom hooks.
- Boolean JSX attributes must use shorthand: `<Input disabled />`, not `<Input disabled={true} />`.
- Pass event handlers as named functions when the body is more than a single expression.
- Render loading, error, empty, and success states for async UI.

## State Management
- Prefer local state for component-only interactions.
- Use Context API for stable app-level concerns such as auth, theme, locale, or configuration.
- Use Zustand for shared mutable state that changes often or is consumed across distant features.
- Do not introduce global state for data that can remain feature-local.

## Testing
- Test user-visible behavior with React Testing Library.
- Add hook tests when a custom hook owns branching logic, async behavior, or cleanup.
- Avoid snapshots unless the output is intentionally stable and small.
