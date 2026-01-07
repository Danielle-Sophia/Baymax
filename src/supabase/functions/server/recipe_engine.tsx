/**
 * MOTOR DE GENERACIÓN DE RECETAS INTELIGENTE
 * 
 * Sistema autónomo de generación de recetas basado en reglas y templates.
 * No requiere APIs externas - toda la inteligencia está implementada aquí.
 */

// ============================================================================
// TIPOS Y ESTRUCTURAS DE DATOS
// ============================================================================

export interface Ingredient {
  nombre: string;
  cantidad: string;
  calorias: number;
  proteinas: number;
  carbohidratos: number;
  grasas: number;
  fibra: number;
  categoria: 'proteina' | 'carbohidrato' | 'vegetal' | 'grasa' | 'condimento' | 'lacteo';
  alternativas?: string[];
}

export interface RecipeTemplate {
  id: string;
  nombre: string;
  descripcion: string;
  tipo: 'desayuno' | 'almuerzo' | 'cena' | 'snack';
  dificultad: 'fácil' | 'intermedio' | 'avanzado';
  tiempoPreparacion: string;
  ingredientes: Ingredient[];
  pasos: string[];
  tags: string[];
  consejos: string;
  variaciones: {
    nombre: string;
    cambios: { original: string; nuevo: string }[];
  }[];
}

// ============================================================================
// BASE DE CONOCIMIENTO - INGREDIENTES
// ============================================================================

const INGREDIENTES_DB: Record<string, Ingredient> = {
  // PROTEÍNAS
  'pollo': { nombre: 'pechuga de pollo', cantidad: '150g', calorias: 165, proteinas: 31, carbohidratos: 0, grasas: 3.6, fibra: 0, categoria: 'proteina', alternativas: ['pavo', 'pescado', 'tofu'] },
  'pavo': { nombre: 'pechuga de pavo', cantidad: '150g', calorias: 135, proteinas: 30, carbohidratos: 0, grasas: 1, fibra: 0, categoria: 'proteina', alternativas: ['pollo', 'pescado'] },
  'pescado': { nombre: 'filete de pescado blanco', cantidad: '150g', calorias: 135, proteinas: 26, carbohidratos: 0, grasas: 3, fibra: 0, categoria: 'proteina', alternativas: ['pollo', 'camarones'] },
  'salmón': { nombre: 'filete de salmón', cantidad: '150g', calorias: 280, proteinas: 31, carbohidratos: 0, grasas: 17, fibra: 0, categoria: 'proteina', alternativas: ['atún', 'trucha'] },
  'atún': { nombre: 'atún en agua', cantidad: '120g', calorias: 120, proteinas: 26, carbohidratos: 0, grasas: 1, fibra: 0, categoria: 'proteina', alternativas: ['salmón', 'sardinas'] },
  'huevos': { nombre: 'huevos', cantidad: '2 unidades', calorias: 140, proteinas: 12, carbohidratos: 1, grasas: 10, fibra: 0, categoria: 'proteina', alternativas: ['claras de huevo'] },
  'tofu': { nombre: 'tofu firme', cantidad: '150g', calorias: 120, proteinas: 12, carbohidratos: 3, grasas: 7, fibra: 2, categoria: 'proteina', alternativas: ['tempeh', 'lentejas'] },
  'carne': { nombre: 'carne magra de res', cantidad: '150g', calorias: 250, proteinas: 36, carbohidratos: 0, grasas: 11, fibra: 0, categoria: 'proteina', alternativas: ['pollo', 'pavo'] },
  'lentejas': { nombre: 'lentejas cocidas', cantidad: '200g', calorias: 230, proteinas: 18, carbohidratos: 40, grasas: 1, fibra: 16, categoria: 'proteina', alternativas: ['garbanzos', 'frijoles'] },
  'garbanzos': { nombre: 'garbanzos cocidos', cantidad: '200g', calorias: 270, proteinas: 15, carbohidratos: 45, grasas: 4, fibra: 12, categoria: 'proteina', alternativas: ['lentejas', 'frijoles'] },
  'camarones': { nombre: 'camarones', cantidad: '150g', calorias: 120, proteinas: 24, carbohidratos: 1, grasas: 2, fibra: 0, categoria: 'proteina', alternativas: ['pescado', 'calamar'] },

  // CARBOHIDRATOS
  'arroz': { nombre: 'arroz integral', cantidad: '80g (crudo)', calorias: 280, proteinas: 6, carbohidratos: 58, grasas: 2, fibra: 3, categoria: 'carbohidrato', alternativas: ['quinoa', 'arroz blanco'] },
  'quinoa': { nombre: 'quinoa', cantidad: '80g (crudo)', calorias: 310, proteinas: 12, carbohidratos: 54, grasas: 5, fibra: 6, categoria: 'carbohidrato', alternativas: ['arroz integral', 'cuscús'] },
  'pasta': { nombre: 'pasta integral', cantidad: '80g (crudo)', calorias: 310, proteinas: 13, carbohidratos: 62, grasas: 2, fibra: 8, categoria: 'carbohidrato', alternativas: ['pasta de lentejas', 'arroz'] },
  'papa': { nombre: 'papa', cantidad: '200g', calorias: 160, proteinas: 4, carbohidratos: 37, grasas: 0, fibra: 4, categoria: 'carbohidrato', alternativas: ['batata', 'yuca'] },
  'batata': { nombre: 'batata', cantidad: '200g', calorias: 180, proteinas: 4, carbohidratos: 41, grasas: 0, fibra: 6, categoria: 'carbohidrato', alternativas: ['papa', 'calabaza'] },
  'pan integral': { nombre: 'pan integral', cantidad: '2 rebanadas', calorias: 160, proteinas: 8, carbohidratos: 30, grasas: 2, fibra: 6, categoria: 'carbohidrato', alternativas: ['pan de centeno', 'tortillas integrales'] },
  'avena': { nombre: 'avena', cantidad: '60g', calorias: 230, proteinas: 10, carbohidratos: 40, grasas: 4, fibra: 6, categoria: 'carbohidrato', alternativas: ['granola', 'muesli'] },
  'tortilla': { nombre: 'tortilla integral', cantidad: '2 unidades', calorias: 200, proteinas: 6, carbohidratos: 36, grasas: 4, fibra: 4, categoria: 'carbohidrato', alternativas: ['pan integral', 'pan pita'] },

  // VEGETALES
  'brócoli': { nombre: 'brócoli', cantidad: '150g', calorias: 50, proteinas: 4, carbohidratos: 10, grasas: 0.5, fibra: 4, categoria: 'vegetal', alternativas: ['coliflor', 'espárragos'] },
  'zanahoria': { nombre: 'zanahoria', cantidad: '100g', calorias: 41, proteinas: 1, carbohidratos: 10, grasas: 0, fibra: 3, categoria: 'vegetal', alternativas: ['calabacín', 'pimiento'] },
  'espinaca': { nombre: 'espinaca', cantidad: '100g', calorias: 23, proteinas: 3, carbohidratos: 4, grasas: 0, fibra: 2, categoria: 'vegetal', alternativas: ['kale', 'acelga'] },
  'tomate': { nombre: 'tomate', cantidad: '150g', calorias: 27, proteinas: 1, carbohidratos: 6, grasas: 0, fibra: 2, categoria: 'vegetal', alternativas: ['pimiento', 'cebolla'] },
  'pimiento': { nombre: 'pimiento', cantidad: '100g', calorias: 31, proteinas: 1, carbohidratos: 6, grasas: 0, fibra: 2, categoria: 'vegetal', alternativas: ['tomate', 'calabacín'] },
  'cebolla': { nombre: 'cebolla', cantidad: '80g', calorias: 32, proteinas: 1, carbohidratos: 7, grasas: 0, fibra: 1, categoria: 'vegetal', alternativas: ['puerro', 'cebollín'] },
  'lechuga': { nombre: 'lechuga mixta', cantidad: '100g', calorias: 15, proteinas: 1, carbohidratos: 3, grasas: 0, fibra: 1, categoria: 'vegetal', alternativas: ['rúcula', 'espinaca'] },
  'pepino': { nombre: 'pepino', cantidad: '100g', calorias: 16, proteinas: 1, carbohidratos: 4, grasas: 0, fibra: 1, categoria: 'vegetal', alternativas: ['apio', 'calabacín'] },
  'champiñones': { nombre: 'champiñones', cantidad: '100g', calorias: 22, proteinas: 3, carbohidratos: 3, grasas: 0, fibra: 1, categoria: 'vegetal', alternativas: ['portobello', 'setas'] },
  'calabacín': { nombre: 'calabacín', cantidad: '150g', calorias: 25, proteinas: 2, carbohidratos: 5, grasas: 0, fibra: 1, categoria: 'vegetal', alternativas: ['berenjena', 'zanahoria'] },
  'espárragos': { nombre: 'espárragos', cantidad: '150g', calorias: 30, proteinas: 3, carbohidratos: 6, grasas: 0, fibra: 3, categoria: 'vegetal', alternativas: ['brócoli', 'ejotes'] },
  'col': { nombre: 'col morada', cantidad: '100g', calorias: 31, proteinas: 1, carbohidratos: 7, grasas: 0, fibra: 2, categoria: 'vegetal', alternativas: ['lechuga', 'col china'] },

  // GRASAS SALUDABLES
  'aguacate': { nombre: 'aguacate', cantidad: '1/2 unidad', calorias: 120, proteinas: 1.5, carbohidratos: 6, grasas: 11, fibra: 5, categoria: 'grasa', alternativas: ['aceite de oliva'] },
  'aceite de oliva': { nombre: 'aceite de oliva', cantidad: '1 cucharada', calorias: 120, proteinas: 0, carbohidratos: 0, grasas: 14, fibra: 0, categoria: 'grasa', alternativas: ['aceite de aguacate'] },
  'nueces': { nombre: 'nueces', cantidad: '30g', calorias: 185, proteinas: 4, carbohidratos: 4, grasas: 18, fibra: 2, categoria: 'grasa', alternativas: ['almendras', 'pistachos'] },
  'almendras': { nombre: 'almendras', cantidad: '30g', calorias: 170, proteinas: 6, carbohidratos: 6, grasas: 15, fibra: 3, categoria: 'grasa', alternativas: ['nueces', 'cacahuates'] },

  // LÁCTEOS
  'yogurt': { nombre: 'yogurt griego natural', cantidad: '150g', calorias: 100, proteinas: 15, carbohidratos: 6, grasas: 2, fibra: 0, categoria: 'lacteo', alternativas: ['yogurt natural', 'kéfir'] },
  'queso': { nombre: 'queso bajo en grasa', cantidad: '30g', calorias: 70, proteinas: 8, carbohidratos: 1, grasas: 4, fibra: 0, categoria: 'lacteo', alternativas: ['queso cottage', 'requesón'] },
  'leche': { nombre: 'leche descremada', cantidad: '200ml', calorias: 70, proteinas: 7, carbohidratos: 10, grasas: 0, fibra: 0, categoria: 'lacteo', alternativas: ['leche de almendras', 'leche de soya'] },

  // CONDIMENTOS Y OTROS
  'ajo': { nombre: 'ajo', cantidad: '2 dientes', calorias: 10, proteinas: 0, carbohidratos: 2, grasas: 0, fibra: 0, categoria: 'condimento' },
  'limón': { nombre: 'limón', cantidad: '1 unidad', calorias: 20, proteinas: 0, carbohidratos: 6, grasas: 0, fibra: 2, categoria: 'condimento' },
  'cilantro': { nombre: 'cilantro fresco', cantidad: 'al gusto', calorias: 5, proteinas: 0, carbohidratos: 1, grasas: 0, fibra: 0, categoria: 'condimento' },
  'perejil': { nombre: 'perejil fresco', cantidad: 'al gusto', calorias: 5, proteinas: 0, carbohidratos: 1, grasas: 0, fibra: 0, categoria: 'condimento' },
  'miel': { nombre: 'miel', cantidad: '1 cucharada', calorias: 64, proteinas: 0, carbohidratos: 17, grasas: 0, fibra: 0, categoria: 'condimento', alternativas: ['jarabe de maple', 'agave'] },
  'plátano': { nombre: 'plátano', cantidad: '1 unidad', calorias: 105, proteinas: 1, carbohidratos: 27, grasas: 0, fibra: 3, categoria: 'carbohidrato', alternativas: ['manzana', 'pera'] },
  'fresas': { nombre: 'fresas', cantidad: '100g', calorias: 32, proteinas: 1, carbohidratos: 8, grasas: 0, fibra: 2, categoria: 'carbohidrato', alternativas: ['arándanos', 'frambuesas'] },
  'granola': { nombre: 'granola', cantidad: '40g', calorias: 180, proteinas: 5, carbohidratos: 28, grasas: 6, fibra: 4, categoria: 'carbohidrato', alternativas: ['avena', 'muesli'] },
  
  // INGREDIENTES ADICIONALES
  'arándanos': { nombre: 'arándanos', cantidad: '100g', calorias: 57, proteinas: 1, carbohidratos: 14, grasas: 0, fibra: 2, categoria: 'carbohidrato', alternativas: ['fresas', 'frambuesas'] },
  'manzana': { nombre: 'manzana', cantidad: '1 unidad', calorias: 95, proteinas: 0, carbohidratos: 25, grasas: 0, fibra: 4, categoria: 'carbohidrato', alternativas: ['pera', 'plátano'] },
  'pera': { nombre: 'pera', cantidad: '1 unidad', calorias: 100, proteinas: 1, carbohidratos: 27, grasas: 0, fibra: 6, categoria: 'carbohidrato', alternativas: ['manzana', 'durazno'] },
  'frijoles': { nombre: 'frijoles negros cocidos', cantidad: '200g', calorias: 240, proteinas: 16, carbohidratos: 41, grasas: 1, fibra: 15, categoria: 'proteina', alternativas: ['garbanzos', 'lentejas'] },
  'tempeh': { nombre: 'tempeh', cantidad: '150g', calorias: 195, proteinas: 19, carbohidratos: 9, grasas: 11, fibra: 5, categoria: 'proteina', alternativas: ['tofu', 'lentejas'] },
  'edamame': { nombre: 'edamame', cantidad: '150g', calorias: 180, proteinas: 17, carbohidratos: 14, grasas: 8, fibra: 8, categoria: 'proteina', alternativas: ['garbanzos', 'tofu'] },
  'calabaza': { nombre: 'calabaza', cantidad: '200g', calorias: 52, proteinas: 2, carbohidratos: 13, grasas: 0, fibra: 3, categoria: 'vegetal', alternativas: ['batata', 'zanahoria'] },
  'berenjena': { nombre: 'berenjena', cantidad: '200g', calorias: 50, proteinas: 2, carbohidratos: 12, grasas: 0, fibra: 6, categoria: 'vegetal', alternativas: ['calabacín', 'champiñones'] },
  'kale': { nombre: 'kale', cantidad: '100g', calorias: 35, proteinas: 3, carbohidratos: 6, grasas: 1, fibra: 2, categoria: 'vegetal', alternativas: ['espinaca', 'acelga'] },
  'jengibre': { nombre: 'jengibre fresco', cantidad: '1 trozo pequeño', calorias: 5, proteinas: 0, carbohidratos: 1, grasas: 0, fibra: 0, categoria: 'condimento' },
  'salsa soya': { nombre: 'salsa de soya baja en sodio', cantidad: '2 cucharadas', calorias: 20, proteinas: 2, carbohidratos: 2, grasas: 0, fibra: 0, categoria: 'condimento' },
  'tahini': { nombre: 'tahini', cantidad: '2 cucharadas', calorias: 180, proteinas: 5, carbohidratos: 6, grasas: 16, fibra: 3, categoria: 'grasa', alternativas: ['mantequilla de almendra'] },
  'arroz_blanco': { nombre: 'arroz blanco', cantidad: '80g (crudo)', calorias: 290, proteinas: 5, carbohidratos: 64, grasas: 0.5, fibra: 1, categoria: 'carbohidrato', alternativas: ['arroz integral', 'quinoa'] },
  'cuscús': { nombre: 'cuscús integral', cantidad: '80g (crudo)', calorias: 280, proteinas: 9, carbohidratos: 58, grasas: 1, fibra: 5, categoria: 'carbohidrato', alternativas: ['quinoa', 'bulgur'] },
  'chicharos': { nombre: 'chícharos', cantidad: '150g', calorias: 120, proteinas: 8, carbohidratos: 21, grasas: 0.5, fibra: 8, categoria: 'proteina', alternativas: ['edamame', 'ejotes'] },
  'elote': { nombre: 'granos de elote', cantidad: '150g', calorias: 130, proteinas: 5, carbohidratos: 27, grasas: 2, fibra: 4, categoria: 'carbohidrato', alternativas: ['chicharos'] },
  'ejotes': { nombre: 'ejotes', cantidad: '150g', calorias: 44, proteinas: 2, carbohidratos: 10, grasas: 0, fibra: 4, categoria: 'vegetal', alternativas: ['espárragos', 'brócoli'] },
  'mango': { nombre: 'mango', cantidad: '1 unidad', calorias: 135, proteinas: 1, carbohidratos: 35, grasas: 0, fibra: 4, categoria: 'carbohidrato', alternativas: ['piña', 'papaya'] },
  'coco': { nombre: 'coco rallado', cantidad: '30g', calorias: 100, proteinas: 1, carbohidratos: 4, grasas: 9, fibra: 2, categoria: 'grasa', alternativas: ['almendras'] },
};

