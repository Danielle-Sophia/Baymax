import React from 'react';
import { TrendingUp, Heart, History, Sparkles } from 'lucide-react';
import { Card, CardContent } from './ui/card';

interface RecipeStatsProps {
  totalGenerated?: number;
  totalFavorites?: number;
  weeklyGenerated?: number;
}

export default function RecipeStats({
  totalGenerated = 0,
  totalFavorites = 0,
  weeklyGenerated = 0,
}: RecipeStatsProps) {
  const stats = [
    {
      icon: History,
      label: 'Recetas Generadas',
      value: totalGenerated,
      color: 'from-blue-500 to-cyan-500',
      bgColor: 'bg-blue-50',
      textColor: 'text-blue-700',
    },
    {
      icon: Heart,
      label: 'Favoritas',
      value: totalFavorites,
      color: 'from-pink-500 to-rose-500',
      bgColor: 'bg-pink-50',
      textColor: 'text-pink-700',
    },
    {
      icon: TrendingUp,
      label: 'Esta Semana',
      value: weeklyGenerated,
      color: 'from-green-500 to-emerald-500',
      bgColor: 'bg-green-50',
      textColor: 'text-green-700',
    },
  ];

  if (totalGenerated === 0 && totalFavorites === 0 && weeklyGenerated === 0) {
    return null;
  }

  return (
    <Card className="bg-gradient-to-br from-purple-50 to-pink-50 border-purple-200">
      <CardContent className="pt-4">
        <div className="flex items-center gap-2 mb-3">
          <Sparkles className="w-4 h-4 text-purple-600" />
          <h4 className="text-sm text-purple-900">Tus Estadísticas</h4>
        </div>

        <div className="grid grid-cols-3 gap-2">
          {stats.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <div
                key={index}
                className={`${stat.bgColor} rounded-lg p-2 text-center transition-all hover:scale-105 cursor-default`}
              >
                <div className={`w-8 h-8 bg-gradient-to-br ${stat.color} rounded-full flex items-center justify-center mx-auto mb-1`}>
                  <Icon className="w-4 h-4 text-white" />
                </div>
                <div className={`text-xl ${stat.textColor}`}>{stat.value}</div>
                <div className="text-xs text-gray-600 mt-0.5">{stat.label}</div>
              </div>
            );
          })}
        </div>

        {totalGenerated >= 10 && (
          <div className="mt-3 bg-yellow-50 border border-yellow-200 rounded-lg p-2">
            <p className="text-xs text-yellow-800 flex items-center gap-1">
              <Sparkles className="w-3 h-3" />
              ¡Increíble! Ya has generado {totalGenerated} recetas. Eres todo un chef digital 👨‍🍳
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
