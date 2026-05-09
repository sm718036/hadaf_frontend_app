import { Link, useLocation } from "@tanstack/react-router";
import { Menu } from "lucide-react";
import { BrandLogo } from "@/components/BrandLogo";
import { APP_ROUTES } from "@/config/routes";
import { STATIC_HEADER_LINKS } from "@/content/landing-static";
import type { SiteContent } from "@/features/site-content/site-content.schemas";
import { resolveSectionHref } from "@/lib/content-assets";

type HeaderProps = {
  branding: SiteContent["branding"];
  contactDetails: SiteContent["contact"]["details"];
};

export function Header({ branding, contactDetails }: HeaderProps) {
  const location = useLocation();
  const isHome = location.pathname === "/";
  const visibleDetails = contactDetails.filter((detail) => detail.isVisible);
  const address = visibleDetails.find((detail) => detail.icon === "map-pin");
  const email = visibleDetails.find((detail) => detail.icon === "mail");
  const phone = visibleDetails.find((detail) => detail.icon === "phone");

  return (
    <header className="absolute left-0 right-0 top-0 z-30">
      <div className="hidden bg-dark text-xs text-white/80 md:block">
        <div className="site-shell flex justify-between py-2">
          <span>{address ? `Address: ${address.value}` : ""}</span>
          <span>
            {email ? `Email: ${email.value}` : ""}
            {email && phone ? " | " : ""}
            {phone ? `Phone: ${phone.value}` : ""}
          </span>
        </div>
      </div>
      <nav className="bg-white/95 backdrop-blur">
        <div className="site-shell flex items-center justify-between py-4">
          <BrandLogo
            brandName={branding.companyName}
            companyNameVisible={branding.companyNameVisible}
            logoSrc={branding.logo.src}
            logoAlt={branding.logo.alt}
            logoVisible={branding.logoVisible}
            imageClassName="h-10 sm:h-11"
            priority
          />
          <ul className="hidden items-center gap-8 font-medium text-dark lg:flex">
            {STATIC_HEADER_LINKS.map((link) => (
              <li key={link.label}>
                <a
                  href={resolveSectionHref(link.href, isHome)}
                  className="transition-colors hover:text-gold"
                >
                  {link.label}
                </a>
              </li>
            ))}
          </ul>
          <div className="flex items-center gap-3">
            <Link
              to={APP_ROUTES.auth}
              search={{ redirect: undefined, mode: "client" }}
              className="hidden text-sm font-semibold text-dark hover:text-gold md:inline-flex"
            >
              Login
            </Link>
            <a
              href={resolveSectionHref("#contact", isHome)}
              className="btn-gold !px-5 !py-3 text-sm"
            >
              Book a Free Consultation
            </a>
            <button className="lg:hidden">
              <Menu className="text-dark" />
            </button>
          </div>
        </div>
      </nav>
    </header>
  );
}