// ============================================================================
// BASE DE CONOCIMIENTO - TEMPLATES DE RECETAS
// ============================================================================

export const RECETAS_DB: RecipeTemplate[] = [
  // ==================== DESAYUNOS ====================
  {
    id: 'des_001',
    nombre: 'Bowl de Avena con Frutas y Nueces',
    descripcion: 'Desayuno energético con avena, frutas frescas y frutos secos crujientes',
    tipo: 'desayuno',
    dificultad: 'fácil',
    tiempoPreparacion: '15 minutos',
    ingredientes: [
      INGREDIENTES_DB['avena'],
      INGREDIENTES_DB['plátano'],
      INGREDIENTES_DB['fresas'],
      INGREDIENTES_DB['nueces'],
      INGREDIENTES_DB['miel'],
      INGREDIENTES_DB['leche'],
    ],
    pasos: [
      'En una olla pequeña, calienta la leche a fuego medio.',
      'Agrega la avena y cocina durante 5-7 minutos, revolviendo ocasionalmente hasta obtener la consistencia deseada.',
      'Mientras tanto, corta el plátano en rodajas y las fresas en cuartos.',
      'Tritura las nueces en trozos pequeños.',
      'Sirve la avena en un bowl y decora con las frutas y nueces.',
      'Rocía con miel al gusto y disfruta caliente.',
    ],
    tags: ['rico en fibra', 'energético', 'vegetariano', 'alto en proteína'],
    consejos: 'Puedes preparar la avena la noche anterior dejándola remojando en leche fría (overnight oats). Si prefieres una versión más proteica, agrega una cucharada de proteína en polvo.',
    variaciones: [
      {
        nombre: 'Versión chocolate-mantequilla de maní',
        cambios: [
          { original: 'nueces', nuevo: 'mantequilla de maní + cacao en polvo' },
          { original: 'miel', nuevo: 'chips de chocolate oscuro' }
        ]
      }
    ]
  },
  {
    id: 'des_002',
    nombre: 'Omelette Proteico con Vegetales',
    descripcion: 'Omelette esponjoso cargado de vegetales frescos y proteína',
    tipo: 'desayuno',
    dificultad: 'fácil',
    tiempoPreparacion: '15 minutos',
    ingredientes: [
      INGREDIENTES_DB['huevos'],
      INGREDIENTES_DB['pimiento'],
      INGREDIENTES_DB['cebolla'],
      INGREDIENTES_DB['champiñones'],
      INGREDIENTES_DB['espinaca'],
      INGREDIENTES_DB['queso'],
      INGREDIENTES_DB['aceite de oliva'],
    ],
    pasos: [
      'Lava y corta todos los vegetales en trozos pequeños: pimientos, cebolla, champiñones y espinaca.',
      'Bate los huevos en un bowl con una pizca de sal y pimienta.',
      'Calienta una sartén antiadherente con aceite de oliva a fuego medio.',
      'Saltea los vegetales durante 3-4 minutos hasta que estén tiernos.',
      'Vierte los huevos batidos sobre los vegetales.',
      'Cocina por 2-3 minutos sin mover, luego añade el queso rallado.',
      'Dobla el omelette por la mitad y cocina 1 minuto más.',
      'Sirve inmediatamente decorado con perejil fresco.',
    ],
    tags: ['alto en proteína', 'bajo en carbohidratos', 'vegetariano', 'rico en vitaminas'],
    consejos: 'Para un omelette más esponjoso, agrega una cucharada de leche a los huevos batidos. Si quieres reducir calorías, usa solo las claras de huevo.',
    variaciones: []
  },
  {
    id: 'des_003',
    nombre: 'Tostadas de Aguacate con Huevo Pochado',
    descripcion: 'Tostadas crujientes con cremoso aguacate y huevo perfectamente pochado',
    tipo: 'desayuno',
    dificultad: 'intermedio',
    tiempoPreparacion: '20 minutos',
    ingredientes: [
      INGREDIENTES_DB['pan integral'],
      INGREDIENTES_DB['aguacate'],
      INGREDIENTES_DB['huevos'],
      INGREDIENTES_DB['tomate'],
      INGREDIENTES_DB['limón'],
      INGREDIENTES_DB['cilantro'],
      INGREDIENTES_DB['aceite de oliva'],
    ],
    pasos: [
      'Tuesta el pan integral hasta que esté dorado y crujiente.',
      'Machaca el aguacate en un bowl con jugo de limón, sal y pimienta.',
      'Hierve agua en una olla, añade una cucharada de vinagre.',
      'Crea un remolino en el agua y añade cuidadosamente el huevo.',
      'Cocina el huevo pochado por 3-4 minutos.',
      'Unta el aguacate sobre las tostadas.',
      'Corona con el huevo pochado y tomate cortado en cubitos.',
      'Decora con cilantro fresco y un chorrito de aceite de oliva.',
    ],
    tags: ['grasas saludables', 'instagram-worthy', 'rico en fibra', 'trendy'],
    consejos: 'Si el huevo pochado es complicado, puedes hacer un huevo frito a fuego medio. El aguacate debe estar en su punto perfecto de madurez para una textura cremosa.',
    variaciones: []
  },
  {
    id: 'des_004',
    nombre: 'Smoothie Bowl Proteico',
    descripcion: 'Bowl cremoso de smoothie decorado con toppings nutritivos y coloridos',
    tipo: 'desayuno',
    dificultad: 'fácil',
    tiempoPreparacion: '10 minutos',
    ingredientes: [
      INGREDIENTES_DB['plátano'],
      INGREDIENTES_DB['fresas'],
      INGREDIENTES_DB['yogurt'],
      INGREDIENTES_DB['avena'],
      INGREDIENTES_DB['granola'],
      INGREDIENTES_DB['nueces'],
      INGREDIENTES_DB['miel'],
    ],
    pasos: [
      'En una licuadora, coloca el plátano congelado, fresas, yogurt griego y un poco de leche.',
      'Licúa hasta obtener una consistencia cremosa y espesa.',
      'Vierte el smoothie en un bowl.',
      'Decora con granola, nueces picadas y fresas frescas en mitades.',
      'Espolvorea avena cruda si lo deseas.',
      'Rocía con miel en forma de zigzag.',
      'Sirve inmediatamente antes de que se derrita.',
    ],
    tags: ['refrescante', 'alto en proteína', 'antioxidantes', 'colorido'],
    consejos: 'Usa frutas congeladas para obtener una consistencia más espesa similar a un helado. Puedes agregar una cucharada de mantequilla de maní para más proteína.',
    variaciones: []
  },
  {
    id: 'des_005',
    nombre: 'Panqueques de Avena y Plátano',
    descripcion: 'Panqueques esponjosos naturalmente endulzados sin azúcar refinada',
    tipo: 'desayuno',
    dificultad: 'fácil',
    tiempoPreparacion: '20 minutos',
    ingredientes: [
      INGREDIENTES_DB['avena'],
      INGREDIENTES_DB['plátano'],
      INGREDIENTES_DB['huevos'],
      INGREDIENTES_DB['leche'],
      INGREDIENTES_DB['miel'],
      INGREDIENTES_DB['fresas'],
      INGREDIENTES_DB['aceite de oliva'],
    ],
    pasos: [
      'En una licuadora, mezcla la avena hasta obtener harina de avena.',
      'Añade el plátano maduro, huevos y leche.',
      'Licúa hasta obtener una masa homogénea.',
      'Calienta una sartén antiadherente con un poco de aceite.',
      'Vierte porciones de masa y cocina hasta que aparezcan burbujas.',
      'Voltea y cocina por 1-2 minutos más.',
      'Sirve apilados con fresas frescas y un chorrito de miel.',
    ],
    tags: ['sin azúcar refinada', 'familiar', 'alto en fibra', 'endulzado naturalmente'],
    consejos: 'Asegúrate de que el plátano esté bien maduro para mayor dulzura natural. Puedes mantener los panqueques calientes en el horno a baja temperatura mientras cocinas el resto.',
    variaciones: []
  },

  // ==================== ALMUERZOS ====================
  {
    id: 'alm_001',
    nombre: 'Pollo a la Plancha con Quinoa y Vegetales Asados',
    descripcion: 'Pechuga de pollo jugosa acompañada de quinoa esponjosa y vegetales coloridos al horno',
    tipo: 'almuerzo',
    dificultad: 'intermedio',
    tiempoPreparacion: '40 minutos',
    ingredientes: [
      INGREDIENTES_DB['pollo'],
      INGREDIENTES_DB['quinoa'],
      INGREDIENTES_DB['brócoli'],
      INGREDIENTES_DB['zanahoria'],
      INGREDIENTES_DB['pimiento'],
      INGREDIENTES_DB['aceite de oliva'],
      INGREDIENTES_DB['ajo'],
      INGREDIENTES_DB['limón'],
    ],
    pasos: [
      'Precalienta el horno a 200°C.',
      'Enjuaga la quinoa y cocínala según las instrucciones del paquete (generalmente 15 minutos).',
      'Corta el brócoli, zanahoria y pimiento en trozos uniformes.',
      'Coloca los vegetales en una bandeja, rocía con aceite de oliva, sal, pimienta y ajo picado.',
      'Hornea los vegetales por 25-30 minutos hasta que estén dorados.',
      'Mientras tanto, sazona el pollo con sal, pimienta, ajo en polvo y limón.',
      'Calienta una sartén a fuego medio-alto y cocina el pollo por 6-7 minutos por cada lado.',
      'Deja reposar el pollo 5 minutos antes de cortar.',
      'Sirve la quinoa como base, añade los vegetales y corona con el pollo en láminas.',
      'Exprime jugo de limón fresco sobre todo el plato.',
    ],
    tags: ['alto en proteína', 'balanceado', 'colorido', 'meal prep friendly'],
    consejos: 'Puedes preparar este plato para varios días. El pollo se mantiene jugoso si lo guardas separado de la quinoa. Los vegetales asados están deliciosos incluso fríos.',
    variaciones: [
      {
        nombre: 'Versión mediterránea',
        cambios: [
          { original: 'quinoa', nuevo: 'arroz integral + garbanzos' },
          { original: 'vegetales', nuevo: 'tomate cherry + calabacín + berenjena' }
        ]
      }
    ]
  },
  {
    id: 'alm_002',
    nombre: 'Bowl Mexicano con Frijoles y Aguacate',
    descripcion: 'Bowl nutritivo inspirado en sabores mexicanos con frijoles, arroz y aguacate cremoso',
    tipo: 'almuerzo',
    dificultad: 'fácil',
    tiempoPreparacion: '30 minutos',
    ingredientes: [
      INGREDIENTES_DB['arroz'],
      INGREDIENTES_DB['garbanzos'], // usamos garbanzos como base de legumbre
      INGREDIENTES_DB['pollo'],
      INGREDIENTES_DB['tomate'],
      INGREDIENTES_DB['aguacate'],
      INGREDIENTES_DB['lechuga'],
      INGREDIENTES_DB['cebolla'],
      INGREDIENTES_DB['limón'],
      INGREDIENTES_DB['cilantro'],
    ],
    pasos: [
      'Cocina el arroz integral según las instrucciones del paquete.',
      'Sazona el pollo con comino, pimentón y sal, luego cocina a la plancha.',
      'Calienta los garbanzos con un poco de comino y ajo en polvo.',
      'Corta el tomate, cebolla y lechuga en trozos pequeños.',
      'Corta el aguacate en láminas.',
      'En un bowl, coloca el arroz como base.',
      'Añade el pollo cortado en tiras sobre un lado del bowl.',
      'Agrega los garbanzos, tomate, cebolla y lechuga en secciones.',
      'Corona con aguacate en láminas y cilantro fresco.',
      'Exprime limón fresco sobre todo y sirve.',
    ],
    tags: ['mexicano', 'colorido', 'fibra', 'completo'],
    consejos: 'Puedes añadir un poco de yogurt griego como crema ácida saludable. Si te gusta picante, agrega jalapeños en rodajas.',
    variaciones: []
  },
  {
    id: 'alm_003',
    nombre: 'Salmón al Horno con Espárragos y Batata',
    descripcion: 'Filete de salmón perfectamente horneado con espárragos crujientes y batata dulce',
    tipo: 'almuerzo',
    dificultad: 'intermedio',
    tiempoPreparacion: '35 minutos',
    ingredientes: [
      INGREDIENTES_DB['salmón'],
      INGREDIENTES_DB['batata'],
      INGREDIENTES_DB['espárragos'],
      INGREDIENTES_DB['ajo'],
      INGREDIENTES_DB['limón'],
      INGREDIENTES_DB['aceite de oliva'],
    ],
    pasos: [
      'Precalienta el horno a 200°C.',
      'Pela y corta la batata en cubos medianos.',
      'Coloca la batata en una bandeja, rocía con aceite de oliva y hornea por 15 minutos.',
      'Lava y corta los extremos duros de los espárragos.',
      'Pasados los 15 minutos, añade los espárragos a la bandeja.',
      'Coloca el filete de salmón en otra bandeja o en la misma.',
      'Rocía el salmón con aceite de oliva, ajo picado, sal, pimienta y rodajas de limón.',
      'Hornea todo junto por 15-18 minutos más.',
      'El salmón está listo cuando se desmenuza fácilmente con un tenedor.',
      'Sirve caliente con limón extra al lado.',
    ],
    tags: ['omega-3', 'antiinflamatorio', 'gourmet', 'saludable para el corazón'],
    consejos: 'No sobrecalientes el salmón o quedará seco. El interior debe estar ligeramente rosado. La batata asada está perfecta cuando está dorada por fuera y suave por dentro.',
    variaciones: []
  },
  {
    id: 'alm_004',
    nombre: 'Pasta Integral con Pollo y Vegetales',
    descripcion: 'Pasta al dente con trozos jugosos de pollo y vegetales salteados en ajo',
    tipo: 'almuerzo',
    dificultad: 'fácil',
    tiempoPreparacion: '30 minutos',
    ingredientes: [
      INGREDIENTES_DB['pasta'],
      INGREDIENTES_DB['pollo'],
      INGREDIENTES_DB['brócoli'],
      INGREDIENTES_DB['tomate'],
      INGREDIENTES_DB['pimiento'],
      INGREDIENTES_DB['ajo'],
      INGREDIENTES_DB['aceite de oliva'],
    ],
    pasos: [
      'Cocina la pasta integral según las instrucciones del paquete hasta que esté al dente.',
      'Corta el pollo en cubos pequeños y sazona con sal y pimienta.',
      'En una sartén grande, calienta aceite de oliva y cocina el pollo hasta dorar.',
      'Retira el pollo y en la misma sartén, saltea el ajo picado.',
      'Añade el brócoli, tomate y pimiento cortados.',
      'Saltea los vegetales por 5-7 minutos.',
      'Regresa el pollo a la sartén.',
      'Escurre la pasta y agrégala a la sartén.',
      'Mezcla todo junto, añade un poco de agua de cocción de la pasta si es necesario.',
      'Sirve caliente con queso parmesano rallado (opcional).',
    ],
    tags: ['italiano', 'completo', 'familiar', 'reconfortante'],
    consejos: 'Guarda un poco del agua de cocción de la pasta, es perfecta para crear una salsa ligera. Puedes añadir hojuelas de chile para un toque picante.',
    variaciones: []
  },
  {
    id: 'alm_005',
    nombre: 'Ensalada de Atún con Vegetales Frescos',
    descripcion: 'Ensalada refrescante y proteica con atún, vegetales crujientes y vinagreta casera',
    tipo: 'almuerzo',
    dificultad: 'fácil',
    tiempoPreparacion: '15 minutos',
    ingredientes: [
      INGREDIENTES_DB['atún'],
      INGREDIENTES_DB['lechuga'],
      INGREDIENTES_DB['tomate'],
      INGREDIENTES_DB['pepino'],
      INGREDIENTES_DB['cebolla'],
      INGREDIENTES_DB['aguacate'],
      INGREDIENTES_DB['limón'],
      INGREDIENTES_DB['aceite de oliva'],
    ],
    pasos: [
      'Lava y corta la lechuga en trozos del tamaño de un bocado.',
      'Corta el tomate en cuartos y el pepino en medias lunas.',
      'Corta la cebolla en aros finos y remoja en agua fría por 5 minutos para quitar el fuerte sabor.',
      'Escurre el atún y desmenuza con un tenedor.',
      'Corta el aguacate en cubos.',
      'En un bowl grande, mezcla todos los vegetales.',
      'Añade el atún por encima.',
      'Prepara la vinagreta mezclando aceite de oliva, jugo de limón, sal y pimienta.',
      'Vierte la vinagreta sobre la ensalada y mezcla suavemente.',
      'Sirve inmediatamente decorado con el aguacate.',
    ],
    tags: ['ligero', 'refrescante', 'rápido', 'bajo en carbohidratos'],
    consejos: 'Esta ensalada es perfecta para días calurosos. Puedes añadir huevo duro para más proteína o garbanzos para más saciedad.',
    variaciones: []
  },
  {
    id: 'alm_006',
    nombre: 'Bowl Vegetariano de Lentejas y Quinoa',
    descripcion: 'Bowl nutritivo 100% vegetal con lentejas, quinoa y vegetales asados',
    tipo: 'almuerzo',
    dificultad: 'intermedio',
    tiempoPreparacion: '45 minutos',
    ingredientes: [
      INGREDIENTES_DB['lentejas'],
      INGREDIENTES_DB['quinoa'],
      INGREDIENTES_DB['batata'],
      INGREDIENTES_DB['espinaca'],
      INGREDIENTES_DB['aguacate'],
      INGREDIENTES_DB['ajo'],
      INGREDIENTES_DB['limón'],
      INGREDIENTES_DB['aceite de oliva'],
    ],
    pasos: [
      'Cocina las lentejas en agua con sal hasta que estén tiernas (20-25 minutos).',
      'Cocina la quinoa según las instrucciones del paquete.',
      'Precalienta el horno a 200°C.',
      'Pela y corta la batata en cubos, rocía con aceite y hornea por 25 minutos.',
      'Saltea la espinaca con ajo picado hasta que se marchite.',
      'En un bowl, coloca la quinoa y lentejas como base.',
      'Añade la batata asada y espinaca salteada.',
      'Corona con aguacate en láminas.',
      'Prepara un aderezo con aceite de oliva, limón, ajo y mostaza.',
      'Vierte el aderezo sobre el bowl y mezcla al comer.',
    ],
    tags: ['vegano', 'alto en proteína vegetal', 'rico en hierro', 'antiinflamatorio'],
    consejos: 'Las lentejas y quinoa juntas forman una proteína completa. Puedes preparar este bowl en grandes cantidades para meal prep.',
    variaciones: []
  },
  {
    id: 'alm_007',
    nombre: 'Tacos de Pescado con Ensalada de Col',
    descripcion: 'Tacos frescos con pescado crujiente y ensalada de col cremosa',
    tipo: 'almuerzo',
    dificultad: 'intermedio',
    tiempoPreparacion: '30 minutos',
    ingredientes: [
      INGREDIENTES_DB['pescado'],
      INGREDIENTES_DB['tortilla'],
      INGREDIENTES_DB['col'],
      INGREDIENTES_DB['aguacate'],
      INGREDIENTES_DB['limón'],
      INGREDIENTES_DB['cilantro'],
      INGREDIENTES_DB['yogurt'],
      INGREDIENTES_DB['aceite de oliva'],
    ],
    pasos: [
      'Corta el pescado en tiras y sazona con sal, pimienta, ajo en polvo y pimentón.',
      'Ralla la col finamente.',
      'Prepara la salsa de col mezclando yogurt griego, limón, sal y pimienta.',
      'Mezcla la col rallada con la salsa.',
      'Calienta aceite en una sartén y cocina el pescado por 3-4 minutos por lado.',
      'Calienta las tortillas en otra sartén o directamente en la llama.',
      'Arma los tacos colocando col en cada tortilla.',
      'Añade el pescado cocido encima.',
      'Corona con aguacate en cubos y cilantro fresco.',
      'Sirve con gajos de limón.',
    ],
    tags: ['mexicano', 'fresco', 'veraniego', 'ligero'],
    consejos: 'No sobrecocines el pescado o quedará seco. La ensalada de col es mejor si la preparas 30 minutos antes para que los sabores se mezclen.',
    variaciones: []
  },

  // ==================== CENAS ====================
  {
    id: 'cen_001',
    nombre: 'Pechuga de Pavo con Vegetales al Vapor',
    descripcion: 'Cena ligera con pavo jugoso y vegetales al vapor llenos de nutrientes',
    tipo: 'cena',
    dificultad: 'fácil',
    tiempoPreparacion: '25 minutos',
    ingredientes: [
      INGREDIENTES_DB['pavo'],
      INGREDIENTES_DB['brócoli'],
      INGREDIENTES_DB['zanahoria'],
      INGREDIENTES_DB['calabacín'],
      INGREDIENTES_DB['ajo'],
      INGREDIENTES_DB['limón'],
      INGREDIENTES_DB['aceite de oliva'],
    ],
    pasos: [
      'Prepara una vaporera con agua y lleva a ebullición.',
      'Corta los vegetales en trozos uniformes.',
      'Coloca los vegetales en la vaporera y cocina por 8-10 minutos.',
      'Mientras tanto, sazona el pavo con sal, pimienta, ajo en polvo y hierbas.',
      'Calienta una sartén con aceite de oliva a fuego medio-alto.',
      'Cocina el pavo por 5-6 minutos por cada lado hasta que esté dorado.',
      'Deja reposar el pavo 5 minutos antes de cortar.',
      'Sirve el pavo en láminas con los vegetales al lado.',
      'Exprime limón fresco sobre todo.',
      'Rocía con un hilo de aceite de oliva extra virgen.',
    ],
    tags: ['ligero', 'bajo en grasa', 'digestivo', 'ideal para la noche'],
    consejos: 'Los vegetales al vapor conservan más nutrientes que hervidos. Puedes añadir un poco de salsa de soya baja en sodio para darle un toque asiático.',
    variaciones: []
  },
  {
    id: 'cen_002',
    nombre: 'Sopa de Lentejas con Vegetales',
    descripcion: 'Sopa reconfortante y nutritiva repleta de lentejas y vegetales frescos',
    tipo: 'cena',
    dificultad: 'fácil',
    tiempoPreparacion: '40 minutos',
    ingredientes: [
      INGREDIENTES_DB['lentejas'],
      INGREDIENTES_DB['zanahoria'],
      INGREDIENTES_DB['cebolla'],
      INGREDIENTES_DB['tomate'],
      INGREDIENTES_DB['espinaca'],
      INGREDIENTES_DB['ajo'],
      INGREDIENTES_DB['aceite de oliva'],
    ],
    pasos: [
      'En una olla grande, calienta aceite de oliva y sofríe cebolla y ajo picados.',
      'Añade zanahoria cortada en cubos pequeños.',
      'Agrega el tomate cortado y cocina por 3-4 minutos.',
      'Incorpora las lentejas previamente enjuagadas.',
      'Cubre con agua o caldo de vegetales (aproximadamente 1 litro).',
      'Añade sal, pimienta, comino y laurel.',
      'Cocina a fuego medio durante 25-30 minutos hasta que las lentejas estén tiernas.',
      'Añade la espinaca en los últimos 5 minutos.',
      'Ajusta la consistencia añadiendo más agua si es necesario.',
      'Sirve caliente con un chorrito de aceite de oliva.',
    ],
    tags: ['reconfortante', 'vegano', 'rico en hierro', 'económico'],
    consejos: 'Esta sopa sabe mejor al día siguiente cuando los sabores se han integrado. Puedes licuar una parte para obtener una textura más cremosa.',
    variaciones: []
  },
  {
    id: 'cen_003',
    nombre: 'Ensalada César con Pollo a la Parrilla',
    descripcion: 'Clásica ensalada César con pollo jugoso y aderezo cremoso ligero',
    tipo: 'cena',
    dificultad: 'fácil',
    tiempoPreparacion: '20 minutos',
    ingredientes: [
      INGREDIENTES_DB['pollo'],
      INGREDIENTES_DB['lechuga'],
      INGREDIENTES_DB['queso'],
      INGREDIENTES_DB['pan integral'],
      INGREDIENTES_DB['yogurt'],
      INGREDIENTES_DB['ajo'],
      INGREDIENTES_DB['limón'],
      INGREDIENTES_DB['aceite de oliva'],
    ],
    pasos: [
      'Sazona el pollo con sal, pimienta y ajo en polvo.',
      'Cocina el pollo a la plancha por 6-7 minutos por lado.',
      'Deja reposar y corta en tiras.',
      'Corta el pan integral en cubos y tuesta en el horno hasta dorar (croutones).',
      'Lava y corta la lechuga romana.',
      'Prepara el aderezo mezclando yogurt griego, limón, ajo picado, mostaza, sal y pimienta.',
      'En un bowl grande, mezcla la lechuga con el aderezo.',
      'Añade el queso parmesano rallado y los croutones.',
      'Corona con las tiras de pollo.',
      'Sirve inmediatamente.',
    ],
    tags: ['clásico', 'satisfactorio', 'alto en proteína', 'popular'],
    consejos: 'El secreto de una buena ensalada César es el aderezo bien emulsionado. Puedes añadir anchoas al aderezo para un sabor más auténtico.',
    variaciones: []
  },
  {
    id: 'cen_004',
    nombre: 'Tortilla Española de Vegetales',
    descripcion: 'Tortilla esponjosa estilo español cargada de vegetales nutritivos',
    tipo: 'cena',
    dificultad: 'intermedio',
    tiempoPreparacion: '30 minutos',
    ingredientes: [
      INGREDIENTES_DB['huevos'],
      INGREDIENTES_DB['papa'],
      INGREDIENTES_DB['cebolla'],
      INGREDIENTES_DB['pimiento'],
      INGREDIENTES_DB['calabacín'],
      INGREDIENTES_DB['aceite de oliva'],
    ],
    pasos: [
      'Pela y corta las papas en rodajas finas.',
      'Corta la cebolla, pimiento y calabacín en trozos pequeños.',
      'En una sartén grande, calienta aceite de oliva abundante.',
      'Fríe las papas a fuego medio hasta que estén tiernas (no doradas).',
      'Añade los demás vegetales y cocina 5 minutos más.',
      'Escurre el exceso de aceite.',
      'Bate los huevos con sal y pimienta.',
      'Mezcla los vegetales con los huevos batidos.',
      'En una sartén mediana con poco aceite, vierte la mezcla.',
      'Cocina a fuego bajo por 8-10 minutos, luego voltea con un plato y cocina 5 minutos más.',
      'Sirve tibia o a temperatura ambiente.',
    ],
    tags: ['español', 'reconfortante', 'versatile', 'meal prep'],
    consejos: 'La clave es cocinar a fuego bajo para que quede jugosa por dentro. Puedes comerla caliente o fría, perfecta para llevar.',
    variaciones: []
  },
  {
    id: 'cen_005',
    nombre: 'Wrap de Pollo con Vegetales Crujientes',
    descripcion: 'Wrap fresco y crujiente relleno de pollo especiado y vegetales coloridos',
    tipo: 'cena',
    dificultad: 'fácil',
    tiempoPreparacion: '20 minutos',
    ingredientes: [
      INGREDIENTES_DB['pollo'],
      INGREDIENTES_DB['tortilla'],
      INGREDIENTES_DB['lechuga'],
      INGREDIENTES_DB['tomate'],
      INGREDIENTES_DB['pepino'],
      INGREDIENTES_DB['yogurt'],
      INGREDIENTES_DB['aguacate'],
      INGREDIENTES_DB['limón'],
    ],
    pasos: [
      'Corta el pollo en tiras y sazona con pimentón, comino, ajo en polvo, sal y pimienta.',
      'Cocina el pollo en una sartén a fuego medio-alto por 8-10 minutos.',
      'Corta la lechuga, tomate y pepino en tiras finas.',
      'Prepara una salsa mezclando yogurt griego con limón y hierbas.',
      'Calienta ligeramente las tortillas.',
      'Unta la salsa de yogurt en el centro de cada tortilla.',
      'Añade lechuga, tomate, pepino y pollo.',
      'Agrega aguacate en láminas.',
      'Enrolla apretando bien los extremos.',
      'Corta por la mitad en diagonal y sirve.',
    ],
    tags: ['portable', 'fresco', 'balanceado', 'lunch perfecto'],
    consejos: 'Para que no se desarme, coloca los ingredientes en el centro y no sobrecargues. Puedes tostar el wrap en una sartén para que quede crujiente.',
    variaciones: []
  },
  {
    id: 'cen_006',
    nombre: 'Pescado al Horno con Limón y Hierbas',
    descripcion: 'Filete de pescado delicadamente horneado con limón fresco y hierbas aromáticas',
    tipo: 'cena',
    dificultad: 'fácil',
    tiempoPreparacion: '25 minutos',
    ingredientes: [
      INGREDIENTES_DB['pescado'],
      INGREDIENTES_DB['espinaca'],
      INGREDIENTES_DB['tomate'],
      INGREDIENTES_DB['limón'],
      INGREDIENTES_DB['ajo'],
      INGREDIENTES_DB['aceite de oliva'],
    ],
    pasos: [
      'Precalienta el horno a 180°C.',
      'Coloca el filete de pescado en una bandeja forrada con papel aluminio.',
      'Sazona con sal, pimienta, ajo picado y hierbas frescas (perejil, tomillo).',
      'Coloca rodajas de limón sobre el pescado.',
      'Rocía generosamente con aceite de oliva.',
      'Cierra el papel aluminio formando un paquete.',
      'Hornea por 15-18 minutos.',
      'Mientras tanto, saltea espinaca con ajo.',
      'Corta tomates cherry por la mitad y añade a la espinaca.',
      'Sirve el pescado acompañado de las espinacas y tomates.',
    ],
    tags: ['ligero', 'mediterráneo', 'omega-3', 'elegante'],
    consejos: 'Cocinar en papel aluminio mantiene el pescado súper jugoso. No sobrecalientes o quedará seco. El pescado está listo cuando se desmenuza fácilmente.',
    variaciones: []
  },
  {
    id: 'cen_007',
    nombre: 'Revuelto de Tofu con Vegetales',
    descripcion: 'Revuelto vegano proteico con tofu desmenuzado y vegetales salteados',
    tipo: 'cena',
    dificultad: 'fácil',
    tiempoPreparacion: '20 minutos',
    ingredientes: [
      INGREDIENTES_DB['tofu'],
      INGREDIENTES_DB['pimiento'],
      INGREDIENTES_DB['cebolla'],
      INGREDIENTES_DB['champiñones'],
      INGREDIENTES_DB['espinaca'],
      INGREDIENTES_DB['ajo'],
      INGREDIENTES_DB['aceite de oliva'],
    ],
    pasos: [
      'Escurre bien el tofu y desmenuza con las manos o un tenedor.',
      'Corta todos los vegetales en trozos pequeños.',
      'Calienta aceite en una sartén grande a fuego medio-alto.',
      'Sofríe el ajo y cebolla hasta que estén transparentes.',
      'Añade el pimiento y champiñones, cocina 5 minutos.',
      'Incorpora el tofu desmenuzado.',
      'Sazona con cúrcuma (para color), sal, pimienta, comino y pimentón.',
      'Cocina revolviendo por 5-7 minutos hasta que el tofu esté dorado.',
      'Añade la espinaca y cocina hasta que se marchite.',
      'Sirve caliente, decorado con cilantro o perejil.',
    ],
    tags: ['vegano', 'alto en proteína', 'sin colesterol', 'antiinflamatorio'],
    consejos: 'La cúrcuma le da un color amarillo similar a los huevos revueltos. Puedes añadir levadura nutricional para un sabor "quesoso".',
    variaciones: []
  },

  // ==================== SNACKS ====================
  {
    id: 'snk_001',
    nombre: 'Yogurt Griego con Frutas y Granola',
    descripcion: 'Snack proteico y refrescante perfecto para media mañana o tarde',
    tipo: 'snack',
    dificultad: 'fácil',
    tiempoPreparacion: '5 minutos',
    ingredientes: [
      INGREDIENTES_DB['yogurt'],
      INGREDIENTES_DB['fresas'],
      INGREDIENTES_DB['plátano'],
      INGREDIENTES_DB['granola'],
      INGREDIENTES_DB['miel'],
    ],
    pasos: [
      'Coloca el yogurt griego en un bowl.',
      'Corta las fresas en cuartos y el plátano en rodajas.',
      'Decora el yogurt con las frutas.',
      'Espolvorea granola por encima.',
      'Rocía con miel en forma de zigzag.',
      'Sirve inmediatamente.',
    ],
    tags: ['rápido', 'proteico', 'refrescante', 'saciante'],
    consejos: 'Usa yogurt griego alto en proteína. Puedes preparar varios potes para la semana (sin la granola, añádela al momento).',
    variaciones: []
  },
  {
    id: 'snk_002',
    nombre: 'Tostadas de Pan Integral con Mantequilla de Maní',
    descripcion: 'Snack energético con carbohidratos complejos y grasas saludables',
    tipo: 'snack',
    dificultad: 'fácil',
    tiempoPreparacion: '5 minutos',
    ingredientes: [
      INGREDIENTES_DB['pan integral'],
      { ...INGREDIENTES_DB['almendras'], nombre: 'mantequilla de maní natural', cantidad: '2 cucharadas', calorias: 190 },
      INGREDIENTES_DB['plátano'],
      INGREDIENTES_DB['miel'],
    ],
    pasos: [
      'Tuesta el pan integral hasta que esté dorado.',
      'Unta generosamente con mantequilla de maní.',
      'Corta el plátano en rodajas y coloca sobre el pan.',
      'Rocía con un poco de miel.',
      'Opcionalmente espolvorea con canela.',
      'Sirve inmediatamente.',
    ],
    tags: ['energético', 'pre-workout', 'satisfactorio', 'dulce'],
    consejos: 'Perfecto antes de entrenar por su balance de carbohidratos y grasas. Usa mantequilla de maní natural sin azúcares añadidos.',
    variaciones: []
  },

  // ==================== NUEVAS RECETAS - DESAYUNOS ====================
  {
    id: 'des_006',
    nombre: 'Burrito de Desayuno con Huevo y Frijoles',
    descripcion: 'Burrito mexicano lleno de proteína con huevos revueltos y frijoles negros',
    tipo: 'desayuno',
    dificultad: 'fácil',
    tiempoPreparacion: '20 minutos',
    ingredientes: [
      INGREDIENTES_DB['tortilla'],
      INGREDIENTES_DB['huevos'],
      INGREDIENTES_DB['frijoles'],
      INGREDIENTES_DB['aguacate'],
      INGREDIENTES_DB['tomate'],
      INGREDIENTES_DB['queso'],
      INGREDIENTES_DB['cilantro'],
    ],
    pasos: [
      'Calienta los frijoles negros en una sartén pequeña.',
      'En otra sartén, revuelve los huevos hasta que estén cremosos.',
      'Calienta las tortillas unos segundos en el comal.',
      'Coloca los frijoles en el centro de cada tortilla.',
      'Añade los huevos revueltos encima.',
      'Agrega tomate picado, aguacate en cubitos y queso rallado.',
      'Espolvorea cilantro fresco.',
      'Enrolla el burrito doblando los extremos primero, luego enrolla firmemente.',
      'Opcional: dora el burrito en la sartén para que quede crujiente.',
    ],
    tags: ['mexicano', 'alto en proteína', 'sustancioso', 'portátil'],
    consejos: 'Puedes preparar varios burritos y congelarlos envueltos en papel aluminio. Perfectos para desayunos rápidos durante la semana.',
    variaciones: []
  },
  {
    id: 'des_007',
    nombre: 'Chia Pudding con Frutas Tropicales',
    descripcion: 'Pudín cremoso de chía preparado overnight con mango y coco',
    tipo: 'desayuno',
    dificultad: 'fácil',
    tiempoPreparacion: '10 minutos + overnight',
    ingredientes: [
      { nombre: 'semillas de chía', cantidad: '3 cucharadas', calorias: 140, proteinas: 5, carbohidratos: 12, grasas: 9, fibra: 10, categoria: 'grasa' as const },
      INGREDIENTES_DB['leche'],
      INGREDIENTES_DB['mango'],
      INGREDIENTES_DB['coco'],
      INGREDIENTES_DB['miel'],
      INGREDIENTES_DB['almendras'],
    ],
    pasos: [
      'En un frasco o bowl, mezcla las semillas de chía con la leche.',
      'Añade una cucharada de miel y revuelve bien.',
      'Refrigera durante mínimo 4 horas o toda la noche.',
      'Al servir, corta el mango en cubitos.',
      'Coloca el pudín de chía en un bowl.',
      'Decora con mango, coco rallado y almendras picadas.',
      'Rocía un poco más de miel si lo deseas más dulce.',
    ],
    tags: ['preparar con anticipación', 'omega-3', 'tropical', 'refrescante'],
    consejos: 'La consistencia debe ser como un pudín espeso. Si está muy líquido, agrega más chía. Si está muy espeso, agrega un poco de leche.',
    variaciones: []
  },
  {
    id: 'des_008',
    nombre: 'Tostadas Francesas Proteicas',
    descripcion: 'French toast alto en proteína con toque de canela y vainilla',
    tipo: 'desayuno',
    dificultad: 'intermedio',
    tiempoPreparacion: '20 minutos',
    ingredientes: [
      INGREDIENTES_DB['pan integral'],
      INGREDIENTES_DB['huevos'],
      INGREDIENTES_DB['leche'],
      INGREDIENTES_DB['plátano'],
      INGREDIENTES_DB['fresas'],
      INGREDIENTES_DB['yogurt'],
      INGREDIENTES_DB['miel'],
    ],
    pasos: [
      'En un bowl amplio, bate los huevos con la leche.',
      'Añade una pizca de canela y extracto de vainilla (opcional).',
      'Sumerge cada rebanada de pan en la mezcla por ambos lados.',
      'Calienta una sartén antiadherente a fuego medio con un poco de aceite.',
      'Cocina cada rebanada por 2-3 minutos por lado hasta dorar.',
      'Sirve las tostadas apiladas.',
      'Decora con plátano en rodajas, fresas frescas y una cucharada de yogurt griego.',
      'Rocía con miel al gusto.',
    ],
    tags: ['gourmet', 'fin de semana', 'familiar', 'especial'],
    consejos: 'Usa pan del día anterior, absorbe mejor la mezcla. Para más proteína, agrega proteína en polvo a la mezcla de huevo.',
    variaciones: []
  },

  // ==================== NUEVAS RECETAS - ALMUERZOS ====================
  {
    id: 'alm_008',
    nombre: 'Poke Bowl Hawaiano',
    descripcion: 'Bowl fresco estilo hawaiano con atún marinado, arroz y vegetales crujientes',
    tipo: 'almuerzo',
    dificultad: 'intermedio',
    tiempoPreparacion: '30 minutos',
    ingredientes: [
      INGREDIENTES_DB['atún'],
      INGREDIENTES_DB['arroz'],
      INGREDIENTES_DB['aguacate'],
      INGREDIENTES_DB['pepino'],
      INGREDIENTES_DB['zanahoria'],
      INGREDIENTES_DB['edamame'],
      INGREDIENTES_DB['salsa soya'],
      INGREDIENTES_DB['jengibre'],
    ],
    pasos: [
      'Cocina el arroz según instrucciones y deja enfriar.',
      'Corta el atún en cubos de 1.5cm.',
      'Marina el atún con salsa de soya, jengibre rallado y un toque de aceite de sésamo por 15 minutos.',
      'Corta el pepino en medias lunas, la zanahoria en tiras finas.',
      'En un bowl, coloca el arroz como base.',
      'Organiza el atún, aguacate en láminas, pepino, zanahoria y edamame en secciones.',
      'Rocía con más salsa de soya o salsa de anguila.',
      'Espolvorea semillas de sésamo tostadas.',
    ],
    tags: ['hawaiano', 'fresco', 'omega-3', 'colorido', 'instagram-worthy'],
    consejos: 'Si prefieres, puedes sellar el atún en una sartén muy caliente por 30 segundos cada lado. El atún debe estar muy fresco.',
    variaciones: []
  },
  {
    id: 'alm_009',
    nombre: 'Curry de Garbanzos con Espinacas',
    descripcion: 'Curry vegano aromático con garbanzos, espinacas y leche de coco',
    tipo: 'almuerzo',
    dificultad: 'intermedio',
    tiempoPreparacion: '35 minutos',
    ingredientes: [
      INGREDIENTES_DB['garbanzos'],
      INGREDIENTES_DB['espinaca'],
      INGREDIENTES_DB['tomate'],
      INGREDIENTES_DB['cebolla'],
      INGREDIENTES_DB['ajo'],
      INGREDIENTES_DB['jengibre'],
      { nombre: 'leche de coco', cantidad: '200ml', calorias: 230, proteinas: 2, carbohidratos: 6, grasas: 24, fibra: 0, categoria: 'grasa' as const },
      INGREDIENTES_DB['arroz'],
    ],
    pasos: [
      'Cocina el arroz basmati según instrucciones.',
      'En una sartén grande, sofríe cebolla picada hasta que esté transparente.',
      'Añade ajo y jengibre rallado, cocina 1 minuto.',
      'Agrega curry en polvo, comino y cúrcuma, tuesta por 30 segundos.',
      'Incorpora los tomates cortados en cubos y cocina 5 minutos.',
      'Añade los garbanzos escurridos y mezcla.',
      'Vierte la leche de coco y deja cocinar a fuego lento 10 minutos.',
      'Agrega las espinacas frescas y cocina hasta que se marchiten.',
      'Sirve sobre el arroz, decora con cilantro fresco.',
    ],
    tags: ['vegano', 'indio', 'aromático', 'reconfortante', 'especiado'],
    consejos: 'Ajusta el nivel de especias a tu gusto. Puedes servir con naan o pan pita. El curry mejora al día siguiente.',
    variaciones: []
  },
  {
    id: 'alm_010',
    nombre: 'Wrap Mediterráneo de Falafel',
    descripcion: 'Wrap fresco con falafel casero, hummus y ensalada crujiente',
    tipo: 'almuerzo',
    dificultad: 'avanzado',
    tiempoPreparacion: '40 minutos',
    ingredientes: [
      INGREDIENTES_DB['garbanzos'],
      INGREDIENTES_DB['tortilla'],
      INGREDIENTES_DB['lechuga'],
      INGREDIENTES_DB['tomate'],
      INGREDIENTES_DB['pepino'],
      INGREDIENTES_DB['cebolla'],
      INGREDIENTES_DB['tahini'],
      INGREDIENTES_DB['limón'],
    ],
    pasos: [
      'Escurre los garbanzos y procesa en un procesador con ajo, cilantro, comino y harina.',
      'Forma bolitas de 3cm de diámetro con la mezcla.',
      'Fríe los falafel en aceite caliente o hornea a 200°C por 25 minutos.',
      'Prepara salsa tahini mezclando tahini con limón, ajo y agua.',
      'Calienta las tortillas.',
      'Unta cada tortilla con hummus.',
      'Coloca lechuga, tomate, pepino y cebolla.',
      'Añade 3-4 falafel por wrap.',
      'Rocía generosamente con salsa tahini.',
      'Enrolla firmemente y corta por la mitad.',
    ],
    tags: ['mediterráneo', 'vegano', 'proteico', 'aromático'],
    consejos: 'Los falafel se pueden preparar con anticipación y congelar. La mezcla debe estar húmeda pero no líquida.',
    variaciones: []
  },
  {
    id: 'alm_011',
    nombre: 'Stir-Fry de Pollo con Vegetales Asiáticos',
    descripcion: 'Salteado rápido estilo asiático con pollo tierno y vegetales crujientes',
    tipo: 'almuerzo',
    dificultad: 'fácil',
    tiempoPreparacion: '25 minutos',
    ingredientes: [
      INGREDIENTES_DB['pollo'],
      INGREDIENTES_DB['brócoli'],
      INGREDIENTES_DB['pimiento'],
      INGREDIENTES_DB['zanahoria'],
      INGREDIENTES_DB['cebolla'],
      INGREDIENTES_DB['ajo'],
      INGREDIENTES_DB['jengibre'],
      INGREDIENTES_DB['salsa soya'],
      INGREDIENTES_DB['arroz'],
    ],
    pasos: [
      'Cocina el arroz y manténlo caliente.',
      'Corta el pollo en tiras delgadas y sazona con sal.',
      'Corta todos los vegetales en trozos uniformes.',
      'En un wok o sartén grande muy caliente, saltea el pollo hasta dorar. Reserva.',
      'En el mismo wok, añade aceite y saltea ajo y jengibre rallado.',
      'Agrega los vegetales en orden de dureza: zanahoria, brócoli, pimiento.',
      'Regresa el pollo al wok.',
      'Añade salsa de soya, una pizca de miel y maicena disuelta para espesar.',
      'Saltea todo junto por 2 minutos más.',
      'Sirve inmediatamente sobre el arroz.',
    ],
    tags: ['asiático', 'rápido', 'colorido', 'balanceado'],
    consejos: 'El secreto del stir-fry es fuego alto y movimiento constante. Prepara todos los ingredientes antes de empezar a cocinar.',
    variaciones: []
  },
  {
    id: 'alm_012',
    nombre: 'Hamburguesa de Pavo con Batata Asada',
    descripcion: 'Hamburguesa jugosa de pavo con especias acompañada de papas de batata al horno',
    tipo: 'almuerzo',
    dificultad: 'intermedio',
    tiempoPreparacion: '40 minutos',
    ingredientes: [
      INGREDIENTES_DB['pavo'],
      INGREDIENTES_DB['batata'],
      INGREDIENTES_DB['pan integral'],
      INGREDIENTES_DB['lechuga'],
      INGREDIENTES_DB['tomate'],
      INGREDIENTES_DB['cebolla'],
      INGREDIENTES_DB['aguacate'],
    ],
    pasos: [
      'Precalienta el horno a 220°C.',
      'Corta la batata en gajos, rocía con aceite y especias, hornea 30 minutos.',
      'Mezcla la carne de pavo molida con ajo, cebolla picada, especias y forma hamburguesas.',
      'Cocina las hamburguesas en una sartén o parrilla, 5-6 minutos por lado.',
      'Tuesta ligeramente los panes.',
      'Monta la hamburguesa: pan, lechuga, hamburguesa, tomate, aguacate, cebolla.',
      'Sirve con las batatas asadas al lado.',
    ],
    tags: ['saludable', 'bajo en grasa', 'satisfactorio', 'americano'],
    consejos: 'No presiones las hamburguesas mientras cocinan o perderán jugosidad. Las batatas deben estar doradas y crujientes por fuera.',
    variaciones: []
  },

  // ==================== NUEVAS RECETAS - CENAS ====================
  {
    id: 'cen_008',
    nombre: 'Pechuga de Pollo Rellena con Espinacas y Queso',
    descripcion: 'Pechuga jugosa rellena de espinacas salteadas y queso derretido',
    tipo: 'cena',
    dificultad: 'avanzado',
    tiempoPreparacion: '45 minutos',
    ingredientes: [
      INGREDIENTES_DB['pollo'],
      INGREDIENTES_DB['espinaca'],
      INGREDIENTES_DB['queso'],
      INGREDIENTES_DB['ajo'],
      INGREDIENTES_DB['papa'],
      INGREDIENTES_DB['brócoli'],
      INGREDIENTES_DB['aceite de oliva'],
    ],
    pasos: [
      'Precalienta el horno a 190°C.',
      'Saltea las espinacas con ajo hasta que se marchiten, deja enfriar.',
      'Mezcla las espinacas con queso rallado.',
      'Abre un bolsillo en cada pechuga de pollo con un cuchillo afilado.',
      'Rellena cada pechuga con la mezcla de espinacas y queso.',
      'Sella con palillos de dientes.',
      'Sella el pollo en una sartén caliente por 2 minutos cada lado.',
      'Transfiere al horno por 20-25 minutos.',
      'Mientras tanto, hierve las papas y cocina el brócoli al vapor.',
      'Sirve el pollo rebanado con los acompañamientos.',
    ],
    tags: ['gourmet', 'impresionante', 'especial', 'alto en proteína'],
    consejos: 'Asegúrate de sellar bien el bolsillo para que el relleno no se salga. Deja reposar el pollo 5 minutos antes de rebanar.',
    variaciones: []
  },
  {
    id: 'cen_009',
    nombre: 'Bowl Asiático de Tofu Teriyaki',
    descripcion: 'Tofu crujiente glaseado con salsa teriyaki sobre arroz y vegetales',
    tipo: 'cena',
    dificultad: 'intermedio',
    tiempoPreparacion: '35 minutos',
    ingredientes: [
      INGREDIENTES_DB['tofu'],
      INGREDIENTES_DB['arroz'],
      INGREDIENTES_DB['brócoli'],
      INGREDIENTES_DB['zanahoria'],
      INGREDIENTES_DB['edamame'],
      INGREDIENTES_DB['salsa soya'],
      INGREDIENTES_DB['jengibre'],
      INGREDIENTES_DB['ajo'],
    ],
    pasos: [
      'Presiona el tofu entre papel absorbente para quitar exceso de agua, corta en cubos.',
      'Cocina el arroz según instrucciones.',
      'En un bowl, mezcla salsa de soya, miel, jengibre rallado y ajo para hacer teriyaki.',
      'En una sartén con aceite caliente, fríe los cubos de tofu hasta dorar en todos lados.',
      'Añade la salsa teriyaki y cocina hasta que espese y glasee el tofu.',
      'Cocina los vegetales al vapor o salteados.',
      'En un bowl, coloca arroz, vegetales y tofu glaseado.',
      'Decora con semillas de sésamo y cebollín.',
    ],
    tags: ['vegano', 'asiático', 'dulce y salado', 'crujiente'],
    consejos: 'Presionar bien el tofu es clave para que quede crujiente. Puedes marinar el tofu previamente para más sabor.',
    variaciones: []
  },
  {
    id: 'cen_010',
    nombre: 'Camarones al Ajillo con Pasta de Calabacín',
    descripcion: 'Camarones jugosos salteados en ajo con zoodles bajos en carbohidratos',
    tipo: 'cena',
    dificultad: 'fácil',
    tiempoPreparacion: '20 minutos',
    ingredientes: [
      INGREDIENTES_DB['camarones'],
      INGREDIENTES_DB['calabacín'],
      INGREDIENTES_DB['ajo'],
      INGREDIENTES_DB['tomate'],
      INGREDIENTES_DB['limón'],
      INGREDIENTES_DB['aceite de oliva'],
      INGREDIENTES_DB['perejil'],
    ],
    pasos: [
      'Espiralizael calabacín en forma de espagueti (zoodles). Si no tienes espiralizador, corta en tiras delgadas.',
      'Sazona los camarones con sal, pimienta y pizca de pimentón.',
      'En una sartén grande, calienta aceite de oliva y sofríe ajo picado hasta dorar.',
      'Añade los camarones y cocina 2 minutos por lado.',
      'Agrega tomate cherry en mitades y cocina 2 minutos más.',
      'Incorpora los zoodles y saltea solo 2 minutos (no deben quedar aguados).',
      'Exprime limón fresco sobre todo.',
      'Decora con perejil picado.',
    ],
    tags: ['bajo en carbohidratos', 'keto-friendly', 'rápido', 'ligero'],
    consejos: 'No sobre cocines los zoodles o soltarán agua. Los camarones están listos cuando están rosados y opacos.',
    variaciones: []
  },
  {
    id: 'cen_011',
    nombre: 'Sopa Minestrone Italiana',
    descripcion: 'Sopa italiana reconfortante cargada de vegetales y frijoles',
    tipo: 'cena',
    dificultad: 'fácil',
    tiempoPreparacion: '40 minutos',
    ingredientes: [
      INGREDIENTES_DB['frijoles'],
      INGREDIENTES_DB['pasta'],
      INGREDIENTES_DB['tomate'],
      INGREDIENTES_DB['zanahoria'],
      INGREDIENTES_DB['cebolla'],
      INGREDIENTES_DB['calabacín'],
      INGREDIENTES_DB['espinaca'],
      INGREDIENTES_DB['ajo'],
    ],
    pasos: [
      'En una olla grande, sofríe cebolla picada y ajo hasta que estén fragantes.',
      'Añade zanahoria y calabacín en cubos, cocina 5 minutos.',
      'Incorpora tomates picados (o triturados) y cocina 3 minutos.',
      'Agrega 1.5 litros de caldo de vegetales.',
      'Añade frijoles escurridos, pasta pequeña y hierbas italianas.',
      'Cocina a fuego medio 15-20 minutos hasta que la pasta esté al dente.',
      'Añade las espinacas al final y cocina hasta que se marchiten.',
      'Ajusta sal y pimienta, sirve con parmesano rallado.',
    ],
    tags: ['italiano', 'reconfortante', 'lleno de fibra', 'vegetariano'],
    consejos: 'Esta sopa mejora con el tiempo, es perfecta para preparar en grandes cantidades. Congela porciones para comidas rápidas.',
    variaciones: []
  },
  {
    id: 'cen_012',
    nombre: 'Tacos de Coliflor Rostizada',
    descripcion: 'Tacos veganos con coliflor especiada y rostizada, súper crujiente',
    tipo: 'cena',
    dificultad: 'fácil',
    tiempoPreparacion: '35 minutos',
    ingredientes: [
      { nombre: 'coliflor', cantidad: '1 cabeza', calorias: 100, proteinas: 8, carbohidratos: 20, grasas: 1, fibra: 10, categoria: 'vegetal' as const, alternativas: ['brócoli'] },
      INGREDIENTES_DB['tortilla'],
      INGREDIENTES_DB['col'],
      INGREDIENTES_DB['aguacate'],
      INGREDIENTES_DB['limón'],
      INGREDIENTES_DB['cilantro'],
      INGREDIENTES_DB['yogurt'],
    ],
    pasos: [
      'Precalienta el horno a 220°C.',
      'Corta la coliflor en floretes pequeños.',
      'Mezcla con aceite de oliva, pimentón, comino, ajo en polvo, sal y pimienta.',
      'Extiende en una bandeja y hornea 25-30 minutos hasta dorar y estar crujiente.',
      'Mientras tanto, prepara ensalada de col con limón.',
      'Prepara crema de cilantro mezclando yogurt, cilantro, limón y sal en licuadora.',
      'Calienta las tortillas.',
      'Arma los tacos: tortilla, coliflor rostizada, ensalada de col, aguacate, crema de cilantro.',
    ],
    tags: ['vegano', 'mexicano', 'crujiente', 'bajo en calorías'],
    consejos: 'La coliflor debe estar muy bien especiada y bien rostizada para máximo sabor. No la amontes en la bandeja o se cocinará al vapor.',
    variaciones: []
  },

  // ==================== NUEVAS RECETAS - SNACKS ====================
  {
    id: 'snk_003',
    nombre: 'Edamame Rostizado con Sal Marina',
    descripcion: 'Snack proteico crujiente estilo japonés con edamame tostado',
    tipo: 'snack',
    dificultad: 'fácil',
    tiempoPreparacion: '15 minutos',
    ingredientes: [
      INGREDIENTES_DB['edamame'],
      INGREDIENTES_DB['aceite de oliva'],
      { nombre: 'sal marina', cantidad: 'al gusto', calorias: 0, proteinas: 0, carbohidratos: 0, grasas: 0, fibra: 0, categoria: 'condimento' as const },
    ],
    pasos: [
      'Precalienta el horno a 200°C.',
      'Escurre bien el edamame cocido y sécalo con papel.',
      'Mezcla con aceite de oliva y sal marina gruesa.',
      'Extiende en una bandeja en una sola capa.',
      'Hornea por 12-15 minutos, agitando la bandeja a mitad de cocción.',
      'Deben quedar crujientes y ligeramente dorados.',
      'Deja enfriar 5 minutos antes de comer (se ponen más crujientes).',
    ],
    tags: ['alto en proteína', 'japonés', 'crujiente', 'saludable'],
    consejos: 'Asegúrate de secar bien el edamame antes de hornear. Puedes agregar especias como ajo en polvo o chile en polvo.',
    variaciones: []
  },
  {
    id: 'snk_004',
    nombre: 'Hummus Casero con Vegetales Crujientes',
    descripcion: 'Hummus cremoso casero servido con bastones de vegetales frescos',
    tipo: 'snack',
    dificultad: 'fácil',
    tiempoPreparacion: '15 minutos',
    ingredientes: [
      INGREDIENTES_DB['garbanzos'],
      INGREDIENTES_DB['tahini'],
      INGREDIENTES_DB['limón'],
      INGREDIENTES_DB['ajo'],
      INGREDIENTES_DB['zanahoria'],
      INGREDIENTES_DB['pepino'],
      INGREDIENTES_DB['pimiento'],
    ],
    pasos: [
      'En una licuadora o procesador, coloca garbanzos escurridos, tahini, jugo de limón, ajo.',
      'Procesa hasta obtener una textura suave, añade agua fría poco a poco hasta consistencia cremosa.',
      'Ajusta sal y comino al gusto.',
      'Corta zanahorias, pepino y pimiento en bastones.',
      'Sirve el hummus en un bowl con un chorrito de aceite de oliva y pimentón.',
      'Acompaña con los vegetales alrededor.',
    ],
    tags: ['mediterráneo', 'vegano', 'proteico', 'refrescante'],
    consejos: 'El hummus mejora en sabor después de algunas horas en el refrigerador. Se conserva bien por 5 días.',
    variaciones: []
  },
  {
    id: 'snk_005',
    nombre: 'Manzana con Mantequilla de Almendra y Granola',
    descripcion: 'Snack dulce y crujiente con rodajas de manzana, mantequilla de almendra y granola',
    tipo: 'snack',
    dificultad: 'fácil',
    tiempoPreparacion: '5 minutos',
    ingredientes: [
      INGREDIENTES_DB['manzana'],
      INGREDIENTES_DB['almendras'],
      INGREDIENTES_DB['granola'],
      INGREDIENTES_DB['miel'],
    ],
    pasos: [
      'Lava y corta la manzana en rodajas gruesas, retira el centro.',
      'Unta cada rodaja generosamente con mantequilla de almendra.',
      'Espolvorea granola encima.',
      'Rocía con un hilo de miel.',
      'Opcionalmente, añade chips de chocolate oscuro o canela.',
    ],
    tags: ['dulce', 'crujiente', 'energético', 'para niños'],
    consejos: 'Perfecto snack pre-entrenamiento. Puedes preparar las rodajas con anticipación y guardar en el refrigerador.',
    variaciones: []
  },
  {
    id: 'snk_006',
    nombre: 'Rollitos de Pavo con Queso y Vegetales',
    descripcion: 'Snack proteico bajo en carbohidratos con rebanadas de pavo enrolladas',
    tipo: 'snack',
    dificultad: 'fácil',
    tiempoPreparacion: '10 minutos',
    ingredientes: [
      INGREDIENTES_DB['pavo'],
      INGREDIENTES_DB['queso'],
      INGREDIENTES_DB['lechuga'],
      INGREDIENTES_DB['tomate'],
      INGREDIENTES_DB['aguacate'],
    ],
    pasos: [
      'Extiende rebanadas de pechuga de pavo sobre una tabla.',
      'Coloca una hoja de lechuga sobre cada rebanada.',
      'Añade una tira de queso, tomate picado y aguacate en láminas.',
      'Enrolla firmemente desde un extremo.',
      'Asegura con un palillo si es necesario.',
      'Sirve inmediatamente o guarda en el refrigerador.',
    ],
    tags: ['keto-friendly', 'proteico', 'bajo en carbohidratos', 'portátil'],
    consejos: 'Perfecto para llevar al trabajo o la escuela. Puedes variar los vegetales según tu preferencia.',
    variaciones: []
  },
  {
    id: 'snk_007',
    nombre: 'Energy Balls de Dátil y Nueces',
    descripcion: 'Bolitas energéticas naturalmente endulzadas con dátiles y frutos secos',
    tipo: 'snack',
    dificultad: 'fácil',
    tiempoPreparacion: '15 minutos',
    ingredientes: [
      { nombre: 'dátiles', cantidad: '150g', calorias: 415, proteinas: 3, carbohidratos: 110, grasas: 0, fibra: 12, categoria: 'carbohidrato' as const },
      INGREDIENTES_DB['nueces'],
      INGREDIENTES_DB['almendras'],
      INGREDIENTES_DB['avena'],
      INGREDIENTES_DB['coco'],
    ],
    pasos: [
      'Remoja los dátiles en agua caliente por 10 minutos, escurre.',
      'En un procesador de alimentos, mezcla dátiles, nueces, almendras y avena.',
      'Procesa hasta obtener una pasta pegajosa que se mantiene unida.',
      'Con las manos húmedas, forma bolitas del tamaño de una nuez.',
      'Rueda las bolitas en coco rallado para cubrir.',
      'Refrigera en un contenedor hermético por mínimo 30 minutos.',
      'Se conservan hasta 2 semanas refrigeradas.',
    ],
    tags: ['energético', 'sin hornear', 'endulzado naturalmente', 'portátil'],
    consejos: 'Perfectas para llevar en excursiones o como snack pre-entrenamiento. Puedes agregar cacao en polvo para versión chocolate.',
    variaciones: []
  },

  // ==================== MÁS DESAYUNOS ====================
  {
    id: 'des_009',
    nombre: 'Shakshuka Mediterránea',
    descripcion: 'Huevos pochados en salsa de tomate especiada, platillo típico del medio oriente',
    tipo: 'desayuno',
    dificultad: 'intermedio',
    tiempoPreparacion: '30 minutos',
    ingredientes: [
      INGREDIENTES_DB['huevos'],
      INGREDIENTES_DB['tomate'],
      INGREDIENTES_DB['pimiento'],
      INGREDIENTES_DB['cebolla'],
      INGREDIENTES_DB['ajo'],
      INGREDIENTES_DB['pan integral'],
      INGREDIENTES_DB['cilantro'],
    ],
    pasos: [
      'En una sartén grande, sofríe cebolla y pimiento picados hasta suavizar.',
      'Añade ajo picado, comino, pimentón y una pizca de chile en polvo.',
      'Incorpora tomates triturados o frescos picados, cocina 10 minutos.',
      'Crea pequeños huecos en la salsa con una cuchara.',
      'Rompe un huevo en cada hueco.',
      'Tapa la sartén y cocina 7-10 minutos hasta que las claras estén cocidas pero las yemas líquidas.',
      'Decora con cilantro fresco y queso feta desmoronado (opcional).',
      'Sirve directamente de la sartén con pan integral para mojar.',
    ],
    tags: ['mediterráneo', 'compartir', 'especiado', 'fin de semana'],
    consejos: 'Asegúrate de que la salsa esté bien sazonada antes de añadir los huevos. Perfecto para servir directamente en la sartén.',
    variaciones: []
  },
  {
    id: 'des_010',
    nombre: 'Wrap de Huevo y Aguacate con Espinacas',
    descripcion: 'Wrap de desayuno portable con huevo revuelto, aguacate cremoso y espinacas frescas',
    tipo: 'desayuno',
    dificultad: 'fácil',
    tiempoPreparacion: '15 minutos',
    ingredientes: [
      INGREDIENTES_DB['tortilla'],
      INGREDIENTES_DB['huevos'],
      INGREDIENTES_DB['aguacate'],
      INGREDIENTES_DB['espinaca'],
      INGREDIENTES_DB['tomate'],
      INGREDIENTES_DB['queso'],
    ],
    pasos: [
      'Bate los huevos y cocínalos revueltos hasta que estén cremosos.',
      'Calienta la tortilla en el comal.',
      'Extiende aguacate machacado sobre la tortilla.',
      'Coloca un puñado de espinacas frescas.',
      'Añade los huevos revueltos.',
      'Agrega tomate picado y queso rallado.',
      'Enrolla la tortilla firmemente.',
      'Opcional: dora el wrap en la sartén para que quede crujiente.',
    ],
    tags: ['portátil', 'rápido', 'proteico', 'para llevar'],
    consejos: 'Puedes envolver en papel aluminio y guardar en el refrigerador. Perfecto para desayunos de camino al trabajo.',
    variaciones: []
  },

  // ==================== MÁS ALMUERZOS ====================
  {
    id: 'alm_013',
    nombre: 'Ensalada Caprese con Pollo',
    descripcion: 'Ensalada italiana fresca con mozzarella, tomate, albahaca y pollo a la parrilla',
    tipo: 'almuerzo',
    dificultad: 'fácil',
    tiempoPreparacion: '20 minutos',
    ingredientes: [
      INGREDIENTES_DB['pollo'],
      INGREDIENTES_DB['tomate'],
      { nombre: 'mozzarella fresca', cantidad: '125g', calorias: 280, proteinas: 19, carbohidratos: 3, grasas: 22, fibra: 0, categoria: 'lacteo' as const },
      INGREDIENTES_DB['lechuga'],
      INGREDIENTES_DB['aceite de oliva'],
      { nombre: 'albahaca fresca', cantidad: 'al gusto', calorias: 5, proteinas: 0, carbohidratos: 1, grasas: 0, fibra: 0, categoria: 'condimento' as const },
    ],
    pasos: [
      'Cocina el pollo a la parrilla sazonado con sal, pimienta y hierbas italianas.',
      'Corta tomates y mozzarella en rodajas del mismo grosor.',
      'En un plato, intercala rodajas de tomate y mozzarella.',
      'Inserta hojas de albahaca fresca entre las rodajas.',
      'Coloca el pollo rebanado alrededor o encima.',
      'Rocía generosamente con aceite de oliva extra virgen.',
      'Añade un toque de vinagre balsámico.',
      'Sazona con sal de mar y pimienta negra recién molida.',
    ],
    tags: ['italiano', 'fresco', 'gourmet', 'ligero'],
    consejos: 'Usa tomates e ingredientes de la mejor calidad ya que el plato es simple. La mozzarella fresca hace toda la diferencia.',
    variaciones: []
  },
  {
    id: 'alm_014',
    nombre: 'Bowl de Buddha Completo',
    descripcion: 'Bowl nutritivo y balanceado con quinoa, vegetales asados, proteína y salsa tahini',
    tipo: 'almuerzo',
    dificultad: 'intermedio',
    tiempoPreparacion: '40 minutos',
    ingredientes: [
      INGREDIENTES_DB['quinoa'],
      INGREDIENTES_DB['garbanzos'],
      INGREDIENTES_DB['batata'],
      INGREDIENTES_DB['brócoli'],
      INGREDIENTES_DB['kale'],
      INGREDIENTES_DB['aguacate'],
      INGREDIENTES_DB['tahini'],
      INGREDIENTES_DB['limón'],
    ],
    pasos: [
      'Precalienta el horno a 200°C.',
      'Cocina la quinoa según instrucciones.',
      'Corta batata en cubos y brócoli en floretes, rocía con aceite y especias.',
      'Escurre los garbanzos, seca bien y mezcla con especias.',
      'Hornea vegetales y garbanzos por 25-30 minutos hasta dorar.',
      'Masajea el kale con limón y un poco de aceite para suavizar.',
      'Prepara aderezo mezclando tahini, limón, ajo y agua.',
      'En un bowl, coloca quinoa, vegetales asados, garbanzos crujientes, kale y aguacate.',
      'Rocía generosamente con aderezo de tahini.',
    ],
    tags: ['vegano', 'nutritivo', 'balanceado', 'completo', 'meal prep'],
    consejos: 'Este bowl contiene todos los nutrientes necesarios. Perfecto para preparar varios a la vez y llevar durante la semana.',
    variaciones: []
  },

  // ==================== MÁS CENAS ====================
  {
    id: 'cen_013',
    nombre: 'Filete de Pescado con Salsa de Mango',
    descripcion: 'Pescado al horno con salsa tropical fresca de mango y cilantro',
    tipo: 'cena',
    dificultad: 'intermedio',
    tiempoPreparacion: '30 minutos',
    ingredientes: [
      INGREDIENTES_DB['pescado'],
      INGREDIENTES_DB['mango'],
      INGREDIENTES_DB['cebolla'],
      INGREDIENTES_DB['cilantro'],
      INGREDIENTES_DB['limón'],
      INGREDIENTES_DB['arroz'],
      INGREDIENTES_DB['espárragos'],
    ],
    pasos: [
      'Precalienta el horno a 190°C.',
      'Cocina el arroz blanco.',
      'Sazona el pescado con sal, pimienta y limón.',
      'Hornea el pescado por 15-18 minutos.',
      'Mientras tanto, pica el mango en cubitos pequeños.',
      'Mezcla mango con cebolla morada picada, cilantro, limón y un toque de jalapeño.',
      'Cocina los espárragos al vapor o asados.',
      'Sirve el pescado sobre el arroz, corona con salsa de mango.',
      'Acompaña con espárragos al lado.',
    ],
    tags: ['tropical', 'ligero', 'omega-3', 'gourmet'],
    consejos: 'La salsa de mango debe tener balance entre dulce, ácido y picante. Prepárala con anticipación para que los sabores se integren.',
    variaciones: []
  },
  {
    id: 'cen_014',
    nombre: 'Berenjena Parmesana Saludable',
    descripcion: 'Versión ligera del clásico italiano con berenjenas asadas y queso gratinado',
    tipo: 'cena',
    dificultad: 'intermedio',
    tiempoPreparacion: '50 minutos',
    ingredientes: [
      INGREDIENTES_DB['berenjena'],
      INGREDIENTES_DB['tomate'],
      { nombre: 'queso parmesano', cantidad: '50g', calorias: 200, proteinas: 18, carbohidratos: 2, grasas: 14, fibra: 0, categoria: 'lacteo' as const },
      { nombre: 'mozzarella', cantidad: '100g', calorias: 280, proteinas: 22, carbohidratos: 2, grasas: 20, fibra: 0, categoria: 'lacteo' as const },
      INGREDIENTES_DB['ajo'],
      { nombre: 'albahaca', cantidad: 'al gusto', calorias: 5, proteinas: 0, carbohidratos: 1, grasas: 0, fibra: 0, categoria: 'condimento' as const },
      INGREDIENTES_DB['pan integral'],
    ],
    pasos: [
      'Corta la berenjena en rodajas de 1cm.',
      'Coloca en una bandeja, sazona con sal y deja reposar 10 minutos para que suelte líquido.',
      'Seca las berenjenas y hornea a 200°C por 15 minutos.',
      'Prepara salsa de tomate rápida sofriendo ajo, añadiendo tomate triturado y albahaca.',
      'En un refractario, coloca una capa de salsa, luego berenjenas, más salsa, quesos.',
      'Repite capas.',
      'Hornea a 180°C por 25-30 minutos hasta que el queso esté dorado.',
      'Deja reposar 5 minutos antes de servir.',
      'Acompaña con ensalada verde y pan integral.',
    ],
    tags: ['vegetariano', 'italiano', 'reconfortante', 'para compartir'],
    consejos: 'Asar las berenjenas en vez de freírlas reduce significativamente las calorías. El reposo después de hornear ayuda a que las capas se asienten.',
    variaciones: []
  },
];

