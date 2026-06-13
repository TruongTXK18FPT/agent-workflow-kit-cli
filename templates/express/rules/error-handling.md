# Bẫy Lỗi Bất Đồng Bộ & Xác Thực Dữ Liệu Tự Động (Zod Middleware)

Tài liệu này quy định chiến lược xử lý lỗi bất đồng bộ (Async Error Catching), cấu hình Middleware xử lý lỗi tập trung, và tự động kiểm tra dữ liệu bằng Zod.

---

## 🚨 Bẫy Lỗi Bất Đồng Bộ (Async Error Handling Architecture)
- **Không dùng try/catch thủ công tại Controller:** Việc viết try/catch ở mọi hàm trong tất cả các controller gây loãng mã nguồn.
- **Sử dụng Wrapper Tự động:** Toàn bộ các hàm controller bất đồng bộ phải được bọc bằng một hàm tiện ích tự động bắt lỗi (như `asyncHandler`) để tự động chuyển tiếp tất cả các ngoại lệ phát sinh sang cấu phần `next()`.

  ```typescript
  import { Request, Response, NextFunction } from 'express';

  // Hàm Wrapper bắt lỗi bất đồng bộ tự động
  export const asyncHandler = (fn: Function) => (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };

  // Cách triển khai thực tế tại Controller
  export const getUserProfile = asyncHandler(async (req: Request, res: Response) => {
    const userId = req.user.id;
    const profile = await userService.getProfile(userId); // Nếu ném lỗi bên trong service, asyncHandler sẽ tự catch
    return res.status(200).json({ success: true, data: profile });
  });
  ```

---

## 🔌 Middleware Xử Lý Lỗi Tập Trung (Global Error Handler)
- **Khai báo bộ lọc:** Bắt buộc phải khai báo một middleware xử lý lỗi có đủ 4 tham số ở cuối tệp cấu hình server (sau khi khai báo tất cả các routes) để định dạng lại toàn bộ phản hồi lỗi trước khi trả về cho Client.

  ```typescript
  // Trong file app.ts hoặc server.ts
  app.use((err: any, req: Request, res: Response, next: NextFunction) => {
    const statusCode = err.statusCode || 500;
    const message = err.message || 'Internal Server Error';

    res.status(statusCode).json({
      success: false,
      status: statusCode,
      message: message,
      stack: process.env.NODE_ENV === 'development' ? err.stack : undefined,
    });
  });
  ```

---

## 🛡️ Kiểm Thử Dữ Liệu Tự Động Với Zod Middleware
- **Cấm Validate thủ công bằng câu lệnh điều kiện:** Không viết các đoạn code `if (!req.body.email)`.
- **Xây dựng Middleware Validate Schema:** Phát triển một middleware dùng chung nhận vào một Schema của Zod để tự động kiểm duyệt toàn bộ dữ liệu đầu vào (`body`, `query`, `params`) trước khi cho phép dữ liệu đi sâu vào tầng Controller.

  ```typescript
  import { AnyZodObject, ZodError } from 'zod';
  import { Request, Response, NextFunction } from 'express';

  export const validateSchema = (schema: AnyZodObject) => {
    return async (req: Request, res: Response, next: NextFunction): Promise<any> => {
      try {
        // Xác thực đồng thời cả body, query, và params thông qua cấu trúc schema của Zod
        const parsed = await schema.parseAsync({
          body: req.body,
          query: req.query,
          params: req.params,
        });
        
        // Gán lại dữ liệu đã được parse sạch (và ép kiểu nếu có) vào hệ thống request
        req.body = parsed.body;
        req.query = parsed.query;
        req.params = parsed.params;
        
        return next();
      } catch (error) {
        if (error instanceof ZodError) {
          return res.status(400).json({
            success: false,
            message: 'Dữ liệu đầu vào không hợp lệ',
            errors: error.errors.map((err) => ({
              field: err.path.join('.'),
              message: err.message,
            })),
          });
        }
        return next(error);
      }
    };
  };
  ```
