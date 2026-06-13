# Error Handling & Validation Rules

This ruleset governs asynchronous error trapping, global exception response formatting, and input validation middlewares for Express.js.

---

## 🚨 Asynchronous Error Handling (asyncHandler)
- **No Manual Controller try/catch**: Avoid writing repetitive `try/catch` blocks inside every controller route handler.
- **Async Wrapper**: Wrap all asynchronous controller handler functions in a centralized wrapper utility to capture promise rejections and forward them automatically to `next(error)`:

  ```typescript
  import { Request, Response, NextFunction } from 'express';

  // Automatically captures async rejections and forwards to the error handler
  export const asyncHandler = (fn: Function) => (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };

  // Controller usage example
  export const getUserProfile = asyncHandler(async (req: Request, res: Response) => {
    const userId = req.user.id;
    const profile = await userService.getProfile(userId); // Unhandled errors here go to asyncHandler
    return res.status(200).json({ success: true, data: profile });
  });
  ```

---

## 🔌 Global Error Handling Middleware
- **Handler Registration**: Declare a unified global error handling middleware in `app.ts` or `server.ts` containing exactly 4 parameters (`err`, `req`, `res`, `next`). Place it at the very bottom of the middleware chain (after route declarations).
- **Conventions**:
  - Sanitize responses. Format output JSON uniformly:
  ```typescript
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

## 🛡️ Input Validation Middleware (Zod)
- **No manual conditional statements**: Forbid `if (!req.body.email)` or raw string checking scripts in controllers.
- **Zod Middleware**: Implement a schema-driven validation middleware using Zod to parse and validate request payloads (`body`, `query`, `params`) before routing requests:

  ```typescript
  import { AnyZodObject, ZodError } from 'zod';
  import { Request, Response, NextFunction } from 'express';

  export const validateSchema = (schema: AnyZodObject) => {
    return async (req: Request, res: Response, next: NextFunction): Promise<any> => {
      try {
        const parsed = await schema.parseAsync({
          body: req.body,
          query: req.query,
          params: req.params,
        });
        
        // Assign cleaned and casted data back to the express request object
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
