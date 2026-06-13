# Quy Ước Viết Mã C# (C# Coding Style & Conventions)

Tài liệu này đặc tả quy chuẩn coding style, đặt tên biến, tên lớp và cách tổ chức file mã nguồn trong dự án .NET.

---

## 🏷️ Quy Ước Đặt Tên (Naming Conventions)

### Quy tắc đặt tên Lớp và Thành phần
- **PascalCase:** Áp dụng cho Class, Struct, Record, Enum, Interface, Method, và Public Properties.
  - *Ví dụ:* `UserService`, `GetActiveUsers()`, `CreatedDate`.
- **Interface Prefix:** Tên Interface bắt buộc phải bắt đầu bằng chữ cái `I`.
  - *Ví dụ:* `IUserService`, `IUserRepository`.
- **camelCase:** Áp dụng cho tham số đầu vào của hàm (method arguments) và các biến cục bộ (local variables).
  - *Ví dụ:* `userId`, `requestPayload`.
- **Private Fields Prefix:** Các trường dữ liệu private trong Class phải viết bằng camelCase và bắt đầu bằng dấu gạch dưới `_`.
  - *Ví dụ:* `private readonly IUserRepository _userRepository;`.

---

## 📦 Tổ Chức Mã Nguồn & Định Dạng
- **Namespaces:** Đặt namespace phản ánh cấu trúc thư mục của dự án để đảm bảo tính dễ tìm kiếm.
  - *Ví dụ:* `ProjectName.Application.Services`.
- **File Scoped Namespaces:** Sử dụng cú pháp namespace phạm vi file (File-scoped namespace) của C# 10+ để giảm cấp thụt lề thụt dòng không cần thiết:
  ```csharp
  namespace ProjectName.Application.Services;

  public class UserService : IUserService
  {
      // ...
  }
  ```
- **Sắp xếp Usings:** Đặt các chỉ thị `using` hệ thống (`System.*`) lên trước, tiếp theo là các thư viện bên thứ ba, và cuối cùng là các dự án nội bộ.
