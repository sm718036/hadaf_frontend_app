import { useState } from "react";
import { toast } from "sonner";
import { Mail, MapPin, Phone } from "lucide-react";
import { STATIC_CONTACT_FORM } from "@/content/landing-static";
import { Reveal } from "@/components/reveal";
import { SelectMenu } from "@/components/ui/select-menu";
import { usePublicLeadIntakeMetadata } from "@/features/intake-engine/use-intake-engine";
import { useSubmitPublicLead } from "@/features/leads/use-leads";
import type { SiteContent } from "@/features/site-content/site-content.schemas";
import { resolveContentImage } from "@/lib/content-assets";

type ContactProps = {
  content: SiteContent["contact"];
  serviceOptions: string[];
  countryOptions: string[];
};

const contactIcons = {
  phone: Phone,
  mail: Mail,
  "map-pin": MapPin,
} as const;

export function Contact({ content, serviceOptions, countryOptions }: ContactProps) {
  const submitLeadMutation = useSubmitPublicLead();
  const intakeMetadataQuery = usePublicLeadIntakeMetadata(true);
  const [form, setForm] = useState({
    fullName: "",
    phone: "",
    email: "",
    interestedCountryConfigurationId: "",
    interestedCountry: "",
    interestedVisaCategoryId: "",
    interestedService: "",
    message: "",
    intakeAnswers: [] as Array<{ questionId: string; optionId: string }>,
  });
  const visibleDetails = content.details.filter((detail) => detail.isVisible);
  const countries = intakeMetadataQuery.data?.countries ?? countryOptions.map((name) => ({ id: name, name, baseCurrency: "" }));
  const visaCategories = (intakeMetadataQuery.data?.visaCategories ?? [])
    .filter((item) => item.countryId === form.interestedCountryConfigurationId);
  const intakeQuestions = (intakeMetadataQuery.data?.questions ?? []).filter(
    (question) =>
      (!question.countryConfigurationId || question.countryConfigurationId === form.interestedCountryConfigurationId) &&
      (!question.visaCategoryId || question.visaCategoryId === form.interestedVisaCategoryId),
  );

  if (!content.isVisible) {
    return null;
  }

  return (
    <section id="contact" className="overflow-hidden bg-brand-soft py-20 sm:py-24">
      <div className="site-shell grid items-stretch gap-0 lg:grid-cols-2">
        <Reveal className="flex items-center bg-brand-soft pr-0 lg:pr-10">
          <div className="w-full py-4">
            <p className="section-label mb-5">{content.eyebrow}</p>
            <h2 className="text-[clamp(2rem,7vw,2.55rem)] font-extrabold leading-[1.16] text-foreground">
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
                  if (!form.fullName.trim()) {
                    toast.error("Your name is required.");
                    return;
                  }

                  if (!form.phone.trim() && !form.email.trim()) {
                    toast.error("Provide at least a phone number or email address.");
                    return;
                  }

                  await submitLeadMutation.mutateAsync({
                    fullName: form.fullName,
                    phone: form.phone,
                    email: form.email,
                    interestedCountryConfigurationId: form.interestedCountryConfigurationId || null,
                    interestedCountry: form.interestedCountry,
                    interestedVisaCategoryId: form.interestedVisaCategoryId || null,
                    interestedService: form.interestedService,
                    message: form.message,
                    intakeAnswers: form.intakeAnswers,
                    formName: "Contact Form",
                  });
                  toast.success("Your request has been received.");
                  setForm({
                    fullName: "",
                    phone: "",
                    email: "",
                    interestedCountryConfigurationId: "",
                    interestedCountry: "",
                    interestedVisaCategoryId: "",
                    interestedService: "",
                    message: "",
                    intakeAnswers: [],
                  });
                } catch (error) {
                  toast.error(
                    error instanceof Error ? error.message : "Unable to submit your request.",
                  );
                }
              }}
            >
              <div className="grid gap-5 sm:grid-cols-2">
                <input
                  value={form.fullName}
                  onChange={(event) =>
                    setForm((current) => ({ ...current, fullName: event.target.value }))
                  }
                  placeholder={STATIC_CONTACT_FORM.placeholders.name}
                  className="h-[52px] w-full border border-border bg-white px-5 text-[14px] text-foreground placeholder:text-muted-foreground transition focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/15"
                />
                <input
                  value={form.phone}
                  onChange={(event) =>
                    setForm((current) => ({ ...current, phone: event.target.value }))
                  }
                  placeholder={STATIC_CONTACT_FORM.placeholders.phone}
                  className="h-[52px] w-full border border-border bg-white px-5 text-[14px] text-foreground placeholder:text-muted-foreground transition focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/15"
                />
              </div>

              <div className="grid gap-5 sm:grid-cols-2">
                <input
                  value={form.email}
                  onChange={(event) =>
                    setForm((current) => ({ ...current, email: event.target.value }))
                  }
                  placeholder={STATIC_CONTACT_FORM.placeholders.email}
                  className="h-[52px] w-full border border-border bg-white px-5 text-[14px] text-foreground placeholder:text-muted-foreground transition focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/15"
                />
                <SelectMenu
                  value={form.interestedCountryConfigurationId}
                  onValueChange={(interestedCountryConfigurationId) =>
                    setForm((current) => {
                      const selectedCountry = countries.find((item) => item.id === interestedCountryConfigurationId);

                      return {
                        ...current,
                        interestedCountryConfigurationId,
                        interestedCountry: selectedCountry?.name ?? "",
                        interestedVisaCategoryId: "",
                        interestedService: "",
                        intakeAnswers: [],
                      };
                    })
                  }
                  placeholder="Select Country"
                  className="h-[52px] border-border px-5 text-[14px] text-foreground focus:border-primary"
                  options={countries.map((option) => ({ value: option.id, label: option.name }))}
                />
              </div>

              <div className="grid gap-5 sm:grid-cols-2">
                <SelectMenu
                  value={form.interestedVisaCategoryId}
                  onValueChange={(interestedVisaCategoryId) =>
                    setForm((current) => {
                      const selectedCategory = visaCategories.find((item) => item.id === interestedVisaCategoryId);

                      return {
                        ...current,
                        interestedVisaCategoryId,
                        interestedService: selectedCategory?.name ?? "",
                        intakeAnswers: [],
                      };
                    })
                  }
                  placeholder={STATIC_CONTACT_FORM.placeholders.selectDefault}
                  className="h-[52px] border-border px-5 text-[14px] text-foreground focus:border-primary"
                  options={
                    visaCategories.length > 0
                      ? visaCategories.map((option) => ({
                          value: option.id,
                          label: `${option.code} · ${option.name}`,
                        }))
                      : serviceOptions.map((option) => ({ value: option, label: option }))
                  }
                />
              </div>

              {intakeQuestions.length > 0 ? (
                <div className="grid gap-5">
                  {intakeQuestions.map((question) => (
                    <div key={question.id} className="border border-border bg-white px-5 py-4">
                      <p className="text-sm font-semibold text-foreground">{question.prompt}</p>
                      {question.helpText ? (
                        <p className="mt-2 text-xs leading-6 text-muted-foreground">{question.helpText}</p>
                      ) : null}
                      <div className="mt-3">
                        <SelectMenu
                          value={
                            form.intakeAnswers.find((answer) => answer.questionId === question.id)?.optionId ?? ""
                          }
                          onValueChange={(optionId) =>
                            setForm((current) => ({
                              ...current,
                              intakeAnswers: [
                                ...current.intakeAnswers.filter((answer) => answer.questionId !== question.id),
                                ...(optionId ? [{ questionId: question.id, optionId }] : []),
                              ],
                            }))
                          }
                          placeholder="Select answer"
                          className="h-[52px] border-border px-5 text-[14px] text-foreground focus:border-primary"
                          options={question.answerOptions.map((option) => ({
                            value: option.id,
                            label: option.label,
                          }))}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              ) : null}

              <textarea
                rows={6}
                value={form.message}
                onChange={(event) =>
                  setForm((current) => ({ ...current, message: event.target.value }))
                }
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

        <Reveal
          className="relative mt-10 min-h-[320px] overflow-hidden lg:mt-0 lg:min-h-[540px]"
          delay={140}
        >
          <img
            src={resolveContentImage(STATIC_CONTACT_FORM.image.src)}
            alt={STATIC_CONTACT_FORM.image.alt}
            className="h-full w-full object-cover"
            loading="lazy"
            decoding="async"
            width={920}
            height={760}
          />

          <div className="contact-ribbon absolute left-[34%] top-0 z-10 hidden bg-white xl:flex">
            <div className="h-2 bg-primary" />
            <div className="flex flex-col items-center px-5 py-6">
              <p className="rotate-180 font-display text-[1rem] font-extrabold uppercase leading-none tracking-[0.03em] text-foreground [writing-mode:vertical-rl]">
                Contact Hadaf
              </p>
              <p className="mt-2 rotate-180 text-[12px] font-semibold tracking-[0.05em] text-foreground [writing-mode:vertical-rl]">
                {visibleDetails.find((detail) => detail.icon === "phone")?.value ||
                  "+92 342 9102008"}
              </p>
              <Phone className="mt-5 h-8 w-8 text-primary" strokeWidth={1.8} />
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
