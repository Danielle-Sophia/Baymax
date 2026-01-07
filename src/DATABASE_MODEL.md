# 🗄️ Modelo Entidad-Relación - Dr. Baymax

## 📊 Diagrama Conceptual

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                         SISTEMA DR. BAYMAX                                   │
│                    Gestión Nutricional Integral                              │
└─────────────────────────────────────────────────────────────────────────────┘

┌──────────────────┐         1:1         ┌──────────────────┐
│      USER        │─────────────────────│     PROFILE      │
│  (Supabase Auth) │                     │                  │
├──────────────────┤                     ├──────────────────┤
│ • id (PK)        │                     │ • userId (FK)    │
│ • email (unique) │                     │ • weight         │
│ • password_hash  │                     │ • height         │
│ • created_at     │                     │ • age            │
│ • email_confirm  │                     │ • sex            │
│ • user_metadata  │                     │ • activityLevel  │
│   - name         │                     │ • goal           │
└──────────────────┘                     │ • allergies[]    │
                                         │ • preferences[]  │
                                         │ • tmb (calc)     │
                                         │ • dailyCalories  │
                                         │ • createdAt      │
                                         │ • updatedAt      │
                                         └──────────────────┘
         │                                       │
         │                                       │
         │ 1:N                                   │
         │                                       │
         ▼                                       ▼
┌──────────────────┐                    ┌──────────────────┐
│  MEAL_PLAN       │                    │ NUTRITION_GOAL   │
│                  │                    │  (embedded)      │
├──────────────────┤                    ├──────────────────┤
│ • planId (PK)    │                    │ • goalType       │
│ • userId (FK)    │                    │ • targetWeight   │
│ • profileData    │                    │ • targetDate     │
│ • menuSemanal[]  │                    │ • weeklyChange   │
│   - dia          │                    │ • isRealistic    │
│   - desayuno     │                    │ • warnings[]     │
│   - almuerzo     │                    └──────────────────┘
│   - cena         │
│   - snacks[]     │
│ • macronutrients │
│ • totalCalories  │
│ • createdAt      │
│ • expiresAt      │
└──────────────────┘
         │
         │ 1:N
         │
         ▼
┌──────────────────┐
│   MEAL_ITEM      │
│  (embedded)      │
├──────────────────┤
│ • mealId         │
│ • nombre         │
│ • ingredientes[] │
│ • preparacion    │
│ • calorias       │
│ • proteinas      │
│ • carbohidratos  │
│ • grasas         │
│ • razonamiento   │
│ • alternativas[] │
└──────────────────┘


┌──────────────────┐         1:N         ┌──────────────────┐
│      USER        │─────────────────────│     RECIPE       │
│  (Supabase Auth) │                     │    (Generated)   │
└──────────────────┘                     ├──────────────────┤
                                         │ • id (PK)        │
                                         │ • userId (FK)    │
                                         │ • nombre         │
                                         │ • descripcion    │
                                         │ • ingredientes[] │
                                         │ • pasos[]        │
                                         │ • tiempoPrep     │
                                         │ • dificultad     │
                                         │ • porciones      │
                                         │ • nutricion      │
                                         │   - calorias     │
                                         │   - proteinas    │
                                         │   - carbs        │
                                         │   - grasas       │
                                         │   - fibra        │
                                         │ • consejos       │
                                         │ • categorias[]   │
                                         │ • mealType       │
                                         │ • generatedAt    │
                                         │ • parameters     │
                                         └──────────────────┘
         │                                       │
         │                                       │
         │ M:N                                   │
         │                                       │
         ▼                                       │
┌──────────────────┐                            │
│ RECIPE_FAVORITE  │────────────────────────────┘
│  (junction)      │         N:1
├──────────────────┤
│ • userId (FK)    │
│ • recipeId (FK)  │
│ • savedAt        │
└──────────────────┘


┌──────────────────┐                     ┌──────────────────┐
│   SPECIALIST     │         1:N         │SPECIALIST_REQUEST│
│  (Supabase Auth) │─────────────────────│                  │
├──────────────────┤                     ├──────────────────┤
│ • id (PK)        │                     │ • requestId (PK) │
│ • email (unique) │                     │ • userId (FK)    │
│ • password_hash  │                     │ • specialistId   │
│ • user_metadata  │                     │ • requestType    │
│   - role:spec    │                     │ • description    │
└──────────────────┘                     │ • status         │
         │                               │ • priority       │
         │ 1:1                           │ • userProfile    │
         │                               │ • createdAt      │
         ▼                               │ • assignedAt     │
