# Dependency Injection (DI) Configurations

This document details guidelines for configuring and consuming dependency injection in .NET Core applications.

---

## 💉 Constructor Injection
- **Mandatory Rule:** Always resolve class dependencies using constructor parameters. Assign them to private readonly fields prefixed with an underscore `_`.
- Never use the Service Locator pattern (do not call `app.Services.GetService<T>()` or inject `IServiceProvider` to dynamically resolve services at runtime).

  * **Invalid (❌ Prohibited):**
    ```csharp
    public class OrderService
    {
        private readonly IServiceProvider _serviceProvider;
        
        public OrderService(IServiceProvider serviceProvider)
        {
            _serviceProvider = serviceProvider;
        }

        public void Process()
        {
            var repo = _serviceProvider.GetService<IOrderRepository>();
            // ...
        }
    }
    ```
  * **Valid (✔️ Recommended):**
    ```csharp
    public class OrderService : IOrderService
    {
        private readonly IOrderRepository _orderRepository;

        public OrderService(IOrderRepository orderRepository)
        {
            _orderRepository = orderRepository;
        }

        public void Process()
        {
            var orders = _orderRepository.GetAll();
            // ...
        }
    }
    ```

---

## ⚙️ Service Lifetimes Registration
Register dependencies with the appropriate lifetime scopes inside `Program.cs`:
1. **Transient (`AddTransient<I, T>()`):** Instantiated every time they are requested. Use for lightweight, stateless services.
2. **Scoped (`AddScoped<I, T>()`):** Instantiated once per HTTP request context. Recommended for repositories, database contexts (`DbContext`), and business services.
3. **Singleton (`AddSingleton<I, T>()`):** Instantiated once and shared across the entire application lifetime. Use for in-memory caching, system configurations, and thread-safe helper services.
