import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/lib/auth-context";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { 
  User, 
  Scale, 
  Target, 
  Utensils, 
  ArrowRight, 
  ArrowLeft,
  Heart,
  Loader2
} from "lucide-react";

const activityLevels = [
  { value: "sedentary", label: "Sedentary", desc: "Little or no exercise" },
  { value: "light", label: "Light", desc: "1-3 days/week" },
  { value: "moderate", label: "Moderate", desc: "3-5 days/week" },
  { value: "active", label: "Active", desc: "6-7 days/week" },
  { value: "very_active", label: "Very Active", desc: "Intense daily" },
];

const fitnessGoals = [
  { value: "weight_loss", label: "Lose Weight", emoji: "🔥" },
  { value: "maintenance", label: "Stay Healthy", emoji: "💪" },
  { value: "muscle_gain", label: "Build Muscle", emoji: "🏋️" },
];

const dietaryPrefs = [
  { value: "non_vegetarian", label: "Non-Vegetarian", emoji: "🍖" },
  { value: "vegetarian", label: "Vegetarian", emoji: "🥗" },
  { value: "vegan", label: "Vegan", emoji: "🌱" },
];

export default function Onboarding() {
  const [step, setStep] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    age: "",
    gender: "",
    height_cm: "",
    weight_kg: "",
    activity_level: "",
    fitness_goal: "",
    dietary_preference: "",
  });

  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const steps = [
    { title: "Basic Info", icon: User },
    { title: "Body Metrics", icon: Scale },
    { title: "Goals", icon: Target },
    { title: "Diet", icon: Utensils },
  ];

  const calculateBMI = () => {
    const height = parseFloat(formData.height_cm);
    const weight = parseFloat(formData.weight_kg);
    if (height && weight) {
      const heightM = height / 100;
      return (weight / (heightM * heightM)).toFixed(1);
    }
    return null;
  };

  const handleSubmit = async () => {
    if (!user) return;

    setIsLoading(true);
    try {
      const { error } = await supabase
        .from("profiles")
        .update({
          age: parseInt(formData.age) || null,
          gender: formData.gender || null,
          height_cm: parseFloat(formData.height_cm) || null,
          weight_kg: parseFloat(formData.weight_kg) || null,
          activity_level: formData.activity_level || null,
          fitness_goal: formData.fitness_goal || null,
          dietary_preference: formData.dietary_preference || null,
        })
        .eq("user_id", user.id);

      if (error) throw error;

      toast({
        title: "Profile complete! 🎉",
        description: "Your health journey begins now.",
      });
      navigate("/dashboard");
    } catch (error) {
      toast({
        title: "Error saving profile",
        description: "Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const canProceed = () => {
    switch (step) {
      case 0:
        return formData.age && formData.gender;
      case 1:
        return formData.height_cm && formData.weight_kg;
      case 2:
        return formData.activity_level && formData.fitness_goal;
      case 3:
        return formData.dietary_preference;
      default:
        return false;
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <div className="p-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-primary">
            <Heart className="w-5 h-5 text-primary-foreground" />
          </div>
          <span className="text-xl font-bold gradient-text">VitalFlow</span>
        </div>
        
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate("/dashboard")}
        >
          Skip for now
        </Button>
      </div>

      {/* Progress */}
      <div className="px-4 py-2">
        <div className="flex gap-2 mb-4">
          {steps.map((s, i) => (
            <div
              key={i}
              className={`h-1.5 flex-1 rounded-full transition-colors ${
                i <= step ? "bg-primary" : "bg-muted"
              }`}
            />
          ))}
        </div>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          {(() => {
            const StepIcon = steps[step].icon;
            return <StepIcon className="w-4 h-4" />;
          })()}
          <span>Step {step + 1} of {steps.length}: {steps[step].title}</span>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 flex items-center justify-center p-4">
        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
            className="w-full max-w-md"
          >
            {step === 0 && (
              <div className="space-y-6">
                <div className="text-center mb-8">
                  <h2 className="text-2xl font-bold mb-2">Let's get to know you</h2>
                  <p className="text-muted-foreground">This helps us personalize your experience</p>
                </div>

                <div className="space-y-4">
                  <div>
                    <Label htmlFor="age">Age</Label>
                    <Input
                      id="age"
                      type="number"
                      placeholder="25"
                      value={formData.age}
                      onChange={(e) => setFormData({ ...formData, age: e.target.value })}
                      className="h-12 mt-2"
                    />
                  </div>

                  <div>
                    <Label>Gender</Label>
                    <div className="grid grid-cols-3 gap-3 mt-2">
                      {["male", "female", "other"].map((g) => (
                        <button
                          key={g}
                          onClick={() => setFormData({ ...formData, gender: g })}
                          className={`p-4 rounded-xl border-2 transition-all ${
                            formData.gender === g
                              ? "border-primary bg-primary/10"
                              : "border-border hover:border-primary/50"
                          }`}
                        >
                          <span className="text-2xl mb-1 block">
                            {g === "male" ? "👨" : g === "female" ? "👩" : "🧑"}
                          </span>
                          <span className="text-sm capitalize">{g}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {step === 1 && (
              <div className="space-y-6">
                <div className="text-center mb-8">
                  <h2 className="text-2xl font-bold mb-2">Body measurements</h2>
                  <p className="text-muted-foreground">We'll calculate your BMI and daily needs</p>
                </div>

                <div className="space-y-4">
                  <div>
                    <Label htmlFor="height">Height (cm)</Label>
                    <Input
                      id="height"
                      type="number"
                      placeholder="170"
                      value={formData.height_cm}
                      onChange={(e) => setFormData({ ...formData, height_cm: e.target.value })}
                      className="h-12 mt-2"
                    />
                  </div>

                  <div>
                    <Label htmlFor="weight">Weight (kg)</Label>
                    <Input
                      id="weight"
                      type="number"
                      placeholder="70"
                      value={formData.weight_kg}
                      onChange={(e) => setFormData({ ...formData, weight_kg: e.target.value })}
                      className="h-12 mt-2"
                    />
                  </div>

                  {calculateBMI() && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="p-4 rounded-xl bg-secondary text-center"
                    >
                      <span className="text-sm text-muted-foreground">Your BMI</span>
                      <div className="text-3xl font-bold text-primary">{calculateBMI()}</div>
                    </motion.div>
                  )}
                </div>
              </div>
            )}

            {step === 2 && (
              <div className="space-y-6">
                <div className="text-center mb-8">
                  <h2 className="text-2xl font-bold mb-2">Your fitness goals</h2>
                  <p className="text-muted-foreground">We'll tailor recommendations for you</p>
                </div>

                <div className="space-y-4">
                  <div>
                    <Label className="mb-3 block">Activity Level</Label>
                    <div className="space-y-2">
                      {activityLevels.map((level) => (
                        <button
                          key={level.value}
                          onClick={() => setFormData({ ...formData, activity_level: level.value })}
                          className={`w-full p-4 rounded-xl border-2 text-left transition-all ${
                            formData.activity_level === level.value
                              ? "border-primary bg-primary/10"
                              : "border-border hover:border-primary/50"
                          }`}
                        >
                          <div className="font-medium">{level.label}</div>
                          <div className="text-sm text-muted-foreground">{level.desc}</div>
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <Label className="mb-3 block">Primary Goal</Label>
                    <div className="grid grid-cols-3 gap-3">
                      {fitnessGoals.map((goal) => (
                        <button
                          key={goal.value}
                          onClick={() => setFormData({ ...formData, fitness_goal: goal.value })}
                          className={`p-4 rounded-xl border-2 transition-all ${
                            formData.fitness_goal === goal.value
                              ? "border-primary bg-primary/10"
                              : "border-border hover:border-primary/50"
                          }`}
                        >
                          <span className="text-2xl mb-1 block">{goal.emoji}</span>
                          <span className="text-sm">{goal.label}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {step === 3 && (
              <div className="space-y-6">
                <div className="text-center mb-8">
                  <h2 className="text-2xl font-bold mb-2">Dietary preference</h2>
                  <p className="text-muted-foreground">This helps with meal suggestions</p>
                </div>

                <div className="space-y-3">
                  {dietaryPrefs.map((pref) => (
                    <button
                      key={pref.value}
                      onClick={() => setFormData({ ...formData, dietary_preference: pref.value })}
                      className={`w-full p-6 rounded-xl border-2 flex items-center gap-4 transition-all ${
                        formData.dietary_preference === pref.value
                          ? "border-primary bg-primary/10"
                          : "border-border hover:border-primary/50"
                      }`}
                    >
                      <span className="text-3xl">{pref.emoji}</span>
                      <span className="text-lg font-medium">{pref.label}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Navigation */}
      <div className="p-4 flex gap-3">
        {step > 0 && (
          <Button
            variant="outline"
            size="lg"
            onClick={() => setStep(step - 1)}
            className="gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </Button>
        )}
        
        <Button
          variant="hero"
          size="lg"
          className="flex-1 gap-2"
          disabled={!canProceed() || isLoading}
          onClick={() => {
            if (step < steps.length - 1) {
              setStep(step + 1);
            } else {
              handleSubmit();
            }
          }}
        >
          {isLoading ? (
            <Loader2 className="w-5 h-5 animate-spin" />
          ) : step < steps.length - 1 ? (
            <>
              Continue
              <ArrowRight className="w-4 h-4" />
            </>
          ) : (
            "Complete Setup"
          )}
        </Button>
      </div>
    </div>
  );
}
