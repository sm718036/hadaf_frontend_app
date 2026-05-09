import { Link, useLocation, useNavigate } from "@tanstack/react-router";
import { ChevronDown, LogOut, Menu, UserCircle2 } from "lucide-react";
import type { ReactNode } from "react";
import { useMemo, useState } from "react";
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
import { getAvatarDataUrl, getUserInitials, getUserAvatarUrl } from "@/features/dashboard/profile-utils";

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

  return <span className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold capitalize ${className}`}>{children}</span>;
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

function Sidebar({
  area,
  navItems,
}: {
  area: DashboardArea;
  navItems: DashboardNavItem[];
}) {
  const location = useLocation();
  const meta = AREA_META[area];

  return (
    <aside className="hidden w-[270px] shrink-0 rounded-[28px] bg-dark px-5 py-6 text-white shadow-2xl lg:flex lg:flex-col">
      <Link to={APP_ROUTES.home} className="flex items-center gap-3 px-2">
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gold text-dark font-display text-xl font-extrabold">
          H
        </div>
        <div>
          <div className="text-2xl font-display font-extrabold text-white">
            Hadaf<span className="text-gold">.</span>
          </div>
          <div className="text-xs uppercase tracking-[0.28em] text-white/45">{meta.accentLabel}</div>
        </div>
      </Link>

      <nav className="mt-8 space-y-2">
        <p className="px-3 text-xs font-semibold uppercase tracking-[0.3em] text-white/40">Modules</p>
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
  const navigate = useNavigate();
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
      navigate({
        to: APP_ROUTES.auth,
        search:
          area === "client"
            ? { mode: "client", redirect: undefined }
            : { mode: undefined, redirect: undefined },
      });
    }
  };

  return (
    <header className="sticky top-4 z-20 rounded-[28px] border border-slate-200 bg-white px-5 py-4 shadow-sm xl:px-7">
      <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-400">{meta.eyebrow}</div>
            <h1 className="mt-2 text-3xl font-display font-extrabold text-slate-950">{pageTitle}</h1>
          </div>

          <div className="lg:hidden">
            <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
              <SheetTrigger asChild>
                <button type="button" className="inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-slate-200 bg-slate-50 text-slate-600">
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
              <button type="button" className="inline-flex items-center gap-3 rounded-2xl px-3 py-2.5 text-left transition hover:bg-slate-50">
                <Avatar className="h-12 w-12">
                  <AvatarImage src={avatarUrl} alt={actor.name} />
                  <AvatarFallback className="bg-gold text-sm font-bold text-dark">{initials}</AvatarFallback>
                </Avatar>
                <div className="min-w-0">
                  <p className="truncate font-semibold text-slate-900">{actor.name}</p>
                  <p className="truncate text-sm text-slate-500">{actor.email}</p>
                </div>
                <ChevronDown className="h-4 w-4 text-slate-500" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-72 rounded-2xl border-slate-200 p-2">
              <DropdownMenuItem className="rounded-xl px-3 py-3 text-sm" onClick={() => navigate({ to: profileRoute })}>
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
