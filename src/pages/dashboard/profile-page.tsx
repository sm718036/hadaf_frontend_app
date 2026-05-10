import { useEffect } from "react";
import { CalendarDays, Mail, MapPin, Phone, ShieldCheck, UserRound } from "lucide-react";
import { toast } from "sonner";
import { APP_ROUTES } from "@/config/routes";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  useCurrentUser,
  useRemoveProfileAvatar,
  useUploadProfileAvatar,
} from "@/features/auth/use-auth";
import { getDefaultInternalDashboardRoute } from "@/features/dashboard/access-control";
import { EmptyHint } from "@/features/dashboard/dashboard-ui";
import {
  buildUserProfileData,
  getUserAvatarUrl,
  getUserInitials,
} from "@/features/dashboard/profile-utils";
import { useAppNavigate } from "@/lib/router";

export function DashboardProfilePage() {
  const currentUserQuery = useCurrentUser();
  const uploadAvatarMutation = useUploadProfileAvatar();
  const removeAvatarMutation = useRemoveProfileAvatar();

  if (currentUserQuery.isLoading) {
    return <EmptyHint message="Loading profile..." loading />;
  }

  if (currentUserQuery.isError || !currentUserQuery.data) {
    return <EmptyHint message="Unable to load the profile." tone="error" />;
  }

  const currentUser = currentUserQuery.data;
  const profile = buildUserProfileData(currentUser);
  const avatarUrl = getUserAvatarUrl(currentUser);
  const initials = getUserInitials(currentUser.name);

  return (
    <section className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm xl:p-8">
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
            { label: "Tax ID", value: profile.taxId, icon: ShieldCheck },
            { label: "User ID", value: currentUser.id, icon: ShieldCheck, mono: true },
          ]}
        />
      </div>
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
