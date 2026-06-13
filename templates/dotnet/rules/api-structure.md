# Presentation Layer Structure (API Controllers)

This document defines the structure and responsibilities of API Controllers inside the Presentation layer of a .NET application.

---

## 🏛️ API Controller Responsibilities
An API Controller is responsible for:
1. Receiving incoming HTTP requests from clients.
2. Mapping URL parameters, query strings, or request bodies into target request DTOs.
3. Delegating request processing to the Application layer (Services/Queries/Commands).
4. Receiving results and responding to the client using appropriate HTTP status codes (e.g., `200 OK`, `201 Created`, `400 Bad Request`, `404 Not Found`).

---

## 🚦 Development Rules
- **Thin Controllers:** Controllers must not contain business logic, algorithmic calculations, or direct database queries. 100% of this logic must reside in the Application layer.
- **Do Not Inject DbContext into Controllers:** Keep `DbContext` encapsulated within the Infrastructure / Repository layers. The Presentation layer must never access `DbContext` directly.
- **Use DTOs Instead of Domain Entities:**
  - Never accept raw Domain Entities as Controller input parameters.
  - Never return raw Domain Entities directly to the client to prevent exposing the database schema or triggering cyclic reference errors. Always map records to DTO (Data Transfer Object) classes.
- **Explicit Route Declarations:** Use attribute routing to clearly declare HTTP methods and endpoints:
  ```csharp
  [ApiController]
  [Route("api/v1/[controller]")]
  public class CoursesController : ControllerBase
  {
      private readonly ICourseService _courseService;

      public CoursesController(ICourseService courseService)
      {
          _courseService = courseService;
      }

      [HttpGet("{id}")]
      public async Task<IActionResult> GetById(Guid id)
      {
          var course = await _courseService.GetByIdAsync(id);
          if (course == null) return NotFound();
          return Ok(course);
      }
  }
  ```
