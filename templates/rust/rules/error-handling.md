# Error Handling & Fault Control in Rust

This document defines strict rules for handling, wrapping, and propagating failures using idiomatic Rust patterns.

---

## 🚫 Avoid Panics in Production
- **Strict Rule:** Never use `panic!`, `.unwrap()`, or `.expect()` in production application code. Doing so triggers process termination, resulting in service interruption.
- **Exceptions:** Only use panics in:
  - Unit and Integration Tests.
  - Initial bootstrapping (e.g., parsing critical files at startup) when missing items make recovery impossible.
  - Invariants where the logic guarantees a failure is impossible.

---

## 🔄 Result Propagation with the `?` Operator
- All fallible business logic operations must return `Result<T, E>` or `Option<T>`.
- Use the `?` operator to propagate errors up the call stack, maintaining a clean syntax.

---

## 📚 Error Libraries: `thiserror` vs `anyhow`
Never mix these libraries arbitrarily. Comply with the following separation:
- **Use `thiserror` for Library Crates / Domain Modules:** Creates strongly-typed, detailed error definitions with custom display messages.
```rust
use thiserror::Error;

#[derive(Error, Debug)]
pub enum DatabaseError {
    #[error("User not found with ID {0}")]
    UserNotFound(i64),
    #[error("Database connection failure: {0}")]
    ConnectionFailed(String),
}
```
- **Use `anyhow` for Application Entrypoints (API Gateway / CLI main):** Ideal for general error grouping and stack propagation without complex type mapping.
