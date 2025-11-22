import Settings from "../../pages/Settings";
import { Router } from "wouter";
import { ThemeProvider } from "../ThemeProvider";
import { Toaster } from "@/components/ui/toaster";

export default function SettingsExample() {
  return (
    <ThemeProvider>
      <Router>
        <Settings />
        <Toaster />
      </Router>
    </ThemeProvider>
  );
}
