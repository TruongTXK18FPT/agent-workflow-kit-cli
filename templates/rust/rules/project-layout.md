# Rust Crate Layout & Modular Architecture

This document defines module structures, visibility scopes, Cargo Workspace configurations, and dependency injection in Rust.

---

## 🏗️ Modules & Crate Separation
- **Separating Binary & Library:**
  - `src/main.rs`: Entrypoint of the binary application. Responsible only for parsing arguments, reading configuration, and starting the runtime.
  - `src/lib.rs`: Holds 100% of the core business logic, enabling testability and decoupling.
- **Visibility Scope Control:** Do not expose symbols using `pub` indiscriminately. Prefer `pub(crate)` to limit access to within the same crate, maintaining strict encapsulation.

---

## 📦 Cargo Workspaces (Multi-Crate Monorepos)
For large monorepo systems, split the project into a Cargo Workspace containing isolated crates to enable parallel compilation:
```toml
# Cargo.toml at the root directory
[workspace]
members = [
    "crates/api-gateway",
    "crates/user-domain",
    "crates/core-engine",
    "crates/shared-utils"
]
```

---

## 💉 Trait-Based Dependency Injection (DI)
Due to Rust's strict lifetimes and borrow checker, decouple dependencies by implementing **Traits** combined with thread-safe smart pointers: `Arc<dyn Trait + Send + Sync>`.
```rust
use std::sync::Arc;

pub trait UserRepository: Send + Sync {
    fn find_by_id(&self, id: i64) -> Result<User, AppError>;
}

pub struct UserService {
    // Thread-safe pointer to dynamic trait implementation
    repo: Arc<dyn UserRepository>,
}

impl UserService {
    pub fn new(repo: Arc<dyn UserRepository>) -> Self {
        Self { repo }
    }
}
```
