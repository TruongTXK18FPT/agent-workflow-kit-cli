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
2. Create the target feature package under the designated project folder.
3. Implement layers:
   - `entity/`: Database models.
   - `repository/`: Spring Data JPA interface.
   - `dto/`: Request/Response schemas with jakarta.validation annotations.
   - `service/`: Service interfaces and implementations.
   - `web/`: Controller class exposing `@RestController` with proper mappings.
4. Create tests:
   - Service Unit Tests using Mockito.
   - `@WebMvcTest` for Controller routing, payloads, and validation.
   - `@DataJpaTest` for custom queries.
5. Run validations:
   - `./mvnw verify`
