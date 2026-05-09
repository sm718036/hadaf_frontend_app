export const STATIC_HEADER_LINKS = [
  { label: "Home", href: "/" },
  { label: "About", href: "/#about" },
  { label: "Countries", href: "#countries" },
  { label: "Services", href: "#services" },
  { label: "Team", href: "#team" },
  { label: "Contact", href: "#contact" },
] as const;

export const STATIC_HERO_STATS = [
  { value: "Europe", label: "Study visas and Schengen visit routes." },
  { value: "UK", label: "Student, visitor, and family guidance." },
  { value: "USA", label: "F-1, B-1/B-2, and J-1 support." },
] as const;

export const STATIC_ABOUT_CONTENT = {
  eyebrow: "About Hadaf Consultants",
  title: "We help ambition meet",
  accentText: "opportunity",
  description:
    "Hadaf Consultants is a premier visa and immigration consultancy based in Pakistan, dedicated to helping individuals and families pursue their goals of studying, traveling, and building futures abroad. The word Hadaf means goal or aim, and that is exactly what we help our clients achieve.\n\nOur purpose is to bridge the gap between ambition and opportunity. Whether you are a student aspiring to attend an international university, a professional seeking new horizons, or a family planning to visit loved ones overseas, we provide end-to-end support backed by experience, integrity, and a deep understanding of global immigration processes.\n\nAt Hadaf, we do not just process applications. We build journeys.",
  experienceTitle: "What Hadaf Means",
  experienceValue: "Hadaf",
  experienceLabel: "goal or aim",
  features: [
    {
      icon: "globe",
      title: "Bridge Between Ambition and Opportunity",
      description:
        "Every case is handled with a clear plan designed to move clients from intention to action.",
    },
    {
      icon: "graduation-cap",
      title: "Support for Students, Professionals, and Families",
      description:
        "We tailor each pathway around the applicant's goals, budget, and destination requirements.",
    },
    {
      icon: "shield-check",
      title: "Journeys Built With Integrity",
      description:
        "Transparent advice, careful preparation, and realistic guidance define every Hadaf case.",
    },
  ],
} as const;

export const STATIC_PROCESS_CONTENT = {
  eyebrow: "Why Choose Hadaf?",
  title: "The right consultant changes the outcome.",
  description:
    "Choosing the right consultant can make the difference between a stronger application and a missed opportunity. Clients trust Hadaf for honest advice, tailored planning, and careful execution at every step.",
  cards: [
    {
      icon: "handshake",
      title: "Proven Track Record",
      description: "Strong outcomes across study, visit, and immigration applications.",
    },
    {
      icon: "briefcase",
      title: "Transparent Process",
      description: "No hidden fees and no false promises, only clear guidance.",
    },
    {
      icon: "globe-2",
      title: "Expert Team",
      description: "Qualified consultants with hands-on international case experience.",
    },
    {
      icon: "handshake",
      title: "Personalized Approach",
      description: "Advice tailored to each profile, destination, and budget.",
    },
    {
      icon: "briefcase",
      title: "End-to-End Support",
      description: "From SOPs and file prep to interviews and post-visa steps.",
    },
    {
      icon: "globe-2",
      title: "Global Reach",
      description: "Up-to-date understanding of Europe, UK, and USA pathways.",
    },
  ],
  notePrefix: "Client-first values:",
  noteHighlight: "your success is our success",
  noteSuffix: ", and every case is treated with the care it deserves.",
  buttonLabel: "Book a Free Consultation",
  buttonHref: "#contact",
  mainImage: {
    src: "about-student",
    alt: "Consultant guiding a client through an international application",
  },
  panelImage: { src: "contact-agent", alt: "Consultation and visa paperwork review" },
  panelText:
    "When you work with Hadaf, you are not just hiring a consultant. You are gaining a trusted partner.",
} as const;

export const STATIC_CONTACT_FORM = {
  placeholders: {
    name: "Your Name *",
    phone: "Phone / WhatsApp *",
    email: "Your Email *",
    comments: "Tell us about your plan *",
    selectDefault: "Select Service",
  },
  submitLabel: "Book a Free Consultation",
  image: { src: "contact-agent", alt: "Hadaf consultant supporting a client" },
} as const;

export const STATIC_FOOTER_CONTENT = {
  backgroundImage: { src: "about-student", alt: "Hadaf Consultants footer background" },
  description:
    "Trusted visa and immigration consultants helping clients study, visit, and settle abroad with structured guidance and transparent support.",
  quickLinks: [
    { label: "About Hadaf", href: "/#about" },
    { label: "Our Services", href: "#services" },
    { label: "Countries", href: "#countries" },
    { label: "Our Team", href: "#team" },
    { label: "FAQs", href: "#faq" },
    { label: "Contact", href: "#contact" },
  ],
  socialLinks: [
    { platform: "facebook", href: "#" },
    { platform: "twitter", href: "#" },
    { platform: "linkedin", href: "#" },
    { platform: "instagram", href: "#" },
  ],
  bottomLinks: [
    { label: "Services", href: "#services" },
    { label: "FAQs", href: "#faq" },
    { label: "Contact Us", href: "#contact" },
  ],
} as const;