┌──────────────────┐                     │ • completedAt    │
│SPECIALIST_PROFILE│                     │ • metadata       │
├──────────────────┤                     └──────────────────┘
│ • userId (FK)    │                              │
│ • name           │                              │
│ • specialty      │                              │ 1:N
│ • profLicense    │                              │
│ • bio            │                              ▼
│ • certifications │                     ┌──────────────────┐
│ • experience     │                     │     MESSAGE      │
│ • availability   │                     │                  │
│ • rating         │                     ├──────────────────┤
│ • requestCount   │                     │ • messageId (PK) │
│ • createdAt      │                     │ • requestId (FK) │
│ • updatedAt      │                     │ • senderId (FK)  │
│ • isActive       │                     │ • senderType     │
└──────────────────┘                     │ • content        │
                                         │ • timestamp      │
                                         │ • isFiltered     │
                                         │ • attachments[]  │
                                         └──────────────────┘


┌──────────────────────────────────────────────────────────────┐
│                      SISTEMA DE VALIDACIÓN                   │
└──────────────────────────────────────────────────────────────┘

┌──────────────────┐         used by      ┌──────────────────┐
│  FOOD_DATABASE   │─────────────────────│  PROLOG_ENGINE   │
│  (embedded)      │                     │                  │
├──────────────────┤                     ├──────────────────┤
│ • alimentoId     │                     │ • predicados     │
│ • nombre         │                     │ • reglas         │
│ • categoria      │                     │ • inferencia     │
│ • macronutrientes│                     │ • backtracking   │
│ • calorias       │                     └──────────────────┘
│ • restricciones  │
│ • temporada      │
│ • disponibilidad │
└──────────────────┘
```

---

## 📋 Entidades Detalladas

### 1. **USER** (Supabase Auth)
**Descripción**: Usuario del sistema (paciente)  
**Tabla**: `auth.users` (manejada por Supabase)  
**Storage**: Supabase Auth

| Campo | Tipo | Restricciones | Descripción |
|-------|------|---------------|-------------|
| `id` | UUID | PK, Auto | ID único del usuario |
| `email` | VARCHAR | UNIQUE, NOT NULL | Email del usuario |
| `encrypted_password` | VARCHAR | NOT NULL | Contraseña encriptada |
| `email_confirmed_at` | TIMESTAMP | NULL | Confirmación de email |
| `created_at` | TIMESTAMP | DEFAULT NOW() | Fecha de registro |
| `updated_at` | TIMESTAMP | DEFAULT NOW() | Última actualización |
| `raw_user_meta_data` | JSONB | NULL | Metadata: `{ name: string }` |

**Validaciones**:
- ✅ Email único (no duplicados)
- ✅ Contraseña mínimo 8 caracteres
- ✅ Email auto-confirmado (no servidor configurado)

---

### 2. **PROFILE** (Perfil de Usuario)
**Descripción**: Datos personales y metas nutricionales  
**KV Key**: `profile:{userId}`  
**Storage**: KV Store (JSONB)

| Campo | Tipo | Restricciones | Descripción |
|-------|------|---------------|-------------|
| `userId` | UUID | FK→USER.id | ID del usuario |
| `name` | STRING | NULL | Nombre completo |
| `weight` | FLOAT | > 0 | Peso en kg |
| `height` | FLOAT | > 0 | Altura en cm |
| `age` | INTEGER | > 0, < 120 | Edad en años |
| `sex` | ENUM | 'male','female' | Sexo biológico |
| `activityLevel` | ENUM | Ver abajo | Nivel de actividad |
| `goal` | ENUM | Ver abajo | Objetivo nutricional |
| `targetWeight` | FLOAT | NULL | Peso objetivo (kg) |
| `targetDate` | DATE | NULL | Fecha objetivo |
| `allergies` | ARRAY<STRING> | NULL | Lista de alergias |
| `preferences` | ARRAY<STRING> | NULL | Preferencias dietéticas |
| `tmb` | FLOAT | CALCULATED | Tasa Metabólica Basal |
| `dailyCalories` | FLOAT | CALCULATED | Calorías diarias requeridas |
| `createdAt` | TIMESTAMP | DEFAULT NOW() | Fecha de creación |
| `updatedAt` | TIMESTAMP | DEFAULT NOW() | Última actualización |

**Enumeraciones**:

**activityLevel**:
- `sedentary` (1.2x) - Poco o ningún ejercicio
- `light` (1.375x) - Ejercicio ligero 1-3 días/semana
- `moderate` (1.55x) - Ejercicio moderado 3-5 días/semana
- `active` (1.725x) - Ejercicio intenso 6-7 días/semana
- `veryActive` (1.9x) - Ejercicio muy intenso o trabajo físico

**goal**:
- `lose_weight` - Perder peso (déficit calórico)
- `gain_muscle` - Ganar masa muscular (superávit)
- `maintain` - Mantener peso (mantenimiento)

**Validaciones**:
- ✅ Peso y altura requeridos para TMB
- ✅ Meta realista: cambio semanal ≤ 1 kg
- ✅ Máximo 5 alergias permitidas
- ✅ Preferencias no demasiado restrictivas (≤ 3)

**Cálculos**:

```javascript
// TMB - Ecuación de Mifflin-St Jeor
if (sex === 'male') {
  tmb = (10 * weight) + (6.25 * height) - (5 * age) + 5;
} else {
  tmb = (10 * weight) + (6.25 * height) - (5 * age) - 161;
}

