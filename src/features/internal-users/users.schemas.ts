import { z } from "zod";

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

const userRoleSchema = z.enum(["admin", "staff"]);

const internalUserSchema = z.object({
  id: z.string(),
  email: z.string().email(),
  name: z.string(),
  avatarUrl: z.string().nullable(),
  role: userRoleSchema,
  permissions: z.array(permissionSchema),
  createdAt: z.string(),
});

const createInternalUserSchema = z
  .object({
    name: z.string().trim().min(2).max(80),
    email: z.string().trim().toLowerCase().email(),
    password: z.string().min(8).max(72),
    confirmPassword: z.string(),
    role: userRoleSchema,
    permissions: z.array(permissionSchema),
  })
  .refine((value) => value.password === value.confirmPassword, {
    path: ["confirmPassword"],
    message: "Passwords do not match.",
  });

const updateInternalUserSchema = z.object({
  name: z.string().trim().min(2).max(80),
  role: userRoleSchema,
  permissions: z.array(permissionSchema),
});

export type Permission = z.infer<typeof permissionSchema>;
export type InternalUser = z.infer<typeof internalUserSchema>;
export type CreateInternalUserInput = z.infer<typeof createInternalUserSchema>;
export type UpdateInternalUserInput = z.infer<typeof updateInternalUserSchema>;
