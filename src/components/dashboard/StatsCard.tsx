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
      className="p-4 rounded-2xl bg-card border shadow-sm stat-card"
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className={`w-10 h-10 rounded-xl ${colorClasses[color]} flex items-center justify-center mb-3`}>
            <Icon className="w-5 h-5" />
          </div>
          <p className="text-sm text-muted-foreground mb-1">{title}</p>
          <p className="text-2xl font-bold">{value}</p>
          {subtitle && (
            <p className="text-xs text-muted-foreground mt-1">{subtitle}</p>
          )}
        </div>

        {progress !== undefined && (
          <div className="relative w-16 h-16">
            <svg className="w-16 h-16 progress-ring" viewBox="0 0 80 80">
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
              <span className="text-sm font-semibold">{progress}%</span>
            </div>
          </div>
        )}
      </div>
    </motion.div>
  );
}
