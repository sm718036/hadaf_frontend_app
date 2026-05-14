import { useEffect, useState, useDeferredValue } from "react";
import { CalendarDays, Eye, Mail, Pencil, ShieldCheck, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { APP_ROUTES } from "@/config/routes";
import { AppDialog } from "@/components/ui/app-dialog";
import {
  AppTable,
  AppTableBody,
  AppTableCell,
  AppTableEmpty,
  AppTableHead,
  AppTableHeading,
  AppTableRow,
} from "@/components/ui/app-table";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { useAppDialogs } from "@/components/ui/use-app-dialogs";
import { SelectMenu } from "@/components/ui/select-menu";
import { SpinnerTwo } from "@/components/ui/spinner";
import { useCurrentUser } from "@/features/auth/use-auth";
import { getDefaultInternalDashboardRoute } from "@/features/dashboard/access-control";
import { useDashboardAccess } from "@/features/dashboard/use-dashboard-access";
import {
  EmptyHint,
  Field,
  PaginationControls,
  Panel,
  TableToolbar,
} from "@/features/dashboard/dashboard-ui";
import { getUserAvatarUrl, getUserInitials } from "@/features/dashboard/profile-utils";
import type {
  CreateInternalUserInput,
  InternalUser,
  Permission,
} from "@/features/internal-users/users.schemas";
import {
  useCreateInternalUser,
  useDeleteInternalUser,
  useInternalUsers,
  useUpdateInternalUser,
} from "@/features/internal-users/use-users";
import { DEFAULT_PAGE_SIZE } from "@/lib/pagination";
import { useAppNavigate } from "@/lib/router";

const STAFF_PERMISSION_OPTIONS: Permission[] = [
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
];

const PERMISSION_GROUPS: Array<{
  label: string;
  description: string;
  permissions: Permission[];
}> = [
  {
    label: "Leads",
    description: "Access lead records and follow-up workflows.",
    permissions: ["leads.read", "leads.write"],
  },
  {
    label: "Clients",
    description: "Manage client profiles and account details.",
    permissions: ["clients.read", "clients.write"],
  },
  {
    label: "Applications",
    description: "Work with application progress and stage updates.",
    permissions: ["applications.read", "applications.write"],
  },
  {
    label: "Tasks",
    description: "Review and assign operational work items.",
    permissions: ["tasks.read", "tasks.write"],
  },
  {
    label: "Documents",
    description: "Open and manage uploaded files.",
    permissions: ["documents.read", "documents.write"],
  },
  {
    label: "Appointments",
    description: "Schedule and update appointment records.",
    permissions: ["appointments.read", "appointments.write"],
  },
  {
    label: "Messages",
    description: "Use chat threads and conversation tools.",
    permissions: ["messages.read", "messages.write"],
  },
  {
    label: "Payments",
    description: "View payment tracking information.",
    permissions: ["payments.read"],
  },
  {
    label: "Site Content",
    description: "Review and update website content.",
    permissions: ["site_content.read", "site_content.write"],
  },
  {
    label: "Users",
    description: "Access internal user management tools.",
    permissions: ["users.read", "users.write"],
  },
];

function createEmptyUserForm(): CreateInternalUserInput {
  return {
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    role: "staff",
    permissions: [],
  };
}

export function DashboardUsersPage() {
  const dialogs = useAppDialogs();
  const access = useDashboardAccess();
  const [page, setPage] = useState(1);
  const [searchInput, setSearchInput] = useState("");
  const deferredSearch = useDeferredValue(searchInput.trim());
  const usersQuery = useInternalUsers({
    enabled: access.canReadUsers,
    page,
    pageSize: DEFAULT_PAGE_SIZE,
    search: deferredSearch,
  });
  const createUserMutation = useCreateInternalUser();
  const deleteUserMutation = useDeleteInternalUser();
  const updateUserMutation = useUpdateInternalUser();
  const [editingUser, setEditingUser] = useState<InternalUser | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [userForm, setUserForm] = useState<CreateInternalUserInput>(createEmptyUserForm());
  const users = usersQuery.data?.items ?? [];
  const total = usersQuery.data?.total ?? 0;
  const totalPages = usersQuery.data?.totalPages ?? 1;

  useEffect(() => {
    setPage(1);
  }, [deferredSearch]);

  useEffect(() => {
    if (page > totalPages) {
      setPage(totalPages);
    }
  }, [page, totalPages]);

  const openCreateDialog = () => {
    setEditingUser(null);
    setUserForm(createEmptyUserForm());
    setIsDialogOpen(true);
  };

  const openEditDialog = (user: InternalUser) => {
    setEditingUser(user);
    setUserForm({
      name: user.name,
      email: user.email,
      password: "",
      confirmPassword: "",
      role: user.role,
      permissions: user.permissions,
    });
    setIsDialogOpen(true);
  };

  const closeDialog = () => {
    setIsDialogOpen(false);
    setEditingUser(null);
    setUserForm(createEmptyUserForm());
  };

  const isReadOnlyDialog = Boolean(editingUser) && !access.canWriteUsers;

  const togglePermission = (permission: Permission, enabled: boolean) => {
    const nextPermissions = enabled
      ? Array.from(new Set([...userForm.permissions, permission]))
      : userForm.permissions.filter((item) => item !== permission);

    setUserForm({
      ...userForm,
      permissions: nextPermissions.filter((item) => STAFF_PERMISSION_OPTIONS.includes(item)),
    });
  };

  return (
    <>
      <Panel
        title="Internal Users"
        subtitle="This module lists internal users only. Creation and access updates happen in dialogs."
        action={
          access.canWriteUsers ? (
            <button type="button" onClick={openCreateDialog} className="btn-gold">
              Create User
            </button>
          ) : undefined
        }
      >
        <TableToolbar
          searchValue={searchInput}
          onSearchChange={setSearchInput}
          searchPlaceholder="Search all internal users..."
          summary={`${total} matching internal users`}
        />

        {usersQuery.isLoading ? (
          <EmptyHint message="Loading internal users..." loading />
        ) : usersQuery.isError ? (
          <EmptyHint message="Unable to load internal users." tone="error" />
        ) : (
          <>
            <AppTable minWidthClass="min-w-[760px]">
              <AppTableHead>
                <AppTableRow>
                  {["Avatar", "Name", "Email", "Verification", "Actions"].map((heading) => (
                    <AppTableHeading key={heading}>{heading}</AppTableHeading>
                  ))}
                </AppTableRow>
              </AppTableHead>
              <AppTableBody>
                {users.length === 0 ? (
                  <AppTableEmpty colSpan={5} className="py-14">
                    {deferredSearch
                      ? "No matching internal users found."
                      : "No internal users found."}
                  </AppTableEmpty>
                ) : (
                  users.map((user) => (
                    <AppTableRow key={user.id}>
                      <AppTableCell>
                        <div className="flex justify-center">
                          <Avatar className="h-11 w-11 border border-slate-200 bg-white">
                            <AvatarImage src={getUserAvatarUrl(user)} alt={user.name} />
                            <AvatarFallback className="bg-gold text-xs font-bold text-dark">
                              {getUserInitials(user.name)}
                            </AvatarFallback>
                          </Avatar>
                        </div>
                      </AppTableCell>
                      <AppTableCell>
                        <span className="font-semibold text-slate-900">{user.name}</span>
                      </AppTableCell>
                      <AppTableCell className="text-slate-600">{user.email}</AppTableCell>
                      <AppTableCell>
                        <div className="flex justify-center">
                          <Badge variant={user.emailVerifiedAt ? "success" : "light"}>
                            {user.emailVerifiedAt ? "Verified" : "Pending"}
                          </Badge>
                        </div>
                      </AppTableCell>
                      <AppTableCell>
                        <div className="flex justify-center gap-2">
                          <button
                            type="button"
                            onClick={() => openEditDialog(user)}
                            className="inline-flex h-10 w-10 items-center justify-center text-slate-600"
                            aria-label={`View ${user.name}`}
                          >
                            <Eye className="h-4 w-4" />
                          </button>
                          {access.canWriteUsers ? (
                            <>
                              <button
                                type="button"
                                onClick={() => openEditDialog(user)}
                                className="inline-flex h-10 w-10 items-center justify-center text-slate-600"
                                aria-label={`Edit ${user.name}`}
                              >
                                <Pencil className="h-4 w-4" />
                              </button>
                              <button
                                type="button"
                                onClick={async () => {
                                  const confirmed = await dialogs.confirm({
                                    title: "Delete user?",
                                    description: `Delete ${user.name}. This action cannot be undone.`,
                                    confirmLabel: "Delete",
                                    tone: "destructive",
                                  });

                                  if (!confirmed) {
                                    return;
                                  }

                                  try {
                                    await deleteUserMutation.mutateAsync(user.id);
                                    toast.success("Internal user deleted.");
                                  } catch (error) {
                                    const message =
                                      error instanceof Error
                                        ? error.message
                                        : "Unable to delete the user.";
                                    toast.error(message);
                                  }
                                }}
                                className="inline-flex h-10 w-10 items-center justify-center text-destructive"
                                aria-label={`Delete ${user.name}`}
                              >
                                <Trash2 className="h-4 w-4" />
                              </button>
                            </>
                          ) : null}
                        </div>
                      </AppTableCell>
                    </AppTableRow>
                  ))
                )}
              </AppTableBody>
            </AppTable>
            <PaginationControls
              page={page}
              pageSize={DEFAULT_PAGE_SIZE}
              total={total}
              totalPages={totalPages}
              onPageChange={setPage}
            />
          </>
        )}
      </Panel>

      {access.canReadUsers ? (
        <AppDialog
          open={isDialogOpen}
          onOpenChange={(open) => !open && closeDialog()}
          title={editingUser ? "User Details" : "Create Internal User"}
          description={
            editingUser
              ? "Review and update this internal user's role and access from one focused dialog."
              : "Create a new internal admin or staff account and define staff permissions."
          }
          contentClassName="max-h-[90vh] max-w-3xl overflow-y-auto rounded-[28px]"
        >
          <form
            className="space-y-4"
            onSubmit={async (event) => {
              event.preventDefault();

              try {
                if (editingUser) {
                  await updateUserMutation.mutateAsync({
                    id: editingUser.id,
                    input: {
                      name: userForm.name,
                      role: userForm.role,
                      permissions: userForm.permissions,
                    },
                  });
                  toast.success("Internal user updated.");
                } else {
                  const createdUser = await createUserMutation.mutateAsync(userForm);
                  toast.success(
                    createdUser.role === "admin"
                      ? "Internal admin created."
                      : "Staff user created. Verification email sent.",
                  );
                }

                closeDialog();
              } catch (error) {
                const message = error instanceof Error ? error.message : "Unable to save the user.";
                toast.error(message);
              }
            }}
          >
            {editingUser ? (
              <div className="grid gap-3 rounded-[24px] border border-slate-200 bg-slate-50 p-4 md:grid-cols-3">
                <InfoTile icon={Mail} label="Email" value={editingUser.email} />
                <InfoTile
                  icon={ShieldCheck}
                  label="Verification"
                  value={editingUser.emailVerifiedAt ? "Verified" : "Pending verification"}
                />
                <InfoTile
                  icon={CalendarDays}
                  label="Created"
                  value={formatUserDate(editingUser.createdAt)}
                />
              </div>
            ) : null}

            <div className="grid gap-4 md:grid-cols-2">
              <Field
                label="Full Name"
                required
                value={userForm.name}
                onChange={(value) => setUserForm({ ...userForm, name: value })}
                disabled={isReadOnlyDialog}
              />
              <Field
                label="Email"
                type="email"
                required
                value={userForm.email}
                onChange={(value) => setUserForm({ ...userForm, email: value })}
                disabled={Boolean(editingUser) || isReadOnlyDialog}
              />
              {!editingUser ? (
                <>
                  <Field
                    label="Password"
                    type="password"
                    required
                    value={userForm.password}
                    onChange={(value) => setUserForm({ ...userForm, password: value })}
                  />
                  <Field
                    label="Confirm Password"
                    type="password"
                    required
                    value={userForm.confirmPassword}
                    onChange={(value) => setUserForm({ ...userForm, confirmPassword: value })}
                  />
                </>
              ) : null}
            </div>

            <div>
              <label className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
                Role
              </label>
              <div className="mt-2">
                <SelectMenu
                  value={userForm.role}
                  onValueChange={(value) =>
                    setUserForm({
                      ...userForm,
                      role: value as CreateInternalUserInput["role"],
                      permissions: value === "admin" ? [] : userForm.permissions,
                    })
                  }
                  disabled={isReadOnlyDialog}
                  className="h-auto bg-slate-50 py-3"
                  options={[
                    { value: "staff", label: "Staff" },
                    { value: "admin", label: "Admin" },
                  ]}
                />
              </div>
            </div>

            {userForm.role === "staff" ? (
              <div>
                <div className="flex items-center justify-between gap-3">
                  <label className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
                    Staff Permissions
                  </label>
                  <span className="text-xs font-medium text-slate-400">
                    {userForm.permissions.length} selected
                  </span>
                </div>
                <div className="mt-3 grid gap-3">
                  {PERMISSION_GROUPS.map((group) => (
                    <div
                      key={group.label}
                      className="rounded-[22px] border border-slate-200 bg-slate-50 px-4 py-4"
                    >
                      <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
                        <div>
                          <p className="text-sm font-semibold text-slate-900">{group.label}</p>
                          <p className="text-xs leading-5 text-slate-500">{group.description}</p>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {group.permissions.map((permission) => {
                            const checked = userForm.permissions.includes(permission);
                            const actionLabel = permission.endsWith(".write") ? "Write" : "Read";

                            return (
                              <button
                                key={permission}
                                type="button"
                                disabled={isReadOnlyDialog}
                                onClick={() => togglePermission(permission, !checked)}
                                className={
                                  checked
                                    ? "rounded-full bg-slate-900 px-3 py-1.5 text-xs font-semibold text-white"
                                    : "rounded-full border border-slate-300 bg-white px-3 py-1.5 text-xs font-semibold text-slate-600 transition hover:border-slate-400 hover:text-slate-900"
                                }
                                aria-pressed={checked}
                              >
                                {actionLabel}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="rounded-[22px] border border-emerald-200 bg-emerald-50 px-4 py-4 text-sm text-emerald-900">
                Admin accounts receive full access across all modules.
              </div>
            )}

            <div className="flex flex-wrap justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={closeDialog}
                className="rounded-2xl border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
              >
                {isReadOnlyDialog ? "Close" : "Cancel"}
              </button>
              {!isReadOnlyDialog ? (
                <button
                  type="submit"
                  disabled={createUserMutation.isPending || updateUserMutation.isPending}
                  className="btn-gold min-w-[170px] justify-center"
                >
                  {createUserMutation.isPending || updateUserMutation.isPending ? (
                    <>
                      <SpinnerTwo size="sm" className="mr-1" />
                      Saving...
                    </>
                  ) : editingUser ? (
                    "Update User"
                  ) : (
                    "Create User"
                  )}
                </button>
              ) : null}
            </div>
          </form>
        </AppDialog>
      ) : null}
    </>
  );
}

export function DashboardUsersRedirect() {
  const navigate = useAppNavigate();
  const { data: currentUser, isLoading } = useCurrentUser();

  useEffect(() => {
    if (isLoading) {
      return;
    }

    if (!currentUser) {
      navigate(APP_ROUTES.auth, {
        replace: true,
        search: { redirect: APP_ROUTES.dashboardUsers, mode: "staff" },
      });
      return;
    }

    if (currentUser.role !== "admin") {
      navigate(getDefaultInternalDashboardRoute(currentUser), { replace: true });
      return;
    }

    navigate(APP_ROUTES.dashboardAdminUsers, { replace: true });
  }, [currentUser, isLoading, navigate]);

  return null;
}

function InfoTile({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof Mail;
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-2xl border border-white/80 bg-white px-4 py-3">
      <div className="flex items-center gap-2 text-slate-400">
        <Icon className="h-4 w-4" />
        <span className="text-[11px] font-semibold uppercase tracking-[0.18em]">{label}</span>
      </div>
      <p className="mt-2 text-sm font-semibold text-slate-900">{value}</p>
    </div>
  );
}

function formatUserDate(value: string) {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return date.toLocaleDateString();
}
