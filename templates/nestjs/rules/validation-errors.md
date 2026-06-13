# Xác Thực Dữ Liệu & Quản Lý Lỗi Tập Trung

Tài liệu này quy định việc sử dụng Class Validator, thiết lập ValidationPipe toàn cục và xử lý lỗi tập trung qua Exceptions Filters trong NestJS.

---

## 🛡️ Kiểm Thử Dữ Liệu Đầu Vào (Validation & Transformation)
- **Định hình DTO nghiêm ngặt:** Toàn bộ dữ liệu đầu vào của HTTP Request (`@Body()`, `@Query()`, `@Param()`) phải được đặc tả qua các lớp DTO sử dụng decorator từ `class-validator` (như `@IsString()`, `@IsEmail()`, `@IsInt()`).
- **Kích hoạt ống lọc toàn cục (Global Validation Pipe):** Khai báo tại file `main.ts` để tự động lọc bỏ các thuộc tính không nằm trong danh sách trắng (whitelist) và tự động ép kiểu dữ liệu (transform).

  ```typescript
  // Trong file main.ts
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,            // Tự động loại bỏ các thuộc tính không khai báo trong DTO
      forbidNonWhitelisted: true, // Ném lỗi 400 nếu client gửi thuộc tính thừa
      transform: true,            // Tự động chuyển đổi kiểu dữ liệu (string sang number, object sang DTO class)
    }),
  );
  ```

---

## 🚨 Quản Lý Ngoại Lệ Toàn Cục (Unified Exception Handling)
- **Cấm trả về lỗi hệ thống thô:** Tuyệt đối không để lộ lỗi thô (chẳng hạn như lỗi từ DB, lỗi kết nối dịch vụ) ra ngoài client với mã lỗi 500.
- **Sử dụng HttpExceptions tích hợp:** Bắt buộc phải bắt lỗi (try/catch) ở tầng Service và ánh xạ sang các Http Exception tường minh của NestJS (`NotFoundException`, `BadRequestException`, `ForbiddenException`, v.v.).
  
  ```typescript
  try {
    return await this.courseRepo.findOneOrFail(id);
  } catch (error) {
    throw new NotFoundException("Khóa học không tồn tại trên hệ thống.");
  }
  ```

- **Tập trung hóa bằng Exception Filter:** Xây dựng một Filter toàn cục để cấu trúc lại định dạng JSON trả về cho Client một cách đồng nhất. Phản hồi lỗi hệ thống mong muốn phải có cấu trúc:

  ```json
  {
    "success": false,
    "statusCode": 404,
    "timestamp": "2026-06-13T06:48:24.000Z",
    "path": "/api/v1/courses/999",
    "message": "Khóa học không tồn tại trên hệ thống."
  }
  ```
