import { motion } from "framer-motion";
import { LucideIcon } from "lucide-react";

interface StatsCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: LucideIcon;
  color: "primary" | "accent" | "energy" | "sleep" | "stress" | "calories" | "protein" | "carbs" | "fats";
  progress?: number;
  trend?: "up" | "down" | "neutral";
}

const colorClasses = {
  primary: "bg-primary/10 text-primary",
  accent: "bg-accent/10 text-accent",
  energy: "bg-energy/10 text-energy",
  sleep: "bg-sleep/10 text-sleep",
  stress: "bg-stress/10 text-stress",
  calories: "bg-calories/10 text-calories",
  protein: "bg-protein/10 text-protein",
  carbs: "bg-carbs/10 text-carbs",
  fats: "bg-fats/10 text-fats",
};

const progressColors = {
  primary: "stroke-primary",
  accent: "stroke-accent",
  energy: "stroke-energy",
  sleep: "stroke-sleep",
  stress: "stroke-stress",
  calories: "stroke-calories",
  protein: "stroke-protein",
  carbs: "stroke-carbs",
  fats: "stroke-fats",
};

export function StatsCard({ 
  title, 
  value, 
  subtitle, 
  icon: Icon, 
  color,
  progress,
}: StatsCardProps) {
  const radius = 30;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (progress || 0) / 100 * circumference;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="p-3 sm:p-4 rounded-xl sm:rounded-2xl bg-card border shadow-sm stat-card"
    >
      <div className="flex items-start justify-between">
        <div className="flex-1 min-w-0">
          <div className={`w-8 h-8 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl ${colorClasses[color]} flex items-center justify-center mb-2 sm:mb-3`}>
            <Icon className="w-4 h-4 sm:w-5 sm:h-5" />
          </div>
          <p className="text-xs sm:text-sm text-muted-foreground mb-0.5 sm:mb-1 truncate">{title}</p>
          <p className="text-lg sm:text-2xl font-bold">{value}</p>
          {subtitle && (
            <p className="text-[10px] sm:text-xs text-muted-foreground mt-0.5 sm:mt-1 truncate">{subtitle}</p>
          )}
        </div>

        {progress !== undefined && (
          <div className="relative w-12 h-12 sm:w-16 sm:h-16 shrink-0">
            <svg className="w-12 h-12 sm:w-16 sm:h-16 progress-ring" viewBox="0 0 80 80">
              <circle
                className="progress-ring-bg"
                cx="40"
                cy="40"
                r={radius}
                fill="none"
                strokeWidth="6"
              />
              <circle
                className={`progress-ring-fill ${progressColors[color]}`}
                cx="40"
                cy="40"
                r={radius}
                fill="none"
                strokeWidth="6"
                strokeDasharray={circumference}
                strokeDashoffset={strokeDashoffset}
              />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-xs sm:text-sm font-semibold">{progress}%</span>
            </div>
          </div>
        )}
      </div>
    </motion.div>
  );
}
