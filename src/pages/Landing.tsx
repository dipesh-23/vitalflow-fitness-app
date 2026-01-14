import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { 
  Heart, 
  Activity, 
  Utensils, 
  TrendingUp, 
  Bell, 
  MessageCircle,
  ArrowRight,
  Sparkles,
  Shield,
  Zap
} from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { useEffect } from "react";

const features = [
  {
    icon: Activity,
    title: "Fitness Tracking",
    description: "Log workouts, track calories burned, and build healthy exercise habits with smart reminders.",
  },
  {
    icon: Utensils,
    title: "Nutrition Logging",
    description: "Track meals, monitor macros, and get personalized dietary insights for better nutrition.",
  },
  {
    icon: Heart,
    title: "Health Check-ins",
    description: "Daily wellness updates, symptom tracking, and personalized health recommendations.",
  },
  {
    icon: MessageCircle,
    title: "AI Health Guide",
    description: "Get intelligent guidance on diet, exercise, and general wellness questions.",
  },
  {
    icon: Bell,
    title: "Smart Reminders",
    description: "Never miss a workout, meal log, or health check-in with personalized notifications.",
  },
  {
    icon: TrendingUp,
    title: "Progress Insights",
    description: "Beautiful charts and analytics to visualize your health journey over time.",
  },
];

const stats = [
  { value: "10K+", label: "Active Users" },
  { value: "500K+", label: "Workouts Logged" },
  { value: "2M+", label: "Meals Tracked" },
  { value: "4.9", label: "App Rating" },
];

export default function Landing() {
  const navigate = useNavigate();
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      navigate("/dashboard");
    }
  }, [user, navigate]);

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 glass">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-primary">
              <Heart className="w-5 h-5 text-primary-foreground" />
            </div>
            <span className="text-xl font-bold gradient-text">VitalFlow</span>
          </div>
          
          <div className="flex items-center gap-3">
            <Button variant="ghost" onClick={() => navigate("/auth")}>
              Sign In
            </Button>
            <Button variant="hero" onClick={() => navigate("/auth")}>
              Get Started
            </Button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-4 relative overflow-hidden">
        <div className="absolute inset-0 animated-gradient opacity-5" />
        
        <div className="container mx-auto relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center max-w-4xl mx-auto"
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary mb-6">
              <Sparkles className="w-4 h-4" />
              <span className="text-sm font-medium">AI-Powered Health Tracking</span>
            </div>
            
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-6 text-balance">
              Your Complete
              <span className="gradient-text-hero"> Health & Fitness </span>
              Companion
            </h1>
            
            <p className="text-lg sm:text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
              Track workouts, log nutrition, monitor wellness, and get AI-powered guidance—all in one beautiful app designed for your busy life.
            </p>
            
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Button 
                variant="hero" 
                size="xl"
                onClick={() => navigate("/auth")}
                className="group"
              >
                Start Free Today
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Button>
              <Button 
                variant="outline" 
                size="xl"
                onClick={() => document.getElementById("features")?.scrollIntoView({ behavior: "smooth" })}
              >
                Learn More
              </Button>
            </div>
          </motion.div>

          {/* Stats */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-6 max-w-3xl mx-auto"
          >
            {stats.map((stat, i) => (
              <div key={i} className="text-center">
                <div className="text-3xl sm:text-4xl font-bold gradient-text">{stat.value}</div>
                <div className="text-sm text-muted-foreground mt-1">{stat.label}</div>
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 px-4 bg-muted/30">
        <div className="container mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">
              Everything You Need to
              <span className="gradient-text"> Thrive</span>
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Comprehensive tools designed to help you build lasting healthy habits.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="group p-6 rounded-2xl bg-card border shadow-sm hover:shadow-lg transition-all duration-300 stat-card"
              >
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
                  <feature.icon className="w-6 h-6 text-primary" />
                </div>
                <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                <p className="text-muted-foreground">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Trust Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto">
          <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            {[
              { icon: Shield, title: "Privacy First", desc: "Your health data is encrypted and never shared" },
              { icon: Zap, title: "Lightning Fast", desc: "Quick logging means more time for what matters" },
              { icon: Sparkles, title: "AI-Powered", desc: "Smart insights that learn from your patterns" },
            ].map((item, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="text-center"
              >
                <div className="w-16 h-16 rounded-2xl bg-secondary flex items-center justify-center mx-auto mb-4">
                  <item.icon className="w-8 h-8 text-primary" />
                </div>
                <h3 className="text-lg font-semibold mb-2">{item.title}</h3>
                <p className="text-muted-foreground text-sm">{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          className="container mx-auto"
        >
          <div className="relative rounded-3xl overflow-hidden animated-gradient p-12 md:p-16 text-center text-white">
            <div className="relative z-10">
              <h2 className="text-3xl sm:text-4xl font-bold mb-4">
                Ready to Transform Your Health?
              </h2>
              <p className="text-lg opacity-90 mb-8 max-w-xl mx-auto">
                Join thousands of users who are taking control of their wellness journey with VitalFlow.
              </p>
              <Button 
                variant="glass" 
                size="xl"
                onClick={() => navigate("/auth")}
                className="group"
              >
                Get Started Free
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Button>
            </div>
            
            {/* Decorative elements */}
            <div className="absolute -bottom-10 -right-10 w-40 h-40 rounded-full bg-white/10 blur-2xl" />
            <div className="absolute -top-10 -left-10 w-32 h-32 rounded-full bg-white/10 blur-2xl" />
          </div>
        </motion.div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-4 border-t">
        <div className="container mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-primary">
              <Heart className="w-4 h-4 text-primary-foreground" />
            </div>
            <span className="font-semibold">VitalFlow</span>
          </div>
          <p className="text-sm text-muted-foreground">
            © 2024 VitalFlow. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
