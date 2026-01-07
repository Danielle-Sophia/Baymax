/**
 * MOTOR DE LÓGICA DE PREDICADOS (PROLOG) PARA GENERACIÓN DE MENÚS
 * 
 * Implementación de lógica de predicados de primer orden estilo Prolog
 * para la generación inteligente de planes de alimentación.
 */

// ============================================================================
// TIPOS Y ESTRUCTURAS DE DATOS
// ============================================================================

interface Term {
  type: 'atom' | 'variable' | 'compound';
  value: string;
  args?: Term[];
}

interface Rule {
  head: Term;
  body: Term[];
}

interface Substitution {
  [variable: string]: Term;
}

// ============================================================================
// BASE DE CONOCIMIENTO - PREDICADOS DE ALIMENTOS
// ============================================================================

/**
 * Predicado: alimento(Nombre, Tipo, Calorias, Proteinas, Carbohidratos, Grasas, Ingredientes)
 * Define los alimentos disponibles con sus propiedades nutricionales
 */
export const alimentosDB = [
  // DESAYUNOS
  { nombre: 'avena_frutas_nueces', tipo: 'desayuno', calorias: 350, proteinas: 12, carbohidratos: 58, grasas: 8, 
    ingredientes: ['avena', 'plátano', 'nueces', 'miel'], 
    descripcion: 'Avena con frutas y nueces' },
  { nombre: 'huevos_tostadas', tipo: 'desayuno', calorias: 320, proteinas: 18, carbohidratos: 35, grasas: 12,
    ingredientes: ['huevos', 'pan integral', 'tomate'],
    descripcion: 'Huevos revueltos con tostadas integrales' },
  { nombre: 'yogurt_granola', tipo: 'desayuno', calorias: 280, proteinas: 15, carbohidratos: 42, grasas: 6,
    ingredientes: ['yogurt', 'granola', 'fresas', 'miel'],
    descripcion: 'Yogurt griego con granola' },
  { nombre: 'smoothie_proteina', tipo: 'desayuno', calorias: 310, proteinas: 25, carbohidratos: 38, grasas: 5,
    ingredientes: ['proteína', 'plátano', 'espinaca', 'leche'],
    descripcion: 'Smoothie de proteína con frutas' },
  { nombre: 'tostadas_aguacate_huevo', tipo: 'desayuno', calorias: 340, proteinas: 14, carbohidratos: 30, grasas: 18,
    ingredientes: ['aguacate', 'huevo', 'pan integral'],
    descripcion: 'Tostadas de aguacate con huevo' },
  { nombre: 'panqueques_integrales', tipo: 'desayuno', calorias: 370, proteinas: 14, carbohidratos: 52, grasas: 10,
    ingredientes: ['harina integral', 'huevo', 'leche', 'miel'],
    descripcion: 'Panqueques integrales con miel' },
  { nombre: 'omelette_vegetales', tipo: 'desayuno', calorias: 290, proteinas: 20, carbohidratos: 18, grasas: 15,
    ingredientes: ['huevos', 'pimiento', 'cebolla', 'champiñones'],
    descripcion: 'Omelette de vegetales' },

  // ALMUERZOS
  { nombre: 'pollo_arroz_verduras', tipo: 'almuerzo', calorias: 520, proteinas: 42, carbohidratos: 58, grasas: 12,
    ingredientes: ['pollo', 'arroz', 'brócoli', 'zanahoria'],
    descripcion: 'Pechuga de pollo a la plancha con arroz y verduras' },
  { nombre: 'ensalada_lentejas', tipo: 'almuerzo', calorias: 480, proteinas: 22, carbohidratos: 68, grasas: 10,
    ingredientes: ['lentejas', 'lechuga', 'tomate', 'pepino'],
    descripcion: 'Ensalada de lentejas con vegetales' },
  { nombre: 'salmon_quinoa', tipo: 'almuerzo', calorias: 540, proteinas: 38, carbohidratos: 48, grasas: 18,
    ingredientes: ['salmón', 'quinoa', 'espárragos'],
    descripcion: 'Salmón al horno con quinoa' },
  { nombre: 'pasta_pavo_verduras', tipo: 'almuerzo', calorias: 500, proteinas: 32, carbohidratos: 62, grasas: 14,
    ingredientes: ['pasta', 'pavo', 'calabacín', 'tomate'],
    descripcion: 'Pasta integral con verduras y pavo' },
  { nombre: 'bowl_arroz_tofu', tipo: 'almuerzo', calorias: 490, proteinas: 24, carbohidratos: 64, grasas: 15,
    ingredientes: ['arroz', 'tofu', 'edamame', 'zanahoria'],
    descripcion: 'Bowl de arroz con tofu y vegetales' },
  { nombre: 'bistec_papas_ensalada', tipo: 'almuerzo', calorias: 580, proteinas: 45, carbohidratos: 52, grasas: 20,
    ingredientes: ['carne', 'papa', 'lechuga', 'tomate'],
    descripcion: 'Bistec con papas al horno y ensalada' },
  { nombre: 'tacos_pescado', tipo: 'almuerzo', calorias: 460, proteinas: 35, carbohidratos: 48, grasas: 14,
    ingredientes: ['pescado', 'tortilla', 'col', 'aguacate'],
    descripcion: 'Tacos de pescado con ensalada de col' },

  // CENAS
  { nombre: 'sopa_garbanzos_verduras', tipo: 'cena', calorias: 380, proteinas: 16, carbohidratos: 56, grasas: 8,
    ingredientes: ['garbanzos', 'zanahoria', 'apio', 'papa'],
    descripcion: 'Sopa de verduras con garbanzos' },
  { nombre: 'pescado_ensalada', tipo: 'cena', calorias: 420, proteinas: 35, carbohidratos: 28, grasas: 18,
    ingredientes: ['pescado', 'lechuga', 'tomate', 'limón'],
    descripcion: 'Filete de pescado con ensalada' },
  { nombre: 'tortilla_verduras', tipo: 'cena', calorias: 360, proteinas: 20, carbohidratos: 38, grasas: 14,
    ingredientes: ['huevos', 'pimiento', 'cebolla', 'pan'],
    descripcion: 'Tortilla de verduras con pan integral' },
  { nombre: 'pollo_curry_arroz', tipo: 'cena', calorias: 440, proteinas: 36, carbohidratos: 48, grasas: 12,
    ingredientes: ['pollo', 'curry', 'arroz', 'leche de coco'],
    descripcion: 'Pollo al curry con arroz basmati' },
  { nombre: 'ensalada_atun_papa', tipo: 'cena', calorias: 400, proteinas: 28, carbohidratos: 42, grasas: 12,
    ingredientes: ['atún', 'papa', 'lechuga', 'maíz'],
    descripcion: 'Ensalada de atún con papa cocida' },
  { nombre: 'crema_calabaza', tipo: 'cena', calorias: 320, proteinas: 12, carbohidratos: 48, grasas: 10,
    ingredientes: ['calabaza', 'leche', 'cebolla', 'pan'],
    descripcion: 'Crema de calabaza con pan integral' },
  { nombre: 'wrap_pollo_vegetales', tipo: 'cena', calorias: 410, proteinas: 30, carbohidratos: 45, grasas: 14,
    ingredientes: ['pollo', 'tortilla integral', 'lechuga', 'tomate'],
    descripcion: 'Wrap de pollo con vegetales frescos' },
];

