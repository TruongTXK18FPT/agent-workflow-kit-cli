# Async Error Handling & Automated Validation (Zod Middleware)

This document defines standard practices for asynchronous error catching, centralized global error handling middleware, and automated schema validations using Zod.

---

## 🚨 Async Error Handling Architecture
- **No Manual Try/Catch in Controllers:** Wrapping every controller method in manual try/catch blocks is prohibited.
- **Use Async Handlers:** Wrap all async controller functions with an automatic error-catching wrapper (such as `asyncHandler`) to automatically forward exceptions to Express's `next()` function.

  ```typescript
  import { Request, Response, NextFunction } from 'express';

  // Automated async error catcher wrapper
  const asyncHandler = (fn: Function) => (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };

  // Controller usage example
  export const getUserProfile = asyncHandler(async (req: Request, res: Response) => {
    const userId = req.user.id;
    const profile = await userService.getProfile(userId); // Errors thrown inside the service are automatically caught
    return res.status(200).json({ success: true, data: profile });
  });
  ```

---

## 🔌 Centralized Global Error Handler Middleware
- **Register Error Middleware:** You must register a 4-parameter error-handling middleware at the end of the server bootstrap chain (after all route registrations) to parse and return clean error responses.

  ```typescript
  // Inside app.ts or server.ts
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

## 🛡️ Automated Validation with Zod Middleware
- **No Manual Conditional Checks:** Do not write scattered `if (!req.body.email)` conditionals inside controllers.
- **Zod Schema Middleware:** Implement a shared validation middleware that accepts a Zod schema to validate request segments (`body`, `query`, `params`) before they reach the Controller.

  ```typescript
  import { AnyZodObject, ZodError } from 'zod';
  import { Request, Response, NextFunction } from 'express';

  export const validateSchema = (schema: AnyZodObject) => {
    return async (req: Request, res: Response, next: NextFunction): Promise<any> => {
      try {
        // Validate incoming request segments concurrently
        const parsed = await schema.parseAsync({
          body: req.body,
          query: req.query,
          params: req.params,
        });
        
        // Re-assign parsed and sanitized payloads
        req.body = parsed.body;
        req.query = parsed.query;
        req.params = parsed.params;
        
        return next();
      } catch (error) {
        if (error instanceof ZodError) {
          return res.status(400).json({
            success: false,
            message: 'Invalid input payload parameters',
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
