# Kế hoạch Triển khai & Chia Scope Chi tiết 1 Tuần (Trường & Cát) - Bản Cập Nhật

Dự án `agent-workflow-kit` sẽ được hoàn thành trong vòng 5 ngày làm việc theo mô hình **"Lite-Scaffolding"** (chỉ tập trung sinh file hướng dẫn `AGENTS.md`, `skills/`, `rules/` chất lượng cao cho AI agent thay vì sinh mã nguồn boilerplate phức tạp) để đảm bảo tiến độ release nhanh chóng và an toàn.

---

## 👥 Phân chia Trách nhiệm & Cốt lõi (Roles & Core Strengths)

* **Trường (Leader - Core: Spring Boot, CLI Core & CI/CD Đóng gói):**
  - Quản lý tiến độ dự án (Leader).
  - Lập trình khung CLI Core, CLI Commands (`init`, `sync`, `doctor`), Stack Detectors và Emitters (ghi đè thông minh bằng Managed Blocks).
  - Xây dựng trọn gói **Java Spring Boot Pack** (đúng thế mạnh chuyên môn).
  - Đồng phát triển **FastAPI Pack** (phần cấu hình DI, router-service-repo architecture).
  - **Phụ trách CI/CD & Đóng gói:** Cấu hình `package.json` để đóng gói CLI và viết tệp workflow tự động hóa GitHub Actions (`release.yml`).
* **Cát (Teammate - Core: React + TS & Testing):**
  - Xây dựng trọn gói **React + TypeScript Pack** (đúng thế mạnh chuyên môn).
  - Đồng phát triển **FastAPI Pack** (phần Pydantic schema, testing client, linter Ruff/mypy).
  - Lập trình bộ kiểm thử tự động (Vitest) bảo đảm độ tin cậy của CLI.
  - Phụ trách kiểm thử đóng gói cục bộ (`npm pack`) và cùng Trường phát hành package lên npm registry.

---

## 📅 Lộ trình Ngày-qua-Ngày Chi tiết (Day-by-Day Roadmap)

### 🔴 Ngày 1: Setup Dự án & CLI Boilerplate
* **Trường:**
  - Khởi tạo thư mục phát triển CLI độc lập song song với Landing Page hiện tại.
  - Cấu hình dự án CLI TypeScript (`tsconfig.json`, `package.json` với dependencies `commander`, `chalk`, `execa`, `handlebars`).
  - Lập trình bộ khung xử lý lệnh CLI: định nghĩa lệnh `init`, `sync`, `doctor` và cờ `--dry-run` trong `src/cli/index.ts`.
* **Cát:**
  - Biên soạn bộ khung Template (Handlebars/Mustache) cho tệp tin hướng dẫn chung `AGENTS.md`.
  - Thiết kế cấu trúc lưu trữ và nạp các tệp templates tĩnh trong thư mục `templates/` của CLI package.

### 🟠 Ngày 2: Detector & Emitter Core vs. Stack Packs chính
* **Trường:**
  - **Detector Core:** Lập trình cơ chế quét tệp tin manifest (`package.json`, `pom.xml`, `pyproject.toml`) ở thư mục hiện tại để phát hiện stack.
  - **Spring Boot Pack:** Soạn thảo nội dung template hướng dẫn cho Java/Spring:
    - `templates/spring-boot/AGENTS.md.hbs` (Quy định feature-first, DTO validation, transaction rules).
    - `templates/spring-boot/rules/java-style.md` (Ràng buộc style cho Antigravity).
    - `templates/spring-boot/skills/spring-feature/SKILL.md` (Slash command tạo mới API slice).
* **Cát:**
  - **Emitter Core:** Lập trình logic ghi file an toàn sử dụng thuật toán "Managed Blocks" (được phân tách bằng comment đặc biệt như `<!-- START AWK -->` và `<!-- END AWK -->`) để lệnh `sync` không ghi đè phần dữ liệu tùy biến của người dùng.
  - **React + TS Pack:** Soạn thảo nội dung template hướng dẫn cho React/TS:
    - Quy chuẩn đặt custom hooks, route modules mỏng, strict compiler.
    - `SKILL.md` tạo route/hooks và kiểm thử Vitest + React Testing Library.

### 🟡 Ngày 3: Hoàn thiện CLI Commands & Phát triển FastAPI Pack (Làm chung)
* **Trường:**
  - Hoàn thiện logic lệnh `sync` (quét lại dự án và tự động cập nhật các Managed Blocks).
  - Đồng phát triển **FastAPI Pack**: Soạn thảo các template hướng dẫn về mô hình kiến trúc router-service-repository và setup APIRouter.
* **Cát:**
  - Hoàn thiện logic lệnh `doctor` (chạy các lệnh test/verify nội bộ của dự án để phát hiện lỗi môi trường trước khi chạy agent).
  - Đồng phát triển **FastAPI Pack**: Soạn thảo template cấu hình cho Ruff (lint & format), mypy (type checks), và pytest integration.

### 🟢 Ngày 4: Tích hợp, Chạy thử & Viết bài Kiểm thử (Testing)
* **Trường & Cát (Làm chung):**
  - Tích hợp tất cả các Emitters, Detectors và Stack Packs vào nhân CLI chính.
  - Tạo 3 dự án thử nghiệm (test-fixtures) gồm 1 dự án Spring Boot, 1 dự án React+TS và 1 dự án FastAPI.
  - Tiến hành chạy thử nghiệm thủ công (`node dist/index.js init`, `sync`, `doctor`) trên cả 3 dự án này để kiểm tra lỗi thực tế.
* **Cát:**
  - Viết bộ kiểm thử tự động bằng **Vitest** để kiểm tra:
    - Trình phát hiện stack quét đúng tập tin.
    - Emitters sinh đúng nội dung file theo biến truyền vào và không phá hủy code người dùng.

### 🔵 Ngày 5: Tài liệu, CI/CD & Release lên NPM
* **Trường:**
  - Viết tài liệu hướng dẫn sử dụng nhanh (Quick Start & CLI Options) tích hợp vào [README.md](file:///d:/WorkSpace/AgentWorkflowKitProject/agent-workflow-kit/README.md) của dự án.
  - Tối ưu hóa giao diện hiển thị console (màu sắc, thông tin hướng dẫn bước tiếp theo).
  - **Cấu hình CI/CD:** Viết cấu hình GitHub Actions workflow (`.github/workflows/release.yml`) chạy test tự động và hỗ trợ publish tự động khi có tag.
  - Cấu hình đóng gói package (cấu hình trường `bin` trong `package.json` trỏ tới `./dist/index.js` và định nghĩa trường `"files"`).
* **Cát:**
  - Thực hiện chạy kiểm thử đóng gói cục bộ (`npm pack`) để đảm bảo tệp tin tarball sinh ra chứa đầy đủ các preset templates.
  - Cùng Trường thực hiện deploy thử nghiệm, tạo release tag trên Git và publish chính thức lên npm registry.

---

## 🧪 Kế hoạch Xác minh (Verification Plan)

### Kiểm thử Tự động (Cát phụ trách)
- Viết và chạy Vitest suite bảo đảm code không bị regression:
  ```bash
  npm run test
  ```

### Kiểm thử Thủ công (Trường & Cát phối hợp)
1. Trường sử dụng CLI vừa build chạy thử:
   ```bash
   node dist/index.js init --stack spring-boot
   ```
2. Cát sử dụng CLI vừa build chạy thử:
   ```bash
   node dist/index.js init --stack react-ts
   ```
3. Cùng chạy thử với FastAPI và kiểm tra tính năng `sync` xem Managed Blocks có hoạt động ổn định không.
