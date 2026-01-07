import React, { useState } from 'react';
import { Brain, CheckCircle, XCircle, Info, ChevronDown, ChevronUp } from 'lucide-react';

export function PrologInfo() {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div className="bg-gradient-to-r from-purple-50 to-blue-50 rounded-xl border border-purple-200 overflow-hidden">
      {/* Header */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full p-4 flex items-center justify-between hover:bg-white/50 transition"
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-purple-600 rounded-lg flex items-center justify-center">
            <Brain className="w-6 h-6 text-white" />
          </div>
          <div className="text-left">
            <h3 className="text-purple-900">Motor de Lógica de Predicados</h3>
            <p className="text-sm text-purple-600">Sistema basado en Prolog para generación inteligente de menús</p>
          </div>
        </div>
        {isExpanded ? (
          <ChevronUp className="w-5 h-5 text-purple-600" />
        ) : (
          <ChevronDown className="w-5 h-5 text-purple-600" />
        )}
      </button>

      {/* Content */}
      {isExpanded && (
        <div className="p-6 pt-2 space-y-6 border-t border-purple-200">
          {/* Qué es Prolog */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Info className="w-5 h-5 text-blue-600" />
              <h4 className="text-blue-900">¿Qué es la Lógica de Predicados?</h4>
            </div>
            <p className="text-gray-700 leading-relaxed">
              En lugar de usar algoritmos tradicionales, este sistema utiliza <strong>lógica de predicados de primer orden</strong> (como Prolog) 
              para generar tus menús. Define <strong>hechos</strong> sobre alimentos y <strong>reglas lógicas</strong> sobre nutrición, 
              y el motor de inferencia encuentra las mejores combinaciones automáticamente.
            </p>
          </div>

          {/* Reglas Aplicadas */}
          <div>
            <h4 className="text-blue-900 mb-3">Reglas Lógicas Aplicadas</h4>
            <div className="space-y-3">
              <div className="flex items-start gap-3 bg-white p-3 rounded-lg">
                <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-gray-900">
                    <code className="text-sm bg-gray-100 px-2 py-0.5 rounded">es_apto(Alimento, Restricciones)</code>
                  </p>
                  <p className="text-sm text-gray-600 mt-1">
                    Verifica que el alimento no contenga alérgenos ni ingredientes no deseados
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 bg-white p-3 rounded-lg">
                <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-gray-900">
                    <code className="text-sm bg-gray-100 px-2 py-0.5 rounded">en_rango_calorico(Alimento, Objetivo)</code>
                  </p>
                  <p className="text-sm text-gray-600 mt-1">
                    Asegura que las calorías estén dentro del ±15% del objetivo
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 bg-white p-3 rounded-lg">
                <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-gray-900">
                    <code className="text-sm bg-gray-100 px-2 py-0.5 rounded">es_balanceado(Alimento)</code>
                  </p>
                  <p className="text-sm text-gray-600 mt-1">
                    Valida proporciones nutricionales: proteínas 20-35%, carbohidratos 45-65%, grasas 20-35%
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 bg-white p-3 rounded-lg">
                <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-gray-900">
                    <code className="text-sm bg-gray-100 px-2 py-0.5 rounded">hay_variedad(Comidas)</code>
                  </p>
                  <p className="text-sm text-gray-600 mt-1">
                    Garantiza diversidad evitando repeticiones en el plan
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 bg-white p-3 rounded-lg">
                <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-gray-900">
                    <code className="text-sm bg-gray-100 px-2 py-0.5 rounded">ingredientes_diversos(Comidas)</code>
                  </p>
                  <p className="text-sm text-gray-600 mt-1">
                    Verifica que haya diversidad de ingredientes principales
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Cómo Funciona */}
          <div>
            <h4 className="text-blue-900 mb-3">Proceso de Inferencia</h4>
            <div className="space-y-2">
              <div className="flex items-center gap-3 text-sm text-gray-700">
                <div className="w-6 h-6 bg-purple-600 text-white rounded-full flex items-center justify-center flex-shrink-0">1</div>
                <p>El motor consulta la base de conocimiento con tus restricciones</p>
              </div>
              <div className="flex items-center gap-3 text-sm text-gray-700">
                <div className="w-6 h-6 bg-purple-600 text-white rounded-full flex items-center justify-center flex-shrink-0">2</div>
                <p>Aplica reglas lógicas para filtrar alimentos aptos</p>
              </div>
              <div className="flex items-center gap-3 text-sm text-gray-700">
                <div className="w-6 h-6 bg-purple-600 text-white rounded-full flex items-center justify-center flex-shrink-0">3</div>
                <p>Verifica balance nutricional y rango calórico</p>
              </div>
              <div className="flex items-center gap-3 text-sm text-gray-700">
                <div className="w-6 h-6 bg-purple-600 text-white rounded-full flex items-center justify-center flex-shrink-0">4</div>
                <p>Asegura variedad e ingredientes diversos</p>
              </div>
              <div className="flex items-center gap-3 text-sm text-gray-700">
                <div className="w-6 h-6 bg-purple-600 text-white rounded-full flex items-center justify-center flex-shrink-0">5</div>
                <p>Si no hay solución, relaja restricciones automáticamente (backtracking)</p>
              </div>
            </div>
          </div>

          {/* Ventajas */}
          <div>
            <h4 className="text-blue-900 mb-3">Ventajas del Sistema</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="bg-green-50 p-3 rounded-lg border border-green-200">
                <p className="text-green-900">✓ Explica sus decisiones</p>
                <p className="text-sm text-green-700 mt-1">Puedes ver por qué se seleccionó cada comida</p>
              </div>
              <div className="bg-green-50 p-3 rounded-lg border border-green-200">
                <p className="text-green-900">✓ Flexible y adaptable</p>
                <p className="text-sm text-green-700 mt-1">Se ajusta automáticamente a tus restricciones</p>
              </div>
              <div className="bg-green-50 p-3 rounded-lg border border-green-200">
                <p className="text-green-900">✓ Garantiza cumplimiento</p>
                <p className="text-sm text-green-700 mt-1">Todas las reglas nutricionales se satisfacen</p>
              </div>
              <div className="bg-green-50 p-3 rounded-lg border border-green-200">
                <p className="text-green-900">✓ Fácil de extender</p>
                <p className="text-sm text-green-700 mt-1">Agregar nuevas reglas es simple</p>
              </div>
            </div>
          </div>

          {/* Base de Conocimiento */}
          <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
            <h4 className="text-blue-900 mb-2">Base de Conocimiento Actual</h4>
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <p className="text-2xl text-blue-600">21</p>
                <p className="text-sm text-blue-700">Alimentos</p>
              </div>
              <div>
                <p className="text-2xl text-blue-600">7</p>
                <p className="text-sm text-blue-700">Desayunos</p>
              </div>
              <div>
                <p className="text-2xl text-blue-600">7</p>
                <p className="text-sm text-blue-700">Almuerzos</p>
              </div>
            </div>
            <div className="text-center mt-2">
              <p className="text-2xl text-blue-600">7</p>
              <p className="text-sm text-blue-700">Cenas</p>
            </div>
          </div>

          {/* Example Query */}
          <div className="bg-gray-50 p-4 rounded-lg border border-gray-300">
            <h4 className="text-gray-900 mb-2">Ejemplo de Consulta Lógica</h4>
            <div className="bg-gray-900 text-green-400 p-3 rounded font-mono text-sm">
              <p className="text-purple-400">% Consulta en sintaxis Prolog:</p>
              <p className="mt-1">?- seleccionar_comida(desayuno, 350, [nueces], [], Comida).</p>
              <p className="mt-2 text-yellow-400">% Resultado:</p>
              <p className="text-white">Comida = huevos_tostadas</p>
              <p className="text-gray-500 mt-2">% Razón: cumple todas las reglas y NO contiene nueces</p>
            </div>
          </div>

          {/* Footer */}
          <div className="text-center pt-4 border-t border-purple-200">
            <p className="text-sm text-gray-600">
              Para más información técnica, consulta la documentación en{' '}
              <code className="bg-gray-100 px-2 py-1 rounded text-xs">MOTOR_PROLOG.md</code>
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
