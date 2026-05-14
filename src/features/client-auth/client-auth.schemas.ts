import { z } from "zod";

const emailSchema = z.string().trim().toLowerCase().email("Enter a valid email address.");

export const passwordSchema = z
  .string()
  .min(8, "Password must be at least 8 characters long.")
  .max(72, "Password must be 72 characters or fewer.")
  .regex(/[A-Z]/, "Password must include at least one uppercase letter.")
  .regex(/[a-z]/, "Password must include at least one lowercase letter.")
  .regex(/[0-9]/, "Password must include at least one number.");

const clientSignInSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, "Password is required."),
  rememberMe: z.boolean().default(false),
});

const clientSignUpSchema = z
  .object({
    name: z
      .string()
      .trim()
      .min(2, "Name must be at least 2 characters long.")
      .max(120, "Name must be 120 characters or fewer."),
    email: emailSchema,
    phone: z.string().trim().max(30, "Phone must be 30 characters or fewer."),
    password: passwordSchema,
    confirmPassword: z.string(),
    rememberMe: z.boolean().default(false),
  })
  .refine((value) => value.password === value.confirmPassword, {
    path: ["confirmPassword"],
    message: "Passwords do not match.",
  });

const requestClientPasswordResetSchema = z.object({
  email: emailSchema,
});

const resetClientPasswordSchema = z
  .object({
    token: z.string().trim().min(1, "Reset token is required."),
    password: passwordSchema,
    confirmPassword: z.string(),
  })
  .refine((value) => value.password === value.confirmPassword, {
    path: ["confirmPassword"],
    message: "Passwords do not match.",
  });

const changeClientPasswordSchema = z
  .object({
    currentPassword: z.string().min(1, "Current password is required."),
    newPassword: passwordSchema,
    confirmPassword: z.string(),
  })
  .refine((value) => value.newPassword === value.confirmPassword, {
    path: ["confirmPassword"],
    message: "Passwords do not match.",
  });

export type ClientSignInInput = z.infer<typeof clientSignInSchema>;
export type ClientSignUpInput = z.infer<typeof clientSignUpSchema>;
export type RequestClientPasswordResetInput = z.infer<typeof requestClientPasswordResetSchema>;
export type ResetClientPasswordInput = z.infer<typeof resetClientPasswordSchema>;
export type ChangeClientPasswordInput = z.infer<typeof changeClientPasswordSchema>;
