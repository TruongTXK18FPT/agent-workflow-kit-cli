---
name: rust-feature
description: Scaffold a Rust module, including structs, traits, implementations, and unit/integration tests
---

Follow this process to generate a new Rust feature or sub-module.

Inputs:
- moduleName: Name of the module/file (e.g., `billing`)
- traitName: Name of the trait interface if any (e.g., `BillingService`)
- functionality: Summary of the business requirements and structs

Steps:
1. Create a file under `src/` named `<moduleName>.rs` (e.g., `src/billing.rs`), or a subdirectory containing `mod.rs`.
2. Register the module in `lib.rs` or `main.rs` using `pub mod <moduleName>;`.
3. Declare traits, structs, and custom error types (using `thiserror` for domain-specific errors) in the new module.
4. Implement functionality for the structs, mapping options and results safely (no `unwrap` or `expect` allowed in production).
5. Write inline unit tests inside a nested `tests` module decorated with `#[cfg(test)]`:
   ```rust
   #[cfg(test)]
   mod tests {
       use super::*;

       #[test]
       fn test_feature_logic() {
           // Arrange, Act, Assert
       }
   }
   ```
6. Add integration tests inside `/tests` if this feature integrates multiple modules or dependencies.
7. Verify compilation and warnings:
   - `cargo check`
   - `cargo test`
   - `cargo clippy --all-targets -- -D warnings`