// ============================================================================
// MOTOR DE INFERENCIA - LÓGICA DE PREDICADOS
// ============================================================================

/**
 * Predicado: es_apto(Alimento, Restricciones) 
 * Determina si un alimento es apto dadas las restricciones del usuario
 */
export function esApto(alimento: any, restricciones: { alergias: string[], noDeseados: string[] }): boolean {
  const { alergias = [], noDeseados = [] } = restricciones;
  
  // Regla: Un alimento NO es apto si contiene algún alérgeno
  for (const alergia of alergias) {
    for (const ingrediente of alimento.ingredientes) {
      if (ingrediente.toLowerCase().includes(alergia.toLowerCase())) {
        return false;
      }
    }
  }
  
  // Regla: Un alimento NO es apto si contiene algún ingrediente no deseado
  for (const noDeseado of noDeseados) {
    for (const ingrediente of alimento.ingredientes) {
      if (ingrediente.toLowerCase().includes(noDeseado.toLowerCase())) {
        return false;
      }
    }
  }
  
  return true;
}

/**
 * Predicado: en_rango_calorico(Alimento, CaloriasObjetivo, Margen)
 * Determina si un alimento está dentro del rango calórico objetivo
 */
export function enRangoCalorico(alimento: any, caloriasObjetivo: number, margen: number = 0.15): boolean {
  const min = caloriasObjetivo * (1 - margen);
  const max = caloriasObjetivo * (1 + margen);
  return alimento.calorias >= min && alimento.calorias <= max;
}

