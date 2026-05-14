import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Menu, X } from "lucide-react";
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
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
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
        <div className="site-shell flex items-center justify-between gap-3 py-4">
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
              className="hidden text-sm font-semibold text-dark hover:text-gold md:inline-flex"
            >
              Login
            </Link>
            <a
              href={resolveSectionHref("#contact", isHome)}
              className="btn-gold hidden !px-5 !py-3 text-sm sm:inline-flex"
            >
              Book a Free Consultation
            </a>
            <button
              type="button"
              className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-border text-dark lg:hidden"
              aria-label={isMobileMenuOpen ? "Close menu" : "Open menu"}
              aria-expanded={isMobileMenuOpen}
              onClick={() => setIsMobileMenuOpen((current) => !current)}
            >
              {isMobileMenuOpen ? <X className="text-dark" /> : <Menu className="text-dark" />}
            </button>
          </div>
        </div>
        {isMobileMenuOpen ? (
          <div className="border-t border-border/70 bg-white lg:hidden">
            <div className="site-shell py-4">
              <ul className="flex flex-col gap-4 font-medium text-dark">
                {STATIC_HEADER_LINKS.map((link) => (
                  <li key={link.label}>
                    <a
                      href={resolveSectionHref(link.href, isHome)}
                      className="block py-1 transition-colors hover:text-gold"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
              <div className="mt-5 flex flex-col gap-3">
                <Link
                  to={APP_ROUTES.auth}
                  className="text-sm font-semibold text-dark hover:text-gold"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Login
                </Link>
                <a
                  href={resolveSectionHref("#contact", isHome)}
                  className="btn-gold !justify-center text-sm"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Book a Free Consultation
                </a>
              </div>
            </div>
          </div>
        ) : null}
      </nav>
    </header>
  );
}
