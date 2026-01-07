# Motor de Recetas IA Propio - Dr. Baymax

## 🎯 Descripción General

El Motor de Recetas IA de Dr. Baymax es un **sistema inteligente de generación de recetas 100% autónomo** que no depende de APIs externas. Funciona mediante un sofisticado sistema basado en reglas, templates y lógica de sustitución inteligente.

## 🏗️ Arquitectura

### Componentes Principales

1. **Base de Conocimiento de Ingredientes**
   - 50+ ingredientes catalogados con información nutricional completa
   - Categorización por tipo: proteína, carbohidrato, vegetal, grasa, lácteo, condimento
   - Sistema de alternativas predefinidas para cada ingrediente
   - Valores nutricionales precisos: calorías, proteínas, carbohidratos, grasas, fibra

2. **Biblioteca de Recetas Template**
   - 25+ recetas prediseñadas y probadas
   - Distribución: Desayunos, Almuerzos, Cenas, Snacks
   - Niveles de dificultad: Fácil, Intermedio, Avanzado
   - Tiempo de preparación variable: 5-60+ minutos

3. **Motor de Generación Inteligente**
   - Sistema de adaptación basado en restricciones
   - Lógica de sustitución automática de ingredientes
   - Cálculos nutricionales dinámicos
   - Ajuste de porciones automático

## 🧠 Lógica de Funcionamiento

### Proceso de Generación de Recetas

```
1. RECEPCIÓN DE PARÁMETROS
   ↓
2. OBTENCIÓN PERFIL USUARIO
   - Alergias
   - Alimentos no deseados
   - Preferencias alimenticias
   - Objetivos nutricionales
   ↓
3. SELECCIÓN DE CANDIDATOS
   - Filtro por tipo de comida
   - Filtro por dificultad
   - Filtro por tiempo de preparación
   ↓
4. ADAPTACIÓN INTELIGENTE
   - Verificación de ingredientes vs restricciones
   - Búsqueda de alternativas compatibles
   - Sustitución automática si es necesario
   ↓
5. AJUSTE DE PORCIONES
   - Recalculo de cantidades
   - Ajuste nutricional
   ↓
6. CÁLCULO NUTRICIONAL
   - Suma de macronutrientes
   - División por porciones
   - Generación de información nutricional
   ↓
7. ENTREGA DE RECETA FINAL
```

### Algoritmo de Sustitución de Ingredientes

El motor utiliza un algoritmo en cascada para sustituir ingredientes restringidos:

1. **Verificación**: ¿El ingrediente está en la lista de restricciones?
2. **Búsqueda de Alternativas Predefinidas**: Revisa las alternativas específicas del ingrediente
3. **Búsqueda por Categoría**: Si no hay alternativas, busca otros ingredientes de la misma categoría
4. **Fallo Controlado**: Si no encuentra sustitutos, descarta la receta y prueba con otra

### Ejemplo de Sustitución

```typescript
Usuario con alergia a "pollo"
↓
Receta original: Pollo a la Plancha con Quinoa
↓
Motor detecta: "pollo" está en restricciones
↓
Busca alternativas: ["pavo", "pescado", "tofu"]
↓
Selecciona: "pavo" (compatible con otras restricciones)
↓
Resultado: Pavo a la Plancha con Quinoa
```

## 📊 Base de Datos de Recetas

### Distribución Actual

- **Desayunos**: 5 recetas
  - Bowl de Avena con Frutas
  - Omelette Proteico
  - Tostadas de Aguacate
  - Smoothie Bowl
  - Panqueques de Avena
  
- **Almuerzos**: 7 recetas
  - Pollo con Quinoa y Vegetales
  - Bowl Mexicano
  - Salmón al Horno
  - Pasta Integral
  - Ensalada de Atún
  - Bowl Vegetariano
  - Tacos de Pescado

- **Cenas**: 7 recetas
  - Pavo con Vegetales al Vapor
  - Sopa de Lentejas
  - Ensalada César
  - Tortilla Española
  - Wrap de Pollo
  - Pescado al Horno
  - Revuelto de Tofu

- **Snacks**: 2 recetas
  - Yogurt con Frutas y Granola
  - Tostadas con Mantequilla de Maní

### Información por Receta

Cada receta incluye:
- ✅ Nombre atractivo
- ✅ Descripción apetitosa
- ✅ Tiempo de preparación exacto
- ✅ Nivel de dificultad
- ✅ Lista detallada de ingredientes con cantidades
- ✅ Pasos de preparación numerados y claros
- ✅ Información nutricional completa
- ✅ Tags descriptivos
- ✅ Consejos profesionales de preparación

## 🔧 Funcionalidades Avanzadas

### 1. Respeto Total a Restricciones
- **Alergias**: Bloqueo absoluto de ingredientes alergénicos
- **Alimentos no deseados**: Exclusión completa
- **Preferencias**: Priorización de ingredientes preferidos

### 2. Cálculos Nutricionales Automáticos
```javascript
Información por porción:
- Calorías totales
- Proteínas (gramos)
- Carbohidratos (gramos)
- Grasas (gramos)
- Fibra (gramos)
```

