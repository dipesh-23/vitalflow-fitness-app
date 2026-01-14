import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/lib/auth-context";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Plus, Flame, Clock, X, Check } from "lucide-react";
import { format } from "date-fns";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const activityTypes = [
  { value: "walking", label: "Walking", emoji: "🚶", met: 3.5 },
  { value: "running", label: "Running", emoji: "🏃", met: 9.8 },
  { value: "cycling", label: "Cycling", emoji: "🚴", met: 7.5 },
  { value: "gym", label: "Gym Workout", emoji: "🏋️", met: 6.0 },
  { value: "yoga", label: "Yoga", emoji: "🧘", met: 3.0 },
  { value: "swimming", label: "Swimming", emoji: "🏊", met: 8.0 },
  { value: "hiit", label: "HIIT", emoji: "⚡", met: 12.0 },
  { value: "stretching", label: "Stretching", emoji: "🤸", met: 2.5 },
];

const intensityMultipliers = {
  low: 0.8,
  moderate: 1.0,
  high: 1.2,
};

export default function Fitness() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [activities, setActivities] = useState<any[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [profile, setProfile] = useState<any>(null);

  const [formData, setFormData] = useState({
    activity_type: "",
    duration_minutes: "",
    intensity: "moderate" as "low" | "moderate" | "high",
    notes: "",
  });

  const today = format(new Date(), "yyyy-MM-dd");

  useEffect(() => {
    if (user) {
      loadData();
    }
  }, [user]);

  const loadData = async () => {
    if (!user) return;

    try {
      const { data: profileData } = await supabase
        .from("profiles")
        .select("*")
        .eq("user_id", user.id)
        .single();
      setProfile(profileData);

      const { data: activityData } = await supabase
        .from("activities")
        .select("*")
        .eq("user_id", user.id)
        .eq("activity_date", today)
        .order("created_at", { ascending: false });
      setActivities(activityData || []);
    } catch (error) {
      console.error("Error loading data:", error);
    } finally {
      setLoading(false);
    }
  };

  const calculateCalories = (type: string, duration: number, intensity: keyof typeof intensityMultipliers) => {
    const activity = activityTypes.find((a) => a.value === type);
    if (!activity || !profile?.weight_kg) return 0;

    const met = activity.met * intensityMultipliers[intensity];
    const caloriesPerMinute = (met * 3.5 * profile.weight_kg) / 200;
    return Math.round(caloriesPerMinute * duration);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setSubmitting(true);
    try {
      const duration = parseInt(formData.duration_minutes);
      const calories = calculateCalories(formData.activity_type, duration, formData.intensity);

      const { error } = await supabase.from("activities").insert({
        user_id: user.id,
        activity_type: formData.activity_type,
        duration_minutes: duration,
        intensity: formData.intensity,
        calories_burned: calories,
        notes: formData.notes || null,
        activity_date: today,
      });

      if (error) throw error;

      toast({
        title: "Activity logged! 💪",
        description: `${formData.activity_type} - ${calories} calories burned`,
      });

      setFormData({
        activity_type: "",
        duration_minutes: "",
        intensity: "moderate",
        notes: "",
      });
      setIsDialogOpen(false);
      loadData();
    } catch (error) {
      toast({
        title: "Error logging activity",
        description: "Please try again.",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const deleteActivity = async (id: string) => {
    try {
      const { error } = await supabase.from("activities").delete().eq("id", id);
      if (error) throw error;
      setActivities(activities.filter((a) => a.id !== id));
      toast({ title: "Activity deleted" });
    } catch (error) {
      toast({ title: "Error deleting activity", variant: "destructive" });
    }
  };

  const totalCalories = activities.reduce((sum, a) => sum + (a.calories_burned || 0), 0);
  const totalMinutes = activities.reduce((sum, a) => sum + (a.duration_minutes || 0), 0);

  const selectedActivity = activityTypes.find((a) => a.value === formData.activity_type);
  const previewCalories = formData.activity_type && formData.duration_minutes
    ? calculateCalories(formData.activity_type, parseInt(formData.duration_minutes), formData.intensity)
    : 0;

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Fitness Tracking</h1>
            <p className="text-muted-foreground">{format(new Date(), "EEEE, MMMM d")}</p>
          </div>
          
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="hero" className="gap-2">
                <Plus className="w-4 h-4" />
                Log Activity
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>Log Activity</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4 mt-4">
                <div>
                  <Label>Activity Type</Label>
                  <div className="grid grid-cols-4 gap-2 mt-2">
                    {activityTypes.map((activity) => (
                      <button
                        key={activity.value}
                        type="button"
                        onClick={() => setFormData({ ...formData, activity_type: activity.value })}
                        className={`p-3 rounded-xl border-2 transition-all flex flex-col items-center gap-1 ${
                          formData.activity_type === activity.value
                            ? "border-primary bg-primary/10"
                            : "border-border hover:border-primary/50"
                        }`}
                      >
                        <span className="text-xl">{activity.emoji}</span>
                        <span className="text-xs">{activity.label}</span>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="duration">Duration (min)</Label>
                    <Input
                      id="duration"
                      type="number"
                      placeholder="30"
                      value={formData.duration_minutes}
                      onChange={(e) => setFormData({ ...formData, duration_minutes: e.target.value })}
                      className="mt-2"
                      required
                    />
                  </div>

                  <div>
                    <Label>Intensity</Label>
                    <Select
                      value={formData.intensity}
                      onValueChange={(v) => setFormData({ ...formData, intensity: v as any })}
                    >
                      <SelectTrigger className="mt-2">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="low">Low</SelectItem>
                        <SelectItem value="moderate">Moderate</SelectItem>
                        <SelectItem value="high">High</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {previewCalories > 0 && (
                  <div className="p-4 rounded-xl bg-primary/10 text-center">
                    <p className="text-sm text-muted-foreground">Estimated calories</p>
                    <p className="text-3xl font-bold text-primary">{previewCalories} kcal</p>
                  </div>
                )}

                <Button
                  type="submit"
                  variant="hero"
                  className="w-full"
                  disabled={!formData.activity_type || !formData.duration_minutes || submitting}
                >
                  {submitting ? "Logging..." : "Log Activity"}
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {/* Summary */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="grid grid-cols-2 gap-4"
        >
          <div className="p-6 rounded-2xl bg-gradient-to-br from-primary/20 to-primary/5 border">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center">
                <Flame className="w-5 h-5 text-primary" />
              </div>
              <span className="text-sm text-muted-foreground">Calories Burned</span>
            </div>
            <p className="text-3xl font-bold">{totalCalories}</p>
            <p className="text-sm text-muted-foreground">kcal today</p>
          </div>

          <div className="p-6 rounded-2xl bg-gradient-to-br from-accent/20 to-accent/5 border">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-xl bg-accent/20 flex items-center justify-center">
                <Clock className="w-5 h-5 text-accent" />
              </div>
              <span className="text-sm text-muted-foreground">Active Time</span>
            </div>
            <p className="text-3xl font-bold">{totalMinutes}</p>
            <p className="text-sm text-muted-foreground">minutes today</p>
          </div>
        </motion.div>

        {/* Activity List */}
        <section>
          <h2 className="text-lg font-semibold mb-3">Today's Activities</h2>
          
          {activities.length === 0 ? (
            <div className="text-center py-12 bg-card rounded-2xl border">
              <div className="w-16 h-16 rounded-full bg-muted mx-auto mb-4 flex items-center justify-center">
                <Plus className="w-8 h-8 text-muted-foreground" />
              </div>
              <p className="font-medium mb-1">No activities yet</p>
              <p className="text-sm text-muted-foreground mb-4">Start by logging your first workout!</p>
              <Button variant="hero" onClick={() => setIsDialogOpen(true)}>
                Log Activity
              </Button>
            </div>
          ) : (
            <div className="space-y-3">
              {activities.map((activity, i) => {
                const activityInfo = activityTypes.find((a) => a.value === activity.activity_type);
                return (
                  <motion.div
                    key={activity.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.05 }}
                    className="flex items-center gap-4 p-4 rounded-xl bg-card border group"
                  >
                    <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-2xl">
                      {activityInfo?.emoji || "🏃"}
                    </div>
                    
                    <div className="flex-1">
                      <p className="font-medium capitalize">{activity.activity_type}</p>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {activity.duration_minutes} min
                        </span>
                        <span className="flex items-center gap-1">
                          <Flame className="w-3 h-3 text-calories" />
                          {activity.calories_burned} cal
                        </span>
                        <span className="capitalize text-xs px-2 py-0.5 rounded-full bg-muted">
                          {activity.intensity}
                        </span>
                      </div>
                    </div>

                    <button
                      onClick={() => deleteActivity(activity.id)}
                      className="opacity-0 group-hover:opacity-100 p-2 rounded-lg hover:bg-destructive/10 text-destructive transition-all"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </motion.div>
                );
              })}
            </div>
          )}
        </section>
      </div>
    </DashboardLayout>
  );
}
