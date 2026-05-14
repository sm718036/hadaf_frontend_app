import { useEffect, useState } from "react";
import {
  CalendarDays,
  Info,
  LockKeyhole,
  Mail,
  MapPin,
  Phone,
  ShieldCheck,
  UserRound,
} from "lucide-react";
import { toast } from "sonner";
import { APP_ROUTES } from "@/config/routes";
import {
  AppTable,
  AppTableBody,
  AppTableCell,
  AppTableHead,
  AppTableHeading,
  AppTableRow,
} from "@/components/ui/app-table";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { AppDialog } from "@/components/ui/app-dialog";
import {
  useChangePassword,
  useCurrentUser,
  useRevokeUserSession,
  useRemoveProfileAvatar,
  useUploadProfileAvatar,
  useUserSessions,
} from "@/features/auth/use-auth";
import { authService } from "@/features/auth/auth.service";
import { EmptyHint, LoadingOverlay } from "@/features/dashboard/dashboard-ui";
import {
  buildUserProfileData,
  getUserAvatarUrl,
  getUserInitials,
} from "@/features/dashboard/profile-utils";
import { useAppNavigate } from "@/lib/router";

export function DashboardProfilePage() {
  const currentUserQuery = useCurrentUser();
  const sessionsQuery = useUserSessions();
  const revokeSessionMutation = useRevokeUserSession();
  const uploadAvatarMutation = useUploadProfileAvatar();
  const removeAvatarMutation = useRemoveProfileAvatar();
  const changePasswordMutation = useChangePassword();
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [isPasswordDialogOpen, setIsPasswordDialogOpen] = useState(false);
  const [selectedSessionId, setSelectedSessionId] = useState<string | null>(null);
  const [isResetEmailPending, setIsResetEmailPending] = useState(false);

  if (currentUserQuery.isError || !currentUserQuery.data) {
    return <EmptyHint message="Unable to load the profile." tone="error" />;
  }

  const currentUser = currentUserQuery.data;
  const profile = buildUserProfileData(currentUser);
  const avatarUrl = getUserAvatarUrl(currentUser);
  const initials = getUserInitials(currentUser.name);
  const selectedSession =
    sessionsQuery.data?.find((session) => session.id === selectedSessionId) ?? null;

  return (
    <section className="relative overflow-hidden rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm xl:p-8">
      <div className="pb-6">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-center">
          <Avatar className="h-24 w-24 border border-slate-200 bg-white">
            <AvatarImage src={avatarUrl} alt={currentUser.name} />
            <AvatarFallback className="bg-gold text-2xl font-bold text-dark">
              {initials}
            </AvatarFallback>
          </Avatar>
          <div className="min-w-0">
            <div className="flex flex-col gap-2">
              <div className="flex flex-wrap items-center gap-3">
                <h2 className="text-3xl font-display font-extrabold text-slate-950">
                  {currentUser.name}
                </h2>
                <Badge variant={currentUser.role === "admin" ? "dark" : "primary"}>
                  {profile.roleLabel}
                </Badge>
              </div>
              <p className="max-w-3xl text-sm leading-7 text-slate-500">{profile.bio}</p>
              <div className="flex flex-wrap gap-5 text-sm text-slate-600">
                <span className="inline-flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-gold" />
                  {profile.cityState}
                </span>
                <span className="inline-flex items-center gap-2">
                  <CalendarDays className="h-4 w-4 text-gold" />
                  Joined {profile.joinedOn}
                </span>
              </div>
              <div className="mt-4 flex flex-wrap gap-3">
                <label className="btn-gold cursor-pointer">
                  {uploadAvatarMutation.isPending ? "Uploading..." : "Upload Photo"}
                  <input
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    className="hidden"
                    disabled={uploadAvatarMutation.isPending || removeAvatarMutation.isPending}
                    onChange={async (event) => {
                      const file = event.target.files?.[0];

                      event.currentTarget.value = "";

                      if (!file) {
                        return;
                      }

                      try {
                        await uploadAvatarMutation.mutateAsync(file);
                        toast.success("Profile picture updated.");
                      } catch (error) {
                        toast.error(
                          error instanceof Error
                            ? error.message
                            : "Unable to upload the profile picture.",
                        );
                      }
                    }}
                  />
                </label>
                {currentUser.avatarUrl ? (
                  <button
                    type="button"
                    onClick={async () => {
                      try {
                        await removeAvatarMutation.mutateAsync();
                        toast.success("Profile picture removed.");
                      } catch (error) {
                        toast.error(
                          error instanceof Error
                            ? error.message
                            : "Unable to remove the profile picture.",
                        );
                      }
                    }}
                    disabled={uploadAvatarMutation.isPending || removeAvatarMutation.isPending}
                    className="rounded-full border border-slate-200 px-5 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {removeAvatarMutation.isPending ? "Removing..." : "Remove Photo"}
                  </button>
                ) : null}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid gap-8 border-t border-slate-200 pt-6 xl:grid-cols-2">
        <ProfileSection
          title="Personal Information"
          items={[
            { label: "First Name", value: profile.firstName, icon: UserRound },
            { label: "Last Name", value: profile.lastName, icon: UserRound },
            { label: "Email Address", value: currentUser.email, icon: Mail },
            { label: "Phone", value: profile.phone, icon: Phone },
            { label: "Bio", value: profile.bio, icon: ShieldCheck },
          ]}
        />

        <ProfileSection
          title="Address"
          items={[
            { label: "Country", value: profile.country, icon: MapPin },
            { label: "City / State", value: profile.cityState, icon: MapPin },
            { label: "Postal Code", value: profile.postalCode, icon: MapPin },
          ]}
        />
      </div>
      <div className="mt-8 border-t border-slate-200 pt-6">
        <h3 className="text-[2rem] font-display font-extrabold text-slate-950">Password</h3>
        <p className="mt-2 max-w-3xl text-sm leading-7 text-slate-500">
          Change your password using your current password. All active sessions will be signed out
          after the change.
        </p>
        <div className="mt-5">
          <button type="button" className="btn-gold" onClick={() => setIsPasswordDialogOpen(true)}>
            Change Password
          </button>
        </div>
      </div>
      <div className="mt-8 border-t border-slate-200 pt-6">
        <h3 className="text-[2rem] font-display font-extrabold text-slate-950">Active Sessions</h3>
        <p className="mt-2 max-w-3xl text-sm leading-7 text-slate-500">
          Review where your account is signed in and revoke sessions you do not recognize.
        </p>
        <AppTable minWidthClass="min-w-[760px]">
          <AppTableHead>
            <AppTableRow>
              {["Session", "Type", "Browser", "IP", "Actions"].map((heading) => (
                <AppTableHeading key={heading} align="left">
                  {heading}
                </AppTableHeading>
              ))}
            </AppTableRow>
          </AppTableHead>
          <AppTableBody>
            {sessionsQuery.data?.map((session) => (
              <AppTableRow key={session.id}>
                <AppTableCell align="left">
                  <Badge variant={session.isCurrent ? "dark" : "secondary"}>
                    {session.isCurrent ? "Current" : "Other"}
                  </Badge>
                </AppTableCell>
                <AppTableCell align="left">
                  <Badge variant={session.rememberMe ? "primary" : "outline"}>
                    {session.rememberMe ? "Persistent" : "Browser"}
                  </Badge>
                </AppTableCell>
                <AppTableCell align="left" className="font-medium text-slate-900">
                  {summarizeUserAgent(session.userAgent)}
                </AppTableCell>
                <AppTableCell align="left" className="text-slate-600">
                  {session.ipAddress || "Unavailable"}
                </AppTableCell>
                <AppTableCell align="left">
                  <div className="flex flex-wrap items-center gap-3">
                    <button
                      type="button"
                      onClick={() => setSelectedSessionId(session.id)}
                      className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-100"
                    >
                      <Info className="h-4 w-4" />
                      Details
                    </button>
                    <button
                      type="button"
                      disabled={revokeSessionMutation.isPending}
                      onClick={async () => {
                        try {
                          await revokeSessionMutation.mutateAsync(session.id);
                          toast.success(
                            session.isCurrent
                              ? "This session has been signed out."
                              : "Session revoked.",
                          );
                        } catch (error) {
                          toast.error(
                            error instanceof Error
                              ? error.message
                              : "Unable to revoke the session.",
                          );
                        }
                      }}
                      className="rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      {session.isCurrent ? "Logout" : "Revoke"}
                    </button>
                  </div>
                </AppTableCell>
              </AppTableRow>
            ))}
          </AppTableBody>
        </AppTable>
        {sessionsQuery.isLoading ? (
          <p className="mt-5 px-5 text-sm text-slate-500">Loading active sessions...</p>
        ) : null}
        {sessionsQuery.isError ? (
          <p className="mt-5 px-5 text-sm text-rose-600">Unable to load active sessions.</p>
        ) : null}
      </div>
      <AppDialog
        open={Boolean(selectedSession)}
        onOpenChange={(open) => !open && setSelectedSessionId(null)}
        title="Session Details"
        description="Review more information about this signed-in session."
        contentClassName="max-h-[90vh] w-[calc(100%-2rem)] max-w-xl overflow-hidden"
        bodyClassName="max-h-[calc(90vh-104px)] overflow-y-auto"
      >
        {selectedSession ? (
          <div className="space-y-4">
            <SessionDetailRow
              label="Browser / Device"
              value={describeUserAgent(selectedSession.userAgent)}
            />
            <SessionDetailRow
              label="IP Address"
              value={selectedSession.ipAddress || "Unavailable"}
            />
            <SessionDetailRow
              label="Last Active"
              value={formatSessionTime(selectedSession.lastSeenAt)}
            />
            <SessionDetailRow
              label="Signed In"
              value={formatSessionTime(selectedSession.createdAt)}
            />
            <SessionDetailRow
              label="Expires"
              value={formatSessionTime(selectedSession.expiresAt)}
            />
            <SessionDetailRow
              label="Session Type"
              value={selectedSession.rememberMe ? "Keep Me Signed In" : "Browser Session"}
            />
          </div>
        ) : null}
      </AppDialog>
      <AppDialog
        open={isPasswordDialogOpen}
        onOpenChange={setIsPasswordDialogOpen}
        title="Change Password"
        description="Confirm your current password and choose a new one. All active sessions will be signed out after the change."
        contentClassName="max-h-[90vh] w-[calc(100%-1rem)] max-w-2xl overflow-hidden"
        bodyClassName="max-h-[calc(90vh-104px)] overflow-y-auto !px-0 !py-0"
      >
        <div className="border-b border-slate-200 bg-slate-50 px-6 py-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm leading-6 text-slate-600">
              Don&apos;t remember your current password? Send a reset link to{" "}
              <span className="font-semibold text-slate-900">{currentUser.email}</span>.
            </p>
            <button
              type="button"
              disabled={isResetEmailPending}
              onClick={async () => {
                try {
                  setIsResetEmailPending(true);
                  const result = await authService.requestPasswordReset({
                    email: currentUser.email,
                  });
                  toast.success(result.message);
                } catch (error) {
                  toast.error(
                    error instanceof Error ? error.message : "Unable to send password reset email.",
                  );
                } finally {
                  setIsResetEmailPending(false);
                }
              }}
              className="rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isResetEmailPending ? "Sending..." : "Send Reset Email"}
            </button>
          </div>
        </div>
        <form
          className="grid gap-4 px-6 py-6 md:grid-cols-3"
          onSubmit={async (event) => {
            event.preventDefault();

            try {
              const result = await changePasswordMutation.mutateAsync(passwordForm);
              toast.success(result.message);
              setPasswordForm({
                currentPassword: "",
                newPassword: "",
                confirmPassword: "",
              });
              setIsPasswordDialogOpen(false);
              navigate(APP_ROUTES.auth, {
                replace: true,
                search: { mode: "staff" },
              });
            } catch (error) {
              toast.error(error instanceof Error ? error.message : "Unable to change password.");
            }
          }}
        >
          <PasswordInput
            label="Current Password"
            value={passwordForm.currentPassword}
            onChange={(currentPassword) =>
              setPasswordForm((current) => ({ ...current, currentPassword }))
            }
          />
          <PasswordInput
            label="New Password"
            value={passwordForm.newPassword}
            onChange={(newPassword) => setPasswordForm((current) => ({ ...current, newPassword }))}
          />
          <PasswordInput
            label="Confirm Password"
            value={passwordForm.confirmPassword}
            onChange={(confirmPassword) =>
              setPasswordForm((current) => ({ ...current, confirmPassword }))
            }
          />
          <div className="md:col-span-3">
            <button type="submit" disabled={changePasswordMutation.isPending} className="btn-gold">
              {changePasswordMutation.isPending ? "Updating..." : "Change Password"}
            </button>
          </div>
        </form>
      </AppDialog>
      {currentUserQuery.isFetching ? <LoadingOverlay label="Refreshing profile..." /> : null}
    </section>
  );
}

