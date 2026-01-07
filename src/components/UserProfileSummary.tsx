import React from 'react';
import { User, Target, AlertCircle, Check } from 'lucide-react';
import { Card, CardContent } from './ui/card';
import { Badge } from './ui/badge';

interface UserProfileSummaryProps {
  userProfile?: {
    age?: number;
    weight?: number;
    height?: number;
    goal?: string;
    tmb?: number;
    allergies?: string[];
    dietaryPreferences?: string[];
  };
}

export default function UserProfileSummary({ userProfile }: UserProfileSummaryProps) {
  if (!userProfile || !userProfile.tmb) {
    return (
      <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200">
        <CardContent className="pt-4">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
            <div>
              <h4 className="text-sm mb-1 text-blue-900">Perfil sin configurar</h4>
              <p className="text-xs text-blue-700">
                Configura tu perfil para obtener recetas más personalizadas basadas en tu TMB y objetivos.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  const goalEmojis: Record<string, string> = {
    'perder_peso': '📉',
    'ganar_masa': '💪',
    'mantener': '⚖️',
  };

  const goalLabels: Record<string, string> = {
    'perder_peso': 'Perder Peso',
    'ganar_masa': 'Ganar Masa Muscular',
    'mantener': 'Mantener Peso',
  };

  return (
    <Card className="bg-gradient-to-br from-emerald-50 to-teal-50 border-emerald-200">
      <CardContent className="pt-4">
        <div className="flex items-start gap-3 mb-3">
          <div className="w-10 h-10 bg-emerald-100 rounded-full flex items-center justify-center flex-shrink-0">
            <User className="w-5 h-5 text-emerald-600" />
          </div>
          <div className="flex-1">
            <h4 className="text-sm mb-1 text-emerald-900 flex items-center gap-2">
              <Check className="w-4 h-4" />
              Perfil Configurado
            </h4>
            <p className="text-xs text-emerald-700">
              Tus recetas se adaptan a tus necesidades nutricionales
            </p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2 mb-3">
          <div className="bg-white/60 rounded-lg p-2">
            <p className="text-xs text-gray-600">TMB Diaria</p>
            <p className="text-sm font-medium text-emerald-700">{userProfile.tmb} kcal</p>
          </div>
          {userProfile.goal && (
            <div className="bg-white/60 rounded-lg p-2">
              <p className="text-xs text-gray-600">Objetivo</p>
              <p className="text-sm font-medium text-emerald-700 flex items-center gap-1">
                {goalEmojis[userProfile.goal] || '🎯'}
                {goalLabels[userProfile.goal] || userProfile.goal}
              </p>
            </div>
          )}
        </div>

        {(userProfile.allergies && userProfile.allergies.length > 0) || 
         (userProfile.dietaryPreferences && userProfile.dietaryPreferences.length > 0) ? (
          <div className="space-y-2">
            {userProfile.allergies && userProfile.allergies.length > 0 && (
              <div>
                <p className="text-xs text-gray-600 mb-1">Alergias:</p>
                <div className="flex flex-wrap gap-1">
                  {userProfile.allergies.map((allergy) => (
                    <Badge
                      key={allergy}
                      variant="outline"
                      className="text-xs bg-red-50 text-red-700 border-red-200"
                    >
                      🚫 {allergy}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {userProfile.dietaryPreferences && userProfile.dietaryPreferences.length > 0 && (
              <div>
                <p className="text-xs text-gray-600 mb-1">Preferencias:</p>
                <div className="flex flex-wrap gap-1">
                  {userProfile.dietaryPreferences.map((pref) => (
                    <Badge
                      key={pref}
                      variant="outline"
                      className="text-xs bg-green-50 text-green-700 border-green-200"
                    >
                      ✓ {pref}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </div>
        ) : (
          <p className="text-xs text-emerald-600 flex items-center gap-1">
            <Target className="w-3 h-3" />
            Sin restricciones alimenticias
          </p>
        )}
      </CardContent>
    </Card>
  );
}
