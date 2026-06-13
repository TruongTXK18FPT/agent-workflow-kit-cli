# Quy Ước Đặt Tên & Coding Style cho Next.js (App Router)

Tài liệu này đặc tả quy ước đặt tên file, thư mục, cấu trúc import và tổ chức folder trong các dự án Next.js App Router.

---

## 🏷️ Quy Ước Đặt Tên (Naming Conventions)

| Đối Tượng | Quy Chuẩn Đặt Tên | Ví Dụ Minh Họa |
| :--- | :--- | :--- |
| **Thư mục Route (`app/`)** | lowercase hoặc kebab-case | `app/dashboard/`, `app/user-profile/` |
| **Route Nhóm (Route Groups)** | Bọc trong dấu ngoặc đơn `(group-name)` | `app/(auth)/login/`, `app/(dashboard)/layout.tsx` |
| **Route Động (Dynamic Routes)** | Bọc trong dấu ngoặc vuông `[paramName]` | `app/blog/[id]/page.tsx`, `app/shop/[...slug]/page.tsx` |
| **Tệp Giao Diện Đặc Trưng** | Định dạng chuẩn Next.js (lowercase.tsx) | `page.tsx`, `layout.tsx`, `loading.tsx`, `error.tsx` |
| **Route Handlers** | Định dạng file API endpoint của Next.js | `route.ts` |
| **Component UI Phụ Trợ** | PascalCase.tsx | `Button.tsx`, `ProductCard.tsx`, `SidebarSkeleton.tsx` |
| **Custom Hooks** | camelCase bắt đầu bằng tiền tố `use` | `useAuth.ts`, `useLocalStorage.ts` |

---

## 📦 Imports & Aliasing
- **Absolute Imports:** Luôn luôn sử dụng absolute imports với alias `@/` trỏ tới thư mục `src/` hoặc root (ví dụ: `import { Button } from "@/components/ui/Button"`). Nghiêm cấm sử dụng relative imports với nhiều tầng nhảy thư mục sâu (ví dụ: `../../../../Button`).
- **CSS / Styles Imports:** Đặt các styles toàn cục trong một file duy nhất (như `globals.css` hoặc `index.css`) được import trong file `layout.tsx` gốc. Không import file CSS tùy tiện trong các component con.

---

## 📁 Tổ Chức Thư Mục (Folder Organization)
- Giữ các thư mục bên trong `app/` dành riêng cho việc khai báo routing và giao diện trang tương ứng.
- Đặt các component nghiệp vụ, hook, service và type bên trong thư mục `src/features/` hoặc `src/components/` bên ngoài thư mục `app/`. Mỗi feature (ví dụ: `billing`) nên đóng gói các tài nguyên liên quan:
  - `src/features/billing/components/BillingForm.tsx`
  - `src/features/billing/hooks/useBilling.ts`
- Xuất bản public APIs của feature qua một file `index.ts` sạch sẽ.
