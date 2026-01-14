import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, Plus, Sparkles, ChevronRight, Scale, AlertCircle } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import {
  FoodItem,
  foodDatabase,
  foodCategories,
  searchFoods,
  calculateNutrition,
} from "@/lib/food-database";

interface FoodSelectorProps {
  onSelect: (food: {
    food_name: string;
    calories: number;
    protein_g: number;
    carbs_g: number;
    fats_g: number;
    fiber_g?: number;
  }) => void;
  onClose: () => void;
}

export function FoodSelector({ onSelect, onClose }: FoodSelectorProps) {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("database");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [selectedFood, setSelectedFood] = useState<FoodItem | null>(null);
  const [weight, setWeight] = useState("");
  
  // Custom food state
  const [customFood, setCustomFood] = useState("");
  const [customWeight, setCustomWeight] = useState("100");
  const [analyzing, setAnalyzing] = useState(false);
  const [aiResult, setAiResult] = useState<{
    calories: number;
    protein_g: number;
    carbs_g: number;
    fats_g: number;
    fiber_g: number;
    confidence: string;
    notes?: string;
  } | null>(null);

  const filteredFoods = searchFoods(searchQuery, selectedCategory);

  const handleFoodSelect = (food: FoodItem) => {
    setSelectedFood(food);
    setWeight(String(food.serving_size || 100));
  };

  const handleAddFromDatabase = () => {
    if (!selectedFood || !weight) return;
    
    const nutrition = calculateNutrition(selectedFood, parseInt(weight));
    onSelect({
      food_name: `${selectedFood.name} (${weight}g)`,
      ...nutrition,
    });
  };

  const handleAnalyzeFood = async () => {
    if (!customFood.trim()) {
      toast({
        title: "Enter food name",
        description: "Please enter a food item to analyze",
        variant: "destructive",
      });
      return;
    }

    setAnalyzing(true);
    setAiResult(null);

    try {
      const { data, error } = await supabase.functions.invoke("analyze-food", {
        body: { foodName: customFood, weightGrams: parseInt(customWeight) || 100 },
      });

      if (error) throw error;

      if (data.success) {
        setAiResult(data.data);
        toast({
          title: "Analysis complete! ✨",
          description: `Found nutrition data for ${customFood}`,
        });
      } else {
        throw new Error(data.error || "Failed to analyze food");
      }
    } catch (error: any) {
      console.error("Error analyzing food:", error);
      toast({
        title: "Analysis failed",
        description: error.message || "Please try again or enter values manually",
        variant: "destructive",
      });
    } finally {
      setAnalyzing(false);
    }
  };

  const handleAddCustomFood = () => {
    if (!aiResult) return;
    
    onSelect({
      food_name: `${customFood} (${customWeight}g)`,
      calories: aiResult.calories,
      protein_g: aiResult.protein_g,
      carbs_g: aiResult.carbs_g,
      fats_g: aiResult.fats_g,
      fiber_g: aiResult.fiber_g,
    });
  };

  return (
    <div className="space-y-4">
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="database">Food Database</TabsTrigger>
          <TabsTrigger value="custom" className="gap-2">
            <Sparkles className="w-4 h-4" />
            AI Analysis
          </TabsTrigger>
        </TabsList>

        <TabsContent value="database" className="space-y-4 mt-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search foods..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* Categories */}
          <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
            {foodCategories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1.5 rounded-full text-sm whitespace-nowrap transition-colors ${
                  selectedCategory === cat
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted hover:bg-muted/80"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Food List or Selected Food */}
          <AnimatePresence mode="wait">
            {selectedFood ? (
              <motion.div
                key="selected"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-4"
              >
                <div className="p-4 rounded-xl bg-primary/5 border border-primary/20">
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <p className="font-medium">{selectedFood.name}</p>
                      <Badge variant="secondary" className="mt-1">{selectedFood.category}</Badge>
                    </div>
                    <button
                      onClick={() => setSelectedFood(null)}
                      className="text-sm text-muted-foreground hover:text-foreground"
                    >
                      Change
                    </button>
                  </div>

                  <div className="space-y-3">
                    <div>
                      <Label htmlFor="weight" className="flex items-center gap-2">
                        <Scale className="w-4 h-4" />
                        Weight (grams)
                      </Label>
                      <Input
                        id="weight"
                        type="number"
                        value={weight}
                        onChange={(e) => setWeight(e.target.value)}
                        className="mt-2"
                        placeholder="100"
                      />
                      <p className="text-xs text-muted-foreground mt-1">
                        Typical serving: {selectedFood.serving_size || 100}g
                      </p>
                    </div>

                    {weight && (
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="grid grid-cols-4 gap-2 p-3 rounded-lg bg-background"
                      >
                        {(() => {
                          const nutrition = calculateNutrition(selectedFood, parseInt(weight) || 0);
                          return (
                            <>
                              <div className="text-center">
                                <p className="text-lg font-bold text-calories">{nutrition.calories}</p>
                                <p className="text-xs text-muted-foreground">kcal</p>
                              </div>
                              <div className="text-center">
                                <p className="text-lg font-bold text-protein">{nutrition.protein_g}g</p>
                                <p className="text-xs text-muted-foreground">Protein</p>
                              </div>
                              <div className="text-center">
                                <p className="text-lg font-bold text-carbs">{nutrition.carbs_g}g</p>
                                <p className="text-xs text-muted-foreground">Carbs</p>
                              </div>
                              <div className="text-center">
                                <p className="text-lg font-bold text-fats">{nutrition.fats_g}g</p>
                                <p className="text-xs text-muted-foreground">Fats</p>
                              </div>
                            </>
                          );
                        })()}
                      </motion.div>
                    )}
                  </div>
                </div>

                <Button
                  variant="hero"
                  className="w-full"
                  onClick={handleAddFromDatabase}
                  disabled={!weight}
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add to Meal
                </Button>
              </motion.div>
            ) : (
              <motion.div
                key="list"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="max-h-[300px] overflow-y-auto space-y-1"
              >
                {filteredFoods.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <p>No foods found</p>
                    <p className="text-sm mt-1">Try the AI Analysis tab for custom foods</p>
                  </div>
                ) : (
                  filteredFoods.map((food) => (
                    <button
                      key={food.id}
                      onClick={() => handleFoodSelect(food)}
                      className="w-full flex items-center justify-between p-3 rounded-lg hover:bg-muted/50 transition-colors text-left group"
                    >
                      <div>
                        <p className="font-medium">{food.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {food.calories} cal per 100g • P: {food.protein_g}g
                        </p>
                      </div>
                      <ChevronRight className="w-4 h-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                    </button>
                  ))
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </TabsContent>

        <TabsContent value="custom" className="space-y-4 mt-4">
          <div className="p-4 rounded-xl bg-gradient-to-br from-primary/5 to-accent/5 border">
            <div className="flex items-start gap-3 mb-4">
              <div className="p-2 rounded-lg bg-primary/10">
                <Sparkles className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="font-medium">AI-Powered Analysis</p>
                <p className="text-sm text-muted-foreground">
                  Enter any food and our AI will estimate its nutritional content
                </p>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <Label htmlFor="customFood">Food Name</Label>
                <Input
                  id="customFood"
                  placeholder="e.g., Homemade pasta with cheese sauce"
                  value={customFood}
                  onChange={(e) => setCustomFood(e.target.value)}
                  className="mt-2"
                />
              </div>

              <div>
                <Label htmlFor="customWeight">Weight (grams)</Label>
                <Input
                  id="customWeight"
                  type="number"
                  placeholder="100"
                  value={customWeight}
                  onChange={(e) => setCustomWeight(e.target.value)}
                  className="mt-2"
                />
              </div>

              <Button
                onClick={handleAnalyzeFood}
                disabled={analyzing || !customFood.trim()}
                className="w-full"
                variant={aiResult ? "secondary" : "hero"}
              >
                {analyzing ? (
                  <>
                    <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin mr-2" />
                    Analyzing...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 mr-2" />
                    {aiResult ? "Re-analyze" : "Analyze with AI"}
                  </>
                )}
              </Button>
            </div>
          </div>

          {/* AI Result */}
          <AnimatePresence>
            {aiResult && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-4"
              >
                <div className="p-4 rounded-xl bg-card border">
                  <div className="flex items-center justify-between mb-3">
                    <p className="font-medium">{customFood}</p>
                    <Badge 
                      variant={aiResult.confidence === "high" ? "default" : "secondary"}
                      className={aiResult.confidence === "low" ? "bg-yellow-500/10 text-yellow-600" : ""}
                    >
                      {aiResult.confidence} confidence
                    </Badge>
                  </div>

                  <div className="grid grid-cols-4 gap-2 p-3 rounded-lg bg-muted/30">
                    <div className="text-center">
                      <p className="text-lg font-bold text-calories">{aiResult.calories}</p>
                      <p className="text-xs text-muted-foreground">kcal</p>
                    </div>
                    <div className="text-center">
                      <p className="text-lg font-bold text-protein">{aiResult.protein_g}g</p>
                      <p className="text-xs text-muted-foreground">Protein</p>
                    </div>
                    <div className="text-center">
                      <p className="text-lg font-bold text-carbs">{aiResult.carbs_g}g</p>
                      <p className="text-xs text-muted-foreground">Carbs</p>
                    </div>
                    <div className="text-center">
                      <p className="text-lg font-bold text-fats">{aiResult.fats_g}g</p>
                      <p className="text-xs text-muted-foreground">Fats</p>
                    </div>
                  </div>

                  {aiResult.notes && (
                    <p className="text-sm text-muted-foreground mt-3 flex items-start gap-2">
                      <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                      {aiResult.notes}
                    </p>
                  )}
                </div>

                <Button
                  variant="hero"
                  className="w-full"
                  onClick={handleAddCustomFood}
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add to Meal
                </Button>
              </motion.div>
            )}
          </AnimatePresence>
        </TabsContent>
      </Tabs>
    </div>
  );
}
