---
name: dotnet-controller
description: Scaffold or extend an ASP.NET Core API Controller with corresponding DTOs, FluentValidation, and Service interfaces
---

Follow this process to generate a new API Endpoint or Controller in .NET (C#).

Inputs:
- controllerName: Name of the Controller (e.g., `CoursesController`)
- routePath: HTTP route mapping (e.g., `api/v1/courses`)
- requestDtoName: Class name of the request DTO (e.g., `CreateCourseRequestDto`)
- functionality: Summary of the business requirements and methods to process

Steps:
1. Declare the corresponding Request/Response DTO classes inside the Application layer (or the project's `DTOs` directory).
2. Create a Validator class inheriting from FluentValidation's `AbstractValidator<T>` in the Application layer to define data constraints.
3. Define the Service Interface (e.g., `ICourseService`) and its concrete implementation class (`CourseService`) in the Application layer to handle business logic.
4. Register the new Service in the Dependency Injection container (using Scoped lifetime) inside the `Program.cs` configuration file.
5. Create the Controller class inheriting from `ControllerBase`, decorated with `[ApiController]` and `[Route]` attributes.
6. Use Constructor Injection to inject the Service Interface into the Controller, delegate request processing, and map responses to appropriate `IActionResult` objects (e.g., `Ok()`, `Created()`, `BadRequest()`).
7. Write unit tests for the Service and Controller using xUnit and Moq.
8. Execute compilation and testing:
   - `dotnet build`
   - `dotnet test`
