# Tối Ưu Hóa SEO & Cấu Trúc Semantic HTML

Tài liệu này quy định việc sử dụng cấu trúc thẻ Semantic, tối ưu hóa điều hướng hình ảnh và tích hợp Metadata API của Next.js để đạt thứ hạng SEO tốt nhất.

---

## 🔍 Tích Hợp Metadata API Của Next.js
- **Metadata Tĩnh:** Khai báo đối tượng `metadata` tĩnh trong các layouts hoặc pages không có biến số động:
  ```typescript
  export const metadata = {
    title: 'Dashboard | Skillverse Platform',
    description: 'Trang tổng quan quản lý khóa học',
  };
  ```
- **Metadata Động:** Đối với các route động (như trang chi tiết bài viết, khóa học), khai báo cấu hình SEO thông qua hàm `generateMetadata` đối với các route động để tối ưu hóa SEO tối đa cho hệ thống tìm kiếm:
  
  ```typescript
  import { Metadata } from 'next';

  type Props = { params: Promise<{ id: string }> };

  export async function generateMetadata({ params }: Props): Promise<Metadata> {
    const id = (await params).id;
    const course = await getCourseDetail(id);
    
    return {
      title: `${course.title} | Skillverse Platform`,
      description: course.shortDescription,
      openGraph: { images: [course.thumbnailUrl] }
    };
  }
  ```

---

## 🎨 Cấu Trúc Semantic HTML5
- **Thẻ cấu trúc:** Bắt buộc xây dựng bố cục trang bằng các thẻ HTML5 ngữ nghĩa thay vì lạm dụng các thẻ `<div>` vô nghĩa:
  - `<header>`: Thanh tiêu đề hoặc thanh đầu trang chính.
  - `<nav>`: Danh mục liên kết điều hướng cốt lõi.
  - `<main>`: Bao bọc duy nhất phần nội dung cốt lõi của trang.
  - `<section>`: Phân đoạn chủ đề nội dung tổng quát.
  - `<article>`: Các thành phần độc lập (bài viết blog, phần tử thẻ card sản phẩm).
  - `<footer>`: Chứa thông tin bản quyền và liên kết chân trang.
- **Tiêu đề h-tags:** Đảm bảo thứ tự logic của các thẻ tiêu đề (từ `<h1>` đến `<h6>`). Đảm bảo có duy nhất một thẻ `<h1>` trên mỗi trang.

---

## ⚡ Tối Ưu Hóa Hình Ảnh & Điều Hướng
- **Tối ưu hình ảnh:** Tuyệt đối không dùng thẻ `<img>` thô. Bắt buộc sử dụng `<Image />` từ `next/image` với đầy đủ thuộc tính `sizes` và cấu hình `priority` cho các hình ảnh xuất hiện ở nấc màn hình đầu tiên (Above the fold).
- **Tối ưu điều hướng:** Dùng `<Link />` từ `next/link` để kích hoạt cơ chế pre-fetching tài nguyên ngầm khi link xuất hiện trong viewport, giúp chuyển trang tức thì.
