# Phong Cách Lập Trình Idiomatic Rust & Tối Ưu Hóa

Tài liệu này quy định các quy ước phong cách lập trình Idiomatic Rust, phong cách Clippy và tối ưu hóa tài nguyên.

---

## 🦀 Quy Ước Idiomatic Rust
- **Pattern Matching:** Tận dụng tối đa Pattern Matching (`match`, `if let`, `let-else`) thay cho các câu lệnh `if/else` lồng nhau phức tạp để xử lý luồng chạy sạch và an toàn.
- **Quy tắc đặt tên:** 
  - `snake_case` cho hàm, phương thức, biến, module.
  - `PascalCase` cho Struct, Enum, Trait, Union.
  - `SCREAMING_SNAKE_CASE` cho biến hằng số (constants) và biến tĩnh (statics).

---

## 🧠 Quản Lý Cơ Chế Mượn (Borrowing Rules & Clone)
AI thường sử dụng `.clone()` vô tội vạ để vượt qua Borrow Checker của Rust, điều này làm mất đi lợi thế hiệu năng zero-cost abstraction của ngôn ngữ.
- **Hạn chế Clone:** Chỉ dùng `.clone()` hoặc `.to_string()` trên các kiểu dữ liệu Heap (như `String`, `Vec`) khi thực sự cần sở hữu một bản sao độc lập của dữ liệu.
- **Sử dụng Tham Chiếu:** Thiết kế các hàm nhận tham chiếu đọc `&T` hoặc tham chiếu ghi `&mut T`. Đối với các chuỗi ký tự, sử dụng tham chiếu chuỗi `&str` thay vì truyền `String` trực tiếp.
- **Độc quyền mượn ghi:** Đảm bảo tại một thời điểm chỉ có duy nhất một tham chiếu ghi `&mut T` và không tồn tại song song với bất kỳ tham chiếu đọc `&T` nào trong cùng một Scope.

---

## 🛠️ Quy Chuẩn Clippy
- Mã nguồn do AI sinh ra phải tuyệt đối tuân thủ nghiêm ngặt các chỉ dẫn tối ưu hóa từ trợ lý phân tích tĩnh Clippy.
- Chạy lệnh kiểm duyệt tự động định kỳ: `cargo clippy -- -D warnings` và đảm bảo dự án đạt trạng thái **Zero Warnings** trước khi commit.
