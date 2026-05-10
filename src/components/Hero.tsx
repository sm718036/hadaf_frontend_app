import { ArrowRight } from "lucide-react";
import { STATIC_HERO_STATS } from "@/content/landing-static";
import { Reveal } from "@/components/reveal";
import type { SiteContent } from "@/features/site-content/site-content.schemas";
import { resolveContentImage } from "@/lib/content-assets";

type HeroProps = {
  content: SiteContent["hero"];
};

export function Hero({ content }: HeroProps) {
  const visibleBanners = content.banners.filter((banner) => banner.isVisible);
  const featuredBanner = visibleBanners[0] ?? content.banners[0];
  const supportingBanners = visibleBanners.slice(1, 3);

  if (!content.isVisible || !featuredBanner) {
    return null;
  }

  return (
    <section
      id="home"
      className="relative overflow-hidden bg-dark pb-20 pt-32 text-white sm:pb-24 sm:pt-40"
    >
      <div
        className="absolute inset-0 opacity-20"
        style={{
          background:
            "radial-gradient(circle at 20% 50%, var(--primary) 0%, transparent 40%), radial-gradient(circle at 80% 20%, var(--mint) 0%, transparent 40%)",
        }}
      />
      <div className="absolute -right-10 -top-10 h-56 w-56 rounded-full bg-gold/10 blur-3xl sm:-right-20 sm:-top-20 sm:h-96 sm:w-96" />
      <div className="site-shell relative grid items-center gap-10 lg:grid-cols-2 lg:gap-12">
        <Reveal>
          <p className="max-w-xl text-sm font-semibold leading-7 text-primary sm:text-base">
            {content.eyebrow}
          </p>
          <h1 className="mt-5 text-[clamp(2.5rem,10vw,5.25rem)] leading-[1.02]">
            {content.title} <span className="text-gold">{content.accentText}</span>
          </h1>
          <p className="mt-6 max-w-xl text-base leading-7 text-white/72 sm:text-lg sm:leading-8">
            {content.description}
          </p>
          <div className="mt-8 flex flex-wrap gap-4">
            <a
              href={content.primaryButtonHref}
              className="btn-gold w-full justify-center sm:w-auto"
            >
              {content.primaryButtonLabel} <ArrowRight className="h-4 w-4" />
            </a>
            <a
              href={content.secondaryButtonHref}
              className="btn-dark w-full justify-center border border-white/20 sm:w-auto"
            >
              {content.secondaryButtonLabel}
            </a>
          </div>
        </Reveal>
        <Reveal className="relative mx-auto w-full max-w-[540px]" delay={140}>
          <div className="absolute -inset-2 rounded-full bg-gold/20 blur-2xl sm:-inset-4" />
          <div className="relative aspect-square overflow-hidden rounded-full border-[6px] border-gold/40 sm:border-8">
            <img
              src={resolveContentImage(featuredBanner.image.src)}
              alt={featuredBanner.image.alt}
              className="h-full w-full object-cover"
              width={1280}
              height={1280}
              fetchPriority="high"
              decoding="async"
            />
          </div>
          {supportingBanners.length > 0 ? (
            <div className="relative mt-5 flex gap-3 overflow-x-auto pb-1 lg:absolute lg:-right-2 lg:top-8 lg:mt-0 lg:max-w-[240px] lg:flex-col lg:overflow-visible lg:pb-0">
              {supportingBanners.map((banner) => (
                <a
                  key={banner.id}
                  href={banner.linkHref}
                  className="min-w-[220px] rounded-2xl border border-white/15 bg-white/8 px-4 py-4 backdrop-blur-sm transition-colors hover:bg-white/12 lg:min-w-0"
                >
                  <p className="text-sm font-semibold uppercase tracking-[0.18em] text-primary">
                    {banner.linkLabel}
                  </p>
                  <p className="mt-2 text-base font-display font-extrabold leading-tight text-white">
                    {banner.title}
                  </p>
                  <p className="mt-2 text-sm leading-6 text-white/68">{banner.subtitle}</p>
                </a>
              ))}
            </div>
          ) : null}
        </Reveal>
      </div>
    </section>
  );
}
