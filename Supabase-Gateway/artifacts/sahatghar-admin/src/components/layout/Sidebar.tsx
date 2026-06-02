import React from "react";
import { Link, useLocation } from "wouter";
import { useAuth } from "@/contexts/AuthContext";
import { 
  LayoutDashboard, 
  Users, 
  UserRound, 
  Calendar, 
  CreditCard, 
  Key, 
  FileText, 
  LifeBuoy, 
  ShieldCheck, 
  Settings,
  LogOut,
} from "lucide-react";
import { cn } from "@/lib/utils";

const NAV_ITEMS = [
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { name: "Doctor Management", href: "/doctors", icon: UserRound },
  { name: "Patient Management", href: "/patients", icon: Users },
  { name: "Appointments", href: "/appointments", icon: Calendar },
  { name: "Payments", href: "/payments", icon: CreditCard },
  { name: "Subscriptions", href: "/subscriptions", icon: Key },
  { name: "Health Records", href: "/health-records", icon: FileText },
  { name: "Support Tickets", href: "/support", icon: LifeBuoy },
  { name: "Audit Logs & Security", href: "/audit-logs", icon: ShieldCheck },
  { name: "Settings", href: "/settings", icon: Settings },
];

export function Sidebar() {
  const [location] = useLocation();
  const { user, signOut } = useAuth();

  return (
    <div className="flex h-screen w-64 flex-col bg-sidebar border-r border-sidebar-border text-sidebar-foreground flex-shrink-0">
      <div className="flex h-16 items-center px-6 border-b border-sidebar-border">
        <div className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground font-bold text-sm shadow-sm">
            SG
          </div>
          <div className="font-semibold text-base leading-tight">
            SahatGhar
            <div className="text-[10px] font-normal text-sidebar-foreground/60">صحت آپ کے گھر</div>
          </div>
        </div>
      </div>

      <nav className="flex-1 overflow-y-auto px-3 py-3 space-y-0.5">
        {NAV_ITEMS.map((item) => {
          const isActive = location === item.href || location.startsWith(`${item.href}/`);
          return (
            <Link key={item.name} href={item.href} className={cn(
              "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
              isActive 
                ? "bg-sidebar-primary text-sidebar-primary-foreground shadow-sm" 
                : "text-sidebar-foreground/75 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
            )}>
              <item.icon className="h-4 w-4 flex-shrink-0" />
              {item.name}
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t border-sidebar-border">
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 rounded-full bg-primary/20 flex items-center justify-center text-sm font-bold text-primary flex-shrink-0">
            {(user?.email || user?.user_metadata?.name || "A")[0].toUpperCase()}
          </div>
          <div className="flex-1 min-w-0">
            <div className="truncate text-sm font-medium">{user?.email || "Admin User"}</div>
            <div className="text-xs text-sidebar-foreground/55">Super Admin</div>
          </div>
          <button
            onClick={signOut}
            className="p-2 text-sidebar-foreground/50 hover:text-sidebar-foreground transition-colors rounded-md hover:bg-sidebar-accent"
            title="Sign out"
          >
            <LogOut className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
