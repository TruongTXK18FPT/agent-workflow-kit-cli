# UNIVERSAL GLOBAL RULES (GLOBAL_RULES.md)

NOTICE TO AI AGENT: All source code generated in this project – regardless of language, framework, or architecture (Frontend, Backend, AI Agent) – must strictly adhere to the following 4 pillars of engineering rules. Any violations will result in code rejection.

---

## 🏛️ PILLAR 1: DATABASE & MIGRATION GOVERNANCE
The main goal is to protect data integrity, prevent data loss in Production environments, and optimize core query performance.

### 1.1 Strict No Auto-Sync in Production
- **Rule:** Never use properties or commands that automatically synchronize schema changes directly to the database in a Production environment (e.g., `synchronize: true` in TypeORM/Hibernate, `prisma db push`, `sequelize.sync()`, or GORM's `db.AutoMigrate()` running automatically at startup).
- **Mandatory Solution:** All structural changes (adding columns, modifying types, dropping tables, creating indices) must be written in independent, timestamped migration files (e.g., `YYYYMMDDHHMMSS_migration_name`).
- **Workflow:** Migration files must be verified locally and executed only via the ORM/Driver CLI tool prior to production deployment.

### 1.2 Strict Indexing Strategy
- **Prerequisite:** Any column frequently appearing in `WHERE` clauses, `JOIN` conditions, or `ORDER BY` statements in large-scale growing tables (e.g., `user_id`, `status`, `created_at`) must be indexed.
- **Write Prevention:** Avoid indexing columns indiscriminately. For columns with high-frequency updates (`INSERT`/`UPDATE`/`DELETE`), redundant indices will severely degrade write performance.
- **Unique Constraints:** Identity fields requiring uniqueness (e.g., `email`, `username`, `phone_number`) must be configured with a `UNIQUE` index at the Database level, not just validated in the Application code.

### 1.3 Eliminate N+1 Query Issues
- **Issue:** Never query child relations inside loops (`for`, `while`, `forEach`) for a list of records (e.g., fetching 100 courses and looping 100 times to execute SQL to get the instructor for each course).
- **Solution:** Use Eager Loading (direct SQL `JOIN`s, or pre-fetching methods like `.Include()` in EF Core, `Preload` in GORM, `select_related` / `prefetch_related` in Python) to retrieve all relational data in a single query.

### 1.4 Connection Pool Management
- All database connections must go through a Connection Pool. The AI Agent must not manually open/close connections per request.
- You must configure explicit limits: `max_connections` (maximum connections), `idle_timeout` (unused connection release time), and `max_lifetime` to prevent database server resource exhaustion.

---

## 🛡️ PILLAR 2: SECURITY & AUTH HARDENING
Ensure the system is immune to vulnerabilities listed in the OWASP Top 10.

### 2.1 Zero Hardcoded Secrets
- **Strict Prohibition:** Never write database connection strings, third-party API Keys (e.g., OpenAI, Stripe), JWT secrets, or system passwords directly into the codebase.
- **Implementation:** All sensitive values must be loaded into the application via Environment Variables or System Env.
- **Documentation:** Every project must include a `.env.example` file listing all required environment keys with empty values, guiding others on how to configure the project.

### 2.2 JWT Lifecycle & Storage Standards (JSON Web Token)
- **Access Token:** Configure a short lifespan (minimum 15 minutes, maximum 1 hour) to reduce the window of vulnerability if the token is compromised.
- **Refresh Token:** Must have a longer expiration (7 days to 30 days) and must be stored in an `HttpOnly`, `Secure`, `SameSite=Strict` cookie on the client side. Storing Refresh Tokens in `localStorage` or `sessionStorage` is strictly prohibited to prevent account takeover via XSS.

### 2.3 Input Validation & Injection Defense
- **Mass Assignment Defense (Overposting):** Never map client request objects (e.g., `req.body`) directly to database update statements without filtering. Data must be validated and filtered using DTOs (Data Transfer Objects), Pydantic Schemas, or Struct validations.
- **SQL Injection Defense:** All database queries must use Parameterized Queries (Prepared Statements). String concatenation to construct dynamic SQL/NoSQL queries is strictly prohibited.

### 2.4 CORS & Rate Limiting
- **CORS:** Using `Origin: '*'` is strictly prohibited in Production. A whitelist of permitted frontend domains must be explicitly defined.
- **Rate Limiting:** Sensitive or resource-intensive endpoints (e.g., Login, Register, Forgot Password, Send OTP, LLM AI generation APIs) must be protected by rate-limiting middleware (e.g., maximum 5 requests/minute/IP) to defend against DoS and brute-force attacks.

---

## 🚦 PILLAR 3: OBSERVABILITY & STRUCTURED LOGS
Transition the system from blind debugging to proactive monitoring using structured log data.

### 3.1 Structured Logging Standards
- Printing raw text directly to the console (e.g., `console.log()`, `fmt.Println()`, `print()`, or `println!()`) is prohibited in Production.
- **Mandatory Format:** All logs written to stdout/stderr must use JSON format so that Log Aggregators (ELK Stack, Grafana Loki, Datadog) can automatically parse and index them.
- **Required fields in every JSON log line:**
```json
{
  "timestamp": "2026-06-13T16:00:00.000Z",
  "level": "ERROR",
  "trace_id": "c4b37d89-9821-47d3-b12a-7e61a4b9812f",
  "context": "PaymentService",
  "message": "Failed to connect to Stripe payment gateway",
  "error_details": {
    "code": "STRIPE_TIMEOUT",
    "stack": "Error: Timeout after 5000ms at StripeClient.request..."
  }
}
```

### 3.2 Strict Log Levels
The AI Agent must select the appropriate log level for every event:
- **DEBUG:** Detailed execution flow tracing during development (must be automatically disabled or hidden in Production).
- **INFO:** Normal but important system events (e.g., Server started on port 8080, cache cleanup completed).
- **WARN:** Abnormal situations that do not fail the request (e.g., user entered incorrect password, third-party API responded slowly but succeeded).
- **ERROR:** Severe errors that terminate request execution and require developer intervention (e.g., database connection loss, invoice file write failure, logic errors).

### 3.3 Masking PII (Personally Identifiable Information)
- Never print sensitive PII into public log systems.
- Fields containing passwords, credit card numbers, national IDs/passports, and access/refresh tokens must be masked (e.g., converted to `*`) or omitted from the logged objects.

---

## 📦 PILLAR 4: CONTAINER & CI/CD GUARDRAILS
Ensure applications can be deployed automatically onto Cloud environments (Kubernetes, AWS, Docker Swarm) efficiently and securely.

### 4.1 Mandatory Multi-Stage Builds
Every Dockerfile must consist of at least 2 stages:
- **Stage 1 (Build Stage):** Use a base image containing all necessary tools (SDKs, Compilers, devDependencies) to compile the source code and install packages.
- **Stage 2 (Production Runtime Stage):** Copy only compiled assets and production dependencies (e.g., `dist` folder, compiled binary, node production modules) from Stage 1. This final image must not contain raw source code or development utilities, minimizing bundle size.

### 4.2 Principle of Least Privilege
- **No Root User:** Never run container processes using the default `root` user. Running containers as root introduces severe security risks in case of container escape vulnerabilities.
- **Solution:** Initialize a non-privileged user in the Dockerfile (e.g., `USER node` in Node.js, or `useradd -u 1001 appuser` in Go/Rust) and grant appropriate execution permissions to this user.

### 4.3 Health Check API
- All backend services must expose a dedicated health check endpoint (e.g., `GET /health` or `GET /ready`).
- This endpoint must check downstream connectivity (e.g., Database, Redis) and return HTTP Status `503 Service Unavailable` if unhealthy.
- Use the `HEALTHCHECK` directive in the Dockerfile so orchestrators like Kubernetes can detect failures and automatically restart unhealthy containers (Self-healing).
