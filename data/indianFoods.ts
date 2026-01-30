export interface IndianFood {
  id: string;
  name: string;
  category: 'grains' | 'proteins' | 'vegetables' | 'dairy' | 'fruits' | 'snacks' | 'beverages' | 'oils' | 'legumes' | 'spices';
  macros: {
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
    fiber: number;
  };
  servingSize: string;
  servingWeight: number; // in grams
  tags: string[];
  region: string[];
  mealType: ('breakfast' | 'lunch' | 'dinner' | 'snack')[];
  taste: ('sweet' | 'spicy' | 'tangy' | 'bitter' | 'salty' | 'mild')[];
  pairsWith: string[]; // IDs of foods that pair well
}

export const INDIAN_FOODS: IndianFood[] = [
  // GRAINS & CEREALS
  {
    id: 'basmati_rice',
    name: 'Basmati Rice (Cooked)',
    category: 'grains',
    macros: { calories: 130, protein: 2.7, carbs: 28, fat: 0.3, fiber: 0.4 },
    servingSize: '1 cup',
    servingWeight: 158,
    tags: ['staple', 'gluten-free'],
    region: ['north', 'south', 'west', 'east'],
    mealType: ['lunch', 'dinner'],
    taste: ['mild'],
    pairsWith: ['dal_tadka', 'chicken_curry', 'rajma', 'chole', 'paneer_butter_masala']
  },
  {
    id: 'brown_rice',
    name: 'Brown Rice (Cooked)',
    category: 'grains',
    macros: { calories: 112, protein: 2.3, carbs: 23, fat: 0.9, fiber: 1.8 },
    servingSize: '1 cup',
    servingWeight: 195,
    tags: ['whole-grain', 'healthy'],
    region: ['south'],
    mealType: ['lunch', 'dinner'],
    taste: ['mild'],
    pairsWith: ['sambar', 'rasam', 'vegetable_curry']
  },
  {
    id: 'wheat_roti',
    name: 'Wheat Roti',
    category: 'grains',
    macros: { calories: 71, protein: 3, carbs: 15, fat: 0.4, fiber: 2.7 },
    servingSize: '1 medium roti',
    servingWeight: 28,
    tags: ['staple', 'whole-grain'],
    region: ['north', 'west'],
    mealType: ['lunch', 'dinner'],
    taste: ['mild'],
    pairsWith: ['dal_tadka', 'sabzi', 'chicken_curry', 'paneer_curry']
  },
  {
    id: 'naan',
    name: 'Naan',
    category: 'grains',
    macros: { calories: 262, protein: 9, carbs: 45, fat: 5, fiber: 2 },
    servingSize: '1 medium naan',
    servingWeight: 90,
    tags: ['restaurant-style'],
    region: ['north'],
    mealType: ['lunch', 'dinner'],
    taste: ['mild'],
    pairsWith: ['paneer_butter_masala', 'chicken_tikka_masala', 'dal_makhani']
  },
  {
    id: 'poha',
    name: 'Poha (Flattened Rice)',
    category: 'grains',
    macros: { calories: 158, protein: 3, carbs: 32, fat: 2, fiber: 2 },
    servingSize: '1 cup',
    servingWeight: 100,
    tags: ['breakfast', 'light'],
    region: ['west', 'central'],
    mealType: ['breakfast', 'snack'],
    taste: ['mild', 'tangy'],
    pairsWith: ['chai', 'coconut_chutney']
  },
  {
    id: 'upma',
    name: 'Upma (Semolina)',
    category: 'grains',
    macros: { calories: 207, protein: 6, carbs: 40, fat: 3, fiber: 2.5 },
    servingSize: '1 cup',
    servingWeight: 150,
    tags: ['breakfast', 'south-indian'],
    region: ['south'],
    mealType: ['breakfast'],
    taste: ['mild', 'spicy'],
    pairsWith: ['coconut_chutney', 'sambar', 'chai']
  },

  // PROTEINS
  {
    id: 'dal_tadka',
    name: 'Dal Tadka (Yellow Lentils)',
    category: 'proteins',
    macros: { calories: 104, protein: 8, carbs: 17, fat: 1, fiber: 8 },
    servingSize: '1 cup',
    servingWeight: 200,
    tags: ['vegetarian', 'protein-rich'],
    region: ['north', 'west'],
    mealType: ['lunch', 'dinner'],
    taste: ['spicy', 'tangy'],
    pairsWith: ['basmati_rice', 'wheat_roti', 'jeera_rice']
  },
  {
    id: 'rajma',
    name: 'Rajma (Kidney Beans Curry)',
    category: 'proteins',
    macros: { calories: 127, protein: 8.7, carbs: 22.8, fat: 0.5, fiber: 6.4 },
    servingSize: '1 cup',
    servingWeight: 177,
    tags: ['vegetarian', 'protein-rich', 'north-indian'],
    region: ['north'],
    mealType: ['lunch', 'dinner'],
    taste: ['spicy'],
    pairsWith: ['basmati_rice', 'wheat_roti']
  },
  {
    id: 'chole',
    name: 'Chole (Chickpea Curry)',
    category: 'proteins',
    macros: { calories: 134, protein: 7.3, carbs: 22.5, fat: 2.1, fiber: 6.2 },
    servingSize: '1 cup',
    servingWeight: 164,
    tags: ['vegetarian', 'protein-rich'],
    region: ['north', 'west'],
    mealType: ['lunch', 'dinner'],
    taste: ['spicy', 'tangy'],
    pairsWith: ['bhature', 'wheat_roti', 'basmati_rice']
  },
  {
    id: 'chicken_curry',
    name: 'Chicken Curry (Home Style)',
    category: 'proteins',
    macros: { calories: 217, protein: 19, carbs: 5, fat: 13, fiber: 1 },
    servingSize: '1 cup',
    servingWeight: 150,
    tags: ['non-vegetarian', 'protein-rich'],
    region: ['north', 'south', 'east', 'west'],
    mealType: ['lunch', 'dinner'],
    taste: ['spicy'],
    pairsWith: ['basmati_rice', 'wheat_roti', 'naan']
  },
  {
    id: 'paneer_butter_masala',
    name: 'Paneer Butter Masala',
    category: 'proteins',
    macros: { calories: 292, protein: 14, carbs: 9, fat: 23, fiber: 2 },
    servingSize: '1 cup',
    servingWeight: 200,
    tags: ['vegetarian', 'rich', 'restaurant-style'],
    region: ['north'],
    mealType: ['lunch', 'dinner'],
    taste: ['mild', 'sweet'],
    pairsWith: ['naan', 'basmati_rice', 'jeera_rice']
  },
  {
    id: 'fish_curry',
    name: 'Fish Curry (Bengali Style)',
    category: 'proteins',
    macros: { calories: 158, protein: 22, carbs: 4, fat: 6, fiber: 1 },
    servingSize: '1 cup',
    servingWeight: 150,
    tags: ['non-vegetarian', 'bengali'],
    region: ['east', 'south'],
    mealType: ['lunch', 'dinner'],
    taste: ['spicy', 'tangy'],
    pairsWith: ['basmati_rice', 'brown_rice']
  },

  // VEGETABLES
  {
    id: 'mixed_vegetable_curry',
    name: 'Mixed Vegetable Curry',
    category: 'vegetables',
    macros: { calories: 76, protein: 3, carbs: 12, fat: 2.5, fiber: 4 },
    servingSize: '1 cup',
    servingWeight: 150,
    tags: ['vegetarian', 'healthy'],
    region: ['north', 'south', 'east', 'west'],
    mealType: ['lunch', 'dinner'],
    taste: ['spicy', 'mild'],
    pairsWith: ['wheat_roti', 'basmati_rice', 'dal_tadka']
  },
  {
    id: 'palak_paneer',
    name: 'Palak Paneer (Spinach with Cottage Cheese)',
    category: 'vegetables',
    macros: { calories: 167, protein: 11, carbs: 6, fat: 12, fiber: 3 },
    servingSize: '1 cup',
    servingWeight: 200,
    tags: ['vegetarian', 'iron-rich'],
    region: ['north'],
    mealType: ['lunch', 'dinner'],
    taste: ['mild'],
    pairsWith: ['wheat_roti', 'naan', 'jeera_rice']
  },
  {
    id: 'aloo_gobi',
    name: 'Aloo Gobi (Potato Cauliflower)',
    category: 'vegetables',
    macros: { calories: 115, protein: 3, carbs: 18, fat: 4, fiber: 4 },
    servingSize: '1 cup',
    servingWeight: 150,
    tags: ['vegetarian', 'comfort-food'],
    region: ['north', 'west'],
    mealType: ['lunch', 'dinner'],
    taste: ['spicy', 'mild'],
    pairsWith: ['wheat_roti', 'paratha']
  },

  // DAIRY
  {
    id: 'plain_yogurt',
    name: 'Plain Yogurt (Dahi)',
    category: 'dairy',
    macros: { calories: 59, protein: 3.5, carbs: 4.7, fat: 3.3, fiber: 0 },
    servingSize: '100g',
    servingWeight: 100,
    tags: ['probiotic', 'cooling'],
    region: ['north', 'south', 'east', 'west'],
    mealType: ['lunch', 'dinner', 'snack'],
    taste: ['tangy', 'mild'],
    pairsWith: ['biryani', 'spicy_curry', 'paratha']
  },
  {
    id: 'lassi',
    name: 'Sweet Lassi',
    category: 'dairy',
    macros: { calories: 108, protein: 2.9, carbs: 17, fat: 3.5, fiber: 0 },
    servingSize: '1 glass',
    servingWeight: 200,
    tags: ['beverage', 'cooling'],
    region: ['north', 'west'],
    mealType: ['snack'],
    taste: ['sweet'],
    pairsWith: ['spicy_food', 'paratha', 'chole_bhature']
  },

  // FRUITS
  {
    id: 'banana',
    name: 'Banana',
    category: 'fruits',
    macros: { calories: 89, protein: 1.1, carbs: 23, fat: 0.3, fiber: 2.6 },
    servingSize: '1 medium',
    servingWeight: 100,
    tags: ['natural', 'energy'],
    region: ['south', 'east', 'west'],
    mealType: ['breakfast', 'snack'],
    taste: ['sweet'],
    pairsWith: ['oats', 'milk', 'nuts']
  },
  {
    id: 'mango',
    name: 'Mango (Ripe)',
    category: 'fruits',
    macros: { calories: 60, protein: 0.8, carbs: 15, fat: 0.4, fiber: 1.6 },
    servingSize: '100g',
    servingWeight: 100,
    tags: ['seasonal', 'vitamin-c'],
    region: ['north', 'south', 'east', 'west'],
    mealType: ['snack', 'breakfast'],
    taste: ['sweet'],
    pairsWith: ['yogurt', 'milk', 'lassi']
  },

  // SNACKS
  {
    id: 'samosa',
    name: 'Samosa (1 piece)',
    category: 'snacks',
    macros: { calories: 308, protein: 5, carbs: 32, fat: 18, fiber: 3 },
    servingSize: '1 piece',
    servingWeight: 85,
    tags: ['fried', 'street-food'],
    region: ['north', 'west'],
    mealType: ['snack'],
    taste: ['spicy', 'salty'],
    pairsWith: ['mint_chutney', 'tamarind_chutney', 'chai']
  },
  {
    id: 'dhokla',
    name: 'Dhokla (2 pieces)',
    category: 'snacks',
    macros: { calories: 160, protein: 4, carbs: 27, fat: 4, fiber: 2 },
    servingSize: '2 pieces',
    servingWeight: 100,
    tags: ['steamed', 'gujarati'],
    region: ['west'],
    mealType: ['snack', 'breakfast'],
    taste: ['tangy', 'mild'],
    pairsWith: ['green_chutney', 'chai']
  },

  // BEVERAGES
  {
    id: 'chai',
    name: 'Masala Chai',
    category: 'beverages',
    macros: { calories: 60, protein: 1.6, carbs: 8, fat: 2.4, fiber: 0 },
    servingSize: '1 cup',
    servingWeight: 200,
    tags: ['beverage', 'energizing'],
    region: ['north', 'south', 'east', 'west'],
    mealType: ['breakfast', 'snack'],
    taste: ['spicy', 'sweet'],
    pairsWith: ['biscuits', 'samosa', 'dhokla', 'paratha']
  },
  {
    id: 'coconut_water',
    name: 'Coconut Water',
    category: 'beverages',
    macros: { calories: 46, protein: 1.7, carbs: 8.9, fat: 0.5, fiber: 2.6 },
    servingSize: '1 cup',
    servingWeight: 240,
    tags: ['natural', 'hydrating'],
    region: ['south', 'west'],
    mealType: ['snack'],
    taste: ['mild', 'sweet'],
    pairsWith: ['spicy_food', 'workout']
  },

  // OILS & FATS
  {
    id: 'ghee',
    name: 'Desi Ghee',
    category: 'oils',
    macros: { calories: 112, protein: 0, carbs: 0, fat: 12.8, fiber: 0 },
    servingSize: '1 tbsp',
    servingWeight: 13,
    tags: ['traditional', 'cooking-fat'],
    region: ['north', 'south', 'east', 'west'],
    mealType: ['lunch', 'dinner'],
    taste: ['mild'],
    pairsWith: ['dal', 'rice', 'roti', 'vegetables']
  },
  {
    id: 'mustard_oil',
    name: 'Mustard Oil',
    category: 'oils',
    macros: { calories: 124, protein: 0, carbs: 0, fat: 14, fiber: 0 },
    servingSize: '1 tbsp',
    servingWeight: 14,
    tags: ['cooking-oil', 'bengali'],
    region: ['east', 'north'],
    mealType: ['lunch', 'dinner'],
    taste: ['mild'],
    pairsWith: ['fish_curry', 'vegetables', 'dal']
  },

  // LEGUMES
  {
    id: 'moong_dal',
    name: 'Moong Dal (Yellow Lentils)',
    category: 'legumes',
    macros: { calories: 104, protein: 7, carbs: 19, fat: 0.4, fiber: 2 },
    servingSize: '1 cup cooked',
    servingWeight: 200,
    tags: ['protein-rich', 'easy-digest'],
    region: ['north', 'south', 'east', 'west'],
    mealType: ['lunch', 'dinner'],
    taste: ['mild'],
    pairsWith: ['rice', 'roti', 'vegetables']
  },
  {
    id: 'masoor_dal',
    name: 'Masoor Dal (Red Lentils)',
    category: 'legumes',
    macros: { calories: 116, protein: 9, carbs: 20, fat: 0.4, fiber: 8 },
    servingSize: '1 cup cooked',
    servingWeight: 198,
    tags: ['protein-rich', 'iron-rich'],
    region: ['north', 'east'],
    mealType: ['lunch', 'dinner'],
    taste: ['mild', 'spicy'],
    pairsWith: ['rice', 'roti']
  }
];

