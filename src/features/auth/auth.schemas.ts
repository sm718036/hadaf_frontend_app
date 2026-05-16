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
  "payments.write",
  "site_content.read",
  "site_content.write",
  "users.read",
  "users.write",
]);

export const passwordSchema = z
  .string()
  .min(8, "Password must be at least 8 characters long.")
  .max(72, "Password must be 72 characters or fewer.")
  .regex(/[A-Z]/, "Password must include at least one uppercase letter.")
  .regex(/[a-z]/, "Password must include at least one lowercase letter.")
  .regex(/[0-9]/, "Password must include at least one number.");

const signInSchema = z.object({
  email: z.string().trim().toLowerCase().email("Enter a valid email address."),
  password: z.string().min(1, "Password is required."),
  rememberMe: z.boolean().default(false),
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
    rememberMe: z.boolean().default(false),
  })
  .refine((value) => value.password === value.confirmPassword, {
    path: ["confirmPassword"],
    message: "Passwords do not match.",
  });

const requestPasswordResetSchema = z.object({
  email: z.string().trim().toLowerCase().email("Enter a valid email address."),
});

const resetPasswordSchema = z
  .object({
    token: z.string().trim().min(1, "Reset token is required."),
    password: passwordSchema,
    confirmPassword: z.string(),
  })
  .refine((value) => value.password === value.confirmPassword, {
    path: ["confirmPassword"],
    message: "Passwords do not match.",
  });

const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, "Current password is required."),
    newPassword: passwordSchema,
    confirmPassword: z.string(),
  })
  .refine((value) => value.newPassword === value.confirmPassword, {
    path: ["confirmPassword"],
    message: "Passwords do not match.",
  });

const updateOwnProfileSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "Name must be at least 2 characters long.")
    .max(80, "Name must be 80 characters or fewer."),
  email: z.string().trim().toLowerCase().email("Enter a valid email address."),
});

export type UserRole = z.infer<typeof userRoleSchema>;
export type Permission = z.infer<typeof permissionSchema>;
export type SignInInput = z.infer<typeof signInSchema>;
export type BootstrapAdminInput = z.infer<typeof bootstrapAdminSchema>;
export type RequestPasswordResetInput = z.infer<typeof requestPasswordResetSchema>;
export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>;
export type ChangePasswordInput = z.infer<typeof changePasswordSchema>;
export type UpdateOwnProfileInput = z.infer<typeof updateOwnProfileSchema>;
