import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/lib/auth-context";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Battery, Moon, Brain, AlertTriangle, Check } from "lucide-react";
import { format } from "date-fns";
import { HealthChatBot } from "@/components/health/HealthChatBot";

const commonSymptoms = [
  "Headache",
  "Fatigue",
  "Fever",
  "Nausea",
  "Back pain",
  "Muscle ache",
  "Sore throat",
  "Congestion",
  "Dizziness",
  "Insomnia",
];

const levelOptions = [
  { value: 1, label: "Very Low", color: "bg-destructive" },
  { value: 2, label: "Low", color: "bg-orange-500" },
  { value: 3, label: "Moderate", color: "bg-yellow-500" },
  { value: 4, label: "Good", color: "bg-lime-500" },
  { value: 5, label: "Excellent", color: "bg-success" },
];

const stressOptions = [
  { value: 1, label: "Very Low", color: "bg-success" },
  { value: 2, label: "Low", color: "bg-lime-500" },
  { value: 3, label: "Moderate", color: "bg-yellow-500" },
  { value: 4, label: "High", color: "bg-orange-500" },
  { value: 5, label: "Very High", color: "bg-destructive" },
];

export default function Health() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [existingCheckin, setExistingCheckin] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    energy_level: 3,
    sleep_quality: 3,
    stress_level: 2,
    symptoms: [] as string[],
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
      const { data: checkinData } = await supabase
        .from("health_checkins")
        .select("*")
        .eq("user_id", user.id)
        .eq("checkin_date", today)
        .single();
      
      if (checkinData) {
        setExistingCheckin(checkinData);
        setFormData({
          energy_level: checkinData.energy_level,
          sleep_quality: checkinData.sleep_quality,
          stress_level: checkinData.stress_level,
          symptoms: checkinData.symptoms || [],
          notes: checkinData.notes || "",
        });
      }
    } catch (error) {
      // No existing checkin
    } finally {
      setLoading(false);
    }
  };

  const toggleSymptom = (symptom: string) => {
    setFormData((prev) => ({
      ...prev,
      symptoms: prev.symptoms.includes(symptom)
        ? prev.symptoms.filter((s) => s !== symptom)
        : [...prev.symptoms, symptom],
    }));
  };

  const handleSubmit = async () => {
    if (!user) return;

    setSubmitting(true);
    try {
      if (existingCheckin) {
        // Update existing
        const { error } = await supabase
          .from("health_checkins")
          .update({
            energy_level: formData.energy_level,
            sleep_quality: formData.sleep_quality,
            stress_level: formData.stress_level,
            symptoms: formData.symptoms,
            notes: formData.notes || null,
          })
          .eq("id", existingCheckin.id);

        if (error) throw error;
        toast({ title: "Check-in updated! ✨" });
      } else {
        // Create new
        const { error } = await supabase.from("health_checkins").insert({
          user_id: user.id,
          energy_level: formData.energy_level,
          sleep_quality: formData.sleep_quality,
          stress_level: formData.stress_level,
          symptoms: formData.symptoms,
          notes: formData.notes || null,
          checkin_date: today,
        });

        if (error) throw error;
        toast({ title: "Check-in saved! 💪" });
      }

      loadData();
    } catch (error) {
      toast({
        title: "Error saving check-in",
        description: "Please try again.",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
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
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold">Daily Health Check-in</h1>
          <p className="text-muted-foreground">{format(new Date(), "EEEE, MMMM d")}</p>
          {existingCheckin && (
            <div className="inline-flex items-center gap-1.5 mt-2 px-3 py-1 rounded-full bg-success/10 text-success text-sm">
              <Check className="w-4 h-4" />
              Checked in today
            </div>
          )}
        </div>

        {/* Energy Level */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-6 rounded-2xl bg-card border"
        >
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-energy/10 flex items-center justify-center">
              <Battery className="w-5 h-5 text-energy" />
            </div>
            <div>
              <h3 className="font-semibold">Energy Level</h3>
              <p className="text-sm text-muted-foreground">How energized do you feel?</p>
            </div>
          </div>

          <div className="flex gap-2">
            {levelOptions.map((option) => (
              <button
                key={option.value}
                onClick={() => setFormData({ ...formData, energy_level: option.value })}
                className={`flex-1 p-3 rounded-xl border-2 transition-all text-center ${
                  formData.energy_level === option.value
                    ? "border-energy bg-energy/10"
                    : "border-border hover:border-energy/50"
                }`}
              >
                <div className={`w-4 h-4 rounded-full ${option.color} mx-auto mb-1`} />
                <span className="text-xs">{option.label}</span>
              </button>
            ))}
          </div>
        </motion.section>

        {/* Sleep Quality */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="p-6 rounded-2xl bg-card border"
        >
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-sleep/10 flex items-center justify-center">
              <Moon className="w-5 h-5 text-sleep" />
            </div>
            <div>
              <h3 className="font-semibold">Sleep Quality</h3>
              <p className="text-sm text-muted-foreground">How well did you sleep?</p>
            </div>
          </div>

          <div className="flex gap-2">
            {levelOptions.map((option) => (
              <button
                key={option.value}
                onClick={() => setFormData({ ...formData, sleep_quality: option.value })}
                className={`flex-1 p-3 rounded-xl border-2 transition-all text-center ${
                  formData.sleep_quality === option.value
                    ? "border-sleep bg-sleep/10"
                    : "border-border hover:border-sleep/50"
                }`}
              >
                <div className={`w-4 h-4 rounded-full ${option.color} mx-auto mb-1`} />
                <span className="text-xs">{option.label}</span>
              </button>
            ))}
          </div>
        </motion.section>

        {/* Stress Level */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="p-6 rounded-2xl bg-card border"
        >
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-stress/10 flex items-center justify-center">
              <Brain className="w-5 h-5 text-stress" />
            </div>
            <div>
              <h3 className="font-semibold">Stress Level</h3>
              <p className="text-sm text-muted-foreground">How stressed are you feeling?</p>
            </div>
          </div>

          <div className="flex gap-2">
            {stressOptions.map((option) => (
              <button
                key={option.value}
                onClick={() => setFormData({ ...formData, stress_level: option.value })}
                className={`flex-1 p-3 rounded-xl border-2 transition-all text-center ${
                  formData.stress_level === option.value
                    ? "border-primary bg-primary/10"
                    : "border-border hover:border-primary/50"
                }`}
              >
                <div className={`w-4 h-4 rounded-full ${option.color} mx-auto mb-1`} />
                <span className="text-xs">{option.label}</span>
              </button>
            ))}
          </div>
        </motion.section>

        {/* Symptoms */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="p-6 rounded-2xl bg-card border"
        >
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-warning/10 flex items-center justify-center">
              <AlertTriangle className="w-5 h-5 text-warning" />
            </div>
            <div>
              <h3 className="font-semibold">Any Symptoms?</h3>
              <p className="text-sm text-muted-foreground">Select all that apply</p>
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            {commonSymptoms.map((symptom) => (
              <button
                key={symptom}
                onClick={() => toggleSymptom(symptom)}
                className={`px-3 py-2 rounded-full border-2 text-sm transition-all ${
                  formData.symptoms.includes(symptom)
                    ? "border-warning bg-warning/10 text-warning"
                    : "border-border hover:border-warning/50"
                }`}
              >
                {symptom}
              </button>
            ))}
          </div>
        </motion.section>

        {/* Notes */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="p-6 rounded-2xl bg-card border"
        >
          <Label htmlFor="notes" className="text-base font-semibold">
            Additional Notes
          </Label>
          <Textarea
            id="notes"
            placeholder="Any other observations about your health today..."
            value={formData.notes}
            onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
            className="mt-3 min-h-[100px]"
          />
        </motion.section>

        {/* Submit */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <Button
            variant="hero"
            size="lg"
            className="w-full"
            onClick={handleSubmit}
            disabled={submitting}
          >
            {submitting
              ? "Saving..."
              : existingCheckin
              ? "Update Check-in"
              : "Save Check-in"}
          </Button>

          {formData.symptoms.length > 2 && (
            <p className="text-sm text-warning text-center mt-4 flex items-center justify-center gap-2">
              <AlertTriangle className="w-4 h-4" />
              Multiple symptoms reported. Consider consulting a healthcare provider if they persist.
            </p>
          )}
        </motion.div>

        {/* AI Health Chatbot */}
        <HealthChatBot />
      </div>
    </DashboardLayout>
  );
}
