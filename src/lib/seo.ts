import { APP_ROUTES } from "@/config/routes";
import type { SiteContent } from "@/features/site-content/site-content.schemas";

const DEFAULT_SITE_URL = "https://hadafconsultants.com";
const DEFAULT_SITE_NAME = "Hadaf Consultants";
const DEFAULT_OG_IMAGE = "/og-image.jpg";
const TITLE_SEPARATOR = " | ";

const HOME_TITLE = "Hadaf Consultants | Visa, Immigration and Study Abroad Guidance";
const HOME_DESCRIPTION =
  "Hadaf Consultants helps students, visitors, and families with study abroad planning, visa applications, immigration guidance, interview preparation, and document support.";
const HOME_KEYWORDS = [
  "Hadaf Consultants",
  "visa consultants",
  "immigration consultants",
  "study visa consultancy",
  "visit visa services",
  "study abroad consultants",
  "student visa consultants Pakistan",
  "UK visa consultants",
  "Europe visa consultants",
  "USA student visa consultants",
];

type RouteSeoDefinition = {
  title: string;
  description: string;
  robots?: string;
};

export type SeoPayload = {
  title: string;
  description: string;
  canonicalPath: string;
  robots: string;
  keywords?: string[];
  openGraphType?: "website" | "article";
};

export function getSiteUrl() {
  const configuredSiteUrl = import.meta.env.VITE_SITE_URL?.trim();
  const siteUrl =
    configuredSiteUrl ||
    (typeof window !== "undefined" && window.location.origin !== "null"
      ? window.location.origin
      : DEFAULT_SITE_URL);

  return siteUrl.replace(/\/$/, "");
}

export function getSiteName() {
  return DEFAULT_SITE_NAME;
}

export function getDefaultOgImageUrl() {
  return `${getSiteUrl()}${DEFAULT_OG_IMAGE}`;
}

export function getHomeSeoPayload(): SeoPayload {
  return {
    title: HOME_TITLE,
    description: HOME_DESCRIPTION,
    canonicalPath: APP_ROUTES.home,
    robots: "index,follow,max-image-preview:large,max-snippet:-1,max-video-preview:-1",
    keywords: HOME_KEYWORDS,
    openGraphType: "website",
  };
}

const PRIVATE_ROUTE_SEO: RouteSeoDefinition = {
  title: "Hadaf Consultants",
  description: "Secure Hadaf Consultants account area.",
  robots: "noindex,nofollow,noarchive,nosnippet",
};

export function getRouteSeoPayload(pathname: string): SeoPayload {
  if (pathname === APP_ROUTES.home) {
    return getHomeSeoPayload();
  }

  if (pathname === APP_ROUTES.auth) {
    return {
      title: `Sign In${TITLE_SEPARATOR}${getSiteName()}`,
      description:
        "Sign in to access your Hadaf Consultants account, application progress, and internal workflow tools.",
      canonicalPath: APP_ROUTES.auth,
      robots: "noindex,nofollow,noarchive,nosnippet",
    };
  }

  if (
    pathname.startsWith(APP_ROUTES.dashboard) ||
    pathname === APP_ROUTES.clientPortal ||
    pathname === APP_ROUTES.dashboardClients ||
    pathname === APP_ROUTES.dashboardContent ||
    pathname === APP_ROUTES.dashboardProfile ||
    pathname === APP_ROUTES.dashboardUsers
  ) {
    return {
      ...PRIVATE_ROUTE_SEO,
      title: `Dashboard${TITLE_SEPARATOR}${getSiteName()}`,
      canonicalPath: pathname,
      robots: PRIVATE_ROUTE_SEO.robots || "noindex,nofollow,noarchive,nosnippet",
    };
  }

  return {
    title: `Page Not Found${TITLE_SEPARATOR}${getSiteName()}`,
    description: "The requested Hadaf Consultants page could not be found.",
    canonicalPath: pathname,
    robots: "noindex,follow",
  };
}

function buildAbsoluteUrl(pathOrUrl: string) {
  if (/^https?:\/\//i.test(pathOrUrl)) {
    return pathOrUrl;
  }

  const normalizedPath = pathOrUrl.startsWith("/") ? pathOrUrl : `/${pathOrUrl}`;
  return `${getSiteUrl()}${normalizedPath}`;
}

function extractContactDetail(
  details: SiteContent["contact"]["details"],
  icon: "phone" | "mail" | "map-pin",
) {
  return details.find((detail) => detail.isVisible && detail.icon === icon);
}

