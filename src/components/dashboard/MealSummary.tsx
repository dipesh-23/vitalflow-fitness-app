import { motion } from "framer-motion";

interface Meal {
  id: string;
  meal_type: string;
  food_name: string;
  calories: number;
  protein_g: number;
  carbs_g: number;
  fats_g: number;
}

interface MealSummaryProps {
  meals: Meal[];
  dailyCalorieGoal: number;
}

const mealEmojis: Record<string, string> = {
  breakfast: "🌅",
  lunch: "☀️",
  snack: "🍎",
  dinner: "🌙",
};

export function MealSummary({ meals, dailyCalorieGoal }: MealSummaryProps) {
  const totalCalories = meals.reduce((sum, m) => sum + (m.calories || 0), 0);
  const totalProtein = meals.reduce((sum, m) => sum + Number(m.protein_g || 0), 0);
  const totalCarbs = meals.reduce((sum, m) => sum + Number(m.carbs_g || 0), 0);
  const totalFats = meals.reduce((sum, m) => sum + Number(m.fats_g || 0), 0);
  
  const calorieProgress = Math.min((totalCalories / dailyCalorieGoal) * 100, 100);

  return (
    <div className="space-y-4">
      {/* Calorie progress */}
      <div className="p-4 rounded-xl bg-gradient-to-r from-calories/10 to-accent/10">
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm font-medium">Daily Calories</span>
          <span className="text-sm text-muted-foreground">
            {totalCalories} / {dailyCalorieGoal} kcal
          </span>
        </div>
        <div className="h-3 bg-muted rounded-full overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${calorieProgress}%` }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="h-full bg-gradient-to-r from-calories to-accent rounded-full"
          />
        </div>
      </div>

      {/* Macros */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: "Protein", value: totalProtein, color: "protein", unit: "g" },
          { label: "Carbs", value: totalCarbs, color: "carbs", unit: "g" },
          { label: "Fats", value: totalFats, color: "fats", unit: "g" },
        ].map((macro) => (
          <div
            key={macro.label}
            className="p-3 rounded-xl bg-muted/50 text-center"
          >
            <p className="text-xs text-muted-foreground mb-1">{macro.label}</p>
            <p className={`text-lg font-bold text-${macro.color}`}>
              {Math.round(macro.value)}{macro.unit}
            </p>
          </div>
        ))}
      </div>

      {/* Recent meals */}
      <div className="space-y-2">
        <p className="text-sm font-medium text-muted-foreground">Today's Meals</p>
        {meals.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-4">
            No meals logged yet
          </p>
        ) : (
          <div className="space-y-2">
            {meals.slice(0, 4).map((meal, i) => (
              <motion.div
                key={meal.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className="flex items-center justify-between p-3 rounded-lg bg-muted/30"
              >
                <div className="flex items-center gap-3">
                  <span className="text-xl">{mealEmojis[meal.meal_type] || "🍽️"}</span>
                  <div>
                    <p className="text-sm font-medium">{meal.food_name}</p>
                    <p className="text-xs text-muted-foreground capitalize">{meal.meal_type}</p>
                  </div>
                </div>
                <span className="text-sm font-medium">{meal.calories} cal</span>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
