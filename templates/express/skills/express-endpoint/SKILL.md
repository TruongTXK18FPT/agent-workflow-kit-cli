---
name: express-endpoint
description: Sinh hoặc mở rộng một API Endpoint Express.js + TypeScript an toàn, đầy đủ từ Router, Controller đến Validator
---

Tuân thủ quy trình này để tạo mới một API Endpoint Express.js hoặc mở rộng tuyến định tuyến hiện có.

Đầu vào (Inputs):
- endpointName: Tên của API Endpoint cần tạo (ví dụ: `user-profile`)
- routePath: Đường dẫn tuyến HTTP của API (ví dụ: `/api/v1/users/profile`)
- httpMethod: Phương thức HTTP (GET, POST, PUT, DELETE)
- targetPath: Thư mục gốc chứa mã nguồn của mô-đun để đặt tệp tin

Các bước thực hiện (Steps):
1. Định nghĩa Zod Validation Schema dưới thư mục `middlewares/` hoặc bên cạnh controller để kiểm duyệt các trường dữ liệu đầu vào.
2. Xây dựng hàm Service tương ứng bên dưới thư mục `services/` để đảm nhiệm 100% logic xử lý nghiệp vụ, truy vấn dữ liệu ORM.
3. Triển khai Controller điều phối trong thư mục `controllers/` sử dụng tiện ích bọc `asyncHandler` để giải phóng việc try/catch thủ công, nhận tham số từ request và gửi phản hồi dạng JSON sạch.
4. Đăng ký Controller và gắn middleware `validateSchema(zodSchema)` vào file định tuyến Route tương ứng bên dưới thư mục `routes/`.
5. Bổ sung các test suite kiểm thử đơn vị cho Service và kiểm thử tích hợp (E2E) qua Supertest.
6. Chạy kiểm tra lỗi cục bộ:
   - `{{runCommand}} lint`
   - `{{runCommand}} typecheck`
   - `{{runCommand}} test`
   - `{{runCommand}} build`
