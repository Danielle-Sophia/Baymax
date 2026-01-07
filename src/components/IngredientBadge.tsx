import React from 'react';
import { Badge } from './ui/badge';
import { Tooltip } from './ui/tooltip';
import { Leaf, Beef, Milk, Wheat, Fish, Apple } from 'lucide-react';

interface IngredientBadgeProps {
  name: string;
  quantity?: string;
  showNutrition?: boolean;
}

// Categorización simple de ingredientes
const getIngredientCategory = (ingredient: string): {
  icon: React.ElementType;
  color: string;
  type: string;
} => {
  const lower = ingredient.toLowerCase();

  if (
    lower.includes('pollo') ||
    lower.includes('carne') ||
    lower.includes('res') ||
    lower.includes('cerdo')
  ) {
    return { icon: Beef, color: 'text-red-600', type: 'Proteína animal' };
  }

  if (
    lower.includes('pescado') ||
    lower.includes('salmón') ||
    lower.includes('atún') ||
    lower.includes('camarón')
  ) {
    return { icon: Fish, color: 'text-blue-600', type: 'Proteína marina' };
  }

  if (
    lower.includes('leche') ||
    lower.includes('queso') ||
    lower.includes('yogurt') ||
    lower.includes('crema')
  ) {
    return { icon: Milk, color: 'text-yellow-600', type: 'Lácteo' };
  }

  if (
    lower.includes('arroz') ||
    lower.includes('pasta') ||
    lower.includes('pan') ||
    lower.includes('avena') ||
    lower.includes('harina')
  ) {
    return { icon: Wheat, color: 'text-amber-600', type: 'Cereal/Grano' };
  }

  if (
    lower.includes('fruta') ||
    lower.includes('manzana') ||
    lower.includes('plátano') ||
    lower.includes('fresa')
  ) {
    return { icon: Apple, color: 'text-pink-600', type: 'Fruta' };
  }

  return { icon: Leaf, color: 'text-green-600', type: 'Vegetal' };
};

export default function IngredientBadge({
  name,
  quantity,
  showNutrition = false,
}: IngredientBadgeProps) {
  const category = getIngredientCategory(name);
  const Icon = category.icon;

  const tooltipContent = showNutrition ? (
    <div className="space-y-1">
      <p className="flex items-center gap-1">
        <Icon className={`w-3 h-3 ${category.color}`} />
        <span>{category.type}</span>
      </p>
      {quantity && <p className="text-xs opacity-80">Cantidad: {quantity}</p>}
    </div>
  ) : undefined;

  return (
    <Tooltip content={tooltipContent} side="top">
      <Badge
        variant="secondary"
        className="px-2 py-1 text-xs hover:bg-purple-100 hover:text-purple-700 transition-all cursor-default hover:scale-105"
      >
        {showNutrition && <Icon className={`w-3 h-3 mr-1 ${category.color}`} />}
        {quantity ? `${quantity} ${name}` : name}
      </Badge>
    </Tooltip>
  );
}
