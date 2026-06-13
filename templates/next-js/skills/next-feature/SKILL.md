---
name: next-feature
description: Sinh hoặc mở rộng một page hoặc route handler Next.js + TypeScript mới kèm caching và metadata
---

Tuân thủ quy trình này để tạo một page, layout hoặc API route handler mới trong Next.js.

Đầu vào (Inputs):
- featureName: Tên của route hoặc trang (ví dụ: `dashboard`)
- targetPath: Thư mục chứa route bên trong `app/` để triển khai
- userFlow: Mô tả tóm tắt hành vi và bố cục giao diện của trang

Các bước thực hiện (Steps):
1. Quét các thư mục lân cận trong `app/` để tham chiếu các layout chung và ranh giới xử lý lỗi (`error.tsx`).
2. Thiết lập cấu trúc thư mục route theo chuẩn Next.js (ví dụ: `app/(dashboard)/billing`).
3. Khai báo interface cho route params và query parameters.
4. Triển khai cấu trúc trang hoặc layout dưới dạng **React Server Component (RSC)**.
5. Nếu có tương tác người dùng hoặc form, hãy tách thành các component con cấp lá (RCC) được đánh dấu `"use client"` rồi import vào RSC.
6. Thiết lập cơ chế cache rõ ràng cho toàn bộ các thao tác gọi dữ liệu `fetch()`.
7. Cấu hình metadata tĩnh hoặc động thông qua hàm `generateMetadata`.
8. Định nghĩa file xử lý lỗi cục bộ (`error.tsx`) tại thư mục route gần nhất để bắt lỗi runtime.
9. Thực hiện kiểm tra lỗi cục bộ:
   - `{{runCommand}} lint`
   - `{{runCommand}} typecheck`
   - `{{runCommand}} test`
   - `{{runCommand}} build`