### 3. Ajuste Dinámico de Porciones
El motor adapta las cantidades según el número de porciones solicitadas (1-8 porciones).

### 4. Sistema de Variaciones
Algunas recetas incluyen variaciones predefinidas:
- Versión mediterránea
- Versión vegetariana
- Versión picante
- Etc.

## 🎨 Ventajas vs APIs Externas

| Aspecto | Motor Propio | API Externa (OpenAI) |
|---------|--------------|----------------------|
| **Costo** | ✅ Gratis | ❌ Pago por uso |
| **Velocidad** | ✅ Instantáneo | ⏱️ 2-5 segundos |
| **Control** | ✅ Total | ⚠️ Limitado |
| **Fiabilidad** | ✅ 100% predecible | ⚠️ Varía |
| **Privacidad** | ✅ Total | ⚠️ Datos externos |
| **Restricciones** | ✅ Garantizado | ⚠️ Puede fallar |
| **Personalización** | ✅ Completa | ⚠️ Limitada |
| **Disponibilidad** | ✅ Siempre | ⚠️ Depende de API |

## 🚀 Cómo Expandir el Motor

### Agregar Nuevos Ingredientes

```typescript
'nombre_ingrediente': { 
  nombre: 'nombre completo', 
  cantidad: '100g', 
  calorias: 150, 
  proteinas: 10, 
  carbohidratos: 20, 
  grasas: 5, 
  fibra: 3, 
  categoria: 'proteina', // o carbohidrato, vegetal, grasa, lacteo, condimento
  alternativas: ['alt1', 'alt2'] 
}
```

### Agregar Nuevas Recetas

```typescript
{
  id: 'rec_001',
  nombre: 'Nombre de la Receta',
  descripcion: 'Descripción apetitosa',
  tipo: 'almuerzo', // desayuno, almuerzo, cena, snack
  dificultad: 'fácil', // fácil, intermedio, avanzado
  tiempoPreparacion: '30 minutos',
  ingredientes: [
    INGREDIENTES_DB['pollo'],
    INGREDIENTES_DB['arroz'],
    // ...más ingredientes
  ],
  pasos: [
    'Paso 1 detallado',
    'Paso 2 detallado',
    // ...más pasos
  ],
  tags: ['saludable', 'alto en proteína'],
  consejos: 'Consejos útiles para la preparación',
  variaciones: [] // Opcional
}
```

## 📈 Estadísticas del Motor

Puedes consultar las estadísticas en tiempo real en:
```
GET /make-server-3d05204c/recipes/stats
```

Retorna:
- Total de recetas disponibles
- Distribución por tipo de comida
- Distribución por dificultad
- Total de ingredientes catalogados

## 🔮 Futuras Mejoras

### Corto Plazo
- [ ] Agregar más recetas (objetivo: 50+ recetas)
- [ ] Incluir cocinas internacionales
- [ ] Sistema de puntuación de recetas
- [ ] Historial de recetas favoritas del usuario

### Mediano Plazo
- [ ] Generador de variaciones automáticas
- [ ] Sistema de recomendaciones basado en historial
- [ ] Calculadora de lista de compras
- [ ] Modo batch: generar plan semanal de recetas

### Largo Plazo
- [ ] Machine Learning para aprender preferencias
- [ ] Integración con wearables para ajuste calórico
- [ ] Generador de recetas por foto de ingredientes
- [ ] Community sharing de recetas

## 💡 Casos de Uso Especiales

### Usuario Vegano
El motor automáticamente:
- Excluye todas las proteínas animales
- Prioriza recetas con tofu, lentejas, garbanzos
- Sustituye lácteos por alternativas vegetales

### Usuario con Múltiples Alergias
El motor:
- Verifica cada ingrediente contra todas las alergias
- Busca alternativas compatibles con todas las restricciones
- Solo muestra recetas 100% seguras

### Usuario con Objetivo de Pérdida de Peso
El motor:
- Prioriza recetas bajas en calorías
- Enfatiza alta proteína y fibra
- Limita carbohidratos y grasas según perfil

## 🔐 Seguridad Alimentaria

El motor garantiza:
- ✅ **NUNCA** incluir ingredientes alergénicos
- ✅ **SIEMPRE** respetar alimentos no deseados
- ✅ **VERIFICACIÓN DOBLE** de cada ingrediente
- ✅ **FALLO SEGURO**: Si no puede garantizar seguridad, no genera la receta

## 📝 Conclusión

El Motor de Recetas IA Propio de Dr. Baymax representa una alternativa robusta, confiable y económica a las APIs externas de generación de recetas. Con su sistema basado en reglas y templates, garantiza:

- 🎯 Precisión nutricional
- 🛡️ Seguridad alimentaria total
- ⚡ Velocidad de respuesta instantánea
- 💰 Costo cero de operación
- 🔒 Privacidad completa de datos
- 🎨 Control total sobre la experiencia

Es ideal para aplicaciones de nutrición que requieren confiabilidad, personalización y control total del proceso de generación de recetas.

---

**Versión**: 1.0  
**Última actualización**: Noviembre 2024  
**Ubicación del código**: `/supabase/functions/server/recipe_engine.tsx`