// ============================================================================
// MOTOR DE GENERACIÓN DE RECETAS
// ============================================================================

/**
 * Verifica si un ingrediente está en la lista de restricciones del usuario
 */
function tieneRestriccion(ingrediente: Ingredient, restricciones: string[]): boolean {
  for (const restriccion of restricciones) {
    const restriccionLower = restriccion.toLowerCase().trim();
    const nombreLower = ingrediente.nombre.toLowerCase();
    const categoriaLower = ingrediente.categoria.toLowerCase();
    
    // Verificar coincidencias directas o parciales
    if (nombreLower.includes(restriccionLower) || 
        restriccionLower.includes(nombreLower) ||
        categoriaLower === restriccionLower) {
      return true;
    }
  }
  return false;
}

/**
 * Busca un ingrediente alternativo que no tenga restricciones
 */
function buscarAlternativa(ingrediente: Ingredient, restricciones: { alergias: string[], noDeseados: string[] }): Ingredient | null {
  const todasRestricciones = [...restricciones.alergias, ...restricciones.noDeseados];
  
  // Si el ingrediente tiene alternativas definidas
  if (ingrediente.alternativas) {
    for (const altNombre of ingrediente.alternativas) {
      const alt = INGREDIENTES_DB[altNombre];
      if (alt && !tieneRestriccion(alt, todasRestricciones)) {
        return alt;
      }
    }
  }
  
  // Buscar alternativas por categoría
  for (const [key, ing] of Object.entries(INGREDIENTES_DB)) {
    if (ing.categoria === ingrediente.categoria && 
        ing.nombre !== ingrediente.nombre &&
        !tieneRestriccion(ing, todasRestricciones)) {
      return ing;
    }
  }
  
  return null;
}

