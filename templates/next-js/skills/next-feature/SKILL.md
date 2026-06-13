---
name: next-feature
description: Generate or extend a new Next.js + TypeScript page or route handler with caching and metadata
---

Follow this process to generate a new page, layout, or API route handler in Next.js.

Inputs:
- featureName: Name of the route or page (e.g., `dashboard`)
- targetPath: The directory inside the `app/` folder to implement the route
- userFlow: Brief description of the page behavior and layout

Steps:
1. Scan neighboring directories in the `app/` folder to check for shared layouts and error boundaries (`error.tsx`).
2. Set up the route directory structure according to Next.js standards (e.g., `app/(dashboard)/billing`).
3. Declare TypeScript interfaces for route parameters and query parameters.
4. Implement the page or layout structure as a **React Server Component (RSC)**.
5. If user interaction or form handling is needed, isolate it in a leaf Client Component (RCC) marked with `"use client"` and import it into the parent RSC.
6. Configure explicit caching parameters for all data fetching `fetch()` calls.
7. Set up static or dynamic SEO metadata using the `generateMetadata` function.
8. Define a local error handler file (`error.tsx`) in the route directory to catch runtime exceptions.
9. Execute local validation:
   - `{{runCommand}} lint`
   - `{{runCommand}} typecheck`
   - `{{runCommand}} test`
   - `{{runCommand}} build`
