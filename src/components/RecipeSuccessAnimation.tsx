import React, { useEffect, useState } from 'react';
import { CheckCircle, Sparkles, ChefHat } from 'lucide-react';

interface RecipeSuccessAnimationProps {
  recipeName: string;
  onComplete?: () => void;
}

export default function RecipeSuccessAnimation({
  recipeName,
  onComplete,
}: RecipeSuccessAnimationProps) {
  const [show, setShow] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setShow(false);
      onComplete?.();
    }, 3000);

    return () => clearTimeout(timer);
  }, [onComplete]);

  if (!show) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 pointer-events-none">
      <div className="relative animate-in zoom-in duration-500">
        {/* Confetti effect */}
        <div className="absolute inset-0 flex items-center justify-center">
          {[...Array(8)].map((_, i) => (
            <div
              key={i}
              className="absolute w-2 h-2 bg-gradient-to-r from-purple-400 to-pink-400 rounded-full animate-ping"
              style={{
                top: `${Math.random() * 100}%`,
                left: `${Math.random() * 100}%`,
                animationDelay: `${i * 0.1}s`,
                animationDuration: '1s',
              }}
            />
          ))}
        </div>

        {/* Success card */}
        <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md border-4 border-emerald-400 animate-in slide-in-from-bottom-8 duration-500">
          <div className="text-center">
            <div className="relative inline-block mb-4">
              <ChefHat className="w-20 h-20 text-emerald-600 animate-bounce" />
              <CheckCircle className="w-8 h-8 text-emerald-600 absolute -top-1 -right-1 animate-in zoom-in duration-300 delay-300" />
            </div>

            <h2 className="text-2xl mb-2 text-emerald-600 flex items-center justify-center gap-2">
              <Sparkles className="w-6 h-6 animate-pulse" />
              ¡Receta Lista!
              <Sparkles className="w-6 h-6 animate-pulse" />
            </h2>

            <p className="text-gray-700 mb-1">Tu receta personalizada está lista:</p>
            <p className="font-medium text-purple-600">{recipeName}</p>

            <div className="mt-4 flex justify-center gap-2">
              {['🎉', '👨‍🍳', '🍽️', '😋'].map((emoji, i) => (
                <span
                  key={i}
                  className="text-3xl animate-bounce"
                  style={{ animationDelay: `${i * 0.1}s` }}
                >
                  {emoji}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
