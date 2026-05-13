import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { ArrowRight, Eye, EyeOff, LockKeyhole, Mail, Phone, User2 } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { BrandLogo } from "@/components/BrandLogo";
import { SpinnerTwo } from "@/components/ui/spinner";
import { APP_ROUTES } from "@/config/routes";
import { buildPath } from "@/lib/router";
import {
  useBootstrapAdmin,
  useBootstrapStatus,
  useCurrentUser,
  useSignIn,
} from "@/features/auth/use-auth";
import { authService } from "@/features/auth/auth.service";
import {
  useClientSignIn,
  useClientSignUp,
  useCurrentClient,
} from "@/features/client-auth/use-client-auth";
import { clientAuthService } from "@/features/client-auth/client-auth.service";
import { getDefaultInternalDashboardRoute } from "@/features/dashboard/access-control";

type AuthMode = "client" | "staff";
type ClientView = "sign-in" | "sign-up";

export function AuthPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { data: currentUser, isLoading: isCurrentUserLoading } = useCurrentUser();
  const { data: currentClient, isLoading: isCurrentClientLoading } = useCurrentClient();
  const bootstrapStatusQuery = useBootstrapStatus();
  const signInMutation = useSignIn();
  const bootstrapMutation = useBootstrapAdmin();
  const clientSignInMutation = useClientSignIn();
  const clientSignUpMutation = useClientSignUp();
  const redirect = searchParams.get("redirect") || undefined;
  const modeParam = searchParams.get("mode");
  const verifyToken = searchParams.get("verifyToken");
  const verifyType = searchParams.get("verifyType");
  const mode = modeParam === "client" || modeParam === "staff" ? modeParam : undefined;

  const authMode = useMemo<AuthMode>(() => {
    if (mode) {
      return mode === "client" ? "client" : "staff";
    }

    return redirect?.startsWith(APP_ROUTES.dashboard) ? "staff" : "client";
  }, [mode, redirect]);

  const [clientView, setClientView] = useState<ClientView>("sign-in");
  const [rememberMe, setRememberMe] = useState(true);
  const [verificationState, setVerificationState] = useState<{
    status: "idle" | "loading" | "success" | "error";
    message: string;
  }>({ status: "idle", message: "" });

  const [staffName, setStaffName] = useState("");
  const [staffEmail, setStaffEmail] = useState("");
  const [staffPassword, setStaffPassword] = useState("");
  const [staffConfirmPassword, setStaffConfirmPassword] = useState("");

  const [clientName, setClientName] = useState("");
  const [clientEmail, setClientEmail] = useState("");
  const [clientPhone, setClientPhone] = useState("");
  const [clientPassword, setClientPassword] = useState("");
  const [clientConfirmPassword, setClientConfirmPassword] = useState("");

  const redirectTo = redirect || APP_ROUTES.dashboard;
  const requiresSetup = bootstrapStatusQuery.data?.requiresSetup ?? false;
  const isSubmitting =
    signInMutation.isPending ||
    bootstrapMutation.isPending ||
    clientSignInMutation.isPending ||
    clientSignUpMutation.isPending;

  useEffect(() => {
    if (redirect?.startsWith(APP_ROUTES.dashboard) && currentUser) {
      navigate(redirectTo, { replace: true });
      return;
    }

    if (!redirect && currentClient) {
      navigate(APP_ROUTES.dashboardClient, { replace: true });
      return;
    }

    if (!redirect && currentUser) {
      navigate(getDefaultInternalDashboardRoute(currentUser), { replace: true });
    }
  }, [currentClient, currentUser, navigate, redirectTo, redirect]);

  useEffect(() => {
    if (!verifyToken || (verifyType !== "app_user" && verifyType !== "client")) {
      return;
    }

    let cancelled = false;

    setVerificationState({
      status: "loading",
      message: "Verifying your email address...",
    });

    const run = async () => {
      try {
        const result =
          verifyType === "app_user"
            ? await authService.verifyEmail(verifyToken)
            : await clientAuthService.verifyEmail(verifyToken);

        if (cancelled) {
          return;
        }

        setVerificationState({
          status: "success",
          message: `${result.email} has been verified. You can sign in now.`,
        });
        toast.success("Email verified successfully.");
        if (verifyType === "client") {
          setClientView("sign-in");
        }
      } catch (error) {
        if (cancelled) {
          return;
        }

        setVerificationState({
          status: "error",
          message:
            error instanceof Error ? error.message : "Unable to verify your email right now.",
        });
      }
    };

    void run();

    return () => {
      cancelled = true;
    };
  }, [verifyToken, verifyType]);

  const handleStaffSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    try {
      let authenticatedUser = currentUser;

      if (requiresSetup) {
        authenticatedUser = await bootstrapMutation.mutateAsync({
          name: staffName,
          email: staffEmail,
          password: staffPassword,
          confirmPassword: staffConfirmPassword,
          rememberMe,
        });
        toast.success("Admin account created successfully.");
      } else {
        authenticatedUser = await signInMutation.mutateAsync({
          email: staffEmail,
          password: staffPassword,
          rememberMe,
        });
        toast.success("Signed in successfully.");
      }

      navigate(
        redirect ||
          (authenticatedUser
            ? getDefaultInternalDashboardRoute(authenticatedUser)
            : APP_ROUTES.dashboard),
      );
    } catch (error) {
      const message = error instanceof Error ? error.message : "Authentication failed.";
      toast.error(message);
    }
  };

  const handleClientSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    try {
      if (clientView === "sign-up") {
        const result = await clientSignUpMutation.mutateAsync({
          name: clientName,
          email: clientEmail,
          phone: clientPhone,
          password: clientPassword,
          confirmPassword: clientConfirmPassword,
          rememberMe,
        });
        toast.success(result.message);
        setVerificationState({ status: "success", message: result.message });
        setClientView("sign-in");
        setClientPassword("");
        setClientConfirmPassword("");
        return;
      } else {
        await clientSignInMutation.mutateAsync({
          email: clientEmail,
          password: clientPassword,
          rememberMe,
        });
        toast.success("Signed in successfully.");
      }

      navigate(APP_ROUTES.dashboardClient);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Authentication failed.";
      toast.error(message);
    }
  };

  if (isCurrentUserLoading || isCurrentClientLoading || bootstrapStatusQuery.isLoading) {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center gap-4 bg-dark px-4 text-white">
        <SpinnerTwo size="lg" />
        <span className="text-sm font-medium text-white/70">Loading authentication...</span>
      </main>
    );
  }

  const formTitle =
    authMode === "client"
      ? clientView === "sign-up"
        ? "Create your client account"
        : "Sign in to your portal"
      : requiresSetup
        ? "Create the first admin account"
        : "Sign in to the dashboard";

  const formDescription =
    authMode === "client"
      ? clientView === "sign-up"
        ? "Create your client login with basic contact details. You can complete the rest of your profile after signing in."
        : "Enter your client credentials to view your profile and application record."
      : requiresSetup
        ? "This one-time step creates the first internal administrator."
        : "Use your internal account to manage clients, content, and access control.";

  return (
    <main className="min-h-screen lg:grid lg:grid-cols-2">
      <section className="relative flex min-h-[40vh] overflow-hidden bg-dark text-white lg:min-h-screen">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(164,255,238,0.16),transparent_34%),radial-gradient(circle_at_bottom_right,rgba(251,176,64,0.18),transparent_32%),linear-gradient(155deg,#022816_0%,#0b3322_55%,#0f3a26_100%)]" />
        <div
          className="absolute inset-0 opacity-40"
          style={{
            backgroundImage:
              "linear-gradient(rgba(255,255,255,0.06) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.06) 1px, transparent 1px)",
            backgroundSize: "42px 42px",
          }}
        />
        <div className="relative flex w-full flex-col px-8 py-10 sm:px-12 lg:px-14 lg:py-14 xl:px-18">
          <BrandLogo brandName="Hadaf" imageClassName="h-14 sm:h-16" priority />

          <div className="flex flex-1 items-center">
            <div className="max-w-[560px] py-10 lg:py-0">
              <p className="text-sm font-semibold uppercase tracking-[0.32em] text-primary">
                Hadaf Access
              </p>
              <h1 className="mt-6 text-4xl font-extrabold leading-[1.04] text-white sm:text-5xl xl:text-6xl">
                Study abroad guidance with one clear access point.
              </h1>
              <p className="mt-6 max-w-[520px] text-base leading-8 text-white/72">
                Track your Hadaf application journey or sign in as staff to manage clients, content,
                and internal access from the same platform.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="flex min-h-screen items-center bg-white px-6 py-10 sm:px-10 lg:px-14 xl:px-18">
        <div className="mx-auto w-full max-w-[430px]">
          <p className="text-sm font-semibold uppercase tracking-[0.28em] text-primary">
            Welcome Back
          </p>
          <h2 className="mt-4 text-3xl font-extrabold leading-tight text-slate-950 sm:text-[2.35rem]">
            {formTitle}
          </h2>
          <p className="mt-4 text-sm leading-7 text-slate-500">{formDescription}</p>

          {verificationState.status !== "idle" ? (
            <div
              className={`mt-6 rounded-2xl border px-4 py-3 text-sm leading-6 ${
                verificationState.status === "error"
                  ? "border-red-200 bg-red-50 text-red-700"
                  : verificationState.status === "loading"
                    ? "border-sky-200 bg-sky-50 text-sky-700"
                    : "border-emerald-200 bg-emerald-50 text-emerald-700"
              }`}
            >
              {verificationState.message}
            </div>
          ) : null}

          {authMode === "client" ? (
            <>
              <div className="mt-8 flex items-center justify-between gap-4 text-sm">
                <span className="text-slate-500">
                  {clientView === "sign-up" ? "Already have an account?" : "Need a client account?"}
                </span>
                <button
                  type="button"
                  onClick={() =>
                    setClientView((current) => (current === "sign-in" ? "sign-up" : "sign-in"))
                  }
                  className="font-semibold text-primary transition hover:text-dark"
                >
                  {clientView === "sign-up" ? "Sign in" : "Sign up"}
                </button>
              </div>

              <form onSubmit={handleClientSubmit} className="mt-8 space-y-5">
                {clientView === "sign-up" ? (
                  <div className="grid gap-5 md:grid-cols-2">
                    <InputField
                      label="Full Name"
                      value={clientName}
                      onChange={setClientName}
                      icon={User2}
                      required
                    />
                    <InputField
                      label="Phone"
                      value={clientPhone}
                      onChange={setClientPhone}
                      icon={Phone}
                    />
                  </div>
                ) : null}

                <InputField
                  label="Email"
                  type="email"
                  value={clientEmail}
                  onChange={setClientEmail}
                  icon={Mail}
                  required
                />

                <div
                  className={clientView === "sign-up" ? "grid gap-5 md:grid-cols-2" : "space-y-5"}
                >
                  <InputField
                    label="Password"
                    type="password"
                    value={clientPassword}
                    onChange={setClientPassword}
                    icon={LockKeyhole}
                    required
                  />
                  {clientView === "sign-up" ? (
                    <InputField
                      label="Confirm Password"
                      type="password"
                      value={clientConfirmPassword}
                      onChange={setClientConfirmPassword}
                      icon={LockKeyhole}
                      required
                    />
                  ) : null}
                </div>

                <div className="flex items-center justify-between gap-4 text-sm">
                  <label className="inline-flex items-center gap-3 text-slate-500">
                    <input
                      type="checkbox"
                      checked={rememberMe}
                      onChange={(event) => setRememberMe(event.target.checked)}
                      className="h-4 w-4 rounded border-slate-300 text-primary focus:ring-primary"
                    />
                    Keep me signed in
                  </label>
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="inline-flex min-h-[56px] w-full items-center justify-center rounded-2xl bg-dark px-5 py-4 text-sm font-semibold text-white transition hover:bg-brand-ink disabled:opacity-70"
                >
                  {isSubmitting ? (
                    <>
                      <SpinnerTwo size="sm" className="mr-2" />
                      Please wait...
                    </>
                  ) : (
                    <>
                      {clientView === "sign-up" ? "Create Client Account" : "Sign In"}
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </>
                  )}
                </button>
              </form>
            </>
          ) : (
            <form onSubmit={handleStaffSubmit} className="mt-8 space-y-5">
              {requiresSetup ? (
                <InputField
                  label="Full Name"
                  value={staffName}
                  onChange={setStaffName}
                  icon={User2}
                  required
                />
              ) : null}

              <InputField
                label="Email"
                type="email"
                value={staffEmail}
                onChange={setStaffEmail}
                icon={Mail}
                required
              />
              <InputField
                label="Password"
                type="password"
                value={staffPassword}
                onChange={setStaffPassword}
                icon={LockKeyhole}
                required
              />

              {requiresSetup ? (
                <InputField
                  label="Confirm Password"
                  type="password"
                  value={staffConfirmPassword}
                  onChange={setStaffConfirmPassword}
                  icon={LockKeyhole}
                  required
                />
              ) : null}

              <div className="flex items-center justify-between gap-4 text-sm">
                <label className="inline-flex items-center gap-3 text-slate-500">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(event) => setRememberMe(event.target.checked)}
                    className="h-4 w-4 rounded border-slate-300 text-primary focus:ring-primary"
                  />
                  Keep me signed in
                </label>
                <Link
                  to={APP_ROUTES.home}
                  className="font-semibold text-primary transition hover:text-dark"
                >
                  Back to website
                </Link>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="inline-flex min-h-[56px] w-full items-center justify-center rounded-2xl bg-dark px-5 py-4 text-sm font-semibold text-white transition hover:bg-brand-ink disabled:opacity-70"
              >
                {isSubmitting ? (
                  <>
                    <SpinnerTwo size="sm" className="mr-2" />
                    Please wait...
                  </>
                ) : (
                  <>
                    {requiresSetup ? "Create Admin Account" : "Sign In"}
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </>
                )}
              </button>
            </form>
          )}
        </div>
      </section>
    </main>
  );
}

function InputField({
  label,
  value,
  onChange,
  icon: Icon,
  type = "text",
  required = false,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  icon: typeof Mail;
  type?: string;
  required?: boolean;
}) {
  const isPasswordField = type === "password";
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const inputType = isPasswordField && isPasswordVisible ? "text" : type;

  return (
    <div>
      <label className="mb-2 block text-sm font-semibold text-slate-700">{label}</label>
      <div className="group flex items-center border-b border-slate-200 bg-transparent transition focus-within:border-primary">
        <Icon className="h-5 w-5 shrink-0 text-slate-400 transition group-focus-within:text-primary" />
        <input
          type={inputType}
          required={required}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          className="w-full bg-transparent px-3 py-3.5 text-sm text-slate-900 outline-none placeholder:text-slate-400"
        />
        {isPasswordField ? (
          <button
            type="button"
            onClick={() => setIsPasswordVisible((current) => !current)}
            aria-label={isPasswordVisible ? `Hide ${label}` : `Show ${label}`}
            className="shrink-0 p-1 text-slate-400 transition hover:text-primary"
          >
            {isPasswordVisible ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
          </button>
        ) : null}
      </div>
    </div>
  );
}
