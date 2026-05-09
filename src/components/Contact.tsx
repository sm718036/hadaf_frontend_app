import { useState } from "react";
import { toast } from "sonner";
import { ChevronDown, Mail, MapPin, Phone } from "lucide-react";
import { STATIC_CONTACT_FORM } from "@/content/landing-static";
import { Reveal } from "@/components/reveal";
import { useSubmitPublicLead } from "@/features/leads/use-leads";
import type { SiteContent } from "@/features/site-content/site-content.schemas";
import { resolveContentImage } from "@/lib/content-assets";

type ContactProps = {
  content: SiteContent["contact"];
  serviceOptions: string[];
};

const contactIcons = {
  phone: Phone,
  mail: Mail,
  "map-pin": MapPin,
} as const;

export function Contact({ content, serviceOptions }: ContactProps) {
  const submitLeadMutation = useSubmitPublicLead();
  const [form, setForm] = useState({
    fullName: "",
    phone: "",
    email: "",
    interestedService: "",
    message: "",
  });
  const visibleDetails = content.details.filter((detail) => detail.isVisible);

  if (!content.isVisible) {
    return null;
  }

  return (
    <section id="contact" className="overflow-hidden bg-brand-soft py-24">
      <div className="site-shell grid items-stretch gap-0 lg:grid-cols-2">
        <Reveal className="flex items-center bg-brand-soft pr-0 lg:pr-10">
          <div className="w-full py-4">
            <p className="section-label mb-5">{content.eyebrow}</p>
            <h2 className="text-[2.55rem] font-extrabold leading-[1.16] text-foreground">
              {content.title}
            </h2>
            <p className="mt-6 text-[15px] leading-8 text-muted-foreground">
              {content.description}
            </p>

            <form
              className="mt-8 space-y-5"
              onSubmit={async (event) => {
                event.preventDefault();

                try {
                  await submitLeadMutation.mutateAsync({
                    fullName: form.fullName,
                    phone: form.phone,
                    email: form.email,
                    interestedCountry: "",
                    interestedService:
                      form.interestedService === STATIC_CONTACT_FORM.placeholders.selectDefault
                        ? ""
                        : form.interestedService,
                    message: form.message,
                    formName: "Contact Form",
                  });
                  toast.success("Your request has been received.");
                  setForm({
                    fullName: "",
                    phone: "",
                    email: "",
                    interestedService: "",
                    message: "",
                  });
                } catch (error) {
                  toast.error(error instanceof Error ? error.message : "Unable to submit your request.");
                }
              }}
            >
              <div className="grid gap-5 sm:grid-cols-2">
                <input
                  value={form.fullName}
                  onChange={(event) => setForm((current) => ({ ...current, fullName: event.target.value }))}
                  placeholder={STATIC_CONTACT_FORM.placeholders.name}
                  className="h-[52px] w-full border border-border bg-white px-5 text-[14px] text-foreground placeholder:text-muted-foreground transition focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/15"
                />
                <input
                  value={form.phone}
                  onChange={(event) => setForm((current) => ({ ...current, phone: event.target.value }))}
                  placeholder={STATIC_CONTACT_FORM.placeholders.phone}
                  className="h-[52px] w-full border border-border bg-white px-5 text-[14px] text-foreground placeholder:text-muted-foreground transition focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/15"
                />
              </div>

              <div className="grid gap-5 sm:grid-cols-2">
                <input
                  value={form.email}
                  onChange={(event) => setForm((current) => ({ ...current, email: event.target.value }))}
                  placeholder={STATIC_CONTACT_FORM.placeholders.email}
                  className="h-[52px] w-full border border-border bg-white px-5 text-[14px] text-foreground placeholder:text-muted-foreground transition focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/15"
                />
                <div className="relative">
                  <select
                    value={form.interestedService || STATIC_CONTACT_FORM.placeholders.selectDefault}
                    onChange={(event) =>
                      setForm((current) => ({ ...current, interestedService: event.target.value }))
                    }
                    className="h-[52px] w-full appearance-none border border-border bg-white px-5 pr-10 text-[14px] text-foreground transition focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/15"
                  >
                    <option>{STATIC_CONTACT_FORM.placeholders.selectDefault}</option>
                    {serviceOptions.map((option) => (
                      <option key={option}>{option}</option>
                    ))}
                  </select>
                  <ChevronDown className="pointer-events-none absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 text-dark/60" />
                </div>
              </div>

              <textarea
                rows={6}
                value={form.message}
                onChange={(event) => setForm((current) => ({ ...current, message: event.target.value }))}
                placeholder={STATIC_CONTACT_FORM.placeholders.comments}
                className="min-h-[140px] w-full resize-none border border-border bg-white px-5 py-4 text-[14px] text-foreground placeholder:text-muted-foreground transition focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/15"
              />

              <button
                type="submit"
                disabled={submitLeadMutation.isPending}
                className="btn-gold !h-[48px] !w-full !justify-center !px-6 text-sm font-medium uppercase tracking-[0.02em]"
              >
                {submitLeadMutation.isPending ? "Submitting..." : STATIC_CONTACT_FORM.submitLabel}
                <span className="text-base">-&gt;</span>
              </button>
            </form>
          </div>
        </Reveal>

        <Reveal className="relative min-h-[540px] overflow-hidden" delay={140}>
          <img
            src={resolveContentImage(STATIC_CONTACT_FORM.image.src)}
            alt={STATIC_CONTACT_FORM.image.alt}
            className="h-full w-full object-cover"
            loading="lazy"
            decoding="async"
            width={920}
            height={760}
          />

          <div className="contact-ribbon absolute left-[34%] top-0 z-10 hidden bg-white md:flex">
            <div className="h-2 bg-primary" />
            <div className="flex flex-col items-center px-5 py-6">
              <p className="rotate-180 font-display text-[1rem] font-extrabold uppercase leading-none tracking-[0.03em] text-foreground [writing-mode:vertical-rl]">
                Contact Hadaf
              </p>
              <p className="mt-2 rotate-180 text-[12px] font-semibold tracking-[0.05em] text-foreground [writing-mode:vertical-rl]">
                {visibleDetails.find((detail) => detail.icon === "phone")?.value || "+92 342 9102008"}
              </p>
              <Phone className="mt-5 h-8 w-8 text-primary" strokeWidth={1.8} />
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
