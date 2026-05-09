import {
  BriefcaseBusiness,
  FileText,
  FolderCheck,
  GraduationCap,
  Languages,
  MessageSquareText,
  Plane,
  ShieldCheck,
} from "lucide-react";
import { Reveal } from "@/components/reveal";
import type { SiteContent } from "@/features/site-content/site-content.schemas";

type ServicesProps = {
  content: SiteContent["services"];
};

const serviceIcons = {
  "graduation-cap": GraduationCap,
  plane: Plane,
  "briefcase-business": BriefcaseBusiness,
  "file-text": FileText,
  "message-square-text": MessageSquareText,
  "folder-check": FolderCheck,
  languages: Languages,
  "shield-check": ShieldCheck,
} as const;

export function Services({ content }: ServicesProps) {
  const visibleItems = content.items.filter((item) => item.isVisible);

  if (!content.isVisible || visibleItems.length === 0) {
    return null;
  }

  return (
    <section id="services" className="py-24 bg-mint/30 relative">
      <div className="site-shell">
        <Reveal className="mx-auto mb-14 max-w-2xl text-center">
          <p className="section-label mb-3">{content.eyebrow}</p>
          <h2 className="text-4xl md:text-5xl text-dark">{content.title}</h2>
          <p className="mt-5 text-[15px] leading-8 text-muted-foreground">{content.description}</p>
        </Reveal>
        <div className="grid gap-7 md:grid-cols-2 xl:grid-cols-4">
          {visibleItems.map((item, index) => {
            const Icon = serviceIcons[item.icon];

            return (
              <Reveal key={item.title} className="h-full" delay={index * 120}>
                <article className="group flex h-full flex-col items-center rounded-[28px] border border-dark/8 bg-white p-6 text-foreground shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-primary/30 hover:shadow-xl">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex h-20 w-20 shrink-0 items-center justify-center text-primary">
                      <Icon className="h-20 w-20 stroke-[1.8]" />
                    </div>
                  </div>

                  <h3 className="mt-6 min-h-[3.6rem] text-[1.45rem] font-extrabold leading-tight text-foreground text-center">
                    {item.title}
                  </h3>
                  <p className="mt-4 flex-1 text-sm leading-7 text-muted-foreground text-center">
                    {item.description}
                  </p>
                </article>
              </Reveal>
            );
          })}
        </div>
      </div>
    </section>
  );
}
