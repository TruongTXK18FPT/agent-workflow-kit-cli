# Code Splitting & Routing Rules

This ruleset outlines expectations for structuring router declarations, loading performance optimization, and runtime boundary protections.

---

## ⚡ Code Splitting (Dynamic Imports)
- **Dynamic Pages**: Do not statically import full page components at the top level of router files. This bundles the entire application code into a single file and degrades initial page load performance.
- **Lazy Loading**: Use `React.lazy()` to import page components dynamically, dividing route destinations into separate bundles:
  ```typescript
  const DashboardPage = React.lazy(() => import("@/features/dashboard/components/DashboardPage"));
  ```
- **Fallback Suspension**: Wrap lazy-loaded components in a `<Suspense>` component. Provide a high-fidelity shimmer skeleton loader or loading indicator as the fallback property to maintain visual continuity.

---

## 🗺️ Centralized Routing Architecture (React Router v6+)
- **Data Router**: Define routes as data configuration arrays using `createBrowserRouter` instead of JSX-based `<Routes>` declarations.
- **Data Loaders**: Utilize router Loaders to pre-fetch required data in parallel with route navigation.
- **Data Actions**: Utilize router Actions to handle data modification (mutations and forms submissions).
- **Page Crash Isolation**: Define a dedicated `errorElement` on all primary parent route levels. When a page encounters a crash (e.g. invalid API response, parsing failure), the local `ErrorBoundary` will intercept the error and render a recovery screen without crashing the rest of the application.
