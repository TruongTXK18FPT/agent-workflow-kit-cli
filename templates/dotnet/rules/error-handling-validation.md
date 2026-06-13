# Xử Lý Ngoại Lệ Tập Trung & Xác Thực Tự Động (FluentValidation)

Tài liệu này quy định cấu hình xử lý ngoại lệ tập trung qua Middleware và xác thực dữ liệu đầu vào bằng thư viện FluentValidation trong ứng dụng .NET.

---

## 🛡️ Xác Thực Dữ Liệu Tự Động Với FluentValidation
- **Quy tắc:** Mọi API Request nhận dữ liệu phức tạp phải đi kèm một Validator kế thừa từ `AbstractValidator<T>` để định nghĩa các ràng buộc dữ liệu.
- Cấu hình FluentValidation để tự động kiểm duyệt và trả về lỗi 400 Bad Request cho Client nếu dữ liệu không khớp, tránh viết các câu lệnh `if` lặp lại.

  ```csharp
  // Ví dụ về một Validator
  using FluentValidation;

  public class CreateCourseRequestValidator : AbstractValidator<CreateCourseRequestDto>
  {
      public CreateCourseRequestValidator()
      {
          RuleFor(x => x.Title)
              .NotEmpty().WithMessage("Tiêu đề khóa học không được để trống.")
              .MaximumLength(150).WithMessage("Tiêu đề không được vượt quá 150 ký tự.");

          RuleFor(x => x.Price)
              .GreaterThanOrEqualTo(0).WithMessage("Giá khóa học không được nhỏ hơn 0.");
      }
  }
  ```

---

## 🚨 Xử Lý Lỗi Tập Trung (Global Exception Middleware)
- **Quy tắc:** Tuyệt đối không để lộ các ngoại lệ thô của hệ thống (lỗi DB, stack traces) cho Client với mã lỗi 500.
- Xây dựng một Middleware toàn cục (`ExceptionHandlingMiddleware`) hoặc sử dụng tính năng `IExceptionHandler` trong .NET 8+ để bắt toàn bộ các lỗi xảy ra trong ứng dụng và định dạng lại thành cấu trúc JSON chuẩn:

  ```json
  {
    "success": false,
    "statusCode": 500,
    "timestamp": "2026-06-13T07:42:00.000Z",
    "message": "Đã xảy ra lỗi hệ thống. Vui lòng liên hệ quản trị viên."
  }
  ```

  ```csharp
  // Cấu trúc Exception Handling Middleware tiêu chuẩn
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
              message = "Đã xảy ra lỗi hệ thống. Vui lòng liên hệ quản trị viên."
          };

          return context.Response.WriteAsJsonAsync(response);
      }
  }
  ```
