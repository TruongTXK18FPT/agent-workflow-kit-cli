---
name: dotnet-controller
description: Sinh hoặc mở rộng một API Controller ASP.NET Core mới cùng DTOs, FluentValidation và Service interface tương ứng
---

Tuân thủ quy trình này để tạo mới một API Endpoint hoặc Controller trong .NET (C#).

Đầu vào (Inputs):
- controllerName: Tên của Controller (ví dụ: `CoursesController`)
- routePath: Tuyến định tuyến HTTP (ví dụ: `api/v1/courses`)
- requestDtoName: Tên lớp Request DTO (ví dụ: `CreateCourseRequestDto`)
- functionality: Tóm tắt yêu cầu nghiệp vụ và các phương thức cần xử lý

Các bước thực hiện (Steps):
1. Khai báo các lớp Request/Response DTOs tương ứng bên trong tầng Application (hoặc thư mục `DTOs` của dự án).
2. Xây dựng một lớp Validator kế thừa từ `AbstractValidator<T>` bằng FluentValidation bên dưới Application layer để kiểm tra ràng buộc dữ liệu.
3. Định nghĩa Service Interface (ví dụ: `ICourseService`) và lớp triển khai cụ thể (`CourseService`) ở tầng Application/Core để xử lý business logic.
4. Đăng ký Service nghiệp vụ vừa tạo vào Dependency Injection container (Scoped lifetime) trong file `Program.cs`.
5. Tạo lớp Controller kế thừa từ `ControllerBase` được đánh dấu bằng các attribute `[ApiController]` và `[Route]`.
6. Sử dụng Constructor Injection để tiêm Service Interface vào Controller và gọi phương thức xử lý thích hợp, ánh xạ kết quả trả về thông qua các `IActionResult` (như `Ok()`, `Created()`, `BadRequest()`).
7. Viết unit test cho Service và Controller bằng xUnit và Moq.
8. Chạy kiểm tra lỗi biên dịch cục bộ:
   - `dotnet build`
   - `dotnet test`
