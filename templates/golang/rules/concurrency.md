# Golang Concurrency & Memory Allocation

This document outlines standard guidelines for goroutines, context propagation, race conditions, and heap allocation optimizations.

---

## 🧠 Escape Analysis & Allocations
The Go compiler determines if a variable should live on the Stack (fast, auto-allocated/deallocated) or Heap (garbage-collected).
- **Pointer Rule (*):** Return pointers only for large structs where value copying is expensive, or when you must modify the receiver's state directly.
- **Value Types for Small Structs:** For small configuration values or short-lived structs (under 64-128 bytes), return value types to keep allocations on the Stack.
```go
// ❌ Forces heap allocation (Bad)
func NewConfig() *Config {
    return &Config{Timeout: 30}
}

// ✔️ Keeps allocation on the Stack (Good)
func NewConfig() Config {
    return Config{Timeout: 30}
}
```
- **sync.Pool Usage:** For high-frequency, repetitive operations like JSON encoding/decoding or byte buffer allocation (`[]byte`), use `sync.Pool` to reuse memory, minimizing GC pressure.
```go
var bufferPool = sync.Pool{
    New: func() any {
        return make([]byte, 1024)
    },
}
```

---

## 🚦 Prevent Goroutine Leaks
- **Rule:** When writing data to a channel inside an independent goroutine, ensure the channel has a buffer or is monitored with timeouts/contexts to prevent permanent blocking.
```go
// ❌ Leaks goroutine if no reader reads from ch (Bad)
func FetchData() string {
    ch := make(chan string) // Unbuffered channel
    go func() {
        ch <- doHeavyWork() // Blocks indefinitely if parent exits early
    }()
    return <-ch
}

// ✔️ Safe with Buffer and Context (Good)
func FetchData(ctx context.Context) (string, error) {
    ch := make(chan string, 1) // Buffered channel avoids blocking
    go func() {
        ch <- doHeavyWork()
    }()
    
    select {
    case res := <-ch:
        return res, nil
    case <-ctx.Done():
        return "", ctx.Err() // Exits safely on timeout/cancel
    }
}
```

---

## 🧭 Context Propagation
- Pass `ctx context.Context` as the first argument to any functions handling network or filesystem operations.
- Never store Context inside a struct; pass it explicitly down the call chain.

---

## ⚡ Prevent Race Conditions
Protect shared variables accessed concurrently across multiple goroutines using `sync.Mutex`, `sync.RWMutex`, or `sync/atomic`.
- Run race detection during testing: `go test -race ./...`.
