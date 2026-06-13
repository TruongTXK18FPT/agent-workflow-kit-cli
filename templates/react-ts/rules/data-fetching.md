# Asynchronous Server-State & API Call Rules

This ruleset governs network communication, caching, server-state syncing, and component integration logic to guarantee high performance, security, and clean separation of concerns.

---

## 🚫 No Raw useEffect Fetching
- **Forbidden**: Do not write raw `useEffect` blocks to fetch remote data inside UI components. Raw effects are prone to memory leaks, state sync race conditions, lack of cache validation, and component bloatedness.

---

## 🔌 Centralized API Client
- **Single Instance**: Route all HTTP/HTTPS outgoing traffic through a unified API client instance (e.g. located at `src/lib/api-client.ts`).
- **Responsibility**:
  - Configure core variables (e.g. `baseURL`, `timeout`).
  - Attach authorization tokens dynamically via request interceptors.
  - Implement unified global error handling (e.g. intercepting `401 Unauthorized` for token refresh, `403 Forbidden`, `500 Server Error`).

---

## 🔄 Server-State Management
- **Library Selection**: Use **TanStack Query (React Query)** or **SWR** to manage asynchronous server-state (fetching, caching, caching invalidation, background updates).
- **Separation of Concerns**: UI components must never deal with query functions or endpoints. Components only request custom query hooks and render the layout based on:
  - `isLoading`: displays placeholder/Skeleton UI.
  - `isError`: displays recovery panel/notification.
  - `data`: displays final UI.
- **Hook Encapsulation**: Declare data fetching inside specialized feature-local custom hooks:

  ```typescript
  // src/features/roadmap/api/use-roadmap.ts
  import { useQuery } from "@tanstack/react-query";
  import { apiClient } from "@/lib/api-client";

  export const useRoadmap = (roadmapId: string) => {
    return useQuery({
      queryKey: ["roadmaps", roadmapId],
      queryFn: async () => {
        const response = await apiClient.get(`/roadmaps/${roadmapId}`);
        return response.data;
      },
      staleTime: 5 * 60 * 1000, // consider data fresh for 5 minutes
      gcTime: 10 * 60 * 1000,    // keep in cache for 10 minutes before garbage collection
    });
  };
  ```
