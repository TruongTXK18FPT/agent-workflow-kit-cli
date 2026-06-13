# Cấu Trúc Lớp Presentation (API Controllers)

Tài liệu này quy định cấu trúc và trách nhiệm của API Controllers trong tầng Presentation của ứng dụng .NET.

---

## 🏛️ Trách Nhiệm Của API Controller
API Controller chịu trách nhiệm:
1. Nhận yêu cầu HTTP (HTTP Requests) từ client.
2. Ánh xạ các tham số URL, Query String, hoặc Request Body vào các DTO tương ứng.
3. Chuyển giao các tham số đó sang tầng Application (Services/Queries/Commands).
4. Nhận lại kết quả và phản hồi Client thông qua các mã trạng thái HTTP phù hợp (200 OK, 201 Created, 400 Bad Request, 404 Not Found, v.v.).

---

## 🚦 Quy Tắc Phát Triển
- **Controller mỏng (Thin Controllers):** Controllers không chứa bất kỳ logic nghiệp vụ, tính toán thuật toán, hay truy vấn DB trực tiếp. 100% logic đó phải nằm dưới Application layer.
- **Không tiêm DbContext vào Controller:** DbContext phải được che giấu dưới Infrastructure / Repository layer. Tầng Presentation tuyệt đối không gọi DbContext.
- **Sử dụng DTO thay vì Entity trực tiếp:**
  - Không nhận trực tiếp Domain Entities làm đầu vào của Controller.
  - Không trả trực tiếp Domain Entities về cho Client để tránh lộ cấu trúc DB hoặc lỗi cyclic references. Luôn ánh xạ qua các lớp DTO (Data Transfer Objects).
- **Cấu hình định tuyến Route rõ ràng:** Sử dụng attribute routing để khai báo rõ ràng phương thức HTTP và endpoint:
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
