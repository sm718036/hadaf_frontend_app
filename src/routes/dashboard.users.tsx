import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useDeferredValue, useEffect, useState } from "react";
import { Pencil, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { APP_ROUTES } from "@/config/routes";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { SpinnerTwo } from "@/components/ui/spinner";
import { useCurrentUser } from "@/features/auth/use-auth";
import { getDefaultInternalDashboardRoute } from "@/features/dashboard/access-control";
import { useDashboardAccess } from "@/features/dashboard/dashboard-context";
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

export const Route = createFileRoute("/dashboard/users")({
  component: DashboardUsersRedirect,
});

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
            <div className="overflow-hidden rounded-[24px] border border-slate-200">
              <div className="overflow-x-auto">
                <table className="w-full min-w-[760px] text-sm">
                  <thead className="bg-slate-900 text-slate-100">
                    <tr>
                      {["Name", "Email", "Role", "Permissions", "Actions"].map((heading) => (
                        <th key={heading} className="px-5 py-4 text-center font-display font-semibold">
                          {heading}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 bg-white">
                    {users.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="px-5 py-14 text-center text-slate-500">
                          {deferredSearch ? "No matching internal users found." : "No internal users found."}
                        </td>
                      </tr>
                    ) : (
                      users.map((user) => (
                        <tr key={user.id}>
                          <td className="px-5 py-4 text-center">
                            <div className="flex items-center justify-center gap-3">
                              <Avatar className="h-11 w-11 border border-slate-200 bg-white">
                                <AvatarImage src={getUserAvatarUrl(user)} alt={user.name} />
                                <AvatarFallback className="bg-gold text-xs font-bold text-dark">
                                  {getUserInitials(user.name)}
                                </AvatarFallback>
                              </Avatar>
                              <span className="font-semibold text-slate-900">{user.name}</span>
                            </div>
                          </td>
                          <td className="px-5 py-4 text-center text-slate-600">{user.email}</td>
                          <td className="px-5 py-4 text-center">
                            <div className="flex justify-center">
                              <Badge variant={user.role === "admin" ? "dark" : "primary"}>
                                {user.role}
                              </Badge>
                            </div>
                          </td>
                          <td className="px-5 py-4 text-center">
                            {user.role === "admin" ? (
                              <Badge variant="success">Full access</Badge>
                            ) : user.permissions.length > 0 ? (
                              <div className="flex flex-wrap justify-center gap-2">
                                {user.permissions.map((permission) => (
                                  <Badge key={permission} variant="light">
                                    {permission}
                                  </Badge>
                                ))}
                              </div>
                            ) : (
                              <span className="text-sm text-slate-400">No permissions</span>
                            )}
                          </td>
                          <td className="px-5 py-4 text-center">
                            {access.canWriteUsers ? (
                              <div className="flex justify-center gap-2">
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
                                    if (!confirm(`Delete ${user.name}?`)) {
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
                              </div>
                            ) : (
                              <span className="text-xs font-medium text-slate-400">Read only</span>
                            )}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
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

      {access.canWriteUsers ? (
        <Dialog open={isDialogOpen} onOpenChange={(open) => !open && closeDialog()}>
          <DialogContent className="max-h-[90vh] max-w-3xl overflow-y-auto rounded-[28px] border border-slate-200 bg-white p-0">
            <DialogHeader className="border-b border-slate-200 px-6 py-5">
              <DialogTitle className="text-2xl font-display font-extrabold text-slate-950">
                {editingUser ? "Update User Access" : "Create Internal User"}
              </DialogTitle>
              <DialogDescription className="text-sm text-slate-500">
                {editingUser
                  ? "Update the role and permission set for this internal user."
                  : "Create a new internal admin or staff account and define staff permissions."}
              </DialogDescription>
            </DialogHeader>

            <div className="px-6 py-6">
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
                      await createUserMutation.mutateAsync(userForm);
                      toast.success("Internal user created.");
                    }

                    closeDialog();
                  } catch (error) {
                    const message =
                      error instanceof Error ? error.message : "Unable to save the user.";
                    toast.error(message);
                  }
                }}
              >
                <div className="grid gap-4 md:grid-cols-2">
                  <Field
                    label="Full Name"
                    required
                    value={userForm.name}
                    onChange={(value) => setUserForm({ ...userForm, name: value })}
                  />
                  <Field
                    label="Email"
                    type="email"
                    required
                    value={userForm.email}
                    onChange={(value) => setUserForm({ ...userForm, email: value })}
                    disabled={Boolean(editingUser)}
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
                  <select
                    value={userForm.role}
                    onChange={(event) =>
                      setUserForm({
                        ...userForm,
                        role: event.target.value as CreateInternalUserInput["role"],
                        permissions: event.target.value === "admin" ? [] : userForm.permissions,
                      })
                    }
                    className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none"
                  >
                    <option value="staff">Staff</option>
                    <option value="admin">Admin</option>
                  </select>
                </div>

                {userForm.role === "staff" ? (
                  <div>
                    <label className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
                      Staff Permissions
                    </label>
                    <div className="mt-3 grid gap-3">
                      {STAFF_PERMISSION_OPTIONS.map((permission) => {
                        const checked = userForm.permissions.includes(permission);

                        return (
                          <label
                            key={permission}
                            className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm"
                          >
                            <input
                              type="checkbox"
                              checked={checked}
                              onChange={(event) => {
                                const permissions = event.target.checked
                                  ? [...userForm.permissions, permission]
                                  : userForm.permissions.filter((item) => item !== permission);

                                setUserForm({
                                  ...userForm,
                                  permissions,
                                });
                              }}
                            />
                            <span>{permission}</span>
                          </label>
                        );
                      })}
                    </div>
                  </div>
                ) : null}

                <div className="flex flex-wrap justify-end gap-3 pt-2">
                  <button
                    type="button"
                    onClick={closeDialog}
                    className="rounded-2xl border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={createUserMutation.isPending || updateUserMutation.isPending}
                    className="btn-gold min-w-[170px] justify-center"
                  >
                    {createUserMutation.isPending || updateUserMutation.isPending
                      ? (
                        <>
                          <SpinnerTwo size="sm" className="mr-1" />
                          Saving...
                        </>
                      )
                      : editingUser
                        ? "Update User"
                        : "Create User"}
                  </button>
                </div>
              </form>
            </div>
          </DialogContent>
        </Dialog>
      ) : null}
    </>
  );
}

function DashboardUsersRedirect() {
  const navigate = useNavigate();
  const { data: currentUser, isLoading } = useCurrentUser();

  useEffect(() => {
    if (isLoading) {
      return;
    }

    if (!currentUser) {
      navigate({ to: APP_ROUTES.auth, search: { redirect: APP_ROUTES.dashboardUsers, mode: "staff" }, replace: true });
      return;
    }

    if (currentUser.role !== "admin") {
      navigate({ to: getDefaultInternalDashboardRoute(currentUser), replace: true });
      return;
    }

    navigate({ to: APP_ROUTES.dashboardAdminUsers, replace: true });
  }, [currentUser, isLoading, navigate]);

  return null;
}
