# Java Spring Boot Production Readiness Rules

Ensure the application is configured correctly for deployment to staging and production environments.

## 1. Database Migrations (Flyway / Liquibase)
- **Schema Control**: Do not set `spring.jpa.hibernate.ddl-auto` to `update`, `create`, or `create-drop` in production. Always set it to `none` or `validate`.
- **Migration Scripts**: All database schema changes (creating tables, adding columns, modifying indexes) must be managed using versioned migration files (e.g., Flyway `.sql` scripts placed under `src/main/resources/db/migration/`).

## 2. Profile Management & Configuration Security
- **Strict Profile Isolation**: Separate environment properties using Spring Profiles (e.g. `application-dev.yml` for local development, `application-prod.yml` for production).
- **No Hardcoded Credentials**: Database passwords, encryption keys, and external API tokens must never be committed to source code. Inject them using environment variable placeholders:
  - *Example*: `password: ${DATABASE_PASSWORD:default_dev_pass}`
- **Config Validation**: Use `@ConfigurationProperties` with `@Validated` to check configuration values on application startup.

## 3. Monitoring & Health Diagnostics (Spring Boot Actuator)
- **Actuator Health Checks**: Enable Spring Boot Actuator. The `/actuator/health` endpoint must be configured to check database connectivity and critical services.
- **Endpoint Security**: Do not expose sensitive actuator endpoints (like `/actuator/env` or `/actuator/heapdump`) publicly. Keep them protected under Spring Security.
  - *Example configuration*:
    `management.endpoints.web.exposure.include: health,info,metrics`

## 4. API Documentation & Stability
- **OpenAPI / Swagger documentation**: New or modified REST controllers must include OpenAPI annotations (`@Tag`, `@Operation`, `@ApiResponse`) to keep the Swagger documentation up-to-date.
- **Graceful Shutdown**: Configure Spring Boot for graceful shutdown to ensure currently active requests finish processing before the JVM terminates:
  - *Properties*: `server.shutdown: graceful`
