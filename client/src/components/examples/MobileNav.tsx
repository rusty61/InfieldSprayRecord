import { MobileNav } from "../MobileNav";
import { Router } from "wouter";

export default function MobileNavExample() {
  return (
    <Router>
      <div className="h-20 bg-background">
        <MobileNav />
      </div>
    </Router>
  );
}
