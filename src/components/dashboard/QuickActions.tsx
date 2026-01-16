import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Activity, Utensils, Heart, MessageCircle } from "lucide-react";

interface QuickActionsProps {
  onAction: (action: string) => void;
}

const actions = [
  { id: "activity", label: "Log Workout", icon: Activity, color: "bg-primary" },
  { id: "meal", label: "Log Meal", icon: Utensils, color: "bg-accent" },
  { id: "checkin", label: "Health Check", icon: Heart, color: "bg-sleep" },
  { id: "chat", label: "AI Guide", icon: MessageCircle, color: "bg-info" },
];

export function QuickActions({ onAction }: QuickActionsProps) {
  return (
    <div className="grid grid-cols-4 gap-2 sm:gap-3">
      {actions.map((action, i) => (
        <motion.div
          key={action.id}
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: i * 0.05 }}
        >
          <Button
            variant="ghost"
            onClick={() => onAction(action.id)}
            className="w-full h-auto flex-col gap-1 sm:gap-2 py-2 sm:py-4 hover:bg-muted px-1 sm:px-2"
          >
            <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-lg sm:rounded-xl ${action.color} flex items-center justify-center`}>
              <action.icon className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
            </div>
            <span className="text-[10px] sm:text-xs font-medium text-center leading-tight">{action.label}</span>
          </Button>
        </motion.div>
      ))}
    </div>
  );
}
