import type { SiteContent } from "@/features/site-content/site-content.schemas";

export const defaultSiteContent: SiteContent = {
  branding: {
    companyName: "Hadaf Consultants",
    companyNameVisible: true,
    logo: {
      src: "logo",
      alt: "Hadaf Consultants logo",
    },
    logoVisible: true,
  },
  hero: {
    isVisible: true,
    eyebrow:
      "Trusted visa and immigration consultants helping you study, visit, and settle abroad with confidence.",
    title: "Your Gateway to Global",
    accentText: "Opportunities",
    description:
      "From Europe to the UK and the United States, Hadaf Consultants turns your international dreams into reality with expert guidance, transparent processes, and proven results.",
    primaryButtonLabel: "Book a Free Consultation",
    primaryButtonHref: "#contact",
    secondaryButtonLabel: "Explore Our Services",
    secondaryButtonHref: "#services",
    banners: [
      {
        id: "hero-banner-primary",
        title: "Study, visit, and settle abroad with confidence.",
        subtitle: "Expert support for Europe, the UK, and the USA.",
        image: {
          src: "hero-students",
          alt: "Students preparing for international opportunities",
        },
        linkLabel: "Book a Free Consultation",
        linkHref: "#contact",
        isVisible: true,
      },
    ],
  },
  offers: {
    isVisible: true,
    eyebrow: "Flyers & Offers",
    title: "Current highlights managed from the CMS.",
    description:
      "Promotions, quick campaigns, and featured support packages can be updated without changing frontend code.",
    items: [
      {
        id: "offer-free-consultation",
        tag: "Free Call",
        title: "Complimentary Initial Consultation",
        description:
          "Discuss your study, visit, or immigration profile with a Hadaf consultant before starting the process.",
        image: {
          src: "contact-agent",
          alt: "Free consultation offer",
        },
        buttonLabel: "Reserve a Slot",
        buttonHref: "#contact",
        isVisible: true,
      },
      {
        id: "offer-document-review",
        tag: "Review",
        title: "Application File Review",
        description:
          "Get a structured review of your documents, profile gaps, and next steps before submission.",
        image: {
          src: "about-student",
          alt: "Document review support",
        },
        buttonLabel: "Talk to a Consultant",
        buttonHref: "#contact",
        isVisible: true,
      },
    ],
  },
  services: {
    isVisible: true,
    eyebrow: "Our Services",
    title: "Comprehensive support for every visa stage.",
    description:
      "At Hadaf Consultants, we offer a complete suite of services designed to simplify your journey abroad.",
    items: [
      {
        id: "service-study-visa",
        icon: "graduation-cap",
        flag: "Study",
        title: "Study Visa Consultancy",
        description:
          "University shortlisting, admissions assistance, and student visa processing for top destinations worldwide.",
        isVisible: true,
      },
      {
        id: "service-visit-visa",
        icon: "plane",
        flag: "Visit",
        title: "Visit Visa Services",
        description:
          "Tourist, family, and business visit visa applications with complete documentation support.",
        isVisible: true,
      },
      {
        id: "service-immigration",
        icon: "briefcase-business",
        flag: "Residency",
        title: "Immigration and Settlement Guidance",
        description: "Expert advice on long-term residency options and skilled migration pathways.",
        isVisible: true,
      },
      {
        id: "service-sop",
        icon: "file-text",
        flag: "SOP",
        title: "SOP and Personal Statement Writing",
        description:
          "Professionally crafted statements that strengthen academic, visa, and profile-based applications.",
        isVisible: true,
      },
      {
        id: "service-interview",
        icon: "message-square-text",
        flag: "Interview",
        title: "Interview Preparation",
        description:
          "Mock interviews and coaching sessions to help you approach embassy interviews with confidence.",
        isVisible: true,
      },
      {
        id: "service-documents",
        icon: "folder-check",
        flag: "Documents",
        title: "Documentation and File Preparation",
        description:
          "Detailed review and preparation of the paperwork required for smoother application handling.",
        isVisible: true,
      },
      {
        id: "service-ielts",
        icon: "languages",
        flag: "IELTS",
        title: "IELTS and Language Test Guidance",
        description:
          "Resources and referrals to help clients meet the language requirements tied to their destination.",
        isVisible: true,
      },
      {
        id: "service-post-visa",
        icon: "shield-check",
        flag: "After Visa",
        title: "Post-Visa Support",
        description:
          "Pre-departure briefings, accommodation guidance, and ongoing assistance after approval.",
        isVisible: true,
      },
    ],
  },
  countries: {
    isVisible: true,
    eyebrow: "Countries We Deal With",
    title: "Destination-specific guidance for major international routes.",
    description:
      "Each country has its own requirements, processing times, and documentation needs. Our consultants guide you through every detail specific to your destination.",
    itemLabel: "Destination",
    items: [
      {
        id: "country-europe",
        name: "Europe",
        flagClassName: "flag-europe",
        description:
          "A gateway to world-class education and rich cultural experiences across multiple destinations.",
        points: [
          "Study visa support for Germany, France, Italy, the Netherlands, Hungary, Poland, and more.",
          "Schengen visit visa guidance for tourism, family visits, and business travel.",
          "Country-specific document planning based on the selected destination.",
        ],
        buttonLabel: "Talk to a Consultant",
        buttonHref: "#contact",
        isVisible: true,
      },
      {
        id: "country-united-kingdom",
        name: "United Kingdom",
        flagClassName: "flag-united-kingdom",
        description:
          "A leading destination for higher education, career growth, and family-based travel.",
        points: [
          "Student Route support for universities and approved institutions.",
          "Visit visa support for tourism, family visits, and short business travel.",
          "Family and dependent visa guidance for reunification cases.",
        ],
        buttonLabel: "Talk to a Consultant",
        buttonHref: "#contact",
        isVisible: true,
      },
      {
        id: "country-united-states",
        name: "United States",
        flagClassName: "flag-united-states",
        description:
          "Academic and career opportunities supported by precise preparation and interview readiness.",
        points: [
          "F-1 student visa preparation for colleges and universities.",
          "B-1/B-2 visit visa support for tourism, business, and family visits.",
          "J-1 exchange visitor guidance for exchange and research opportunities.",
        ],
        buttonLabel: "Talk to a Consultant",
        buttonHref: "#contact",
        isVisible: true,
      },
    ],
  },
  team: {
    isVisible: true,
    eyebrow: "Our Team",
    title: "Experienced professionals guiding every application with care.",
    description:
      "Behind every successful visa story at Hadaf is a team of qualified and experienced professionals. We stay updated with the latest visa policies, embassy procedures, and global education trends so our clients can move forward with clarity, confidence, and care.",
    members: [
      {
        id: "team-visa-consultants",
        name: "Visa Consultants",
        role: "Case strategy, embassy requirements, and destination-specific visa guidance tailored to each applicant.",
        isVisible: true,
      },
      {
        id: "team-education-counselors",
        name: "Education Counselors",
        role: "Support for university shortlisting, admissions planning, and academic route selection for students.",
        isVisible: true,
      },
      {
        id: "team-client-advisory",
        name: "Client Advisory Team",
        role: "Documentation review, interview readiness, and practical support from planning through post-visa steps.",
        isVisible: true,
      },
    ],
  },
  faq: {
    isVisible: true,
    eyebrow: "Frequently Asked Questions",
    title: "Common questions before you apply.",
    description:
      "Processing times, total costs, reapplications, and admissions support vary by destination and case profile. Here are the answers clients ask us most often.",
    items: [
      {
        id: "faq-success-ratio",
        question: "What is the visa success ratio from Pakistan?",
        answer:
          "Approval rates vary by country, visa type, applicant profile, and documentation quality. Well-prepared applications tend to perform better, especially when financial, academic, and travel-history evidence clearly supports the case.",
        isVisible: true,
      },
      {
        id: "faq-process-time",
        question: "How much time does the visa process take?",
        answer:
          "Schengen visit visas often take 15 to 45 working days, UK student and visit visas generally take 3 to 6 weeks, and US timelines vary based on interview slot availability and any additional administrative processing.",
        isVisible: true,
      },
      {
        id: "faq-cost",
        question: "How much amount is required for a visa application?",
        answer:
          "The total amount depends on the country and visa type. It usually includes embassy fees, biometrics, service charges, required bank statements or maintenance funds, and consultancy charges based on the scope of support.",
        isVisible: true,
      },
      {
        id: "faq-guarantee",
        question: "Do you guarantee a visa?",
        answer:
          "No legitimate consultant can guarantee a visa because the final decision belongs to the embassy. What we guarantee is professional handling, accurate documentation, and the strongest application possible based on your profile.",
        isVisible: true,
      },
      {
        id: "faq-refusal",
        question: "Can I apply if I have a previous visa rejection?",
        answer:
          "Yes. A previous refusal does not permanently block future applications. We review the refusal reasons carefully and build a stronger strategy for reapplication.",
        isVisible: true,
      },
      {
        id: "faq-admissions",
        question: "Do you help with admissions as well as visa processing?",
        answer:
          "Yes. For students, we provide end-to-end support, from university shortlisting and applications to visa filing and pre-departure planning.",
        isVisible: true,
      },
    ],
  },
  contact: {
    isVisible: true,
    eyebrow: "Contact Us",
    title: "Start your journey with a free consultation.",
    description:
      "Whether you have a quick question or you are ready to begin, our team is here to help with clear advice and next steps tailored to your case.",
    details: [
      {
        id: "contact-phone",
        icon: "phone",
        label: "Phone / WhatsApp",
        value: "+92 342 9102008",
        href: "tel:+923429102008",
        isVisible: true,
      },
      {
        id: "contact-email",
        icon: "mail",
        label: "Email Address",
        value: "info@hadafconsultants.com",
        href: "mailto:info@hadafconsultants.com",
        isVisible: true,
      },
      {
        id: "contact-address",
        icon: "map-pin",
        label: "Office Address",
        value: "Office #12, Hadaf Tower, Islamabad",
        href: "",
        isVisible: true,
      },
    ],
  },
  workingHours: {
    title: "Working Hours",
    items: [
      {
        id: "hours-mon-sat",
        day: "Monday - Saturday",
        time: "10:00 AM - 7:00 PM",
        isVisible: true,
      },
      {
        id: "hours-sunday",
        day: "Sunday",
        time: "Closed",
        isVisible: true,
      },
    ],
  },
};
