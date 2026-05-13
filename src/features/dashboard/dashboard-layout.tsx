import { Link, useLocation } from "react-router-dom";
import { Bell, ChevronDown, LogOut, Menu, UserCircle2 } from "lucide-react";
import type { ReactNode } from "react";
import { useMemo, useState } from "react";
import { BrandLogo } from "@/components/BrandLogo";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { APP_ROUTES } from "@/config/routes";
import type { SessionUser } from "@/features/auth/auth.service";
import { useSignOut } from "@/features/auth/use-auth";
import { useClientSignOut } from "@/features/client-auth/use-client-auth";
import type { DashboardArea, DashboardNavItem } from "@/features/dashboard/access-control";
import { AREA_META, getRoleLabel } from "@/features/dashboard/access-control";
import {
  getAvatarDataUrl,
  getUserInitials,
  getUserAvatarUrl,
} from "@/features/dashboard/profile-utils";
import {
  useClientNotifications,
  useInternalNotifications,
  useMarkAllClientNotificationsRead,
  useMarkAllInternalNotificationsRead,
  useMarkClientNotificationRead,
  useMarkInternalNotificationRead,
} from "@/features/notifications/use-notifications";
import { buildPath, useAppNavigate } from "@/lib/router";
import { useSiteContent } from "@/features/site-content/use-site-content";

type DashboardLayoutActor = {
  id: string;
  name: string;
  email: string;
  avatarUrl: string | null;
  roleLabel: string;
};

