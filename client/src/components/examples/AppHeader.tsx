import { AppHeader } from "../AppHeader";
import { ThemeProvider } from "../ThemeProvider";

export default function AppHeaderExample() {
  return (
    <ThemeProvider>
      <AppHeader title="Dashboard" onMenuClick={() => console.log("Menu clicked")} />
    </ThemeProvider>
  );
}
