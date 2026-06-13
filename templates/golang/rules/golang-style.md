# Golang Coding Style Rules

This document defines naming conventions, interface designs, and code style rules for Golang projects.

---

## 🏷️ Naming Conventions
- **Package Names:** Must be short, single-word, lowercase names (e.g., `user`, `config`, `db`, `auth`). Never use `camelCase`, `snake_case`, or hyphens.
- **Private Symbols (Variables & Functions):** Use `camelCase` (e.g., `userID`, `fetchData`).
- **Public Symbols (Exported):** Use `PascalCase` to export variables, functions, and structs (e.g., `UserID`, `FetchData`).
- **Acronyms:** Keep acronyms consistent in casing (e.g., `userID` instead of `userId`, `httpServer` instead of `httpServer`).

---

## 🔌 Interface Design
- **Rule:** *"Accept interfaces, return structs"*. This optimizes escape analysis and maintains clean API boundaries.
- **Minimality:** Design interfaces to be small, ideally declaring only 1 or 2 methods (e.g., `io.Reader`, `io.Writer`).
- **Naming:** End interface names with the `-er` suffix if they declare a single method (e.g., `Reader`, `Writer`, `Validator`).

---

## 🚫 Avoid Global Variables
- **No Global Mutable State:** Do not instantiate global variables for connections, logs, or caches.
- **Solution:** Pass dependencies explicitly through struct constructors (Dependency Injection) instead of accessing global instances.
