import { z } from "zod";

const userRoleSchema = z.enum(["admin", "staff"]);
const permissionSchema = z.enum([
  "leads.read",
  "leads.write",
  "clients.read",
  "clients.write",
  "applications.read",
  "applications.write",
  "tasks.read",
  "tasks.write",
  "documents.read",
  "documents.write",
  "appointments.read",
  "appointments.write",
  "messages.read",
  "messages.write",
  "payments.read",
  "site_content.read",
  "site_content.write",
  "users.read",
  "users.write",
]);

const passwordSchema = z
  .string()
  .min(8, "Password must be at least 8 characters long.")
  .max(72, "Password must be 72 characters or fewer.")
  .regex(/[A-Z]/, "Password must include at least one uppercase letter.")
  .regex(/[a-z]/, "Password must include at least one lowercase letter.")
  .regex(/[0-9]/, "Password must include at least one number.");

const signInSchema = z.object({
  email: z.string().trim().toLowerCase().email("Enter a valid email address."),
  password: z.string().min(1, "Password is required."),
  rememberMe: z.boolean().default(true),
});

const bootstrapAdminSchema = z
  .object({
    name: z
      .string()
      .trim()
      .min(2, "Name must be at least 2 characters long.")
      .max(80, "Name must be 80 characters or fewer."),
    email: z.string().trim().toLowerCase().email("Enter a valid email address."),
    password: passwordSchema,
    confirmPassword: z.string(),
    rememberMe: z.boolean().default(true),
  })
  .refine((value) => value.password === value.confirmPassword, {
    path: ["confirmPassword"],
    message: "Passwords do not match.",
  });

export type UserRole = z.infer<typeof userRoleSchema>;
export type Permission = z.infer<typeof permissionSchema>;
export type SignInInput = z.infer<typeof signInSchema>;
export type BootstrapAdminInput = z.infer<typeof bootstrapAdminSchema>;
