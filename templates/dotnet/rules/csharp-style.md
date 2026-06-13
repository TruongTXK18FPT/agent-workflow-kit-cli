# C# Coding Style & Conventions

This document specifies standard coding styles, naming patterns, and source file organization conventions in .NET projects.

---

## 🏷️ Naming Conventions

### Class & Component Naming Rules
- **PascalCase:** Use for Classes, Structs, Records, Enums, Interfaces, Methods, and Public Properties.
  - *Examples:* `UserService`, `GetActiveUsers()`, `CreatedDate`.
- **Interface Prefix:** Interface names must start with the uppercase letter `I`.
  - *Examples:* `IUserService`, `IUserRepository`.
- **camelCase:** Use for method arguments and local variables.
  - *Examples:* `userId`, `requestPayload`.
- **Private Fields Prefix:** Private fields inside classes must use `camelCase` and start with an underscore `_`.
  - *Example:* `private readonly IUserRepository _userRepository;`.

---

## 📦 File Structure & Formatting
- **Namespaces:** Match namespaces with the physical directory structure to ensure easy discovery.
  - *Example:* `ProjectName.Application.Services`.
- **File-Scoped Namespaces:** Use C# 10+ file-scoped namespaces to reduce unnecessary indentation levels:
  ```csharp
  namespace ProjectName.Application.Services;

  public class UserService : IUserService
  {
      // ...
  }
  ```
- **Sorting Usings:** Organize `using` directives by placing system namespaces (`System.*`) first, followed by third-party packages, and internal project dependencies last.
