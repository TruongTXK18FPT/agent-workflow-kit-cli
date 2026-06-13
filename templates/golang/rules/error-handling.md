# Golang Error Handling Standards

This document defines strict guidelines for error checking, error wrapping, and structuring standard API errors.

---

## 🔄 Error Wrapping
- **Rule:** When passing errors up the stack (e.g., from Repository to UseCase), never return the raw error or create a new error that discards the trace.
- **Solution:** Use `%w` in `fmt.Errorf` to wrap the underlying error with contextual information:
```go
if err != nil {
    return fmt.Errorf("failed to fetch user from db (id: %d): %w", id, err)
}
```
- **Checking Errors:** Use `errors.Is()` for comparing sentinel errors and `errors.As()` to extract custom error structures:
```go
if errors.Is(err, sql.ErrNoRows) {
    // Handle record not found
}
```

---

## 🏛️ Standard Custom Errors
To return uniform error responses to Frontend clients or API Gateways, define a standard struct:
```go
type AppError struct {
    Code    string            `json:"code"`
    Message string            `json:"message"`
    Details map[string]string `json:"details,omitempty"`
}

func (e *AppError) Error() string {
    return fmt.Sprintf("[%s] %s", e.Code, e.Message)
}
```

---

## 🚫 Avoid Panics
- **Strict Rule:** Never use `panic` and `recover` for normal business flow control or expected failures.
- **Exception:** Only use `panic` during application startup if a fatal dependency fails (e.g., cannot connect to the primary database, or port is already in use).
