# Data Fetching & Mutations Rules

This ruleset governs network requests, caching, invalidation, and data mutations using Next.js Server Actions.

---

## 🔌 Data Fetching at the Source
- **RSC Fetching**: Fetch data directly inside async React Server Components (`RSC`). This secures API endpoints, credentials, and minimizes network latency by co-locating the data-gathering execution on the server.
- **Rules**:
  - Do not use client-side fetch wrapper utilities inside server pages. Use standard async/await syntax.

---

## 💾 Caching & Revalidation
- **No Infinite Static Fetching**: Do not call `fetch()` without a caching strategy. Every request must declare its revalidation lifecycle or cache settings explicitly.
  
  * **Incorrect (❌ Forbidden)**:
    ```typescript
    // Fetches static data infinitely without any revalidation strategy
    const res = await fetch('https://api.skillverse.vn/v1/courses');
    ```
  * **Correct (✔️ Required)**:
    ```typescript
    // Configures Incremental Static Regeneration (ISR) with cache tags
    const res = await fetch('https://api.skillverse.vn/v1/courses', { 
      next: { revalidate: 3600, tags: ['courses'] } 
    });
    ```
- **Caching Revalidation**: Use `revalidatePath` or `revalidateTag` inside Server Actions to purge old query entries and force Next.js cache updates.

---

## ⚡ Mutations via Server Actions
- **Server Actions Requirement**: All write operations (POST, PUT, DELETE, PATCH) must be routed through Next.js Server Actions. Mark them explicitly with the `"use server"` directive at the top of the function or file block.
- **Component Interactivity Guidelines**:
  - Wrap forms using the React hook `useActionState` (or `useFormState` in earlier React 19 release candidates) to manage processing states (`isPending`) and capture server response payloads (errors, success messages).
  - Wrap action mutations in `useTransition` to keep the UI interactive and prevent screen freezing during background processing.
