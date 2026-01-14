// Common food database with nutritional values per 100g
export interface FoodItem {
  id: string;
  name: string;
  category: string;
  calories: number; // per 100g
  protein_g: number;
  carbs_g: number;
  fats_g: number;
  fiber_g: number;
  serving_size?: number; // typical serving in grams
}

export const foodDatabase: FoodItem[] = [
  // Proteins
  { id: "chicken-breast", name: "Chicken Breast (Grilled)", category: "Protein", calories: 165, protein_g: 31, carbs_g: 0, fats_g: 3.6, fiber_g: 0, serving_size: 150 },
  { id: "chicken-thigh", name: "Chicken Thigh", category: "Protein", calories: 209, protein_g: 26, carbs_g: 0, fats_g: 11, fiber_g: 0, serving_size: 100 },
  { id: "salmon", name: "Salmon (Baked)", category: "Protein", calories: 208, protein_g: 20, carbs_g: 0, fats_g: 13, fiber_g: 0, serving_size: 150 },
  { id: "tuna", name: "Tuna (Canned)", category: "Protein", calories: 116, protein_g: 26, carbs_g: 0, fats_g: 1, fiber_g: 0, serving_size: 100 },
  { id: "eggs", name: "Eggs (Boiled)", category: "Protein", calories: 155, protein_g: 13, carbs_g: 1.1, fats_g: 11, fiber_g: 0, serving_size: 50 },
  { id: "egg-white", name: "Egg White", category: "Protein", calories: 52, protein_g: 11, carbs_g: 0.7, fats_g: 0.2, fiber_g: 0, serving_size: 33 },
  { id: "beef", name: "Beef (Lean)", category: "Protein", calories: 250, protein_g: 26, carbs_g: 0, fats_g: 15, fiber_g: 0, serving_size: 100 },
  { id: "paneer", name: "Paneer", category: "Protein", calories: 265, protein_g: 18, carbs_g: 1.2, fats_g: 21, fiber_g: 0, serving_size: 100 },
  { id: "tofu", name: "Tofu", category: "Protein", calories: 76, protein_g: 8, carbs_g: 1.9, fats_g: 4.8, fiber_g: 0.3, serving_size: 100 },
  { id: "greek-yogurt", name: "Greek Yogurt", category: "Protein", calories: 97, protein_g: 9, carbs_g: 3.6, fats_g: 5, fiber_g: 0, serving_size: 150 },
  
  // Grains & Carbs
  { id: "rice-white", name: "White Rice (Cooked)", category: "Grains", calories: 130, protein_g: 2.7, carbs_g: 28, fats_g: 0.3, fiber_g: 0.4, serving_size: 150 },
  { id: "rice-brown", name: "Brown Rice (Cooked)", category: "Grains", calories: 111, protein_g: 2.6, carbs_g: 23, fats_g: 0.9, fiber_g: 1.8, serving_size: 150 },
  { id: "oats", name: "Oatmeal (Cooked)", category: "Grains", calories: 68, protein_g: 2.4, carbs_g: 12, fats_g: 1.4, fiber_g: 1.7, serving_size: 250 },
  { id: "bread-wheat", name: "Whole Wheat Bread", category: "Grains", calories: 247, protein_g: 13, carbs_g: 41, fats_g: 3.4, fiber_g: 7, serving_size: 30 },
  { id: "bread-white", name: "White Bread", category: "Grains", calories: 265, protein_g: 9, carbs_g: 49, fats_g: 3.2, fiber_g: 2.7, serving_size: 30 },
  { id: "pasta", name: "Pasta (Cooked)", category: "Grains", calories: 131, protein_g: 5, carbs_g: 25, fats_g: 1.1, fiber_g: 1.8, serving_size: 200 },
  { id: "quinoa", name: "Quinoa (Cooked)", category: "Grains", calories: 120, protein_g: 4.4, carbs_g: 21, fats_g: 1.9, fiber_g: 2.8, serving_size: 150 },
  { id: "roti", name: "Roti/Chapati", category: "Grains", calories: 297, protein_g: 9, carbs_g: 50, fats_g: 7.5, fiber_g: 4, serving_size: 40 },
  
  // Vegetables
  { id: "broccoli", name: "Broccoli", category: "Vegetables", calories: 34, protein_g: 2.8, carbs_g: 7, fats_g: 0.4, fiber_g: 2.6, serving_size: 100 },
  { id: "spinach", name: "Spinach", category: "Vegetables", calories: 23, protein_g: 2.9, carbs_g: 3.6, fats_g: 0.4, fiber_g: 2.2, serving_size: 100 },
  { id: "carrots", name: "Carrots", category: "Vegetables", calories: 41, protein_g: 0.9, carbs_g: 10, fats_g: 0.2, fiber_g: 2.8, serving_size: 100 },
  { id: "tomatoes", name: "Tomatoes", category: "Vegetables", calories: 18, protein_g: 0.9, carbs_g: 3.9, fats_g: 0.2, fiber_g: 1.2, serving_size: 100 },
  { id: "cucumber", name: "Cucumber", category: "Vegetables", calories: 16, protein_g: 0.7, carbs_g: 3.6, fats_g: 0.1, fiber_g: 0.5, serving_size: 100 },
  { id: "onion", name: "Onion", category: "Vegetables", calories: 40, protein_g: 1.1, carbs_g: 9, fats_g: 0.1, fiber_g: 1.7, serving_size: 100 },
  { id: "potato", name: "Potato (Boiled)", category: "Vegetables", calories: 87, protein_g: 1.9, carbs_g: 20, fats_g: 0.1, fiber_g: 1.8, serving_size: 150 },
  { id: "sweet-potato", name: "Sweet Potato", category: "Vegetables", calories: 86, protein_g: 1.6, carbs_g: 20, fats_g: 0.1, fiber_g: 3, serving_size: 150 },
  
  // Fruits
  { id: "apple", name: "Apple", category: "Fruits", calories: 52, protein_g: 0.3, carbs_g: 14, fats_g: 0.2, fiber_g: 2.4, serving_size: 180 },
  { id: "banana", name: "Banana", category: "Fruits", calories: 89, protein_g: 1.1, carbs_g: 23, fats_g: 0.3, fiber_g: 2.6, serving_size: 120 },
  { id: "orange", name: "Orange", category: "Fruits", calories: 47, protein_g: 0.9, carbs_g: 12, fats_g: 0.1, fiber_g: 2.4, serving_size: 150 },
  { id: "mango", name: "Mango", category: "Fruits", calories: 60, protein_g: 0.8, carbs_g: 15, fats_g: 0.4, fiber_g: 1.6, serving_size: 150 },
  { id: "grapes", name: "Grapes", category: "Fruits", calories: 69, protein_g: 0.7, carbs_g: 18, fats_g: 0.2, fiber_g: 0.9, serving_size: 100 },
  { id: "watermelon", name: "Watermelon", category: "Fruits", calories: 30, protein_g: 0.6, carbs_g: 8, fats_g: 0.2, fiber_g: 0.4, serving_size: 200 },
  
  // Dairy
  { id: "milk-whole", name: "Milk (Whole)", category: "Dairy", calories: 61, protein_g: 3.2, carbs_g: 4.8, fats_g: 3.3, fiber_g: 0, serving_size: 250 },
  { id: "milk-skim", name: "Milk (Skim)", category: "Dairy", calories: 34, protein_g: 3.4, carbs_g: 5, fats_g: 0.1, fiber_g: 0, serving_size: 250 },
  { id: "cheese", name: "Cheese (Cheddar)", category: "Dairy", calories: 403, protein_g: 25, carbs_g: 1.3, fats_g: 33, fiber_g: 0, serving_size: 30 },
  { id: "butter", name: "Butter", category: "Dairy", calories: 717, protein_g: 0.9, carbs_g: 0.1, fats_g: 81, fiber_g: 0, serving_size: 10 },
  
  // Legumes
  { id: "lentils", name: "Lentils (Cooked)", category: "Legumes", calories: 116, protein_g: 9, carbs_g: 20, fats_g: 0.4, fiber_g: 7.9, serving_size: 150 },
  { id: "chickpeas", name: "Chickpeas (Cooked)", category: "Legumes", calories: 164, protein_g: 8.9, carbs_g: 27, fats_g: 2.6, fiber_g: 7.6, serving_size: 150 },
  { id: "kidney-beans", name: "Kidney Beans", category: "Legumes", calories: 127, protein_g: 8.7, carbs_g: 23, fats_g: 0.5, fiber_g: 6.4, serving_size: 150 },
  { id: "dal", name: "Dal (Cooked)", category: "Legumes", calories: 104, protein_g: 7, carbs_g: 18, fats_g: 0.4, fiber_g: 5, serving_size: 200 },
  
  // Nuts & Seeds
  { id: "almonds", name: "Almonds", category: "Nuts", calories: 579, protein_g: 21, carbs_g: 22, fats_g: 50, fiber_g: 12, serving_size: 30 },
  { id: "peanuts", name: "Peanuts", category: "Nuts", calories: 567, protein_g: 26, carbs_g: 16, fats_g: 49, fiber_g: 8.5, serving_size: 30 },
  { id: "walnuts", name: "Walnuts", category: "Nuts", calories: 654, protein_g: 15, carbs_g: 14, fats_g: 65, fiber_g: 6.7, serving_size: 30 },
  { id: "cashews", name: "Cashews", category: "Nuts", calories: 553, protein_g: 18, carbs_g: 30, fats_g: 44, fiber_g: 3.3, serving_size: 30 },
  
  // Beverages
  { id: "coffee", name: "Coffee (Black)", category: "Beverages", calories: 2, protein_g: 0.3, carbs_g: 0, fats_g: 0, fiber_g: 0, serving_size: 250 },
  { id: "tea", name: "Tea (No Sugar)", category: "Beverages", calories: 1, protein_g: 0, carbs_g: 0.3, fats_g: 0, fiber_g: 0, serving_size: 250 },
  { id: "orange-juice", name: "Orange Juice", category: "Beverages", calories: 45, protein_g: 0.7, carbs_g: 10, fats_g: 0.2, fiber_g: 0.2, serving_size: 250 },
  
  // Common Indian Foods
  { id: "biryani", name: "Chicken Biryani", category: "Indian", calories: 180, protein_g: 8, carbs_g: 25, fats_g: 6, fiber_g: 1, serving_size: 250 },
  { id: "butter-chicken", name: "Butter Chicken", category: "Indian", calories: 180, protein_g: 14, carbs_g: 8, fats_g: 11, fiber_g: 1, serving_size: 200 },
  { id: "palak-paneer", name: "Palak Paneer", category: "Indian", calories: 150, protein_g: 8, carbs_g: 7, fats_g: 11, fiber_g: 2, serving_size: 200 },
  { id: "samosa", name: "Samosa", category: "Indian", calories: 262, protein_g: 4, carbs_g: 24, fats_g: 17, fiber_g: 2, serving_size: 60 },
  { id: "idli", name: "Idli", category: "Indian", calories: 39, protein_g: 2, carbs_g: 8, fats_g: 0.1, fiber_g: 0.4, serving_size: 40 },
  { id: "dosa", name: "Dosa", category: "Indian", calories: 120, protein_g: 3, carbs_g: 18, fats_g: 4, fiber_g: 1, serving_size: 100 },
  
  // Fast Food
  { id: "pizza", name: "Pizza (1 slice)", category: "Fast Food", calories: 285, protein_g: 12, carbs_g: 36, fats_g: 10, fiber_g: 2.5, serving_size: 107 },
  { id: "burger", name: "Hamburger", category: "Fast Food", calories: 295, protein_g: 17, carbs_g: 24, fats_g: 14, fiber_g: 1, serving_size: 150 },
  { id: "french-fries", name: "French Fries", category: "Fast Food", calories: 312, protein_g: 3.4, carbs_g: 41, fats_g: 15, fiber_g: 3.8, serving_size: 100 },
  { id: "fried-chicken", name: "Fried Chicken", category: "Fast Food", calories: 246, protein_g: 19, carbs_g: 10, fats_g: 15, fiber_g: 0.5, serving_size: 100 },
];

export const foodCategories = [
  "All",
  "Protein",
  "Grains",
  "Vegetables",
  "Fruits",
  "Dairy",
  "Legumes",
  "Nuts",
  "Beverages",
  "Indian",
  "Fast Food",
];

export function searchFoods(query: string, category?: string): FoodItem[] {
  let results = foodDatabase;
  
  if (category && category !== "All") {
    results = results.filter(food => food.category === category);
  }
  
  if (query) {
    const lowerQuery = query.toLowerCase();
    results = results.filter(food => 
      food.name.toLowerCase().includes(lowerQuery)
    );
  }
  
  return results;
}

export function calculateNutrition(food: FoodItem, weightGrams: number) {
  const multiplier = weightGrams / 100;
  return {
    calories: Math.round(food.calories * multiplier),
    protein_g: Math.round(food.protein_g * multiplier * 10) / 10,
    carbs_g: Math.round(food.carbs_g * multiplier * 10) / 10,
    fats_g: Math.round(food.fats_g * multiplier * 10) / 10,
    fiber_g: Math.round(food.fiber_g * multiplier * 10) / 10,
  };
}
