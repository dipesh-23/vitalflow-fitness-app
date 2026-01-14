import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

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

  const [formData, setFormData] = useState({
    meal_type: "breakfast",
    food_name: "",
    calories: "",
    protein_g: "",
    carbs_g: "",
    fats_g: "",
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setSubmitting(true);
    try {
      const { error } = await supabase.from("meals").insert({
        user_id: user.id,
        meal_type: formData.meal_type,
        food_name: formData.food_name,
        calories: parseInt(formData.calories) || 0,
        protein_g: parseFloat(formData.protein_g) || 0,
        carbs_g: parseFloat(formData.carbs_g) || 0,
        fats_g: parseFloat(formData.fats_g) || 0,
        meal_date: today,
      });

      if (error) throw error;

      toast({
        title: "Meal logged! 🍽️",
        description: `${formData.food_name} - ${formData.calories} calories`,
      });

      setFormData({
        meal_type: "breakfast",
        food_name: "",
        calories: "",
        protein_g: "",
        carbs_g: "",
        fats_g: "",
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
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>Log Meal</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4 mt-4">
                <div>
                  <Label>Meal Type</Label>
                  <div className="grid grid-cols-4 gap-2 mt-2">
                    {mealTypes.map((type) => (
                      <button
                        key={type.value}
                        type="button"
                        onClick={() => setFormData({ ...formData, meal_type: type.value })}
                        className={`p-3 rounded-xl border-2 transition-all flex flex-col items-center gap-1 ${
                          formData.meal_type === type.value
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

                <div>
                  <Label htmlFor="food">Food Name</Label>
                  <Input
                    id="food"
                    placeholder="e.g., Grilled chicken salad"
                    value={formData.food_name}
                    onChange={(e) => setFormData({ ...formData, food_name: e.target.value })}
                    className="mt-2"
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="calories">Calories (kcal)</Label>
                    <Input
                      id="calories"
                      type="number"
                      placeholder="350"
                      value={formData.calories}
                      onChange={(e) => setFormData({ ...formData, calories: e.target.value })}
                      className="mt-2"
                    />
                  </div>
                  <div>
                    <Label htmlFor="protein">Protein (g)</Label>
                    <Input
                      id="protein"
                      type="number"
                      placeholder="25"
                      value={formData.protein_g}
                      onChange={(e) => setFormData({ ...formData, protein_g: e.target.value })}
                      className="mt-2"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="carbs">Carbs (g)</Label>
                    <Input
                      id="carbs"
                      type="number"
                      placeholder="30"
                      value={formData.carbs_g}
                      onChange={(e) => setFormData({ ...formData, carbs_g: e.target.value })}
                      className="mt-2"
                    />
                  </div>
                  <div>
                    <Label htmlFor="fats">Fats (g)</Label>
                    <Input
                      id="fats"
                      type="number"
                      placeholder="15"
                      value={formData.fats_g}
                      onChange={(e) => setFormData({ ...formData, fats_g: e.target.value })}
                      className="mt-2"
                    />
                  </div>
                </div>

                <Button
                  type="submit"
                  variant="hero"
                  className="w-full"
                  disabled={!formData.food_name || submitting}
                >
                  {submitting ? "Logging..." : "Log Meal"}
                </Button>
              </form>
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
