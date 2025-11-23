import { AppHeader } from "@/components/AppHeader";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, Droplets, MapPin, FileText, TrendingUp } from "lucide-react";
import { Link } from "wouter";

export default function Dashboard() {
  // todo: remove mock functionality
  const stats = [
    { label: "Applications This Week", value: "12", icon: Droplets },
    { label: "Total Paddocks", value: "34", icon: MapPin },
    { label: "Active Records", value: "156", icon: FileText },
    { label: "Compliance Rate", value: "98%", icon: TrendingUp },
  ];

  const recentApplications = [
    {
      id: "1",
      paddock: "North Field 5",
      farm: "Riverside Farm",
      date: "2025-11-22",
      operator: "John Davis",
    },
    {
      id: "2",
      paddock: "South Block A",
      farm: "Riverside Farm",
      date: "2025-11-21",
      operator: "Sarah Mitchell",
    },
    {
      id: "3",
      paddock: "East Paddock 12",
      farm: "Hillside Farm",
      date: "2025-11-20",
      operator: "John Davis",
    },
  ];

  return (
    <div className="min-h-screen bg-background pb-20 md:pb-6">
      <AppHeader title="Dashboard" />
      <main className="p-4 md:p-6 space-y-6 max-w-6xl mx-auto">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-semibold text-[#fcb32c]">Welcome back</h2>
            <p className="text-sm text-muted-foreground mt-1">
              Track your spray applications and maintain compliance
            </p>
          </div>
          <Link href="/new">
            <Button data-testid="button-new-application" className="hidden md:flex">
              <Plus className="w-4 h-4 mr-2" />
              New Application
            </Button>
          </Link>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {stats.map((stat) => {
            const Icon = stat.icon;
            return (
              <Card key={stat.label} className="p-6 text-[19px] text-[#fcb32c]" data-testid={`stat-${stat.label.toLowerCase().replace(/\s+/g, '-')}`}>
                <div className="flex items-start justify-between mb-2">
                  <Icon className="w-5 h-5 text-primary" />
                </div>
                <p className="text-2xl font-semibold mb-1">{stat.value}</p>
                <p className="text-xs text-muted-foreground">{stat.label}</p>
              </Card>
            );
          })}
        </div>

        <Card className="p-6 text-[#fcb32c]">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">Recent Applications</h3>
            <Link href="/records">
              <Button variant="ghost" size="sm" data-testid="button-view-all">
                View All
              </Button>
            </Link>
          </div>

          <div className="space-y-3">
            {recentApplications.map((app) => (
              <div
                key={app.id}
                className="flex items-center justify-between p-4 rounded-lg border border-border hover-elevate active-elevate-2"
                data-testid={`application-${app.id}`}
              >
                <div className="flex-1">
                  <p className="font-medium">{app.paddock}</p>
                  <p className="text-sm text-muted-foreground">
                    {app.farm} • {app.operator}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium">
                    {new Date(app.date).toLocaleDateString("en-AU")}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </main>
    </div>
  );
}
