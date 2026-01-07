import React, { useState, useEffect } from 'react';
import { projectId, publicAnonKey } from '../utils/supabase/info';
import { 
  ChefHat, Clock, Users, TrendingUp, Plus, X, Sparkles, 
  Loader2, ChevronDown, ChevronUp, Heart, History, Flame, Info, BookmarkPlus
} from 'lucide-react';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { toast } from 'sonner';
import NutritionStats from './NutritionStats';
import { Tooltip } from './ui/tooltip';
import { Progress } from './ui/progress';
import RecipeGenerationProgress from './RecipeGenerationProgress';
import IngredientSuggestions from './IngredientSuggestions';
import QuickTips from './QuickTips';
import RecipeSuccessAnimation from './RecipeSuccessAnimation';
import UserProfileSummary from './UserProfileSummary';
import RecipeEmptyState from './RecipeEmptyState';
import RecipeStats from './RecipeStats';

interface RecipeGeneratorProps {
  accessToken: string;
}

interface Recipe {
  id?: string;
  nombre: string;
  descripcion: string;
  tiempoPreparacion: string;
  dificultad: string;
  porciones: number;
  ingredientes: { nombre: string; cantidad: string }[];
  pasos: string[];
  informacionNutricional: {
    calorias: number;
    proteinas: string;
    carbohidratos: string;
    grasas: string;
    fibra: string;
  };
  tags: string[];
  consejos: string;
  generatedAt?: string;
}

