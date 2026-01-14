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
    <div className="grid grid-cols-4 gap-3">
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
            className="w-full h-auto flex-col gap-2 py-4 hover:bg-muted"
          >
            <div className={`w-12 h-12 rounded-xl ${action.color} flex items-center justify-center`}>
              <action.icon className="w-6 h-6 text-white" />
            </div>
            <span className="text-xs font-medium">{action.label}</span>
          </Button>
        </motion.div>
      ))}
    </div>
  );
}
