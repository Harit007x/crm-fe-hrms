import { useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Link, useNavigate } from "react-router-dom";
import { authService } from "@/services/auth.service";
import { useAuthStore } from "@/store/auth-store";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Icons } from "@/components/icons";
import { Logo, APP_NAME } from "@/components/brand";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

// ---------------------- Zod Schema ----------------------

const SignupSchema = z.object({
  firstName: z.string().min(1, "First name is required"),

  lastName: z.string().min(1, "Last name is required"),

  email: z
    .string()
    .min(1, "Email is required")
    .email("Please enter a valid email address"),

  phone: z
    .string()
    .min(1, "Phone number is required")
    .regex(/^[0-9]{10,15}$/, "Enter a valid phone number"),

  password: z
    .string()
    .min(1, "Password is required")
    .min(6, "Password must be at least 6 characters"),

  role: z.enum(["TEAM_MEMBER", "HR"]),
});

type SignupFormValues = z.infer<typeof SignupSchema>;

export default function SignupPage() {
  const navigate = useNavigate();
  const { setAuth } = useAuthStore();
  const { t } = useTranslation();
  const [isLoading, setIsLoading] = useState(false);

  // ---------------------- React Hook Form ----------------------

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<SignupFormValues>({
    resolver: zodResolver(SignupSchema),
    defaultValues: {
      role: "TEAM_MEMBER",
    },
  });

  // ---------------------- Submit ----------------------

  const onSubmit = async (values: SignupFormValues) => {
    setIsLoading(true);

    try {
      const name = `${values.firstName} ${values.lastName}`;
      const response = await authService.signup(name, values.email, values.password, values.role);

      if (response.success && response.data) {
        setAuth(response.data as any, response.accessToken || null);
        toast.success("Account created successfully!");
        navigate("/admin/dashboard");
      } else {
        toast.error(response.message || "Signup failed");
      }
    } catch (error: any) {
      console.error("Signup failed:", error);
      toast.error(error.response?.data?.message || "Signup failed. Please check your connection.");
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
              Join your team's HR portal.
            </h2>
            <p className="text-sm leading-relaxed text-primary-foreground/80">
              Mark attendance, apply for leave, and keep your reports in one
              place — without the spreadsheet shuffle.
            </p>
          </div>

          <p className="relative text-xs text-primary-foreground/60">
            © {new Date().getFullYear()} {APP_NAME}. Enterprise CRM &amp; HRMS.
          </p>
        </div>

        {/* RIGHT SECTION */}
        <div className="flex flex-col items-center justify-center bg-background px-6 py-10 min-h-screen">
          <div className="w-full max-sm:px-4 max-w-sm space-y-6">
            {/* Mobile brand */}
            <div className="lg:hidden">
              <Logo size="lg" />
            </div>
            {/* Header */}
            <div className="text-left space-y-1.5">
              <h1 className="text-xl font-bold tracking-tight text-foreground">
                {t("signup.title")}
              </h1>
              <p className="text-sm text-muted-foreground">
                {t("signup.description")}
              </p>
            </div>

            {/* FORM */}

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 py-2">
              {/* First Name + Last Name */}

              <div className="grid grid-cols-2 gap-3">
                <div className="flex flex-col gap-1">
                  <Label>{t("signup.firstName")}</Label>
                  <Input
                    placeholder={t("signup.firstNamePlaceholder")}
                    {...register("firstName")}
                    disabled={isLoading}
                  />
                  {errors.firstName && (
                    <p className="text-sm text-destructive">
                      {errors.firstName.message}
                    </p>
                  )}
                </div>

                <div className="flex flex-col gap-1">
                  <Label>{t("signup.lastName")}</Label>
                  <Input
                    placeholder={t("signup.lastNamePlaceholder")}
                    {...register("lastName")}
                    disabled={isLoading}
                  />
                  {errors.lastName && (
                    <p className="text-sm text-destructive">
                      {errors.lastName.message}
                    </p>
                  )}
                </div>
              </div>

              {/* Email */}

              <div className="flex flex-col gap-1">
                <Label>{t("signup.email")}</Label>
                <Input
                  placeholder={t("signup.emailPlaceholder")}
                  {...register("email")}
                  disabled={isLoading}
                />
                {errors.email && (
                  <p className="text-sm text-destructive">{errors.email.message}</p>
                )}
              </div>

              {/* Phone */}

              <div className="flex flex-col gap-1">
                <Label>{t("signup.phone")}</Label>
                <Input
                  placeholder={t("signup.phonePlaceholder")}
                  {...register("phone")}
                  disabled={isLoading}
                />
                {errors.phone && (
                  <p className="text-sm text-destructive">{errors.phone.message}</p>
                )}
              </div>

              {/* Role */}

              <div className="flex flex-col gap-1">
                <Label>{t("signup.role", "Role")}</Label>
                <Controller
                  name="role"
                  control={control}
                  render={({ field }) => (
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                      disabled={isLoading}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select your role" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="TEAM_MEMBER">Employee</SelectItem>
                        <SelectItem value="HR">HR Manager</SelectItem>
                      </SelectContent>
                    </Select>
                  )}
                />
                {errors.role && (
                  <p className="text-sm text-destructive">{errors.role.message}</p>
                )}
              </div>

              {/* Password */}

              <div className="flex flex-col gap-1">
                <Label>{t("signup.password")}</Label>
                <Input
                  type="password"
                  placeholder={t("signup.passwordPlaceholder")}
                  {...register("password")}
                  disabled={isLoading}
                />
                {errors.password && (
                  <p className="text-sm text-destructive">
                    {errors.password.message}
                  </p>
                )}
              </div>

              {/* Submit */}

              <div className="text-center space-y-2">
                <Button className="w-full" type="submit" disabled={isLoading}>
                  {isLoading ? (
                    <>
                      <Icons.spinner className="h-4 w-4 animate-spin" />
                      {t("signup.submitting")}
                    </>
                  ) : (
                    t("signup.submit")
                  )}
                </Button>

                <Link
                  to="/login"
                  className="text-sm text-primary hover:underline"
                >
                  {t("signup.loginLink")}
                </Link>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
