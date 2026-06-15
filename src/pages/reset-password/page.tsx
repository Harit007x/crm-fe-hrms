import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Link, useParams, useNavigate } from "react-router-dom";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Icons } from "@/components/icons";
import { AuthBrandPanel } from "@/components/auth-brand-panel";
import { authService } from "@/services/auth.service";
import { AlertCircle, CheckCircle2 } from "lucide-react";

// ---------------------- Zod Schema ----------------------
const ResetPasswordSchema = z.object({
  password: z
    .string()
    .min(1, "Password is required")
    .min(6, "Password must be at least 6 characters"),
  confirmPassword: z.string().min(1, "Please confirm your password"),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

type ResetPasswordFormValues = z.infer<typeof ResetPasswordSchema>;

export default function ResetPasswordPage() {
  const { token } = useParams<{ token: string }>();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // ---------------------- React Hook Form ----------------------
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ResetPasswordFormValues>({
    resolver: zodResolver(ResetPasswordSchema),
  });

  // ---------------------- Submit ----------------------
  const onSubmit = async (values: ResetPasswordFormValues) => {
    if (!token) {
      setError("Reset token is missing.");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await authService.resetPassword(token, values.password);

      if (response.success) {
        setIsSuccess(true);
        setTimeout(() => {
          navigate("/login");
        }, 3000);
      } else {
        setError(response.message || "Failed to reset password.");
      }
    } catch (error: any) {
      console.error("Reset password failed:", error);
      setError(error.response?.data?.message || "Failed to reset password. The link might be expired.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full">
      <div className="flex min-h-screen flex-col lg:grid lg:grid-cols-2">
        {/* LEFT SECTION — branded panel */}
        <AuthBrandPanel
          headline="Set a new password."
          subline="Choose a strong password you don't use elsewhere. You'll be signed back in moments after."
        />

        {/* RIGHT SECTION */}
        <div className="flex flex-col items-center justify-center bg-background px-6 py-10 min-h-screen">
          <div className="w-full max-w-sm space-y-5">
            {/* Header */}
            <div className="text-left space-y-1.5">
              <h1 className="text-xl font-bold tracking-tight text-foreground">
                Reset Password
              </h1>
              <p className="text-sm text-muted-foreground">
                Enter your new password below.
              </p>
            </div>

            {/* Success Message */}
            {isSuccess && (
              <div className="rounded-lg border border-green/20 bg-greenBackground p-4">
                <div className="flex gap-3">
                  <CheckCircle2 className="h-5 w-5 shrink-0 text-green" />
                  <div className="space-y-1">
                    <p className="text-sm font-medium text-green">
                      Password changed successfully!
                    </p>
                    <p className="text-xs text-green/80">
                      You will be redirected to the login page shortly.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Error Message */}
            {error && (
              <div className="rounded-lg border border-destructive/20 bg-redBackground p-4">
                <div className="flex gap-3">
                  <AlertCircle className="h-5 w-5 shrink-0 text-destructive" />
                  <div className="space-y-1">
                    <p className="text-sm font-medium text-destructive">Error</p>
                    <p className="text-xs text-destructive/80">{error}</p>
                  </div>
                </div>
              </div>
            )}

            {/* FORM */}
            {!isSuccess && (
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 py-2">
                {/* Password */}
                <div className="flex flex-col gap-1">
                  <Label>New Password</Label>
                  <Input
                    type="password"
                    placeholder="Enter new password"
                    {...register("password")}
                    disabled={isLoading}
                  />
                  {errors.password && (
                    <p className="text-sm text-destructive">{errors.password.message}</p>
                  )}
                </div>

                {/* Confirm Password */}
                <div className="flex flex-col gap-1">
                  <Label>Confirm Password</Label>
                  <Input
                    type="password"
                    placeholder="Confirm new password"
                    {...register("confirmPassword")}
                    disabled={isLoading}
                  />
                  {errors.confirmPassword && (
                    <p className="text-sm text-destructive">
                      {errors.confirmPassword.message}
                    </p>
                  )}
                </div>

                {/* Submit */}
                <div className="text-center space-y-2">
                  <Button className="w-full" type="submit" disabled={isLoading}>
                    {isLoading ? (
                      <>
                        <Icons.spinner className=" h-4 w-4 animate-spin mr-2" />
                        Resetting...
                      </>
                    ) : (
                      "Reset Password"
                    )}
                  </Button>

                  <Link
                    to="/login"
                    className="text-sm text-primary hover:underline"
                  >
                    Back to Login
                  </Link>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
