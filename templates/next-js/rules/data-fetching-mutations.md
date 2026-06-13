# Data Fetching & Mutations

This document defines standard conventions for calling APIs, managing caching, and performing data mutations using Next.js Server Actions.

---

## 🔌 Data Fetching at the Source
- **Execute inside RSCs:** Call `fetch()` directly inside async Server Components (`RSC`). This secures API endpoints, protects authentication tokens, and minimizes network latency by co-locating fetching and rendering.
- **Rule:** Do not use client-side fetch wrappers inside server pages. Use standard async/await syntax.

---

## 💾 Caching & Revalidation
- **No Raw Fetch:** Using raw `fetch()` without specifying caching or revalidation strategies is prohibited.
  
  * **Invalid (❌ Prohibited):**
    ```typescript
    // Fetches static data indefinitely without any revalidation strategy
    const res = await fetch('https://api.skillverse.vn/v1/courses');
    ```
  * **Valid (✔️ Recommended):**
    ```typescript
    // Configure ISR (Incremental Static Regeneration) with an explicit cache tag
    const res = await fetch('https://api.skillverse.vn/v1/courses', { 
      next: { revalidate: 3600, tags: ['courses'] } 
    });
    ```
- **Cache Refreshing:** Call `revalidatePath` or `revalidateTag` inside Server Actions to purge stale cache entries and force Next.js to pull fresh data.

---

## ⚡ Mutations via Server Actions
- **Use Server Actions:** All POST, PUT, DELETE, and PATCH mutations must be processed through Server Actions marked with the `"use server"` directive at the top of the function or file.
- **Fluid User Experience:**
  - Use the `useActionState` (or `useFormState` in React versions prior to 19) hook to manage server response states and track the `isPending` state.
  - Wrap mutation executions inside `useTransition` to keep the user interface responsive and prevent freezing during background mutations.
