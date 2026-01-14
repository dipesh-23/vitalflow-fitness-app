-- Create foods table for the food database
CREATE TABLE public.foods (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  category TEXT NOT NULL,
  calories_per_100g NUMERIC NOT NULL DEFAULT 0,
  protein_per_100g NUMERIC NOT NULL DEFAULT 0,
  carbs_per_100g NUMERIC NOT NULL DEFAULT 0,
  fats_per_100g NUMERIC NOT NULL DEFAULT 0,
  fiber_per_100g NUMERIC NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  UNIQUE(name)
);

-- Enable RLS
ALTER TABLE public.foods ENABLE ROW LEVEL SECURITY;

-- Everyone can read all foods (public database)
CREATE POLICY "Anyone can view foods"
ON public.foods FOR SELECT
USING (true);

-- Authenticated users can add new foods
CREATE POLICY "Authenticated users can add foods"
ON public.foods FOR INSERT
TO authenticated
WITH CHECK (true);

-- Insert initial food database
INSERT INTO public.foods (name, category, calories_per_100g, protein_per_100g, carbs_per_100g, fats_per_100g, fiber_per_100g) VALUES
-- Proteins
('Chicken Breast', 'proteins', 165, 31, 0, 3.6, 0),
('Salmon', 'proteins', 208, 20, 0, 13, 0),
('Beef Steak', 'proteins', 271, 26, 0, 18, 0),
('Eggs', 'proteins', 155, 13, 1.1, 11, 0),
('Turkey Breast', 'proteins', 135, 30, 0, 1, 0),
('Tuna', 'proteins', 132, 28, 0, 1, 0),
('Pork Chop', 'proteins', 231, 25, 0, 14, 0),
('Shrimp', 'proteins', 99, 24, 0.2, 0.3, 0),
('Tofu', 'proteins', 76, 8, 1.9, 4.8, 0.3),
('Greek Yogurt', 'proteins', 59, 10, 3.6, 0.7, 0),
-- Grains
('White Rice', 'grains', 130, 2.7, 28, 0.3, 0.4),
('Brown Rice', 'grains', 112, 2.6, 23, 0.9, 1.8),
('Pasta', 'grains', 131, 5, 25, 1.1, 1.8),
('Bread (White)', 'grains', 265, 9, 49, 3.2, 2.7),
('Bread (Whole Wheat)', 'grains', 247, 13, 41, 3.4, 7),
('Oatmeal', 'grains', 68, 2.4, 12, 1.4, 1.7),
('Quinoa', 'grains', 120, 4.4, 21, 1.9, 2.8),
('Couscous', 'grains', 112, 3.8, 23, 0.2, 1.4),
('Barley', 'grains', 123, 2.3, 28, 0.4, 3.8),
('Bulgur', 'grains', 83, 3.1, 19, 0.2, 4.5),
-- Vegetables
('Broccoli', 'vegetables', 34, 2.8, 7, 0.4, 2.6),
('Spinach', 'vegetables', 23, 2.9, 3.6, 0.4, 2.2),
('Carrots', 'vegetables', 41, 0.9, 10, 0.2, 2.8),
('Bell Pepper', 'vegetables', 31, 1, 6, 0.3, 2.1),
('Tomatoes', 'vegetables', 18, 0.9, 3.9, 0.2, 1.2),
('Cucumber', 'vegetables', 16, 0.7, 3.6, 0.1, 0.5),
('Onion', 'vegetables', 40, 1.1, 9.3, 0.1, 1.7),
('Mushrooms', 'vegetables', 22, 3.1, 3.3, 0.3, 1),
('Zucchini', 'vegetables', 17, 1.2, 3.1, 0.3, 1),
('Cauliflower', 'vegetables', 25, 1.9, 5, 0.3, 2),
-- Fruits
('Apple', 'fruits', 52, 0.3, 14, 0.2, 2.4),
('Banana', 'fruits', 89, 1.1, 23, 0.3, 2.6),
('Orange', 'fruits', 47, 0.9, 12, 0.1, 2.4),
('Strawberries', 'fruits', 32, 0.7, 7.7, 0.3, 2),
('Blueberries', 'fruits', 57, 0.7, 14, 0.3, 2.4),
('Grapes', 'fruits', 69, 0.7, 18, 0.2, 0.9),
('Mango', 'fruits', 60, 0.8, 15, 0.4, 1.6),
('Pineapple', 'fruits', 50, 0.5, 13, 0.1, 1.4),
('Watermelon', 'fruits', 30, 0.6, 7.6, 0.2, 0.4),
('Avocado', 'fruits', 160, 2, 8.5, 15, 6.7),
-- Dairy
('Milk (Whole)', 'dairy', 61, 3.2, 4.8, 3.3, 0),
('Milk (Skim)', 'dairy', 34, 3.4, 5, 0.1, 0),
('Cheese (Cheddar)', 'dairy', 403, 25, 1.3, 33, 0),
('Cheese (Mozzarella)', 'dairy', 280, 28, 3.1, 17, 0),
('Butter', 'dairy', 717, 0.9, 0.1, 81, 0),
('Cottage Cheese', 'dairy', 98, 11, 3.4, 4.3, 0),
('Cream Cheese', 'dairy', 342, 6, 4.1, 34, 0),
('Yogurt (Plain)', 'dairy', 61, 3.5, 4.7, 3.3, 0),
-- Legumes
('Lentils', 'legumes', 116, 9, 20, 0.4, 7.9),
('Black Beans', 'legumes', 132, 8.9, 24, 0.5, 8.7),
('Chickpeas', 'legumes', 164, 8.9, 27, 2.6, 7.6),
('Kidney Beans', 'legumes', 127, 8.7, 23, 0.5, 6.4),
('Peanuts', 'legumes', 567, 26, 16, 49, 8.5),
('Almonds', 'legumes', 579, 21, 22, 50, 12.5),
-- Snacks
('Potato Chips', 'snacks', 536, 7, 53, 35, 4.8),
('Chocolate (Dark)', 'snacks', 598, 7.8, 46, 43, 11),
('Popcorn', 'snacks', 387, 13, 78, 4.5, 15),
('Crackers', 'snacks', 502, 10, 61, 26, 2.9),
('Granola Bar', 'snacks', 471, 10, 64, 20, 4),
-- Beverages
('Orange Juice', 'beverages', 45, 0.7, 10, 0.2, 0.2),
('Apple Juice', 'beverages', 46, 0.1, 11, 0.1, 0.2),
('Coconut Water', 'beverages', 19, 0.7, 3.7, 0.2, 1.1),
('Soda', 'beverages', 41, 0, 10.6, 0, 0),
('Coffee (Black)', 'beverages', 2, 0.3, 0, 0, 0),
('Tea (Unsweetened)', 'beverages', 1, 0, 0.3, 0, 0);