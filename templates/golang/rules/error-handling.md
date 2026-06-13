# Quy Chuẩn Xử Lý Lỗi Trong Golang

Tài liệu này quy định các quy tắc nghiêm ngặt về bắt lỗi, bọc lỗi (error wrapping) và thiết kế cấu trúc lỗi nghiệp vụ chuẩn hóa.

---

## 🔄 Bọc Lỗi Kèm Ngữ Cảnh (Error Wrapping)
- **Quy tắc:** Khi chuyển tiếp một lỗi từ tầng thấp hơn (như Database) lên tầng cao hơn (như UseCase), cấm trả về lỗi thô trực tiếp hoặc tạo lỗi mới làm mất dấu vết (Stacktrace).
- **Giải pháp:** Sử dụng động từ `%w` trong `fmt.Errorf` để bọc lỗi nguyên bản.
```go
if err != nil {
    return fmt.Errorf("failed to fetch user from db (id: %d): %w", id, err)
}
```
- **Kiểm tra lỗi:** Sử dụng `errors.Is()` để so sánh giá trị lỗi (Sentinel Error) và `errors.As()` để ép kiểu lỗi sang custom error struct.
```go
if errors.Is(err, sql.ErrNoRows) {
    // Xử lý trường hợp không tìm thấy dữ liệu
}
```

---

## 🏛️ Cấu Trúc Lỗi Nghiệp Vụ Chuẩn Hóa (Custom Errors)
Để trả về lỗi đồng nhất cho các hệ thống Frontend/Mobile hoặc API Gateway, AI phải sử dụng cấu trúc `AppError` sau:
```go
type AppError struct {
    Code    string            `json:"code"`
    Message string            `json:"message"`
    Details map[string]string `json:"details,omitempty"`
}

func (e *AppError) Error() string {
    return fmt.Sprintf("[%s] %s", e.Code, e.Message)
}
```

---

## 🚫 Cấm Sử Dụng Panic
- **Nghiêm cấm:** Tuyệt đối không sử dụng `panic` và `recover` cho các luồng xử lý lỗi thông thường.
- **Trường hợp ngoại lệ:** Chỉ dùng `panic` khi ứng dụng gặp lỗi cấu hình chí mạng lúc khởi động (ví dụ: không thể kết nối tới cơ sở dữ liệu chính hoặc port bị chiếm dụng).