/**
 * Adapta una receta según las restricciones del usuario
 */
function adaptarReceta(receta: RecipeTemplate, restricciones: { alergias: string[], noDeseados: string[] }): RecipeTemplate | null {
  const todasRestricciones = [...restricciones.alergias, ...restricciones.noDeseados];
  const nuevosIngredientes: Ingredient[] = [];
  const sustituciones: { original: string, nuevo: string }[] = [];
  
  console.log(`[RECIPE ENGINE] Adaptando receta: ${receta.nombre}`);
  console.log(`[RECIPE ENGINE] Restricciones:`, todasRestricciones);
  
  for (const ingrediente of receta.ingredientes) {
    if (tieneRestriccion(ingrediente, todasRestricciones)) {
      console.log(`[RECIPE ENGINE] ✗ Ingrediente restringido: ${ingrediente.nombre}`);
      const alternativa = buscarAlternativa(ingrediente, restricciones);
      
      if (alternativa) {
        console.log(`[RECIPE ENGINE] ✓ Alternativa encontrada: ${alternativa.nombre}`);
        nuevosIngredientes.push(alternativa);
        sustituciones.push({ original: ingrediente.nombre, nuevo: alternativa.nombre });
      } else {
        console.log(`[RECIPE ENGINE] ✗ No se encontró alternativa para: ${ingrediente.nombre}`);
        return null; // No se puede adaptar esta receta
      }
    } else {
      nuevosIngredientes.push(ingrediente);
    }
  }
  
  // Adaptar los pasos si hay sustituciones
  let nuevosPasos = [...receta.pasos];
  for (const sustitucion of sustituciones) {
    nuevosPasos = nuevosPasos.map(paso => 
      paso.replace(new RegExp(sustitucion.original, 'gi'), sustitucion.nuevo)
    );
  }
  
  return {
    ...receta,
    ingredientes: nuevosIngredientes,
    pasos: nuevosPasos
  };
}

