# Kiến Trúc Mô-đun & Cơ Chế Tiêm Phụ Thuộc (DI)

Tài liệu này quy định ranh giới Module, cơ chế cô lập mã nguồn, Encapsulation và cách tiêm phụ thuộc chuẩn trong NestJS.

---

## 💉 Tiêm Phụ Thuộc (Dependency Injection)
- **Cấm tiêm thuộc tính (Property Injection):** Tuyệt đối không dùng `@Inject()` trực tiếp trên thuộc tính của Class trừ trường hợp tiêm các token tùy biến (Custom Tokens). Việc tiêm thuộc tính làm giảm khả năng kiểm thử (mocking) và làm loãng mã nguồn.
- **Bắt buộc tiêm qua Hàm Khởi Tạo (Constructor Injection):** Sử dụng cơ chế tự động phân giải phụ thuộc của NestJS qua từ khóa `private readonly` trong constructor.

  * **Không hợp lệ (❌ Cấm viết):**
    ```typescript
    @Injectable()
    export class AuthService {
      @Inject(UsersService)
      private readonly usersService: UsersService;
    }
    ```
  * **Hợp lệ (✔️ Khuyến khích):**
    ```typescript
    @Injectable()
    export class AuthService {
      constructor(private readonly usersService: UsersService) {}
    }
    ```

---

## 🏗️ Ranh Giới Mô-đun & Encapsulation
- **Cô lập theo mặc định (Encapsulation by Default):** Các Provider (Services, Repositories) bên trong một Module mặc định là private. Các module khác không thể truy cập nếu không được export công khai.
- **Chia sẻ tài nguyên qua Module:** Khi Module B muốn sử dụng Service của Module A:
  1. Thêm Service đó vào mảng `exports` trong `@Module()` của Module A.
  2. Import Module A vào mảng `imports` của Module B.
  * Nghiêm cấm import trực tiếp Service của Module A vào danh sách `providers` của Module B.
- **Mô-đun Toàn cục (Global Modules):** Hạn chế sử dụng `@Global()` ngoại trừ các mô-đun hạ tầng chung cực kỳ ổn định (như cơ sở dữ liệu hoặc cấu hình hệ thống).
