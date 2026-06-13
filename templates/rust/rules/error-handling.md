# Xử Lý Lỗi Và Độ Tin Cậy Trong Rust

Tài liệu này quy định các nguyên tắc nghiêm ngặt về quản lý lỗi, lan truyền lỗi và cách áp dụng các thư viện lỗi chuẩn hóa.

---

## 🚫 Nghiêm Cấm Lạm Dụng Panic
- **Quy tắc:** Tuyệt đối không sử dụng `panic!`, `.unwrap()`, hoặc `.expect()` trong code production chạy chính. Việc này sẽ làm sập tiến trình Web Server ngoài ý muốn khi gặp lỗi runtime.
- **Trường hợp ngoại lệ:** Chỉ được phép sử dụng `panic!` hoặc `.unwrap()` trong:
  - Mã nguồn kiểm thử (Tests).
  - Khởi tạo ban đầu (Bootstrapping / CLI setup) khi thiếu cấu hình nghiêm trọng.
  - Các khối code đã chứng minh được về mặt logic là không bao giờ có thể xảy ra lỗi (Invariants).

---

## 🔄 Trả Về Result Và Sử Dụng Toán Tử `?`
- Toàn bộ luồng logic nghiệp vụ bình thường phải trả về kiểu dữ liệu `Result<T, E>` hoặc `Option<T>`.
- Sử dụng toán tử `?` để lan truyền lỗi lên tầng cao hơn một cách tự nhiên và sạch sẽ.

---

## 📚 Hệ Sinh Thái Thư Viện Lỗi: `thiserror` vs `anyhow`
Cấm kết hợp hoặc sử dụng bừa bãi hai thư viện lỗi này. AI phải tuân thủ phân cấp:
- **Dùng `thiserror` cho tầng Thư viện hoặc Domain Modules:** Định nghĩa kiểu lỗi rõ ràng, kiểu dữ liệu mạnh (Strongly Typed) cho từng trường hợp lỗi cụ thể.
```rust
use thiserror::Error;

#[derive(Error, Debug)]
pub enum DatabaseError {
    #[error("Không tìm thấy người dùng có ID {0}")]
    UserNotFound(i64),
    #[error("Lỗi kết nối cơ sở dữ liệu gốc: {0}")]
    ConnectionFailed(String),
}
```
- **Dùng `anyhow` cho tầng Ứng dụng (Application Entry / API Gateway / CLI commands):** Nơi không cần phân tách chi tiết kiểu lỗi mà cần gộp tất cả các loại lỗi từ các tầng thư viện lại để log và hiển thị nhanh ra bên ngoài.