// Pairing recommendations based on taste, nutrition, and traditional combinations
export const MEAL_PAIRINGS = {
  // Protein + Carb combinations
  'high_protein_low_carb': ['dal_tadka', 'rajma', 'chole', 'chicken_curry', 'fish_curry'],
  'high_carb_low_protein': ['basmati_rice', 'brown_rice', 'wheat_roti', 'naan'],
  
  // Taste-based pairings
  'spicy_cooling': ['plain_yogurt', 'lassi', 'coconut_water'],
  'rich_light': ['mixed_vegetable_curry', 'dal_tadka'],
  
  // Regional combinations
  'north_indian_combo': ['wheat_roti', 'dal_tadka', 'mixed_vegetable_curry', 'plain_yogurt'],
  'south_indian_combo': ['brown_rice', 'sambar', 'coconut_chutney', 'vegetable_curry'],
  
  // Meal type combinations
  'breakfast_combo': ['poha', 'upma', 'chai', 'banana'],
  'lunch_combo': ['basmati_rice', 'dal_tadka', 'mixed_vegetable_curry', 'plain_yogurt'],
  'dinner_combo': ['wheat_roti', 'chicken_curry', 'mixed_vegetable_curry']
};

export const getSmartPairings = (selectedFoodId: string, targetMacros: { protein: number, carbs: number, fat: number }): IndianFood[] => {
  const selectedFood = INDIAN_FOODS.find(f => f.id === selectedFoodId);
  if (!selectedFood) return [];

  // Get foods that traditionally pair well
  const traditionalPairs = INDIAN_FOODS.filter(food => 
    selectedFood.pairsWith.includes(food.id) || food.pairsWith.includes(selectedFoodId)
  );

  // Get foods that complement nutritionally
  const nutritionalPairs = INDIAN_FOODS.filter(food => {
    if (food.id === selectedFoodId) return false;
    
    // If selected food is high protein, suggest carbs
    if (selectedFood.macros.protein > 15 && food.macros.carbs > 20) return true;
    
    // If selected food is high carb, suggest protein
    if (selectedFood.macros.carbs > 25 && food.macros.protein > 8) return true;
    
    // If selected food is spicy, suggest cooling foods
    if (selectedFood.taste.includes('spicy') && food.taste.includes('mild')) return true;
    
    return false;
  });

  // Combine and deduplicate
  const allPairs = [...traditionalPairs, ...nutritionalPairs];
  const uniquePairs = allPairs.filter((food, index, self) => 
    index === self.findIndex(f => f.id === food.id)
  );

  return uniquePairs.slice(0, 6); // Return top 6 recommendations
};