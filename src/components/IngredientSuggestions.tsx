import React from 'react';
import { Sparkles } from 'lucide-react';
import { Badge } from './ui/badge';

interface IngredientSuggestionsProps {
  mealType: string;
  onAddIngredient: (ingredient: string) => void;
  currentIngredients: string[];
}

const INGREDIENT_SUGGESTIONS: Record<string, string[]> = {
  desayuno: [
    'Huevos', 'Avena', 'Yogurt', 'Frutas', 'Pan integral',
    'Miel', 'Leche', 'Plátano', 'Fresas', 'Granola',
    'Aguacate', 'Jitomate', 'Queso', 'Jamón', 'Espinacas'
  ],
  almuerzo: [
    'Pollo', 'Arroz', 'Frijoles', 'Brócoli', 'Zanahoria',
    'Pasta', 'Carne', 'Pescado', 'Quinoa', 'Lentejas',
    'Calabaza', 'Pimientos', 'Cebolla', 'Ajo', 'Limón'
  ],
  cena: [
    'Salmón', 'Ensalada', 'Verduras al vapor', 'Tofu', 'Champiñones',
    'Espárragos', 'Coliflor', 'Calabacín', 'Berenjena', 'Pechuga',
    'Batata', 'Espinacas', 'Kale', 'Atún', 'Camarones'
  ],
  snack: [
    'Almendras', 'Nueces', 'Frutas secas', 'Manzana', 'Zanahoria',
    'Hummus', 'Palitos de apio', 'Yogurt griego', 'Proteína en polvo',
    'Cacahuates', 'Arándanos', 'Chocolate negro', 'Semillas', 'Edamame'
  ],
};

const PROTEIN_SOURCES = ['Pollo', 'Pescado', 'Huevos', 'Tofu', 'Carne', 'Atún', 'Salmón', 'Camarones'];
const VEGETABLES = ['Brócoli', 'Espinacas', 'Zanahoria', 'Calabacín', 'Pimientos', 'Kale'];
const HEALTHY_CARBS = ['Arroz integral', 'Quinoa', 'Avena', 'Batata', 'Pan integral'];

export default function IngredientSuggestions({
  mealType,
  onAddIngredient,
  currentIngredients,
}: IngredientSuggestionsProps) {
  const suggestions = INGREDIENT_SUGGESTIONS[mealType] || INGREDIENT_SUGGESTIONS.almuerzo;
  
  // Filtrar ingredientes ya agregados
  const availableSuggestions = suggestions.filter(
    (ing) => !currentIngredients.some((current) => current.toLowerCase() === ing.toLowerCase())
  );

  // Detectar qué macronutrientes faltan
  const hasProtein = currentIngredients.some((ing) =>
    PROTEIN_SOURCES.some((p) => ing.toLowerCase().includes(p.toLowerCase()))
  );
  const hasVeggies = currentIngredients.some((ing) =>
    VEGETABLES.some((v) => ing.toLowerCase().includes(v.toLowerCase()))
  );
  const hasCarbs = currentIngredients.some((ing) =>
    HEALTHY_CARBS.some((c) => ing.toLowerCase().includes(c.toLowerCase()))
  );

  const getSuggestionPriority = () => {
    if (!hasProtein) {
      return {
        category: 'Proteína',
        icon: '🍗',
        color: 'bg-blue-100 text-blue-700 hover:bg-blue-200',
        items: PROTEIN_SOURCES.filter((p) => availableSuggestions.includes(p)),
      };
    }
    if (!hasVeggies) {
      return {
        category: 'Vegetales',
        icon: '🥦',
        color: 'bg-green-100 text-green-700 hover:bg-green-200',
        items: VEGETABLES.filter((v) => availableSuggestions.includes(v)),
      };
    }
    if (!hasCarbs) {
      return {
        category: 'Carbohidratos',
        icon: '🌾',
        color: 'bg-amber-100 text-amber-700 hover:bg-amber-200',
        items: HEALTHY_CARBS.filter((c) => availableSuggestions.includes(c)),
      };
    }
    return null;
  };

  const priority = getSuggestionPriority();
  const topSuggestions = availableSuggestions.slice(0, 8);

  if (currentIngredients.length >= 10) {
    return (
      <div className="bg-green-50 border border-green-200 rounded-lg p-3">
        <p className="text-sm text-green-700 flex items-center gap-2">
          <Sparkles className="w-4 h-4" />
          ¡Excelente selección! Ya tienes suficientes ingredientes para crear una receta balanceada.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {priority && priority.items.length > 0 && (
        <div className="bg-purple-50 border border-purple-200 rounded-lg p-3">
          <p className="text-sm text-purple-700 mb-2 flex items-center gap-2">
            <Sparkles className="w-4 h-4" />
            {priority.icon} Sugerencia: Agrega {priority.category}
          </p>
          <div className="flex flex-wrap gap-2">
            {priority.items.slice(0, 4).map((ingredient) => (
              <Badge
                key={ingredient}
                className={`${priority.color} cursor-pointer transition-all hover:scale-105`}
                onClick={() => onAddIngredient(ingredient)}
              >
                + {ingredient}
              </Badge>
            ))}
          </div>
        </div>
      )}

      {topSuggestions.length > 0 && (
        <div>
          <p className="text-xs text-gray-600 mb-2">Ingredientes populares para {mealType}:</p>
          <div className="flex flex-wrap gap-2">
            {topSuggestions.map((ingredient) => (
              <Badge
                key={ingredient}
                variant="outline"
                className="cursor-pointer hover:bg-purple-50 hover:border-purple-300 transition-all"
                onClick={() => onAddIngredient(ingredient)}
              >
                + {ingredient}
              </Badge>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
