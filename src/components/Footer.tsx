import { useLocation } from "react-router-dom";
import { Facebook, Instagram, Linkedin, Mail, MapPin, Phone, Twitter } from "lucide-react";
import { BrandLogo } from "@/components/BrandLogo";
import { STATIC_FOOTER_CONTENT } from "@/content/landing-static";
import { Reveal } from "@/components/reveal";
import type { SiteContent } from "@/features/site-content/site-content.schemas";
import { resolveContentImage, resolveSectionHref } from "@/lib/content-assets";

const socialIcons = {
  facebook: Facebook,
  twitter: Twitter,
  linkedin: Linkedin,
  instagram: Instagram,
} as const;

const contactIcons = {
  phone: Phone,
  mail: Mail,
  "map-pin": MapPin,
} as const;

type FooterProps = {
  branding: SiteContent["branding"];
  contactDetails: SiteContent["contact"]["details"];
  workingHours: SiteContent["workingHours"];
};

export function Footer({ branding, contactDetails, workingHours }: FooterProps) {
  const location = useLocation();
  const isHome = location.pathname === "/";
  const visibleDetails = contactDetails.filter((item) => item.isVisible);
  const visibleHours = workingHours.items.filter((item) => item.isVisible);

  return (
    <footer className="footer-shell relative overflow-hidden text-white">
      <div className="absolute inset-0">
        <img
          src={resolveContentImage(STATIC_FOOTER_CONTENT.backgroundImage.src)}
          alt={STATIC_FOOTER_CONTENT.backgroundImage.alt}
          className="h-full w-full object-cover"
          loading="lazy"
          decoding="async"
          width={1600}
          height={900}
        />
        <div className="absolute inset-0 bg-dark/92" />
      </div>

      <div className="site-shell relative z-10 pt-12 sm:pt-14">
        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {visibleDetails.map((item) => {
            const Icon = contactIcons[item.icon];

            return (
              <Reveal
                key={item.id}
                className="bg-white px-5 py-4 text-foreground shadow-[0_12px_26px_rgba(7,10,24,0.18)]"
              >
                <div className="footer-contact-card flex items-center gap-4 border border-dashed border-primary/35 px-5 py-5">
                  <Icon className="h-9 w-9 shrink-0 text-primary" strokeWidth={1.8} />
                  <div className="h-8 w-px bg-brand-line" />
                  <div>
                    <h3 className="font-display text-[1.15rem] font-extrabold leading-tight text-foreground">
                      {item.label}
                    </h3>
                    <p className="mt-1 text-[13px] text-muted-foreground">{item.value}</p>
                  </div>
                </div>
              </Reveal>
            );
          })}
        </div>

        <div className="grid gap-10 pb-12 pt-14 md:grid-cols-2 xl:grid-cols-[1.2fr_0.8fr_1fr] xl:pt-16">
          <Reveal>
            <BrandLogo
              brandName={branding.companyName}
              companyNameVisible={branding.companyNameVisible}
              logoSrc={branding.logo.src}
              logoAlt={branding.logo.alt}
              logoVisible={branding.logoVisible}
              imageClassName="h-14 sm:h-16"
            />
            <p className="mt-6 max-w-[320px] text-[15px] leading-8 text-white/72">
              {STATIC_FOOTER_CONTENT.description}
            </p>
            <div className="mt-6 flex items-center gap-3">
              {STATIC_FOOTER_CONTENT.socialLinks.map((social) => {
                const Icon = socialIcons[social.platform];

                return (
                  <a
                    key={social.platform}
                    href={social.href}
                    className="flex h-9 w-9 items-center justify-center rounded-full border border-white/45 text-white transition-colors hover:border-primary hover:bg-primary hover:text-dark"
                    aria-label={`${social.platform} link`}
                  >
                    <Icon className="h-4 w-4" />
                  </a>
                );
              })}
            </div>
          </Reveal>

          <Reveal delay={80}>
            <h3 className="font-display text-[1.8rem] font-extrabold">Quick Link</h3>
            <ul className="mt-6 space-y-3 text-[15px] text-white/78">
              {STATIC_FOOTER_CONTENT.quickLinks.map((link) => (
                <li key={link.label}>
                  <a
                    href={resolveSectionHref(link.href, isHome)}
                    className="transition-colors hover:text-primary"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </Reveal>

          <Reveal delay={140}>
            <h3 className="font-display text-[1.8rem] font-extrabold">{workingHours.title}</h3>
            <div className="mt-6 space-y-4">
              {visibleHours.map((item) => (
                <div
                  key={item.id}
                  className="flex items-start justify-between gap-4 border-b border-white/10 pb-4 text-[15px]"
                >
                  <span className="text-white/82">{item.day}</span>
                  <span className="text-right text-white">{item.time}</span>
                </div>
              ))}
            </div>
          </Reveal>
        </div>

        <div className="footer-bottom-bar flex flex-col gap-4 py-6 text-[14px] md:flex-row md:items-center md:justify-between">
          <p className="text-center md:text-left">
            Copyright {new Date().getFullYear()} {branding.companyName}.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-4 md:justify-end md:gap-6">
            {STATIC_FOOTER_CONTENT.bottomLinks.map((link) => (
              <a
                key={link.label}
                href={resolveSectionHref(link.href, isHome)}
                className="transition-colors hover:text-white"
              >
                {link.label}
              </a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
