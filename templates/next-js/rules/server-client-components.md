# React Server Components (RSC) vs Client Components (RCC)

This ruleset governs the rendering boundaries and component classification rules within Next.js App Router applications.

---

## 🏛️ React Server Components (RSC)
- **Default Behavior**: Every page, layout, and component created inside the `app/` routing directory is a React Server Component by default.
- **RSC Advantages**:
  - Direct data fetching using async/await.
  - Safe usage of server-side packages (database queries, file systems, security key imports).
  - Reduced bundle size on the client since RSC code is compiled and rendered on the server.
- **Rules**:
  - Keep data loading and page structure inside RSCs.
  - Do not add `"use client"` to layouts or page entry points unless absolutely necessary.

---

## 💻 React Client Components (RCC)
- **Definition**: Components that run in the browser to enable dynamic state updates and user interactions.
- **Interactivity Markers**: You must use `"use client"` only when a component:
  - Hooks into state lifecycle elements (`useState`, `useReducer`, `useEffect`, `useLayoutEffect`).
  - Calls browser-only APIs (window, local storage, custom viewport hooks).
  - Registers dynamic DOM listener callbacks (e.g. `onClick`, `onChange`, `onSubmit`).
- **RCC Boundary Isolation**:
  - Keep RCCs at the leaf level (components at the very bottom of the render tree) to optimize bundle size and speed.
  - For example, if a dashboard lists products (RSC) and has a search bar (RCC), place the search input field in a client component leaf (`<SearchBar />` with `"use client"`) and import it into the server-rendered dashboard.
