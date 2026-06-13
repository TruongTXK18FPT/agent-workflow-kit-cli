# Routing & Controller Separation Rules

This ruleset enforces a strict 3-tier architecture separating endpoints, request handlers, and business logic to prevent spaghetti layouts.

---

## 🏛️ Strict Layer Separation Flow
Data flows strictly from left to right along this sequence:
$$\text{Client} \longrightarrow \text{Router} \longrightarrow \text{Middleware} \longrightarrow \text{Controller} \longrightarrow \text{Service} \longrightarrow \text{Model/Database}$$

---

## 🚦 Layer Responsibilities

### 1. Router Layer (`routes/`)
- **Rule**: Routers must only define endpoints and paths. Never write processing logic or route redirection scripts here.
- **Conventions**:
  - Instantiate routes via `express.Router()`.
  - Bind validation middlewares (`validateSchema(zodSchema)`) and security guards (e.g. JWT check) directly to the route path declaration.
  - Forward the request cleanly to the mapped Controller handler method.

### 2. Controller Layer (`controllers/`)
- **Rule**: Controllers coordinate incoming HTTP request payloads and format JSON output responses.
- **Conventions**:
  - Extract input arguments explicitly from the Express request object (`req.body`, `req.query`, `req.params`, `req.user`).
  - Call the appropriate Service layer function passing the extracted inputs.
  - Return HTTP response statuses and JSON bodies cleanly using `res.status().json()`.
  - **Never** interact with Database models or execute SQL/ORM commands directly in a Controller.

### 3. Service Layer (`services/`)
- **Rule**: The Service layer encapsulates 100% of the database writes, queries, algorithms, and business calculations.
- **Conventions**:
  - Run database model queries (Prisma, Mongoose, Sequelize).
  - Throw explicit JavaScript error instances on failures.
  - **Never** reference or import Express `req`, `res`, or `next` objects. The Service layer must remain completely framework-agnostic to enable test isolation.
