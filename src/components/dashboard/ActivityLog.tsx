import { motion } from "framer-motion";
import { Activity, Flame, Clock } from "lucide-react";

interface ActivityItem {
  id: string;
  activity_type: string;
  duration_minutes: number;
  calories_burned: number;
  activity_date: string;
}

interface ActivityLogProps {
  activities: ActivityItem[];
}

const activityEmojis: Record<string, string> = {
  walking: "🚶",
  running: "🏃",
  cycling: "🚴",
  gym: "🏋️",
  yoga: "🧘",
  swimming: "🏊",
  hiit: "⚡",
  stretching: "🤸",
};

export function ActivityLog({ activities }: ActivityLogProps) {
  if (activities.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        <Activity className="w-12 h-12 mx-auto mb-3 opacity-50" />
        <p>No activities logged today</p>
        <p className="text-sm">Start by logging a workout!</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {activities.map((activity, i) => (
        <motion.div
          key={activity.id}
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: i * 0.1 }}
          className="flex items-center gap-4 p-3 rounded-xl bg-muted/50 hover:bg-muted transition-colors"
        >
          <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-2xl">
            {activityEmojis[activity.activity_type.toLowerCase()] || "🏃"}
          </div>
          
          <div className="flex-1">
            <p className="font-medium capitalize">{activity.activity_type}</p>
            <div className="flex items-center gap-3 text-sm text-muted-foreground">
              <span className="flex items-center gap-1">
                <Clock className="w-3 h-3" />
                {activity.duration_minutes} min
              </span>
              <span className="flex items-center gap-1">
                <Flame className="w-3 h-3 text-calories" />
                {activity.calories_burned} cal
              </span>
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  );
}