// Calorías diarias
dailyCalories = tmb * activityMultiplier;

// Ajuste por objetivo
if (goal === 'lose_weight') {
  dailyCalories -= 500; // Déficit de 500 cal
} else if (goal === 'gain_muscle') {
  dailyCalories += 300; // Superávit de 300 cal
}
```

---

### 3. **MEAL_PLAN** (Plan de Alimentación)
**Descripción**: Plan semanal de comidas generado  
**KV Key**: `meal_plan:{userId}:{date}`  
**Storage**: KV Store (JSONB)

| Campo | Tipo | Restricciones | Descripción |
|-------|------|---------------|-------------|
| `planId` | STRING | PK | ID único del plan |
| `userId` | UUID | FK→USER.id | Usuario del plan |
| `profileSnapshot` | OBJECT | NOT NULL | Snapshot del perfil |
| `menuSemanal` | ARRAY<OBJECT> | 7 items | Menú de 7 días |
| `macronutrientsTotals` | OBJECT | CALCULATED | Totales de macros |
| `totalCalories` | FLOAT | CALCULATED | Calorías totales/semana |
| `razonamientoGeneral` | STRING | NULL | Explicación del plan |
| `createdAt` | TIMESTAMP | DEFAULT NOW() | Fecha de generación |
| `expiresAt` | TIMESTAMP | +7 days | Fecha de expiración |
| `replacements` | ARRAY<OBJECT> | NULL | Historial de reemplazos |

**Estructura de menuSemanal**:
```json
[
  {
    "dia": "Lunes",
    "desayuno": { /* MEAL_ITEM */ },
    "almuerzo": { /* MEAL_ITEM */ },
    "cena": { /* MEAL_ITEM */ },
    "snacks": [ /* MEAL_ITEM[] */ ]
  },
  // ... 6 días más
]
```

---

### 4. **MEAL_ITEM** (Comida Individual)
**Descripción**: Item de comida dentro de un plan  
**Storage**: Embedded en MEAL_PLAN

| Campo | Tipo | Restricciones | Descripción |
|-------|------|---------------|-------------|
| `nombre` | STRING | NOT NULL | Nombre de la comida |
| `ingredientes` | ARRAY<STRING> | MIN 1 | Lista de ingredientes |
| `preparacion` | STRING | NOT NULL | Instrucciones |
| `calorias` | FLOAT | > 0 | Calorías totales |
| `proteinas` | FLOAT | > 0 | Proteínas (g) |
| `carbohidratos` | FLOAT | > 0 | Carbohidratos (g) |
| `grasas` | FLOAT | > 0 | Grasas (g) |
| `razonamiento` | STRING | NULL | Por qué se eligió |
| `alternativas` | ARRAY<OBJECT> | NULL | Alternativas sugeridas |

---

### 5. **RECIPE** (Receta Generada)
**Descripción**: Receta personalizada generada por IA  
**KV Key**: `recipe_history:{userId}` (array de recetas)  
**Storage**: KV Store (JSONB Array)

| Campo | Tipo | Restricciones | Descripción |
|-------|------|---------------|-------------|
| `id` | STRING | PK | `recipe_{timestamp}_{random}` |
| `userId` | UUID | FK→USER.id | Usuario creador |
| `nombre` | STRING | NOT NULL | Nombre de la receta |
| `descripcion` | STRING | NULL | Descripción breve |
| `ingredientes` | ARRAY<OBJECT> | MIN 1 | Ingredientes con cantidades |
| `pasos` | ARRAY<OBJECT> | MIN 1 | Pasos numerados |
| `tiempoPreparacion` | INTEGER | > 0 | Tiempo en minutos |
| `dificultad` | ENUM | Ver abajo | Nivel de dificultad |
| `porciones` | INTEGER | 1-8 | Número de porciones |
| `nutricion` | OBJECT | NOT NULL | Info nutricional |
| `consejos` | STRING | NULL | Tips y consejos |
| `categorias` | ARRAY<STRING> | NULL | Tags de categoría |
| `mealType` | ENUM | Ver abajo | Tipo de comida |
| `generatedAt` | TIMESTAMP | DEFAULT NOW() | Fecha de generación |
| `parameters` | OBJECT | NOT NULL | Parámetros de generación |

**Enumeraciones**:

**dificultad**:
- `fácil` - Receta simple
- `intermedio` - Requiere técnica
- `avanzado` - Para expertos

**mealType**:
- `desayuno` - Breakfast
- `almuerzo` - Lunch
- `cena` - Dinner
- `snack` - Snack/Aperitivo

**Estructura de ingredientes**:
```json
[
  {
    "nombre": "Pollo",
    "cantidad": "300g",
    "categoria": "proteina"
  }
]
```

**Estructura de pasos**:
```json
[
  {
    "paso": 1,
    "instruccion": "Cortar el pollo en cubos"
  }
]
```

**Estructura de nutricion**:
```json
{
  "calorias": 450,
  "proteinas": 35,
  "carbohidratos": 40,
  "grasas": 15,
  "fibra": 5
}
```

**Validaciones**:
- ✅ Máximo 20 recetas en historial (FIFO)
- ✅ Al menos 3 ingredientes
- ✅ Porciones entre 1-8
- ✅ Respeta alergias del perfil

---

### 6. **RECIPE_FAVORITE** (Favoritos)
**Descripción**: Relación M:N entre usuarios y recetas favoritas  
**KV Key**: `recipe_favorites:{userId}` (array de IDs)  
**Storage**: KV Store (JSONB Array)

| Campo | Tipo | Restricciones | Descripción |
|-------|------|---------------|-------------|
| `userId` | UUID | FK→USER.id | Usuario |
| `recipeIds` | ARRAY<STRING> | FK→RECIPE.id | IDs de recetas favoritas |

**Validaciones**:
- ✅ Sin duplicados en el array
- ✅ Máximo 50 favoritos por usuario

---

### 7. **SPECIALIST** (Especialista)
**Descripción**: Usuario especialista (nutriólogo/entrenador)  
**Tabla**: `auth.users` (mismo que USER)  
**Storage**: Supabase Auth

| Campo | Tipo | Restricciones | Descripción |
|-------|------|---------------|-------------|
| `id` | UUID | PK, Auto | ID único |
| `email` | VARCHAR | UNIQUE, NOT NULL | Email |
| `encrypted_password` | VARCHAR | NOT NULL | Contraseña |
| `raw_user_meta_data` | JSONB | `{role: 'specialist'}` | Metadata con rol |

**Diferenciación**:
- Usuarios regulares: `user_metadata.role` no definido o `'user'`
- Especialistas: `user_metadata.role === 'specialist'`

---

### 8. **SPECIALIST_PROFILE** (Perfil de Especialista)
**Descripción**: Información profesional del especialista  
**KV Key**: `specialist_profile:{userId}`  
**Storage**: KV Store (JSONB)

| Campo | Tipo | Restricciones | Descripción |
|-------|------|---------------|-------------|
| `userId` | UUID | FK→USER.id | ID del especialista |
| `name` | STRING | NOT NULL | Nombre completo |
| `specialty` | ENUM | Ver abajo | Especialidad |
| `professionalLicense` | STRING | MIN 6, UNIQUE | Cédula profesional |
| `bio` | STRING | MAX 500 | Biografía |
| `certifications` | ARRAY<STRING> | NULL | Certificaciones |
| `yearsExperience` | INTEGER | > 0 | Años de experiencia |
| `availability` | OBJECT | NULL | Horarios disponibles |
| `rating` | FLOAT | 0-5 | Calificación promedio |
| `totalRequests` | INTEGER | DEFAULT 0 | Solicitudes atendidas |
| `createdAt` | TIMESTAMP | DEFAULT NOW() | Fecha de registro |
| `updatedAt` | TIMESTAMP | DEFAULT NOW() | Última actualización |
| `isActive` | BOOLEAN | DEFAULT true | Está activo |
| `maxRequests` | INTEGER | DEFAULT 10 | Máximo de solicitudes |

**Enumeraciones**:

**specialty**:
- `nutricion` - Nutriólogo
- `entrenamiento` - Entrenador personal
- `nutricion_deportiva` - Nutrición deportiva
- `general` - Asesoría general

**Validaciones**:
- ✅ Cédula profesional única
- ✅ Mínimo 6 caracteres en cédula
- ✅ Biografía máximo 500 caracteres

---

### 9. **SPECIALIST_REQUEST** (Solicitud de Asesoría)
**Descripción**: Solicitud de usuario a especialista  
**KV Key**: `specialist_request:{requestId}`  
**Index Key**: `user_requests:{userId}` (array de IDs)  
**Storage**: KV Store (JSONB)

| Campo | Tipo | Restricciones | Descripción |
|-------|------|---------------|-------------|
| `requestId` | STRING | PK | `req_{timestamp}_{random}` |
| `userId` | UUID | FK→USER.id | Usuario solicitante |
| `specialistId` | UUID | FK→SPECIALIST.id | Especialista asignado |
| `requestType` | ENUM | Ver abajo | Tipo de solicitud |
| `description` | STRING | 50-1000 chars | Descripción detallada |
| `status` | ENUM | Ver abajo | Estado actual |
| `priority` | ENUM | 'low','medium','high' | Prioridad |
| `userProfileSnapshot` | OBJECT | NOT NULL | Snapshot del perfil |
| `createdAt` | TIMESTAMP | DEFAULT NOW() | Fecha de creación |
| `assignedAt` | TIMESTAMP | NULL | Fecha de asignación |
| `completedAt` | TIMESTAMP | NULL | Fecha de completado |
| `metadata` | OBJECT | NULL | Datos adicionales |

**Enumeraciones**:

**requestType**:
- `rutina_ejercicio` - Solicitud de rutina
- `plan_alimentacion` - Solicitud de dieta
- `asesoria_general` - Asesoría general

**status**:
- `pending` - Pendiente de asignación
- `assigned` - Asignado a especialista
- `in_progress` - En proceso
- `completed` - Completado
- `cancelled` - Cancelado

**Validaciones**:
- ✅ Descripción entre 50-1000 caracteres
- ✅ Sin palabras prohibidas
- ✅ Máximo 5 solicitudes pendientes por usuario

**Sistema de Asignación Automática**:
```javascript
// Asigna al especialista menos ocupado y activo
const specialists = await getActiveSpecialists();
const leastBusy = specialists.sort((a, b) => 
  a.totalRequests - b.totalRequests
)[0];
```

---

### 10. **MESSAGE** (Mensaje de Chat)
**Descripción**: Comunicación entre usuario y especialista  
**KV Key**: `request_messages:{requestId}` (array)  
**Storage**: KV Store (JSONB Array)

| Campo | Tipo | Restricciones | Descripción |
|-------|------|---------------|-------------|
| `messageId` | STRING | PK | `msg_{timestamp}_{random}` |
| `requestId` | STRING | FK→REQUEST.id | Solicitud asociada |
| `senderId` | UUID | FK→USER.id | Remitente |
| `senderType` | ENUM | 'user','specialist' | Tipo de remitente |
| `content` | STRING | NOT NULL | Contenido del mensaje |
| `timestamp` | TIMESTAMP | DEFAULT NOW() | Fecha/hora de envío |
| `isFiltered` | BOOLEAN | DEFAULT false | Fue filtrado |
| `attachments` | ARRAY<OBJECT> | NULL | Archivos adjuntos |

**Validaciones**:
- ✅ Filtro de palabras prohibidas (12 palabras)
- ✅ Contenido no vacío
- ✅ Máximo 2000 caracteres

**Palabras Prohibidas**:
```javascript
const FORBIDDEN_WORDS = [
  'idiota', 'estúpido', 'tonto', 'imbécil', 
  'pendejo', 'cabrón', 'mierda', 'joder', 
  'puto', 'puta', 'coño', 'maldito'
];
```

---

### 11. **FOOD_DATABASE** (Base de Datos de Alimentos)
**Descripción**: Catálogo de alimentos para el motor Prolog  
**Storage**: In-memory (parte del código)

| Campo | Tipo | Descripción |
|-------|------|-------------|
| `nombre` | STRING | Nombre del alimento |
| `categoria` | ENUM | proteina, vegetal, carbohidrato, fruta, lacteo |
| `calorias` | FLOAT | Calorías por 100g |
| `proteinas` | FLOAT | Proteínas por 100g |
| `carbohidratos` | FLOAT | Carbohidratos por 100g |
| `grasas` | FLOAT | Grasas por 100g |
| `restricciones` | ARRAY<STRING> | Alergias asociadas |
| `temporada` | ARRAY<STRING> | Meses disponibles |

**Categorías de alimentos**: 45+ alimentos catalogados

---

## 🔗 Relaciones

### Relaciones Principales

| Relación | Tipo | Descripción |
|----------|------|-------------|
| USER → PROFILE | 1:1 | Un usuario tiene un perfil |
| USER → MEAL_PLAN | 1:N | Un usuario puede tener múltiples planes |
| USER → RECIPE | 1:N | Un usuario puede generar múltiples recetas |
| USER ↔ RECIPE | M:N | Un usuario puede tener múltiples favoritos |
| MEAL_PLAN → MEAL_ITEM | 1:N | Un plan tiene múltiples comidas |
| SPECIALIST → SPECIALIST_PROFILE | 1:1 | Un especialista tiene un perfil |
| SPECIALIST → SPECIALIST_REQUEST | 1:N | Un especialista puede atender múltiples solicitudes |
| USER → SPECIALIST_REQUEST | 1:N | Un usuario puede hacer múltiples solicitudes |
| SPECIALIST_REQUEST → MESSAGE | 1:N | Una solicitud tiene múltiples mensajes |

---

## 🗂️ Estructura de KV Store

### Prefijos de Llaves

| Prefijo | Tipo | Ejemplo | Descripción |
|---------|------|---------|-------------|
| `profile:{userId}` | OBJECT | `profile:abc123` | Perfil de usuario |
| `meal_plan:{userId}:{date}` | OBJECT | `meal_plan:abc123:2024-12-01` | Plan de comidas |
| `recipe_history:{userId}` | ARRAY | `recipe_history:abc123` | Historial de recetas (max 20) |
| `recipe_favorites:{userId}` | ARRAY | `recipe_favorites:abc123` | IDs de recetas favoritas |
| `specialist_profile:{userId}` | OBJECT | `specialist_profile:xyz789` | Perfil de especialista |
| `specialist_request:{requestId}` | OBJECT | `specialist_request:req_123` | Solicitud individual |
| `user_requests:{userId}` | ARRAY | `user_requests:abc123` | IDs de solicitudes del usuario |
| `specialist_requests:{specialistId}` | ARRAY | `specialist_requests:xyz789` | IDs de solicitudes asignadas |
| `request_messages:{requestId}` | ARRAY | `request_messages:req_123` | Mensajes del chat |

### Ejemplo de Estructura

```javascript
// KV Store Structure
{
  // User Profile
  "profile:user123": {
    userId: "user123",
    weight: 70,
    height: 175,
    age: 30,
    sex: "male",
    activityLevel: "moderate",
    goal: "lose_weight",
    allergies: ["gluten", "lactosa"],
    preferences: ["vegetariano"],
    tmb: 1680,
    dailyCalories: 2100,
    createdAt: "2024-12-01T10:00:00Z",
    updatedAt: "2024-12-04T15:30:00Z"
  },

  // Recipe History (Array)
  "recipe_history:user123": [
    {
      id: "recipe_1733328000000_abc123",
      nombre: "Ensalada César Proteica",
      descripcion: "Ensalada alta en proteínas...",
      ingredientes: [
        { nombre: "Pollo", cantidad: "200g" },
        { nombre: "Lechuga", cantidad: "100g" }
      ],
      pasos: [
        { paso: 1, instruccion: "Cortar el pollo..." }
      ],
      nutricion: {
        calorias: 350,
        proteinas: 35,
        carbohidratos: 20,
        grasas: 12,
        fibra: 4
      },
      dificultad: "fácil",
      porciones: 2,
      mealType: "almuerzo",
      generatedAt: "2024-12-04T12:00:00Z"
    }
    // ... hasta 19 más
  ],

  // Favorites (Array of IDs)
  "recipe_favorites:user123": [
    "recipe_1733328000000_abc123",
    "recipe_1733414400000_def456"
  ],

  // Specialist Request
  "specialist_request:req_1733328000000_xyz": {
    requestId: "req_1733328000000_xyz",
    userId: "user123",
    specialistId: "specialist789",
    requestType: "plan_alimentacion",
    description: "Necesito un plan de alimentación...",
    status: "assigned",
    priority: "medium",
    userProfileSnapshot: { /* snapshot del perfil */ },
    createdAt: "2024-12-04T10:00:00Z",
    assignedAt: "2024-12-04T10:05:00Z"
  },

  // Request Messages
  "request_messages:req_1733328000000_xyz": [
    {
      messageId: "msg_1733328300000_aaa",
      senderId: "user123",
      senderType: "user",
      content: "Hola, necesito ayuda con mi dieta",
      timestamp: "2024-12-04T10:10:00Z",
      isFiltered: false
    },
    {
      messageId: "msg_1733328600000_bbb",
      senderId: "specialist789",
      senderType: "specialist",
      content: "Claro, revisaré tu perfil...",
      timestamp: "2024-12-04T10:15:00Z",
      isFiltered: false
    }
  ]
}
```

---

## ⚙️ Índices y Optimizaciones

### Índices Recomendados

```javascript
// Índices para búsqueda eficiente
{
  // Por usuario
  "user:*": ["profile:*", "recipe_history:*", "recipe_favorites:*"],
  
  // Por especialista
  "specialist:*": ["specialist_profile:*", "specialist_requests:*"],
  
  // Por solicitud
  "request:*": ["specialist_request:*", "request_messages:*"]
}
```

### Estrategias de Caché

1. **Profile Cache**: 5 minutos
2. **Recipe History**: 2 minutos
3. **Meal Plan**: 1 hora (se regenera semanalmente)
4. **Food Database**: Inmutable (cache permanente)

---

## 🔒 Reglas de Integridad

### Validaciones de Negocio

1. **Perfil**:
   - TMB debe calcularse antes de guardar
   - Meta debe ser realista (< 1kg/semana)
   - Máximo 5 alergias

2. **Recetas**:
   - Respetar alergias del perfil
   - Máximo 20 en historial (FIFO)
   - Mínimo 3 ingredientes

3. **Planes de Comidas**:
   - Generar para 7 días exactos
   - Respetar restricciones del perfil
   - Balancear macronutrientes

4. **Solicitudes**:
   - Máximo 5 pendientes por usuario
   - Descripción entre 50-1000 caracteres
   - Filtrar palabras prohibidas

5. **Mensajes**:
   - Filtrar palabras prohibidas
   - Máximo 2000 caracteres
   - Requiere solicitud activa

---

## 📊 Estadísticas del Sistema

### Métricas Calculadas

```javascript
// Estadísticas de usuario
const userStats = {
  totalRecipesGenerated: recipeHistory.length,
  totalFavorites: recipeFavorites.length,
  weeklyRecipes: recipeHistory.filter(r => 
    isWithinLastWeek(r.generatedAt)
  ).length,
  profileCompleteness: calculateCompleteness(profile)
};

