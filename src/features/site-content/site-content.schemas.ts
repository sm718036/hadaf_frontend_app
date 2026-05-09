import { z } from "zod";

const imageSchema = z.object({
  src: z.string(),
  alt: z.string(),
});

const serviceIconSchema = z.enum([
  "graduation-cap",
  "plane",
  "briefcase-business",
  "file-text",
  "message-square-text",
  "folder-check",
  "languages",
  "shield-check",
]);

const heroBannerSchema = z.object({
  id: z.string(),
  title: z.string(),
  subtitle: z.string(),
  image: imageSchema,
  linkLabel: z.string(),
  linkHref: z.string(),
  isVisible: z.boolean(),
});

const offerSchema = z.object({
  id: z.string(),
  tag: z.string(),
  title: z.string(),
  description: z.string(),
  image: imageSchema,
  buttonLabel: z.string(),
  buttonHref: z.string(),
  isVisible: z.boolean(),
});

const serviceSchema = z.object({
  id: z.string(),
  icon: serviceIconSchema.default("briefcase-business"),
  flag: z.string(),
  title: z.string(),
  description: z.string(),
  isVisible: z.boolean(),
});

const countrySchema = z.object({
  id: z.string(),
  name: z.string(),
  flagClassName: z.string(),
  description: z.string(),
  points: z.array(z.string()),
  buttonLabel: z.string(),
  buttonHref: z.string(),
  isVisible: z.boolean(),
});

const teamMemberSchema = z.object({
  id: z.string(),
  name: z.string(),
  role: z.string(),
  isVisible: z.boolean(),
});

const faqSchema = z.object({
  id: z.string(),
  question: z.string(),
  answer: z.string(),
  isVisible: z.boolean(),
});

const contactDetailSchema = z.object({
  id: z.string(),
  icon: z.enum(["phone", "mail", "map-pin"]),
  label: z.string(),
  value: z.string(),
  href: z.string(),
  isVisible: z.boolean(),
});

const workingHourSchema = z.object({
  id: z.string(),
  day: z.string(),
  time: z.string(),
  isVisible: z.boolean(),
});

export const siteContentSchema = z.object({
  branding: z.object({
    companyName: z.string(),
    companyNameVisible: z.boolean(),
    logo: imageSchema,
    logoVisible: z.boolean(),
  }),
  hero: z.object({
    isVisible: z.boolean(),
    eyebrow: z.string(),
    title: z.string(),
    accentText: z.string(),
    description: z.string(),
    primaryButtonLabel: z.string(),
    primaryButtonHref: z.string(),
    secondaryButtonLabel: z.string(),
    secondaryButtonHref: z.string(),
    banners: z.array(heroBannerSchema),
  }),
  offers: z.object({
    isVisible: z.boolean(),
    eyebrow: z.string(),
    title: z.string(),
    description: z.string(),
    items: z.array(offerSchema),
  }),
  services: z.object({
    isVisible: z.boolean(),
    eyebrow: z.string(),
    title: z.string(),
    description: z.string(),
    items: z.array(serviceSchema),
  }),
  countries: z.object({
    isVisible: z.boolean(),
    eyebrow: z.string(),
    title: z.string(),
    description: z.string(),
    itemLabel: z.string(),
    items: z.array(countrySchema),
  }),
  team: z.object({
    isVisible: z.boolean(),
    eyebrow: z.string(),
    title: z.string(),
    description: z.string(),
    members: z.array(teamMemberSchema),
  }),
  faq: z.object({
    isVisible: z.boolean(),
    eyebrow: z.string(),
    title: z.string(),
    description: z.string(),
    items: z.array(faqSchema),
  }),
  contact: z.object({
    isVisible: z.boolean(),
    eyebrow: z.string(),
    title: z.string(),
    description: z.string(),
    details: z.array(contactDetailSchema),
  }),
  workingHours: z.object({
    title: z.string(),
    items: z.array(workingHourSchema),
  }),
});

export type SiteContent = z.infer<typeof siteContentSchema>;
