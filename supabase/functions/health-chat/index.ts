import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { messages, userId } = await req.json();
    
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    // Initialize Supabase client to fetch user's health data
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Fetch user's health context
    const today = new Date().toISOString().split('T')[0];
    const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

    // Fetch profile
    const { data: profile } = await supabase
      .from('profiles')
      .select('*')
      .eq('user_id', userId)
      .single();

    // Fetch recent meals (last 7 days)
    const { data: meals } = await supabase
      .from('meals')
      .select('*')
      .eq('user_id', userId)
      .gte('meal_date', weekAgo)
      .order('meal_date', { ascending: false });

    // Fetch recent activities (last 7 days)
    const { data: activities } = await supabase
      .from('activities')
      .select('*')
      .eq('user_id', userId)
      .gte('activity_date', weekAgo)
      .order('activity_date', { ascending: false });

    // Fetch recent health check-ins (last 7 days)
    const { data: healthCheckins } = await supabase
      .from('health_checkins')
      .select('*')
      .eq('user_id', userId)
      .gte('checkin_date', weekAgo)
      .order('checkin_date', { ascending: false });

    // Calculate summary statistics
    const totalCaloriesConsumed = meals?.reduce((sum, m) => sum + (m.calories || 0), 0) || 0;
    const totalCaloriesBurned = activities?.reduce((sum, a) => sum + (a.calories_burned || 0), 0) || 0;
    const totalProtein = meals?.reduce((sum, m) => sum + (m.protein_g || 0), 0) || 0;
    const totalCarbs = meals?.reduce((sum, m) => sum + (m.carbs_g || 0), 0) || 0;
    const totalFats = meals?.reduce((sum, m) => sum + (m.fats_g || 0), 0) || 0;
    const avgEnergy = healthCheckins?.length 
      ? healthCheckins.reduce((sum, h) => sum + (h.energy_level || 0), 0) / healthCheckins.length 
      : 0;
    const avgSleep = healthCheckins?.length 
      ? healthCheckins.reduce((sum, h) => sum + (h.sleep_quality || 0), 0) / healthCheckins.length 
      : 0;
    const avgStress = healthCheckins?.length 
      ? healthCheckins.reduce((sum, h) => sum + (h.stress_level || 0), 0) / healthCheckins.length 
      : 0;

    // Build context for AI
    const healthContext = `
USER PROFILE:
- Name: ${profile?.full_name || 'Not set'}
- Age: ${profile?.age || 'Not set'}
- Gender: ${profile?.gender || 'Not set'}
- Weight: ${profile?.weight_kg ? profile.weight_kg + ' kg' : 'Not set'}
- Height: ${profile?.height_cm ? profile.height_cm + ' cm' : 'Not set'}
- Activity Level: ${profile?.activity_level || 'Not set'}
- Fitness Goal: ${profile?.fitness_goal || 'Not set'}
- Dietary Preference: ${profile?.dietary_preference || 'Not set'}

LAST 7 DAYS SUMMARY:
- Total Calories Consumed: ${totalCaloriesConsumed} kcal
- Total Calories Burned: ${totalCaloriesBurned} kcal
- Net Calories: ${totalCaloriesConsumed - totalCaloriesBurned} kcal
- Total Protein: ${totalProtein}g
- Total Carbs: ${totalCarbs}g
- Total Fats: ${totalFats}g
- Average Energy Level: ${avgEnergy.toFixed(1)}/5
- Average Sleep Quality: ${avgSleep.toFixed(1)}/5
- Average Stress Level: ${avgStress.toFixed(1)}/5
- Number of Meals Logged: ${meals?.length || 0}
- Number of Activities Logged: ${activities?.length || 0}
- Number of Health Check-ins: ${healthCheckins?.length || 0}

RECENT MEALS (last 7 days):
${meals?.slice(0, 10).map(m => `- ${m.meal_date}: ${m.food_name} (${m.meal_type}) - ${m.calories} kcal, P:${m.protein_g}g C:${m.carbs_g}g F:${m.fats_g}g`).join('\n') || 'No meals logged'}

RECENT ACTIVITIES (last 7 days):
${activities?.slice(0, 10).map(a => `- ${a.activity_date}: ${a.activity_type} for ${a.duration_minutes} min - ${a.calories_burned} kcal burned (${a.intensity} intensity)`).join('\n') || 'No activities logged'}

RECENT HEALTH CHECK-INS (last 7 days):
${healthCheckins?.slice(0, 7).map(h => `- ${h.checkin_date}: Energy ${h.energy_level}/5, Sleep ${h.sleep_quality}/5, Stress ${h.stress_level}/5${h.symptoms?.length ? ', Symptoms: ' + h.symptoms.join(', ') : ''}`).join('\n') || 'No check-ins logged'}
`;

    const systemPrompt = `You are a helpful AI health and nutrition assistant. You have access to the user's health data and can provide personalized advice.

${healthContext}

GUIDELINES:
- Provide personalized advice based on the user's profile, goals, and recent data
- Give specific dietary recommendations considering their dietary preference
- Suggest improvements based on their activity level and fitness goals
- Be encouraging and supportive
- If asked for a health report summary, analyze their recent data comprehensively
- Always remind users to consult healthcare professionals for medical advice
- Keep responses concise but informative
- Use metric units (kg, cm, kcal) consistently
- If data is missing, acknowledge it and suggest the user log more data`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: systemPrompt },
          ...messages,
        ],
        stream: true,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limit exceeded. Please try again later." }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "Usage limit reached. Please add credits." }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      return new Response(JSON.stringify({ error: "AI service error" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(response.body, {
      headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
    });
  } catch (error) {
    console.error("Health chat error:", error);
    return new Response(JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
