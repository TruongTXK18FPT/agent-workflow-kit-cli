# Đăng Ký & Sử Dụng Dependency Injection (DI)

Tài liệu này hướng dẫn cách cấu hình và tiêm phụ thuộc trong các ứng dụng .NET Core.

---

## 💉 Constructor Injection (Tiêm qua Hàm khởi tạo)
- **Quy tắc bắt buộc:** Luôn luôn giải quyết các phụ thuộc của Class thông qua Constructor. Gán chúng vào các trường private readonly có tiền tố gạch dưới `_`.
- Tuyệt đối không dùng Service Locator (không gọi `app.Services.GetService<T>()` hay tiêm `IServiceProvider` để lấy service động tại runtime).

  * **Không hợp lệ (❌ Nghiêm cấm):**
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
  * **Hợp lệ (✔️ Khuyến khích):**
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

## ⚙️ Đăng Ký Vòng Đời Dịch Vụ (Service Lifetimes)
Lựa chọn đúng vòng đời khi đăng ký dịch vụ trong `Program.cs`:
1. **Transient (`AddTransient<I, T>()`):** Tạo mới mỗi khi được yêu cầu. Dành cho các dịch vụ nhẹ, không lưu trạng thái (Stateless Services).
2. **Scoped (`AddScoped<I, T>()`):** Tạo mới một lần cho mỗi HTTP Request. Thích hợp cho Repository, Database Context (`DbContext`), và các dịch vụ nghiệp vụ.
3. **Singleton (`AddSingleton<I, T>()`):** Tạo một lần duy nhất cho toàn bộ vòng đời ứng dụng. Dành cho caching in-memory, cấu hình hệ thống, helper dùng chung.
