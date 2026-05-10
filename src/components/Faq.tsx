import { useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";
import { Reveal } from "@/components/reveal";
import type { SiteContent } from "@/features/site-content/site-content.schemas";

type FaqProps = {
  content: SiteContent["faq"];
};

export function Faq({ content }: FaqProps) {
  const [open, setOpen] = useState(0);
  const visibleItems = content.items.filter((item) => item.isVisible);

  if (!content.isVisible || visibleItems.length === 0) {
    return null;
  }

  return (
    <section id="faq" className="relative overflow-hidden bg-brand-soft py-20 sm:py-24">
      <div className="absolute bottom-10 left-1/2 h-4 w-4 -translate-x-1/2 rounded-full border border-primary/70" />

      <div className="site-shell grid gap-10 lg:grid-cols-[0.9fr_1.05fr] lg:gap-8">
        <Reveal>
          <p className="section-label mb-5">{content.eyebrow}</p>
          <h2 className="max-w-[450px] text-[clamp(2rem,7vw,2.55rem)] font-extrabold leading-[1.16] text-foreground">
            {content.title}
          </h2>
          <p className="mt-6 max-w-[430px] text-[15px] leading-8 text-muted-foreground">
            {content.description}
          </p>
        </Reveal>

        <Reveal className="space-y-5" delay={120}>
          {visibleItems.map((faq, index) => {
            const isOpen = open === index;

            return (
              <article
                key={faq.question}
                className="overflow-hidden bg-white shadow-[0_8px_24px_rgba(17,24,39,0.05)]"
              >
                <button
                  type="button"
                  onClick={() => setOpen(isOpen ? -1 : index)}
                  className={`flex w-full items-center gap-4 px-1 py-1 text-left ${
                    isOpen ? "bg-dark text-white" : "bg-white text-foreground"
                  }`}
                >
                  <span
                    className={`flex h-[44px] w-[44px] shrink-0 items-center justify-center font-display text-[1.1rem] font-extrabold ${
                      isOpen ? "bg-primary text-dark" : "bg-dark text-white"
                    }`}
                  >
                    Q{index + 1}.
                  </span>
                  <span className="flex-1 pr-2 text-base font-extrabold leading-tight md:text-[1.2rem]">
                    {faq.question}
                  </span>
                  <span className={`mr-4 shrink-0 ${isOpen ? "text-white" : "text-dark"}`}>
                    {isOpen ? (
                      <ChevronUp className="h-5 w-5" />
                    ) : (
                      <ChevronDown className="h-5 w-5" />
                    )}
                  </span>
                </button>

                {isOpen && (
                  <div className="bg-white px-5 py-5 text-[15px] leading-7 text-muted-foreground sm:px-12 sm:leading-8">
                    {faq.answer}
                  </div>
                )}
              </article>
            );
          })}
        </Reveal>
      </div>
    </section>
  );
}
