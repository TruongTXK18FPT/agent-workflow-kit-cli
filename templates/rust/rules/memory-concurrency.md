# Quản Lý Bộ Nhớ & Đồng Thời Trong Rust

Tài liệu này quy định việc sử dụng Lifetimes, lựa chọn Smart Pointers chính xác, và an toàn đa luồng trong Async Rust (Tokio).

---

## ⏳ Quản Lý Lifetimes ('a)
- Khi một struct hoặc hàm giữ một tham chiếu đến vùng dữ liệu nằm ngoài tầm kiểm soát của nó, bắt buộc phải khai báo tường minh vòng đời (Lifetimes) để compiler xác thực thời gian sống an toàn:
```rust
pub struct TokenValidator<'a> {
    pub secret_key: &'a str,
}
```
- Tránh tìm cách trốn tránh Borrow Checker bằng cách dùng từ khóa `'static` hoặc gọi `.clone()` bừa bãi khi có thể giải quyết bằng Lifetimes hợp lệ.

---

## 🧠 Lựa Chọn Smart Pointers
AI phải lựa chọn chính xác các con trỏ thông minh dựa trên ngữ cảnh thiết kế bộ nhớ theo bảng phân cấp sau:

| Loại Con Trỏ | Môi Trường | Đặc Tính Vùng Nhớ | Ứng Dụng Thực Tế |
| :--- | :--- | :--- | :--- |
| **`Box<T>`** | Đơn / Đa luồng | Cấp phát dữ liệu kích thước lớn lên Heap | Ép phẳng cấu trúc dữ liệu đệ quy (Recursive Types) |
| **`Rc<T>`** | Chỉ Đơn Luồng | Đếm tham chiếu không an toàn luồng | Chia sẻ dữ liệu đọc trong các tác vụ đơn luồng |
| **`Arc<T>`** | Đa Luồng | Đếm tham chiếu an toàn (Atomic Ref Counter) | Chia sẻ tài nguyên dùng chung giữa các luồng xử lý Web Server |
| **`RefCell<T>`** | Đơn luồng | Interior Mutability (Mượn ghi tại Runtime) | Thay đổi dữ liệu bên trong một đối tượng bất biến đơn luồng |
| **`Mutex<T>`** | Đa luồng | Đảm bảo an toàn ghi giữa các luồng bằng khóa | Bảo vệ tài nguyên dùng chung trong kiến trúc Concurrency |

---

## 🚦 Async Runtime (Tokio) & Phân Định Tác Vụ
Khi sử dụng Tokio Runtime, việc chặn luồng chạy (block thread) bằng các tác vụ nặng sẽ làm treo hệ thống xử lý request. AI phải tuân thủ phân tách:
- **Tác vụ I/O Bound:** (Truy vấn DB, đọc ghi file async, gọi mạng HTTP). Dùng trực tiếp cú pháp `async/await` tiêu chuẩn.
- **Tác vụ CPU Bound:** (Mã hóa mật khẩu, xử lý ảnh, tính toán thuật toán nặng). Cấm chạy trực tiếp trong async context. Bắt buộc phải đẩy sang luồng hệ điều hành riêng qua `tokio::task::spawn_blocking`:
```rust
let hashed_password = tokio::task::spawn_blocking(move || {
    bcrypt::hash(password, bcrypt::DEFAULT_COST)
})
.await
.unwrap()?;
```

---

## 🔒 Thỏa Mãn Send + Sync & MutexGuard Qua Await
- Mọi đối tượng muốn đẩy qua một ranh giới luồng (`tokio::spawn`) bắt buộc phải thỏa mãn hai auto traits: `Send` (có thể chuyển quyền sở hữu sang luồng khác) và `Sync` (nhiều luồng có thể truy cập qua tham chiếu).
- **Cấm giữ MutexGuard qua điểm await:** Không được phép giữ các guard không an toàn luồng (như `std::sync::MutexGuard`) xuyên suốt qua một điểm `.await`. Nếu bắt buộc phải giữ khóa qua điểm await, phải sử dụng `tokio::sync::Mutex`.
