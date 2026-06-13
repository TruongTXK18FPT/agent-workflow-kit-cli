# Phân Tách Lớp Trách Nhiệm (Router vs Controller vs Service)

Tài liệu này đặc tả ranh giới trách nhiệm giữa các lớp trong Express.js: Router nhận diện đường dẫn $\rightarrow$ Controller điều phối $\rightarrow$ Service xử lý core logic.

---

## 🏛️ Chuỗi Truyền Dẫn Dữ Liệu
Mã nguồn dự án phải tuân thủ nghiêm ngặt mô hình luồng dữ liệu 3 lớp:
$$\text{Client} \longrightarrow \text{Router} \longrightarrow \text{Middleware} \longrightarrow \text{Controller} \longrightarrow \text{Service} \longrightarrow \text{Model/Database}$$

---

## 🚦 Trách Nhiệm Chi Tiết Của Từng Lớp

### 1. Lớp Định Tuyến (Router Layer - `routes/`)
- **Vai trò:** Chỉ làm nhiệm vụ map HTTP Method + Path, liên kết các middleware xác thực (Auth) hoặc kiểm duyệt định dạng đầu vào (Zod validate schema).
- **Quy tắc:** Tuyệt đối không chứa bất kỳ logic xử lý nghiệp vụ hay điều phối dữ liệu nào. Chỉ định hướng luồng sang Controller tương ứng.

### 2. Lớp Điều Phối (Controller Layer - `controllers/`)
- **Vai trò:** Làm nhiệm vụ bóc tách dữ liệu đầu vào từ đối tượng `req` (req.body, req.query, req.params, req.user), chuyển tiếp các tham số đó sang tầng Service, nhận kết quả và trả về cho Client bằng lệnh `res.status().json()`.
- **Quy tắc:**
  - Không truy vấn cơ sở dữ liệu hoặc làm việc trực tiếp với ORM Models trong Controller.
  - Không bắt lỗi try/catch thủ công (sử dụng asyncHandler để ủy thác cho bộ bắt lỗi toàn cục).

### 3. Lớp Nghiệp Vụ (Service Layer - `services/`)
- **Vai trò:** Chứa 100% logic nghiệp vụ xử lý dữ liệu, thực hiện tính toán thuật toán, tương tác với Database thông qua ORM Models.
- **Quy tắc:** Tuyệt đối không được tiếp xúc hay phụ thuộc vào các đối tượng `req`, `res`, hay `next` của Express. Lớp Service phải độc lập hoàn toàn với framework để dễ dàng viết các bài kiểm thử Unit Test.
