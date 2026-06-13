# Quy Ước Đặt Tên & Coding Style cho NestJS

Tài liệu này hướng dẫn coding style chuẩn TypeScript, quy tắc đặt tên tệp tin và lớp trong NestJS.

---

## 🏷️ Quy Ước Đặt Tên (Naming Conventions)

### Kỹ thuật Đặt Tên Tệp (Dot Notation)
Tất cả các tệp tin trong NestJS phải tuân thủ nghiêm ngặt định dạng cấu trúc: `<tên-đối-tượng>.<loại-cấu-phần>.ts`.

```bash
# Thư mục module luôn dùng số nhiều hoặc số ít đồng nhất (Ví dụ: auth, users, products)
src/users/
├── users.module.ts
├── users.controller.ts
├── users.service.ts
├── dto/
│   ├── create-user-request.dto.ts
│   └── update-user-response.dto.ts
├── entities/
│   └── user.entity.ts
├── guards/
│   └── roles.guard.ts
└── interceptors/
    └── logging.interceptor.ts
```

### Quy ước đặt tên Lớp (Class Naming)
Tên lớp phải được viết theo định dạng PascalCase và kết thúc bằng tên cụ thể của loại cấu phần đó:
- **Controller:** `src/auth/auth.controller.ts` $\rightarrow$ `export class AuthController {}`
- **Service:** `src/auth/auth.service.ts` $\rightarrow$ `export class AuthService {}`
- **Module:** `src/auth/auth.module.ts` $\rightarrow$ `export class AuthModule {}`
- **DTO:** `src/auth/dto/login.dto.ts` $\rightarrow$ `export class LoginRequestDto {}`

---

## 📦 TypeScript & Sắp Xếp Decorator
- **Sắp xếp Decorator:** Nhóm và sắp xếp các decorator một cách khoa học. Các decorator định nghĩa phương thức HTTP (`@Get()`, `@Post()`) nằm trên cùng, tiếp theo là cấu hình bảo mật hoặc kiểm duyệt đầu vào (`@UseGuards()`, `@UseInterceptors()`).
- **Kiểu trả về tường minh:** Khai báo kiểu trả về rõ ràng cho tất cả các phương thức trong Controller và Service để bảo đảm tính chặt chẽ của kiểu dữ liệu.
- **Nghiêm cấm kiểu dữ liệu `any`:** Luôn khai báo class hoặc interface tương ứng cho các tham số và kết quả xử lý.
