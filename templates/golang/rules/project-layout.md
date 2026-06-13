# Golang Project Architecture & Layout

This document defines the Standard Go Project Layout and Clean Architecture conventions.

---

## 🏗️ Standard Directory Structure
Adhere to the following layout guidelines:
- **/cmd:** Contains only the entrypoints of the application (e.g., `cmd/api/main.go`). Code here must only parse configs, initialize the DI container, and start the server. Do not write business logic here.
- **/internal:** Contains all core application code. The Go compiler enforces that external packages cannot import code from this directory. Write 100% of business logic here.
- **/pkg:** Contains standalone utility libraries that can be shared with other projects (e.g., `pkg/logger`, `pkg/crypto`). Code in `/pkg` must never import packages from `/internal`.
- **/api:** Contains API contract definitions (OpenAPI/Swagger schemas, gRPC proto files).

---

## 🏛️ Clean Architecture Layers
Organize code inside `/internal/app` or `/internal/<domain>` into 3 distinct layers:
1. **Entities (Domain Models):** Pure Go structs and core business rules. They must be free of external dependencies.
2. **Use Cases (Services):** Coordinates business logic. Interacts only with interfaces representing external components.
3. **Adapters (Controllers / Repositories):** Manages external communications (e.g., database operations using GORM, API routes using Fiber/Echo, gRPC handlers).

---

## 💉 Manual Dependency Injection (DI)
- **Constructor Injection:** Pass dependencies to structs (UseCases or Repositories) via `New[StructName]` constructors. Dependencies must be passed as interfaces.
- **Example:**
```go
type UserRepository interface {
    GetByID(ctx context.Context, id int64) (*domain.User, error)
}

type UserUseCase struct {
    repo UserRepository // Access via interface
}

func NewUserUseCase(r UserRepository) *UserUseCase {
    return &UserUseCase{repo: r}
}
```
