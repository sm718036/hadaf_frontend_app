import type { SessionUser } from "@/features/auth/auth.service";
import { resolveContentImage } from "@/lib/content-assets";

export function getUserInitials(name: string) {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");
}

export function getAvatarDataUrl(name: string) {
  const initials = getUserInitials(name) || "HU";
  const safeInitials = initials.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="96" height="96" viewBox="0 0 96 96">
      <rect width="96" height="96" rx="48" fill="#fbb040" />
      <text x="48" y="56" text-anchor="middle" font-family="Arial, sans-serif" font-size="28" font-weight="700" fill="#022816">
        ${safeInitials}
      </text>
    </svg>
  `;

  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}

export function getUserAvatarUrl(user: Pick<SessionUser, "name" | "avatarUrl">) {
  return user.avatarUrl ? resolveContentImage(user.avatarUrl) : getAvatarDataUrl(user.name);
}

export function buildUserProfileData(user: SessionUser) {
  const [firstName = user.name, ...rest] = user.name.trim().split(/\s+/);
  const lastName = rest.join(" ") || "Not provided";

  return {
    firstName,
    lastName,
    roleLabel: user.role === "admin" ? "Administrator" : "Staff Member",
    bio:
      user.role === "admin"
        ? "Leads dashboard operations, user access control, and Hadaf content management."
        : "Supports day-to-day dashboard operations with permission-based access.",
    phone: "Not provided",
    country: "Pakistan",
    cityState: "Islamabad, Pakistan",
    postalCode: "Not provided",
    taxId: user.id.slice(0, 12).toUpperCase(),
    joinedOn: new Date(user.createdAt).toLocaleDateString(),
  };
}
