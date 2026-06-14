---
name: rust-db
description: Scaffold a database repository layer in Rust using SQLx, Diesel, or SeaORM
---

Follow this process to add database models, tables, and access methods in Rust.

Inputs:
- modelName: Name of the struct (e.g., `User`)
- tableName: Database table name (e.g., `users`)
- databaseLibrary: DB access style: SQLx, Diesel, or SeaORM

Steps:
1. Declare the database entity struct, applying appropriate serialization/deserialization attributes (e.g., `#[derive(Debug, Serialize, Deserialize, sqlx::FromRow)]`).
2. Define the repository trait or struct handling asynchronous database connection execution.
3. If using SQLx, write queries using async query macros to ensure compile-time SQL validation:
   ```rust
   let user = sqlx::query_as!<User, _>(
       "SELECT id, email, created_at FROM users WHERE id = $1", id
   )
   .fetch_one(&self.pool)
   .await?;
   ```
4. If using Diesel or SQLx migrations, add a migration script under the `/migrations` directory.
5. Setup connection pooling parameters and pass database pool references using constructor dependency injection.
6. Verify query compilation and formatting:
   - `cargo clippy --all-targets -- -D warnings`
