import { ArrowRight, Check, Square } from "lucide-react";
import { Reveal } from "@/components/reveal";
import type { SiteContent } from "@/features/site-content/site-content.schemas";

type CountriesProps = {
  content: SiteContent["countries"];
};

export function Countries({ content }: CountriesProps) {
  const visibleItems = content.items.filter((item) => item.isVisible);

  if (!content.isVisible || visibleItems.length === 0) {
    return null;
  }

  return (
    <section
      id="countries"
      className="countries-offer-section relative overflow-hidden bg-dark py-20 text-white sm:py-24"
    >
      <div className="absolute left-1/2 top-0 z-10 h-4 w-4 -translate-x-1/2 -translate-y-1/2 rounded-full border border-primary/70" />

      <div className="site-shell relative z-10">
        <Reveal className="mb-12 max-w-[760px]">
          <div className="max-w-[620px]">
            <p className="section-label mb-5">{content.eyebrow}</p>
            <h2 className="text-[clamp(2rem,7vw,2.55rem)] font-extrabold leading-[1.16] text-white">
              {content.title}
            </h2>
            <p className="mt-5 max-w-[720px] text-[15px] leading-8 text-white/70">
              {content.description}
            </p>
          </div>
        </Reveal>

        <div className="grid items-stretch gap-5 md:grid-cols-2 xl:grid-cols-3">
          {visibleItems.map((country, index) => (
            <Reveal key={country.name} delay={index * 90} className="h-full">
              <article className="group flex h-full min-h-[480px] flex-col bg-white text-foreground shadow-[0_18px_40px_rgba(10,14,40,0.18)] transition-all duration-300 hover:-translate-y-1 hover:bg-primary sm:min-h-[560px]">
                <div className="border-b border-brand-line/70 px-5 pb-6 pt-5 transition-colors duration-300 group-hover:border-dark/18">
                  <h3 className="flex min-h-[54px] items-center gap-3 text-[1.5rem] font-extrabold leading-tight text-foreground sm:text-[1.9rem]">
                    <div
                      className={`flag-block shrink-0 ${country.flagClassName}`}
                      aria-hidden="true"
                    />
                    <span>{country.name}</span>
                  </h3>
                </div>

                <div className="flex flex-1 flex-col px-5 pb-6 pt-6">
                  <p className="min-h-[72px] text-[15px] leading-7 text-muted-foreground transition-colors duration-300 group-hover:text-dark/78 sm:min-h-[96px] sm:leading-8">
                    {country.description}
                  </p>

                  <ul className="mt-2 flex-1 space-y-3.5">
                    {country.points.map((point) => (
                      <li
                        key={point}
                        className="flex items-start gap-2.5 text-[15px] leading-6 text-foreground/80 transition-colors duration-300 group-hover:text-dark/88"
                      >
                        <span className="mt-1 flex h-4.5 w-4.5 shrink-0 items-center justify-center rounded-full bg-dark text-white transition-colors duration-300 group-hover:bg-white group-hover:text-dark">
                          <Check className="h-3 w-3 stroke-[3]" />
                        </span>
                        <span>{point}</span>
                      </li>
                    ))}
                  </ul>

                  <a
                    href={country.buttonHref}
                    className="mt-7 inline-flex w-fit items-center gap-5 rounded-full bg-primary px-7 py-2.5 font-display text-sm font-extrabold uppercase tracking-[0.04em] text-dark transition-all duration-300 group-hover:bg-dark group-hover:text-white"
                  >
                    {country.buttonLabel}
                    <span className="flex h-9 w-9 items-center justify-center rounded-full bg-white text-dark transition-colors duration-300 group-hover:bg-primary group-hover:text-dark">
                      <ArrowRight className="h-4 w-4" />
                    </span>
                  </a>
                </div>
              </article>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