// Estadísticas de especialista
const specialistStats = {
  totalRequests: specialistProfile.totalRequests,
  activeRequests: requests.filter(r => r.status !== 'completed').length,
  avgResponseTime: calculateAvgResponseTime(requests),
  rating: specialistProfile.rating
};
```

---

## 🔄 Flujos de Datos Principales

### Flujo 1: Registro y Configuración de Perfil

```
1. POST /signup → Crea USER en Supabase Auth
2. Auto-login → Obtiene accessToken
3. PUT /profile → Crea PROFILE con cálculo de TMB
4. Sistema valida meta realista
5. Retorna perfil completo con dailyCalories
```

### Flujo 2: Generación de Plan de Alimentación

```
1. GET /profile → Obtiene perfil del usuario
2. POST /generate-menu → Envía preferencias
3. Motor Prolog procesa:
   - Filtra alergias
   - Selecciona alimentos por categoría
   - Balancea macronutrientes
   - Genera 7 días de menús
4. Guarda en meal_plan:{userId}:{date}
5. Retorna plan completo con razonamiento
```

### Flujo 3: Generación de Receta IA

```
1. POST /recipes/generate → Envía ingredientes y parámetros
2. Motor IA genera receta:
   - Selecciona ingredientes compatibles
   - Crea pasos detallados
   - Calcula nutrición
   - Genera consejos
