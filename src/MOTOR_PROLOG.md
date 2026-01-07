# Motor de Lógica de Predicados (Prolog) para Generación de Menús

## 📚 Introducción

Este sistema utiliza **lógica de predicados de primer orden** (estilo Prolog) para generar planes de alimentación personalizados. En lugar de usar algoritmos imperativos tradicionales, el sistema define **hechos** y **reglas lógicas** que se evalúan mediante un motor de inferencia.

## 🧠 Conceptos de Prolog Aplicados

### 1. **Predicados (Hechos)**

Los predicados son afirmaciones básicas sobre el mundo. En nuestro sistema:

```prolog
% Ejemplo en sintaxis Prolog tradicional:
alimento(avena_frutas_nueces, desayuno, 350, 12, 58, 8, [avena, plátano, nueces, miel]).
alimento(pollo_arroz_verduras, almuerzo, 520, 42, 58, 12, [pollo, arroz, brócoli, zanahoria]).
```

**Implementación en TypeScript:**
```typescript
export const alimentosDB = [
  { nombre: 'avena_frutas_nueces', tipo: 'desayuno', calorias: 350, ... },
  { nombre: 'pollo_arroz_verduras', tipo: 'almuerzo', calorias: 520, ... }
];
```

### 2. **Reglas de Inferencia**

Las reglas definen relaciones lógicas y condiciones:

#### Regla: `es_apto(Alimento, Restricciones)`
```prolog
% En Prolog tradicional:
es_apto(Alimento, Restricciones) :-
    alimento(Alimento, _, _, _, _, _, Ingredientes),
    \+ tiene_alergeno(Ingredientes, Restricciones),
    \+ tiene_no_deseado(Ingredientes, Restricciones).
```

**Significado:** Un alimento ES APTO si:
- Es un alimento conocido
- NO tiene alérgenos (negación: `\+`)
- NO tiene ingredientes no deseados

#### Regla: `en_rango_calorico(Alimento, Objetivo, Margen)`
```prolog
en_rango_calorico(Alimento, Objetivo, Margen) :-
    alimento(Alimento, _, Calorias, _, _, _, _),
    Min is Objetivo * (1 - Margen),
    Max is Objetivo * (1 + Margen),
    Calorias >= Min,
    Calorias =< Max.
```

**Significado:** Un alimento está en rango calórico si sus calorías están dentro del margen especificado.

#### Regla: `es_balanceado(Alimento)`
```prolog
es_balanceado(Alimento) :-
    alimento(Alimento, _, _, Proteinas, Carbohidratos, Grasas, _),
    TotalMacros is Proteinas + Carbohidratos + Grasas,
    PorcentajeProteinas is (Proteinas / TotalMacros) * 100,
    PorcentajeCarbos is (Carbohidratos / TotalMacros) * 100,
    PorcentajeGrasas is (Grasas / TotalMacros) * 100,
    PorcentajeProteinas >= 15, PorcentajeProteinas =< 40,
    PorcentajeCarbos >= 35, PorcentajeCarbos =< 70,
    PorcentajeGrasas >= 10, PorcentajeGrasas =< 40.
```

**Significado:** Un alimento es balanceado si cumple las proporciones nutricionales recomendadas.

### 3. **Consultas (Queries)**

Las consultas buscan soluciones que satisfacen las reglas:

```prolog
% En Prolog tradicional:
?- seleccionar_comida(desayuno, 350, [nueces], [], Comida).
```

**Significado:** "¿Existe una comida de tipo desayuno con ~350 calorías que NO contenga nueces?"

**Implementación en TypeScript:**
```typescript
const comida = seleccionarComida('desayuno', 350, { alergias: ['nueces'], noDeseados: [] });
```

### 4. **Encadenamiento Hacia Adelante (Forward Chaining)**

El motor evalúa reglas en secuencia para llegar a una conclusión:

```
OBJETIVO: Seleccionar una comida válida

PASO 1: Filtrar por tipo
  ✓ Regla: es_tipo_comida(Alimento, 'desayuno')
  Candidatos: [avena_frutas_nueces, huevos_tostadas, yogurt_granola, ...]

PASO 2: Filtrar por restricciones
  ✓ Regla: es_apto(Alimento, Restricciones)
  Candidatos: [huevos_tostadas, yogurt_granola, smoothie_proteina, ...]
  ✗ Eliminado: avena_frutas_nueces (contiene nueces - alérgeno)

PASO 3: Filtrar por rango calórico
  ✓ Regla: en_rango_calorico(Alimento, 350, 0.15)
  Candidatos: [huevos_tostadas, yogurt_granola, smoothie_proteina]

PASO 4: Filtrar por balance nutricional
  ✓ Regla: es_balanceado(Alimento)
  Candidatos: [huevos_tostadas, yogurt_granola, smoothie_proteina]

RESULTADO: Seleccionar uno al azar de los candidatos finales
```

