import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Link, useNavigate } from "react-router-dom";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Icons } from "@/components/icons";
import { Logo, APP_NAME } from "@/components/brand";
import { useTranslation } from "react-i18next";
import { useAuthStore } from "@/store/auth-store";
import { authService } from "@/services/auth.service";
import { toast } from "sonner";

// ---------------------- Zod Schema ----------------------
const LoginSchema = z.object({
  email: z
    .string()
    .min(1, "Email is required")
    .email("Please enter a valid email address"),

  password: z
    .string()
    .min(1, "Password is required")
    .min(6, "Password must be at least 6 characters"),

  rememberMe: z.boolean().optional(),
});

type LoginFormValues = z.infer<typeof LoginSchema>;

export default function LoginPage() {
  const { setAuth } = useAuthStore();
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);

  // Default credentials for demo
  const DEFAULT_EMAIL = "";
  const DEFAULT_PASSWORD = "";

  // ---------------------- React Hook Form ----------------------
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(LoginSchema),
    defaultValues: {
      email: DEFAULT_EMAIL,
      password: DEFAULT_PASSWORD,
      rememberMe: false,
    },
  });

  const rememberMe = watch("rememberMe");

  // ---------------------- Check if session expired ----------------------
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get("expired") === "true") {
      toast.error("Your session has expired. Please log in again.");
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  }, []);

  // ---------------------- Load saved email ----------------------
  useEffect(() => {
    const savedEmail = localStorage.getItem("savedEmail");

    if (savedEmail) {
      setValue("email", savedEmail);
      setValue("rememberMe", true);
    } else {
      // Set default email if no saved email exists
      setValue("email", DEFAULT_EMAIL);
      setValue("password", DEFAULT_PASSWORD);
    }
  }, [setValue]);

  // ---------------------- Submit ----------------------
  const onSubmit = async (values: LoginFormValues) => {
    setIsLoading(true);

    try {
      if (values.rememberMe) {
        localStorage.setItem("savedEmail", values.email);
        localStorage.setItem("rememberMeFlag", "true");
      } else {
        localStorage.removeItem("savedEmail");
        localStorage.setItem("rememberMeFlag", "false");
      }

      const response = await authService.login(values.email, values.password, values.rememberMe);

      if (response.success && response.data) {
        const userRole = (response.data as any).role;
        
        if (userRole === "ADMIN" || userRole === "CLIENT") {
          toast.error("Access Denied: This portal is exclusively for HR Managers and Employees.");
          setIsLoading(false);
          return;
        }

        setAuth(response.data, response.accessToken || null);
        toast.success("Login successful");
        // Redirect based on role
        if (userRole === "HR") {
          navigate("/hr/dashboard");
        } else {
          navigate("/admin/dashboard");
        }
      } else {
        // Handle error message
        toast.error(response.message || "Login failed");
      }
    } catch (error: any) {
      console.error("Login failed:", error);
      toast.error(error.response?.data?.message || "Login failed. Please check your connection.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full">
      <div className="flex min-h-screen flex-col lg:grid lg:grid-cols-2">
        {/* LEFT SECTION — branded panel */}
        <div className="bg-brand-spotlight relative hidden flex-col justify-between overflow-hidden p-12 text-primary-foreground lg:flex">
          <div className="bg-grid pointer-events-none absolute inset-0 opacity-[0.07]" />
          <div className="relative flex items-center gap-2.5">
            <span className="flex size-8 items-center justify-center rounded-[7px] bg-white/15 ring-1 ring-inset ring-white/25 backdrop-blur-sm">
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth={2.4}
                strokeLinecap="round"
                strokeLinejoin="round"
                className="size-4"
                aria-hidden="true"
              >
                <path d="M7 7h10L7 17h10" />
              </svg>
            </span>
            <span className="font-display text-lg font-bold tracking-tight">
              {APP_NAME}
            </span>
          </div>

          <div className="relative max-w-md space-y-4">
            <h2 className="font-display text-3xl font-bold leading-tight tracking-tight">
              Run your people operations from one calm surface.
            </h2>
            <p className="text-sm leading-relaxed text-primary-foreground/80">
              Attendance, leaves, holidays and reports — a portal your team
              actually wants to use. Built for speed, designed to get out of your
              way.
            </p>
          </div>

          <p className="relative text-xs text-primary-foreground/60">
            © {new Date().getFullYear()} {APP_NAME}. Enterprise CRM &amp; HRMS.
          </p>
        </div>

        {/* RIGHT SECTION */}
        <div className="flex flex-col items-center justify-center bg-background px-6 py-10 min-h-screen">
          <div className="w-full max-w-sm space-y-6">
            {/* Mobile brand */}
            <div className="lg:hidden">
              <Logo size="lg" />
            </div>
            {/* Header */}
            <div className="text-left space-y-1.5">
              <h1 className="text-xl font-bold tracking-tight text-foreground">
                {t("login.welcome")}
              </h1>
              <p className="text-sm text-muted-foreground">
                {t("login.signInHint")}
              </p>
            </div>

            {/* Demo credentials hint */}
            {/* <div className="bg-muted/50 p-3 rounded-md border border-border">
              <p className="text-xs text-muted-foreground">
                <span className="font-semibold">{t("login.demoCredentials")}</span>
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                Email:{" "}
                <span className="font-mono bg-background px-1 py-0.5 rounded">
                  {DEFAULT_EMAIL}
                </span>
              </p>
              <p className="text-xs text-muted-foreground">
                Password:{" "}
                <span className="font-mono bg-background px-1 py-0.5 rounded">
                  {DEFAULT_PASSWORD}
                </span>
              </p>
            </div> */}

            {/* FORM */}
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 py-2">
              {/* Email */}
              <div className="flex flex-col gap-1">
                <Label>{t("login.emailLabel")}</Label>
                <Input
                  placeholder={t("login.emailPlaceholder")}
                  {...register("email")}
                  disabled={isLoading}
                />
                {errors.email && (
                  <p className="text-sm text-destructive">{errors.email.message}</p>
                )}
              </div>

              {/* Password */}
              <div className="flex flex-col gap-1">
                <Label>{t("login.passwordLabel")}</Label>
                <Input
                  type="password"
                  placeholder={t("login.passwordPlaceholder")}
                  {...register("password")}
                  disabled={isLoading}
                />
                {errors.password && (
                  <p className="text-sm text-destructive">
                    {errors.password.message}
                  </p>
                )}
              </div>

              {/* Remember Me */}
              <div className="flex text-sm text-muted-foreground justify-between">
                <div className="flex items-center space-x-2">
                  <Switch
                    checked={rememberMe}
                    onCheckedChange={(checked) =>
                      setValue("rememberMe", checked)
                    }
                    disabled={isLoading}
                  />
                  <Label>{t("login.rememberMe")}</Label>
                </div>

                <Link
                  to="/forgot-password"
                  className="text-sm text-primary hover:underline"
                >
                  {t("login.forgotPassword")}
                </Link>
              </div>

              {/* Submit */}
              <div className="text-center space-y-2">
                <Button className="w-full" type="submit" disabled={isLoading}>
                  {isLoading ? (
                    <>
                      <Icons.spinner className=" h-4 w-4 animate-spin" />
                      {t("login.loggingIn")}
                    </>
                  ) : (
                    t("login.loginButton")
                  )}
                </Button>

                <Link
                  to="/signup"
                  className="text-sm text-primary hover:underline"
                >
                  {t("login.signupLink")}
                </Link>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
