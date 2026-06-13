# Quy Chuẩn Đồng Thời & Quản Lý Bộ Nhớ Trong Go

Tài liệu này quy định các quy tắc quản lý Goroutine, lan truyền Context, phòng ngừa Race Conditions và tối ưu hóa cấp phát bộ nhớ.

---

## 🧠 Tối Ưu Hóa Phân Tích Thoát (Escape Analysis & Memory)
Go compiler tự động phân tích xem một biến nên nằm ở Stack (rất nhanh, tự giải phóng) hay Heap (phải nhờ Garbage Collector dọn dẹp).
- **Quy tắc con trỏ (*):** Chỉ trả về con trỏ khi struct có kích thước lớn (tránh copy tốn chi phí) hoặc cần sửa trực tiếp dữ liệu gốc của đối tượng.
- **Tránh Heap Allocation:** Với các struct nhỏ (dưới 64-128 bytes) hoặc cấu hình ngắn hạn, trả về dạng giá trị (Value Type) để giữ biến nằm trên Stack.
```go
// ❌ Khiến biến bị đẩy lên Heap (Bad)
func NewConfig() *Config {
    return &Config{Timeout: 30}
}

// ✔️ Giữ biến trên Stack (Good)
func NewConfig() Config {
    return Config{Timeout: 30}
}
```

- **Sử dụng sync.Pool:** Đối với các tác vụ lặp lại liên tục ở tần suất cao như Json Encode/Decode hoặc cấp phát mảng byte đệm (`[]byte`), bắt buộc sử dụng `sync.Pool` để tái sử dụng bộ nhớ, giảm tải cho Garbage Collector (GC).
```go
var bufferPool = sync.Pool{
    New: func() any {
        return make([]byte, 1024)
    },
}
```

---

## 🚦 Ngăn Ngừa Rò Rỉ Goroutine (Goroutine Leaks)
- **Quy tắc:** Khi gửi dữ liệu vào channel trong Goroutine, channel đó phải có kích thước buffer phù hợp hoặc được giám sát bởi cơ chế Timeout/Context.
```go
// ❌ Gây rò rỉ nếu không có ai đọc từ ch (Bad)
func FetchData() string {
    ch := make(chan string) // Unbuffered channel
    go func() {
        ch <- doHeavyWork() // Block vĩnh viễn ở đây nếu hàm cha thoát sớm
    }()
    return <-ch
}

// ✔️ An toàn với Buffer hoặc Context Select (Good)
func FetchData(ctx context.Context) (string, error) {
    ch := make(chan string, 1) // Buffered channel chống block
    go func() {
        ch <- doHeavyWork()
    }()
    
    select {
    case res := <-ch:
        return res, nil
    case <-ctx.Done():
        return "", ctx.Err() // Thoát an toàn khi timeout
    }
}
```

---

## 🧭 Lan Truyền Context (Context Propagation)
- Bắt buộc truyền `ctx context.Context` làm tham số đầu tiên của các hàm liên quan đến I/O (SQL, API ngoài, Redis).
- Tuyệt đối không lưu trữ Context bên trong một Struct; Context phải được truyền tường minh qua đối số hàm (Explicit Argument).

---

## ⚡ Phòng Chống Race Conditions
Mọi đoạn mã sử dụng nhiều Goroutine truy cập vào cùng một vùng nhớ phải được bảo vệ bằng `sync.Mutex`, `sync.RWMutex`, hoặc package `sync/atomic`.
- Bắt buộc chạy kiểm tra tranh chấp bộ nhớ khi chạy thử: `go test -race ./...`.
