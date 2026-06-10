# Danh sách Công việc Chi tiết & Tiến độ (Trường & Cát) - Bản Cập Nhật

- [ ] **🔴 Ngày 1: Setup Dự án & Dựng Khung Điều khiển CLI**
  - [x] **Trường**: Khởi tạo cấu trúc dự án CLI `agent-workflow-kit-cli/` và cấu hình `tsconfig.json`.
  - [x] **Trường**: Cài đặt các packages (`commander`, `chalk`, `execa`, `handlebars`).
  - [x] **Trường**: Lập trình bộ khung CLI định nghĩa các lệnh `init`, `sync`, `doctor` và cờ `--dry-run` trong `src/cli/index.ts`.
  - [ ] **Cát**: Thiết lập tệp tin render template `src/core/renderer.ts` dùng Handlebars và xử lý đường dẫn template tương đối.
  - [ ] **Cát**: Biên soạn tệp khung template hướng dẫn chung `templates/common/AGENTS.md.hbs`.

- [ ] **🟠 Ngày 2: Detector & Emitter Core vs. Stack Packs chính**
  - [ ] **Trường**: Lập trình bộ tự động nhận diện dự án (Detector).
  - [ ] **Trường**: Biên soạn nội dung template hướng dẫn cho Java Spring Boot (`AGENTS.md`, rules, skills).
  - [ ] **Cát**: Lập trình bộ ghi đè file an toàn (Managed Blocks Emitter).
  - [ ] **Cát**: Biên soạn nội dung template hướng dẫn cho React + TS (`AGENTS.md`, rules, skills).

- [ ] **🟡 Ngày 3: Hoàn thiện CLI Commands & Phát triển FastAPI Pack**
  - [ ] **Trường**: Hoàn thiện logic đồng bộ hóa `sync`.
  - [ ] **Trường**: Biên soạn template hướng dẫn cho FastAPI (kiến trúc, router-service-repo).
  - [ ] **Cát**: Hoàn thiện logic kiểm thử môi trường `doctor`.
  - [ ] **Cát**: Biên soạn template cấu hình FastAPI (Ruff, mypy, pytest).

- [ ] **🟢 Ngày 4: Tích hợp, Chạy thử & Viết bài Kiểm thử (Testing)**
  - [ ] **Trường & Cát**: Tích hợp các bộ Emitters, Detectors và Packs vào nhân CLI chính.
  - [ ] **Trường & Cát**: Tạo 3 dự án thử nghiệm (test-fixtures) và thực thi test thủ công.
  - [ ] **Cát**: Viết bộ test tự động (Unit test, snapshot test) bằng Vitest.

- [ ] **🔵 Ngày 5: Tài liệu, CI/CD & Release lên NPM**
  - [ ] **Trường**: Viết tài liệu hướng dẫn nhanh vào README của dự án.
  - [ ] **Trường**: Tối ưu hiển thị màu sắc và chỉ dẫn console.
  - [ ] **Trường**: Cấu hình trường `bin` và `files` trong `package.json` để đóng gói.
  - [ ] **Trường**: Viết cấu hình workflow GitHub Actions (`.github/workflows/release.yml`).
  - [ ] **Cát**: Thực hiện kiểm thử đóng gói cục bộ (`npm pack`) và kiểm tra file tarball.
  - [ ] **Cát**: Hỗ trợ Trường phát hành package lên npm registry và tạo tag release.