/**
 * Ajusta las cantidades de ingredientes según las porciones deseadas
 */
function ajustarPorciones(receta: RecipeTemplate, porcionesDeseadas: number): RecipeTemplate {
  const factor = porcionesDeseadas / receta.ingredientes[0].calorias; // Aproximación simplificada
  
  // En una implementación real, ajustaríamos cada cantidad proporcionalmente
  // Por ahora, mantenemos las cantidades y solo mencionamos las porciones
  
  return receta;
}

/**
 * Calcula la información nutricional total de la receta
 */
function calcularNutricion(ingredientes: Ingredient[], porciones: number) {
  let totalCalorias = 0;
  let totalProteinas = 0;
  let totalCarbohidratos = 0;
  let totalGrasas = 0;
  let totalFibra = 0;
  
  for (const ing of ingredientes) {
    totalCalorias += ing.calorias;
    totalProteinas += ing.proteinas;
    totalCarbohidratos += ing.carbohidratos;
    totalGrasas += ing.grasas;
    totalFibra += ing.fibra;
  }
  
  return {
    calorias: Math.round(totalCalorias / porciones),
    proteinas: `${Math.round(totalProteinas / porciones)}g`,
    carbohidratos: `${Math.round(totalCarbohidratos / porciones)}g`,
    grasas: `${Math.round(totalGrasas / porciones)}g`,
    fibra: `${Math.round(totalFibra / porciones)}g`,
  };
}

