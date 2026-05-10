import { useEffect, useState, type ReactNode } from "react";
import { Eye, Pencil } from "lucide-react";
import { toast } from "sonner";
import { APP_ROUTES } from "@/config/routes";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useCurrentUser } from "@/features/auth/use-auth";
import { getDefaultInternalDashboardRoute } from "@/features/dashboard/access-control";
import { useDashboardAccess } from "@/features/dashboard/dashboard-context";
import { EmptyHint, Panel } from "@/features/dashboard/dashboard-ui";
import { type SiteContent, siteContentSchema } from "@/features/site-content/site-content.schemas";
import {
  useSiteContent,
  useUpdateSiteContent,
  useUploadSiteContentImage,
} from "@/features/site-content/use-site-content";
import { resolveContentImage } from "@/lib/content-assets";
import { useAppNavigate } from "@/lib/router";

type ModuleKey =
  | "branding"
  | "hero"
  | "offers"
  | "services"
  | "countries"
  | "team"
  | "faq"
  | "contact"
  | "workingHours";

type ModuleCardDefinition = {
  key: ModuleKey;
  title: string;
  description: string;
  status: string;
  detail: string;
};

export function DashboardContentPage() {
  const access = useDashboardAccess();
  const siteContentQuery = useSiteContent(access.canReadSiteContent);
  const updateSiteContentMutation = useUpdateSiteContent();
  const uploadSiteImageMutation = useUploadSiteContentImage();
  const [draft, setDraft] = useState<SiteContent | null>(null);
  const [activeModule, setActiveModule] = useState<ModuleKey | null>(null);
  const [uploadingFieldKey, setUploadingFieldKey] = useState<string | null>(null);

  useEffect(() => {
    if (siteContentQuery.data) {
      setDraft(siteContentQuery.data);
    }
  }, [siteContentQuery.data]);

  const updateDraft = (updater: (current: SiteContent) => SiteContent) => {
    setDraft((current) => (current ? updater(current) : current));
  };

  const uploadContentImage = async ({
    fieldKey,
    file,
    onUploaded,
  }: {
    fieldKey: string;
    file: File;
    onUploaded: (src: string) => void;
  }) => {
    try {
      setUploadingFieldKey(fieldKey);
      const uploadedAsset = await uploadSiteImageMutation.mutateAsync(file);
      onUploaded(uploadedAsset.src);
      toast.success("Image uploaded.");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Unable to upload the image.");
    } finally {
      setUploadingFieldKey((current) => (current === fieldKey ? null : current));
    }
  };

  const saveDraft = async ({ closeDialog = false }: { closeDialog?: boolean } = {}) => {
    if (!draft) {
      return;
    }

    try {
      const parsed = siteContentSchema.parse(draft);
      await updateSiteContentMutation.mutateAsync(parsed);
      toast.success("Landing content updated.");

      if (closeDialog) {
        setActiveModule(null);
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Unable to update content.");
    }
  };

  if (siteContentQuery.isLoading || !draft) {
    return (
      <Panel title="Hybrid Landing CMS" subtitle="Loading the reduced landing data model.">
        <EmptyHint message="Loading landing content..." loading />
      </Panel>
    );
  }

  if (siteContentQuery.isError) {
    return (
      <Panel
        title="Hybrid Landing CMS"
        subtitle="The frontend owns layout and styling. The backend only stores business content."
      >
        <EmptyHint message="Unable to load landing content." tone="error" />
      </Panel>
    );
  }

  const moduleCards: ModuleCardDefinition[] = [
    {
      key: "branding",
      title: "Branding",
      description: "Company name and logo settings.",
      status: draft.branding.logoVisible ? "Logo visible" : "Logo hidden",
      detail: draft.branding.companyNameVisible ? "Company name visible" : "Company name hidden",
    },
    {
      key: "hero",
      title: "Hero",
      description: "Main headline, CTA copy, and hero banners.",
      status: draft.hero.isVisible ? "Section visible" : "Section hidden",
      detail: `${draft.hero.banners.filter((item) => item.isVisible).length}/${draft.hero.banners.length} banners visible`,
    },
    {
      key: "offers",
      title: "Flyers & Offers",
      description: "Homepage flyer dialog content and campaigns.",
      status: draft.offers.isVisible ? "Dialog enabled" : "Dialog hidden",
      detail: `${draft.offers.items.filter((item) => item.isVisible).length}/${draft.offers.items.length} flyers live`,
    },
    {
      key: "services",
      title: "Services",
      description: "Service list, icons, and visibility.",
      status: draft.services.isVisible ? "Section visible" : "Section hidden",
      detail: `${draft.services.items.filter((item) => item.isVisible).length}/${draft.services.items.length} services visible`,
    },
    {
      key: "countries",
      title: "Countries",
      description: "Destination list and destination-specific points.",
      status: draft.countries.isVisible ? "Section visible" : "Section hidden",
      detail: `${draft.countries.items.filter((item) => item.isVisible).length}/${draft.countries.items.length} countries visible`,
    },
    {
      key: "team",
      title: "Team Members",
      description: "Team listing and short role summaries.",
      status: draft.team.isVisible ? "Section visible" : "Section hidden",
      detail: `${draft.team.members.filter((item) => item.isVisible).length}/${draft.team.members.length} team entries visible`,
    },
    {
      key: "faq",
      title: "FAQs",
      description: "Questions, answers, and section visibility.",
      status: draft.faq.isVisible ? "Section visible" : "Section hidden",
      detail: `${draft.faq.items.filter((item) => item.isVisible).length}/${draft.faq.items.length} FAQs visible`,
    },
    {
      key: "contact",
      title: "Contact Details",
      description: "Contact copy and communication methods.",
      status: draft.contact.isVisible ? "Section visible" : "Section hidden",
      detail: `${draft.contact.details.filter((item) => item.isVisible).length}/${draft.contact.details.length} contact methods visible`,
    },
    {
      key: "workingHours",
      title: "Working Hours",
      description: "Public opening hours shown in the footer.",
      status: "Footer schedule",
      detail: `${draft.workingHours.items.filter((item) => item.isVisible).length}/${draft.workingHours.items.length} schedule rows visible`,
    },
  ];

  const activeModuleDefinition = moduleCards.find((module) => module.key === activeModule) ?? null;

  const renderModuleEditor = (moduleKey: ModuleKey) => {
    switch (moduleKey) {
      case "branding":
        return (
          <div className="grid gap-4 md:grid-cols-2">
            <TextField
              label="Company Name"
              value={draft.branding.companyName}
              disabled={!access.canWriteSiteContent}
              onChange={(value) =>
                updateDraft((current) => ({
                  ...current,
                  branding: { ...current.branding, companyName: value },
                }))
              }
            />
            <CheckboxField
              label="Show Company Name"
              checked={draft.branding.companyNameVisible}
              disabled={!access.canWriteSiteContent}
              onChange={(checked) =>
                updateDraft((current) => ({
                  ...current,
                  branding: { ...current.branding, companyNameVisible: checked },
                }))
              }
            />
            <ImageField
              label="Logo Source"
              value={draft.branding.logo.src}
              disabled={!access.canWriteSiteContent}
              onChange={(value) =>
                updateDraft((current) => ({
                  ...current,
                  branding: {
                    ...current.branding,
                    logo: { ...current.branding.logo, src: value },
                  },
                }))
              }
              uploading={uploadingFieldKey === "branding.logo"}
              onFileSelect={
                access.canWriteSiteContent
                  ? (file) =>
                      void uploadContentImage({
                        fieldKey: "branding.logo",
                        file,
                        onUploaded: (src) =>
                          updateDraft((current) => ({
                            ...current,
                            branding: {
                              ...current.branding,
                              logo: { ...current.branding.logo, src },
                            },
                          })),
                      })
                  : undefined
              }
            />
            <TextField
              label="Logo Alt"
              value={draft.branding.logo.alt}
              disabled={!access.canWriteSiteContent}
              onChange={(value) =>
                updateDraft((current) => ({
                  ...current,
                  branding: {
                    ...current.branding,
                    logo: { ...current.branding.logo, alt: value },
                  },
                }))
              }
            />
            <CheckboxField
              label="Show Logo"
              checked={draft.branding.logoVisible}
              disabled={!access.canWriteSiteContent}
              onChange={(checked) =>
                updateDraft((current) => ({
                  ...current,
                  branding: { ...current.branding, logoVisible: checked },
                }))
              }
            />
          </div>
        );

      case "hero":
        return (
          <div className="space-y-6">
            <div className="grid gap-4 md:grid-cols-2">
              <CheckboxField
                label="Show Hero Section"
                checked={draft.hero.isVisible}
                disabled={!access.canWriteSiteContent}
                onChange={(checked) =>
                  updateDraft((current) => ({
                    ...current,
                    hero: { ...current.hero, isVisible: checked },
                  }))
                }
              />
              <TextField
                label="Eyebrow"
                value={draft.hero.eyebrow}
                disabled={!access.canWriteSiteContent}
                onChange={(value) =>
                  updateDraft((current) => ({
                    ...current,
                    hero: { ...current.hero, eyebrow: value },
                  }))
                }
              />
              <TextField
                label="Title"
                value={draft.hero.title}
                disabled={!access.canWriteSiteContent}
                onChange={(value) =>
                  updateDraft((current) => ({
                    ...current,
                    hero: { ...current.hero, title: value },
                  }))
                }
              />
              <TextField
                label="Accent Text"
                value={draft.hero.accentText}
                disabled={!access.canWriteSiteContent}
                onChange={(value) =>
                  updateDraft((current) => ({
                    ...current,
                    hero: { ...current.hero, accentText: value },
                  }))
                }
              />
              <TextAreaField
                className="md:col-span-2"
                label="Description"
                value={draft.hero.description}
                disabled={!access.canWriteSiteContent}
                onChange={(value) =>
                  updateDraft((current) => ({
                    ...current,
                    hero: { ...current.hero, description: value },
                  }))
                }
              />
              <TextField
                label="Primary Button Label"
                value={draft.hero.primaryButtonLabel}
                disabled={!access.canWriteSiteContent}
                onChange={(value) =>
                  updateDraft((current) => ({
                    ...current,
                    hero: { ...current.hero, primaryButtonLabel: value },
                  }))
                }
              />
              <TextField
                label="Primary Button Link"
                value={draft.hero.primaryButtonHref}
                disabled={!access.canWriteSiteContent}
                onChange={(value) =>
                  updateDraft((current) => ({
                    ...current,
                    hero: { ...current.hero, primaryButtonHref: value },
                  }))
                }
              />
              <TextField
                label="Secondary Button Label"
                value={draft.hero.secondaryButtonLabel}
                disabled={!access.canWriteSiteContent}
                onChange={(value) =>
                  updateDraft((current) => ({
                    ...current,
                    hero: { ...current.hero, secondaryButtonLabel: value },
                  }))
                }
              />
              <TextField
                label="Secondary Button Link"
                value={draft.hero.secondaryButtonHref}
                disabled={!access.canWriteSiteContent}
                onChange={(value) =>
                  updateDraft((current) => ({
                    ...current,
                    hero: { ...current.hero, secondaryButtonHref: value },
                  }))
                }
              />
            </div>

            <HeroBannerEditor
              items={draft.hero.banners}
              readOnly={!access.canWriteSiteContent}
              uploadingFieldKey={uploadingFieldKey}
              onUploadImage={(fieldKey, file, onUploaded) =>
                void uploadContentImage({ fieldKey, file, onUploaded })
              }
              onChange={(banners) =>
                updateDraft((current) => ({
                  ...current,
                  hero: { ...current.hero, banners },
                }))
              }
            />
          </div>
        );

      case "offers":
        return (
          <div className="space-y-6">
            <div className="grid gap-4 md:grid-cols-2">
              <CheckboxField
                label="Show Flyer Dialog"
                checked={draft.offers.isVisible}
                disabled={!access.canWriteSiteContent}
                onChange={(checked) =>
                  updateDraft((current) => ({
                    ...current,
                    offers: { ...current.offers, isVisible: checked },
                  }))
                }
              />
              <TextField
                label="Eyebrow"
                value={draft.offers.eyebrow}
                disabled={!access.canWriteSiteContent}
                onChange={(value) =>
                  updateDraft((current) => ({
                    ...current,
                    offers: { ...current.offers, eyebrow: value },
                  }))
                }
              />
              <TextField
                label="Title"
                value={draft.offers.title}
                disabled={!access.canWriteSiteContent}
                onChange={(value) =>
                  updateDraft((current) => ({
                    ...current,
                    offers: { ...current.offers, title: value },
                  }))
                }
              />
              <TextAreaField
                className="md:col-span-2"
                label="Description"
                value={draft.offers.description}
                disabled={!access.canWriteSiteContent}
                onChange={(value) =>
                  updateDraft((current) => ({
                    ...current,
                    offers: { ...current.offers, description: value },
                  }))
                }
              />
            </div>

            <OfferEditor
              items={draft.offers.items}
              readOnly={!access.canWriteSiteContent}
              uploadingFieldKey={uploadingFieldKey}
              onUploadImage={(fieldKey, file, onUploaded) =>
                void uploadContentImage({ fieldKey, file, onUploaded })
              }
              onChange={(items) =>
                updateDraft((current) => ({
                  ...current,
                  offers: { ...current.offers, items },
                }))
              }
            />
          </div>
        );

      case "services":
        return (
          <div className="space-y-6">
            <SectionHeader
              visible={draft.services.isVisible}
              onVisibleChange={(checked) =>
                updateDraft((current) => ({
                  ...current,
                  services: { ...current.services, isVisible: checked },
                }))
              }
              disabled={!access.canWriteSiteContent}
            />
            <div className="grid gap-4 md:grid-cols-2">
              <TextField
                label="Eyebrow"
                value={draft.services.eyebrow}
                disabled={!access.canWriteSiteContent}
                onChange={(value) =>
                  updateDraft((current) => ({
                    ...current,
                    services: { ...current.services, eyebrow: value },
                  }))
                }
              />
              <TextField
                label="Title"
                value={draft.services.title}
                disabled={!access.canWriteSiteContent}
                onChange={(value) =>
                  updateDraft((current) => ({
                    ...current,
                    services: { ...current.services, title: value },
                  }))
                }
              />
              <TextAreaField
                className="md:col-span-2"
                label="Description"
                value={draft.services.description}
                disabled={!access.canWriteSiteContent}
                onChange={(value) =>
                  updateDraft((current) => ({
                    ...current,
                    services: { ...current.services, description: value },
                  }))
                }
              />
            </div>

            <ServiceEditor
              items={draft.services.items}
              readOnly={!access.canWriteSiteContent}
              onChange={(items) =>
                updateDraft((current) => ({
                  ...current,
                  services: { ...current.services, items },
                }))
              }
            />
          </div>
        );

      case "countries":
        return (
          <div className="space-y-6">
            <SectionHeader
              visible={draft.countries.isVisible}
              onVisibleChange={(checked) =>
                updateDraft((current) => ({
                  ...current,
                  countries: { ...current.countries, isVisible: checked },
                }))
              }
              disabled={!access.canWriteSiteContent}
            />
            <div className="grid gap-4 md:grid-cols-2">
              <TextField
                label="Eyebrow"
                value={draft.countries.eyebrow}
                disabled={!access.canWriteSiteContent}
                onChange={(value) =>
                  updateDraft((current) => ({
                    ...current,
                    countries: { ...current.countries, eyebrow: value },
                  }))
                }
              />
              <TextField
                label="Title"
                value={draft.countries.title}
                disabled={!access.canWriteSiteContent}
                onChange={(value) =>
                  updateDraft((current) => ({
                    ...current,
                    countries: { ...current.countries, title: value },
                  }))
                }
              />
              <TextField
                label="Item Label"
                value={draft.countries.itemLabel}
                disabled={!access.canWriteSiteContent}
                onChange={(value) =>
                  updateDraft((current) => ({
                    ...current,
                    countries: { ...current.countries, itemLabel: value },
                  }))
                }
              />
              <TextAreaField
                className="md:col-span-2"
                label="Description"
                value={draft.countries.description}
                disabled={!access.canWriteSiteContent}
                onChange={(value) =>
                  updateDraft((current) => ({
                    ...current,
                    countries: { ...current.countries, description: value },
                  }))
                }
              />
            </div>

            <CountryEditor
              items={draft.countries.items}
              readOnly={!access.canWriteSiteContent}
              onChange={(items) =>
                updateDraft((current) => ({
                  ...current,
                  countries: { ...current.countries, items },
                }))
              }
            />
          </div>
        );

      case "team":
        return (
          <div className="space-y-6">
            <SectionHeader
              visible={draft.team.isVisible}
              onVisibleChange={(checked) =>
                updateDraft((current) => ({
                  ...current,
                  team: { ...current.team, isVisible: checked },
                }))
              }
              disabled={!access.canWriteSiteContent}
            />
            <div className="grid gap-4 md:grid-cols-2">
              <TextField
                label="Eyebrow"
                value={draft.team.eyebrow}
                disabled={!access.canWriteSiteContent}
                onChange={(value) =>
                  updateDraft((current) => ({
                    ...current,
                    team: { ...current.team, eyebrow: value },
                  }))
                }
              />
              <TextField
                label="Title"
                value={draft.team.title}
                disabled={!access.canWriteSiteContent}
                onChange={(value) =>
                  updateDraft((current) => ({
                    ...current,
                    team: { ...current.team, title: value },
                  }))
                }
              />
              <TextAreaField
                className="md:col-span-2"
                label="Description"
                value={draft.team.description}
                disabled={!access.canWriteSiteContent}
                onChange={(value) =>
                  updateDraft((current) => ({
                    ...current,
                    team: { ...current.team, description: value },
                  }))
                }
              />
            </div>

            <TeamEditor
              items={draft.team.members}
              readOnly={!access.canWriteSiteContent}
              onChange={(members) =>
                updateDraft((current) => ({
                  ...current,
                  team: { ...current.team, members },
                }))
              }
            />
          </div>
        );

      case "faq":
        return (
          <div className="space-y-6">
            <SectionHeader
              visible={draft.faq.isVisible}
              onVisibleChange={(checked) =>
                updateDraft((current) => ({
                  ...current,
                  faq: { ...current.faq, isVisible: checked },
                }))
              }
              disabled={!access.canWriteSiteContent}
            />
            <div className="grid gap-4 md:grid-cols-2">
              <TextField
                label="Eyebrow"
                value={draft.faq.eyebrow}
                disabled={!access.canWriteSiteContent}
                onChange={(value) =>
                  updateDraft((current) => ({
                    ...current,
                    faq: { ...current.faq, eyebrow: value },
                  }))
                }
              />
              <TextField
                label="Title"
                value={draft.faq.title}
                disabled={!access.canWriteSiteContent}
                onChange={(value) =>
                  updateDraft((current) => ({
                    ...current,
                    faq: { ...current.faq, title: value },
                  }))
                }
              />
              <TextAreaField
                className="md:col-span-2"
                label="Description"
                value={draft.faq.description}
                disabled={!access.canWriteSiteContent}
                onChange={(value) =>
                  updateDraft((current) => ({
                    ...current,
                    faq: { ...current.faq, description: value },
                  }))
                }
              />
            </div>

            <FaqEditor
              items={draft.faq.items}
              readOnly={!access.canWriteSiteContent}
              onChange={(items) =>
                updateDraft((current) => ({
                  ...current,
                  faq: { ...current.faq, items },
                }))
              }
            />
          </div>
        );

      case "contact":
        return (
          <div className="space-y-6">
            <SectionHeader
              visible={draft.contact.isVisible}
              onVisibleChange={(checked) =>
                updateDraft((current) => ({
                  ...current,
                  contact: { ...current.contact, isVisible: checked },
                }))
              }
              disabled={!access.canWriteSiteContent}
            />
            <div className="grid gap-4 md:grid-cols-2">
              <TextField
                label="Eyebrow"
                value={draft.contact.eyebrow}
                disabled={!access.canWriteSiteContent}
                onChange={(value) =>
                  updateDraft((current) => ({
                    ...current,
                    contact: { ...current.contact, eyebrow: value },
                  }))
                }
              />
              <TextField
                label="Title"
                value={draft.contact.title}
                disabled={!access.canWriteSiteContent}
                onChange={(value) =>
                  updateDraft((current) => ({
                    ...current,
                    contact: { ...current.contact, title: value },
                  }))
                }
              />
              <TextAreaField
                className="md:col-span-2"
                label="Description"
                value={draft.contact.description}
                disabled={!access.canWriteSiteContent}
                onChange={(value) =>
                  updateDraft((current) => ({
                    ...current,
                    contact: { ...current.contact, description: value },
                  }))
                }
              />
            </div>

            <ContactDetailsEditor
              items={draft.contact.details}
              readOnly={!access.canWriteSiteContent}
              onChange={(details) =>
                updateDraft((current) => ({
                  ...current,
                  contact: { ...current.contact, details },
                }))
              }
            />
          </div>
        );

      case "workingHours":
        return (
          <div className="space-y-6">
            <div className="grid gap-4 md:grid-cols-2">
              <TextField
                label="Section Title"
                value={draft.workingHours.title}
                disabled={!access.canWriteSiteContent}
                onChange={(value) =>
                  updateDraft((current) => ({
                    ...current,
                    workingHours: { ...current.workingHours, title: value },
                  }))
                }
              />
            </div>

            <WorkingHoursEditor
              items={draft.workingHours.items}
              readOnly={!access.canWriteSiteContent}
              onChange={(items) =>
                updateDraft((current) => ({
                  ...current,
                  workingHours: { ...current.workingHours, items },
                }))
              }
            />
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <>
      <Panel
        title="Hybrid Landing CMS"
        subtitle="Landing content is grouped into modules. Open a dialog to add, update, hide, or manage a section."
        action={
          access.canWriteSiteContent ? (
            <div className="flex flex-wrap gap-3">
              <button
                type="button"
                onClick={() => {
                  setDraft(siteContentQuery.data);
                  toast.success("Landing content reset.");
                }}
                className="rounded-2xl border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
              >
                Reset Changes
              </button>
              <button
                type="button"
                onClick={() => void saveDraft()}
                disabled={updateSiteContentMutation.isPending}
                className="btn-gold min-w-[160px] justify-center"
              >
                {updateSiteContentMutation.isPending ? "Saving..." : "Save Content"}
              </button>
            </div>
          ) : undefined
        }
      >
        <div className="space-y-6">
          <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {moduleCards.map((module) => (
              <ModuleCard
                key={module.key}
                title={module.title}
                description={module.description}
                canEdit={access.canWriteSiteContent}
                onOpen={() => setActiveModule(module.key)}
              />
            ))}
          </div>
        </div>
      </Panel>

      <Dialog
        open={Boolean(activeModuleDefinition)}
        onOpenChange={(open) => !open && setActiveModule(null)}
      >
        <DialogContent className="max-h-[92vh] max-w-6xl overflow-hidden rounded-[28px] border border-slate-200 bg-white p-0">
          {activeModuleDefinition ? (
            <>
              <DialogHeader className="border-b border-slate-200 px-6 py-5">
                <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
                  <div className="pr-10">
                    <DialogTitle className="text-2xl font-display font-extrabold text-slate-950">
                      {activeModuleDefinition.title}
                    </DialogTitle>
                    <DialogDescription className="mt-2 text-sm leading-6 text-slate-500">
                      {activeModuleDefinition.description}
                    </DialogDescription>
                  </div>

                  <div className="flex flex-wrap items-center gap-2 mr-20">
                    {access.canWriteSiteContent ? (
                      <button
                        type="button"
                        onClick={() => void saveDraft({ closeDialog: true })}
                        disabled={updateSiteContentMutation.isPending}
                        className="btn-gold min-w-[150px] justify-center"
                      >
                        {updateSiteContentMutation.isPending ? "Saving..." : "Save Module Changes"}
                      </button>
                    ) : null}
                  </div>
                </div>
              </DialogHeader>

              <div className="max-h-[calc(92vh-124px)] overflow-y-auto px-6 py-6">
                {renderModuleEditor(activeModuleDefinition.key)}
              </div>
            </>
          ) : null}
        </DialogContent>
      </Dialog>
    </>
  );
}

export function DashboardContentRedirect() {
  const navigate = useAppNavigate();
  const { data: currentUser, isLoading } = useCurrentUser();

  useEffect(() => {
    if (isLoading) {
      return;
    }

    if (!currentUser) {
      navigate(APP_ROUTES.auth, {
        replace: true,
        search: { redirect: APP_ROUTES.dashboardContent, mode: "staff" },
      });
      return;
    }

    if (currentUser.role !== "admin") {
      navigate(getDefaultInternalDashboardRoute(currentUser), { replace: true });
      return;
    }

    navigate(APP_ROUTES.dashboardAdminContent, { replace: true });
  }, [currentUser, isLoading, navigate]);

  return null;
}

function createId(prefix: string) {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return `${prefix}-${crypto.randomUUID()}`;
  }

  return `${prefix}-${Math.random().toString(36).slice(2, 10)}`;
}

function ModuleCard({
  title,
  description,
  canEdit,
  onOpen,
}: {
  title: string;
  description: string;
  canEdit: boolean;
  onOpen: () => void;
}) {
  return (
    <div className="rounded-[24px] border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between gap-4">
        <h3 className="text-2xl font-display font-extrabold text-slate-950">{title}</h3>
        <button
          type="button"
          onClick={onOpen}
          aria-label={canEdit ? `Manage ${title}` : `View ${title}`}
          title={canEdit ? `Manage ${title}` : `View ${title}`}
          className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-gold text-dark shadow-sm transition hover:scale-[1.03] hover:shadow-md"
        >
          {canEdit ? <Pencil className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
        </button>
      </div>
      <p className="mt-2 text-sm leading-6 text-slate-500">{description}</p>
    </div>
  );
}

function ModuleMetaPill({
  children,
  tone = "default",
}: {
  children: ReactNode;
  tone?: "default" | "muted";
}) {
  return (
    <span
      className={
        tone === "muted"
          ? "inline-flex rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600"
          : "inline-flex rounded-full bg-gold/20 px-3 py-1 text-xs font-semibold text-dark"
      }
    >
      {children}
    </span>
  );
}

function SectionHeader({
  visible,
  onVisibleChange,
  disabled,
}: {
  visible: boolean;
  onVisibleChange: (checked: boolean) => void;
  disabled: boolean;
}) {
  return (
    <CheckboxField
      label="Show Section"
      checked={visible}
      disabled={disabled}
      onChange={onVisibleChange}
    />
  );
}

function ItemList({
  title,
  onAdd,
  readOnly,
  children,
}: {
  title: string;
  onAdd: () => void;
  readOnly: boolean;
  children: ReactNode;
}) {
  return (
    <div className="space-y-4 rounded-[24px] border border-slate-200 bg-slate-50 p-4">
      <div className="flex items-center justify-between gap-4">
        <h4 className="text-sm font-semibold uppercase tracking-[0.18em] text-slate-500">
          {title}
        </h4>
        {!readOnly ? (
          <button
            type="button"
            onClick={onAdd}
            className="rounded-full bg-gold px-3 py-1 text-xs font-semibold text-dark"
          >
            Add
          </button>
        ) : null}
      </div>
      <div className="space-y-4">{children}</div>
    </div>
  );
}

function ItemCard({
  title,
  visible,
  onVisibleChange,
  onRemove,
  readOnly,
  children,
}: {
  title: string;
  visible: boolean;
  onVisibleChange: (checked: boolean) => void;
  onRemove: () => void;
  readOnly: boolean;
  children: ReactNode;
}) {
  return (
    <div className="rounded-[22px] border border-slate-200 bg-white p-4 shadow-sm">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div className="text-sm font-semibold text-slate-900">{title}</div>
        <div className="flex items-center gap-3">
          <CheckboxField
            label="Visible"
            checked={visible}
            disabled={readOnly}
            onChange={onVisibleChange}
            compact
          />
          {!readOnly ? <RemoveButton onClick={onRemove} /> : null}
        </div>
      </div>
      <div className="grid gap-4 md:grid-cols-2">{children}</div>
    </div>
  );
}

function HeroBannerEditor({
  items,
  onChange,
  readOnly,
  onUploadImage,
  uploadingFieldKey,
}: {
  items: SiteContent["hero"]["banners"];
  onChange: (items: SiteContent["hero"]["banners"]) => void;
  readOnly: boolean;
  onUploadImage: (fieldKey: string, file: File, onUploaded: (src: string) => void) => void;
  uploadingFieldKey: string | null;
}) {
  return (
    <ItemList
      title="Hero Banners / Ads"
      readOnly={readOnly}
      onAdd={() =>
        onChange([
          ...items,
          {
            id: createId("hero-banner"),
            title: "",
            subtitle: "",
            image: { src: "", alt: "" },
            linkLabel: "",
            linkHref: "",
            isVisible: true,
          },
        ])
      }
    >
      {items.map((item, index) => (
        <ItemCard
          key={item.id}
          title={`Banner ${index + 1}`}
          visible={item.isVisible}
          readOnly={readOnly}
          onVisibleChange={(isVisible) =>
            onChange(items.map((entry) => (entry.id === item.id ? { ...entry, isVisible } : entry)))
          }
          onRemove={() => onChange(items.filter((entry) => entry.id !== item.id))}
        >
          <TextField
            label="Title"
            value={item.title}
            disabled={readOnly}
            onChange={(title) =>
              onChange(items.map((entry) => (entry.id === item.id ? { ...entry, title } : entry)))
            }
          />
          <TextField
            label="Subtitle"
            value={item.subtitle}
            disabled={readOnly}
            onChange={(subtitle) =>
              onChange(
                items.map((entry) => (entry.id === item.id ? { ...entry, subtitle } : entry)),
              )
            }
          />
          <ImageField
            label="Image Source"
            value={item.image.src}
            disabled={readOnly}
            onChange={(src) =>
              onChange(
                items.map((entry) =>
                  entry.id === item.id ? { ...entry, image: { ...entry.image, src } } : entry,
                ),
              )
            }
            uploading={uploadingFieldKey === `hero-banner-image-${item.id}`}
            onFileSelect={
              readOnly
                ? undefined
                : (file) =>
                    onUploadImage(`hero-banner-image-${item.id}`, file, (src) =>
                      onChange(
                        items.map((entry) =>
                          entry.id === item.id
                            ? { ...entry, image: { ...entry.image, src } }
                            : entry,
                        ),
                      ),
                    )
            }
          />
          <TextField
            label="Image Alt"
            value={item.image.alt}
            disabled={readOnly}
            onChange={(alt) =>
              onChange(
                items.map((entry) =>
                  entry.id === item.id ? { ...entry, image: { ...entry.image, alt } } : entry,
                ),
              )
            }
          />
          <TextField
            label="Link Label"
            value={item.linkLabel}
            disabled={readOnly}
            onChange={(linkLabel) =>
              onChange(
                items.map((entry) => (entry.id === item.id ? { ...entry, linkLabel } : entry)),
              )
            }
          />
          <TextField
            label="Link Href"
            value={item.linkHref}
            disabled={readOnly}
            onChange={(linkHref) =>
              onChange(
                items.map((entry) => (entry.id === item.id ? { ...entry, linkHref } : entry)),
              )
            }
          />
        </ItemCard>
      ))}
    </ItemList>
  );
}

function OfferEditor({
  items,
  onChange,
  readOnly,
  onUploadImage,
  uploadingFieldKey,
}: {
  items: SiteContent["offers"]["items"];
  onChange: (items: SiteContent["offers"]["items"]) => void;
  readOnly: boolean;
  onUploadImage: (fieldKey: string, file: File, onUploaded: (src: string) => void) => void;
  uploadingFieldKey: string | null;
}) {
  return (
    <ItemList
      title="Flyers / Offers"
      readOnly={readOnly}
      onAdd={() =>
        onChange([
          ...items,
          {
            id: createId("offer"),
            tag: "",
            title: "",
            description: "",
            image: { src: "", alt: "" },
            buttonLabel: "",
            buttonHref: "",
            isVisible: true,
          },
        ])
      }
    >
      {items.map((item, index) => (
        <ItemCard
          key={item.id}
          title={`Offer ${index + 1}`}
          visible={item.isVisible}
          readOnly={readOnly}
          onVisibleChange={(isVisible) =>
            onChange(items.map((entry) => (entry.id === item.id ? { ...entry, isVisible } : entry)))
          }
          onRemove={() => onChange(items.filter((entry) => entry.id !== item.id))}
        >
          <TextField
            label="Tag"
            value={item.tag}
            disabled={readOnly}
            onChange={(tag) =>
              onChange(items.map((entry) => (entry.id === item.id ? { ...entry, tag } : entry)))
            }
          />
          <TextField
            label="Title"
            value={item.title}
            disabled={readOnly}
            onChange={(title) =>
              onChange(items.map((entry) => (entry.id === item.id ? { ...entry, title } : entry)))
            }
          />
          <TextAreaField
            className="md:col-span-2"
            label="Description"
            value={item.description}
            disabled={readOnly}
            onChange={(description) =>
              onChange(
                items.map((entry) => (entry.id === item.id ? { ...entry, description } : entry)),
              )
            }
          />
          <ImageField
            label="Image Source"
            value={item.image.src}
            disabled={readOnly}
            onChange={(src) =>
              onChange(
                items.map((entry) =>
                  entry.id === item.id ? { ...entry, image: { ...entry.image, src } } : entry,
                ),
              )
            }
            uploading={uploadingFieldKey === `offer-image-${item.id}`}
            onFileSelect={
              readOnly
                ? undefined
                : (file) =>
                    onUploadImage(`offer-image-${item.id}`, file, (src) =>
                      onChange(
                        items.map((entry) =>
                          entry.id === item.id
                            ? { ...entry, image: { ...entry.image, src } }
                            : entry,
                        ),
                      ),
                    )
            }
          />
          <TextField
            label="Image Alt"
            value={item.image.alt}
            disabled={readOnly}
            onChange={(alt) =>
              onChange(
                items.map((entry) =>
                  entry.id === item.id ? { ...entry, image: { ...entry.image, alt } } : entry,
                ),
              )
            }
          />
          <TextField
            label="Button Label"
            value={item.buttonLabel}
            disabled={readOnly}
            onChange={(buttonLabel) =>
              onChange(
                items.map((entry) => (entry.id === item.id ? { ...entry, buttonLabel } : entry)),
              )
            }
          />
          <TextField
            label="Button Href"
            value={item.buttonHref}
            disabled={readOnly}
            onChange={(buttonHref) =>
              onChange(
                items.map((entry) => (entry.id === item.id ? { ...entry, buttonHref } : entry)),
              )
            }
          />
        </ItemCard>
      ))}
    </ItemList>
  );
}

function ServiceEditor({
  items,
  onChange,
  readOnly,
}: {
  items: SiteContent["services"]["items"];
  onChange: (items: SiteContent["services"]["items"]) => void;
  readOnly: boolean;
}) {
  return (
    <ItemList
      title="Service Items"
      readOnly={readOnly}
      onAdd={() =>
        onChange([
          ...items,
          {
            id: createId("service"),
            icon: "briefcase-business",
            flag: "",
            title: "",
            description: "",
            isVisible: true,
          },
        ])
      }
    >
      {items.map((item, index) => (
        <ItemCard
          key={item.id}
          title={`Service ${index + 1}`}
          visible={item.isVisible}
          readOnly={readOnly}
          onVisibleChange={(isVisible) =>
            onChange(items.map((entry) => (entry.id === item.id ? { ...entry, isVisible } : entry)))
          }
          onRemove={() => onChange(items.filter((entry) => entry.id !== item.id))}
        >
          <SelectField
            label="Icon"
            value={item.icon}
            disabled={readOnly}
            options={[
              { value: "graduation-cap", label: "Graduation Cap" },
              { value: "plane", label: "Plane" },
              { value: "briefcase-business", label: "Briefcase" },
              { value: "file-text", label: "File Text" },
              { value: "message-square-text", label: "Message" },
              { value: "folder-check", label: "Folder Check" },
              { value: "languages", label: "Languages" },
              { value: "shield-check", label: "Shield Check" },
            ]}
            onChange={(icon) =>
              onChange(
                items.map((entry) =>
                  entry.id === item.id ? { ...entry, icon: icon as typeof item.icon } : entry,
                ),
              )
            }
          />
          <TextField
            label="Flag"
            value={item.flag}
            disabled={readOnly}
            onChange={(flag) =>
              onChange(items.map((entry) => (entry.id === item.id ? { ...entry, flag } : entry)))
            }
          />
          <TextField
            label="Title"
            value={item.title}
            disabled={readOnly}
            onChange={(title) =>
              onChange(items.map((entry) => (entry.id === item.id ? { ...entry, title } : entry)))
            }
          />
          <TextAreaField
            className="md:col-span-2"
            label="Description"
            value={item.description}
            disabled={readOnly}
            onChange={(description) =>
              onChange(
                items.map((entry) => (entry.id === item.id ? { ...entry, description } : entry)),
              )
            }
          />
        </ItemCard>
      ))}
    </ItemList>
  );
}

function CountryEditor({
  items,
  onChange,
  readOnly,
}: {
  items: SiteContent["countries"]["items"];
  onChange: (items: SiteContent["countries"]["items"]) => void;
  readOnly: boolean;
}) {
  return (
    <ItemList
      title="Country Items"
      readOnly={readOnly}
      onAdd={() =>
        onChange([
          ...items,
          {
            id: createId("country"),
            name: "",
            flagClassName: "",
            description: "",
            points: [""],
            buttonLabel: "",
            buttonHref: "",
            isVisible: true,
          },
        ])
      }
    >
      {items.map((item, index) => (
        <ItemCard
          key={item.id}
          title={`Country ${index + 1}`}
          visible={item.isVisible}
          readOnly={readOnly}
          onVisibleChange={(isVisible) =>
            onChange(items.map((entry) => (entry.id === item.id ? { ...entry, isVisible } : entry)))
          }
          onRemove={() => onChange(items.filter((entry) => entry.id !== item.id))}
        >
          <TextField
            label="Name"
            value={item.name}
            disabled={readOnly}
            onChange={(name) =>
              onChange(items.map((entry) => (entry.id === item.id ? { ...entry, name } : entry)))
            }
          />
          <TextField
            label="Flag Class"
            value={item.flagClassName}
            disabled={readOnly}
            onChange={(flagClassName) =>
              onChange(
                items.map((entry) => (entry.id === item.id ? { ...entry, flagClassName } : entry)),
              )
            }
          />
          <TextAreaField
            className="md:col-span-2"
            label="Description"
            value={item.description}
            disabled={readOnly}
            onChange={(description) =>
              onChange(
                items.map((entry) => (entry.id === item.id ? { ...entry, description } : entry)),
              )
            }
          />
          <TextAreaField
            className="md:col-span-2"
            label="Points"
            value={item.points.join("\n")}
            disabled={readOnly}
            onChange={(value) =>
              onChange(
                items.map((entry) =>
                  entry.id === item.id
                    ? {
                        ...entry,
                        points: value
                          .split("\n")
                          .map((point) => point.trim())
                          .filter((point) => point.length > 0),
                      }
                    : entry,
                ),
              )
            }
          />
          <TextField
            label="Button Label"
            value={item.buttonLabel}
            disabled={readOnly}
            onChange={(buttonLabel) =>
              onChange(
                items.map((entry) => (entry.id === item.id ? { ...entry, buttonLabel } : entry)),
              )
            }
          />
          <TextField
            label="Button Href"
            value={item.buttonHref}
            disabled={readOnly}
            onChange={(buttonHref) =>
              onChange(
                items.map((entry) => (entry.id === item.id ? { ...entry, buttonHref } : entry)),
              )
            }
          />
        </ItemCard>
      ))}
    </ItemList>
  );
}

function TeamEditor({
  items,
  onChange,
  readOnly,
}: {
  items: SiteContent["team"]["members"];
  onChange: (items: SiteContent["team"]["members"]) => void;
  readOnly: boolean;
}) {
  return (
    <ItemList
      title="Team Members"
      readOnly={readOnly}
      onAdd={() =>
        onChange([
          ...items,
          {
            id: createId("team-member"),
            name: "",
            role: "",
            isVisible: true,
          },
        ])
      }
    >
      {items.map((item, index) => (
        <ItemCard
          key={item.id}
          title={`Member ${index + 1}`}
          visible={item.isVisible}
          readOnly={readOnly}
          onVisibleChange={(isVisible) =>
            onChange(items.map((entry) => (entry.id === item.id ? { ...entry, isVisible } : entry)))
          }
          onRemove={() => onChange(items.filter((entry) => entry.id !== item.id))}
        >
          <TextField
            label="Name"
            value={item.name}
            disabled={readOnly}
            onChange={(name) =>
              onChange(items.map((entry) => (entry.id === item.id ? { ...entry, name } : entry)))
            }
          />
          <TextAreaField
            className="md:col-span-2"
            label="Role / Description"
            value={item.role}
            disabled={readOnly}
            onChange={(role) =>
              onChange(items.map((entry) => (entry.id === item.id ? { ...entry, role } : entry)))
            }
          />
        </ItemCard>
      ))}
    </ItemList>
  );
}

function FaqEditor({
  items,
  onChange,
  readOnly,
}: {
  items: SiteContent["faq"]["items"];
  onChange: (items: SiteContent["faq"]["items"]) => void;
  readOnly: boolean;
}) {
  return (
    <ItemList
      title="FAQs"
      readOnly={readOnly}
      onAdd={() =>
        onChange([
          ...items,
          {
            id: createId("faq"),
            question: "",
            answer: "",
            isVisible: true,
          },
        ])
      }
    >
      {items.map((item, index) => (
        <ItemCard
          key={item.id}
          title={`FAQ ${index + 1}`}
          visible={item.isVisible}
          readOnly={readOnly}
          onVisibleChange={(isVisible) =>
            onChange(items.map((entry) => (entry.id === item.id ? { ...entry, isVisible } : entry)))
          }
          onRemove={() => onChange(items.filter((entry) => entry.id !== item.id))}
        >
          <TextField
            label="Question"
            value={item.question}
            disabled={readOnly}
            onChange={(question) =>
              onChange(
                items.map((entry) => (entry.id === item.id ? { ...entry, question } : entry)),
              )
            }
          />
          <TextAreaField
            className="md:col-span-2"
            label="Answer"
            value={item.answer}
            disabled={readOnly}
            onChange={(answer) =>
              onChange(items.map((entry) => (entry.id === item.id ? { ...entry, answer } : entry)))
            }
          />
        </ItemCard>
      ))}
    </ItemList>
  );
}

function ContactDetailsEditor({
  items,
  onChange,
  readOnly,
}: {
  items: SiteContent["contact"]["details"];
  onChange: (items: SiteContent["contact"]["details"]) => void;
  readOnly: boolean;
}) {
  return (
    <ItemList
      title="Contact Details"
      readOnly={readOnly}
      onAdd={() =>
        onChange([
          ...items,
          {
            id: createId("contact-detail"),
            icon: "phone",
            label: "",
            value: "",
            href: "",
            isVisible: true,
          },
        ])
      }
    >
      {items.map((item, index) => (
        <ItemCard
          key={item.id}
          title={`Contact Detail ${index + 1}`}
          visible={item.isVisible}
          readOnly={readOnly}
          onVisibleChange={(isVisible) =>
            onChange(items.map((entry) => (entry.id === item.id ? { ...entry, isVisible } : entry)))
          }
          onRemove={() => onChange(items.filter((entry) => entry.id !== item.id))}
        >
          <SelectField
            label="Icon"
            value={item.icon}
            disabled={readOnly}
            options={[
              { value: "phone", label: "Phone" },
              { value: "mail", label: "Mail" },
              { value: "map-pin", label: "Map Pin" },
            ]}
            onChange={(icon) =>
              onChange(
                items.map((entry) =>
                  entry.id === item.id ? { ...entry, icon: icon as typeof item.icon } : entry,
                ),
              )
            }
          />
          <TextField
            label="Label"
            value={item.label}
            disabled={readOnly}
            onChange={(label) =>
              onChange(items.map((entry) => (entry.id === item.id ? { ...entry, label } : entry)))
            }
          />
          <TextField
            label="Value"
            value={item.value}
            disabled={readOnly}
            onChange={(value) =>
              onChange(items.map((entry) => (entry.id === item.id ? { ...entry, value } : entry)))
            }
          />
          <TextField
            label="Href"
            value={item.href}
            disabled={readOnly}
            onChange={(href) =>
              onChange(items.map((entry) => (entry.id === item.id ? { ...entry, href } : entry)))
            }
          />
        </ItemCard>
      ))}
    </ItemList>
  );
}

function WorkingHoursEditor({
  items,
  onChange,
  readOnly,
}: {
  items: SiteContent["workingHours"]["items"];
  onChange: (items: SiteContent["workingHours"]["items"]) => void;
  readOnly: boolean;
}) {
  return (
    <ItemList
      title="Working Hour Rows"
      readOnly={readOnly}
      onAdd={() =>
        onChange([
          ...items,
          {
            id: createId("working-hours"),
            day: "",
            time: "",
            isVisible: true,
          },
        ])
      }
    >
      {items.map((item, index) => (
        <ItemCard
          key={item.id}
          title={`Row ${index + 1}`}
          visible={item.isVisible}
          readOnly={readOnly}
          onVisibleChange={(isVisible) =>
            onChange(items.map((entry) => (entry.id === item.id ? { ...entry, isVisible } : entry)))
          }
          onRemove={() => onChange(items.filter((entry) => entry.id !== item.id))}
        >
          <TextField
            label="Day"
            value={item.day}
            disabled={readOnly}
            onChange={(day) =>
              onChange(items.map((entry) => (entry.id === item.id ? { ...entry, day } : entry)))
            }
          />
          <TextField
            label="Time"
            value={item.time}
            disabled={readOnly}
            onChange={(time) =>
              onChange(items.map((entry) => (entry.id === item.id ? { ...entry, time } : entry)))
            }
          />
        </ItemCard>
      ))}
    </ItemList>
  );
}

function TextField({
  label,
  value,
  onChange,
  disabled,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  disabled: boolean;
}) {
  return (
    <div>
      <label className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
        {label}
      </label>
      <input
        value={value}
        disabled={disabled}
        onChange={(event) => onChange(event.target.value)}
        className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none disabled:cursor-not-allowed disabled:bg-slate-100"
      />
    </div>
  );
}

function TextAreaField({
  label,
  value,
  onChange,
  disabled,
  className = "",
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  disabled: boolean;
  className?: string;
}) {
  return (
    <div className={className}>
      <label className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
        {label}
      </label>
      <textarea
        rows={4}
        value={value}
        disabled={disabled}
        onChange={(event) => onChange(event.target.value)}
        className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none disabled:cursor-not-allowed disabled:bg-slate-100"
      />
    </div>
  );
}

function ImageField({
  label,
  value,
  onChange,
  disabled,
  onFileSelect,
  uploading = false,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  disabled: boolean;
  onFileSelect?: (file: File) => void;
  uploading?: boolean;
}) {
  const previewSrc = value.trim() ? resolveContentImage(value.trim()) : "";

  return (
    <div>
      <label className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
        {label}
      </label>
      <div className="mt-2 rounded-2xl border border-slate-200 bg-slate-50 p-4">
        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
          {previewSrc ? (
            <img src={previewSrc} alt={label} className="h-44 w-full object-cover" />
          ) : (
            <div className="flex h-44 items-center justify-center text-sm font-medium text-slate-400">
              No image selected
            </div>
          )}
        </div>
        <input
          value={value}
          disabled={disabled}
          onChange={(event) => onChange(event.target.value)}
          className="mt-4 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none disabled:cursor-not-allowed disabled:bg-slate-100"
        />
        <div className="mt-3 flex flex-wrap items-center gap-3">
          {onFileSelect ? (
            <label className="rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-100">
              {uploading ? "Uploading..." : "Upload Image"}
              <input
                type="file"
                accept="image/jpeg,image/png,image/webp"
                className="hidden"
                disabled={disabled || uploading}
                onChange={(event) => {
                  const file = event.target.files?.[0];

                  event.currentTarget.value = "";

                  if (file) {
                    onFileSelect(file);
                  }
                }}
              />
            </label>
          ) : null}
          {value ? (
            <button
              type="button"
              onClick={() => onChange("")}
              disabled={disabled}
              className="rounded-full border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-600 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-60"
            >
              Clear
            </button>
          ) : null}
        </div>
      </div>
    </div>
  );
}

function SelectField({
  label,
  value,
  options,
  onChange,
  disabled,
}: {
  label: string;
  value: string;
  options: Array<{ value: string; label: string }>;
  onChange: (value: string) => void;
  disabled: boolean;
}) {
  return (
    <div>
      <label className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
        {label}
      </label>
      <select
        value={value}
        disabled={disabled}
        onChange={(event) => onChange(event.target.value)}
        className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none disabled:bg-slate-100"
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
  );
}

function CheckboxField({
  label,
  checked,
  onChange,
  disabled,
  compact = false,
}: {
  label: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
  disabled: boolean;
  compact?: boolean;
}) {
  if (compact) {
    return (
      <label className="flex items-center gap-3">
        <input
          type="checkbox"
          checked={checked}
          disabled={disabled}
          onChange={(event) => onChange(event.target.checked)}
          className="h-4 w-4 rounded border-slate-300 text-primary accent-primary focus:ring-primary"
        />
        <span className="text-sm font-medium text-slate-700">{label}</span>
      </label>
    );
  }

  return (
    <div>
      <div className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">{label}</div>
      <label className="mt-2 flex w-full items-center justify-between rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
        <span className="text-sm font-medium text-slate-700">
          {checked ? "Enabled" : "Disabled"}
        </span>
        <input
          type="checkbox"
          checked={checked}
          disabled={disabled}
          onChange={(event) => onChange(event.target.checked)}
          className="h-4 w-4 rounded border-slate-300 text-primary accent-primary focus:ring-primary disabled:cursor-not-allowed"
        />
      </label>
    </div>
  );
}

function RemoveButton({ onClick }: { onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="rounded-full border border-destructive/20 bg-destructive/10 px-3 py-1 text-xs font-semibold text-destructive"
    >
      Remove
    </button>
  );
}
