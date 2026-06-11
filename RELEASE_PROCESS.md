# Quy trình Phát hành (Release Process) - `agent-workflow-kit-cli`

Tài liệu này đặc tả quy trình phát hành phiên bản mới của gói dòng lệnh `agent-workflow-kit-cli` lên npm registry một cách an toàn, chi tiết và hạn chế tối đa rủi ro gặp lỗi trên production.

---

## 🛠️ Trạng thái NPM Registry hiện tại
* **Tên gói:** `agent-workflow-kit-cli`
* **NPM Registry mặc định:** `https://registry.npmjs.org/`
* **Yêu cầu bảo mật:** Cần lưu trữ mã Token NPM của dự án vào GitHub Secrets với tên biến là `NPM_TOKEN` để hỗ trợ CI/CD publish tự động.

---

## 📋 Checklist các bước phát hành chi tiết (Release Checklist)

Quy trình phát hành gồm 4 giai đoạn bắt buộc:

### Giai đoạn 1: Chuẩn bị & Xác minh cục bộ (Local Verification)
Trước khi tạo bất kỳ tag phiên bản mới nào trên Git, nhà phát triển phụ trách (hoặc Agent) bắt buộc phải thực hiện các bước sau tại local:

1. **Làm sạch môi trường phát triển:**
   ```bash
   # Xóa thư mục node_modules và tệp build cũ
   rm -rf node_modules dist
   
   # Cài đặt lại sạch các dependencies từ lockfile
   npm ci
   ```
2. **Kiểm tra biên dịch & Chạy bộ kiểm thử:**
   ```bash
   # Biên dịch TypeScript và chạy Vitest
   npm run build
   npm test
   ```
   *Yêu cầu: 100% test cases phải đạt trạng thái **PASSED**.*

3. **Kiểm thử đóng gói (Package Dry-Run):**
   ```bash
   # Đóng gói thử nghiệm cục bộ
   npm pack
   ```
   *Kiểm tra file `.tgz` sinh ra:*
   - Giải nén thủ công tệp tin để đảm bảo không chứa mã nguồn TypeScript gốc `.ts` hay thư mục `tests/`.
   - Đảm bảo có đầy đủ các tệp phân phối: `dist/`, `templates/`, `LICENSE`, `README.md`.
   - Xóa file `.tgz` sau khi xác minh xong.

---

### Giai đoạn 2: Nâng phiên bản & Tagging (Bump Version)
Khi local đã đảm bảo hoạt động hoàn hảo, thực hiện nâng phiên bản theo chuẩn [Semantic Versioning (SemVer)](https://semver.org/):

1. **Chạy lệnh nâng version của NPM:**
   ```bash
   # Sử dụng một trong ba tùy chọn: patch, minor, hoặc major
   # Ví dụ nâng phiên bản sửa lỗi (patch):
   npm version patch
   ```
   *Lệnh này sẽ tự động:*
   - Cập nhật số phiên bản trong `package.json` và `package-lock.json`.
   - Tạo một commit Git tự động chứa sự thay đổi này.
   - Tạo một tag Git tương ứng (ví dụ: `v1.0.1`).

2. **Push mã nguồn và tag lên GitHub:**
   ```bash
   git push origin main --tags
   ```

---

### Giai đoạn 3: Tự động hóa CI/CD trên GitHub Actions
Khi tag `v*` được đẩy lên GitHub, workflow [release.yml](file:///.github/workflows/release.yml) sẽ tự động được kích hoạt:

1. **Chạy Job Kiểm thử (Test Job):**
   - Chạy toàn bộ suite kiểm thử Vitest trên một ma trận gồm nhiều phiên bản Node.js (`18.x`, `20.x`, `22.x`) trên môi trường Linux sạch.
2. **Chạy Job Phát hành (Publish Job):**
   - Nếu Job Kiểm thử thành công hoàn toàn, hệ thống sẽ tự động đăng nhập vào npm registry thông qua `NODE_AUTH_TOKEN` (lấy từ GitHub Secrets `NPM_TOKEN`).
   - Chạy biên dịch production (`npm run build`).
   - Thực thi `npm publish` để đẩy gói lên npm registry.

---

### Giai đoạn 4: Xác minh sau phát hành (Post-Release Verification)
Để đảm bảo người dùng cuối nhận được bản cài đặt chính xác:

1. **Tạo một thư mục kiểm thử trống hoàn toàn** ngoài workspace của bạn.
2. **Khởi chạy trực tiếp thông qua `npx`:**
   ```bash
   npx agent-workflow-kit-cli@latest init --dry-run
   ```
3. **Kiểm tra kết quả:**
   - Xác minh xem CLI có tải xuống, chạy thành công, và in ra các thông điệp UX/đường dẫn một cách chính xác hay không.
