/// <reference types="https://esm.sh/@supabase/functions-js/src/edge-runtime.d.ts" />

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { foodName, weightGrams } = await req.json();

    if (!foodName) {
      return new Response(
        JSON.stringify({ error: "Food name is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const weight = weightGrams || 100;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${Deno.env.get("LOVABLE_API_KEY")}`,
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          {
            role: "system",
            content: `You are a nutrition expert AI. Analyze foods and provide accurate nutritional information.
            
IMPORTANT: Always respond with ONLY valid JSON in this exact format, no other text:
{
  "calories": number,
  "protein_g": number,
  "carbs_g": number,
  "fats_g": number,
  "fiber_g": number,
  "confidence": "high" | "medium" | "low",
  "notes": "optional brief note about the food"
}

All values should be for the specified weight. Round to 1 decimal place.
If you're uncertain about a food, use your best estimate and set confidence to "low" or "medium".`
          },
          {
            role: "user",
            content: `Analyze the nutritional content of "${foodName}" for ${weight} grams. Provide calories, protein, carbs, fats, and fiber.`
          }
        ],
        temperature: 0.3,
        max_tokens: 500,
      }),
    });

    if (!response.ok) {
      throw new Error(`AI Gateway error: ${response.status}`);
    }

    const data = await response.json();
    const content = data.choices[0]?.message?.content;

    if (!content) {
      throw new Error("No response from AI");
    }

    // Parse the JSON response from AI
    let nutrition;
    try {
      // Clean up the response in case there's markdown formatting
      const cleanContent = content.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
      nutrition = JSON.parse(cleanContent);
    } catch (parseError) {
      console.error("Failed to parse AI response:", content);
      throw new Error("Failed to parse nutrition data");
    }

    return new Response(
      JSON.stringify({
        success: true,
        data: {
          food_name: foodName,
          weight_grams: weight,
          calories: Math.round(nutrition.calories),
          protein_g: Math.round(nutrition.protein_g * 10) / 10,
          carbs_g: Math.round(nutrition.carbs_g * 10) / 10,
          fats_g: Math.round(nutrition.fats_g * 10) / 10,
          fiber_g: Math.round(nutrition.fiber_g * 10) / 10,
          confidence: nutrition.confidence || "medium",
          notes: nutrition.notes || null,
        }
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error: unknown) {
    console.error("Error analyzing food:", error);
    const errorMessage = error instanceof Error ? error.message : "Failed to analyze food";
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
