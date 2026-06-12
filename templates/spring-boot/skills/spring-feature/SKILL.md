---
name: spring-feature
description: Generates or extends a Java Spring Boot feature module
---

Follow this workflow to create a new REST feature or API slice in the project.

Inputs:
- featureName: Name of the feature (e.g., `billing`)
- endpointPath: Base path of the controller (e.g., `/api/v1/billing`)

Steps:
1. Examine neighboring feature packages for error handler conventions and mappings.
2. Identify or create the target packages under `src/main/java/{{packagePath}}`.
3. Implement layers:
{{#if (eq packageLayout "feature-first")}}
   - `entity/`: Database models inside the feature package (`src/main/java/{{packagePath}}/\{{featureName}}/entity/`).
   - `repository/`: Spring Data JPA interface inside the feature package (`src/main/java/{{packagePath}}/\{{featureName}}/repository/`).
   - `dto/`: Request/Response schemas with `{{validationLibrary}}` annotations (`src/main/java/{{packagePath}}/\{{featureName}}/dto/`).
   - `service/`: Service interfaces and implementations (`src/main/java/{{packagePath}}/\{{featureName}}/service/`).
   - `web/`: Controller class exposing `@RestController` with proper mappings (`src/main/java/{{packagePath}}/\{{featureName}}/web/`).
{{else}}
   - `entity/`: Database models under `src/main/java/{{packagePath}}/entity/`.
   - `repository/`: Spring Data JPA interface under `src/main/java/{{packagePath}}/repository/`.
   - `dto/`: Request/Response schemas with `{{validationLibrary}}` annotations under `src/main/java/{{packagePath}}/dto/`.
   - `service/`: Service interfaces and implementations under `src/main/java/{{packagePath}}/service/`.
   - `web/`: Controller class under `src/main/java/{{packagePath}}/controller/`.
{{/if}}
4. Create comprehensive tests (using {{testFramework}}):
   - **Service Unit Tests**: Mock repository and downstream dependencies using Mockito. Cover the main happy path, exception handling branches, null parameters, and boundary conditions.
   - **Controller Slice Tests (`@WebMvcTest`)**: Verify routing paths, payload serialization, and constraint validation errors. Ensure you test invalid inputs (e.g. missing fields, out of bound size values, incorrect formats) and verify they return HTTP 400 or appropriate error responses.
   - **Repository Slice Tests (`@DataJpaTest`)**: Verify custom database query logic and entity-column bindings.
5. Perform Code Quality & Production Readiness Checks:
   - Review your changes against `@code-review.md` to check transaction boundaries (`@Transactional`), avoid swallowed exceptions, check thread safety, and prevent SQL injection.
   - Verify that any database schema changes are added as migration scripts, and configurations are profile-isolated under `@production-ready.md`.
6. Run validations:
   - `{{buildCommand}} clean test`
   - `{{buildCommand}} {{buildVerifyArgs}}`
