import Dashboard from "../../pages/Dashboard";
import { Router } from "wouter";
import { ThemeProvider } from "../ThemeProvider";
import { Toaster } from "@/components/ui/toaster";

export default function DashboardExample() {
  return (
    <ThemeProvider>
      <Router>
        <Dashboard />
        <Toaster />
      </Router>
    </ThemeProvider>
  );
}
