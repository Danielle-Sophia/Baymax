import React, { useState, useEffect } from 'react';
import { Brain, Database, Zap, Shield, TrendingUp, CheckCircle, XCircle } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { projectId, publicAnonKey } from '../utils/supabase/info';

export default function RecipeEngineInfo() {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-3d05204c/recipes/stats`,
        {
          headers: {
            'Authorization': `Bearer ${publicAnonKey}`,
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        setStats(data);
      }
    } catch (error) {
      console.error('Error loading stats:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="py-8 text-center">
          <p className="text-gray-500">Cargando información del motor...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-xl p-6 text-white">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm">
            <Brain className="w-7 h-7" />
          </div>
          <div>
            <h1 className="text-white mb-1">Motor de Recetas IA Propio</h1>
            <p className="text-indigo-100 text-sm">
              {stats?.engine || 'Sistema de generación inteligente'}
            </p>
          </div>
        </div>
        <p className="text-indigo-100 text-sm">
          {stats?.message || 'Generador de recetas 100% autónomo'}
        </p>
      </div>

      {/* Advantages */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CheckCircle className="w-5 h-5 text-green-600" />
            Ventajas del Motor Propio
          </CardTitle>
          <CardDescription>Por qué es mejor que las APIs externas</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="flex items-start gap-3 p-3 bg-green-50 rounded-lg border border-green-200">
              <Zap className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-sm text-gray-900 mb-1">Velocidad Instantánea</p>
                <p className="text-xs text-gray-600">Sin esperas de APIs externas</p>
              </div>
            </div>

            <div className="flex items-start gap-3 p-3 bg-blue-50 rounded-lg border border-blue-200">
              <Shield className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-sm text-gray-900 mb-1">100% Seguro</p>
                <p className="text-xs text-gray-600">Respeta todas tus restricciones</p>
              </div>
            </div>

            <div className="flex items-start gap-3 p-3 bg-purple-50 rounded-lg border border-purple-200">
              <Database className="w-5 h-5 text-purple-600 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-sm text-gray-900 mb-1">Privacidad Total</p>
                <p className="text-xs text-gray-600">Tus datos nunca salen del sistema</p>
              </div>
            </div>

            <div className="flex items-start gap-3 p-3 bg-yellow-50 rounded-lg border border-yellow-200">
              <TrendingUp className="w-5 h-5 text-yellow-600 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-sm text-gray-900 mb-1">Sin Costos</p>
                <p className="text-xs text-gray-600">Gratis para siempre</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Statistics */}
      {stats?.stats && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Database className="w-5 h-5 text-indigo-600" />
              Estadísticas del Motor
            </CardTitle>
            <CardDescription>Capacidad actual del sistema</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {/* Total Recipes */}
              <div className="flex items-center justify-between p-3 bg-indigo-50 rounded-lg">
                <span className="text-sm text-gray-700">Total de Recetas</span>
                <Badge variant="secondary" className="bg-indigo-600 text-white">
                  {stats.stats.totalRecetas}
                </Badge>
              </div>

              {/* By Type */}
              <div>
                <p className="text-sm text-gray-700 mb-2">Recetas por Tipo</p>
                <div className="grid grid-cols-2 gap-2">
                  <div className="flex items-center justify-between p-2 bg-gray-50 rounded">
                    <span className="text-xs text-gray-600">Desayunos</span>
                    <span className="text-sm">{stats.stats.recetasPorTipo.desayuno}</span>
                  </div>
                  <div className="flex items-center justify-between p-2 bg-gray-50 rounded">
                    <span className="text-xs text-gray-600">Almuerzos</span>
                    <span className="text-sm">{stats.stats.recetasPorTipo.almuerzo}</span>
                  </div>
                  <div className="flex items-center justify-between p-2 bg-gray-50 rounded">
                    <span className="text-xs text-gray-600">Cenas</span>
                    <span className="text-sm">{stats.stats.recetasPorTipo.cena}</span>
                  </div>
                  <div className="flex items-center justify-between p-2 bg-gray-50 rounded">
                    <span className="text-xs text-gray-600">Snacks</span>
                    <span className="text-sm">{stats.stats.recetasPorTipo.snack}</span>
                  </div>
                </div>
              </div>

              {/* By Difficulty */}
              <div>
                <p className="text-sm text-gray-700 mb-2">Recetas por Dificultad</p>
                <div className="grid grid-cols-3 gap-2">
                  <div className="flex flex-col items-center p-2 bg-green-50 rounded border border-green-200">
                    <span className="text-xs text-gray-600 mb-1">Fácil</span>
                    <span className="text-lg text-green-700">{stats.stats.recetasPorDificultad.fácil}</span>
                  </div>
                  <div className="flex flex-col items-center p-2 bg-yellow-50 rounded border border-yellow-200">
                    <span className="text-xs text-gray-600 mb-1">Intermedio</span>
                    <span className="text-lg text-yellow-700">{stats.stats.recetasPorDificultad.intermedio}</span>
                  </div>
                  <div className="flex flex-col items-center p-2 bg-red-50 rounded border border-red-200">
                    <span className="text-xs text-gray-600 mb-1">Avanzado</span>
                    <span className="text-lg text-red-700">{stats.stats.recetasPorDificultad.avanzado}</span>
                  </div>
                </div>
              </div>

              {/* Total Ingredients */}
              <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                <span className="text-sm text-gray-700">Ingredientes Catalogados</span>
                <Badge variant="secondary" className="bg-green-600 text-white">
                  {stats.stats.totalIngredientes}+
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* How it works */}
      <Card>
        <CardHeader>
          <CardTitle>¿Cómo Funciona?</CardTitle>
          <CardDescription>Sistema inteligente basado en reglas</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center flex-shrink-0">
              1
            </div>
            <div>
              <p className="text-sm mb-1">Analiza tus restricciones</p>
              <p className="text-xs text-gray-600">Alergias, alimentos no deseados y preferencias</p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="w-8 h-8 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center flex-shrink-0">
              2
            </div>
            <div>
              <p className="text-sm mb-1">Selecciona recetas compatibles</p>
              <p className="text-xs text-gray-600">Filtra por tipo, dificultad y tiempo</p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="w-8 h-8 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center flex-shrink-0">
              3
            </div>
            <div>
              <p className="text-sm mb-1">Sustituye ingredientes si es necesario</p>
              <p className="text-xs text-gray-600">Reemplaza automáticamente ingredientes restringidos</p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="w-8 h-8 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center flex-shrink-0">
              4
            </div>
            <div>
              <p className="text-sm mb-1">Calcula información nutricional</p>
              <p className="text-xs text-gray-600">Ajusta calorías y macros por porción</p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="w-8 h-8 bg-green-100 text-green-600 rounded-full flex items-center justify-center flex-shrink-0">
              ✓
            </div>
            <div>
              <p className="text-sm mb-1">Entrega receta personalizada</p>
              <p className="text-xs text-gray-600">100% adaptada a ti, instantáneamente</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Comparison Table */}
      <Card>
        <CardHeader>
          <CardTitle>Comparación con APIs Externas</CardTitle>
          <CardDescription>Motor propio vs OpenAI / ChatGPT</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-2 px-2">Aspecto</th>
                  <th className="text-center py-2 px-2">Motor Propio</th>
                  <th className="text-center py-2 px-2">API Externa</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b">
                  <td className="py-2 px-2">Velocidad</td>
                  <td className="text-center">
                    <CheckCircle className="w-5 h-5 text-green-600 inline" />
                    <p className="text-xs text-gray-600">Instantáneo</p>
                  </td>
                  <td className="text-center">
                    <XCircle className="w-5 h-5 text-gray-400 inline" />
                    <p className="text-xs text-gray-600">2-5 seg</p>
                  </td>
                </tr>
                <tr className="border-b">
                  <td className="py-2 px-2">Costo</td>
                  <td className="text-center">
                    <CheckCircle className="w-5 h-5 text-green-600 inline" />
                    <p className="text-xs text-gray-600">Gratis</p>
                  </td>
                  <td className="text-center">
                    <XCircle className="w-5 h-5 text-gray-400 inline" />
                    <p className="text-xs text-gray-600">$$ por uso</p>
                  </td>
                </tr>
                <tr className="border-b">
                  <td className="py-2 px-2">Restricciones</td>
                  <td className="text-center">
                    <CheckCircle className="w-5 h-5 text-green-600 inline" />
                    <p className="text-xs text-gray-600">100% seguro</p>
                  </td>
                  <td className="text-center">
                    <XCircle className="w-5 h-5 text-gray-400 inline" />
                    <p className="text-xs text-gray-600">Puede fallar</p>
                  </td>
                </tr>
                <tr className="border-b">
                  <td className="py-2 px-2">Privacidad</td>
                  <td className="text-center">
                    <CheckCircle className="w-5 h-5 text-green-600 inline" />
                    <p className="text-xs text-gray-600">Total</p>
                  </td>
                  <td className="text-center">
                    <XCircle className="w-5 h-5 text-gray-400 inline" />
                    <p className="text-xs text-gray-600">Externa</p>
                  </td>
                </tr>
                <tr>
                  <td className="py-2 px-2">Control</td>
                  <td className="text-center">
                    <CheckCircle className="w-5 h-5 text-green-600 inline" />
                    <p className="text-xs text-gray-600">Completo</p>
                  </td>
                  <td className="text-center">
                    <XCircle className="w-5 h-5 text-gray-400 inline" />
                    <p className="text-xs text-gray-600">Limitado</p>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Info Badge */}
      <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
          <div>
            <p className="text-sm text-gray-900 mb-1">Motor 100% Autónomo</p>
            <p className="text-xs text-gray-600">
              Este sistema no depende de ninguna API externa. Todas las recetas se generan
              localmente usando un motor inteligente basado en reglas, garantizando velocidad,
              privacidad y confiabilidad total.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
