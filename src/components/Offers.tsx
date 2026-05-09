import { ArrowLeft, ArrowRight, ArrowUpRight } from "lucide-react";
import { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/components/ui/dialog";
import type { SiteContent } from "@/features/site-content/site-content.schemas";
import { resolveContentImage } from "@/lib/content-assets";

type OffersProps = {
  content: SiteContent["offers"];
};

export function Offers({ content }: OffersProps) {
  const visibleItems = content.items.filter((item) => item.isVisible);
  const [isOpen, setIsOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const [hasAutoOpened, setHasAutoOpened] = useState(false);

  useEffect(() => {
    setActiveIndex((current) => Math.min(current, Math.max(visibleItems.length - 1, 0)));
  }, [visibleItems.length]);

  useEffect(() => {
    if (hasAutoOpened || !content.isVisible || visibleItems.length === 0) {
      return;
    }

    setIsOpen(true);
    setHasAutoOpened(true);
  }, [content.isVisible, hasAutoOpened, visibleItems.length]);

  if (!content.isVisible || visibleItems.length === 0) {
    return null;
  }

  const activeItem = visibleItems[activeIndex] ?? visibleItems[0];
  const hasMultipleOffers = visibleItems.length > 1;

  if (!activeItem) {
    return null;
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="max-h-[92vh] max-w-5xl gap-0 overflow-hidden rounded-[30px] border border-dark/8 bg-white p-0 shadow-[0_38px_90px_rgba(2,40,22,0.32)]">
        <div className="max-h-[92vh] overflow-y-auto">
          <div className="grid md:grid-cols-[0.94fr_1.06fr]">
            <div className="relative min-h-[320px] overflow-hidden bg-dark">
              <img
                src={resolveContentImage(activeItem.image.src)}
                alt={activeItem.image.alt}
                className="h-full w-full object-cover"
                loading="eager"
                decoding="async"
                width={900}
                height={1200}
                fetchPriority="high"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-dark/70 via-dark/10 to-transparent" />

              <div className="absolute left-5 top-5 flex items-center gap-3">
                <span className="inline-flex rounded-full bg-white/90 px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.22em] text-dark shadow-sm">
                  {content.eyebrow}
                </span>
                {hasMultipleOffers ? (
                  <span className="inline-flex rounded-full bg-dark/60 px-3 py-2 text-[11px] font-semibold uppercase tracking-[0.2em] text-white backdrop-blur-sm">
                    {activeIndex + 1} / {visibleItems.length}
                  </span>
                ) : null}
              </div>

              <div className="absolute bottom-5 left-5 right-5 rounded-[24px] border border-white/12 bg-white/10 p-4 backdrop-blur-md">
                <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-primary">
                  {activeItem.tag}
                </p>
                <p className="mt-2 text-lg font-display font-extrabold leading-tight text-white">
                  {activeItem.title}
                </p>
              </div>
            </div>

            <div className="flex flex-col px-6 pb-6 pt-8 md:px-9 md:pb-8 md:pt-9">
              <div className="pr-10">
                <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-primary">
                  {content.eyebrow}
                </p>
                <DialogTitle className="mt-4 font-display text-[2.45rem] font-extrabold leading-[1.05] text-foreground sm:text-[3rem]">
                  {activeItem.title}
                </DialogTitle>
                <DialogDescription className="mt-5 text-[1rem] leading-8 text-muted-foreground">
                  {activeItem.description}
                </DialogDescription>
              </div>

              <div className="mt-7 rounded-[26px] border border-primary/18 bg-brand-soft/50 px-5 py-5">
                <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-primary">
                  Flyer Note
                </p>
                <p className="mt-3 text-lg font-display font-extrabold leading-tight text-foreground">
                  {content.title}
                </p>
                <p className="mt-3 text-sm leading-7 text-muted-foreground">
                  {content.description}
                </p>
              </div>

              <div className="mt-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <a
                  href={activeItem.buttonHref}
                  onClick={() => setIsOpen(false)}
                  className="btn-gold justify-center sm:justify-start"
                >
                  {activeItem.buttonLabel}
                  <ArrowUpRight className="h-4 w-4" />
                </a>

                {hasMultipleOffers ? (
                  <div className="flex items-center justify-between gap-3 sm:justify-end">
                    <button
                      type="button"
                      onClick={() =>
                        setActiveIndex((current) =>
                          current === 0 ? visibleItems.length - 1 : current - 1,
                        )
                      }
                      className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-dark/10 bg-white text-dark transition-colors hover:border-primary/40 hover:bg-primary/10"
                      aria-label="Show previous flyer"
                    >
                      <ArrowLeft className="h-4 w-4" />
                    </button>

                    <div className="flex items-center gap-2">
                      {visibleItems.map((item, index) => (
                        <button
                          key={item.id}
                          type="button"
                          onClick={() => setActiveIndex(index)}
                          className={`h-2.5 rounded-full transition-all ${
                            index === activeIndex ? "w-7 bg-primary" : "w-2.5 bg-dark/18 hover:bg-dark/35"
                          }`}
                          aria-label={`Show flyer ${index + 1}`}
                        />
                      ))}
                    </div>

                    <button
                      type="button"
                      onClick={() =>
                        setActiveIndex((current) =>
                          current === visibleItems.length - 1 ? 0 : current + 1,
                        )
                      }
                      className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-dark/10 bg-white text-dark transition-colors hover:border-primary/40 hover:bg-primary/10"
                      aria-label="Show next flyer"
                    >
                      <ArrowRight className="h-4 w-4" />
                    </button>
                  </div>
                ) : null}
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
