import { Reveal } from "@/components/reveal";
import type { SiteContent } from "@/features/site-content/site-content.schemas";

type TeamProps = {
  content: SiteContent["team"];
};

export function Team({ content }: TeamProps) {
  const visibleMembers = content.members.filter((member) => member.isVisible);

  if (!content.isVisible || visibleMembers.length === 0) {
    return null;
  }

  return (
    <section id="team" className="bg-white py-20 sm:py-24">
      <div className="site-shell">
        <Reveal className="mx-auto max-w-[760px] text-center">
          <p className="section-label mb-5">{content.eyebrow}</p>
          <h2 className="text-[clamp(2rem,7vw,2.55rem)] font-extrabold leading-[1.2] text-foreground">
            {content.title}
          </h2>
          <p className="mt-6 text-[15px] leading-8 text-muted-foreground">{content.description}</p>
        </Reveal>

        <div className="mt-12 grid gap-8 md:grid-cols-2 xl:grid-cols-3">
          {visibleMembers.map((member, index) => (
            <Reveal key={member.name} className="h-full" delay={index * 100}>
              <article className="flex h-full flex-col rounded-[28px] border border-border/80 bg-brand-soft/45 p-7 text-left shadow-[0_14px_30px_rgba(17,24,39,0.06)]">
                <p className="inline-flex self-start rounded-full bg-white px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-primary">
                  Team {String(index + 1).padStart(2, "0")}
                </p>
                <h3 className="mt-6 min-h-[3.4rem] text-[1.45rem] font-extrabold leading-tight text-foreground">
                  {member.name}
                </h3>
                <p className="mt-4 flex-1 text-[15px] leading-7 text-muted-foreground">
                  {member.role}
                </p>
              </article>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
