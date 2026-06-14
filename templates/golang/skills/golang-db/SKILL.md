---
name: golang-db
description: Scaffold a Go database repository layer using SQLx, GORM, or raw SQL queries
---

Follow this process to add or extend database entities and repository queries.

Inputs:
- structName: Model entity struct name (e.g., `User`)
- tableName: Database table name (e.g., `users`)
- repositoryName: Interface name (e.g., `UserRepository`)

Steps:
1. Declare the entity model struct with json and db (or gorm) tags:
   ```go
   type User struct {
       ID        int64     `json:"id" db:"id" gorm:"primaryKey"`
       Email     string    `json:"email" db:"email"`
       CreatedAt time.Time `json:"created_at" db:"created_at"`
   }
   ```
2. Define the repository interface (e.g., `UserRepository`) containing standard SQL actions (`FindByID`, `Save`).
3. Implement the interface concrete struct wrapping the database handle (e.g., `*sql.DB`, `*sqlx.DB`, or `*gorm.DB`).
4. Wire the repository implementation to the service layer using constructor injection.
5. Create SQL schema files under the `/migrations` or `/db` directories if schema changes are required.
6. Verify code correctness using:
   - `go build ./...`
