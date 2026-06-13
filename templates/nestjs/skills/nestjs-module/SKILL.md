---
name: nestjs-module
description: Tự động sinh trọn bộ cấu phần gồm Module, Controller, Service, DTO, Entity theo đúng chuẩn hệ thống NestJS
---

Tuân thủ quy trình này để tạo mới một Module NestJS hoặc mở rộng một mô-đun hiện có.

Đầu vào (Inputs):
- moduleName: Tên của mô-đun cần tạo (ví dụ: `products`)
- targetPath: Thư mục đích đặt mã nguồn bên dưới `src/`
- functionality: Tóm tắt yêu cầu nghiệp vụ và các endpoints cần cung cấp

Các bước thực hiện (Steps):
1. Tạo thư mục mô-đun `<moduleName>/` bên dưới thư mục `src/` (ví dụ: `src/products`).
2. Định nghĩa Entity model trong thư mục `<moduleName>/entities/`.
3. Định nghĩa các Request/Response DTO trong thư mục `<moduleName>/dto/`. Thêm các decorator validation tương ứng.
4. Xây dựng lớp Service trong `<moduleName>/` kế thừa DI của NestJS. Đặt toàn bộ business logic và bắt lỗi để ném ra các HttpException tường minh ở đây.
5. Xây dựng Controller trong `<moduleName>/` để ánh xạ các yêu cầu HTTP, kiểm tra phân quyền (Guards) và trả về kết quả JSON phù hợp.
6. Đăng ký Controller và Service vào file định nghĩa mô-đun `<moduleName>.module.ts`, export Service nếu các module khác cần sử dụng.
7. Viết unit test cho Service (`.spec.ts`) và cấu hình kịch bản kiểm thử tích hợp (E2E) sử dụng Supertest.
8. Chạy kiểm tra lỗi cục bộ:
   - `{{runCommand}} lint`
   - `{{runCommand}} typecheck`
   - `{{runCommand}} test`
   - `{{runCommand}} build`
