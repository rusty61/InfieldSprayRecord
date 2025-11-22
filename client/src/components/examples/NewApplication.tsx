import NewApplication from "../../pages/NewApplication";
import { Router } from "wouter";
import { ThemeProvider } from "../ThemeProvider";
import { Toaster } from "@/components/ui/toaster";

export default function NewApplicationExample() {
  return (
    <ThemeProvider>
      <Router>
        <NewApplication />
        <Toaster />
      </Router>
    </ThemeProvider>
  );
}
