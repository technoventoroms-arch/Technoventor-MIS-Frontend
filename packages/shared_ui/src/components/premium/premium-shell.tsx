import { useEffect, useMemo, useState, type ComponentType, type ReactNode } from "react";
import { Link, NavLink, Outlet } from "react-router-dom";
import {
  Bell,
  Command,
  LogOut,
  Menu,
  Moon,
  Search,
  Sun,
} from "lucide-react";

import { cn } from "@mono/shared_ui/lib/utils";
import { useThemeContext } from "@mono/shared_ui/provider/theme-provider";
import { Button } from "@mono/shared_ui/components/ui/button";
import { Badge } from "@mono/shared_ui/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@mono/shared_ui/components/ui/dialog";
import { Input } from "@mono/shared_ui/components/ui/input";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@mono/shared_ui/components/ui/sheet";

export type ShellNavItem = {
  label: string;
  to: string;
  icon: ComponentType<{ className?: string }>;
  end?: boolean;
};

export type ShellContext = {
  label: string;
  value: string;
};

export type ShellNotification = {
  id: string | number;
  title: string;
  message: string;
  createdAt?: string;
  isRead?: boolean;
  to?: string;
};

export function PremiumShell({
  appName,
  appSubtitle,
  logoSrc,
  navItems,
  userName,
  userEmail,
  contexts = [],
  notifications = [],
  onSignOut,
  children,
}: {
  appName: string;
  appSubtitle: string;
  logoSrc?: string;
  navItems: ShellNavItem[];
  userName?: string;
  userEmail?: string;
  contexts?: ShellContext[];
  notifications?: ShellNotification[];
  onSignOut?: () => void;
  children?: ReactNode;
}) {
  const { darkTheme, toggleTheme } = useThemeContext();
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const searchResults = useMemo(() => {
    const normalizedQuery = searchQuery.trim().toLowerCase();
    if (!normalizedQuery) return navItems;
    return navItems.filter(
      (item) =>
        item.label.toLowerCase().includes(normalizedQuery) ||
        item.to.toLowerCase().includes(normalizedQuery)
    );
  }, [navItems, searchQuery]);
  const unreadCount = notifications.filter((notification) => !notification.isRead).length;

  useEffect(() => {
    function handleKeyboardShortcut(event: KeyboardEvent) {
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        setIsSearchOpen(true);
      }
    }

    window.addEventListener("keydown", handleKeyboardShortcut);
    return () => window.removeEventListener("keydown", handleKeyboardShortcut);
  }, []);

  const contextPanel = (
    <div className="rounded-2xl border border-slate-200 bg-slate-50/70 p-3 dark:border-white/10 dark:bg-white/[0.03]">
      <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-wide text-slate-500 dark:text-slate-400">
        <Command className="size-3.5" />
        Context
      </div>
      <div className="mt-3 space-y-2">
        {contexts.length ? (
          contexts.map((context) => (
            <div key={`${context.label}-${context.value}`} className="min-w-0">
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {context.label}
              </p>
              <p className="truncate text-sm font-semibold">{context.value}</p>
            </div>
          ))
        ) : (
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Choose an organisation to begin.
          </p>
        )}
      </div>
    </div>
  );

  const renderNavItems = (onNavigate?: () => void) =>
    navItems.map((item) => {
      const Icon = item.icon;
      return (
        <NavLink
          key={item.to}
          to={item.to}
          end={item.end}
          onClick={onNavigate}
          className={({ isActive }) =>
            cn(
              "group flex items-center gap-3 rounded-2xl px-3 py-2.5 text-sm font-medium transition",
              isActive
                ? "bg-teal-600 text-white shadow-lg shadow-teal-600/20"
                : "text-slate-600 hover:bg-slate-100 hover:text-slate-950 dark:text-slate-300 dark:hover:bg-white/10 dark:hover:text-white"
            )
          }
        >
          <Icon className="size-4" />
          {item.label}
        </NavLink>
      );
    });

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,rgba(13,148,136,0.14),transparent_34%),linear-gradient(180deg,#f8fafc_0%,#ecfeff_100%)] text-slate-950 dark:bg-[radial-gradient(circle_at_top_left,rgba(45,212,191,0.18),transparent_34%),linear-gradient(180deg,#020617_0%,#0f172a_100%)] dark:text-white">
      <div className="flex min-h-screen">
        <aside className="sticky top-0 hidden h-screen w-72 shrink-0 border-r border-slate-200/70 bg-white/80 px-4 py-5 backdrop-blur-xl lg:block dark:border-white/10 dark:bg-slate-950/70">
          <Link to="/" className="flex items-center gap-3 px-2">
            {logoSrc ? (
              <img src={logoSrc} alt={`${appName} logo`} className="h-11 w-auto rounded-md bg-white px-1 py-1" />
            ) : (
              <div className="flex size-11 items-center justify-center rounded-2xl bg-gradient-to-br from-teal-600 to-cyan-500 text-xs font-bold text-white shadow-lg shadow-teal-600/25">
                MIS
              </div>
            )}
            <div>
              <p className="text-base font-semibold tracking-tight">{appName}</p>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {appSubtitle}
              </p>
            </div>
          </Link>

          {contextPanel}

          <nav className="mt-6 space-y-1">
            {renderNavItems()}
          </nav>
        </aside>

        <div className="flex min-w-0 flex-1 flex-col">
          <header className="sticky top-0 z-20 border-b border-slate-200/70 bg-white/75 px-4 py-3 backdrop-blur-xl md:px-8 dark:border-white/10 dark:bg-slate-950/65">
            <div className="flex items-center justify-between gap-4">
              <div className="flex min-w-0 items-center gap-3">
                <Button
                  variant="ghost"
                  size="icon"
                  className="lg:hidden"
                  onClick={() => setIsMobileNavOpen(true)}
                  aria-label="Open navigation"
                >
                  <Menu className="size-5" />
                </Button>
                <button
                  type="button"
                  onClick={() => setIsSearchOpen(true)}
                  className="hidden min-w-80 items-center gap-2 rounded-2xl border border-slate-200 bg-white px-3 py-2 text-left text-sm text-slate-500 shadow-sm transition hover:border-teal-200 hover:text-slate-700 md:flex dark:border-white/10 dark:bg-white/[0.03] dark:text-slate-400 dark:hover:border-white/20 dark:hover:text-slate-200"
                >
                  <Search className="size-4" />
                  <span>Search labs, machines, inventory, projects...</span>
                  <Badge variant="secondary" className="ml-auto text-[10px]">
                    Ctrl K
                  </Badge>
                </button>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="icon"
                  aria-label="Toggle theme"
                  onClick={() => toggleTheme(darkTheme ? "light" : "dark")}
                >
                  <Sun className="size-4 dark:hidden" />
                  <Moon className="hidden size-4 dark:block" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="relative"
                  aria-label="Notifications"
                  onClick={() => setIsNotificationsOpen(true)}
                >
                  <Bell className="size-4" />
                  {unreadCount ? (
                    <span className="absolute right-1 top-1 inline-flex size-2 rounded-full bg-rose-500" />
                  ) : null}
                </Button>
                <div className="hidden border-l border-slate-200 pl-3 md:block dark:border-white/10">
                  <p className="text-sm font-semibold">{userName ?? "MIS User"}</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    {userEmail ?? "Signed in"}
                  </p>
                </div>
                {onSignOut ? (
                  <Button variant="outline" size="sm" onClick={onSignOut}>
                    <LogOut className="size-4" />
                    Sign out
                  </Button>
                ) : null}
              </div>
            </div>
          </header>
          <main className="flex-1 px-4 py-6 md:px-8 md:py-8">
            {children ?? <Outlet />}
          </main>
        </div>
      </div>
      <Sheet open={isMobileNavOpen} onOpenChange={setIsMobileNavOpen}>
        <SheetContent side="left" className="w-80 max-w-[90vw] p-0">
          <SheetHeader className="border-b border-slate-200 p-5 text-left dark:border-white/10">
            <SheetTitle>{appName}</SheetTitle>
            <SheetDescription>{appSubtitle}</SheetDescription>
          </SheetHeader>
          <div className="space-y-5 p-5">
            {contextPanel}
            <nav className="space-y-1">{renderNavItems(() => setIsMobileNavOpen(false))}</nav>
          </div>
        </SheetContent>
      </Sheet>
      <Dialog open={isSearchOpen} onOpenChange={setIsSearchOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Search workspace</DialogTitle>
            <DialogDescription>
              Jump to any section in this workspace.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <Input
              autoFocus
              placeholder="Search navigation..."
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
            />
            <div className="max-h-72 space-y-1 overflow-y-auto">
              {searchResults.map((item) => {
                const Icon = item.icon;
                return (
                  <Link
                    key={item.to}
                    to={item.to}
                    onClick={() => setIsSearchOpen(false)}
                    className="flex items-center gap-3 rounded-2xl px-3 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-white/10"
                  >
                    <Icon className="size-4" />
                    <span>{item.label}</span>
                    <span className="ml-auto text-xs text-slate-400">Open</span>
                  </Link>
                );
              })}
              {!searchResults.length ? (
                <p className="rounded-2xl border border-dashed border-slate-200 p-4 text-sm text-slate-500 dark:border-white/10 dark:text-slate-400">
                  No matching workspace sections.
                </p>
              ) : null}
            </div>
          </div>
        </DialogContent>
      </Dialog>
      <Sheet open={isNotificationsOpen} onOpenChange={setIsNotificationsOpen}>
        <SheetContent>
          <SheetHeader>
            <SheetTitle>Notifications</SheetTitle>
            <SheetDescription>
              Updates will appear here when your administrator enables notifications.
            </SheetDescription>
          </SheetHeader>
          <div className="space-y-2 p-4">
            {notifications.length ? notifications.slice(0, 12).map((notification) => (
              notification.to ? (
                <Link
                  key={String(notification.id)}
                  to={notification.to}
                  onClick={() => setIsNotificationsOpen(false)}
                  className="block rounded-xl border p-3 text-sm"
                >
                  <p className="font-semibold">{notification.title}</p>
                  <p className="text-slate-500 dark:text-slate-400">{notification.message}</p>
                </Link>
              ) : (
                <div key={String(notification.id)} className="rounded-xl border p-3 text-sm">
                  <p className="font-semibold">{notification.title}</p>
                  <p className="text-slate-500 dark:text-slate-400">{notification.message}</p>
                </div>
              )
            )) : (
              <div className="text-sm text-slate-500 dark:text-slate-400">
                You have no new notifications right now.
              </div>
            )}
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
}