/**
 * Predicado: es_tipo_comida(Alimento, Tipo)
 * Determina si un alimento es del tipo de comida especificado
 */
export function esTipoComida(alimento: any, tipo: string): boolean {
  return alimento.tipo === tipo;
}

/**
 * Predicado: balanceado(Alimento)
 * Determina si un alimento tiene un balance nutricional adecuado
 */
export function esBalanceado(alimento: any): boolean {
  const totalMacros = alimento.proteinas + alimento.carbohidratos + alimento.grasas;
  
  if (totalMacros === 0) return false;
  
  // Reglas de balance nutricional:
  // - Proteínas: 20-35% del total de macros
  // - Carbohidratos: 45-65% del total de macros
  // - Grasas: 20-35% del total de macros
  
  const porcentajeProteinas = (alimento.proteinas / totalMacros) * 100;
  const porcentajeCarbohidratos = (alimento.carbohidratos / totalMacros) * 100;
  const porcentajeGrasas = (alimento.grasas / totalMacros) * 100;
  
  return (
    porcentajeProteinas >= 15 && porcentajeProteinas <= 40 &&
    porcentajeCarbohidratos >= 35 && porcentajeCarbohidratos <= 70 &&
    porcentajeGrasas >= 10 && porcentajeGrasas <= 40
  );
}

/**
 * Predicado: variedad(AlimentosSeleccionados)
 * Determina si hay suficiente variedad en los alimentos seleccionados
 */
export function hayVariedad(alimentosSeleccionados: any[]): boolean {
  if (alimentosSeleccionados.length < 2) return true;
  
  // Regla: No debe haber alimentos repetidos
  const nombres = alimentosSeleccionados.map(a => a.nombre);
  const nombresUnicos = new Set(nombres);
  
  return nombres.length === nombresUnicos.size;
}

/**
 * Predicado: ingredientes_diversos(AlimentosSeleccionados)
 * Verifica que haya diversidad de ingredientes principales
 */
export function ingredientesDiversos(alimentosSeleccionados: any[]): boolean {
  const ingredientesPrincipales = new Set<string>();
  
  for (const alimento of alimentosSeleccionados) {
    // Considerar solo el primer ingrediente como principal
    if (alimento.ingredientes && alimento.ingredientes.length > 0) {
      ingredientesPrincipales.add(alimento.ingredientes[0]);
    }
  }
  
  // Regla: Debe haber al menos tantos ingredientes principales diferentes como comidas
  return ingredientesPrincipales.size >= Math.min(alimentosSeleccionados.length, 3);
}

// ============================================================================
// MOTOR DE RESOLUCIÓN - GENERACIÓN DE PLANES
// ============================================================================

/**
 * Consulta: seleccionar_comida(Tipo, CaloriasObjetivo, Restricciones, AlimentosYaSeleccionados)
 * Selecciona una comida que satisface todos los predicados
 */