### 5. **Backtracking (Retroceso)**

Si no se puede satisfacer una consulta, el motor relaja restricciones:

```prolog
seleccionar_comida_relajada(Tipo, Objetivo, Restricciones, Comida) :-
    % Mantener restricciones esenciales
    es_tipo_comida(Comida, Tipo),
    es_apto(Comida, Restricciones),
    % Relajar rango calórico de 15% a 25%
    en_rango_calorico(Comida, Objetivo, 0.25).
```

**Significado:** Si no hay solución con las reglas estrictas, intenta con reglas más permisivas.

## 🎯 Algoritmo de Generación de Menús

### Pseudocódigo en Lógica de Predicados:

```prolog
generar_plan_alimentacion(Dias, CaloriasDiarias, Restricciones, Plan) :-
    % Calcular distribución calórica
    CaloriasDesayuno is CaloriasDiarias * 0.25,
    CaloriasAlmuerzo is CaloriasDiarias * 0.40,
    CaloriasCena is CaloriasDiarias * 0.35,
    
    % Generar plan para cada día
    generar_dias(Dias, CaloriasDesayuno, CaloriasAlmuerzo, CaloriasCena, 
                 Restricciones, [], Plan).

generar_dias(0, _, _, _, _, Acumulado, Acumulado) :- !.
generar_dias(N, CalD, CalA, CalC, Restricciones, Usados, Plan) :-
    N > 0,
    
    % Seleccionar comidas del día
    seleccionar_comida(desayuno, CalD, Restricciones, Usados, Desayuno),
    seleccionar_comida(almuerzo, CalA, Restricciones, [Desayuno|Usados], Almuerzo),
    seleccionar_comida(cena, CalC, Restricciones, [Desayuno,Almuerzo|Usados], Cena),
    
    % Verificar variedad
    hay_variedad([Desayuno, Almuerzo, Cena]),
    ingredientes_diversos([Desayuno, Almuerzo, Cena]),
    
    % Crear día y continuar recursión
    DiaPlan = dia(N, Desayuno, Almuerzo, Cena),
    N1 is N - 1,
    generar_dias(N1, CalD, CalA, CalC, Restricciones, 
                 [Desayuno,Almuerzo,Cena|Usados], [DiaPlan|Plan]).
```

### Implementación en TypeScript:

```typescript
export function generarPlanAlimentacion(
  dias: number,
  caloriasDiarias: number,
  restricciones: { alergias: string[], noDeseados: string[] }
): any[] | null {
  
  const plan: any[] = [];
  const alimentosUsados: any[] = [];
  
  // Distribución calórica
  const caloriasDesayuno = Math.round(caloriasDiarias * 0.25);
  const caloriasAlmuerzo = Math.round(caloriasDiarias * 0.40);
  const caloriasCena = Math.round(caloriasDiarias * 0.35);
  
  for (let dia = 1; dia <= dias; dia++) {
    // Aplicar reglas de selección
    const desayuno = seleccionarComida('desayuno', caloriasDesayuno, restricciones, alimentosUsados);
    if (!desayuno) return null; // Backtracking: No hay solución
    alimentosUsados.push(desayuno);
    
    const almuerzo = seleccionarComida('almuerzo', caloriasAlmuerzo, restricciones, alimentosUsados);
    if (!almuerzo) return null;
    alimentosUsados.push(almuerzo);
    
    const cena = seleccionarComida('cena', caloriasCena, restricciones, alimentosUsados);
    if (!cena) return null;
    alimentosUsados.push(cena);
    
    // Verificar predicados adicionales
    const comidasDia = [desayuno, almuerzo, cena];
    if (!hayVariedad(comidasDia)) {
      console.log(`[PROLOG] Advertencia: Poca variedad en día ${dia}`);
    }
    
    plan.push({ day: dia, breakfast: desayuno, lunch: almuerzo, dinner: cena });
  }
  
  return plan;
}
```

## 📋 Base de Conocimiento Actual

### Estadísticas:
- **Total de alimentos:** 21
- **Desayunos:** 7
- **Almuerzos:** 7
- **Cenas:** 7

### Predicados Implementados:

1. **`esApto(Alimento, Restricciones)`** - Verifica restricciones alimenticias
2. **`enRangoCalorico(Alimento, Objetivo, Margen)`** - Verifica calorías objetivo
3. **`esTipoComida(Alimento, Tipo)`** - Clasifica por tipo de comida
4. **`esBalanceado(Alimento)`** - Verifica balance nutricional
5. **`hayVariedad(Lista)`** - Asegura diversidad en selección
6. **`ingredientesDiversos(Lista)`** - Verifica diversidad de ingredientes

### Reglas de Selección (en orden de aplicación):