export function StatusBadge({
  tone = "neutral",
  children,
}: {
  tone?: "neutral" | "success" | "warning" | "info";
  children: ReactNode;
}) {
  const className =
    tone === "success"
      ? "bg-emerald-50 text-emerald-700"
      : tone === "warning"
        ? "bg-amber-50 text-amber-700"
        : tone === "info"
          ? "bg-sky-50 text-sky-700"
          : "bg-slate-100 text-slate-700";

  return (
    <span
      className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold capitalize ${className}`}
    >
      {children}
    </span>
  );
}

function StatCard({
  title,
  value,
  description,
}: {
  title: string;
  value: string | number;
  description: string;
}) {
  return (
    <div className="rounded-[24px] border border-slate-200 bg-white p-5 shadow-sm">
      <div className="text-sm font-medium text-slate-500">{title}</div>
      <div className="mt-3 text-4xl font-display font-extrabold text-slate-950">{value}</div>
      <div className="mt-4 rounded-2xl bg-slate-50 px-3 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
        {description}
      </div>
    </div>
  );
}

export function DataTable({
  columns,
  rows,
  emptyMessage,
}: {
  columns: string[];
  rows: Array<Array<ReactNode>>;
  emptyMessage: string;
}) {
  return (
    <div className="overflow-hidden rounded-[24px] border border-slate-200">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[720px] text-sm">
          <thead className="bg-slate-900 text-slate-100">
            <tr>
              {columns.map((column) => (
                <th key={column} className="px-5 py-4 text-center font-display font-semibold">
                  {column}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200 bg-white">
            {rows.length === 0 ? (
              <tr>
                <td colSpan={columns.length} className="px-5 py-12 text-center text-slate-500">
                  {emptyMessage}
                </td>
              </tr>
            ) : (
              rows.map((row, rowIndex) => (
                <tr key={rowIndex} className="hover:bg-slate-50/80">
                  {row.map((cell, cellIndex) => (
                    <td key={cellIndex} className="px-5 py-4 text-center text-slate-600">
                      {cell}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function isOverviewRoute(pathname: string) {
  return (
    pathname === APP_ROUTES.dashboardAdmin ||
    pathname === APP_ROUTES.dashboardStaff ||
    pathname === APP_ROUTES.dashboardClient
  );
}

function isNavItemActive(currentPathname: string, itemPath: string) {
  if (isOverviewRoute(itemPath)) {
    return currentPathname === itemPath;
  }

  return currentPathname === itemPath || currentPathname.startsWith(`${itemPath}/`);
}

function Sidebar({ area, navItems }: { area: DashboardArea; navItems: DashboardNavItem[] }) {
  const location = useLocation();
  const meta = AREA_META[area];
  const { data: siteContent } = useSiteContent();
  const branding = siteContent.branding;

  return (
    <aside className="hidden w-[270px] shrink-0 rounded-[28px] bg-dark px-5 py-6 text-white shadow-2xl lg:flex lg:flex-col">
      <div className="px-2">
        <BrandLogo
          href={APP_ROUTES.home}
          brandName={branding.companyName}
          companyNameVisible={branding.companyNameVisible}
          logoSrc={branding.logo.src}
          logoAlt={branding.logo.alt}
          logoVisible={branding.logoVisible}
          imageClassName="h-14 w-auto"
          imgClassName="brightness-0 invert"
          priority
        />
        <div className="mt-3 text-xs uppercase tracking-[0.28em] text-white/45">
          {meta.accentLabel}
        </div>
      </div>

      <nav className="mt-8 space-y-2">
        <p className="px-3 text-xs font-semibold uppercase tracking-[0.3em] text-white/40">
          Modules
        </p>
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = isNavItemActive(location.pathname, item.to);

          return (
            <Link
              key={item.to}
              to={item.to}
              className={`flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-medium transition ${
                isActive
                  ? "bg-gold text-dark shadow-lg"
                  : "text-white/72 hover:bg-white/8 hover:text-white"
              }`}
            >
              <Icon className="h-5 w-5" />
              {item.label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}

function Topbar({
  area,
  navItems,
  actor,
  pageTitle,
}: {
  area: DashboardArea;
  navItems: DashboardNavItem[];
  actor: DashboardLayoutActor;
  pageTitle: string;
}) {
  const navigate = useAppNavigate();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);
  const signOutMutation = useSignOut();
  const clientSignOutMutation = useClientSignOut();
  const initials = getUserInitials(actor.name);
  const avatarUrl = actor.avatarUrl ? getUserAvatarUrl(actor) : getAvatarDataUrl(actor.name);
  const meta = AREA_META[area];
  const profileRoute = useMemo(() => {
    if (area === "admin") return APP_ROUTES.dashboardAdminProfile;
    if (area === "staff") return APP_ROUTES.dashboardStaffProfile;
    return APP_ROUTES.dashboardClientProfile;
  }, [area]);

  const handleLogout = async () => {
    try {
      if (area === "client") {
        await clientSignOutMutation.mutateAsync();
      } else {
        await signOutMutation.mutateAsync();
      }
    } finally {
      navigate(APP_ROUTES.auth, {
        search: area === "client" ? { mode: "client" } : undefined,
      });
    }
  };

  const internalNotificationsQuery = useInternalNotifications(area !== "client");
  const clientNotificationsQuery = useClientNotifications(area === "client");
  const internalMarkReadMutation = useMarkInternalNotificationRead();
  const clientMarkReadMutation = useMarkClientNotificationRead();
  const internalReadAllMutation = useMarkAllInternalNotificationsRead();
  const clientReadAllMutation = useMarkAllClientNotificationsRead();
  const notifications =
    area === "client"
      ? clientNotificationsQuery.data
      : internalNotificationsQuery.data;

  const handleNotificationOpen = async (notification: {
    id: string;
    link: string | null;
    isRead: boolean;
  }) => {
    try {
      if (!notification.isRead) {
        if (area === "client") {
          await clientMarkReadMutation.mutateAsync(notification.id);
        } else {
          await internalMarkReadMutation.mutateAsync(notification.id);
        }
      }
    } finally {
      if (notification.link) {
        navigate(notification.link);
      }
    }
  };

  return (
    <header className="sticky top-4 z-20 rounded-[28px] border border-slate-200 bg-white px-5 py-4 shadow-sm xl:px-7">
      <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-400">
              {meta.eyebrow}
            </div>
            <h1 className="mt-2 text-3xl font-display font-extrabold text-slate-950">
              {pageTitle}
            </h1>
          </div>

          <div className="lg:hidden">
            <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
              <SheetTrigger asChild>
                <button
                  type="button"
                  className="inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-slate-200 bg-slate-50 text-slate-600"
                >
                  <Menu className="h-5 w-5" />
                </button>
              </SheetTrigger>
              <SheetContent side="left" className="w-[290px] border-slate-200 p-0">
                <SheetHeader className="border-b border-slate-200 px-5 py-4 text-left">
                  <SheetTitle className="font-display text-xl font-extrabold text-slate-950">
                    {meta.eyebrow}
                  </SheetTitle>
                </SheetHeader>
                <div className="space-y-2 px-4 py-4">
                  {navItems.map((item) => {
                    const Icon = item.icon;
                    const isActive = isNavItemActive(location.pathname, item.to);

                    return (
                      <Link
                        key={item.to}
                        to={item.to}
                        onClick={() => setMobileOpen(false)}
                        className={`flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-medium transition ${
                          isActive ? "bg-gold text-dark" : "bg-slate-50 text-slate-700"
                        }`}
                      >
                        <Icon className="h-5 w-5" />
                        {item.label}
                      </Link>
                    );
                  })}
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                type="button"
                className="relative inline-flex h-12 w-12 items-center justify-center rounded-2xl border border-slate-200 bg-slate-50 text-slate-700 transition hover:bg-slate-100"
                aria-label="Notifications"
              >
                <Bell className="h-5 w-5" />
                {notifications && notifications.unreadCount > 0 ? (
                  <span className="absolute right-2 top-2 inline-flex min-h-5 min-w-5 items-center justify-center rounded-full bg-gold px-1 text-[11px] font-bold text-dark">
                    {notifications.unreadCount > 9 ? "9+" : notifications.unreadCount}
                  </span>
                ) : null}
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-[360px] rounded-2xl border-slate-200 p-2">
              <div className="flex items-center justify-between px-3 py-2">
                <div>
                  <p className="font-semibold text-slate-900">Notifications</p>
                  <p className="text-xs text-slate-500">
                    {notifications?.unreadCount ?? 0} unread
                  </p>
                </div>
                <button
                  type="button"
                  disabled={!notifications || notifications.unreadCount === 0}
                  onClick={() =>
                    area === "client"
                      ? clientReadAllMutation.mutate()
                      : internalReadAllMutation.mutate()
                  }
                  className="text-xs font-semibold text-sky-700 disabled:text-slate-400"
                >
                  Mark all read
                </button>
              </div>
              <DropdownMenuSeparator />
              <div className="max-h-[360px] space-y-1 overflow-y-auto p-1">
                {notifications?.items.length ? (
                  notifications.items.map((notification) => (
                    <button
                      key={notification.id}
                      type="button"
                      onClick={() => void handleNotificationOpen(notification)}
                      className={`block w-full rounded-xl px-3 py-3 text-left transition hover:bg-slate-50 ${
                        notification.isRead ? "bg-white" : "bg-gold/10"
                      }`}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className="font-semibold text-slate-900">{notification.title}</p>
                          <p className="mt-1 text-sm leading-6 text-slate-600">
                            {notification.body}
                          </p>
                        </div>
                        {!notification.isRead ? (
                          <span className="mt-1 h-2.5 w-2.5 rounded-full bg-gold" />
                        ) : null}
                      </div>
                      <p className="mt-2 text-xs font-medium text-slate-400">
                        {new Date(notification.createdAt).toLocaleString()}
                      </p>
                    </button>
                  ))
                ) : (
                  <div className="px-3 py-8 text-center text-sm text-slate-500">
                    No notifications yet.
                  </div>
                )}
              </div>
            </DropdownMenuContent>
          </DropdownMenu>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                type="button"
                className="inline-flex items-center gap-3 rounded-2xl px-3 py-2.5 text-left transition hover:bg-slate-50"
              >
                <Avatar className="h-12 w-12">
                  <AvatarImage src={avatarUrl} alt={actor.name} />
                  <AvatarFallback className="bg-gold text-sm font-bold text-dark">
                    {initials}
                  </AvatarFallback>
                </Avatar>
                <div className="min-w-0">
                  <p className="truncate font-semibold text-slate-900">{actor.name}</p>
                  <p className="truncate text-sm text-slate-500">{actor.email}</p>
                </div>
                <ChevronDown className="h-4 w-4 text-slate-500" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-72 rounded-2xl border-slate-200 p-2">
              <DropdownMenuItem
                className="rounded-xl px-3 py-3 text-sm"
                onClick={() => navigate(profileRoute)}
              >
                <UserCircle2 className="h-4 w-4 text-slate-500" />
                Profile
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="rounded-xl px-3 py-3 text-sm" onClick={handleLogout}>
                <LogOut className="h-4 w-4 text-slate-500" />
                Sign out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}

export function DashboardLayout({
  area,
  actor,
  navItems,
  pageTitle,
  children,
}: {
  area: DashboardArea;
  actor: DashboardLayoutActor;
  navItems: DashboardNavItem[];
  pageTitle: string;
  children: ReactNode;
}) {
  return (
    <main className="min-h-screen bg-mint/20 text-slate-800">
      <div className="mx-auto flex min-h-screen max-w-[1600px] gap-6 px-4 py-4 lg:px-6">
        <Sidebar area={area} navItems={navItems} />
        <div className="min-w-0 flex-1">
          <Topbar area={area} navItems={navItems} actor={actor} pageTitle={pageTitle} />
          <div className="mt-6">{children}</div>
        </div>
      </div>
    </main>
  );
}

export function toInternalLayoutActor(user: SessionUser): DashboardLayoutActor {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    avatarUrl: user.avatarUrl,
    roleLabel: getRoleLabel(user.role),
  };
}

export function toClientLayoutActor(client: {
  id: string;
  name: string;
  email: string;
}): DashboardLayoutActor {
  return {
    id: client.id,
    name: client.name,
    email: client.email,
    avatarUrl: null,
    roleLabel: "Client",
  };
}
