# Memory Management & Concurrency in Rust

This document details conventions for lifetimes, smart pointer usage, and async Tokio runtime operations.

---

## ⏳ Lifetime Annotations ('a)
- When a struct or function references a borrowing context, annotate lifetimes explicitly to guarantee spatial memory safety:
```rust
pub struct TokenValidator<'a> {
    pub secret_key: &'a str,
}
```
- Avoid bypassing the borrow checker with unnecessary `.clone()` calls or `'static` lifetime modifiers if the scope can be expressed with valid lifetime relationships.

---

## 🧠 Smart Pointer Matrix
Select the correct smart pointer types according to the allocation scope:

| Smart Pointer | Environment | Memory Allocation Characteristics | Application Use Case |
| :--- | :--- | :--- | :--- |
| **`Box<T>`** | Single / Multi-thread | Allocates large types on the Heap | Flattens recursive data structures (Sized types) |
| **`Rc<T>`** | Single-thread Only | Reference count without thread safety | Shares immutable data across a single-threaded runtime |
| **`Arc<T>`** | Multi-thread | Thread-safe Reference Count (Atomic) | Shares immutable resources across thread pools (e.g., Web Server) |
| **`RefCell<T>`** | Single-thread Only | Interior Mutability (Checked at Runtime) | Mutates fields inside an immutable single-threaded struct |
| **`Mutex<T>`** | Multi-thread | Thread safety via OS or runtime lock | Protects mutable resources shared across multiple threads |

---

## 🚦 Async Runtime (Tokio) CPU vs I/O Bound Tasks
Blocking the executor threads in an async environment will starve the thread pool, degrading throughput.
- **I/O Bound Tasks:** (DB Queries, Async file read/write, HTTP calls). Use standard `async/await` syntax.
- **CPU Bound Tasks:** (Password hashing, image processing, complex computations). Never run these directly in the async thread pool. Use `tokio::task::spawn_blocking`:
```rust
let hashed_password = tokio::task::spawn_blocking(move || {
    bcrypt::hash(password, bcrypt::DEFAULT_COST)
})
.await
.unwrap()?;
```

---

## 🔒 Send + Sync Traits & MutexGuard Safety
- Shared items sent across task boundaries (`tokio::spawn`) must implement `Send` and `Sync`.
- **MutexGuard across Await:** Never hold a non-thread-safe guard (like `std::sync::MutexGuard`) across `.await` points. Doing so will lead to compilation errors or runtime deadlocks. If a lock must span an await point, use `tokio::sync::Mutex`.
