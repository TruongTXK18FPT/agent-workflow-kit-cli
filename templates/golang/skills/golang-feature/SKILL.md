---
name: golang-feature
description: Scaffold a Go package slice including Handler, Service interfaces, and table-driven unit tests
---

Follow this process to generate a new Go business feature slice.

Inputs:
- packageName: Name of the package (e.g., `billing`)
- structName: Primary model struct name (e.g., `Invoice`)
- functionality: Summary of the business requirements and API paths

Steps:
1. Create a directory inside `internal/` named `<packageName>/` (e.g., `internal/billing`).
2. Declare structs and interfaces in `<packageName>.go` or `types.go` (e.g., `BillingService` interface and `Invoice` struct).
3. Implement the concrete service class (e.g., `service.go` containing `type service struct { ... }` implementing `BillingService`).
4. Implement HTTP handlers in `handler.go` wrapping inputs/outputs via JSON bindings.
5. Register routers/handlers in the application bootloader (e.g., in `cmd/server/main.go`).
6. Write unit tests in `service_test.go` using table-driven tests:
   ```go
   func TestBillingService(t *testing.T) {
       tests := []struct {
           name    string
           input   string
           wantErr bool
       }{
           {
               name:    "Valid input case",
               input:   "valid",
               wantErr: false,
           },
       }
       for _, tt := range tests {
           t.Run(tt.name, func(t *testing.T) {
               // Implement test validation
           })
       }
   }
   ```
7. Run validation commands:
   - `go build ./...`
   - `go test ./...`
