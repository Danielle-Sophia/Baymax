import React, { useState } from 'react';
import { Lightbulb, X, ChevronRight } from 'lucide-react';
import { Card, CardContent } from './ui/card';
import { Button } from './ui/button';

interface Tip {
  id: number;
  title: string;
  description: string;
  icon: string;
}

const TIPS: Tip[] = [
  {
    id: 1,
    title: 'Combina proteínas y vegetales',
    description: 'Para recetas balanceadas, asegúrate de incluir al menos una fuente de proteína y 2-3 vegetales.',
    icon: '🥗',
  },
  {
    id: 2,
    title: 'Especifica tus ingredientes',
    description: 'Mientras más ingredientes agregues, más personalizada será tu receta. Intenta agregar al menos 3-5.',
    icon: '🎯',
  },
  {
    id: 3,
    title: 'Usa ingredientes de temporada',
    description: 'Los ingredientes frescos y de temporada no solo son más nutritivos, sino también más económicos.',
    icon: '🌱',
  },
  {
    id: 4,
    title: 'Ajusta las porciones',
    description: 'Puedes generar recetas para 1-8 personas. Las cantidades se ajustarán automáticamente.',
    icon: '👨‍👩‍👧‍👦',
  },
  {
    id: 5,
    title: 'Guarda tus favoritas',
    description: 'Usa el botón de corazón ❤️ para guardar recetas que te gusten y acceder a ellas fácilmente.',
    icon: '⭐',
  },
  {
    id: 6,
    title: 'Experimenta con dificultades',
    description: 'Si eres principiante, empieza con recetas fáciles. Cuando te sientas cómodo, prueba niveles más avanzados.',
    icon: '📈',
  },
];

export default function QuickTips() {
  const [currentTipIndex, setCurrentTipIndex] = useState(0);
  const [isVisible, setIsVisible] = useState(true);

  const currentTip = TIPS[currentTipIndex];

  const nextTip = () => {
    setCurrentTipIndex((prev) => (prev + 1) % TIPS.length);
  };

  if (!isVisible) {
    return (
      <Button
        variant="outline"
        size="sm"
        onClick={() => setIsVisible(true)}
        className="w-full"
      >
        <Lightbulb className="w-4 h-4 mr-2" />
        Ver consejos útiles
      </Button>
    );
  }

  return (
    <Card className="bg-gradient-to-br from-amber-50 to-yellow-50 border-amber-200">
      <CardContent className="pt-4">
        <div className="flex items-start justify-between mb-2">
          <div className="flex items-center gap-2">
            <Lightbulb className="w-5 h-5 text-amber-600" />
            <span className="text-xs font-medium text-amber-900">Consejo #{currentTip.id}</span>
          </div>
          <button
            onClick={() => setIsVisible(false)}
            className="text-amber-600 hover:text-amber-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="mb-3">
          <h4 className="text-sm mb-1 flex items-center gap-2">
            <span>{currentTip.icon}</span>
            <span>{currentTip.title}</span>
          </h4>
          <p className="text-xs text-gray-700">{currentTip.description}</p>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex gap-1">
            {TIPS.map((_, index) => (
              <div
                key={index}
                className={`h-1 w-6 rounded-full transition-colors ${
                  index === currentTipIndex ? 'bg-amber-600' : 'bg-amber-200'
                }`}
              />
            ))}
          </div>
          <Button
            size="sm"
            variant="ghost"
            onClick={nextTip}
            className="text-amber-700 hover:text-amber-900 hover:bg-amber-100 text-xs h-7"
          >
            Siguiente
            <ChevronRight className="w-3 h-3 ml-1" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
