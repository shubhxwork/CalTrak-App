import React, { useState, useEffect } from 'react';
import { CalculationResults, UserInputs } from '../types';
import { INDIAN_FOODS, IndianFood, getSmartPairings } from '../data/indianFoods';
import { HudCard } from './ui/HudCard';
import { MetricRow } from './ui/MetricRow';

interface DietMakerProps {
  results: CalculationResults;
  inputs: UserInputs;
  onClose: () => void;
}

interface MealItem {
  food: IndianFood | CustomFood;
  quantity: number; // multiplier of serving size
  totalMacros: {
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
    fiber: number;
  };
  isCustom?: boolean;
}

interface CustomFood {
  id: string;
  name: string;
  brand?: string;
  category: 'custom';
  macros: {
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
    fiber: number;
  };
  servingSize: string;
  servingWeight: number;
  tags: string[];
  region: string[];
  mealType: ('breakfast' | 'lunch' | 'dinner' | 'snack')[];
  taste: string[];
  pairsWith: string[];
}

interface DayMeal {
  breakfast: MealItem[];
  lunch: MealItem[];
  dinner: MealItem[];
  snacks: MealItem[];
}

export const DietMaker: React.FC<DietMakerProps> = ({ results, inputs, onClose }) => {
  const [selectedMeal, setSelectedMeal] = useState<'breakfast' | 'lunch' | 'dinner' | 'snacks'>('breakfast');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [dayMeal, setDayMeal] = useState<DayMeal>({
    breakfast: [],
    lunch: [],
    dinner: [],
    snacks: []
  });
  const [showPairings, setShowPairings] = useState<string | null>(null);
  const [showCustomLogger, setShowCustomLogger] = useState(false);
  const [customFoods, setCustomFoods] = useState<CustomFood[]>([]);
  
  // Custom food form state
  const [customFoodForm, setCustomFoodForm] = useState({
    name: '',
    brand: '',
    servingSize: '',
    servingWeight: '',
    calories: '',
    protein: '',
    carbs: '',
    fat: '',
    fiber: ''
  });

  // Calculate total macros for the day
  const totalDayMacros = React.useMemo(() => {
    const allItems = [...dayMeal.breakfast, ...dayMeal.lunch, ...dayMeal.dinner, ...dayMeal.snacks];
    return allItems.reduce((total, item) => ({
      calories: total.calories + item.totalMacros.calories,
      protein: total.protein + item.totalMacros.protein,
      carbs: total.carbs + item.totalMacros.carbs,
      fat: total.fat + item.totalMacros.fat,
      fiber: total.fiber + item.totalMacros.fiber
    }), { calories: 0, protein: 0, carbs: 0, fat: 0, fiber: 0 });
  }, [dayMeal]);

  // Filter foods based on search and category
  const filteredFoods = React.useMemo(() => {
    const allFoods = [...INDIAN_FOODS, ...customFoods];
    return allFoods.filter(food => {
      const matchesSearch = food.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           food.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase())) ||
                           (food.category === 'custom' && (food as CustomFood).brand?.toLowerCase().includes(searchTerm.toLowerCase()));
      const matchesCategory = selectedCategory === 'all' || food.category === selectedCategory;
      const matchesMealType = selectedCategory === 'custom' || food.mealType.includes(selectedMeal);
      
      return matchesSearch && matchesCategory && matchesMealType;
    });
  }, [searchTerm, selectedCategory, selectedMeal, customFoods]);

  // Add custom food
  const addCustomFood = () => {
    if (!customFoodForm.name || !customFoodForm.calories) {
      alert('Please fill in at least the food name and calories');
      return;
    }

    const customFood: CustomFood = {
      id: `custom_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      name: customFoodForm.name,
      brand: customFoodForm.brand || undefined,
      category: 'custom',
      macros: {
        calories: parseFloat(customFoodForm.calories) || 0,
        protein: parseFloat(customFoodForm.protein) || 0,
        carbs: parseFloat(customFoodForm.carbs) || 0,
        fat: parseFloat(customFoodForm.fat) || 0,
        fiber: parseFloat(customFoodForm.fiber) || 0
      },
      servingSize: customFoodForm.servingSize || '1 serving',
      servingWeight: parseFloat(customFoodForm.servingWeight) || 100,
      tags: ['custom', customFoodForm.brand ? 'branded' : 'homemade'],
      region: ['custom'],
      mealType: ['breakfast', 'lunch', 'dinner', 'snack'],
      taste: ['custom'],
      pairsWith: []
    };

    setCustomFoods(prev => [...prev, customFood]);
    
    // Reset form
    setCustomFoodForm({
      name: '',
      brand: '',
      servingSize: '',
      servingWeight: '',
      calories: '',
      protein: '',
      carbs: '',
      fat: '',
      fiber: ''
    });
    
    setShowCustomLogger(false);
    
    // Auto-add to current meal
    addFoodToMeal(customFood);
  };

  // Add food to meal (updated to handle custom foods)
  const addFoodToMeal = (food: IndianFood | CustomFood, quantity: number = 1) => {
    const mealItem: MealItem = {
      food,
      quantity,
      isCustom: food.category === 'custom',
      totalMacros: {
        calories: Math.round(food.macros.calories * quantity),
        protein: Math.round(food.macros.protein * quantity * 10) / 10,
        carbs: Math.round(food.macros.carbs * quantity * 10) / 10,
        fat: Math.round(food.macros.fat * quantity * 10) / 10,
        fiber: Math.round(food.macros.fiber * quantity * 10) / 10
      }
    };

    setDayMeal(prev => ({
      ...prev,
      [selectedMeal]: [...prev[selectedMeal], mealItem]
    }));
  };

  // Remove food from meal
  const removeFoodFromMeal = (mealType: keyof DayMeal, index: number) => {
    setDayMeal(prev => ({
      ...prev,
      [mealType]: prev[mealType].filter((_, i) => i !== index)
    }));
  };

  // Update quantity
  const updateQuantity = (mealType: keyof DayMeal, index: number, newQuantity: number) => {
    if (newQuantity <= 0) {
      removeFoodFromMeal(mealType, index);
      return;
    }

    setDayMeal(prev => {
      const updatedMeal = [...prev[mealType]];
      const item = updatedMeal[index];
      updatedMeal[index] = {
        ...item,
        quantity: newQuantity,
        totalMacros: {
          calories: Math.round(item.food.macros.calories * newQuantity),
          protein: Math.round(item.food.macros.protein * newQuantity * 10) / 10,
          carbs: Math.round(item.food.macros.carbs * newQuantity * 10) / 10,
          fat: Math.round(item.food.macros.fat * newQuantity * 10) / 10,
          fiber: Math.round(item.food.macros.fiber * newQuantity * 10) / 10
        }
      };
      
      return {
        ...prev,
        [mealType]: updatedMeal
      };
    });
  };

  // Get macro percentages
  const getMacroPercentages = () => {
    const totalCals = totalDayMacros.calories || 1;
    return {
      protein: Math.round((totalDayMacros.protein * 4 / totalCals) * 100),
      carbs: Math.round((totalDayMacros.carbs * 4 / totalCals) * 100),
      fat: Math.round((totalDayMacros.fat * 9 / totalCals) * 100)
    };
  };

  const macroPercentages = getMacroPercentages();

  return (
    <div className="fixed inset-0 z-[200] bg-black/95 backdrop-blur-xl flex items-center justify-center p-4">
      <div className="w-full max-w-7xl max-h-[90vh] overflow-y-auto bg-zinc-900 rounded-2xl border border-zinc-800">
        {/* Header */}
        <div className="sticky top-0 bg-zinc-900 border-b border-zinc-800 p-6 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-robust italic text-white uppercase">🍽️ Diet Maker</h2>
            <p className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest">
              Create Your Perfect Indian Meal Plan
            </p>
          </div>
          <button 
            onClick={onClose}
            className="w-10 h-10 rounded-full bg-zinc-800 hover:bg-zinc-700 flex items-center justify-center transition-colors"
          >
            <i className="fa-solid fa-times text-white text-sm"></i>
          </button>
        </div>

        <div className="p-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Panel - Food Selection */}
          <div className="lg:col-span-2 space-y-6">
            {/* Meal Type Selector */}
            <div className="flex gap-2 flex-wrap">
              {(['breakfast', 'lunch', 'dinner', 'snacks'] as const).map((meal) => (
                <button
                  key={meal}
                  onClick={() => setSelectedMeal(meal)}
                  className={`px-4 py-2 rounded-full text-xs font-black uppercase tracking-widest transition-all ${
                    selectedMeal === meal 
                      ? 'bg-[#FC4C02] text-black' 
                      : 'bg-zinc-800 text-zinc-400 hover:text-white'
                  }`}
                >
                  <i className={`fa-solid ${
                    meal === 'breakfast' ? 'fa-sun' :
                    meal === 'lunch' ? 'fa-utensils' :
                    meal === 'dinner' ? 'fa-moon' : 'fa-cookie-bite'
                  } mr-2`}></i>
                  {meal}
                </button>
              ))}
            </div>

            {/* Search and Filter */}
            <div className="flex gap-4">
              <div className="flex-1">
                <input
                  type="text"
                  placeholder="Search Indian foods..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full bg-zinc-800 border border-zinc-700 rounded-lg p-3 text-white placeholder-zinc-500 focus:border-[#FC4C02] focus:outline-none"
                />
              </div>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="bg-zinc-800 border border-zinc-700 rounded-lg p-3 text-white focus:border-[#FC4C02] focus:outline-none"
              >
                <option value="all">All Categories</option>
                <option value="grains">Grains & Cereals</option>
                <option value="proteins">Proteins</option>
                <option value="vegetables">Vegetables</option>
                <option value="dairy">Dairy</option>
                <option value="fruits">Fruits</option>
                <option value="snacks">Snacks</option>
                <option value="beverages">Beverages</option>
                <option value="legumes">Legumes</option>
                <option value="custom">Custom Foods</option>
              </select>
              <button
                onClick={() => setShowCustomLogger(true)}
                className="px-4 py-3 bg-green-600 text-white rounded-lg font-black text-xs uppercase tracking-widest hover:bg-green-700 transition-all"
                title="Add Custom Food"
              >
                <i className="fa-solid fa-plus mr-2"></i>
                Custom Food
              </button>
            </div>

            {/* Food Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-96 overflow-y-auto">
              {filteredFoods.map((food) => (
                <HudCard key={food.id} className={`p-4 hover:border-[#FC4C02]/40 transition-all ${food.category === 'custom' ? 'border-green-500/30' : ''}`}>
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="text-white font-bold text-sm">{food.name}</h4>
                        {food.category === 'custom' && (
                          <span className="text-[8px] bg-green-600 text-white px-1 py-0.5 rounded uppercase font-bold">
                            CUSTOM
                          </span>
                        )}
                      </div>
                      {food.category === 'custom' && (food as CustomFood).brand && (
                        <p className="text-xs text-green-400 font-bold">{(food as CustomFood).brand}</p>
                      )}
                      <p className="text-xs text-zinc-500">{food.servingSize} ({food.servingWeight}g)</p>
                      <div className="flex gap-1 mt-1">
                        {food.tags.slice(0, 2).map(tag => (
                          <span key={tag} className={`text-[8px] px-1 py-0.5 rounded uppercase ${
                            food.category === 'custom' ? 'bg-green-800 text-green-300' : 'bg-zinc-800 text-zinc-400'
                          }`}>
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-[#FC4C02] font-bold">{food.macros.calories} cal</div>
                      <div className="text-[10px] text-zinc-500">
                        P:{food.macros.protein}g C:{food.macros.carbs}g F:{food.macros.fat}g
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex gap-2">
                    <button
                      onClick={() => addFoodToMeal(food)}
                      className="flex-1 py-2 bg-[#FC4C02] text-black rounded font-black text-xs uppercase tracking-widest hover:bg-[#FC4C02]/80 transition-all"
                    >
                      <i className="fa-solid fa-plus mr-1"></i>
                      Add
                    </button>
                    {food.category !== 'custom' && (
                      <button
                        onClick={() => setShowPairings(showPairings === food.id ? null : food.id)}
                        className="px-3 py-2 bg-zinc-700 text-zinc-300 rounded text-xs hover:bg-zinc-600 transition-all"
                        title="Smart Pairings"
                      >
                        <i className="fa-solid fa-lightbulb"></i>
                      </button>
                    )}
                    {food.category === 'custom' && (
                      <button
                        onClick={() => {
                          setCustomFoods(prev => prev.filter(f => f.id !== food.id));
                        }}
                        className="px-3 py-2 bg-red-600 text-white rounded text-xs hover:bg-red-700 transition-all"
                        title="Delete Custom Food"
                      >
                        <i className="fa-solid fa-trash"></i>
                      </button>
                    )}
                  </div>

                  {/* Smart Pairings (only for non-custom foods) */}
                  {showPairings === food.id && food.category !== 'custom' && (
                    <div className="mt-3 p-3 bg-zinc-800 rounded border-l-4 border-[#FC4C02]">
                      <h5 className="text-xs font-bold text-white mb-2">
                        <i className="fa-solid fa-magic-wand-sparkles mr-1 text-[#FC4C02]"></i>
                        Perfect Pairings
                      </h5>
                      <div className="space-y-1">
                        {getSmartPairings(food.id, { protein: results.proteinG, carbs: results.carbsG, fat: results.fatG }).slice(0, 3).map(pairing => (
                          <button
                            key={pairing.id}
                            onClick={() => addFoodToMeal(pairing)}
                            className="block w-full text-left text-xs text-zinc-300 hover:text-[#FC4C02] transition-colors"
                          >
                            + {pairing.name} ({pairing.macros.calories} cal)
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </HudCard>
              ))}
            </div>
          </div>

          {/* Right Panel - Meal Plan & Macros */}
          <div className="space-y-6">
            {/* Target vs Current Macros */}
            <HudCard label="Macro Tracking">
              <div className="space-y-4">
                <div className="text-center">
                  <div className="text-3xl font-robust italic text-white">
                    {totalDayMacros.calories}
                    <span className="text-sm text-zinc-500 ml-1">/ {results.calories} KCAL</span>
                  </div>
                  <div className="w-full bg-zinc-800 rounded-full h-2 mt-2">
                    <div 
                      className="bg-[#FC4C02] h-2 rounded-full transition-all"
                      style={{ width: `${Math.min((totalDayMacros.calories / results.calories) * 100, 100)}%` }}
                    ></div>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4 text-center">
                  <div>
                    <div className="text-lg font-bold text-white">{totalDayMacros.protein}g</div>
                    <div className="text-xs text-zinc-500">Protein ({macroPercentages.protein}%)</div>
                    <div className="text-xs text-[#FC4C02]">Target: {results.proteinG}g</div>
                  </div>
                  <div>
                    <div className="text-lg font-bold text-white">{totalDayMacros.carbs}g</div>
                    <div className="text-xs text-zinc-500">Carbs ({macroPercentages.carbs}%)</div>
                    <div className="text-xs text-[#FC4C02]">Target: {results.carbsG}g</div>
                  </div>
                  <div>
                    <div className="text-lg font-bold text-white">{totalDayMacros.fat}g</div>
                    <div className="text-xs text-zinc-500">Fat ({macroPercentages.fat}%)</div>
                    <div className="text-xs text-[#FC4C02]">Target: {results.fatG}g</div>
                  </div>
                </div>
              </div>
            </HudCard>

            {/* Meal Plan */}
            {(['breakfast', 'lunch', 'dinner', 'snacks'] as const).map((mealType) => (
              <HudCard key={mealType} label={`${mealType.charAt(0).toUpperCase() + mealType.slice(1)} Plan`}>
                <div className="space-y-3">
                  {dayMeal[mealType].length === 0 ? (
                    <p className="text-zinc-500 text-sm text-center py-4">
                      No items added yet
                    </p>
                  ) : (
                    dayMeal[mealType].map((item, index) => (
                      <div key={index} className={`bg-zinc-800 p-3 rounded border-l-4 ${item.isCustom ? 'border-green-500' : 'border-[#FC4C02]'}`}>
                        <div className="flex justify-between items-start mb-2">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <h5 className="text-white font-bold text-sm">{item.food.name}</h5>
                              {item.isCustom && (
                                <span className="text-[8px] bg-green-600 text-white px-1 py-0.5 rounded uppercase font-bold">
                                  CUSTOM
                                </span>
                              )}
                            </div>
                            {item.isCustom && (item.food as CustomFood).brand && (
                              <p className="text-xs text-green-400 font-bold">{(item.food as CustomFood).brand}</p>
                            )}
                            <p className="text-xs text-zinc-500">
                              {item.food.servingSize} × {item.quantity}
                            </p>
                          </div>
                          <button
                            onClick={() => removeFoodFromMeal(mealType, index)}
                            className="text-red-400 hover:text-red-300 text-xs"
                          >
                            <i className="fa-solid fa-trash"></i>
                          </button>
                        </div>
                        
                        <div className="flex items-center gap-3 mb-2">
                          <label className="text-xs text-zinc-500">Quantity:</label>
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => updateQuantity(mealType, index, item.quantity - 0.5)}
                              className="w-6 h-6 bg-zinc-700 text-white rounded text-xs hover:bg-zinc-600"
                            >
                              -
                            </button>
                            <span className="text-white font-bold min-w-[2rem] text-center">
                              {item.quantity}
                            </span>
                            <button
                              onClick={() => updateQuantity(mealType, index, item.quantity + 0.5)}
                              className="w-6 h-6 bg-zinc-700 text-white rounded text-xs hover:bg-zinc-600"
                            >
                              +
                            </button>
                          </div>
                        </div>

                        <div className="text-xs text-zinc-400">
                          {item.totalMacros.calories} cal • 
                          P: {item.totalMacros.protein}g • 
                          C: {item.totalMacros.carbs}g • 
                          F: {item.totalMacros.fat}g
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </HudCard>
            ))}

            {/* Export Diet Plan */}
            <button
              onClick={() => {
                const dietPlan = {
                  user: inputs.name,
                  targetCalories: results.calories,
                  targetMacros: {
                    protein: results.proteinG,
                    carbs: results.carbsG,
                    fat: results.fatG
                  },
                  actualMacros: totalDayMacros,
                  meals: dayMeal,
                  createdAt: new Date().toISOString()
                };
                
                const blob = new Blob([JSON.stringify(dietPlan, null, 2)], { type: 'application/json' });
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `${inputs.name}-diet-plan-${new Date().toISOString().split('T')[0]}.json`;
                a.click();
                URL.revokeObjectURL(url);
              }}
              className="w-full py-3 bg-green-600 text-white rounded-full font-black text-xs uppercase tracking-widest hover:bg-green-700 transition-all"
            >
              <i className="fa-solid fa-download mr-2"></i>
              Export Diet Plan
            </button>
          </div>
        </div>

        {/* Custom Food Logger Modal */}
        {showCustomLogger && (
          <div className="fixed inset-0 z-[300] bg-black/95 backdrop-blur-xl flex items-center justify-center p-4">
            <div className="w-full max-w-md bg-zinc-900 rounded-2xl border border-zinc-800">
              {/* Header */}
              <div className="bg-gradient-to-r from-green-600 to-green-500 p-6 text-center">
                <div className="w-16 h-16 mx-auto mb-4 bg-black/20 rounded-full flex items-center justify-center">
                  <i className="fa-solid fa-plus text-2xl text-white"></i>
                </div>
                <h3 className="text-2xl font-robust italic text-black uppercase mb-2">Add Custom Food</h3>
                <p className="text-sm text-black/80">Log your own branded or homemade foods</p>
              </div>

              {/* Form */}
              <div className="p-6 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-mono text-zinc-400 uppercase tracking-widest mb-2">
                      Food Name *
                    </label>
                    <input
                      type="text"
                      value={customFoodForm.name}
                      onChange={(e) => setCustomFoodForm(prev => ({ ...prev, name: e.target.value }))}
                      placeholder="e.g., Protein Bar"
                      className="w-full bg-zinc-800 border border-zinc-700 rounded-lg p-3 text-white placeholder-zinc-500 focus:border-green-500 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-mono text-zinc-400 uppercase tracking-widest mb-2">
                      Brand (Optional)
                    </label>
                    <input
                      type="text"
                      value={customFoodForm.brand}
                      onChange={(e) => setCustomFoodForm(prev => ({ ...prev, brand: e.target.value }))}
                      placeholder="e.g., MyProtein"
                      className="w-full bg-zinc-800 border border-zinc-700 rounded-lg p-3 text-white placeholder-zinc-500 focus:border-green-500 focus:outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-mono text-zinc-400 uppercase tracking-widest mb-2">
                      Serving Size
                    </label>
                    <input
                      type="text"
                      value={customFoodForm.servingSize}
                      onChange={(e) => setCustomFoodForm(prev => ({ ...prev, servingSize: e.target.value }))}
                      placeholder="e.g., 1 bar, 100g"
                      className="w-full bg-zinc-800 border border-zinc-700 rounded-lg p-3 text-white placeholder-zinc-500 focus:border-green-500 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-mono text-zinc-400 uppercase tracking-widest mb-2">
                      Weight (grams)
                    </label>
                    <input
                      type="number"
                      value={customFoodForm.servingWeight}
                      onChange={(e) => setCustomFoodForm(prev => ({ ...prev, servingWeight: e.target.value }))}
                      placeholder="100"
                      className="w-full bg-zinc-800 border border-zinc-700 rounded-lg p-3 text-white placeholder-zinc-500 focus:border-green-500 focus:outline-none"
                    />
                  </div>
                </div>

                <div className="bg-zinc-800 p-4 rounded-lg">
                  <h4 className="text-sm font-bold text-white mb-3">Nutrition Facts (per serving)</h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs text-zinc-400 mb-1">Calories *</label>
                      <input
                        type="number"
                        value={customFoodForm.calories}
                        onChange={(e) => setCustomFoodForm(prev => ({ ...prev, calories: e.target.value }))}
                        placeholder="250"
                        className="w-full bg-zinc-700 border border-zinc-600 rounded p-2 text-white placeholder-zinc-500 focus:border-green-500 focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-zinc-400 mb-1">Protein (g)</label>
                      <input
                        type="number"
                        step="0.1"
                        value={customFoodForm.protein}
                        onChange={(e) => setCustomFoodForm(prev => ({ ...prev, protein: e.target.value }))}
                        placeholder="20"
                        className="w-full bg-zinc-700 border border-zinc-600 rounded p-2 text-white placeholder-zinc-500 focus:border-green-500 focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-zinc-400 mb-1">Carbs (g)</label>
                      <input
                        type="number"
                        step="0.1"
                        value={customFoodForm.carbs}
                        onChange={(e) => setCustomFoodForm(prev => ({ ...prev, carbs: e.target.value }))}
                        placeholder="30"
                        className="w-full bg-zinc-700 border border-zinc-600 rounded p-2 text-white placeholder-zinc-500 focus:border-green-500 focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-zinc-400 mb-1">Fat (g)</label>
                      <input
                        type="number"
                        step="0.1"
                        value={customFoodForm.fat}
                        onChange={(e) => setCustomFoodForm(prev => ({ ...prev, fat: e.target.value }))}
                        placeholder="8"
                        className="w-full bg-zinc-700 border border-zinc-600 rounded p-2 text-white placeholder-zinc-500 focus:border-green-500 focus:outline-none"
                      />
                    </div>
                    <div className="col-span-2">
                      <label className="block text-xs text-zinc-400 mb-1">Fiber (g)</label>
                      <input
                        type="number"
                        step="0.1"
                        value={customFoodForm.fiber}
                        onChange={(e) => setCustomFoodForm(prev => ({ ...prev, fiber: e.target.value }))}
                        placeholder="3"
                        className="w-full bg-zinc-700 border border-zinc-600 rounded p-2 text-white placeholder-zinc-500 focus:border-green-500 focus:outline-none"
                      />
                    </div>
                  </div>
                </div>

                <div className="text-xs text-zinc-500 bg-zinc-800 p-3 rounded">
                  <i className="fa-solid fa-info-circle mr-1 text-green-500"></i>
                  <strong>Tip:</strong> Check the nutrition label on your food packaging for accurate values. 
                  You can find this info on apps like MyFitnessPal or food brand websites.
                </div>

                {/* Buttons */}
                <div className="flex gap-4 pt-4">
                  <button
                    onClick={() => setShowCustomLogger(false)}
                    className="flex-1 py-3 bg-zinc-800 text-zinc-400 rounded-full font-black text-xs uppercase tracking-widest hover:text-white transition-all"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={addCustomFood}
                    disabled={!customFoodForm.name || !customFoodForm.calories}
                    className="flex-1 py-3 bg-green-600 text-white rounded-full font-black text-xs uppercase tracking-widest hover:bg-green-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <i className="fa-solid fa-plus mr-2"></i>
                    Add Food
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default DietMaker;