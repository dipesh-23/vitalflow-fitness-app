import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { StatsCard } from "@/components/dashboard/StatsCard";
import { QuickActions } from "@/components/dashboard/QuickActions";
import { ActivityLog } from "@/components/dashboard/ActivityLog";
import { MealSummary } from "@/components/dashboard/MealSummary";
import { HealthStatus } from "@/components/dashboard/HealthStatus";
import { useAuth } from "@/lib/auth-context";
import { supabase } from "@/integrations/supabase/client";
import { Flame, Activity, Target, TrendingUp } from "lucide-react";
import { format } from "date-fns";

export default function Dashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [profile, setProfile] = useState<any>(null);
  const [activities, setActivities] = useState<any[]>([]);
  const [meals, setMeals] = useState<any[]>([]);
  const [healthCheckin, setHealthCheckin] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const today = format(new Date(), "yyyy-MM-dd");

  useEffect(() => {
    if (user) {
      loadDashboardData();
    }
  }, [user]);

  const loadDashboardData = async () => {
    if (!user) return;

    try {
      // Load profile
      const { data: profileData } = await supabase
        .from("profiles")
        .select("*")
        .eq("user_id", user.id)
        .single();
      setProfile(profileData);

      // Load today's activities
      const { data: activityData } = await supabase
        .from("activities")
        .select("*")
        .eq("user_id", user.id)
        .eq("activity_date", today)
        .order("created_at", { ascending: false });
      setActivities(activityData || []);

      // Load today's meals
      const { data: mealData } = await supabase
        .from("meals")
        .select("*")
        .eq("user_id", user.id)
        .eq("meal_date", today)
        .order("created_at", { ascending: false });
      setMeals(mealData || []);

      // Load today's health checkin
      const { data: checkinData } = await supabase
        .from("health_checkins")
        .select("*")
        .eq("user_id", user.id)
        .eq("checkin_date", today)
        .single();
      setHealthCheckin(checkinData);

    } catch (error) {
      console.error("Error loading dashboard data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleQuickAction = (action: string) => {
    switch (action) {
      case "activity":
        navigate("/fitness");
        break;
      case "meal":
        navigate("/nutrition");
        break;
      case "checkin":
        navigate("/health");
        break;
      case "chat":
        // TODO: Open AI chat
        break;
    }
  };

  const totalCaloriesBurned = activities.reduce((sum, a) => sum + (a.calories_burned || 0), 0);
  const totalCaloriesConsumed = meals.reduce((sum, m) => sum + (m.calories || 0), 0);
  const activityMinutes = activities.reduce((sum, a) => sum + (a.duration_minutes || 0), 0);
  
  // Calculate daily calorie goal based on profile
  const calculateDailyCalorieGoal = () => {
    if (!profile?.weight_kg || !profile?.height_cm || !profile?.age) return 2000;
    
    // Mifflin-St Jeor Equation
    let bmr = 10 * profile.weight_kg + 6.25 * profile.height_cm - 5 * profile.age;
    bmr += profile.gender === "male" ? 5 : -161;
    
    const activityMultipliers: Record<string, number> = {
      sedentary: 1.2,
      light: 1.375,
      moderate: 1.55,
      active: 1.725,
      very_active: 1.9,
    };
    
    const multiplier = activityMultipliers[profile.activity_level] || 1.55;
    let tdee = bmr * multiplier;
    
    // Adjust for goals
    if (profile.fitness_goal === "weight_loss") tdee -= 500;
    if (profile.fitness_goal === "muscle_gain") tdee += 300;
    
    return Math.round(tdee);
  };

  const dailyCalorieGoal = calculateDailyCalorieGoal();
  const calorieProgress = Math.min(Math.round((totalCaloriesConsumed / dailyCalorieGoal) * 100), 100);
  const activityGoal = 30; // 30 minutes daily
  const activityProgress = Math.min(Math.round((activityMinutes / activityGoal) * 100), 100);

  const greeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 18) return "Good afternoon";
    return "Good evening";
  };

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
      <div className="space-y-4 sm:space-y-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h1 className="text-xl sm:text-2xl font-bold mb-0.5 sm:mb-1">
            {greeting()}, {profile?.full_name?.split(" ")[0] || "there"}! 👋
          </h1>
          <p className="text-sm sm:text-base text-muted-foreground">
            {format(new Date(), "EEEE, MMMM d")}
          </p>
        </motion.div>

        {/* Quick Actions */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <QuickActions onAction={handleQuickAction} />
        </motion.section>

        {/* Stats Grid */}
        <section className="grid grid-cols-2 gap-2 sm:gap-4">
          <StatsCard
            title="Calories Burned"
            value={totalCaloriesBurned}
            subtitle="kcal today"
            icon={Flame}
            color="calories"
          />
          <StatsCard
            title="Activity Time"
            value={activityMinutes}
            subtitle={`of ${activityGoal} min goal`}
            icon={Activity}
            color="primary"
            progress={activityProgress}
          />
          <StatsCard
            title="Calories Eaten"
            value={totalCaloriesConsumed}
            subtitle={`of ${dailyCalorieGoal} kcal`}
            icon={Target}
            color="accent"
            progress={calorieProgress}
          />
          <StatsCard
            title="Net Calories"
            value={totalCaloriesConsumed - totalCaloriesBurned}
            subtitle="intake - burned"
            icon={TrendingUp}
            color="primary"
          />
        </section>

        {/* Health Check-in */}
        <section>
          <h2 className="text-base sm:text-lg font-semibold mb-2 sm:mb-3">Today's Health Status</h2>
          <HealthStatus 
            checkin={healthCheckin} 
            onCheckIn={() => navigate("/health")} 
          />
        </section>

        {/* Activity Log */}
        <section>
          <h2 className="text-base sm:text-lg font-semibold mb-2 sm:mb-3">Today's Activities</h2>
          <div className="bg-card rounded-xl sm:rounded-2xl border p-3 sm:p-4">
            <ActivityLog activities={activities} />
          </div>
        </section>

        {/* Meal Summary */}
        <section>
          <h2 className="text-base sm:text-lg font-semibold mb-2 sm:mb-3">Nutrition Overview</h2>
          <div className="bg-card rounded-xl sm:rounded-2xl border p-3 sm:p-4">
            <MealSummary meals={meals} dailyCalorieGoal={dailyCalorieGoal} />
          </div>
        </section>
      </div>
    </DashboardLayout>
  );
}
