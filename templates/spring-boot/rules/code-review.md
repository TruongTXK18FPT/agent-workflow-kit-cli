# Java Spring Boot Code Review & Security Rules

Follow these guidelines during self-review or peer review to ensure database integrity, security, and clean exception handling.

## 1. Transaction Management (`@Transactional`)
- **ReadOnly Transactions**: Use `@Transactional(readOnly = true)` for service methods that only perform read operations (improves Hibernate performance and prevents dirty checking).
- **Self-Invocation Trap**: Do not invoke a `@Transactional` method from another method within the same bean (Spring proxy-based AOP will bypass the transaction interceptor). Instead, move the target method to a separate service or inject the service itself lazily.
- **Rollback Configuration**: By default, transactions only rollback on unchecked exceptions (`RuntimeException`). If checked exceptions are thrown and require rollback, use `@Transactional(rollbackFor = Exception.class)`.

## 2. Global Exception Handling
- **No Swallowed Exceptions**: Never catch an exception and ignore it without logging. If you log it, always pass the exception object as the last parameter to print the stack trace: `logger.error("Failed to perform task: {}", err.getMessage(), err)`.
- **Global Handler**: Ensure all exceptions map to a unified response structure via a global controller advice Class annotated with `@ControllerAdvice` or `@RestControllerAdvice`.
- **Custom Exceptions**: Create domain-specific runtime exceptions (e.g. `ResourceNotFoundException`, `BadRequestException`) mapped to HTTP statuses instead of throwing raw `RuntimeException`.

## 3. Security Checkpoints
- **SQL Injection Prevention**: Never concatenate raw strings to build SQL or JPQL queries. Always use parameterized queries or bind parameters:
  - *Incorrect*: `"SELECT u FROM User u WHERE name = '" + input + "'"`
  - *Correct*: `"SELECT u FROM User u WHERE name = :name"`
- **Access Control**: Enforce endpoint authorization constraints using Spring Security annotations such as `@PreAuthorize("hasRole('ROLE_USER')")` on Controllers or Service layers.
- **Input Sanitization**: Request bodies and parameters must validate constraints (e.g. `@NotBlank`, `@Size`) at the web controller entry point.

## 4. Code Quality & Resource Management
- **Leak Prevention**: Always close resource streams (Files, JDBC connections, Network streams) using `try-with-resources` statements.
- **Thread Safety**: Avoid static fields that hold request-scoped state. Ensure shared services are thread-safe (stateless beans).
- **Unused Code**: Clean up unused imports, dead comments, and debug log messages before pushing code.
