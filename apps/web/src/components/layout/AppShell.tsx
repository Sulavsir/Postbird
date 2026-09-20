import { useState } from "react";
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import { Menu, X } from "lucide-react";
import { APP_ROUTES } from "../../constants";
import { useAuth } from "../../features/auth";
import { useDashboard } from "../../features/dashboard";
import { Button } from "@/components/ui/button";
import { Sidebar } from "./Sidebar";

const titles: Record<string, string> = {
  [APP_ROUTES.overview]: "Overview",
  [APP_ROUTES.compose]: "Compose",
  [APP_ROUTES.smtp]: "SMTP settings",
  [APP_ROUTES.history]: "Sent history",
  [APP_ROUTES.inbox]: "Inbox",
  [APP_ROUTES.attachments]: "Attachments",
};

export function AppShell() {
  const { logout } = useAuth();
  const dashboard = useDashboard();
  const navigate = useNavigate();
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);
  const name =
    dashboard.data?.user?.displayName ||
    dashboard.data?.user?.email ||
    "Workspace";
  const title =
    titles[location.pathname] ??
    (location.pathname.startsWith("/history/") ? "Message" : "Workspace");

  return (
    <div className="flex min-h-screen">
      {menuOpen ? (
        <button
          className="fixed inset-0 z-20 bg-foreground/40 lg:hidden"
          type="button"
          aria-label="Close navigation"
          onClick={() => setMenuOpen(false)}
        />
      ) : null}
      <Sidebar
        name={name}
        open={menuOpen}
        onNavigate={() => setMenuOpen(false)}
      />
      <main className="min-w-0 flex-1">
        <header className="flex h-16 items-center justify-between border-b bg-card px-4 sm:px-8">
          <div className="flex items-center gap-3 text-xs text-muted-foreground">
            <Button
              variant="ghost"
              size="icon"
              className="lg:hidden"
              type="button"
              aria-label="Open navigation"
              onClick={() => setMenuOpen(true)}
            >
              {menuOpen ? <X size={18} /> : <Menu size={18} />}
            </Button>
            <span>Workspace</span>
            <span>/</span>
            <strong className="text-foreground">{title}</strong>
          </div>
          <div className="flex items-center gap-3">
            <span className="hidden items-center gap-2 text-xs text-emerald-700 sm:flex">
              <span className="size-1.5 rounded-full bg-emerald-500" />
              {dashboard.data ? "Live account data" : "Connecting"}
            </span>
            <Button
              variant="ghost"
              size="sm"
              type="button"
              onClick={() => {
                logout();
                navigate(APP_ROUTES.login);
              }}
            >
              Sign out
            </Button>
          </div>
        </header>
        <Outlet />
      </main>
    </div>
  );
}
