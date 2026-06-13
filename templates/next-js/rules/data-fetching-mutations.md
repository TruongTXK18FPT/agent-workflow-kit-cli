# Gọi Dữ Liệu & Đột Biến Dữ Liệu (Data Fetching & Mutations)

Tài liệu này quy định tiêu chuẩn gọi API, quản lý bộ nhớ đệm (caching) và thay đổi dữ liệu sử dụng Next.js Server Actions.

---

## 🔌 Gọi Dữ Liệu Tại Gốc (Data Fetching at the Source)
- **Thực hiện trong RSC:** Gọi dữ liệu `fetch()` trực tiếp bên trong các async Server Components (`RSC`). Điều này giúp bảo mật API endpoint, token xác thực và giảm thiểu độ trễ mạng bằng cách gộp xử lý trên server.
- **Quy tắc:** Không sử dụng các client-side fetch wrapper tùy tiện trong các server pages. Hãy sử dụng cú pháp async/await tiêu chuẩn.

---

## 💾 Quản Lý Bộ Nhớ Đệm (Caching & Revalidation)
- **Cấm Fetch Thô:** Nghiêm cấm sử dụng fetch() thô mà không có cấu hình kiểm soát vòng đời dữ liệu hoặc chiến lược revalidate rõ ràng.
  
  * **Không hợp lệ (❌ Nghiêm cấm):**
    ```typescript
    // Fetch dữ liệu tĩnh vô thời hạn mà không có chiến lược revalidate rõ ràng
    const res = await fetch('https://api.skillverse.vn/v1/courses');
    ```
  * **Hợp lệ (✔️ Khuyến khích):**
    ```typescript
    // Cấu hình ISR (Incremental Static Regeneration) rõ ràng với cache tag
    const res = await fetch('https://api.skillverse.vn/v1/courses', { 
      next: { revalidate: 3600, tags: ['courses'] } 
    });
    ```
- **Làm mới bộ nhớ đệm:** Sử dụng `revalidatePath` hoặc `revalidateTag` bên trong các Server Actions để xóa các bản ghi cũ trong cache và bắt buộc Next.js cập nhật lại dữ liệu mới.

---

## ⚡ Đột Biến Dữ Liệu (Mutations via Server Actions)
- **Sử dụng Server Actions:** Toàn bộ các tương tác POST, PUT, DELETE, PATCH phải qua Server Actions được đánh dấu bằng directive `"use server"` ở đầu hàm hoặc đầu file chứa hành động.
- **Trải nghiệm người dùng mượt mà:**
  - Sử dụng hook `useActionState` (hoặc `useFormState` trong các phiên bản trước React 19) để quản lý trạng thái phản hồi của form từ server và kiểm soát trạng thái đang xử lý (`isPending`).
  - Bọc các tác vụ mutate trong `useTransition` nhằm duy trì giao diện người dùng mượt mà, không bị đóng băng trong quá trình xử lý ngầm.
