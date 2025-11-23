import { AppHeader } from "@/components/AppHeader";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { User, Bell, Database, Shield } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function Settings() {
  const { toast } = useToast();

  const handleSave = () => {
    console.log("Settings saved");
    toast({
      title: "Settings Saved",
      description: "Your preferences have been updated successfully.",
    });
  };

  return (
    <div className="min-h-screen bg-background pb-20 md:pb-6">
      <AppHeader title="Settings" />
      <main className="p-4 md:p-6 space-y-6 max-w-4xl mx-auto">
        <div>
          <h2 className="text-2xl font-semibold mb-2 text-[#fcb32c]">Settings</h2>
          <p className="text-sm text-[#fcb32c]">
            Manage your account and application preferences
          </p>
        </div>

        <Card className="p-6 space-y-6 text-[#fcb32c]">
          <div className="flex items-center gap-3">
            <User className="w-5 h-5 text-primary" />
            <h3 className="text-lg font-semibold">Profile</h3>
          </div>

          <div className="space-y-4">
            <div>
              <Label htmlFor="name" className="text-sm font-medium">
                Full Name
              </Label>
              <Input
                id="name"
                defaultValue="John Davis"
                className="mt-1.5 bg-[#093d2bcc]"
                data-testid="input-name"
              />
            </div>

            <div>
              <Label htmlFor="email" className="text-sm font-medium">
                Email Address
              </Label>
              <Input
                id="email"
                type="email"
                defaultValue="john.davis@example.com"
                className="mt-1.5 bg-[#093d2bc9]"
                data-testid="input-email"
              />
            </div>

            <div>
              <Label htmlFor="role" className="text-sm font-medium">
                Role
              </Label>
              <Input
                id="role"
                defaultValue="Farm Owner"
                disabled
                className="mt-1.5"
                data-testid="input-role"
              />
            </div>
          </div>
        </Card>

        <Card className="p-6 space-y-6 text-[#fcb32c]">
          <div className="flex items-center gap-3">
            <Bell className="w-5 h-5 text-primary" />
            <h3 className="text-lg font-semibold">Notifications</h3>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="sync-notifications" className="text-sm font-medium">
                  Sync Notifications
                </Label>
                <p className="text-xs text-muted-foreground">
                  Get notified when data syncs successfully
                </p>
              </div>
              <Switch id="sync-notifications" defaultChecked data-testid="switch-sync-notifications" />
            </div>

            <Separator />

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="weather-alerts" className="text-sm font-medium">
                  Weather Alerts
                </Label>
                <p className="text-xs text-muted-foreground">
                  Alert when weather conditions are outside safe ranges
                </p>
              </div>
              <Switch id="weather-alerts" defaultChecked data-testid="switch-weather-alerts" />
            </div>
          </div>
        </Card>

        <Card className="p-6 space-y-6 text-[#fcb32c]">
          <div className="flex items-center gap-3">
            <Database className="w-5 h-5 text-primary" />
            <h3 className="text-lg font-semibold">Data & Storage</h3>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 rounded-lg bg-accent/50">
              <div>
                <p className="text-sm font-medium">Offline Storage</p>
                <p className="text-xs text-muted-foreground">
                  12 records cached locally
                </p>
              </div>
              <Button variant="outline" size="sm" data-testid="button-clear-cache">
                Clear Cache
              </Button>
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="auto-backup" className="text-sm font-medium">
                  Automatic Backup
                </Label>
                <p className="text-xs text-muted-foreground">
                  Backup data daily to cloud storage
                </p>
              </div>
              <Switch id="auto-backup" defaultChecked data-testid="switch-auto-backup" />
            </div>
          </div>
        </Card>

        <Card className="p-6 space-y-6 text-[#fcb32c]">
          <div className="flex items-center gap-3">
            <Shield className="w-5 h-5 text-primary" />
            <h3 className="text-lg font-semibold">Security</h3>
          </div>

          <div className="space-y-4">
            <Button variant="outline" className="w-full" data-testid="button-change-password">
              Change Password
            </Button>
            <Button variant="outline" className="w-full" data-testid="button-2fa">
              Enable Two-Factor Authentication
            </Button>
          </div>
        </Card>

        <div className="flex gap-3">
          <Button onClick={handleSave} className="flex-1" data-testid="button-save-settings">
            Save Changes
          </Button>
        </div>
      </main>
    </div>
  );
}