export function DashboardProfileRedirect() {
  const navigate = useAppNavigate();
  const { data: currentUser, isLoading } = useCurrentUser();

  useEffect(() => {
    if (isLoading) {
      return;
    }

    if (!currentUser) {
      navigate(APP_ROUTES.auth, {
        replace: true,
        search: { redirect: APP_ROUTES.dashboardProfile, mode: "staff" },
      });
      return;
    }

    navigate(
      currentUser.role === "admin"
        ? APP_ROUTES.dashboardAdminProfile
        : APP_ROUTES.dashboardStaffProfile,
      { replace: true },
    );
  }, [currentUser, isLoading, navigate]);

  return null;
}

function describeUserAgent(userAgent: string | null) {
  return userAgent?.trim() || "Unknown device";
}

function summarizeUserAgent(userAgent: string | null) {
  const value = userAgent?.trim();

  if (!value) {
    return "Unknown device";
  }

  const browser = /Edg\//.test(value)
    ? "Edge"
    : /Chrome\//.test(value)
      ? "Chrome"
      : /Firefox\//.test(value)
        ? "Firefox"
        : /Safari\//.test(value) && !/Chrome\//.test(value)
          ? "Safari"
          : /MSIE|Trident/.test(value)
            ? "Internet Explorer"
            : "Browser";

  const platform = /Android/.test(value)
    ? "Android"
    : /iPhone|iPad|iPod/.test(value)
      ? "iOS"
      : /Windows/.test(value)
        ? "Windows"
        : /Mac OS X|Macintosh/.test(value)
          ? "macOS"
          : /Linux/.test(value)
            ? "Linux"
            : "Unknown";

  return `${browser} on ${platform}`;
}

