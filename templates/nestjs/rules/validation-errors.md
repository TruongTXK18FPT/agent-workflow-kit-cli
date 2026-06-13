# Input Validation & Exception Handling Rules

This ruleset governs request parameter validation, payload sanitization, and structured HTTP error responses for NestJS applications.

---

## 🛡️ Input Validation (Class Validator)
- **Strict DTO Mapping**: All request inputs (`@Body()`, `@Query()`, `@Param()`) must use explicit Class schemas decorated with validation rules from `class-validator` (e.g. `@IsString()`, `@IsEmail()`, `@MinLength()`).
- **Global Validation Pipe**: The application entry point (`main.ts`) must activate a global validation pipe configured as follows:
  ```typescript
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,            // Automatically strips fields not defined in the DTO schema
      forbidNonWhitelisted: true, // Throws a 400 error if client sends unwhitelisted parameters
      transform: true,            // Automatically transforms request payloads into DTO instances and converts types
    }),
  );
  ```

---

## 🚨 Exception Handling (HTTP Errors)
- **No Raw Stack Traces**: Never expose raw system database errors, filesystem failures, or internal exception stack traces to the client with generic 500 status codes.
- **Service Exceptions**: Wrap asynchronous and critical database executions in try/catch blocks within the Service layer, converting exceptions into explicit NestJS HTTP exceptions:
  ```typescript
  try {
    return await this.courseRepo.findOneOrFail(id);
  } catch (error) {
    throw new NotFoundException("Course does not exist on this system.");
  }
  ```

- **Global Exception Filter**: Implement a global exception filter (`ExceptionFilter`) to intercept all application errors and return a standardized JSON error response structure:
  ```json
  {
    "success": false,
    "statusCode": 404,
    "timestamp": "2026-06-13T06:48:24.000Z",
    "path": "/api/v1/courses/999",
    "message": "Course does not exist on this system."
  }
  ```