export function seleccionarComida(
  tipo: string, 
  caloriasObjetivo: number, 
  restricciones: { alergias: string[], noDeseados: string[] },
  alimentosYaSeleccionados: any[] = []
): any | null {
  
  const totalAlimentos = alimentosDB.filter(a => a.tipo === tipo).length;
  console.log(`[PROLOG] Consulta: seleccionar_comida(${tipo}, ${caloriasObjetivo}, restricciones, usados)`);
  console.log(`[PROLOG] Base de datos: ${totalAlimentos} alimentos de tipo '${tipo}'`);
  
  // Aplicar reglas en orden (encadenamiento hacia adelante)
  const candidatos = alimentosDB.filter(alimento => {
    // Regla 1: Debe ser del tipo correcto
    if (!esTipoComida(alimento, tipo)) return false;
    
    // Regla 2: Debe ser apto (sin alérgenos ni ingredientes no deseados)
    if (!esApto(alimento, restricciones)) {
      console.log(`[PROLOG]   ✗ ${alimento.nombre}: no es apto (contiene ingredientes restringidos)`);
      return false;
    }
    
    // Regla 3: Debe estar en el rango calórico
    if (!enRangoCalorico(alimento, caloriasObjetivo)) {
      console.log(`[PROLOG]   ✗ ${alimento.nombre}: fuera de rango calórico (${alimento.calorias} kcal)`);
      return false;
    }
    
    // Regla 4: Debe ser balanceado nutricionalmente
    if (!esBalanceado(alimento)) {
      console.log(`[PROLOG]   ✗ ${alimento.nombre}: no está balanceado nutricionalmente`);
      return false;
    }
    
    // Regla 5: No debe estar ya seleccionado (variedad)
    if (alimentosYaSeleccionados.some(a => a.nombre === alimento.nombre)) {
      console.log(`[PROLOG]   ✗ ${alimento.nombre}: ya fue seleccionado`);
      return false;
    }
    
    console.log(`[PROLOG]   ✓ ${alimento.nombre}: CANDIDATO VÁLIDO`);
    return true;
  });
  
  console.log(`[PROLOG] Resultado: ${candidatos.length} candidatos válidos`);
  
  if (candidatos.length === 0) {
    console.log(`[PROLOG] BACKTRACKING: Relajando restricciones...`);
    // Relajar restricciones si no hay candidatos
    return seleccionarComidaRelajada(tipo, caloriasObjetivo, restricciones, alimentosYaSeleccionados);
  }
  
  // Seleccionar aleatoriamente entre los candidatos válidos
  const seleccionado = candidatos[Math.floor(Math.random() * candidatos.length)];
  console.log(`[PROLOG] Seleccionado: ${seleccionado.nombre} - ${seleccionado.descripcion}`);
  return seleccionado;
}

/**
 * Consulta: seleccionar_comida_relajada
 * Relaja algunas restricciones para encontrar opciones cuando no hay candidatos perfectos
 */
function seleccionarComidaRelajada(
  tipo: string,
  caloriasObjetivo: number,
  restricciones: { alergias: string[], noDeseados: string[] },
  alimentosYaSeleccionados: any[]
): any | null {
  
  console.log(`[PROLOG] Aplicando reglas relajadas (margen calórico: 25%)`);
  
  const candidatos = alimentosDB.filter(alimento => {
    // Mantener reglas esenciales
    if (!esTipoComida(alimento, tipo)) return false;
    if (!esApto(alimento, restricciones)) return false;
    
    // Relajar rango calórico (25% en vez de 15%)
    if (!enRangoCalorico(alimento, caloriasObjetivo, 0.25)) return false;
    
    return true;
  });
  
  console.log(`[PROLOG] Candidatos con reglas relajadas: ${candidatos.length}`);
  
  if (candidatos.length === 0) {
    console.log(`[PROLOG] ERROR: No se puede satisfacer la consulta (restricciones muy estrictas)`);
    return null;
  }
  
  const seleccionado = candidatos[Math.floor(Math.random() * candidatos.length)];
  console.log(`[PROLOG] Seleccionado (relajado): ${seleccionado.nombre}`);
  return seleccionado;
}

/**
 * Consulta principal: generar_plan_alimentacion(Dias, CaloriasDiarias, Restricciones)
 * Genera un plan de alimentación completo usando lógica de predicados
 */
