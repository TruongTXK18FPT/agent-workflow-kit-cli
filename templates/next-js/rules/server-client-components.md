# React Server Components (RSC) vs React Client Components (RCC)

Tài liệu này quy định ranh giới kiến trúc và quy tắc phân loại component trong ứng dụng Next.js sử dụng App Router.

---

## 🏛️ React Server Components (RSC)
- **Mặc định:** Tất cả các page, layout và component được tạo bên trong thư mục routing `app/` mặc định phải là React Server Components (RSC).
- **Lợi ích của RSC:**
  - Gọi dữ liệu (data fetching) trực tiếp sử dụng async/await.
  - Sử dụng an toàn các thư viện phía server (truy vấn DB, đọc file, import khóa bảo mật).
  - Giảm dung lượng bundle size gửi xuống client do mã nguồn RSC chỉ biên dịch và chạy trên server.
- **Quy tắc:**
  - Thực hiện toàn bộ việc nạp dữ liệu và cấu trúc khung trang bên trong các RSC.
  - Không thêm `"use client"` vào các layout hoặc page entry points trừ khi bắt buộc.

---

## 💻 React Client Components (RCC)
- **Định nghĩa:** Các component chạy trên trình duyệt để hỗ trợ tương tác và cập nhật trạng thái động từ người dùng.
- **Dấu hiệu nhận biết RCC:** Chỉ gắn directive `"use client"` ở lớp component lá (Leaf Components) khi component:
  - Sử dụng các Hook vòng đời và trạng thái của React (`useState`, `useReducer`, `useEffect`, `useLayoutEffect`).
  - Gọi các API đặc trưng của trình duyệt (`window`, `localStorage`, custom viewport hooks).
  - Đăng ký các callback lắng nghe sự kiện DOM (như `onClick`, `onChange`, `onSubmit`).
- **Phân tách ranh giới RCC:**
  - Giữ RCC ở cấp lá (Leaf Components) cuối cùng của cây dựng hình để tối ưu hiệu năng.
  - *Ví dụ:* Nếu trang danh sách sản phẩm (RSC) có thanh tìm kiếm (RCC), hãy tách thanh tìm kiếm thành một component riêng (`<SearchBar />` có `"use client"`) và import vào trang cha chạy ở phía server.
