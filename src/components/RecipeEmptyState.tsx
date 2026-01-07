import React from 'react';
import { ChefHat, Sparkles, ArrowRight } from 'lucide-react';
import { Card, CardContent } from './ui/card';
import { Button } from './ui/button';

interface RecipeEmptyStateProps {
  onGetStarted?: () => void;
}

export default function RecipeEmptyState({ onGetStarted }: RecipeEmptyStateProps) {
  return (
    <Card className="border-2 border-dashed border-gray-300">
      <CardContent className="py-12">
        <div className="text-center max-w-md mx-auto">
          {/* Icon Animation */}
          <div className="relative inline-block mb-6">
            <div className="w-24 h-24 bg-gradient-to-br from-purple-100 to-pink-100 rounded-full flex items-center justify-center">
              <ChefHat className="w-12 h-12 text-purple-600 animate-bounce" />
            </div>
            <Sparkles className="w-6 h-6 text-yellow-500 absolute top-0 right-0 animate-pulse" />
            <Sparkles className="w-5 h-5 text-purple-500 absolute bottom-2 left-0 animate-pulse delay-150" />
          </div>

          {/* Message */}
          <h3 className="text-xl mb-2 text-gray-800">
            ¡Comienza a crear tus recetas!
          </h3>
          <p className="text-gray-600 mb-6">
            Selecciona tus ingredientes favoritos, ajusta las preferencias y deja que nuestra IA
            cree recetas personalizadas para ti.
          </p>

          {/* Quick Tips */}
          <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg p-4 mb-6 text-left">
            <p className="text-sm text-purple-900 mb-3 flex items-center gap-2">
              <Sparkles className="w-4 h-4" />
              <strong>Para empezar:</strong>
            </p>
            <ul className="space-y-2 text-sm text-gray-700">
              <li className="flex items-start gap-2">
                <span className="text-purple-600 mt-0.5">1.</span>
                <span>Agrega al menos 3-5 ingredientes que te gusten</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-purple-600 mt-0.5">2.</span>
                <span>Selecciona el tipo de comida (desayuno, almuerzo, etc.)</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-purple-600 mt-0.5">3.</span>
                <span>Ajusta la dificultad y número de porciones</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-purple-600 mt-0.5">4.</span>
                <span>Presiona "Generar Receta" y ¡listo!</span>
              </li>
            </ul>
          </div>

          {/* CTA Button */}
          {onGetStarted && (
            <Button
              onClick={onGetStarted}
              className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
            >
              Empezar ahora
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          )}

          {/* Fun Facts */}
          <div className="mt-8 grid grid-cols-3 gap-4 text-center">
            <div className="bg-blue-50 rounded-lg p-3">
              <div className="text-2xl mb-1">⚡</div>
              <p className="text-xs text-gray-600">Generación instantánea</p>
            </div>
            <div className="bg-green-50 rounded-lg p-3">
              <div className="text-2xl mb-1">🎯</div>
              <p className="text-xs text-gray-600">100% personalizado</p>
            </div>
            <div className="bg-purple-50 rounded-lg p-3">
              <div className="text-2xl mb-1">🌟</div>
              <p className="text-xs text-gray-600">45+ recetas base</p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
