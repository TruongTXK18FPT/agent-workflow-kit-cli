# Form Management & Schema Validation Rules

This ruleset governs the design and implementation of input fields, submissions, validations, and custom component bindings inside React forms.

---

## ⚡ Form Performance (React Hook Form)
- **High Performance**: Use **React Hook Form (RHF)** to handle form state through uncontrolled inputs. This isolates rendering, preventing expensive keypress lag or component bottlenecks on large forms.
- **Controlled Integration**: For custom/third-party UI controls that cannot be controlled natively (such as Rich Text Editors, custom Select dropdowns, calendar selectors), wrap them within RHF's `<Controller>` component to synchronize state efficiently.

---

## 🛡️ Schema-Driven Validation (Zod)
- **No manual checking**: Never use complex if/else blocks or custom validation scripts inside submit handlers to check forms.
- **Zod Resolving**: Use **Zod** to declare form schemas. Bind them to React Hook Form using `zodResolver` to automatically map validator rules and throw clean, localized error messages:

  ```tsx
  // Example feature form implementation
  import { useForm } from "react-hook-form";
  import { zodResolver } from "@hookform/resolvers/zod";
  import * as z from "zod";
  import { cn } from "@/utils/cn";

  const loginSchema = z.object({
    email: z.string().min(1, "Email cannot be empty").email("Invalid email format"),
    password: z.string().min(8, "Password must contain at least 8 characters"),
  });

  type LoginFields = z.infer<typeof loginSchema>;

  export const LoginForm = () => {
    const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<LoginFields>({
      resolver: zodResolver(loginSchema),
    });

    const onSubmit = async (data: LoginFields) => {
      // Execute authentication pipeline
    };

    return (
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <input 
            {...register("email")} 
            className={cn("border px-3 py-2 rounded", errors.email && "border-red-500")} 
          />
          {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email.message}</p>}
        </div>
        <button type="submit" disabled={isSubmitting} className="px-4 py-2 bg-primary text-white rounded">
          {isSubmitting ? "Processing..." : "Login"}
        </button>
      </form>
    );
  };
  ```
