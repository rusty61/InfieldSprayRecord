import Records from "../../pages/Records";
import { Router } from "wouter";
import { ThemeProvider } from "../ThemeProvider";
import { Toaster } from "@/components/ui/toaster";

export default function RecordsExample() {
  return (
    <ThemeProvider>
      <Router>
        <Records />
        <Toaster />
      </Router>
    </ThemeProvider>
  );
}
