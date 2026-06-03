import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { useTranslation } from "react-i18next";
import { useSettings } from "@/components/language-provider";
import { userService, type User } from "@/services/user.service";
import { toast } from "sonner";
import { Icons } from "@/components/icons";

export default function SettingsPage() {
  const { language, setLanguage, themeColor, setThemeColor } = useSettings();
  const { t } = useTranslation();

  // Profile Form States
  const [, setProfile] = useState<User | null>(null);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [bio, setBio] = useState(""); // local-only UI state or default
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const data = await userService.getProfile();
        setProfile(data);
        setName(data.name);
        setEmail(data.email);
        setBio(data.role + " Profile");
      } catch (error) {
        console.error("Failed to fetch user profile", error);
        toast.error("Failed to load profile details");
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, []);

  const handleUpdateProfile = async () => {
    if (!name || !email) {
      toast.error("Name and Email are required");
      return;
    }
    setUpdating(true);
    try {
      const updated = await userService.updateProfile({ name, email });
      setProfile(updated);
      toast.success("Profile updated successfully");
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to update profile");
    } finally {
      setUpdating(false);
    }
  };

  const handleSavePreferences = () => {
    toast.success("Preferences saved successfully");
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-20">
        <Icons.spinner className="h-10 w-10 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-500 pb-10">
      <div>
        <h2 className="inline-block text-xl justify-self-start font-bold tracking-tight">
          {t("settings.title", "Settings")}
        </h2>
        <p className="text-sm text-muted-foreground">
          {t("settings.description", "Manage your profile, preferences, and notifications.")}
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Localization & Preferences */}
        <Card className="flex flex-col">
          <CardHeader>
            <CardTitle>{t("settings.preferences.title", "Preferences")}</CardTitle>
            <CardDescription>
              {t("settings.preferences.description", "Configure interface language and visual theme.")}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6 flex-1">
            <div className="space-y-3">
              <Label>{t("settings.preferences.localization", "Language")}</Label>
              <Select value={language} onValueChange={(val: any) => setLanguage(val)}>
                <SelectTrigger className="w-full" dir={language === "arabic" ? "rtl" : "ltr"}>
                  <SelectValue placeholder={t("settings.preferences.selectLanguage", "Select Language")} />
                </SelectTrigger>
                <SelectContent dir={language === "arabic" ? "rtl" : "ltr"}>
                  <SelectItem value="english">English (US)</SelectItem>
                  <SelectItem value="arabic">Arabic (العربية)</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">
                {t("settings.preferences.languageHint", "Changes will apply immediately across all application pages.")}
              </p>
            </div>

            <Separator />

            <div className="space-y-3">
              <Label>{t("settings.preferences.themeColor", "Theme Color")}</Label>
              <RadioGroup
                value={themeColor}
                onValueChange={setThemeColor}
                className="flex gap-4"
              >
                {[
                  {
                    id: "blue",
                    colorClass: "bg-blue",
                    activeBorder: "peer-data-[state=checked]:border-blue",
                  },
                  {
                    id: "orange",
                    colorClass: "bg-orange",
                    activeBorder: "peer-data-[state=checked]:border-orange",
                  },
                  {
                    id: "red",
                    colorClass: "bg-red",
                    activeBorder: "peer-data-[state=checked]:border-red",
                  },
                  {
                    id: "green",
                    colorClass: "bg-green",
                    activeBorder: "peer-data-[state=checked]:border-green",
                  },
                  {
                    id: "purple",
                    colorClass: "bg-purple-600",
                    activeBorder: "peer-data-[state=checked]:border-purple-600",
                  },
                ].map((themeItem) => (
                  <div key={themeItem.id} className="flex items-center space-x-2">
                    <RadioGroupItem
                      value={themeItem.id}
                      id={themeItem.id}
                      className="peer sr-only"
                    />
                    <Label
                      htmlFor={themeItem.id}
                      className={`h-10 w-10 rounded-md border border-muted bg-transparent hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-2 ${themeItem.activeBorder} peer-focus-visible:ring-2 peer-focus-visible:ring-ring flex items-center justify-center cursor-pointer`}
                    >
                      <span
                        className={`block h-6 w-6 rounded-sm ${themeItem.colorClass}`}
                      />
                    </Label>
                  </div>
                ))}
              </RadioGroup>
              <p className="text-xs text-muted-foreground">
                {t("settings.preferences.themeHint", "Choose the primary color accent for active states.")}
              </p>
            </div>
          </CardContent>
          <CardFooter className="mt-auto border-t pt-6 rounded-b-xl">
            <Button onClick={handleSavePreferences}>{t("settings.preferences.save", "Save Preferences")}</Button>
          </CardFooter>
        </Card>

        {/* Profile Settings */}
        <Card className="flex flex-col">
          <CardHeader>
            <CardTitle>{t("settings.profile.title", "Profile Settings")}</CardTitle>
            <CardDescription>
              {t("settings.profile.description", "Manage your personal profile details.")}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-5 flex-1">
            <div className="space-y-2">
              <Label htmlFor="name">{t("settings.profile.name", "Full Name")}</Label>
              <Input
                id="name"
                placeholder="John Doe"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">{t("settings.profile.email", "Email Address")}</Label>
              <Input
                id="email"
                type="email"
                placeholder="john@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="bio">{t("settings.profile.bio", "Role / Info")}</Label>
              <Input 
                id="bio" 
                placeholder="Role or short bio" 
                value={bio}
                onChange={(e) => setBio(e.target.value)}
              />
            </div>
          </CardContent>
          <CardFooter className="flex justify-end mt-auto border-t pt-6 rounded-b-xl gap-2">
            <Button onClick={handleUpdateProfile} disabled={updating}>
              {updating ? "Saving..." : t("settings.profile.update", "Update Profile")}
            </Button>
          </CardFooter>
        </Card>

        {/* Notifications */}
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>{t("settings.notifications.title", "Notifications")}</CardTitle>
            <CardDescription>
              {t("settings.notifications.description", "Set your communication preferences.")}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center justify-between space-x-2">
              <div className="flex flex-col space-y-1">
                <Label htmlFor="marketing">{t("settings.notifications.marketing", "Marketing Emails")}</Label>
                <span className="text-xs text-muted-foreground">
                  {t("settings.notifications.marketingDesc", "Receive announcements about product features and special offers.")}
                </span>
              </div>
              <Switch id="marketing" defaultChecked />
            </div>
            <Separator />
            <div className="flex items-center justify-between space-x-2">
              <div className="flex flex-col space-y-1">
                <Label htmlFor="security">{t("settings.notifications.security", "Security Alerts")}</Label>
                <span className="text-xs text-muted-foreground">
                  {t("settings.notifications.securityDesc", "Critical alerts regarding system access and account actions.")}
                </span>
              </div>
              <Switch id="security" defaultChecked disabled />
            </div>
            <Separator />
            <div className="flex items-center justify-between space-x-2">
              <div className="flex flex-col space-y-1">
                <Label htmlFor="updates">{t("settings.notifications.updates", "Activity Reports")}</Label>
                <span className="text-xs text-muted-foreground">
                  {t("settings.notifications.updatesDesc", "Daily digests or notifications about project status and invoice updates.")}
                </span>
              </div>
              <Switch id="updates" />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
