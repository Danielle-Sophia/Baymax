import React, { useState } from 'react';
import { ChevronDown, ChevronUp, CheckCircle, Circle } from 'lucide-react';
import { Card, CardContent } from './ui/card';
import { Button } from './ui/button';

interface RecipeStep {
  paso: number;
  instruccion: string;
}

interface RecipeStepsProps {
  steps: RecipeStep[];
  defaultExpanded?: boolean;
}

export default function RecipeSteps({ steps, defaultExpanded = true }: RecipeStepsProps) {
  const [expanded, setExpanded] = useState(defaultExpanded);
  const [completedSteps, setCompletedSteps] = useState<number[]>([]);

  const toggleStep = (stepNumber: number) => {
    setCompletedSteps((prev) =>
      prev.includes(stepNumber)
        ? prev.filter((s) => s !== stepNumber)
        : [...prev, stepNumber]
    );
  };

  const allCompleted = completedSteps.length === steps.length;

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <h3 className="text-lg">📝 Instrucciones</h3>
          {allCompleted && (
            <span className="text-xs text-green-600 bg-green-50 px-2 py-1 rounded-full animate-in fade-in">
              ✓ Completado
            </span>
          )}
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setExpanded(!expanded)}
          className="text-gray-600"
        >
          {expanded ? (
            <>
              Ocultar <ChevronUp className="w-4 h-4 ml-1" />
            </>
          ) : (
            <>
              Mostrar {steps.length} pasos <ChevronDown className="w-4 h-4 ml-1" />
            </>
          )}
        </Button>
      </div>

      {/* Progress Bar */}
      {completedSteps.length > 0 && (
        <div className="mb-3">
          <div className="flex items-center justify-between text-xs text-gray-600 mb-1">
            <span>Progreso</span>
            <span>{completedSteps.length} / {steps.length}</span>
          </div>
          <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-green-500 to-emerald-500 transition-all duration-500 ease-out"
              style={{ width: `${(completedSteps.length / steps.length) * 100}%` }}
            />
          </div>
        </div>
      )}

      {/* Steps */}
      {expanded && (
        <div className="space-y-3 animate-in slide-in-from-top duration-300">
          {steps.map((step, index) => {
            const isCompleted = completedSteps.includes(step.paso);
            return (
              <Card
                key={step.paso}
                className={`transition-all duration-300 hover:shadow-md cursor-pointer ${
                  isCompleted ? 'bg-green-50 border-green-200' : 'hover:border-purple-300'
                }`}
                onClick={() => toggleStep(step.paso)}
                style={{
                  animationDelay: `${index * 50}ms`,
                }}
              >
                <CardContent className="p-4">
                  <div className="flex gap-3">
                    {/* Step Number / Checkbox */}
                    <div className="flex-shrink-0">
                      {isCompleted ? (
                        <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center text-white animate-in zoom-in duration-200">
                          <CheckCircle className="w-5 h-5" />
                        </div>
                      ) : (
                        <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center text-purple-600 hover:bg-purple-200 transition-colors">
                          <span className="text-sm">{step.paso}</span>
                        </div>
                      )}
                    </div>

                    {/* Instruction */}
                    <div className="flex-1 pt-1">
                      <p
                        className={`text-sm transition-all ${
                          isCompleted
                            ? 'text-green-800 line-through opacity-70'
                            : 'text-gray-700'
                        }`}
                      >
                        {step.instruccion}
                      </p>
                    </div>

                    {/* Hover Icon */}
                    <div className="flex-shrink-0 pt-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Circle className="w-4 h-4 text-gray-400" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Quick Actions */}
      {expanded && steps.length > 0 && (
        <div className="mt-3 flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCompletedSteps(steps.map((s) => s.paso))}
            className="text-xs"
            disabled={allCompleted}
          >
            Marcar todos
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCompletedSteps([])}
            className="text-xs"
            disabled={completedSteps.length === 0}
          >
            Limpiar
          </Button>
        </div>
      )}
    </div>
  );
}