3. Guarda en recipe_history:{userId}
4. Retorna receta con ID único
```

### Flujo 4: Comunicación con Especialista

```
1. POST /specialist-requests → Crea solicitud
2. Sistema asigna especialista automáticamente
3. POST /specialist-requests/:id/messages → Envía mensaje
4. Filtra palabras prohibidas
5. Notifica a especialista (futuro: WebSockets)
6. GET /specialist-requests/:id/messages → Obtiene chat
```

---

## 🚀 Escalabilidad

### Estrategias de Crecimiento

1. **Particionamiento**:
   - Por userId para distribución
   - Por fecha para datos históricos

2. **Archivado**:
   - Mover planes >30 días a "cold storage"
   - Comprimir recetas >90 días

3. **Índices Secundarios**:
   - Índice por specialty para búsqueda de especialistas
   - Índice por status para solicitudes activas

4. **Límites**:
   - Max 20 recetas en historial
   - Max 50 favoritos
   - Max 5 solicitudes pendientes

---

## 📝 Notas Técnicas

### Limitaciones Actuales

1. **No hay tabla relacional real**: Todo en KV Store
2. **No hay transacciones ACID**: Usar lógica de aplicación
3. **No hay joins**: Desnormalizar cuando sea necesario
4. **No hay triggers**: Manejar cascadas manualmente

### Migraciones Futuras

Si se migra a PostgreSQL completo:

```sql
-- Ejemplo de migración
CREATE TABLE profiles (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id),
  weight DECIMAL(5,2) NOT NULL,
  height DECIMAL(5,2) NOT NULL,
  tmb DECIMAL(6,2) GENERATED ALWAYS AS (
    CASE 
      WHEN sex = 'male' THEN (10 * weight) + (6.25 * height) - (5 * age) + 5
      ELSE (10 * weight) + (6.25 * height) - (5 * age) - 161
    END
  ) STORED
);

