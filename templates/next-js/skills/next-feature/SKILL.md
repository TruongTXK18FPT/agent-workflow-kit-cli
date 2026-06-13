---
name: next-feature
description: Generates or extends a Next.js + TypeScript page or route handler with caching and metadata
---

Follow this workflow to create a new Next.js page, layout, or route handler.

Inputs:
- featureName: Name of the route or page (e.g., `dashboard`)
- targetPath: The route folder inside `app/` to extend
- userFlow: Brief description of the page's behavior and layout

Steps:
1. Inspect neighboring directories under `app/` and identify existing layouts and error boundaries.
2. Formulate the path structure using Next.js app conventions (e.g. `app/(dashboard)/billing`).
3. Set up page parameters and query parameters interface.
4. Implement the page or layout as a **React Server Component (RSC)**.
5. If search or form inputs are present, create client-rendered leaves (RCC) marked with `"use client"` and import them into the RSC page.
6. Declare a caching strategy for all `fetch` data operations.
7. Set up dynamic metadata via `generateMetadata` or static metadata export.
8. Wire error elements (`error.tsx`) at the nearest route folder to catch runtime issues.
9. Run validations:
   - `{{runCommand}} lint`
   - `{{runCommand}} typecheck`
   - `{{runCommand}} test`
   - `{{runCommand}} build`
