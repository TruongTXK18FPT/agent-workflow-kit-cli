# Quy Ước Đặt Tên & Coding Style cho Express.js

Tài liệu này hướng dẫn coding style sạch, định nghĩa kiểu dữ liệu tường minh bằng TypeScript trong môi trường Express.js.

---

## 🏷️ Quy Ước Đặt Tên (Naming Conventions)

### Thư mục Phân lớp (Architecture Folders)
Mã nguồn phải được tách biệt hoàn toàn theo kiến trúc 3 lớp (3-Tier Architecture):
```bash
src/
├── config/             # Cấu hình biến môi trường, kết nối Database
├── middlewares/        # Các hàm Middleware (Auth, Log, Validation)
├── models/             # Schema cơ sở dữ liệu (Mongoose, Sequelize ORM, Prisma)
├── routes/             # Định tuyến HTTP, cấu hình gắn kết middleware đầu vào
├── controllers/        # Điều phối Request, định dạng Response đầu ra
├── services/           # Chứa 100% logic nghiệp vụ xử lý dữ liệu và tính toán
├── utils/              # Các hàm bổ trợ dùng chung
└── app.ts              # File khởi tạo cấu hình Express App
```

### Quy ước Tên Tệp tin (File Naming)
- **Tính đồng nhất:** Toàn bộ dự án phải chọn và tuân thủ duy nhất định dạng `kebab-case.ts`.
- **Hậu tố định danh:** Tên file phải đi kèm vai trò kiến trúc của nó làm hậu tố:
  - Controller: `user-controller.ts`
  - Service: `user-service.ts`
  - Route: `user-route.ts`
  - Middleware: `auth-middleware.ts`, `validate-middleware.ts`
  - Model: `user-model.ts`

---

## 📦 Định Nghĩa Kiểu Dữ Liệu & Quy Chuẩn TypeScript
- **Khai báo kiểu dữ liệu tường minh:** Không dùng kiểu ngầm định. Luôn định nghĩa rõ ràng kiểu cho tham số `req`, `res`, và `next` lấy từ thư viện `express`:
  ```typescript
  import { Request, Response, NextFunction } from 'express';
  ```
- **Không lạm dụng `any`:** Định nghĩa đầy đủ các interface hoặc type cho các cấu trúc dữ liệu gửi lên và trả về cho Client.
