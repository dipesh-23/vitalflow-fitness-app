import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/lib/auth-context";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Plus, X, Utensils } from "lucide-react";
import { format } from "date-fns";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { FoodSelector } from "@/components/nutrition/FoodSelector";

const mealTypes = [
  { value: "breakfast", label: "Breakfast", emoji: "🌅" },
  { value: "lunch", label: "Lunch", emoji: "☀️" },
  { value: "snack", label: "Snack", emoji: "🍎" },
  { value: "dinner", label: "Dinner", emoji: "🌙" },
];

export default function Nutrition() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [meals, setMeals] = useState<any[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [selectedMealType, setSelectedMealType] = useState("breakfast");

  const today = format(new Date(), "yyyy-MM-dd");

  useEffect(() => {
    if (user) {
      loadData();
    }
  }, [user]);

  const loadData = async () => {
    if (!user) return;

    try {
      const { data: mealData } = await supabase
        .from("meals")
        .select("*")
        .eq("user_id", user.id)
        .eq("meal_date", today)
        .order("created_at", { ascending: false });
      setMeals(mealData || []);
    } catch (error) {
      console.error("Error loading data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleFoodSelect = async (food: {
    food_name: string;
    calories: number;
    protein_g: number;
    carbs_g: number;
    fats_g: number;
    fiber_g?: number;
  }) => {
    if (!user) return;

    setSubmitting(true);
    try {
      const { error } = await supabase.from("meals").insert({
        user_id: user.id,
        meal_type: selectedMealType,
        food_name: food.food_name,
        calories: food.calories,
        protein_g: food.protein_g,
        carbs_g: food.carbs_g,
        fats_g: food.fats_g,
        fiber_g: food.fiber_g || 0,
        meal_date: today,
      });

      if (error) throw error;

      toast({
        title: "Meal logged! 🍽️",
        description: `${food.food_name} - ${food.calories} calories`,
      });

      setIsDialogOpen(false);
      loadData();
    } catch (error) {
      toast({
        title: "Error logging meal",
        description: "Please try again.",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const deleteMeal = async (id: string) => {
    try {
      const { error } = await supabase.from("meals").delete().eq("id", id);
      if (error) throw error;
      setMeals(meals.filter((m) => m.id !== id));
      toast({ title: "Meal deleted" });
    } catch (error) {
      toast({ title: "Error deleting meal", variant: "destructive" });
    }
  };

  const totalCalories = meals.reduce((sum, m) => sum + (m.calories || 0), 0);
  const totalProtein = meals.reduce((sum, m) => sum + Number(m.protein_g || 0), 0);
  const totalCarbs = meals.reduce((sum, m) => sum + Number(m.carbs_g || 0), 0);
  const totalFats = meals.reduce((sum, m) => sum + Number(m.fats_g || 0), 0);

  // Group meals by type
  const mealsByType = mealTypes.map((type) => ({
    ...type,
    meals: meals.filter((m) => m.meal_type === type.value),
    totalCalories: meals
      .filter((m) => m.meal_type === type.value)
      .reduce((sum, m) => sum + (m.calories || 0), 0),
  }));

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
            <h1 className="text-2xl font-bold">Nutrition</h1>
            <p className="text-muted-foreground">{format(new Date(), "EEEE, MMMM d")}</p>
          </div>
          
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="hero" className="gap-2">
                <Plus className="w-4 h-4" />
                Log Meal
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Log Meal</DialogTitle>
              </DialogHeader>
              
              {/* Meal Type Selection */}
              <div className="mt-4">
                <p className="text-sm font-medium text-muted-foreground mb-2">Select meal type</p>
                <div className="grid grid-cols-4 gap-2">
                  {mealTypes.map((type) => (
                    <button
                      key={type.value}
                      type="button"
                      onClick={() => setSelectedMealType(type.value)}
                      className={`p-3 rounded-xl border-2 transition-all flex flex-col items-center gap-1 ${
                        selectedMealType === type.value
                          ? "border-primary bg-primary/10"
                          : "border-border hover:border-primary/50"
                      }`}
                    >
                      <span className="text-xl">{type.emoji}</span>
                      <span className="text-xs">{type.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Food Selector */}
              <div className="mt-4">
                <FoodSelector
                  onSelect={handleFoodSelect}
                  onClose={() => setIsDialogOpen(false)}
                />
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Summary */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-6 rounded-2xl bg-gradient-to-br from-accent/20 to-calories/10 border"
        >
          <h3 className="text-sm font-medium text-muted-foreground mb-4">Daily Totals</h3>
          <div className="grid grid-cols-4 gap-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-calories">{totalCalories}</p>
              <p className="text-xs text-muted-foreground">Calories</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-protein">{Math.round(totalProtein)}g</p>
              <p className="text-xs text-muted-foreground">Protein</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-carbs">{Math.round(totalCarbs)}g</p>
              <p className="text-xs text-muted-foreground">Carbs</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-fats">{Math.round(totalFats)}g</p>
              <p className="text-xs text-muted-foreground">Fats</p>
            </div>
          </div>
        </motion.div>

        {/* Meals by Type */}
        <section className="space-y-4">
          {mealsByType.map((mealType, i) => (
            <motion.div
              key={mealType.value}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className="bg-card rounded-2xl border overflow-hidden"
            >
              <div className="flex items-center justify-between p-4 border-b">
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{mealType.emoji}</span>
                  <span className="font-medium">{mealType.label}</span>
                </div>
                <span className="text-sm text-muted-foreground">
                  {mealType.totalCalories} cal
                </span>
              </div>

              <div className="p-4">
                {mealType.meals.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-2">
                    No {mealType.label.toLowerCase()} logged
                  </p>
                ) : (
                  <div className="space-y-2">
                    {mealType.meals.map((meal) => (
                      <div
                        key={meal.id}
                        className="flex items-center justify-between p-3 rounded-lg bg-muted/30 group"
                      >
                        <div>
                          <p className="font-medium">{meal.food_name}</p>
                          <p className="text-xs text-muted-foreground">
                            P: {meal.protein_g}g • C: {meal.carbs_g}g • F: {meal.fats_g}g
                          </p>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="text-sm font-medium">{meal.calories} cal</span>
                          <button
                            onClick={() => deleteMeal(meal.id)}
                            className="opacity-0 group-hover:opacity-100 p-1.5 rounded-lg hover:bg-destructive/10 text-destructive transition-all"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </motion.div>
          ))}
        </section>
      </div>
    </DashboardLayout>
  );
}
