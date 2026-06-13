# Kiến Trúc Dự Án & Tổ Chức Mã Nguồn Golang

Tài liệu này quy định cấu trúc thư mục Standard Go Project Layout và cách tổ chức Clean Architecture trong hệ thống.

---

## 🏗️ Cấu Trúc Thư Mục Tiêu Chuẩn (Standard Layout)
Bắt buộc tuân thủ mô hình thư mục sau:
- **/cmd:** Chỉ chứa điểm khởi chạy ứng dụng (ví dụ: `cmd/api/main.go`). Mã nguồn tại đây chỉ thực hiện đọc cấu hình (config parsing), khởi tạo Container và kích hoạt server. Không viết logic nghiệp vụ.
- **/internal:** Chứa toàn bộ mã nguồn cốt lõi của ứng dụng. Go compiler sẽ ngăn chặn mọi package bên ngoài import mã nguồn từ thư mục này. Viết 100% logic nghiệp vụ tại đây.
- **/pkg:** Chứa các thư viện bổ trợ độc lập, có thể chia sẻ cho dự án khác (ví dụ: `pkg/logger`, `pkg/crypto`). Mã nguồn trong `/pkg` không được phép import ngược lại `/internal`.
- **/api:** Chứa các file định nghĩa API (OpenAPI/Swagger schemas, gRPC proto files).

---

## 🏛️ Tổ Chức Clean Architecture (Lớp / Layer)
Mã nguồn trong thư mục `/internal/app` hoặc `/internal/<domain>` phải chia làm 3 lớp:
1. **Entities (Domain Models):** Struct dữ liệu thuần túy và các phương thức xử lý logic cốt lõi, không chứa bất kỳ dependency bên ngoài nào.
2. **Use Cases (Services):** Lớp điều phối logic nghiệp vụ. Chỉ tương tác với các Interface đại diện cho tầng ngoại vi.
3. **Adapters (Controllers / Repositories):** Giao tiếp ngoại vi (GORM, REST API Fiber/Echo, GRPC Handlers).

---

## 💉 Dependency Injection Thủ Công (Manual DI)
- **Constructor Injection:** Mọi struct ở lớp UseCase hay Repository phải được truyền các phụ thuộc thông qua hàm khởi tạo `New[StructName]`. Các phụ thuộc này bắt buộc là Interface.
- **Ví dụ:**
```go
type UserRepository interface {
    GetByID(ctx context.Context, id int64) (*domain.User, error)
}

type UserUseCase struct {
    repo UserRepository // Giao tiếp qua Interface
}

func NewUserUseCase(r UserRepository) *UserUseCase {
    return &UserUseCase{repo: r}
}
```
