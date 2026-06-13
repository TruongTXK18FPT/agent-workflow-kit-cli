# SEO & Semantic HTML Rules

This ruleset governs semantic structuring, image/navigation optimizing, and Next.js Metadata API integration to achieve excellent SEO ranking.

---

## 🔍 Next.js Metadata API Integration
- **Static Metadata**: Export a static `metadata` object in layouts or pages that do not have dynamic variables:
  ```typescript
  export const metadata = {
    title: 'Dashboard | Platform Name',
    description: 'Overview description text',
  };
  ```
- **Dynamic Metadata**: For dynamic routes (like dynamic pages or blog items), export a `generateMetadata` function to resolve search indexing attributes dynamically:
  
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

## 🎨 Semantic HTML5 Structures
- **Structural Tags**: Restructure pages using correct HTML5 semantic elements rather than generic `<div>` tags:
  - `<header>`: Section or main page heading bar.
  - `<nav>`: Core navigation panels.
  - `<main>`: Singular page body content wrapper.
  - `<section>`: Generic thematic block.
  - `<article>`: Self-contained page elements (blog posts, card elements).
  - `<footer>`: Layout copyrights and footer references.
- **Header Outlines**: Maintain logical header tag sequences (`<h1>` down to `<h6>`). Ensure there is only one `<h1>` per page.

---

## ⚡ Image & Navigation Optimization
- **Image components**: Never use raw `<img>` tags. Use `<Image />` from `next/image` with dimensions or `fill`, declaring `sizes` and adding `priority` for above-the-fold assets.
- **Link prefetching**: Always use `<Link />` from `next/link` for internal navigations. This pre-fetches targets in the background, making route transitions instant.
