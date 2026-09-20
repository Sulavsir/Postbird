import {
  Inbox,
  LayoutDashboard,
  Mail,
  Paperclip,
  Send,
  Settings2,
  ShieldCheck,
  UserRound,
} from "lucide-react";
import { NavLink } from "react-router-dom";
import { APP_ROUTES } from "../../constants";
import { cn } from "@/lib/utils";

export function Sidebar({
  name,
  email,
  open = false,
  onNavigate,
}: {
  name: string;
  email?: string;
  open?: boolean;
  onNavigate?: () => void;
}) {
  const initials = name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
  const items = [
    { to: APP_ROUTES.overview, label: "Overview", icon: LayoutDashboard },
    { to: APP_ROUTES.compose, label: "Compose", icon: Send },
    { to: APP_ROUTES.history, label: "Sent history", icon: Mail },
    { to: APP_ROUTES.inbox, label: "Inbox", icon: Inbox },
    { to: APP_ROUTES.smtp, label: "SMTP settings", icon: Settings2 },
    { to: APP_ROUTES.attachments, label: "Attachments", icon: Paperclip },
    { to: APP_ROUTES.account, label: "Account", icon: UserRound },
  ];
  return (
    <aside
      className={cn(
        "fixed inset-y-0 left-0 z-30 flex w-60 shrink-0 flex-col border-r bg-card px-3.5 py-6 lg:static",
        open ? "flex" : "hidden lg:flex",
      )}
    >
      <div className="mb-6 flex items-center gap-2.5 px-3 font-heading text-xl font-extrabold tracking-tight">
        <span className="grid size-7 place-items-center rounded-lg bg-primary text-primary-foreground shadow-sm">
          <Mail size={16} />
        </span>
        postbird
      </div>
      <div className="mb-6 flex items-center gap-2 rounded-lg border px-2.5 py-2 text-sm">
        <span className="grid size-6 place-items-center rounded-md bg-orange-300 text-[11px] font-bold text-white">
          {initials[0] ?? "U"}
        </span>
          <span className="min-w-0">
          <small className="block text-[10px] text-muted-foreground">
            {email || "Your workspace"}
          </small>
          <strong className="block truncate text-xs">{name}</strong>
        </span>
      </div>
      <nav className="flex flex-1 flex-col gap-1" aria-label="Main navigation">
        <p className="px-3 pb-1 text-[10px] font-bold tracking-widest text-muted-foreground uppercase">
          Workspace
        </p>
        {items.slice(0, 4).map((item) => (
          <NavLink
            key={item.to}
            className={({ isActive }) =>
              cn(
                "flex h-9 items-center gap-2.5 rounded-lg px-3 text-sm font-medium text-muted-foreground",
                isActive && "bg-secondary text-secondary-foreground",
              )
            }
            to={item.to}
            end={item.to === APP_ROUTES.overview}
            onClick={onNavigate}
          >
            <item.icon size={16} /> {item.label}
          </NavLink>
        ))}
        <p className="mt-6 px-3 pb-1 text-[10px] font-bold tracking-widest text-muted-foreground uppercase">
          Manage
        </p>
        {items.slice(4).map((item) => (
          <NavLink
            key={item.to}
            className={({ isActive }) =>
              cn(
                "flex h-9 items-center gap-2.5 rounded-lg px-3 text-sm font-medium text-muted-foreground",
                isActive && "bg-secondary text-secondary-foreground",
              )
            }
            to={item.to}
            onClick={onNavigate}
          >
            <item.icon size={16} /> {item.label}
          </NavLink>
        ))}
      </nav>
      <div className="mt-auto border-t pt-4">
        <div className="mb-3 flex gap-2 px-2 text-emerald-700">
          <ShieldCheck size={16} className="mt-0.5" />
          <span>
            <strong className="block text-xs">Secure delivery</strong>
            <small className="text-[10px] text-emerald-800/70">
              SMTP secrets stay on the server
            </small>
          </span>
        </div>
        <div className="flex items-center gap-2 px-2">
          <span className="grid size-7 place-items-center rounded-full bg-slate-400 text-[10px] font-bold text-white">
            {initials}
          </span>
          <span>
            <strong className="block text-xs">{name}</strong>
            <small className="text-[10px] text-muted-foreground">
              {email || "Signed in"}
            </small>
          </span>
        </div>
      </div>
    </aside>
  );
}
