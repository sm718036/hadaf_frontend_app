import { createFileRoute } from "@tanstack/react-router";
import { Header } from "@/components/Header";
import { Hero } from "@/components/Hero";
import { Offers } from "@/components/Offers";
import { About } from "@/components/About";
import { Services } from "@/components/Services";
import { Process } from "@/components/Process";
import { Countries } from "@/components/Countries";
import { Team } from "@/components/Team";
import { Faq } from "@/components/Faq";
import { Contact } from "@/components/Contact";
import { Footer } from "@/components/Footer";
import { PublicPageLoader } from "@/components/PublicPageLoader";
import { useSiteContent } from "@/features/site-content/use-site-content";

export const Route = createFileRoute("/")({
  component: Index,
});

function Index() {
  const { data: content, isPending, error } = useSiteContent();

  if (isPending) {
    return <PublicPageLoader message="Loading site content..." />;
  }

  if (error || !content) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-background px-6">
        <div className="max-w-md text-center">
          <h1 className="text-3xl font-display font-extrabold text-foreground">Content unavailable</h1>
          <p className="mt-3 text-sm text-muted-foreground">
            The frontend is running client-side only and could not load site content from the backend API.
          </p>
        </div>
      </main>
    );
  }

  return (
    <main>
      <Header branding={content.branding} contactDetails={content.contact.details} />
      <Hero content={content.hero} />
      <Offers content={content.offers} />
      <About />
      <Process />
      <Services content={content.services} />
      <Countries content={content.countries} />
      <Team content={content.team} />
      <Faq content={content.faq} />
      <Contact
        content={content.contact}
        serviceOptions={content.services.items.filter((item) => item.isVisible).map((item) => item.title)}
      />
      <Footer
        branding={content.branding}
        contactDetails={content.contact.details}
        workingHours={content.workingHours}
      />
    </main>
  );
}
