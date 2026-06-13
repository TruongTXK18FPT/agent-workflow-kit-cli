# React Server Components (RSC) vs React Client Components (RCC)

This document establishes architectural boundaries and classification rules for components in Next.js App Router projects.

---

## 🏛️ React Server Components (RSC)
- **Default Behavior:** All pages, layouts, and components created within the `app/` routing directory must default to React Server Components (RSC).
- **RSC Benefits:**
  - Fetch data directly using async/await syntax at the server level.
  - Securely utilize server-side libraries and APIs (e.g., database queries, file reading, private tokens).
  - Decrease client-side bundle sizes because RSC code remains on the server and is not sent to the browser.
- **Rules:**
  - Perform all data fetching and layout structure setups within RSCs.
  - Never add the `"use client"` directive to layout or page entrypoint files unless absolutely necessary.

---

## 💻 React Client Components (RCC)
- **Definition:** Components that execute on the browser to support dynamic user interactions and state updates.
- **Identifying RCCs:** Attach the `"use client"` directive only at leaf component levels when they:
  - Use React hooks (`useState`, `useReducer`, `useEffect`, `useLayoutEffect`).
  - Use browser-specific APIs (e.g., `window`, `localStorage`, custom viewport hooks).
  - Bind DOM event listeners (e.g., `onClick`, `onChange`, `onSubmit`).
- **RCC Isolation Guidelines:**
  - Keep RCCs at the absolute leaf level of the rendering tree to optimize loading speed.
  - *Example:* If a product list page (RSC) includes a search input (RCC), encapsulate the search input in its own component (e.g., `<SearchBar />` marked with `"use client"`) and import it into the server-rendered parent page.
