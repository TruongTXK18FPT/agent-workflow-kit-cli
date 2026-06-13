# Aesthetics, Styling & Premium UI Rules

This ruleset outlines strict requirements for styling, responsiveness, and micro-animations to ensure premium visual excellence and high UX fidelity.

---

## 🎨 Tailwind CSS Guidelines
- **No inline custom CSS**: All interface elements must be constructed using Tailwind utility classes. Do not write inline custom CSS (e.g. style properties or stylesheet files containing static layouts) unless standard utility classes are insufficient.
- **Dynamic Classes handling**: Never use string interpolation or string addition (e.g. `isActive ? 'bg-blue-500' : 'bg-gray-500'`) to concatenate dynamic class names. This causes CSS specificity issues and classes override failure.
- **Helper cn() usage**: Always use the custom `cn()` helper utility that integrates `clsx` and `tailwind-merge` for combining dynamic class values:
  
  ```typescript
  // src/utils/cn.ts
  import { ClassValue, clsx } from "clsx";
  import { twMerge } from "tailwind-merge";

  export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
  }
  ```

  * **Incorrect (❌ Forbidden)**:
    ```tsx
    <button className={`px-4 py-2 text-white ${isActive ? 'bg-blue-500' : 'bg-gray-500'} ${customClass}`}>
    ```
  * **Correct (✔️ Required)**:
    ```tsx
    <button className={cn("px-4 py-2 text-white transition-all", isActive ? "bg-blue-500" : "bg-gray-500", customClass)}>
    ```

---

## 📱 Mobile-First Responsiveness
- **Default Styles**: Apply classes for the smallest screen size (mobile viewport) by default.
- **Breakpoint Overrides**: Use breakpoints (`sm:`, `md:`, `lg:`, `xl:`, `2xl:`) to introduce or change styling parameters for larger viewports.
- **Layout Checking**: Always verify flex direction (`flex-col` vs `flex-row`), grid layout templates (`grid-cols-1` vs `md:grid-cols-3`), padding, margin, and typography scales on both small and large viewports to avoid layout issues.

---

## ⚡ Micro-animations & Motion
- **Libraries**: Use `framer-motion` (or the core `motion` package) for micro-animations and physical state changes.
- **Natural Transitions**:
  - Keep animations fast and responsive: transition duration must range between `0.2s` and `0.3s`.
  - Use natural, fluid easing curves (like `easeOut` or `easeInOut`) or spring-based models for buttons, toggles, hover states, and modals.
- **Unmounting Transitions**: When components unmount or disappear from the DOM, they must be wrapped within the `<AnimatePresence>` component to ensure exit animations complete smoothly without sudden visual disappearance.
