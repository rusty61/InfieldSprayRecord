import { Home, FileText, Plus, MapPin, Settings } from "lucide-react";
import { useLocation, Link } from "wouter";
import { cn } from "@/lib/utils";

export function MobileNav() {
  const [location] = useLocation();

  const navItems = [
    { path: "/", icon: Home, label: "Dashboard" },
    { path: "/records", icon: FileText, label: "Records" },
    { path: "/new", icon: Plus, label: "New" },
    { path: "/paddocks", icon: MapPin, label: "Paddocks" },
    { path: "/settings", icon: Settings, label: "Settings" },
  ];

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-card border-t border-card-border">
      <div className="h-16 flex items-center justify-around px-2 text-[#fcb32c] bg-[#000000]">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = location === item.path;
          return (
            <Link key={item.path} href={item.path}>
              <div
                data-testid={`nav-${item.label.toLowerCase()}`}
                className="flex flex-col items-center justify-center min-w-[64px] h-12 rounded-lg transition-colors hover-elevate active-elevate-2 cursor-pointer bg-primary/10 text-[#fcb32c]"
              >
                <Icon
                  className={cn(
                    "w-6 h-6 mb-1",
                    isActive ? "text-primary" : "text-muted-foreground"
                  )}
                />
                <span
                  className="text-xs font-medium text-[#fcb32c]"
                >
                  {item.label}
                </span>
              </div>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
