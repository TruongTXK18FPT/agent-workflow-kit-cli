# Module Architecture & Dependency Injection Rules

This ruleset governs module configuration boundaries, class encapsulation, and the usage of NestJS Dependency Injection.

---

## 💉 Dependency Injection (DI)
- **No Property Injection**: Do not use the `@Inject()` decorator directly on class properties unless you are injecting a custom symbol/string token. Property injection reduces readability and complicates testing mocks.
- **Constructor Injection Required**: Define all class dependency injection dependencies via the class constructor parameters. Use the `private readonly` modifier to declare them as class fields automatically:

  * **Incorrect (❌ Forbidden)**:
    ```typescript
    @Injectable()
    export class AuthService {
      @Inject(UsersService)
      private readonly usersService: UsersService;
    }
    ```
  * **Correct (✔️ Required)**:
    ```typescript
    @Injectable()
    export class AuthService {
      constructor(private readonly usersService: UsersService) {}
    }
    ```

---

## 🏗️ Module Boundaries & Encapsulation
- **Encapsulation by Default**: Providers (Services, Repositories) inside a module are private to that module by default.
- **Sharing Providers**: If a provider in Module A needs to be consumed in Module B:
  1. Export the provider inside the `exports` array of Module A's `@Module()` decorator.
  2. Import Module A into Module B's `imports` array.
  * Never bypass this encapsulation (e.g. by importing a service directly without importing its parent module).
- **Global Modules**: Avoid creating global modules (`@Global()`) unless you are providing stable core components (like database connection modules or configuration modules).
