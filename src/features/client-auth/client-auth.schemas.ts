import { z } from "zod";

const emailSchema = z.string().trim().toLowerCase().email("Enter a valid email address.");

const passwordSchema = z
  .string()
  .min(8, "Password must be at least 8 characters long.")
  .max(72, "Password must be 72 characters or fewer.")
  .regex(/[A-Z]/, "Password must include at least one uppercase letter.")
  .regex(/[a-z]/, "Password must include at least one lowercase letter.")
  .regex(/[0-9]/, "Password must include at least one number.");

const clientSignInSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, "Password is required."),
  rememberMe: z.boolean().default(true),
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
    rememberMe: z.boolean().default(true),
  })
  .refine((value) => value.password === value.confirmPassword, {
    path: ["confirmPassword"],
    message: "Passwords do not match.",
  });

export type ClientSignInInput = z.infer<typeof clientSignInSchema>;
export type ClientSignUpInput = z.infer<typeof clientSignUpSchema>;
