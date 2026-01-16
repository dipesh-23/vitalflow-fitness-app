import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/lib/auth-context";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import { User, Scale, Target, LogOut, Loader2 } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function Profile() {
  const { user, signOut } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [formData, setFormData] = useState({
    full_name: "",
    age: "",
    gender: "",
    height_cm: "",
    weight_kg: "",
    activity_level: "",
    fitness_goal: "",
    dietary_preference: "",
  });

  useEffect(() => {
    if (user) {
      loadProfile();
    }
  }, [user]);

  const loadProfile = async () => {
    if (!user) return;

    try {
      const { data } = await supabase
        .from("profiles")
        .select("*")
        .eq("user_id", user.id)
        .single();

      if (data) {
        setFormData({
          full_name: data.full_name || "",
          age: data.age?.toString() || "",
          gender: data.gender || "",
          height_cm: data.height_cm?.toString() || "",
          weight_kg: data.weight_kg?.toString() || "",
          activity_level: data.activity_level || "",
          fitness_goal: data.fitness_goal || "",
          dietary_preference: data.dietary_preference || "",
        });
      }
    } catch (error) {
      console.error("Error loading profile:", error);
    } finally {
      setLoading(false);
    }
  };

  const calculateBMI = () => {
    const height = parseFloat(formData.height_cm);
    const weight = parseFloat(formData.weight_kg);
    if (height && weight) {
      const heightM = height / 100;
      return (weight / (heightM * heightM)).toFixed(1);
    }
    return null;
  };

  const getBMICategory = (bmi: number) => {
    if (bmi < 18.5) return { label: "Underweight", color: "text-info" };
    if (bmi < 25) return { label: "Normal", color: "text-success" };
    if (bmi < 30) return { label: "Overweight", color: "text-warning" };
    return { label: "Obese", color: "text-destructive" };
  };

  const handleSave = async () => {
    if (!user) return;

    setSaving(true);
    try {
      const { error } = await supabase
        .from("profiles")
        .update({
          full_name: formData.full_name || null,
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

      toast({ title: "Profile updated! ✨" });
    } catch (error) {
      toast({
        title: "Error updating profile",
        description: "Please try again.",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const handleSignOut = async () => {
    await signOut();
    navigate("/");
  };

  const bmi = calculateBMI();
  const bmiCategory = bmi ? getBMICategory(parseFloat(bmi)) : null;

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
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold">Profile</h1>
            <p className="text-sm sm:text-base text-muted-foreground truncate max-w-[200px] sm:max-w-none">{user?.email}</p>
          </div>
        </div>

        {/* BMI Card */}
        {bmi && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="p-4 sm:p-6 rounded-xl sm:rounded-2xl bg-gradient-to-br from-primary/20 to-primary/5 border text-center"
          >
            <p className="text-xs sm:text-sm text-muted-foreground mb-1">Your BMI</p>
            <p className="text-3xl sm:text-4xl font-bold mb-1">{bmi}</p>
            <p className={`text-xs sm:text-sm font-medium ${bmiCategory?.color}`}>
              {bmiCategory?.label}
            </p>
          </motion.div>
        )}

        {/* Basic Info */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-4 sm:p-6 rounded-xl sm:rounded-2xl bg-card border"
        >
          <div className="flex items-center gap-2 sm:gap-3 mb-3 sm:mb-4">
            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl bg-primary/10 flex items-center justify-center">
              <User className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
            </div>
            <h3 className="font-semibold text-sm sm:text-base">Basic Information</h3>
          </div>

          <div className="space-y-3 sm:space-y-4">
            <div>
              <Label htmlFor="name" className="text-sm">Full Name</Label>
              <Input
                id="name"
                value={formData.full_name}
                onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                className="mt-2"
              />
            </div>

            <div className="grid grid-cols-2 gap-3 sm:gap-4">
              <div>
                <Label htmlFor="age" className="text-sm">Age</Label>
                <Input
                  id="age"
                  type="number"
                  value={formData.age}
                  onChange={(e) => setFormData({ ...formData, age: e.target.value })}
                  className="mt-2"
                />
              </div>
              <div>
                <Label className="text-sm">Gender</Label>
                <Select
                  value={formData.gender}
                  onValueChange={(v) => setFormData({ ...formData, gender: v })}
                >
                  <SelectTrigger className="mt-2">
                    <SelectValue placeholder="Select" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="male">Male</SelectItem>
                    <SelectItem value="female">Female</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        </motion.section>

        {/* Body Metrics */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="p-4 sm:p-6 rounded-xl sm:rounded-2xl bg-card border"
        >
          <div className="flex items-center gap-2 sm:gap-3 mb-3 sm:mb-4">
            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl bg-accent/10 flex items-center justify-center">
              <Scale className="w-4 h-4 sm:w-5 sm:h-5 text-accent" />
            </div>
            <h3 className="font-semibold text-sm sm:text-base">Body Metrics</h3>
          </div>

          <div className="grid grid-cols-2 gap-3 sm:gap-4">
            <div>
              <Label htmlFor="height" className="text-sm">Height (cm)</Label>
              <Input
                id="height"
                type="number"
                value={formData.height_cm}
                onChange={(e) => setFormData({ ...formData, height_cm: e.target.value })}
                className="mt-2"
              />
            </div>
            <div>
              <Label htmlFor="weight" className="text-sm">Weight (kg)</Label>
              <Input
                id="weight"
                type="number"
                value={formData.weight_kg}
                onChange={(e) => setFormData({ ...formData, weight_kg: e.target.value })}
                className="mt-2"
              />
            </div>
          </div>
        </motion.section>

        {/* Goals */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="p-4 sm:p-6 rounded-xl sm:rounded-2xl bg-card border"
        >
          <div className="flex items-center gap-2 sm:gap-3 mb-3 sm:mb-4">
            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl bg-success/10 flex items-center justify-center">
              <Target className="w-4 h-4 sm:w-5 sm:h-5 text-success" />
            </div>
            <h3 className="font-semibold text-sm sm:text-base">Goals & Preferences</h3>
          </div>

          <div className="space-y-3 sm:space-y-4">
            <div>
              <Label className="text-sm">Activity Level</Label>
              <Select
                value={formData.activity_level}
                onValueChange={(v) => setFormData({ ...formData, activity_level: v })}
              >
                <SelectTrigger className="mt-2">
                  <SelectValue placeholder="Select activity level" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="sedentary">Sedentary (little exercise)</SelectItem>
                  <SelectItem value="light">Light (1-3 days/week)</SelectItem>
                  <SelectItem value="moderate">Moderate (3-5 days/week)</SelectItem>
                  <SelectItem value="active">Active (6-7 days/week)</SelectItem>
                  <SelectItem value="very_active">Very Active (intense daily)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label className="text-sm">Fitness Goal</Label>
              <Select
                value={formData.fitness_goal}
                onValueChange={(v) => setFormData({ ...formData, fitness_goal: v })}
              >
                <SelectTrigger className="mt-2">
                  <SelectValue placeholder="Select fitness goal" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="weight_loss">Lose Weight</SelectItem>
                  <SelectItem value="maintenance">Maintain Weight</SelectItem>
                  <SelectItem value="muscle_gain">Build Muscle</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label className="text-sm">Dietary Preference</Label>
              <Select
                value={formData.dietary_preference}
                onValueChange={(v) => setFormData({ ...formData, dietary_preference: v })}
              >
                <SelectTrigger className="mt-2">
                  <SelectValue placeholder="Select diet preference" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="non_vegetarian">Non-Vegetarian</SelectItem>
                  <SelectItem value="vegetarian">Vegetarian</SelectItem>
                  <SelectItem value="vegan">Vegan</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </motion.section>

        {/* Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="space-y-2 sm:space-y-3"
        >
          <Button
            variant="hero"
            size="lg"
            className="w-full text-sm sm:text-base"
            onClick={handleSave}
            disabled={saving}
          >
            {saving ? (
              <Loader2 className="w-4 h-4 sm:w-5 sm:h-5 animate-spin" />
            ) : (
              "Save Changes"
            )}
          </Button>

          <Button
            variant="outline"
            size="lg"
            className="w-full text-destructive hover:text-destructive hover:bg-destructive/10 text-sm sm:text-base"
            onClick={handleSignOut}
          >
            <LogOut className="w-4 h-4 mr-2" />
            Sign Out
          </Button>
        </motion.div>
      </div>
    </DashboardLayout>
  );
}
