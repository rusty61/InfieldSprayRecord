import { Menu, Wifi, WifiOff, Moon, Sun } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useTheme } from "./ThemeProvider";
import { Badge } from "@/components/ui/badge";

interface AppHeaderProps {
  title: string;
  onMenuClick?: () => void;
}

export function AppHeader({ title, onMenuClick }: AppHeaderProps) {
  const { theme, toggleTheme } = useTheme();
  const isOnline = true; // todo: remove mock functionality

  return (
    <header className="sticky top-0 z-40 bg-card/95 backdrop-blur border-b border-card-border">
      <div className="flex items-center justify-between h-14 px-4 gap-4 text-[#fcb32c]">
        <div className="flex items-center gap-3">
          {onMenuClick && (
            <Button
              size="icon"
              variant="ghost"
              onClick={onMenuClick}
              data-testid="button-menu"
              className="md:hidden"
            >
              <Menu className="w-5 h-5" />
            </Button>
          )}
          <h1 className="text-lg font-semibold truncate text-[#fcb32c]">{title}</h1>
        </div>

        <div className="flex items-center gap-2">
          <Badge
            variant="secondary"
            className="hidden md:flex items-center gap-1.5"
            data-testid="status-sync"
          >
            {isOnline ? (
              <>
                <Wifi className="w-3 h-3 text-primary" />
                <span className="text-xs">Synced</span>
              </>
            ) : (
              <>
                <WifiOff className="w-3 h-3 text-muted-foreground" />
                <span className="text-xs">Offline</span>
              </>
            )}
          </Badge>

          <Button
            size="icon"
            variant="ghost"
            onClick={toggleTheme}
            data-testid="button-theme-toggle"
          >
            {theme === "light" ? (
              <Moon className="w-5 h-5" />
            ) : (
              <Sun className="w-5 h-5" />
            )}
          </Button>

          <Avatar className="w-8 h-8" data-testid="avatar-user">
            <AvatarFallback className="text-xs bg-primary text-primary-foreground">
              JD
            </AvatarFallback>
          </Avatar>
        </div>
      </div>
    </header>
  );
}
