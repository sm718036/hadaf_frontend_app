import { Globe, GraduationCap, ShieldCheck } from "lucide-react";
import { STATIC_ABOUT_CONTENT } from "@/content/landing-static";
import { Reveal } from "@/components/reveal";

const featureIcons = {
  globe: Globe,
  "graduation-cap": GraduationCap,
  "shield-check": ShieldCheck,
} as const;

export function About() {
  const content = STATIC_ABOUT_CONTENT;

  return (
    <section id="about" className="bg-white px-4 py-32 sm:px-6 lg:px-8">
      <div className="site-shell">
        <div className="grid gap-10 lg:grid-cols-[0.95fr_1.05fr] lg:items-stretch lg:gap-14">
          <Reveal className="about-stat-frame relative mx-auto flex min-h-[360px] w-full max-w-md overflow-hidden bg-brand-soft px-8 py-8 lg:mx-0 lg:max-w-none">
            <div className="absolute inset-[12px] border border-dashed border-dark/60" />
            <div className="relative z-10 flex h-full w-full flex-col text-center lg:text-left">
              <p className="section-label justify-center lg:justify-start">
                {content.experienceTitle}
              </p>

              <div className="flex flex-1 items-center justify-center text-center">
                <div className="about-stat-number max-w-80 text-[clamp(2.9rem,7vw,7rem)] font-black uppercase leading-none tracking-[-0.05em] text-transparent">
                  {content.experienceLabel}
                </div>
              </div>
            </div>
          </Reveal>

          <Reveal className="flex h-full flex-col justify-center text-center lg:text-left" delay={120}>
            <p className="section-label mb-4 justify-center lg:justify-start">
              {content.eyebrow}
            </p>

            <h2 className="max-w-2xl text-4xl font-extrabold leading-[1.15] text-foreground sm:text-5xl">
              {content.title}{" "}
              <span className="text-gold">{content.accentText}</span>
            </h2>

            <p className="mt-6 max-w-3xl whitespace-pre-line text-[15px] leading-8 text-muted-foreground">
              {content.description}
            </p>
          </Reveal>
        </div>

        <div className="mt-10 grid gap-5 lg:grid-cols-3 lg:gap-6">
          {content.features.map((feature, index) => {
            const Icon = featureIcons[feature.icon];

            return (
              <Reveal key={feature.title} delay={index * 100}>
                <article className="about-feature-card relative h-full overflow-hidden bg-white px-6 py-6 shadow-[0_10px_28px_rgba(11,20,37,0.12)] before:hidden after:hidden">
                  <div className="flex items-start gap-4">
                    <div className="flex h-[72px] w-[72px] shrink-0 items-center justify-center rounded-full bg-primary text-dark">
                      <Icon className="h-8 w-8 stroke-[1.8]" />
                    </div>

                    <div>
                      <h3 className="text-[1.5rem] font-extrabold leading-tight text-foreground">
                        {feature.title}
                      </h3>

                      <p className="mt-3 max-w-sm text-[15px] leading-7 text-muted-foreground">
                        {feature.description}
                      </p>
                    </div>
                  </div>
                </article>
              </Reveal>
            );
          })}
        </div>
      </div>
    </section>
  );
}