/**
 * Selecciona las mejores recetas candidatas según los parámetros
 */
function seleccionarCandidatos(
  tipo: string,
  dificultad: string,
  tiempoCoccion: string,
  ingredientesDisponibles: string[],
  restricciones: { alergias: string[], noDeseados: string[] }
): RecipeTemplate[] {
  
  const candidatos: RecipeTemplate[] = [];
  
  console.log(`[RECIPE ENGINE] Buscando candidatos para tipo: ${tipo}, dificultad: ${dificultad}`);
  
  for (const receta of RECETAS_DB) {
    // Filtro 1: Tipo de comida
    if (receta.tipo !== tipo) continue;
    
    // Filtro 2: Dificultad
    if (receta.dificultad !== dificultad) continue;
    
    // Filtro 3: Intentar adaptar según restricciones
    const recetaAdaptada = adaptarReceta(receta, restricciones);
    if (recetaAdaptada) {
      candidatos.push(recetaAdaptada);
      console.log(`[RECIPE ENGINE] ✓ Candidato: ${recetaAdaptada.nombre}`);
    } else {
      console.log(`[RECIPE ENGINE] ✗ Descartado: ${receta.nombre} (no se puede adaptar)`);
    }
  }
  
  // Si no hay candidatos con la dificultad exacta, relajar restricción
  if (candidatos.length === 0) {
    console.log(`[RECIPE ENGINE] Relajando restricción de dificultad...`);
    for (const receta of RECETAS_DB) {
      if (receta.tipo !== tipo) continue;
      const recetaAdaptada = adaptarReceta(receta, restricciones);
      if (recetaAdaptada) {
        candidatos.push(recetaAdaptada);
      }
    }
  }
  
  return candidatos;
}