export default function RecipeGenerator({ accessToken }: RecipeGeneratorProps) {
  const [ingredients, setIngredients] = useState<string[]>([]);
  const [currentIngredient, setCurrentIngredient] = useState('');
  const [mealType, setMealType] = useState('almuerzo');
  const [cookingTime, setCookingTime] = useState('medium');
  const [difficulty, setDifficulty] = useState('medium');
  const [servings, setServings] = useState(2);
  const [loading, setLoading] = useState(false);
  const [generatedRecipe, setGeneratedRecipe] = useState<Recipe | null>(null);
  const [showHistory, setShowHistory] = useState(false);
  const [recipeHistory, setRecipeHistory] = useState<Recipe[]>([]);
  const [expandedSteps, setExpandedSteps] = useState(true);
  const [showFavorites, setShowFavorites] = useState(false);
  const [favoriteRecipes, setFavoriteRecipes] = useState<Recipe[]>([]);
  const [favoriteIds, setFavoriteIds] = useState<string[]>([]);
  const [showSuccessAnimation, setShowSuccessAnimation] = useState(false);
  const [userProfile, setUserProfile] = useState<any>(null);

  useEffect(() => {
    loadRecipeHistory();
    loadFavorites();
    loadUserProfile();
  }, []);

  const loadUserProfile = async () => {
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-3d05204c/profile`,
        {
          headers: {
            'Authorization': `Bearer ${accessToken}`,
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        setUserProfile(data.profile);
      }
    } catch (error) {
      console.error('Error loading profile:', error);
    }
  };

  const loadRecipeHistory = async () => {
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-3d05204c/recipes/history`,
        {
          headers: {
            'Authorization': `Bearer ${accessToken}`,
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        setRecipeHistory(data.recipes || []);
      }
    } catch (error) {
      console.error('Error loading recipe history:', error);
    }
  };

  const loadFavorites = async () => {
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-3d05204c/recipes/favorites`,
        {
          headers: {
            'Authorization': `Bearer ${accessToken}`,
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        setFavoriteRecipes(data.recipes || []);
        setFavoriteIds(data.recipes.map((recipe: Recipe) => recipe.id!) || []);
      }
    } catch (error) {
      console.error('Error loading favorite recipes:', error);
    }
  };

  const addIngredient = () => {
    if (currentIngredient.trim() && !ingredients.includes(currentIngredient.trim())) {
      setIngredients([...ingredients, currentIngredient.trim()]);
      setCurrentIngredient('');
    }
  };

  const removeIngredient = (ingredient: string) => {
    setIngredients(ingredients.filter(i => i !== ingredient));
  };

  const generateRecipe = async () => {
    setLoading(true);
    console.log('[RECIPE GENERATOR] Starting recipe generation...');
    console.log('[RECIPE GENERATOR] Parameters:', { ingredients, mealType, cookingTime, difficulty, servings });
    
    try {
      const url = `https://${projectId}.supabase.co/functions/v1/make-server-3d05204c/generate-recipe`;
      console.log('[RECIPE GENERATOR] Calling URL:', url);
      
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`,
        },
        body: JSON.stringify({
          ingredients,
          mealType,
          cookingTime,
          difficulty,
          servings
        }),
      });

      console.log('[RECIPE GENERATOR] Response status:', response.status);
      const data = await response.json();
      console.log('[RECIPE GENERATOR] Response data:', data);

      if (response.ok) {
        setGeneratedRecipe(data.recipe);
        setExpandedSteps(true);
        setShowSuccessAnimation(true);
        toast.success('¡Receta generada exitosamente!');
        await loadRecipeHistory();
      } else {
        console.error('[RECIPE GENERATOR] Error response:', data);
        if (data.details) {
          console.error('[RECIPE GENERATOR] Error details:', data.details);
        }
        toast.error(data.error || 'Error al generar receta');
      }
    } catch (error) {
      console.error('[RECIPE GENERATOR] Error generating recipe:', error);
      toast.error('Error al conectar con el servidor');
    } finally {
      setLoading(false);
    }
  };

  const saveFavorite = async (recipeId: string) => {
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-3d05204c/recipes/favorite`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${accessToken}`,
          },
          body: JSON.stringify({ recipeId }),
        }
      );

      if (response.ok) {
        toast.success('Receta guardada en favoritos');
        await loadFavorites();
      }
    } catch (error) {
      console.error('Error saving favorite:', error);
      toast.error('Error al guardar favorito');
    }
  };

  const removeFavorite = async (recipeId: string) => {
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-3d05204c/recipes/favorite/${recipeId}`,
        {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${accessToken}`,
          },
        }
      );

      if (response.ok) {
        toast.success('Receta eliminada de favoritos');
        await loadFavorites();
      }
    } catch (error) {
      console.error('Error removing favorite:', error);
      toast.error('Error al eliminar favorito');
    }
  };

  const toggleFavorite = async (recipeId: string) => {
    if (favoriteIds.includes(recipeId)) {
      await removeFavorite(recipeId);
    } else {
      await saveFavorite(recipeId);
    }
  };

  const getDifficultyColor = (diff: string) => {
    const colors: Record<string, string> = {
      'fácil': 'bg-green-100 text-green-700',
      'intermedio': 'bg-yellow-100 text-yellow-700',
      'avanzado': 'bg-red-100 text-red-700'
    };
    return colors[diff] || 'bg-gray-100 text-gray-700';
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Success Animation */}
      {showSuccessAnimation && generatedRecipe && (
        <RecipeSuccessAnimation
          recipeName={generatedRecipe.nombre}
          onComplete={() => setShowSuccessAnimation(false)}
        />
      )}

      {/* Header */}
      <div className="bg-gradient-to-r from-purple-600 to-pink-600 rounded-xl p-6 text-white">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm">
            <ChefHat className="w-7 h-7" />
          </div>
          <div>
            <h1 className="text-white mb-1">Generador de Recetas con IA</h1>
            <p className="text-purple-100 text-sm">
              Crea recetas personalizadas basadas en tus preferencias y objetivos
            </p>
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Configuration Panel */}
        <div className="lg:col-span-1 space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-purple-600" />
                Configuración
              </CardTitle>
              <CardDescription>Personaliza tu receta</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Ingredients */}
              <div>
                <label className="text-sm text-gray-700 mb-2 block">
                  Ingredientes Disponibles (opcional)
                </label>
                <div className="flex gap-2 mb-2">
                  <input
                    type="text"
                    value={currentIngredient}
                    onChange={(e) => setCurrentIngredient(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && addIngredient()}
                    placeholder="Ej: pollo, arroz..."
                    className="flex-1 px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                  <Button
                    onClick={addIngredient}
                    size="sm"
                    className="bg-purple-600 hover:bg-purple-700"
                  >
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {ingredients.map((ing) => (
                    <Badge
                      key={ing}
                      variant="secondary"
                      className="flex items-center gap-1 px-2 py-1 animate-in fade-in slide-in-from-left duration-200"
                    >
                      {ing}
                      <button
                        onClick={() => removeIngredient(ing)}
                        className="ml-1 hover:text-red-600 transition-colors"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </Badge>
                  ))}
                </div>

                {/* Ingredient Suggestions */}
                <IngredientSuggestions
                  mealType={mealType}
                  onAddIngredient={(ingredient) => {
                    if (!ingredients.includes(ingredient)) {
                      setIngredients([...ingredients, ingredient]);
                    }
                  }}
                  currentIngredients={ingredients}
                />
              </div>

              {/* Meal Type */}
              <div>
                <label className="text-sm text-gray-700 mb-2 flex items-center gap-2">
                  Tipo de Comida
                  <Tooltip content="Selecciona para qué momento del día quieres la receta">
                    <Info className="w-4 h-4 text-gray-400 cursor-help" />
                  </Tooltip>
                </label>
                <select
                  value={mealType}
                  onChange={(e) => setMealType(e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all hover:border-purple-300"
                >
                  <option value="desayuno">🍳 Desayuno</option>
                  <option value="almuerzo">🍽️ Almuerzo</option>
                  <option value="cena">🌙 Cena</option>
                  <option value="snack">🥤 Snack</option>
                </select>
              </div>

              {/* Cooking Time */}
              <div>
                <label className="text-sm text-gray-700 mb-2 flex items-center gap-2">
                  Tiempo de Cocción
                  <Tooltip content="¿Cuánto tiempo tienes disponible para cocinar?">
                    <Info className="w-4 h-4 text-gray-400 cursor-help" />
                  </Tooltip>
                </label>
                <select
                  value={cookingTime}
                  onChange={(e) => setCookingTime(e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all hover:border-purple-300"
                >
                  <option value="quick">Rápido (15-20 min)</option>
                  <option value="medium">Medio (30-45 min)</option>
                  <option value="long">Largo (60+ min)</option>
                </select>
              </div>

              {/* Difficulty */}
              <div>
                <label className="text-sm text-gray-700 mb-2 flex items-center gap-2">
                  Dificultad
                  <Tooltip content="Tu nivel de experiencia en la cocina">
                    <Info className="w-4 h-4 text-gray-400 cursor-help" />
                  </Tooltip>
                </label>
                <select
                  value={difficulty}
                  onChange={(e) => setDifficulty(e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all hover:border-purple-300"
                >
                  <option value="easy">👶 Fácil - Principiante</option>
                  <option value="medium">👨‍🍳 Intermedio - Con experiencia</option>
                  <option value="hard">⭐ Avanzado - Chef experto</option>
                </select>
              </div>

              {/* Servings */}
              <div>
                <label className="text-sm text-gray-700 mb-2 flex items-center justify-between">
                  <span className="flex items-center gap-2">
                    Porciones
                    <Tooltip content="¿Para cuántas personas vas a cocinar?">
                      <Info className="w-4 h-4 text-gray-400 cursor-help" />
                    </Tooltip>
                  </span>
                  <span className="text-lg font-semibold text-purple-600">
                    {servings} {servings === 1 ? 'persona' : 'personas'}
                  </span>
                </label>
                <input
                  type="range"
                  min="1"
                  max="8"
                  value={servings}
                  onChange={(e) => setServings(Number(e.target.value))}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-purple-600"
                />
                <div className="flex justify-between text-xs text-gray-500 mt-1">
                  <span>1</span>
                  <span>4</span>
                  <span>8</span>
                </div>
              </div>

              <Button
                onClick={generateRecipe}
                disabled={loading}
                className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Generando...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 mr-2" />
                    Generar Receta
                  </>
                )}
              </Button>

              <Button
                onClick={() => setShowHistory(!showHistory)}
                variant="outline"
                className="w-full"
              >
                <History className="w-4 h-4 mr-2" />
                {showHistory ? 'Ocultar' : 'Ver'} Historial
              </Button>

              <Button
                onClick={() => setShowFavorites(!showFavorites)}
                variant="outline"
                className="w-full"
              >
                <Heart className="w-4 h-4 mr-2" />
                {showFavorites ? 'Ocultar' : 'Ver'} Favoritos
                {favoriteRecipes.length > 0 && (
                  <span className="ml-auto bg-pink-100 text-pink-600 px-2 py-0.5 rounded-full text-xs">
                    {favoriteRecipes.length}
                  </span>
                )}
              </Button>
            </CardContent>
          </Card>

          {/* Quick Tips */}
          <QuickTips />

          {/* User Profile Summary */}
          <UserProfileSummary userProfile={userProfile} />

          {/* Recipe Statistics */}
          <RecipeStats
            totalGenerated={recipeHistory.length}
            totalFavorites={favoriteRecipes.length}
            weeklyGenerated={recipeHistory.filter((r) => {
              if (!r.id) return false;
              const recipeDate = new Date(parseInt(r.id));
              const weekAgo = new Date();
              weekAgo.setDate(weekAgo.getDate() - 7);
              return recipeDate >= weekAgo;
            }).length}
          />
        </div>

        {/* Recipe Display */}
        <div className="lg:col-span-2">
          {showHistory ? (
            <div className="space-y-4">
              <h2 className="flex items-center gap-2">
                <History className="w-5 h-5" />
                Historial de Recetas
              </h2>
              {recipeHistory.length === 0 ? (
                <Card>
                  <CardContent className="py-12 text-center">
                    <ChefHat className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-500">Aún no has generado ninguna receta</p>
                  </CardContent>
                </Card>
              ) : (
                recipeHistory.map((recipe) => (
                  <Card
                    key={recipe.id}
                    className="cursor-pointer hover:border-purple-300 transition"
                    onClick={() => {
                      setGeneratedRecipe(recipe);
                      setShowHistory(false);
                    }}
                  >
                    <CardHeader>
                      <div className="flex justify-between items-start">
                        <div>
                          <CardTitle className="text-lg">{recipe.nombre}</CardTitle>
                          <CardDescription>{recipe.descripcion}</CardDescription>
                        </div>
                        <Badge className={getDifficultyColor(recipe.dificultad)}>
                          {recipe.dificultad}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="flex gap-4 text-sm text-gray-600">
                        <span className="flex items-center gap-1">
                          <Clock className="w-4 h-4" />
                          {recipe.tiempoPreparacion}
                        </span>
                        <span className="flex items-center gap-1">
                          <Users className="w-4 h-4" />
                          {recipe.porciones} porciones
                        </span>
                        <span className="flex items-center gap-1">
                          <Flame className="w-4 h-4" />
                          {recipe.informacionNutricional.calorias} kcal
                        </span>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          ) : showFavorites ? (
            <div className="space-y-4">
              <h2 className="flex items-center gap-2">
                <Heart className="w-5 h-5" />
                Recetas Favoritas
              </h2>
              {favoriteRecipes.length === 0 ? (
                <Card>
                  <CardContent className="py-12 text-center">
                    <ChefHat className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-500">Aún no has guardado ninguna receta como favorita</p>
                  </CardContent>
                </Card>
              ) : (
                favoriteRecipes.map((recipe) => (
                  <Card
                    key={recipe.id}
                    className="cursor-pointer hover:border-purple-300 transition"
                    onClick={() => {
                      setGeneratedRecipe(recipe);
                      setShowFavorites(false);
                    }}
                  >
                    <CardHeader>
                      <div className="flex justify-between items-start">
                        <div>
                          <CardTitle className="text-lg">{recipe.nombre}</CardTitle>
                          <CardDescription>{recipe.descripcion}</CardDescription>
                        </div>
                        <Badge className={getDifficultyColor(recipe.dificultad)}>
                          {recipe.dificultad}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="flex gap-4 text-sm text-gray-600">
                        <span className="flex items-center gap-1">
                          <Clock className="w-4 h-4" />
                          {recipe.tiempoPreparacion}
                        </span>
                        <span className="flex items-center gap-1">
                          <Users className="w-4 h-4" />
                          {recipe.porciones} porciones
                        </span>
                        <span className="flex items-center gap-1">
                          <Flame className="w-4 h-4" />
                          {recipe.informacionNutricional.calorias} kcal
                        </span>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          ) : generatedRecipe ? (
            <Card className="animate-in fade-in slide-in-from-bottom-4 duration-500">
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-2xl mb-2">{generatedRecipe.nombre}</CardTitle>
                    <CardDescription>{generatedRecipe.descripcion}</CardDescription>
                  </div>
                  {generatedRecipe.id && (
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => toggleFavorite(generatedRecipe.id!)}
                      className={`hover:bg-pink-50 ${
                        favoriteIds.includes(generatedRecipe.id!)
                          ? 'text-pink-600'
                          : 'text-gray-400'
                      }`}
                    >
                      <Heart 
                        className="w-5 h-5" 
                        fill={favoriteIds.includes(generatedRecipe.id!) ? 'currentColor' : 'none'}
                      />
                    </Button>
                  )}
                </div>

                <div className="flex flex-wrap gap-2 mt-3">
                  <Badge className={getDifficultyColor(generatedRecipe.dificultad)}>
                    {generatedRecipe.dificultad}
                  </Badge>
                  {generatedRecipe.tags?.map((tag) => (
                    <Badge key={tag} variant="outline">
                      {tag}
                    </Badge>
                  ))}
                </div>

                <div className="grid grid-cols-3 gap-4 mt-4">
                  <div className="flex items-center gap-2 text-sm">
                    <Clock className="w-4 h-4 text-purple-600" />
                    <span>{generatedRecipe.tiempoPreparacion}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Users className="w-4 h-4 text-purple-600" />
                    <span>{generatedRecipe.porciones} porciones</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Flame className="w-4 h-4 text-orange-600" />
                    <span>{generatedRecipe.informacionNutricional.calorias} kcal</span>
                  </div>
                </div>
              </CardHeader>

              <CardContent className="space-y-6">
                {/* Nutrition Info - Enhanced */}
                <div>
                  <div className="flex items-center gap-2 mb-4">
                    <TrendingUp className="w-5 h-5 text-emerald-600" />
                    <h3>Información Nutricional</h3>
                    <Tooltip content="Por porción individual">
                      <Info className="w-4 h-4 text-gray-400 cursor-help" />
                    </Tooltip>
                  </div>
                  <NutritionStats
                    calorias={generatedRecipe.informacionNutricional.calorias}
                    proteinas={generatedRecipe.informacionNutricional.proteinas}
                    carbohidratos={generatedRecipe.informacionNutricional.carbohidratos}
                    grasas={generatedRecipe.informacionNutricional.grasas}
                    fibra={generatedRecipe.informacionNutricional.fibra}
                  />
                </div>

                {/* Ingredients */}
                <div>
                  <h3 className="mb-3">Ingredientes</h3>
                  <ul className="space-y-2">
                    {generatedRecipe.ingredientes.map((ing, idx) => (
                      <li key={idx} className="flex items-start gap-2 text-sm">
                        <span className="w-2 h-2 bg-purple-600 rounded-full mt-1.5 flex-shrink-0"></span>
                        <span>
                          <strong>{ing.cantidad}</strong> {ing.nombre}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Steps */}
                <div>
                  <button
                    onClick={() => setExpandedSteps(!expandedSteps)}
                    className="w-full flex items-center justify-between mb-3 hover:text-purple-600 transition"
                  >
                    <h3>Preparación</h3>
                    {expandedSteps ? (
                      <ChevronUp className="w-5 h-5" />
                    ) : (
                      <ChevronDown className="w-5 h-5" />
                    )}
                  </button>
                  {expandedSteps && (
                    <ol className="space-y-3">
                      {generatedRecipe.pasos.map((paso, idx) => (
                        <li key={idx} className="flex gap-3 text-sm">
                          <span className="flex-shrink-0 w-7 h-7 bg-purple-600 text-white rounded-full flex items-center justify-center text-xs">
                            {idx + 1}
                          </span>
                          <span className="pt-1">{paso}</span>
                        </li>
                      ))}
                    </ol>
                  )}
                </div>

                {/* Tips */}
                {generatedRecipe.consejos && (
                  <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                    <h3 className="text-sm mb-2 text-amber-900">💡 Consejos</h3>
                    <p className="text-sm text-amber-800">{generatedRecipe.consejos}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          ) : loading ? (
            <Card>
              <CardContent className="py-12">
                <RecipeGenerationProgress />  
              </CardContent>
            </Card>
          ) : (
            <RecipeEmptyState
              onGetStarted={() => {
                // Scroll to ingredients input
                const ingredientInput = document.querySelector('input[placeholder*="pollo"]');
                ingredientInput?.scrollIntoView({ behavior: 'smooth', block: 'center' });
                (ingredientInput as HTMLInputElement)?.focus();
              }}
            />
          )}
        </div>
      </div>
    </div>
  );
}