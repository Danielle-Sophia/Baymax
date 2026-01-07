import React, { useState, useEffect } from 'react';
import { Loader2, CheckCircle } from 'lucide-react';

interface Step {
  id: number;
  label: string;
  duration: number;
}

const GENERATION_STEPS: Step[] = [
  { id: 1, label: 'Analizando tu perfil', duration: 500 },
  { id: 2, label: 'Revisando restricciones', duration: 600 },
  { id: 3, label: 'Seleccionando ingredientes', duration: 700 },
  { id: 4, label: 'Adaptando receta', duration: 800 },
  { id: 5, label: 'Calculando nutrición', duration: 500 },
  { id: 6, label: 'Finalizando receta', duration: 400 },
];

export default function RecipeGenerationProgress() {
  const [currentStep, setCurrentStep] = useState(0);

  useEffect(() => {
    if (currentStep < GENERATION_STEPS.length) {
      const timer = setTimeout(() => {
        setCurrentStep(currentStep + 1);
      }, GENERATION_STEPS[currentStep]?.duration || 500);

      return () => clearTimeout(timer);
    }
  }, [currentStep]);

  return (
    <div className="space-y-4">
      <div className="text-center mb-6">
        <Loader2 className="h-12 w-12 animate-spin text-purple-600 mx-auto mb-4" />
        <h3 className="text-purple-600 mb-2">Generando tu receta perfecta</h3>
        <p className="text-sm text-gray-600">
          Nuestro motor de IA está trabajando en tu receta personalizada...
        </p>
      </div>

      <div className="space-y-3">
        {GENERATION_STEPS.map((step, index) => {
          const isCompleted = index < currentStep;
          const isCurrent = index === currentStep;

          return (
            <div
              key={step.id}
              className={`flex items-center gap-3 p-3 rounded-lg transition-all duration-300 ${
                isCurrent
                  ? 'bg-purple-50 border-2 border-purple-200 scale-105'
                  : isCompleted
                  ? 'bg-green-50 border border-green-200'
                  : 'bg-gray-50 border border-gray-200 opacity-50'
              }`}
            >
              <div className="flex-shrink-0">
                {isCompleted ? (
                  <CheckCircle className="h-5 w-5 text-green-600" />
                ) : isCurrent ? (
                  <Loader2 className="h-5 w-5 text-purple-600 animate-spin" />
                ) : (
                  <div className="h-5 w-5 rounded-full border-2 border-gray-300" />
                )}
              </div>
              <span
                className={`text-sm ${
                  isCurrent
                    ? 'text-purple-700 font-medium'
                    : isCompleted
                    ? 'text-green-700'
                    : 'text-gray-500'
                }`}
              >
                {step.label}
              </span>
            </div>
          );
        })}
      </div>

      <div className="mt-6">
        <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-purple-600 to-pink-600 transition-all duration-500 ease-out"
            style={{
              width: `${(currentStep / GENERATION_STEPS.length) * 100}%`,
            }}
          />
        </div>
        <div className="text-center text-sm text-gray-600 mt-2">
          {Math.round((currentStep / GENERATION_STEPS.length) * 100)}% completado
        </div>
      </div>
    </div>
  );
}
