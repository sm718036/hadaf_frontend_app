import { BrandLogo } from "@/components/BrandLogo";
import { Skeleton } from "@/components/ui/skeleton";

type PublicPageLoaderProps = {
  message?: string;
};

export function PublicPageLoader({ message = "Loading site content..." }: PublicPageLoaderProps) {
  return (
    <main
      className="min-h-screen overflow-hidden bg-[radial-gradient(circle_at_top_left,rgba(164,255,238,0.35),transparent_32%),linear-gradient(180deg,#f8fffc_0%,#ffffff_58%,#f3fffb_100%)]"
      aria-busy="true"
      aria-live="polite"
    >
      <div className="border-b border-dark/5 bg-white/88 backdrop-blur">
        <div className="site-shell flex items-center justify-between py-4">
          <BrandLogo
            brandName="Hadaf Consultants"
            companyNameVisible
            logoVisible
            priority
            imageClassName="h-10 sm:h-11"
          />

          <div className="hidden items-center gap-3 lg:flex">
            {Array.from({ length: 5 }).map((_, index) => (
              <Skeleton key={index} className="h-10 w-20 rounded-full bg-dark/6" />
            ))}
          </div>

          <Skeleton className="h-12 w-40 rounded-full bg-primary/20" />
        </div>
      </div>

      <section className="site-shell relative grid min-h-[calc(100vh-81px)] items-center gap-12 py-16 md:grid-cols-[1.05fr_0.95fr]">
        <div>
          <div className="inline-flex items-center rounded-full border border-primary/20 bg-white/80 px-4 py-3 shadow-[0_16px_40px_-24px_rgba(2,40,22,0.45)]">
            <Skeleton className="h-4 w-40 rounded-full bg-dark/8 sm:w-52" />
            <span className="sr-only">{message}</span>
          </div>

          <div className="mt-8 space-y-4">
            <Skeleton className="h-4 w-48 rounded-full bg-primary/18" />
            <Skeleton className="h-16 max-w-2xl rounded-[28px] bg-dark/7" />
            <Skeleton className="h-16 max-w-xl rounded-[28px] bg-dark/7" />
            <Skeleton className="h-5 max-w-2xl rounded-full bg-dark/6" />
            <Skeleton className="h-5 max-w-xl rounded-full bg-dark/6" />
          </div>

          <div className="mt-8 flex flex-wrap gap-4">
            <Skeleton className="h-12 w-52 rounded-full bg-primary/24" />
            <Skeleton className="h-12 w-44 rounded-full bg-dark/10" />
          </div>

          <div className="mt-12 grid gap-4 sm:grid-cols-3">
            {Array.from({ length: 3 }).map((_, index) => (
              <div
                key={index}
                className="rounded-[24px] border border-dark/6 bg-white/72 px-5 py-5 shadow-[0_18px_36px_-28px_rgba(2,40,22,0.38)]"
              >
                <Skeleton className="h-7 w-20 rounded-full bg-primary/18" />
                <Skeleton className="mt-4 h-4 w-full rounded-full bg-dark/6" />
                <Skeleton className="mt-2 h-4 w-3/4 rounded-full bg-dark/6" />
              </div>
            ))}
          </div>
        </div>

        <div className="relative mx-auto w-full max-w-[620px]">
          <div className="absolute inset-8 rounded-full bg-primary/18 blur-3xl" />
          <Skeleton className="aspect-square rounded-full border-[10px] border-white/80 bg-white/68 shadow-[0_40px_90px_-48px_rgba(2,40,22,0.45)]" />

          <div className="absolute -bottom-3 left-0 right-10 rounded-[28px] border border-dark/6 bg-white/88 p-6 shadow-[0_24px_56px_-32px_rgba(2,40,22,0.45)]">
            <Skeleton className="h-6 w-2/3 rounded-full bg-dark/8" />
            <Skeleton className="mt-4 h-4 w-full rounded-full bg-dark/6" />
            <Skeleton className="mt-2 h-4 w-5/6 rounded-full bg-dark/6" />
          </div>

          <div className="absolute right-0 top-8 hidden w-56 space-y-3 lg:block">
            {Array.from({ length: 2 }).map((_, index) => (
              <div
                key={index}
                className="rounded-[24px] border border-white/70 bg-white/76 p-5 shadow-[0_20px_44px_-34px_rgba(2,40,22,0.4)]"
              >
                <Skeleton className="h-4 w-28 rounded-full bg-primary/18" />
                <Skeleton className="mt-3 h-5 w-full rounded-full bg-dark/7" />
                <Skeleton className="mt-2 h-4 w-5/6 rounded-full bg-dark/6" />
              </div>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
