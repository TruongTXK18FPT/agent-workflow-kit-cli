# Unified Exception Handling & Automated Validation (FluentValidation)

This document defines configurations for centralized exception handling using Middleware and incoming request validation using the FluentValidation library in .NET applications.

---

## 🛡️ Automated Validation with FluentValidation
- **Rule:** Every API request representing complex input data payloads must have a corresponding validator class inheriting from `AbstractValidator<T>` to declare validation rules.
- Configure FluentValidation to automatically intercept invalid requests and return an HTTP `400 Bad Request` payload to the client, preventing repetitive manual validation checks inside Controllers.

  ```csharp
  // Example of a Validator class
  using FluentValidation;

  public class CreateCourseRequestValidator : AbstractValidator<CreateCourseRequestDto>
  {
      public CreateCourseRequestValidator()
      {
          RuleFor(x => x.Title)
              .NotEmpty().WithMessage("Course title cannot be empty.")
              .MaximumLength(150).WithMessage("Title must not exceed 150 characters.");

          RuleFor(x => x.Price)
              .GreaterThanOrEqualTo(0).WithMessage("Course price cannot be less than 0.");
      }
  }
  ```

---

## 🚨 Centralized Exception Handling (Global Exception Middleware)
- **Rule:** Never expose raw system exceptions (such as database faults, file system errors, or stack traces) directly to clients as HTTP 500 errors.
- Build a global middleware (`ExceptionHandlingMiddleware`) or implement `IExceptionHandler` in .NET 8+ to intercept all unhandled exceptions and format them into a standard JSON payload:

  ```json
  {
    "success": false,
    "statusCode": 500,
    "timestamp": "2026-06-13T07:42:00.000Z",
    "message": "An internal server error occurred. Please contact the administrator."
  }
  ```

  ```csharp
  // Standard Global Exception Handling Middleware
  public class ExceptionHandlingMiddleware
  {
      private readonly RequestDelegate _next;
      private readonly ILogger<ExceptionHandlingMiddleware> _logger;

      public ExceptionHandlingMiddleware(RequestDelegate next, ILogger<ExceptionHandlingMiddleware> logger)
      {
          _next = next;
          _logger = logger;
      }

      public async Task InvokeAsync(HttpContext context)
      {
          try
          {
              await _next(context);
          }
          catch (Exception ex)
          {
              _logger.LogError(ex, "An unhandled exception has occurred.");
              await HandleExceptionAsync(context, ex);
          }
      }

      private static Task HandleExceptionAsync(HttpContext context, Exception exception)
      {
          context.Response.ContentType = "application/json";
          context.Response.StatusCode = StatusCodes.Status500InternalServerError;

          var response = new
          {
              success = false,
              statusCode = context.Response.StatusCode,
              timestamp = DateTime.UtcNow,
              message = "An internal server error occurred. Please contact the administrator."
          };

          return context.Response.WriteAsJsonAsync(response);
      }
  }
  ```
