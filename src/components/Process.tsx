import { ArrowRight, BriefcaseBusiness, Globe2, Handshake } from "lucide-react";
import { STATIC_PROCESS_CONTENT } from "@/content/landing-static";
import { Reveal } from "@/components/reveal";
import { resolveContentImage } from "@/lib/content-assets";

const processIcons = {
  handshake: Handshake,
  "globe-2": Globe2,
  briefcase: BriefcaseBusiness,
} as const;

export function Process() {
  const content = STATIC_PROCESS_CONTENT;

  return (
    <section className="overflow-hidden bg-white py-24">
      <div className="site-shell grid items-stretch !gap-20 lg:grid-cols-[0.92fr_1.58fr] lg:gap-0">
        <Reveal className="relative z-10 bg-white pb-8 lg:pr-0">
          <div className="max-w-[430px]">
            <p className="section-label mb-5">{content.eyebrow}</p>
            <h2 className="max-w-[420px] text-[2.6rem] font-extrabold leading-[1.15] text-foreground">
              {content.title}
            </h2>
            <p className="mt-6 max-w-[390px] text-[15px] leading-8 text-muted-foreground">
              {content.description}
            </p>
          </div>

          <p className="why-choose-note mt-8 max-w-[410px] pl-5 text-[14px] italic leading-7 text-muted-foreground">
            {content.notePrefix} <span className="text-primary">{content.noteHighlight}</span>
            {content.noteSuffix}
          </p>

          <a
            href={content.buttonHref}
            className="btn-gold mt-9 !gap-4 !px-7 !py-2.5 text-sm font-extrabold uppercase tracking-[0.04em]"
          >
            {content.buttonLabel}
            <span className="flex h-9 w-9 items-center justify-center rounded-full bg-white text-dark">
              <ArrowRight className="h-4 w-4" />
            </span>
          </a>
        </Reveal>

        <Reveal className="relative flex flex-col lg:ml-[-40px]" delay={140}>
          <div className="relative flex-1 overflow-hidden">
            <img
              src={resolveContentImage(content.mainImage.src)}
              alt={content.mainImage.alt}
              className="absolute inset-0 h-full w-full object-cover"
              loading="lazy"
              decoding="async"
              width={920}
              height={760}
            />
          </div>

          <div className="relative z-10 -mt-16 ml-auto flex w-full items-stretch overflow-hidden border-[3px] border-primary/20 bg-dark shadow-[0_16px_40px_rgba(17,24,39,0.18)]">
            <div className="hidden w-[150px] shrink-0 md:block">
              <img
                src={resolveContentImage(content.panelImage.src)}
                alt={content.panelImage.alt}
                className="h-full w-full object-cover"
                loading="lazy"
                decoding="async"
                width={240}
                height={170}
              />
            </div>

            <div className="flex items-center px-7 py-7 md:px-8">
              <p className="max-w-[520px] text-[1.05rem] font-medium leading-8 text-white/88 md:text-[1.15rem]">
                {content.panelText}
              </p>
            </div>
          </div>
        </Reveal>
        <Reveal className="col-span-2" delay={160}>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {content.cards.map((card) => {
              const Icon = processIcons[card.icon];
              return (
                <article
                  key={card.title}
                  className="why-choose-card group relative flex min-h-[178px] w-full flex-col justify-start px-5 pb-5 pt-5 text-left transition-colors duration-300"
                >
                  <div className="flex h-[50px] w-[50px] items-center justify-center rounded-[14px] bg-dark text-white transition-colors duration-300 group-hover:bg-primary group-hover:text-dark">
                    <Icon className="h-6 w-6 stroke-[1.8]" />
                  </div>

                  <h3 className="mt-4 text-[1.05rem] font-extrabold leading-tight text-foreground transition-colors duration-300 group-hover:text-white">
                    {card.title}
                  </h3>

                  <p className="mt-2 text-[13px] leading-6 text-muted-foreground transition-colors duration-300 group-hover:text-white/75">
                    {card.description}
                  </p>
                </article>
              );
            })}
          </div>
        </Reveal>
      </div>
    </section>
  );
}
