import React, { useState, useEffect } from 'react';
import { projectId } from '../utils/supabase/info';
import { toast } from 'sonner@2.0.3';
import { Calendar, RefreshCw, Utensils, Flame, Check } from 'lucide-react';
import { PrologInfo } from './PrologInfo';

interface MealPlannerProps {
  accessToken: string;
}

interface Meal {
  id: string;
  name: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  ingredients: string[];
}

interface DayMeals {
  day: number;
  breakfast: Meal;
  lunch: Meal;
  dinner: Meal;
}

export default function MealPlanner({ accessToken }: MealPlannerProps) {
  const [days, setDays] = useState(3);
  const [loading, setLoading] = useState(false);
  const [mealPlan, setMealPlan] = useState<DayMeals[]>([]);
  const [targetCalories, setTargetCalories] = useState(0);
  const [replacingMeal, setReplacingMeal] = useState<{ dayIndex: number; mealType: string } | null>(null);
  const [alternatives, setAlternatives] = useState<Meal[]>([]);

  const generateMealPlan = async () => {
    setLoading(true);

    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-3d05204c/generate-menu`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${accessToken}`,
          },
          body: JSON.stringify({ days }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        if (data.code === 'PROFILE_INCOMPLETE') {
          toast.error(data.error, {
            action: {
              label: 'Completar Perfil',
              onClick: () => {
                // This will be handled by parent navigation
              },
            },
          });
        } else if (data.code === 'TOO_RESTRICTIVE') {
          toast.error(data.error);
        } else {
          toast.error(data.error || 'Error al generar el menú');
        }
        setLoading(false);
        return;
      }

      setMealPlan(data.mealPlan);
      setTargetCalories(data.targetCalories);
      toast.success('Menú generado exitosamente');
    } catch (error) {
      console.error('Error generating meal plan:', error);
      toast.error('Error al generar el menú');
    } finally {
      setLoading(false);
    }
  };

  const handleReplaceMeal = async (dayIndex: number, mealType: string, currentMeal: Meal) => {
    setReplacingMeal({ dayIndex, mealType });

    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-3d05204c/replace-meal`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${accessToken}`,
          },
          body: JSON.stringify({
            dayIndex,
            mealType,
            currentCalories: currentMeal.calories,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        toast.error('Error al generar alternativas');
        setReplacingMeal(null);
        return;
      }

      setAlternatives(data.alternatives);
    } catch (error) {
      console.error('Error replacing meal:', error);
      toast.error('Error al generar alternativas');
      setReplacingMeal(null);
    }
  };

  const selectAlternative = (alternative: Meal) => {
    if (!replacingMeal) return;

    const updatedPlan = [...mealPlan];
    const dayMeals = updatedPlan[replacingMeal.dayIndex];
    
    if (replacingMeal.mealType === 'breakfast') {
      dayMeals.breakfast = alternative;
    } else if (replacingMeal.mealType === 'lunch') {
      dayMeals.lunch = alternative;
    } else if (replacingMeal.mealType === 'dinner') {
      dayMeals.dinner = alternative;
    }

    setMealPlan(updatedPlan);
    setReplacingMeal(null);
    setAlternatives([]);
    toast.success('Comida reemplazada exitosamente');
  };

  const cancelReplace = () => {
    setReplacingMeal(null);
    setAlternatives([]);
  };

  const getMealTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      breakfast: 'Desayuno',
      lunch: 'Comida',
      dinner: 'Cena'
    };
    return labels[type] || type;
  };

  const getDayName = (dayNum: number) => {
    const days = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'];
    return days[(dayNum - 1) % 7];
  };

  const renderMeal = (meal: Meal, dayIndex: number, mealType: string) => {
    const isReplacing = replacingMeal?.dayIndex === dayIndex && replacingMeal?.mealType === mealType;

    return (
      <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
        <div className="flex justify-between items-start mb-3">
          <div>
            <h3 className="mb-1">{getMealTypeLabel(mealType)}</h3>
            <p className="text-gray-900">{meal.name}</p>
          </div>
          <button
            onClick={() => handleReplaceMeal(dayIndex, mealType, meal)}
            disabled={isReplacing}
            className="p-2 text-emerald-600 hover:bg-emerald-50 rounded-lg transition disabled:opacity-50"
            title="Reemplazar"
          >
            <RefreshCw className={`w-5 h-5 ${isReplacing ? 'animate-spin' : ''}`} />
          </button>
        </div>

        <div className="flex items-center gap-4 mb-3 text-sm text-gray-600">
          <div className="flex items-center gap-1">
            <Flame className="w-4 h-4" />
            <span>{meal.calories} kcal</span>
          </div>
          <span>P: {meal.protein}g</span>
          <span>C: {meal.carbs}g</span>
          <span>G: {meal.fat}g</span>
        </div>

        <div className="flex flex-wrap gap-2">
          {meal.ingredients.map((ingredient, idx) => (
            <span
              key={idx}
              className="px-2 py-1 bg-white text-gray-700 rounded text-sm border"
            >
              {ingredient}
            </span>
          ))}
        </div>

        {isReplacing && alternatives.length > 0 && (
          <div className="mt-4 p-4 bg-white rounded-lg border-2 border-emerald-200">
            <div className="flex justify-between items-center mb-3">
              <p className="text-emerald-700">Selecciona una alternativa:</p>
              <button
                onClick={cancelReplace}
                className="text-gray-500 hover:text-gray-700"
              >
                ✕
              </button>
            </div>
            <div className="space-y-2">
              {alternatives.map((alt) => (
                <button
                  key={alt.id}
                  onClick={() => selectAlternative(alt)}
                  className="w-full text-left p-3 bg-emerald-50 hover:bg-emerald-100 rounded-lg border border-emerald-200 transition"
                >
                  <div className="flex justify-between items-start mb-2">
                    <p className="text-gray-900">{alt.name}</p>
                    <Check className="w-5 h-5 text-emerald-600" />
                  </div>
                  <div className="flex items-center gap-3 text-sm text-gray-600">
                    <span>{alt.calories} kcal</span>
                    <span>P: {alt.protein}g</span>
                    <span>C: {alt.carbs}g</span>
                    <span>G: {alt.fat}g</span>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="max-w-6xl mx-auto">
      <div className="mb-8">
        <h1 className="mb-2">Generador de Menú</h1>
        <p className="text-gray-600">
          Crea un plan de alimentación personalizado basado en tu perfil
        </p>
      </div>

      {/* Prolog Info Component */}
      <div className="mb-8">
        <PrologInfo />
      </div>

      {/* Generator Controls */}
      <div className="bg-white rounded-xl shadow-sm border p-6 mb-8">
        <div className="flex flex-col md:flex-row items-start md:items-end gap-4">
          <div className="flex-1">
            <label className="block mb-2 text-gray-700">
              <Calendar className="inline w-5 h-5 mr-2" />
              Período del menú
            </label>
            <select
              value={days}
              onChange={(e) => setDays(parseInt(e.target.value))}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none"
              disabled={loading}
            >
              <option value={1}>1 día</option>
              <option value={3}>3 días</option>
              <option value={5}>5 días</option>
              <option value={7}>7 días</option>
            </select>
          </div>

          <button
            onClick={generateMealPlan}
            disabled={loading}
            className="px-6 py-3 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 whitespace-nowrap"
          >
            <Utensils className="w-5 h-5" />
            {loading ? 'Generando...' : 'Generar Menú'}
          </button>
        </div>

        {targetCalories > 0 && (
          <div className="mt-4 p-4 bg-emerald-50 rounded-lg border border-emerald-200">
            <p className="text-emerald-700">
              <Flame className="inline w-5 h-5 mr-2" />
              Objetivo calórico diario: <span className="text-emerald-900">{targetCalories} kcal</span>
            </p>
          </div>
        )}
      </div>

      {/* Meal Plan Display */}
      {mealPlan.length > 0 && (
        <div className="space-y-6">
          {mealPlan.map((dayMeals, index) => (
            <div key={index} className="bg-white rounded-xl shadow-sm border p-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 bg-emerald-100 rounded-lg flex items-center justify-center">
                  <span className="text-emerald-600">{dayMeals.day}</span>
                </div>
                <div>
                  <h2>Día {dayMeals.day}</h2>
                  <p className="text-gray-600">{getDayName(dayMeals.day)}</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {renderMeal(dayMeals.breakfast, index, 'breakfast')}
                {renderMeal(dayMeals.lunch, index, 'lunch')}
                {renderMeal(dayMeals.dinner, index, 'dinner')}
              </div>

              <div className="mt-4 pt-4 border-t">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Total del día:</span>
                  <span>
                    <Flame className="inline w-4 h-4 mr-1" />
                    {dayMeals.breakfast.calories + dayMeals.lunch.calories + dayMeals.dinner.calories} kcal
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {mealPlan.length === 0 && !loading && (
        <div className="text-center py-12 bg-white rounded-xl shadow-sm border">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Utensils className="w-8 h-8 text-gray-400" />
          </div>
          <h3 className="text-gray-900 mb-2">No hay menú generado</h3>
          <p className="text-gray-600 mb-6">
            Selecciona el período deseado y haz clic en "Generar Menú" para comenzar
          </p>
        </div>
      )}
    </div>
  );
}
