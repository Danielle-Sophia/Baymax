import React, { useState } from 'react';
import { projectId } from '../utils/supabase/info';
import { toast } from 'sonner@2.0.3';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Calendar, ChefHat, Clock, Loader2, RefreshCw, ShoppingCart, Download, Sparkles } from 'lucide-react';

interface WeeklyRecipePlanProps {
  accessToken: string;
}

interface Recipe {
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
}

interface DayPlan {
  dia: string;
  desayuno: Recipe;
  almuerzo: Recipe;
  cena: Recipe;
}

const DIAS_SEMANA = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'];

export default function WeeklyRecipePlan({ accessToken }: WeeklyRecipePlanProps) {
  const [planSemanal, setPlanSemanal] = useState<DayPlan[] | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [selectedDay, setSelectedDay] = useState<string | null>(null);
  const [selectedMeal, setSelectedMeal] = useState<'desayuno' | 'almuerzo' | 'cena' | null>(null);
  const [showShoppingList, setShowShoppingList] = useState(false);

  const generarPlanSemanal = async () => {
    setIsGenerating(true);
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-3d05204c/weekly-recipe-plan`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
          },
        }
      );

      if (!response.ok) {
        throw new Error('Error al generar el plan semanal');
      }

      const data = await response.json();
      setPlanSemanal(data.plan);
      toast.success('¡Plan semanal generado exitosamente!');
    } catch (error) {
      console.error('Error generando plan semanal:', error);
      toast.error('Error al generar el plan semanal. Intenta de nuevo.');
    } finally {
      setIsGenerating(false);
    }
  };

  const regenerarComida = async (dia: string, tipoComida: 'desayuno' | 'almuerzo' | 'cena') => {
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-3d05204c/regenerate-meal`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            tipoComida,
          }),
        }
      );

      if (!response.ok) {
        throw new Error('Error al regenerar comida');
      }

      const data = await response.json();
      
      // Actualizar solo esa comida en el plan
      if (planSemanal) {
        const nuevoPlan = planSemanal.map(dayPlan => {
          if (dayPlan.dia === dia) {
            return {
              ...dayPlan,
              [tipoComida]: data.recipe,
            };
          }
          return dayPlan;
        });
        setPlanSemanal(nuevoPlan);
        toast.success(`${tipoComida.charAt(0).toUpperCase() + tipoComida.slice(1)} regenerado`);
      }
    } catch (error) {
      console.error('Error regenerando comida:', error);
      toast.error('Error al regenerar la comida. Intenta de nuevo.');
    }
  };

  const generarListaCompras = () => {
    if (!planSemanal) return [];

    const ingredientesMap = new Map<string, { cantidad: string, veces: number }>();

    planSemanal.forEach(day => {
      [day.desayuno, day.almuerzo, day.cena].forEach(meal => {
        meal.ingredientes.forEach(ing => {
          const nombre = ing.nombre.toLowerCase();
          if (ingredientesMap.has(nombre)) {
            const existing = ingredientesMap.get(nombre)!;
            ingredientesMap.set(nombre, {
              cantidad: existing.cantidad,
              veces: existing.veces + 1,
            });
          } else {
            ingredientesMap.set(nombre, {
              cantidad: ing.cantidad,
              veces: 1,
            });
          }
        });
      });
    });

    const listaCompras = Array.from(ingredientesMap.entries()).map(([nombre, info]) => ({
      nombre,
      cantidad: info.cantidad,
      veces: info.veces,
    }));

    return listaCompras.sort((a, b) => a.nombre.localeCompare(b.nombre));
  };

  const descargarListaCompras = () => {
    const lista = generarListaCompras();
    
    let texto = '🛒 LISTA DE COMPRAS - PLAN SEMANAL\n';
    texto += '=' .repeat(50) + '\n\n';
    
    lista.forEach(item => {
      texto += `□ ${item.nombre.toUpperCase()}\n`;
      texto += `  Cantidad: ${item.cantidad} (se usa ${item.veces} ${item.veces === 1 ? 'vez' : 'veces'})\n\n`;
    });
    
    texto += '\n' + '='.repeat(50) + '\n';
    texto += 'Generado por Dr. Baymax 🏥\n';

    const blob = new Blob([texto], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `lista-compras-${new Date().toISOString().split('T')[0]}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    toast.success('Lista de compras descargada');
  };

  const calcularNutricionTotal = () => {
    if (!planSemanal) return null;

    let totalCalorias = 0;
    let totalProteinas = 0;
    let totalCarbohidratos = 0;
    let totalGrasas = 0;
    let totalFibra = 0;

    planSemanal.forEach(day => {
      [day.desayuno, day.almuerzo, day.cena].forEach(meal => {
        totalCalorias += meal.informacionNutricional.calorias;
        totalProteinas += parseInt(meal.informacionNutricional.proteinas);
        totalCarbohidratos += parseInt(meal.informacionNutricional.carbohidratos);
        totalGrasas += parseInt(meal.informacionNutricional.grasas);
        totalFibra += parseInt(meal.informacionNutricional.fibra);
      });
    });

    return {
      calorias: Math.round(totalCalorias / 7),
      proteinas: Math.round(totalProteinas / 7),
      carbohidratos: Math.round(totalCarbohidratos / 7),
      grasas: Math.round(totalGrasas / 7),
      fibra: Math.round(totalFibra / 7),
    };
  };

  const nutricionPromedio = calcularNutricionTotal();

  if (!planSemanal) {
    return (
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="text-center space-y-4">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Calendar className="h-8 w-8 text-emerald-600" />
            <h1 className="text-emerald-600">Plan Semanal de Recetas</h1>
          </div>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Genera un plan completo de 7 días con desayunos, almuerzos y cenas personalizados según tu perfil y preferencias.
            Incluye lista de compras automática para toda la semana.
          </p>
        </div>

        <Card className="max-w-2xl mx-auto">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-yellow-500" />
              Generación Inteligente
            </CardTitle>
            <CardDescription>
              El sistema analizará tu perfil y generará 21 recetas únicas (3 comidas × 7 días)
              respetando todas tus restricciones y preferencias alimenticias.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center p-4 bg-emerald-50 rounded-lg">
                <div className="text-3xl mb-2">🍳</div>
                <div className="text-sm">7 Desayunos</div>
              </div>
              <div className="text-center p-4 bg-blue-50 rounded-lg">
                <div className="text-3xl mb-2">🍽️</div>
                <div className="text-sm">7 Almuerzos</div>
              </div>
              <div className="text-center p-4 bg-purple-50 rounded-lg">
                <div className="text-3xl mb-2">🌙</div>
                <div className="text-sm">7 Cenas</div>
              </div>
            </div>

            <Button
              onClick={generarPlanSemanal}
              disabled={isGenerating}
              className="w-full"
              size="lg"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Generando tu plan semanal...
                </>
              ) : (
                <>
                  <ChefHat className="mr-2 h-4 w-4" />
                  Generar Plan Semanal
                </>
              )}
            </Button>

            <div className="text-xs text-gray-500 text-center">
              ⚡ Generación instantánea • 100% personalizado • Sin costo
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Header con estadísticas */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-emerald-600 flex items-center gap-2">
            <Calendar className="h-8 w-8" />
            Tu Plan Semanal
          </h1>
          <p className="text-gray-600">21 recetas personalizadas para toda la semana</p>
        </div>
        <div className="flex gap-2">
          <Button
            onClick={() => setShowShoppingList(!showShoppingList)}
            variant="outline"
          >
            <ShoppingCart className="mr-2 h-4 w-4" />
            {showShoppingList ? 'Ver Recetas' : 'Lista de Compras'}
          </Button>
          <Button
            onClick={generarPlanSemanal}
            variant="outline"
          >
            <RefreshCw className="mr-2 h-4 w-4" />
            Nuevo Plan
          </Button>
        </div>
      </div>

      {/* Resumen nutricional */}
      {nutricionPromedio && (
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Nutrición Promedio Diaria</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-5 gap-4">
              <div className="text-center">
                <div className="text-2xl text-emerald-600">{nutricionPromedio.calorias}</div>
                <div className="text-xs text-gray-500">kcal</div>
              </div>
              <div className="text-center">
                <div className="text-2xl text-blue-600">{nutricionPromedio.proteinas}g</div>
                <div className="text-xs text-gray-500">Proteínas</div>
              </div>
              <div className="text-center">
                <div className="text-2xl text-yellow-600">{nutricionPromedio.carbohidratos}g</div>
                <div className="text-xs text-gray-500">Carbohidratos</div>
              </div>
              <div className="text-center">
                <div className="text-2xl text-orange-600">{nutricionPromedio.grasas}g</div>
                <div className="text-xs text-gray-500">Grasas</div>
              </div>
              <div className="text-center">
                <div className="text-2xl text-green-600">{nutricionPromedio.fibra}g</div>
                <div className="text-xs text-gray-500">Fibra</div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Lista de compras */}
      {showShoppingList ? (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <ShoppingCart className="h-5 w-5" />
                Lista de Compras Semanal
              </CardTitle>
              <Button onClick={descargarListaCompras} size="sm">
                <Download className="mr-2 h-4 w-4" />
                Descargar
              </Button>
            </div>
            <CardDescription>
              Todos los ingredientes que necesitas para la semana completa
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
              {generarListaCompras().map((item, index) => (
                <div key={index} className="flex items-start gap-2 p-3 bg-gray-50 rounded-lg">
                  <div className="flex-shrink-0 w-5 h-5 border-2 border-gray-300 rounded mt-0.5" />
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-sm capitalize">{item.nombre}</div>
                    <div className="text-xs text-gray-500">{item.cantidad}</div>
                    <div className="text-xs text-emerald-600">
                      {item.veces} {item.veces === 1 ? 'receta' : 'recetas'}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      ) : (
        /* Plan diario */
        <div className="grid grid-cols-1 gap-6">
          {planSemanal.map((dayPlan, dayIndex) => (
            <Card key={dayIndex}>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5 text-emerald-600" />
                  {dayPlan.dia}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {/* Desayuno */}
                  <MealCard
                    meal={dayPlan.desayuno}
                    tipo="desayuno"
                    emoji="🍳"
                    color="emerald"
                    onRegenerate={() => regenerarComida(dayPlan.dia, 'desayuno')}
                    onViewDetails={() => {
                      setSelectedDay(dayPlan.dia);
                      setSelectedMeal('desayuno');
                    }}
                  />

                  {/* Almuerzo */}
                  <MealCard
                    meal={dayPlan.almuerzo}
                    tipo="almuerzo"
                    emoji="🍽️"
                    color="blue"
                    onRegenerate={() => regenerarComida(dayPlan.dia, 'almuerzo')}
                    onViewDetails={() => {
                      setSelectedDay(dayPlan.dia);
                      setSelectedMeal('almuerzo');
                    }}
                  />

                  {/* Cena */}
                  <MealCard
                    meal={dayPlan.cena}
                    tipo="cena"
                    emoji="🌙"
                    color="purple"
                    onRegenerate={() => regenerarComida(dayPlan.dia, 'cena')}
                    onViewDetails={() => {
                      setSelectedDay(dayPlan.dia);
                      setSelectedMeal('cena');
                    }}
                  />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Modal de detalles */}
      {selectedDay && selectedMeal && planSemanal && (
        <RecipeDetailModal
          recipe={planSemanal.find(d => d.dia === selectedDay)![selectedMeal]}
          dia={selectedDay}
          tipo={selectedMeal}
          onClose={() => {
            setSelectedDay(null);
            setSelectedMeal(null);
          }}
        />
      )}
    </div>
  );
}

interface MealCardProps {
  meal: Recipe;
  tipo: string;
  emoji: string;
  color: 'emerald' | 'blue' | 'purple';
  onRegenerate: () => void;
  onViewDetails: () => void;
}

function MealCard({ meal, tipo, emoji, color, onRegenerate, onViewDetails }: MealCardProps) {
  const colorClasses = {
    emerald: 'bg-emerald-50 border-emerald-200 text-emerald-700',
    blue: 'bg-blue-50 border-blue-200 text-blue-700',
    purple: 'bg-purple-50 border-purple-200 text-purple-700',
  };

  return (
    <div className={`border rounded-lg p-4 ${colorClasses[color]} space-y-3`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-2xl">{emoji}</span>
          <span className="text-xs uppercase tracking-wide">{tipo}</span>
        </div>
        <Button
          onClick={onRegenerate}
          variant="ghost"
          size="sm"
          className="h-7 w-7 p-0"
        >
          <RefreshCw className="h-3 w-3" />
        </Button>
      </div>

      <div>
        <h4 className="font-medium text-sm mb-1">{meal.nombre}</h4>
        <p className="text-xs opacity-80 line-clamp-2">{meal.descripcion}</p>
      </div>

      <div className="flex items-center gap-2 text-xs">
        <Clock className="h-3 w-3" />
        <span>{meal.tiempoPreparacion}</span>
        <Badge variant="outline" className="text-xs">
          {meal.dificultad}
        </Badge>
      </div>

      <div className="text-xs">
        <div className="flex justify-between">
          <span>Calorías:</span>
          <span>{meal.informacionNutricional.calorias} kcal</span>
        </div>
      </div>

      <Button
        onClick={onViewDetails}
        variant="outline"
        size="sm"
        className="w-full"
      >
        Ver Receta Completa
      </Button>
    </div>
  );
}

interface RecipeDetailModalProps {
  recipe: Recipe;
  dia: string;
  tipo: string;
  onClose: () => void;
}

function RecipeDetailModal({ recipe, dia, tipo, onClose }: RecipeDetailModalProps) {
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50" onClick={onClose}>
      <div
        className="bg-white rounded-lg max-w-3xl w-full max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="sticky top-0 bg-white border-b p-6">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm text-gray-500 mb-1">
                {dia} - {tipo.charAt(0).toUpperCase() + tipo.slice(1)}
              </div>
              <h2 className="text-emerald-600">{recipe.nombre}</h2>
            </div>
            <Button onClick={onClose} variant="ghost" size="sm">
              ✕
            </Button>
          </div>
        </div>

        <div className="p-6 space-y-6">
          <p className="text-gray-600">{recipe.descripcion}</p>

          <div className="grid grid-cols-3 gap-4">
            <div className="text-center p-3 bg-gray-50 rounded-lg">
              <Clock className="h-5 w-5 mx-auto mb-1 text-gray-600" />
              <div className="text-sm">{recipe.tiempoPreparacion}</div>
            </div>
            <div className="text-center p-3 bg-gray-50 rounded-lg">
              <ChefHat className="h-5 w-5 mx-auto mb-1 text-gray-600" />
              <div className="text-sm capitalize">{recipe.dificultad}</div>
            </div>
            <div className="text-center p-3 bg-gray-50 rounded-lg">
              <div className="text-xl mb-1">👥</div>
              <div className="text-sm">{recipe.porciones} porciones</div>
            </div>
          </div>

          <div>
            <h3 className="mb-3">Información Nutricional</h3>
            <div className="grid grid-cols-5 gap-2">
              <div className="text-center p-2 bg-emerald-50 rounded">
                <div className="text-lg">{recipe.informacionNutricional.calorias}</div>
                <div className="text-xs text-gray-600">kcal</div>
              </div>
              <div className="text-center p-2 bg-blue-50 rounded">
                <div className="text-lg">{recipe.informacionNutricional.proteinas}</div>
                <div className="text-xs text-gray-600">Proteínas</div>
              </div>
              <div className="text-center p-2 bg-yellow-50 rounded">
                <div className="text-lg">{recipe.informacionNutricional.carbohidratos}</div>
                <div className="text-xs text-gray-600">Carbos</div>
              </div>
              <div className="text-center p-2 bg-orange-50 rounded">
                <div className="text-lg">{recipe.informacionNutricional.grasas}</div>
                <div className="text-xs text-gray-600">Grasas</div>
              </div>
              <div className="text-center p-2 bg-green-50 rounded">
                <div className="text-lg">{recipe.informacionNutricional.fibra}</div>
                <div className="text-xs text-gray-600">Fibra</div>
              </div>
            </div>
          </div>

          <div>
            <h3 className="mb-3">Ingredientes</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {recipe.ingredientes.map((ing, idx) => (
                <div key={idx} className="flex items-start gap-2 p-2 bg-gray-50 rounded">
                  <span className="text-emerald-600">•</span>
                  <div>
                    <span className="capitalize">{ing.nombre}</span>
                    <span className="text-gray-500 text-sm"> - {ing.cantidad}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div>
            <h3 className="mb-3">Preparación</h3>
            <ol className="space-y-3">
              {recipe.pasos.map((paso, idx) => (
                <li key={idx} className="flex gap-3">
                  <span className="flex-shrink-0 w-6 h-6 bg-emerald-600 text-white rounded-full flex items-center justify-center text-sm">
                    {idx + 1}
                  </span>
                  <span className="flex-1 pt-0.5">{paso}</span>
                </li>
              ))}
            </ol>
          </div>

          {recipe.consejos && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h4 className="text-blue-900 mb-2">💡 Consejo del Chef</h4>
              <p className="text-blue-800 text-sm">{recipe.consejos}</p>
            </div>
          )}

          {recipe.tags && recipe.tags.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {recipe.tags.map((tag, idx) => (
                <Badge key={idx} variant="secondary">
                  {tag}
                </Badge>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
