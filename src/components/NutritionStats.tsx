import React from 'react';
import { CircularProgress } from './ui/progress';
import { Tooltip } from './ui/tooltip';
import { Flame, Activity, Wheat, Droplet, Wind } from 'lucide-react';

interface NutritionStatsProps {
  calorias: number;
  proteinas: string;
  carbohidratos: string;
  grasas: string;
  fibra: string;
  targetCalorias?: number;
  targetProteinas?: number;
  targetCarbohidratos?: number;
  targetGrasas?: number;
  showProgress?: boolean;
}

export default function NutritionStats({
  calorias,
  proteinas,
  carbohidratos,
  grasas,
  fibra,
  targetCalorias = 2000,
  targetProteinas = 150,
  targetCarbohidratos = 250,
  targetGrasas = 65,
  showProgress = false,
}: NutritionStatsProps) {
  const proteinasNum = parseInt(proteinas);
  const carbohidratosNum = parseInt(carbohidratos);
  const grasasNum = parseInt(grasas);
  const fibraNum = parseInt(fibra);

  const macros = [
    {
      name: 'Calorías',
      value: calorias,
      target: targetCalorias,
      unit: 'kcal',
      icon: Flame,
      color: 'emerald' as const,
      bgColor: 'bg-emerald-50',
      textColor: 'text-emerald-600',
      description: 'Energía total de la receta',
    },
    {
      name: 'Proteínas',
      value: proteinasNum,
      target: targetProteinas,
      unit: 'g',
      icon: Activity,
      color: 'blue' as const,
      bgColor: 'bg-blue-50',
      textColor: 'text-blue-600',
      description: 'Esencial para músculos y tejidos',
    },
    {
      name: 'Carbohidratos',
      value: carbohidratosNum,
      target: targetCarbohidratos,
      unit: 'g',
      icon: Wheat,
      color: 'orange' as const,
      bgColor: 'bg-orange-50',
      textColor: 'text-orange-600',
      description: 'Principal fuente de energía',
    },
    {
      name: 'Grasas',
      value: grasasNum,
      target: targetGrasas,
      unit: 'g',
      icon: Droplet,
      color: 'purple' as const,
      bgColor: 'bg-purple-50',
      textColor: 'text-purple-600',
      description: 'Importantes para absorción de vitaminas',
    },
    {
      name: 'Fibra',
      value: fibraNum,
      target: 30,
      unit: 'g',
      icon: Wind,
      color: 'emerald' as const,
      bgColor: 'bg-green-50',
      textColor: 'text-green-600',
      description: 'Mejora la digestión y saciedad',
    },
  ];

  if (showProgress) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
        {macros.map((macro) => (
          <Tooltip key={macro.name} content={macro.description}>
            <div className="flex flex-col items-center">
              <CircularProgress
                value={macro.value}
                max={macro.target}
                color={macro.color}
                size={100}
              />
              <div className="mt-2 text-center">
                <div className="text-sm font-medium">{macro.name}</div>
                <div className={`text-xs ${macro.textColor}`}>
                  {macro.value}{macro.unit}
                </div>
              </div>
            </div>
          </Tooltip>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
      {macros.map((macro) => {
        const Icon = macro.icon;
        return (
          <Tooltip key={macro.name} content={macro.description}>
            <div
              className={`${macro.bgColor} rounded-lg p-4 text-center transition-all hover:shadow-md hover:scale-105 cursor-help`}
            >
              <Icon className={`h-6 w-6 ${macro.textColor} mx-auto mb-2`} />
              <div className={`text-2xl ${macro.textColor}`}>
                {macro.value}
                <span className="text-sm ml-1">{macro.unit}</span>
              </div>
              <div className="text-xs text-gray-600 mt-1">{macro.name}</div>
            </div>
          </Tooltip>
        );
      })}
    </div>
  );
}