function formatOpeningHours(hours: SiteContent["workingHours"]["items"]) {
  return hours
    .filter((item) => item.isVisible && item.time.toLowerCase() !== "closed")
    .map((item) => {
      const day = item.day.toLowerCase();

      if (day.includes("monday") && day.includes("saturday")) {
        return "Mo-Sa 10:00-19:00";
      }

      return item.day;
    });
}

export function buildHomeStructuredData(content: SiteContent) {
  const phone = extractContactDetail(content.contact.details, "phone");
  const email = extractContactDetail(content.contact.details, "mail");
  const address = extractContactDetail(content.contact.details, "map-pin");
  const visibleServices = content.services.items.filter((item) => item.isVisible);
  const visibleFaqs = content.faq.items.filter((item) => item.isVisible);
  const visibleCountries = content.countries.items.filter((item) => item.isVisible);
  const siteUrl = getSiteUrl();
  const orgName = content.branding.companyName || getSiteName();
  const sameAs = email ? [email.href] : [];

  return [
    {
      "@context": "https://schema.org",
      "@type": "Organization",
      "@id": `${siteUrl}/#organization`,
      name: orgName,
      url: siteUrl,
      logo: buildAbsoluteUrl(
        content.branding.logo.src === "logo" ? "/logo.png" : content.branding.logo.src,
      ),
      email: email?.value,
      telephone: phone?.value,
      sameAs,
    },
    {
      "@context": "https://schema.org",
      "@type": "ProfessionalService",
      "@id": `${siteUrl}/#business`,
      name: orgName,
      url: siteUrl,
      image: getDefaultOgImageUrl(),
      telephone: phone?.value,
      email: email?.value,
      address: address?.value
        ? {
            "@type": "PostalAddress",
            streetAddress: address.value,
            addressLocality: "Islamabad",
            addressCountry: "PK",
          }
        : undefined,
      areaServed: visibleCountries.map((country) => country.name),
      openingHours: formatOpeningHours(content.workingHours.items),
      priceRange: "$$",
      serviceType: visibleServices.map((service) => service.title),
    },
    {
      "@context": "https://schema.org",
      "@type": "WebSite",
      "@id": `${siteUrl}/#website`,
      url: siteUrl,
      name: orgName,
      description: HOME_DESCRIPTION,
      inLanguage: "en",
    },
    {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      "@id": `${siteUrl}/#faq`,
      mainEntity: visibleFaqs.map((faq) => ({
        "@type": "Question",
        name: faq.question,
        acceptedAnswer: {
          "@type": "Answer",
          text: faq.answer,
        },
      })),
    },
    ...visibleServices.map((service) => ({
      "@context": "https://schema.org",
      "@type": "Service",
      "@id": `${siteUrl}/#service-${service.id}`,
      serviceType: service.title,
      name: service.title,
      description: service.description,
      provider: {
        "@id": `${siteUrl}/#business`,
      },
      areaServed: visibleCountries.map((country) => country.name),
    })),
  ];
}

export function applySeoTags(payload: SeoPayload) {
  document.title = payload.title;

  const absoluteCanonical = buildAbsoluteUrl(payload.canonicalPath);
  const metaDefinitions: Array<{ name?: string; property?: string; content: string }> = [
    { name: "description", content: payload.description },
    { name: "robots", content: payload.robots },
    { name: "keywords", content: payload.keywords?.join(", ") || "" },
    { property: "og:type", content: payload.openGraphType || "website" },
    { property: "og:title", content: payload.title },
    { property: "og:description", content: payload.description },
    { property: "og:url", content: absoluteCanonical },
    { property: "og:site_name", content: getSiteName() },
    { property: "og:image", content: getDefaultOgImageUrl() },
    { property: "og:locale", content: "en_US" },
    { name: "twitter:card", content: "summary_large_image" },
    { name: "twitter:title", content: payload.title },
    { name: "twitter:description", content: payload.description },
    { name: "twitter:image", content: getDefaultOgImageUrl() },
  ];

  for (const definition of metaDefinitions) {
    if (!definition.content) {
      continue;
    }

    const selector = definition.name
      ? `meta[name="${definition.name}"]`
      : `meta[property="${definition.property}"]`;
    let meta = document.head.querySelector<HTMLMetaElement>(selector);

    if (!meta) {
      meta = document.createElement("meta");

      if (definition.name) {
        meta.name = definition.name;
      }

      if (definition.property) {
        meta.setAttribute("property", definition.property);
      }

      document.head.append(meta);
    }

    meta.content = definition.content;
  }

  let canonicalLink = document.head.querySelector<HTMLLinkElement>('link[rel="canonical"]');

  if (!canonicalLink) {
    canonicalLink = document.createElement("link");
    canonicalLink.rel = "canonical";
    document.head.append(canonicalLink);
  }

  canonicalLink.href = absoluteCanonical;
}
