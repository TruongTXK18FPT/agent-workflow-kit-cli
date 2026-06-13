# Modular Architecture & Dependency Injection (DI)

This document defines module boundaries, code isolation (encapsulation), and dependency injection standards in NestJS.

---

## 💉 Dependency Injection (DI)
- **No Property Injection:** Never use the `@Inject()` decorator directly on class properties unless injecting Custom Tokens. Property injection degrades mock testing and litters class definitions.
- **Constructor Injection Required:** Use constructor parameter injection with the `private readonly` modifier to leverage NestJS's dependency resolution.

  * **Invalid (❌ Prohibited):**
    ```typescript
    @Injectable()
    export class AuthService {
      @Inject(UsersService)
      private readonly usersService: UsersService;
    }
    ```
  * **Valid (✔️ Recommended):**
    ```typescript
    @Injectable()
    export class AuthService {
      constructor(private readonly usersService: UsersService) {}
    }
    ```

---

## 🏗️ Module Boundaries & Encapsulation
- **Encapsulated by Default:** Providers (Services, Repositories) inside a Module are private by default. Other modules cannot access them unless they are explicitly exported.
- **Sharing Resources:** When Module B needs to use a Service declared in Module A:
  1. Add that Service to the `exports` array in Module A's `@Module()` decorator.
  2. Add Module A to the `imports` array in Module B's `@Module()` decorator.
  * **Strict Rule:** Never import a Service of Module A directly into the `providers` array of Module B.
- **Global Modules:** Avoid using `@Global()` unless configuring highly stable infrastructure modules (e.g., Database connections or Config systems).
