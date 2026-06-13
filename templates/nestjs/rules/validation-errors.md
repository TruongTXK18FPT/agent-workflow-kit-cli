# Data Validation & Unified Exception Handling

This document specifies conventions for using Class Validator, configuring the global ValidationPipe, and handling errors centrally via Exception Filters in NestJS.

---

## 🛡️ Input Validation & Transformation
- **Strict DTO Mapping:** All incoming HTTP request data (`@Body()`, `@Query()`, `@Param()`) must be mapped using DTO classes decorated with rules from `class-validator` (such as `@IsString()`, `@IsEmail()`, `@IsInt()`).
- **Global Validation Pipe:** Configure the global `ValidationPipe` inside `main.ts` to automatically strip properties not declared in the DTO (whitelist) and transform inputs into their corresponding types.

  ```typescript
  // Inside main.ts
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,            // Auto-strips properties not declared in DTO
      forbidNonWhitelisted: true, // Throws HTTP 400 if client sends extra fields
      transform: true,            // Auto-casts types (e.g. string to number, object to class instance)
    }),
  );
  ```

---

## 🚨 Unified Exception Handling
- **No Raw System Errors:** Never expose raw database or execution exceptions directly to clients with HTTP 500 errors.
- **Built-in HttpExceptions:** Implement try/catch blocks within Services and map failures to explicit NestJS HttpExceptions (e.g., `NotFoundException`, `BadRequestException`, `ForbiddenException`).
  
  ```typescript
  try {
    return await this.courseRepo.findOneOrFail(id);
  } catch (error) {
    throw new NotFoundException("The requested course does not exist.");
  }
  ```

- **Global Exception Filter:** Implement a global Exception Filter to structure JSON error responses uniformly. The standardized error payload must follow this structure:

  ```json
  {
    "success": false,
    "statusCode": 404,
    "timestamp": "2026-06-13T06:48:24.000Z",
    "path": "/api/v1/courses/999",
    "message": "The requested course does not exist."
  }
  ```
