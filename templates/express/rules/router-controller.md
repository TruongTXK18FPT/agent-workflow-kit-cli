# Architectural Boundaries (Router vs Controller vs Service)

This document establishes boundaries and responsibilities for routers, controllers, and services in Express.js projects.

---

## 🏛️ Data Flow Chain
All features in the repository must comply with the standard 3-tier architecture data flow:
$$\text{Client} \longrightarrow \text{Router} \longrightarrow \text{Middleware} \longrightarrow \text{Controller} \longrightarrow \text{Service} \longrightarrow \text{Model/Database}$$

---

## 🚦 Layer Responsibilities

### 1. Router Layer (`routes/`)
- **Role:** Exclusively responsible for mapping HTTP methods + paths and binding authentication or payload validation middlewares (e.g., Zod schemas).
- **Rule:** Under no circumstances should the Router layer house business calculations or database operations. It must only forward requests to the target Controller.

### 2. Controller Layer (`controllers/`)
- **Role:** Responsible for extracting input payloads from the Express `req` object (`req.body`, `req.query`, `req.params`, `req.user`), forwarding these arguments to the Service layer, receiving outcomes, and responding to the client via `res.status().json()`.
- **Rules:**
  - Never query database models or call ORM clients inside the Controller.
  - Never write manual try/catch blocks (delegate errors to the global error handler using async wrappers).

### 3. Service Layer (`services/`)
- **Role:** Houses 100% of the core business logic, coordinates data mutations, executes algorithms, and interacts with Database models.
- **Rule:** Never import, reference, or access Express-specific objects (`req`, `res`, or `next`) inside Services. The Service layer must remain completely decoupled from the web framework to maintain isolated testability.
