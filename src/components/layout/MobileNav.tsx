import { useLocation, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Home, Activity, Utensils, Heart, User } from "lucide-react";

const navItems = [
  { path: "/dashboard", icon: Home, label: "Home" },
  { path: "/fitness", icon: Activity, label: "Fitness" },
  { path: "/nutrition", icon: Utensils, label: "Nutrition" },
  { path: "/health", icon: Heart, label: "Health" },
  { path: "/profile", icon: User, label: "Profile" },
];

export function MobileNav() {
  const location = useLocation();
  const navigate = useNavigate();

  return (
    <nav className="mobile-nav lg:hidden">
      <div className="flex items-center justify-around py-2 px-2 sm:px-4 safe-area-inset-bottom">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path;
          
          return (
            <button
              key={item.path}
              onClick={() => navigate(item.path)}
              className="relative flex flex-col items-center gap-0.5 sm:gap-1 p-1.5 sm:p-2 min-w-[50px] sm:min-w-[60px]"
            >
              {isActive && (
                <motion.div
                  layoutId="nav-indicator"
                  className="absolute -top-1 w-6 sm:w-8 h-1 rounded-full bg-primary"
                  transition={{ type: "spring", stiffness: 500, damping: 30 }}
                />
              )}
              <item.icon 
                className={`w-5 h-5 transition-colors ${
                  isActive ? "text-primary" : "text-muted-foreground"
                }`} 
              />
              <span 
                className={`text-[10px] sm:text-xs transition-colors ${
                  isActive ? "text-primary font-medium" : "text-muted-foreground"
                }`}
              >
                {item.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