function formatSessionTime(value: string) {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return date.toLocaleString();
}

function ProfileSection({
  title,
  items,
}: {
  title: string;
  items: Array<{
    label: string;
    value: string;
    icon: typeof UserRound;
    mono?: boolean;
  }>;
}) {
  return (
    <div>
      <h3 className="text-[2rem] font-display font-extrabold text-slate-950">{title}</h3>
      <div className="mt-5 grid gap-x-10 gap-y-6 md:grid-cols-2">
        {items.map((item) => {
          const Icon = item.icon;

          return (
            <div key={item.label} className="border-b border-slate-100 pb-4">
              <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
                <Icon className="h-4 w-4 text-gold" />
                {item.label}
              </div>
              <p
                className={`mt-3 text-sm text-slate-800 ${item.mono ? "break-all font-mono" : ""}`}
              >
                {item.value}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function PasswordInput({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <label className="block">
      <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
        {label}
      </span>
      <div className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
        <LockKeyhole className="h-4 w-4 text-slate-400" />
        <input
          type="password"
          value={value}
          onChange={(event) => onChange(event.target.value)}
          className="w-full bg-transparent text-sm text-slate-900 outline-none"
          required
        />
      </div>
    </label>
  );
}

function SessionDetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="border-b border-slate-200 pb-4 last:border-b-0 last:pb-0">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between sm:gap-6">
        <div className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
          {label}
        </div>
        <div className="break-words text-sm font-semibold text-slate-900 sm:max-w-[65%] sm:text-right">
          {value}
        </div>
      </div>
    </div>
  );
}
