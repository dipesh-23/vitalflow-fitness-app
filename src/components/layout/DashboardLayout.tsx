import { ReactNode } from "react";
import { MobileNav } from "./MobileNav";
import { useNavigate, useLocation } from "react-router-dom";
import { Heart, Home, Activity, Utensils, User, LogOut } from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";

interface DashboardLayoutProps {
  children: ReactNode;
}

const navItems = [
  { path: "/dashboard", icon: Home, label: "Dashboard" },
  { path: "/fitness", icon: Activity, label: "Fitness" },
  { path: "/nutrition", icon: Utensils, label: "Nutrition" },
  { path: "/health", icon: Heart, label: "Health" },
  { path: "/profile", icon: User, label: "Profile" },
];

export function DashboardLayout({ children }: DashboardLayoutProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const { signOut, user } = useAuth();

  const handleSignOut = async () => {
    await signOut();
    navigate("/");
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex fixed left-0 top-0 bottom-0 w-64 flex-col border-r bg-card p-4">
        <div className="flex items-center gap-2 mb-8">
          <div className="p-1.5 rounded-lg bg-primary">
            <Heart className="w-5 h-5 text-primary-foreground" />
          </div>
          <span className="text-xl font-bold gradient-text">VitalFlow</span>
        </div>

        <nav className="flex-1 space-y-1">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path;
            
            return (
              <button
                key={item.path}
                onClick={() => navigate(item.path)}
                className={`relative w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left transition-colors ${
                  isActive 
                    ? "bg-primary/10 text-primary" 
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                }`}
              >
                {isActive && (
                  <motion.div
                    layoutId="sidebar-indicator"
                    className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 rounded-r-full bg-primary"
                    transition={{ type: "spring", stiffness: 500, damping: 30 }}
                  />
                )}
                <item.icon className="w-5 h-5" />
                <span className="font-medium">{item.label}</span>
              </button>
            );
          })}
        </nav>

        <div className="border-t pt-4">
          <div className="px-4 mb-4">
            <p className="text-sm font-medium truncate">{user?.email}</p>
            <p className="text-xs text-muted-foreground">Free Plan</p>
          </div>
          <Button
            variant="ghost"
            className="w-full justify-start gap-3 text-muted-foreground hover:text-destructive"
            onClick={handleSignOut}
          >
            <LogOut className="w-5 h-5" />
            Sign Out
          </Button>
        </div>
      </aside>

      {/* Main content */}
      <main className="lg:pl-64 pb-20 lg:pb-0">
        <div className="container max-w-4xl mx-auto py-4 px-3 sm:py-6 sm:px-4">
          {children}
        </div>
      </main>

      {/* Mobile Navigation */}
      <MobileNav />
    </div>
  );
}
