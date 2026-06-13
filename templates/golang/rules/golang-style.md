# Quy ước Phong Cách Lập Trình Golang (Go Coding Style)

Tài liệu này quy định phong cách lập trình, quy cách đặt tên và thiết kế Interface chuẩn trong các dự án Golang.

---

## 🏷️ Quy Tắc Đặt Tên (Naming Conventions)
- **Tên Gói (Package Names):** Bắt buộc phải là một từ đơn, viết thường (lowercase), ngắn gọn (ví dụ: `user`, `config`, `db`, `auth`). Tuyệt đối không sử dụng `camelCase`, `snake_case` hoặc dấu gạch nối.
- **Biến và Hàm Nội Bộ (Private):** Sử dụng `camelCase` (ví dụ: `userID`, `fetchData`).
- **Biến, Hàm và Struct Công Khai (Public Export):** Sử dụng `PascalCase` để tự động export (ví dụ: `UserID`, `FetchData`).
- **Từ viết tắt:** Giữ nguyên kiểu chữ viết hoa đối với các từ viết tắt viết liền (ví dụ: `userID` thay vì `userId`, `httpServer` thay vì `httpServer`).

---

## 🔌 Thiết Kế Interface (Interface Design)
- **Quy tắc vàng:** *"Chấp nhận interface ở đầu vào, trả về struct cụ thể ở đầu ra" (Accept interfaces, return structs)*. Điều này tối ưu hóa việc phân tích escape và khả năng mở rộng.
- **Tính tối giản:** Thiết kế Interface nhỏ gọn, lý tưởng là chỉ chứa từ 1 đến 2 phương thức (ví dụ: `io.Reader`, `io.Writer`).
- **Đặt tên Interface:** Đặt tên kết thúc bằng hậu tố `er` nếu chỉ có một phương thức (ví dụ: `Reader`, `Writer`, `Validator`).

---

## 🚫 Hạn Chế Biến Toàn Cục (Global Variables)
- **Cấm biến trạng thái toàn cục:** Không khởi tạo các biến global chứa trạng thái có thể thay đổi (mutable state) như instance kết nối database, logs, hay cache.
- **Giải pháp:** Truyền các instance này qua hàm khởi tạo struct (Dependency Injection) thay vì gọi trực tiếp từ biến global.