/**
 * FUNCIÓN PRINCIPAL: Genera una receta completa
 */
export function generarReceta(parametros: {
  tipo: string;
  dificultad: string;
  tiempoCoccion: string;
  porciones: number;
  ingredientesDisponibles: string[];
  restricciones: { alergias: string[], noDeseados: string[], preferencias: string[] };
  perfil?: any;
}) {
  console.log('[RECIPE ENGINE] Iniciando generación de receta con parámetros:', parametros);
  
  const { tipo, dificultad, porciones, ingredientesDisponibles, restricciones } = parametros;
  
  // Seleccionar candidatos
  const candidatos = seleccionarCandidatos(
    tipo,
    dificultad,
    parametros.tiempoCoccion,
    ingredientesDisponibles,
    { alergias: restricciones.alergias, noDeseados: restricciones.noDeseados }
  );
  
  if (candidatos.length === 0) {
    console.log('[RECIPE ENGINE] ERROR: No se encontraron recetas compatibles');
    throw new Error('No se encontraron recetas compatibles con tus restricciones. Intenta con opciones más flexibles.');
  }
  
  // Seleccionar una receta aleatoria de los candidatos
  const recetaSeleccionada = candidatos[Math.floor(Math.random() * candidatos.length)];
  console.log(`[RECIPE ENGINE] Receta seleccionada: ${recetaSeleccionada.nombre}`);
  
  // Ajustar porciones
  const recetaAjustada = ajustarPorciones(recetaSeleccionada, porciones);
  
  // Calcular información nutricional
  const nutricion = calcularNutricion(recetaAjustada.ingredientes, porciones);
  
  // Formatear ingredientes para el frontend
  const ingredientesFormateados = recetaAjustada.ingredientes.map(ing => ({
    nombre: ing.nombre,
    cantidad: ing.cantidad
  }));
  
  // Construir receta final
  const recetaFinal = {
    nombre: recetaAjustada.nombre,
    descripcion: recetaAjustada.descripcion,
    tiempoPreparacion: recetaAjustada.tiempoPreparacion,
    dificultad: recetaAjustada.dificultad,
    porciones: porciones,
    ingredientes: ingredientesFormateados,
    pasos: recetaAjustada.pasos,
    informacionNutricional: nutricion,
    tags: recetaAjustada.tags,
    consejos: recetaAjustada.consejos
  };
  
  console.log('[RECIPE ENGINE] Receta generada exitosamente');
  console.log('[RECIPE ENGINE] Información nutricional:', nutricion);
  
  return recetaFinal;
}

/**
 * Obtiene estadísticas del motor de recetas
 */
export function obtenerEstadisticas() {
  const stats = {
    totalRecetas: RECETAS_DB.length,
    recetasPorTipo: {
      desayuno: RECETAS_DB.filter(r => r.tipo === 'desayuno').length,
      almuerzo: RECETAS_DB.filter(r => r.tipo === 'almuerzo').length,
      cena: RECETAS_DB.filter(r => r.tipo === 'cena').length,
      snack: RECETAS_DB.filter(r => r.tipo === 'snack').length,
    },
    recetasPorDificultad: {
      fácil: RECETAS_DB.filter(r => r.dificultad === 'fácil').length,
      intermedio: RECETAS_DB.filter(r => r.dificultad === 'intermedio').length,
      avanzado: RECETAS_DB.filter(r => r.dificultad === 'avanzado').length,
    },
    totalIngredientes: Object.keys(INGREDIENTES_DB).length
  };
  
  return stats;
}
