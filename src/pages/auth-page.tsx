import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { ArrowRight, Eye, EyeOff, LockKeyhole, Mail, Phone, User2 } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { BrandLogo } from "@/components/BrandLogo";
import { SpinnerTwo } from "@/components/ui/spinner";
import { APP_ROUTES } from "@/config/routes";
import { useBootstrapAdmin, useBootstrapStatus } from "@/features/auth/use-auth";
import { authService } from "@/features/auth/auth.service";
import { useClientSignUp } from "@/features/client-auth/use-client-auth";
import { clientAuthService } from "@/features/client-auth/client-auth.service";
import {
  getDefaultDashboardRoute,
  getDefaultInternalDashboardRoute,
} from "@/features/dashboard/access-control";
import {
  useCurrentActor,
  useUnifiedPasswordResetRequest,
  useUnifiedSignIn,
} from "@/features/session/use-session";

type ClientView = "sign-in" | "sign-up";

export function AuthPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const currentActorQuery = useCurrentActor();
  const bootstrapStatusQuery = useBootstrapStatus();
  const signInMutation = useUnifiedSignIn();
  const bootstrapMutation = useBootstrapAdmin();
  const clientSignUpMutation = useClientSignUp();
  const passwordResetRequestMutation = useUnifiedPasswordResetRequest();
  const redirect = searchParams.get("redirect") || undefined;
  const verifyToken = searchParams.get("verifyToken");
  const verifyType = searchParams.get("verifyType");
  const resetToken = searchParams.get("resetToken");
  const resetType = searchParams.get("resetType");
  const resetTarget =
    resetType === "app_user" || resetType === "client" ? resetType : null;
  const isResetFlow = Boolean(resetTarget && resetToken);

  const [clientView, setClientView] = useState<ClientView>("sign-in");
  const [rememberMe, setRememberMe] = useState(false);
  const [isForgotPassword, setIsForgotPassword] = useState(false);
  const [passwordActionPending, setPasswordActionPending] = useState(false);
  const [verificationState, setVerificationState] = useState<{
    status: "idle" | "loading" | "success" | "error";
    message: string;
  }>({ status: "idle", message: "" });
  const [passwordState, setPasswordState] = useState<{
    status: "idle" | "loading" | "success" | "error";
    message: string;
  }>({ status: "idle", message: "" });

  const [internalName, setInternalName] = useState("");
  const [signInEmail, setSignInEmail] = useState("");
  const [signInPassword, setSignInPassword] = useState("");
  const [signInConfirmPassword, setSignInConfirmPassword] = useState("");

  const [clientName, setClientName] = useState("");
  const [clientEmail, setClientEmail] = useState("");
  const [clientPhone, setClientPhone] = useState("");
  const [clientPassword, setClientPassword] = useState("");
  const [clientConfirmPassword, setClientConfirmPassword] = useState("");

  const currentActor = currentActorQuery.data;
  const requiresSetup = bootstrapStatusQuery.data?.requiresSetup ?? false;
  const isSubmitting =
    signInMutation.isPending ||
    bootstrapMutation.isPending ||
    clientSignUpMutation.isPending ||
    passwordResetRequestMutation.isPending ||
    passwordActionPending;

  useEffect(() => {
    if (!currentActor) {
      return;
    }

    navigate(redirect || getDefaultDashboardRoute(currentActor), { replace: true });
  }, [currentActor, navigate, redirect]);

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

  const handleSignInSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    try {
      if (requiresSetup) {
        const authenticatedUser = await bootstrapMutation.mutateAsync({
          name: internalName,
          email: signInEmail,
          password: signInPassword,
          confirmPassword: signInConfirmPassword,
          rememberMe,
        });
        toast.success("Admin account created successfully.");
        navigate(redirect || getDefaultInternalDashboardRoute(authenticatedUser));
        return;
      }

      const actor = await signInMutation.mutateAsync({
        email: signInEmail,
        password: signInPassword,
        rememberMe,
      });
      toast.success("Signed in successfully.");
      navigate(redirect || getDefaultDashboardRoute(actor));
    } catch (error) {
      const message = error instanceof Error ? error.message : "Authentication failed.";
      toast.error(message);
    }
  };

  const handleForgotPassword = async (event: React.FormEvent) => {
    event.preventDefault();
    setPasswordActionPending(true);
    setPasswordState({ status: "loading", message: "Sending password reset email..." });

    try {
      const result = await passwordResetRequestMutation.mutateAsync({ email: signInEmail });
      setPasswordState({ status: "success", message: result.message });
      toast.success(result.message);
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Unable to send password reset email.";
      setPasswordState({ status: "error", message });
      toast.error(message);
    } finally {
      setPasswordActionPending(false);
    }
  };

  const handleClientSignUp = async (event: React.FormEvent) => {
    event.preventDefault();

    try {
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
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unable to create client account.";
      toast.error(message);
    }
  };

  const handleInternalResetPassword = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!resetToken) {
      setPasswordState({ status: "error", message: "Reset token is missing." });
      return;
    }

    setPasswordActionPending(true);
    setPasswordState({ status: "loading", message: "Resetting your password..." });

    try {
      const result = await authService.resetPassword({
        token: resetToken,
        password: signInPassword,
        confirmPassword: signInConfirmPassword,
      });
      setPasswordState({ status: "success", message: result.message });
      toast.success(result.message);
      setSignInPassword("");
      setSignInConfirmPassword("");
      navigate(APP_ROUTES.auth, { replace: true });
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unable to reset your password.";
      setPasswordState({ status: "error", message });
      toast.error(message);
    } finally {
      setPasswordActionPending(false);
    }
  };

  const handleClientResetPassword = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!resetToken) {
      setPasswordState({ status: "error", message: "Reset token is missing." });
      return;
    }

    setPasswordActionPending(true);
    setPasswordState({ status: "loading", message: "Resetting your password..." });

    try {
      const result = await clientAuthService.resetPassword({
        token: resetToken,
        password: clientPassword,
        confirmPassword: clientConfirmPassword,
      });
      setPasswordState({ status: "success", message: result.message });
      toast.success(result.message);
      setClientPassword("");
      setClientConfirmPassword("");
      navigate(APP_ROUTES.auth, { replace: true });
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unable to reset your password.";
      setPasswordState({ status: "error", message });
      toast.error(message);
    } finally {
      setPasswordActionPending(false);
    }
  };

  if (currentActorQuery.isLoading || bootstrapStatusQuery.isLoading) {
    return (
      <main className="relative min-h-screen overflow-hidden bg-white">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(164,255,238,0.08),transparent_34%),radial-gradient(circle_at_bottom_right,rgba(251,176,64,0.12),transparent_32%)]" />
        <div className="absolute inset-0 bg-white/70 backdrop-blur-sm" />
        <div className="relative flex min-h-screen items-center justify-center px-4">
          <div className="flex min-w-[280px] flex-col items-center gap-4 rounded-[28px] border border-slate-200 bg-white/95 px-8 py-8 text-center shadow-xl">
            <SpinnerTwo size="lg" />
            <span className="text-sm font-medium text-slate-600">Loading authentication...</span>
          </div>
        </div>
      </main>
    );
  }

  const formTitle = isResetFlow
    ? "Reset your password"
    : isForgotPassword
      ? "Forgot your password?"
      : clientView === "sign-up"
        ? "Create your client account"
        : requiresSetup
          ? "Create the first admin account"
          : "Sign in to your account";

  const formDescription = isResetFlow
    ? "Choose a new password for your account."
    : isForgotPassword
      ? "Enter your email address and we will send a password reset link if an account exists."
      : clientView === "sign-up"
        ? "Create your client login with basic contact details. You can complete the rest of your profile after signing in."
        : requiresSetup
          ? "This one-time step creates the first internal administrator."
          : "Use one secure sign-in form for client, staff, and admin access.";

  return (
    <main className="min-h-screen lg:grid lg:grid-cols-2">
      <section className="relative hidden min-h-[40vh] overflow-hidden bg-dark text-white lg:flex lg:min-h-screen">
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
                One login for clients, staff, and administrators.
              </h1>
              <p className="mt-6 max-w-[520px] text-base leading-8 text-white/72">
                Access is resolved after authentication and enforced by role and permission, so
                every account uses the same secure entry point.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="flex min-h-screen items-start bg-white px-6 py-8 sm:px-10 lg:items-center lg:px-14 xl:px-18">
        <div className="mx-auto w-full max-w-[430px]">
          <div className="mb-8 border-b border-slate-200 pb-6 lg:hidden">
            <BrandLogo brandName="Hadaf" imageClassName="h-12" priority />
          </div>
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

          {passwordState.status !== "idle" ? (
            <div
              className={`mt-6 rounded-2xl border px-4 py-3 text-sm leading-6 ${
                passwordState.status === "error"
                  ? "border-red-200 bg-red-50 text-red-700"
                  : passwordState.status === "loading"
                    ? "border-sky-200 bg-sky-50 text-sky-700"
                    : "border-emerald-200 bg-emerald-50 text-emerald-700"
              }`}
            >
              {passwordState.message}
            </div>
          ) : null}

          {!isResetFlow ? (
            <div className="mt-8 flex items-center justify-between gap-4 text-sm">
              <span className="text-slate-500">
                {isForgotPassword
                  ? "Remembered your password?"
                  : clientView === "sign-up"
                    ? "Already have an account?"
                    : "Need a client account?"}
              </span>
              <button
                type="button"
                onClick={() => {
                  setPasswordState({ status: "idle", message: "" });
                  if (isForgotPassword) {
                    setIsForgotPassword(false);
                    return;
                  }

                  setClientView((current) => (current === "sign-in" ? "sign-up" : "sign-in"));
                }}
                className="font-semibold text-primary transition hover:text-dark"
              >
                {isForgotPassword
                  ? "Sign in"
                  : clientView === "sign-up"
                    ? "Sign in"
                    : "Sign up"}
              </button>
            </div>
          ) : null}

          {isResetFlow ? (
            <form
              onSubmit={resetTarget === "client" ? handleClientResetPassword : handleInternalResetPassword}
              className="mt-8 space-y-5"
            >
              {resetTarget === "client" ? (
                <>
                  <InputField
                    label="New Password"
                    type="password"
                    value={clientPassword}
                    onChange={setClientPassword}
                    icon={LockKeyhole}
                    required
                  />
                  <InputField
                    label="Confirm Password"
                    type="password"
                    value={clientConfirmPassword}
                    onChange={setClientConfirmPassword}
                    icon={LockKeyhole}
                    required
                  />
                </>
              ) : (
                <>
                  <InputField
                    label="New Password"
                    type="password"
                    value={signInPassword}
                    onChange={setSignInPassword}
                    icon={LockKeyhole}
                    required
                  />
                  <InputField
                    label="Confirm Password"
                    type="password"
                    value={signInConfirmPassword}
                    onChange={setSignInConfirmPassword}
                    icon={LockKeyhole}
                    required
                  />
                </>
              )}

              <div className="flex items-center justify-between gap-4 text-sm">
                <Link
                  to={APP_ROUTES.auth}
                  className="font-semibold text-primary transition hover:text-dark"
                >
                  Back to sign in
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
                    Reset Password
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </>
                )}
              </button>
            </form>
          ) : clientView === "sign-up" ? (
            <form onSubmit={handleClientSignUp} className="mt-8 space-y-5">
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

              <InputField
                label="Email"
                type="email"
                value={clientEmail}
                onChange={setClientEmail}
                icon={Mail}
                required
              />

              <div className="grid gap-5 md:grid-cols-2">
                <InputField
                  label="Password"
                  type="password"
                  value={clientPassword}
                  onChange={setClientPassword}
                  icon={LockKeyhole}
                  required
                />
                <InputField
                  label="Confirm Password"
                  type="password"
                  value={clientConfirmPassword}
                  onChange={setClientConfirmPassword}
                  icon={LockKeyhole}
                  required
                />
              </div>

              <label className="inline-flex items-center gap-3 text-sm text-slate-500">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(event) => setRememberMe(event.target.checked)}
                  className="h-4 w-4 rounded border-slate-300 text-primary focus:ring-primary"
                />
                Keep me signed in
              </label>

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
                    Create Client Account
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </>
                )}
              </button>
            </form>
          ) : (
            <form
              onSubmit={isForgotPassword ? handleForgotPassword : handleSignInSubmit}
              className="mt-8 space-y-5"
            >
              {requiresSetup && !isForgotPassword ? (
                <InputField
                  label="Full Name"
                  value={internalName}
                  onChange={setInternalName}
                  icon={User2}
                  required
                />
              ) : null}

              <InputField
                label="Email"
                type="email"
                value={signInEmail}
                onChange={setSignInEmail}
                icon={Mail}
                required
              />

              {!isForgotPassword ? (
                <InputField
                  label="Password"
                  type="password"
                  value={signInPassword}
                  onChange={setSignInPassword}
                  icon={LockKeyhole}
                  required
                />
              ) : null}

              {requiresSetup && !isForgotPassword ? (
                <InputField
                  label="Confirm Password"
                  type="password"
                  value={signInConfirmPassword}
                  onChange={setSignInConfirmPassword}
                  icon={LockKeyhole}
                  required
                />
              ) : null}

              <div className="flex items-center justify-between gap-4 text-sm">
                {!isForgotPassword ? (
                  <label className="inline-flex items-center gap-3 text-slate-500">
                    <input
                      type="checkbox"
                      checked={rememberMe}
                      onChange={(event) => setRememberMe(event.target.checked)}
                      className="h-4 w-4 rounded border-slate-300 text-primary focus:ring-primary"
                    />
                    Keep me signed in
                  </label>
                ) : (
                  <Link
                    to={APP_ROUTES.auth}
                    className="font-semibold text-primary transition hover:text-dark"
                  >
                    Back to sign in
                  </Link>
                )}
                {!requiresSetup && !isForgotPassword ? (
                  <button
                    type="button"
                    onClick={() => {
                      setPasswordState({ status: "idle", message: "" });
                      setIsForgotPassword(true);
                    }}
                    className="font-semibold text-primary transition hover:text-dark"
                  >
                    Forgot password?
                  </button>
                ) : !isForgotPassword ? (
                  <Link
                    to={APP_ROUTES.home}
                    className="font-semibold text-primary transition hover:text-dark"
                  >
                    Back to website
                  </Link>
                ) : null}
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
                    {isForgotPassword
                      ? "Send Reset Link"
                      : requiresSetup
                        ? "Create Admin Account"
                        : "Sign In"}
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
