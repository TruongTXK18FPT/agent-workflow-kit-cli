# Cấu Trúc Dự Án & Tổ Chức Module Trong Rust

Tài liệu này quy định cách phân chia module, ranh giới Crate, cấu trúc Cargo Workspace và Dependency Injection chuẩn trong Rust.

---

## 🏗️ Cấu Trúc Module & Crate (Binary/Library Separation)
- **Tách biệt binary và library:** 
  - `src/main.rs`: Điểm khởi chạy của dự án binary. Chỉ thực hiện parse cấu hình, nạp môi trường và khởi chạy server.
  - `src/lib.rs`: Chứa toàn bộ logic nghiệp vụ cốt lõi, có thể tái sử dụng và kiểm thử độc lập.
- **Quản lý tầm nhìn (Visibility Control):** Tuyệt đối không lạm dụng việc khai báo `pub`. Ưu tiên sử dụng `pub(crate)` để giới hạn quyền truy cập các cấu phần nội bộ bên trong cùng một Crate. Giữ phạm vi công khai (`pub`) ở mức tối giản nhất để duy trì tính đóng gói.

---

## 📦 Cargo Workspaces (Đa Crate)
Đối với các hệ thống lớn có cấu trúc monorepo hoặc chia thành nhiều thành phần độc lập, bắt buộc chia nhỏ dự án thành một Cargo Workspace chứa các Crate riêng biệt:
```toml
# File Cargo.toml ở thư mục gốc của dự án
[workspace]
members = [
    "crates/api-gateway",
    "crates/user-domain",
    "crates/core-engine",
    "crates/shared-utils"
]
```

---

## 💉 Dependency Injection Bằng Trait (Trait-Based DI)
Do cơ chế quản lý lifetimes và borrow checker khắt khe của Rust, việc tiêm phụ thuộc lỏng lẻo bắt buộc phải sử dụng **Traits** kết hợp với con trỏ thông minh an toàn đa luồng `Arc<dyn Trait + Send + Sync>`:
```rust
use std::sync::Arc;

pub trait UserRepository: Send + Sync {
    fn find_by_id(&self, id: i64) -> Result<User, AppError>;
}

pub struct UserService {
    // Tiêm phụ thuộc lỏng qua con trỏ thông minh Arc mã hóa động
    repo: Arc<dyn UserRepository>,
}

impl UserService {
    pub fn new(repo: Arc<dyn UserRepository>) -> Self {
        Self { repo }
    }
}
```