```
1. esTipoComida(Alimento, Tipo) 
   → Debe ser del tipo correcto (desayuno/almuerzo/cena)

2. esApto(Alimento, Restricciones)
   → Debe cumplir restricciones de alergias y preferencias

3. enRangoCalorico(Alimento, Objetivo, 0.15)
   → Debe estar dentro del ±15% del objetivo calórico

4. esBalanceado(Alimento)
   → Debe tener proporciones nutricionales adecuadas

5. hayVariedad(Seleccionados)
   → No debe repetirse en el plan
```

## 🔍 Ventajas de la Lógica de Predicados

1. **Declarativo vs Imperativo:** Defines QUÉ quieres, no CÓMO obtenerlo
2. **Expresividad:** Las reglas nutricionales se expresan naturalmente
3. **Mantenibilidad:** Agregar nuevas reglas no requiere reescribir el algoritmo
4. **Trazabilidad:** Puedes explicar POR QUÉ se seleccionó una comida
5. **Flexibilidad:** Fácil agregar nuevos predicados o relajar restricciones

## 🚀 Endpoints Disponibles

### Generación de Menú
```
POST /make-server-3d05204c/generate-menu
```

**Log de consola:**
```
[PROLOG] Generando plan con motor de lógica de predicados...
[PROLOG] Días: 3, Calorías diarias: 2000
[PROLOG] Restricciones: { alergias: ['nueces'], noDeseados: ['brócoli'] }
[PROLOG] Plan generado exitosamente: 3 días
```

### Alternativas de Comida
```
POST /make-server-3d05204c/replace-meal
```

**Log de consola:**
```
[PROLOG] Generando alternativas para desayuno, 350 kcal
[PROLOG] 3 alternativas generadas para user: abc-123
```

### Debug - Base de Conocimiento
```
GET /make-server-3d05204c/debug/prolog-knowledge
```

**Respuesta:**
```json
{
  "message": "Base de conocimiento del motor Prolog",
  "totalAlimentos": 21,
  "desayunos": 7,
  "almuerzos": 7,
  "cenas": 7,
  "alimentos": [...]
}
```

## 📖 Ejemplos de Uso

### Ejemplo 1: Usuario con alergia a nueces

```typescript
const restricciones = {
  alergias: ['nueces'],
  noDeseados: []
};

const plan = generarPlanAlimentacion(3, 2000, restricciones);
```

**Resultado:** El motor filtrará automáticamente "Avena con frutas y nueces" y "cualquier comida que contenga nueces en sus ingredientes.

### Ejemplo 2: Usuario vegetariano

```typescript
const restricciones = {
  alergias: [],
  noDeseados: ['pollo', 'carne', 'pescado', 'atún', 'salmón', 'pavo']
};

const plan = generarPlanAlimentacion(5, 1800, restricciones);
```

**Resultado:** Solo seleccionará opciones vegetarianas como lentejas, tofu, huevos, etc.

### Ejemplo 3: Usuario con objetivo de pérdida de peso

```typescript
// El sistema automáticamente resta 500 calorías
const caloriasDiarias = profile.dailyCalories - 500;

const plan = generarPlanAlimentacion(7, caloriasDiarias, {
  alergias: profile.allergies,
  noDeseados: profile.unwantedFoods
});
```

## 🔧 Extensibilidad

### Agregar Nuevos Alimentos

Edita `/supabase/functions/server/prolog_engine.tsx`:

```typescript
export const alimentosDB = [
  // ... alimentos existentes
  {
    nombre: 'ensalada_quinoa_aguacate',
    tipo: 'almuerzo',
    calorias: 450,
    proteinas: 18,
    carbohidratos: 52,
    grasas: 20,
    ingredientes: ['quinoa', 'aguacate', 'tomate', 'pepino'],
    descripcion: 'Ensalada de quinoa con aguacate'
  }
];
```

### Agregar Nuevas Reglas

```typescript
export function esVegano(alimento: any): boolean {
  const ingredientesNoVeganos = ['huevo', 'leche', 'yogurt', 'queso', 'miel'];
  
  for (const ingrediente of alimento.ingredientes) {
    if (ingredientesNoVeganos.some(nv => ingrediente.toLowerCase().includes(nv))) {
      return false;
    }
  }
  
  return true;
}
```

Luego usar en `seleccionarComida`:
```typescript
if (preferencias.vegano && !esVegano(alimento)) return false;
```

## 📚 Referencias

- **Lógica de Primer Orden:** https://es.wikipedia.org/wiki/Lógica_de_primer_orden
- **Prolog:** https://es.wikipedia.org/wiki/Prolog
- **Forward Chaining:** https://en.wikipedia.org/wiki/Forward_chaining
- **Horn Clauses:** https://en.wikipedia.org/wiki/Horn_clause

---

**Desarrollado por:** Dr. Baymax - Sistema de Gestión Nutricional
**Motor:** Lógica de Predicados de Primer Orden (estilo Prolog)
**Versión:** 1.0.0
