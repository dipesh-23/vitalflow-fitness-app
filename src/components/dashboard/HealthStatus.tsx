import { motion } from "framer-motion";
import { Battery, Moon, Brain, AlertCircle } from "lucide-react";

interface HealthCheckin {
  id: string;
  energy_level: number;
  sleep_quality: number;
  stress_level: number;
  symptoms: string[];
  checkin_date: string;
}

interface HealthStatusProps {
  checkin: HealthCheckin | null;
  onCheckIn: () => void;
}

const levelLabels = ["", "Very Low", "Low", "Moderate", "Good", "Excellent"];
const stressLabels = ["", "Very Low", "Low", "Moderate", "High", "Very High"];

export function HealthStatus({ checkin, onCheckIn }: HealthStatusProps) {
  if (!checkin) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="p-6 rounded-xl border-2 border-dashed border-primary/30 bg-primary/5 text-center"
      >
        <AlertCircle className="w-12 h-12 mx-auto mb-3 text-primary/60" />
        <p className="font-medium mb-1">No check-in today</p>
        <p className="text-sm text-muted-foreground mb-4">
          How are you feeling? Log your daily health status.
        </p>
        <button
          onClick={onCheckIn}
          className="px-4 py-2 rounded-lg bg-primary text-primary-foreground font-medium hover:bg-primary/90 transition-colors"
        >
          Check In Now
        </button>
      </motion.div>
    );
  }

  const metrics = [
    {
      icon: Battery,
      label: "Energy",
      value: checkin.energy_level,
      displayValue: levelLabels[checkin.energy_level],
      color: checkin.energy_level >= 4 ? "text-success" : checkin.energy_level >= 3 ? "text-warning" : "text-destructive",
    },
    {
      icon: Moon,
      label: "Sleep",
      value: checkin.sleep_quality,
      displayValue: levelLabels[checkin.sleep_quality],
      color: checkin.sleep_quality >= 4 ? "text-success" : checkin.sleep_quality >= 3 ? "text-warning" : "text-destructive",
    },
    {
      icon: Brain,
      label: "Stress",
      value: checkin.stress_level,
      displayValue: stressLabels[checkin.stress_level],
      color: checkin.stress_level <= 2 ? "text-success" : checkin.stress_level <= 3 ? "text-warning" : "text-destructive",
    },
  ];

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-3 gap-3">
        {metrics.map((metric, i) => (
          <motion.div
            key={metric.label}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="p-3 rounded-xl bg-muted/50 text-center"
          >
            <metric.icon className={`w-5 h-5 mx-auto mb-2 ${metric.color}`} />
            <p className="text-xs text-muted-foreground mb-1">{metric.label}</p>
            <p className={`text-sm font-medium ${metric.color}`}>
              {metric.displayValue}
            </p>
          </motion.div>
        ))}
      </div>

      {checkin.symptoms && checkin.symptoms.length > 0 && (
        <div className="p-3 rounded-xl bg-destructive/10 border border-destructive/20">
          <p className="text-sm font-medium text-destructive mb-2">Reported Symptoms</p>
          <div className="flex flex-wrap gap-2">
            {checkin.symptoms.map((symptom, i) => (
              <span
                key={i}
                className="px-2 py-1 rounded-full bg-destructive/20 text-destructive text-xs"
              >
                {symptom}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
