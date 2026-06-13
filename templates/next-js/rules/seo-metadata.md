# SEO Optimization & Semantic HTML

This document specifies conventions for using HTML5 Semantic tags, optimizing image delivery, and integrating Next.js Metadata APIs to achieve high SEO performance.

---

## 🔍 Next.js Metadata API
- **Static Metadata:** Declare a static `metadata` object in layouts or pages that do not require dynamic route parameters:
  ```typescript
  export const metadata = {
    title: 'Dashboard | Skillverse Platform',
    description: 'Course management overview dashboard',
  };
  ```
- **Dynamic Metadata:** For dynamic routes (e.g., article details, course views), define metadata through the exported `generateMetadata` function to optimize search engine indexing:
  
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

## 🎨 Semantic HTML5 Structure
- **Structural Tags:** Build layouts using semantic HTML5 tags instead of nesting generic `<div>` containers:
  - `<header>`: Main navigation bar or header sections.
  - `<nav>`: Primary navigation links.
  - `<main>`: Wraps the unique primary content of the page.
  - `<section>`: General thematic groupings of content.
  - `<article>`: Independent self-contained items (e.g., blog posts, product cards).
  - `<footer>`: Copyright and footer link sections.
- **Header Hierarchy:** Follow a strict heading hierarchy (from `<h1>` down to `<h6>`). Ensure there is only one `<h1>` tag per page.

---

## ⚡ Image & Link Optimizations
- **Image Optimization:** Never use raw `<img>` tags. Use Next.js `<Image />` from `next/image` with appropriate `sizes` attributes, and set `priority` for above-the-fold images.
- **Navigation Optimization:** Use `<Link />` from `next/link` to automatically trigger resource pre-fetching when links enter the viewport, enabling instant transition.