CREATE INDEX idx_profiles_user_id ON profiles(user_id);
CREATE INDEX idx_recipes_user_id ON recipes(user_id);
CREATE INDEX idx_requests_status ON specialist_requests(status);
```

---

## ✅ Checklist de Implementación

- [x] Autenticación de usuarios (Supabase Auth)
- [x] Gestión de perfiles con TMB
- [x] Generación de planes de comidas (Motor Prolog)
- [x] Generación de recetas IA (Motor propio)
- [x] Sistema de favoritos
- [x] Historial de recetas
- [x] Registro de especialistas
- [x] Sistema de solicitudes
- [x] Chat con especialistas
- [x] Filtro de palabras prohibidas
- [x] Asignación automática de especialistas
- [ ] Notificaciones en tiempo real (WebSockets)
- [ ] Sistema de calificaciones
- [ ] Exportación de recetas a PDF
- [ ] Sincronización multi-dispositivo

---

## 📚 Referencias

- **Supabase Auth**: https://supabase.com/docs/guides/auth
- **KV Store**: Implementación personalizada en `/supabase/functions/server/kv_store.tsx`
- **Motor Prolog**: `/supabase/functions/server/prolog_engine.tsx`
- **Motor de Recetas**: `/supabase/functions/server/recipe_engine.tsx`

---

**Fecha de última actualización**: 4 de Diciembre, 2024  
**Versión del modelo**: 2.0  
**Autor**: Sistema Dr. Baymax
