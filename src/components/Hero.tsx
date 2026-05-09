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
    <section id="home" className="relative pt-40 pb-24 overflow-hidden bg-dark text-white">
      <div className="absolute inset-0 opacity-20" style={{ background: "radial-gradient(circle at 20% 50%, var(--primary) 0%, transparent 40%), radial-gradient(circle at 80% 20%, var(--mint) 0%, transparent 40%)" }} />
      <div className="absolute -top-20 -right-20 w-96 h-96 bg-gold/10 rounded-full blur-3xl" />
      <div className="site-shell relative grid items-center gap-12 md:grid-cols-2">
        <Reveal>
          <p className="max-w-xl text-sm font-semibold leading-7 text-primary sm:text-base">
            {content.eyebrow}
          </p>
          <h1 className="mt-5 text-5xl leading-[1.02] md:text-[5.25rem]">
            {content.title} <span className="text-gold">{content.accentText}</span>
          </h1>
          <p className="mt-6 max-w-xl text-lg leading-8 text-white/72">
            {content.description}
          </p>
          <div className="mt-8 flex flex-wrap gap-4">
            <a href={content.primaryButtonHref} className="btn-gold">{content.primaryButtonLabel} <ArrowRight className="w-4 h-4" /></a>
            <a href={content.secondaryButtonHref} className="btn-dark border border-white/20">{content.secondaryButtonLabel}</a>
          </div>
        </Reveal>
        <Reveal className="relative" delay={140}>
          <div className="absolute -inset-4 bg-gold/20 rounded-full blur-2xl" />
          <div className="relative aspect-square rounded-full overflow-hidden border-8 border-gold/40">
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
            <div className="absolute -right-2 top-8 flex max-w-[240px] flex-col gap-3">
              {supportingBanners.map((banner) => (
                <a
                  key={banner.id}
                  href={banner.linkHref}
                  className="rounded-2xl border border-white/15 bg-white/8 px-4 py-4 backdrop-blur-sm transition-colors hover:bg-white/12"
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