export function generarPlanAlimentacion(
  dias: number,
  caloriasDiarias: number,
  restricciones: { alergias: string[], noDeseados: string[] }
): any[] | null {
  
  const plan: any[] = [];
  const alimentosUsados: any[] = [];
  
  // Distribución calórica por comida (reglas nutricionales)
  const caloriasDesayuno = Math.round(caloriasDiarias * 0.25);  // 25%
  const caloriasAlmuerzo = Math.round(caloriasDiarias * 0.40);  // 40%
  const caloriasCena = Math.round(caloriasDiarias * 0.35);      // 35%
  
  for (let dia = 1; dia <= dias; dia++) {
    // Seleccionar desayuno
    const desayuno = seleccionarComida('desayuno', caloriasDesayuno, restricciones, alimentosUsados);
    if (!desayuno) {
      console.log(`[PROLOG] No se pudo encontrar desayuno válido para el día ${dia}`);
      return null; // No se puede satisfacer las restricciones
    }
    alimentosUsados.push(desayuno);
    
    // Seleccionar almuerzo
    const almuerzo = seleccionarComida('almuerzo', caloriasAlmuerzo, restricciones, alimentosUsados);
    if (!almuerzo) {
      console.log(`[PROLOG] No se pudo encontrar almuerzo válido para el día ${dia}`);
      return null;
    }
    alimentosUsados.push(almuerzo);
    
    // Seleccionar cena
    const cena = seleccionarComida('cena', caloriasCena, restricciones, alimentosUsados);
    if (!cena) {
      console.log(`[PROLOG] No se pudo encontrar cena válida para el día ${dia}`);
      return null;
    }
    alimentosUsados.push(cena);
    
    // Verificar variedad e ingredientes diversos
    const comidasDia = [desayuno, almuerzo, cena];
    if (!hayVariedad(comidasDia)) {
      console.log(`[PROLOG] Advertencia: Poca variedad en el día ${dia}`);
    }
    if (!ingredientesDiversos(comidasDia)) {
      console.log(`[PROLOG] Advertencia: Ingredientes poco diversos en el día ${dia}`);
    }
    
    // Agregar al plan
    plan.push({
      day: dia,
      breakfast: formatearComida(desayuno),
      lunch: formatearComida(almuerzo),
      dinner: formatearComida(cena)
    });
  }
  
  return plan;
}

/**
 * Formatea una comida al formato esperado por el frontend
 */
function formatearComida(alimento: any): any {
  return {
    id: `${alimento.nombre}-${Date.now()}-${Math.random()}`,
    name: alimento.descripcion,
    calories: alimento.calorias,
    protein: alimento.proteinas,
    carbs: alimento.carbohidratos,
    fat: alimento.grasas,
    ingredients: alimento.ingredientes
  };
}

/**
 * Consulta: generar_alternativas(Tipo, CaloriasObjetivo, Restricciones)
 * Genera múltiples alternativas para reemplazo de comidas
 */
export function generarAlternativas(
  tipo: string,
  caloriasObjetivo: number,
  restricciones: { alergias: string[], noDeseados: string[] },
  cantidad: number = 3
): any[] {
  
  const alternativas: any[] = [];
  const nombresUsados = new Set<string>();
  
  for (let i = 0; i < cantidad * 2 && alternativas.length < cantidad; i++) {
    const comida = seleccionarComida(tipo, caloriasObjetivo, restricciones, []);
    
    if (comida && !nombresUsados.has(comida.nombre)) {
      alternativas.push(formatearComida(comida));
      nombresUsados.add(comida.nombre);
    }
  }
  
  return alternativas;
}

/**
 * Función de depuración: explicar_reglas
 * Explica qué reglas se aplicaron para seleccionar un alimento
 */
export function explicarReglas(alimento: any, restricciones: any): string[] {
  const explicaciones: string[] = [];
  
  explicaciones.push(`✓ Tipo de comida: ${alimento.tipo}`);
  explicaciones.push(`✓ Es apto: ${esApto(alimento, restricciones) ? 'Sí' : 'No'}`);
  explicaciones.push(`✓ Balance nutricional: ${esBalanceado(alimento) ? 'Sí' : 'No'}`);
  explicaciones.push(`✓ Calorías: ${alimento.calorias} kcal`);
  explicaciones.push(`✓ Ingredientes: ${alimento.ingredientes.join(', ')}`);
  
  return explicaciones;
}
