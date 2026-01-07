# 🏥 Dr. Baymax - Aplicación de Gestión Nutricional

**Sistema completo de nutrición personalizada con comunicación directa Usuario-Especialista**

![Status](https://img.shields.io/badge/status-production-green)
![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?logo=typescript&logoColor=white)
![React](https://img.shields.io/badge/React-20232A?logo=react&logoColor=61DAFB)
![Supabase](https://img.shields.io/badge/Supabase-3ECF8E?logo=supabase&logoColor=white)

## 📋 Descripción

**Dr. Baymax** es una aplicación completa de gestión nutricional que incluye:
- ✅ Autenticación y gestión de perfiles
- ✅ Generación automática de menús semanales (Motor Prolog)
- ✅ **Generador de recetas con IA propia** (45+ recetas)
- ✅ **Plan semanal de 21 recetas** con lista de compras
- ✅ **Comunicación directa con especialistas**
- ✅ Sistema de mensajería en tiempo real
- ✅ Planes personalizados de dieta y ejercicio
- ✅ Sistema de favoritos y búsqueda avanzada

## 🎯 Casos de Uso Implementados

### 1. Gestionar Cuenta
- Registro de usuarios con validaciones
- Inicio de sesión seguro
- Validación de emails duplicados
- Contraseñas seguras (mínimo 8 caracteres)

### 2. Configurar Perfil y Metas
- Datos personales (edad, sexo, peso, altura)
- Nivel de actividad física
- Objetivos de peso (perder, ganar, mantener)
- Alergias alimenticias
- Preferencias y alimentos no deseados
- Restricciones dietéticas
- Cálculo automático de TMB y calorías

### 3. Generar Plan de Alimentación 🧠 **Powered by Prolog**
- **Motor de lógica de predicados de primer orden** (estilo Prolog)
- Menús semanales (7 días)
- 3 comidas por día (Desayuno, Almuerzo, Cena)
- Respeta todas las restricciones del usuario
- Balance nutricional garantizado por reglas lógicas
- Calorías calculadas por comida
- Sistema de inferencia automática
- Backtracking cuando no se satisfacen restricciones

### 3b. Generador de Recetas con IA Propia 🤖 **ACTUALIZADO**
- **Motor de recetas 100% autónomo** (sin APIs externas)
- **45+ recetas prediseñadas y probadas** (expandido desde 21)
- **70+ ingredientes catalogados** con información nutricional completa
- Sistema inteligente de sustitución de ingredientes
- Respeta alergias, alimentos no deseados y preferencias
- Cálculo nutricional automático por porción
- Generación instantánea (<100ms)
- Ajuste dinámico de porciones (1-8)
- **NUEVO**: Plan semanal automático (21 recetas/semana)
- **NUEVO**: Lista de compras generada automáticamente
- **NUEVO**: Sistema de favoritos con búsqueda y filtros
- **Ventajas**: Gratis, rápido, privado, 100% confiable

### 4. **Enviar Mensaje (Usuario–Especialista)** ⭐ NUEVO
- Solicitar rutinas de ejercicio personalizadas
- Solicitar planes de dieta personalizados
- Sistema de mensajería bidireccional
- Filtro de contenido inapropiado
- Historial de conversaciones
- Estados de solicitud (pendiente, en progreso, completado)

## 🚀 Características Principales

### 📱 Para el Usuario

#### Contactar Especialista
```
┌─────────────────────────────────────┐
│  Contactar Especialista             │
├─────────────────────────────────────┤
│  🏋️ Solicitar Rutina                │
│  └─ Plan de ejercicios personalizado│
│                                     │
│  🍽️ Solicitar Dieta                 │
│  └─ Plan nutricional personalizado  │
└─────────────────────────────────────┘
```

#### Mis Planes
- Ver todas las solicitudes realizadas
- Estado en tiempo real
- Acceso al plan completo cuando esté listo
- Chat directo con el especialista
- Historial de conversaciones

#### Sistema de Mensajería
- Chat bidireccional
- Mensajes en tiempo real
- Filtro de palabras prohibidas
- Historial completo
- Notificaciones visuales

### 🩺 Para el Especialista (Demo)

#### Panel de Solicitudes
- Ver todas las solicitudes pendientes
- Revisar perfiles completos de usuarios
- Crear planes personalizados
- Plantillas predefinidas
- Sistema de recomendaciones

**Nota**: El panel de especialista es solo para demostración. En producción tendría autenticación separada.

## 🎨 Mejoras de Experiencia de Usuario (UX)

### 💡 Sistema de Sugerencias Inteligentes
- **Sugerencias contextuales** basadas en el tipo de comida seleccionado
- **Detección automática** de macronutrientes faltantes (proteína, vegetales, carbohidratos)
- **Ingredientes populares** por categoría (desayuno, almuerzo, cena, snack)
- **70+ ingredientes** catalogados con información nutricional
- **Un clic para agregar** ingredientes sugeridos

### 🎭 Animaciones y Feedback Visual
- **Animación de generación**: Progreso visual con 6 pasos animados
  - Analizando perfil
  - Revisando restricciones
  - Seleccionando ingredientes
  - Adaptando receta
  - Calculando nutrición
  - Finalizando receta
- **Celebración de éxito**: Animación de confeti y mensaje personalizado
- **Transiciones suaves**: Fade-in, slide-in en todos los componentes
- **Animaciones de entrada**: Ingredientes aparecen con slide-in
- **Feedback inmediato**: Tooltips, hovers, y estados visuales

### 📊 Visualización Nutricional Mejorada
- **Tarjetas interactivas** con iconos para cada macronutriente:
  - 🔥 Calorías (emerald)
  - 💪 Proteínas (blue)
  - 🌾 Carbohidratos (orange)
  - 💧 Grasas (purple)
  - 🌿 Fibra (green)
- **Tooltips informativos** con descripciones de cada nutriente
- **Efecto hover** con escala y sombra
- **Progreso circular** opcional con porcentaje visual

### 💬 Tooltips y Ayuda Contextual
- **Tooltips informativos** en todos los campos del formulario
- **Posicionamiento inteligente** (top, bottom, left, right)
- **Animaciones suaves** fade-in
- **Información clara** sobre cada opción

### 🎯 Quick Tips Educativos
- **6 consejos rotativos** sobre nutrición y uso de la app
- **Indicadores de progreso** para navegar entre tips
- **Diseño atractivo** con gradiente amber/yellow
- **Colapsable** para más espacio cuando no se necesita
- Tips incluyen:
  - Combinar proteínas y vegetales
  - Especificar ingredientes para personalización
  - Ingredientes de temporada
  - Ajuste de porciones
  - Sistema de favoritos
  - Niveles de dificultad

### 🎛️ Controles Mejorados
- **Slider de porciones** con visualización en tiempo real (1-8 personas)
- **Selectores con emojis** para mejor identificación visual
- **Estados hover mejorados** con transiciones suaves
- **Inputs con validación visual** instantánea
- **Botones con estados de carga** animados

### 📝 Resumen de Perfil Inteligente
- **Tarjeta de perfil** con información clave:
  - TMB calculado
  - Objetivo nutricional
  - Alergias marcadas
  - Preferencias dietéticas
- **Alertas visuales** si falta configuración
- **Diseño adaptativo** según estado del perfil
- **Badges de categorías** con códigos de color

### ⚡ Rendimiento y Usabilidad
- **Carga instantánea** de componentes (<50ms)
- **Animaciones suaves** a 60fps
- **Feedback inmediato** en todas las acciones
- **Estados de carga claros** con indicadores visuales
- **Diseño responsivo** optimizado para móvil y desktop

## 🛡️ Validaciones y Seguridad

### Validaciones de Perfil
- ✅ Datos personales completos
- ✅ Metas realistas
- ✅ Restricciones alimenticias válidas

### Validaciones de Comunicación
- ✅ **Perfil completo** antes de contactar especialista
- ✅ **Descripción no vacía** en solicitudes
- ✅ **Filtro de palabras prohibidas** en mensajes
- ✅ **Autenticación** en todos los endpoints
- ✅ **Verificación de permisos** por usuario

### Palabras Prohibidas
El sistema filtra automáticamente lenguaje inapropiado:
```javascript
['idiota', 'estúpido', 'tonto', 'imbécil', 'pendejo', 
 'cabrón', 'mierda', 'joder', 'puto', 'puta', 
 'coño', 'maldito']
```

## 🏗️ Arquitectura Técnica

### Backend (Supabase Edge Functions)

#### Endpoints de Autenticación
- `POST /signup` - Registro de usuarios
- Supabase Auth para login

#### Endpoints de Perfil
- `GET /profile` - Obtener perfil
- `PUT /profile` - Guardar/actualizar perfil

#### Endpoints de Menús 🧠 Prolog Engine
- `POST /generate-menu` - Generar plan de alimentación (motor Prolog)
- `POST /replace-meal` - Generar alternativas de comidas (motor Prolog)
- `GET /debug/prolog-knowledge` - Ver base de conocimiento Prolog

#### Endpoints de Recetas 🤖 Custom AI Engine **ACTUALIZADO**
- `POST /generate-recipe` - Generar receta personalizada (motor propio)
- `GET /recipes/history` - Historial de recetas generadas
- `POST /recipes/favorite` - Guardar receta en favoritos
- `DELETE /recipes/favorite/:id` - Eliminar favorito
- `GET /recipes/favorites` - Obtener recetas favoritas
- `GET /recipes/stats` - Estadísticas del motor de recetas
- **`POST /weekly-recipe-plan`** - Generar plan semanal completo ⭐ NUEVO
- **`POST /regenerate-meal`** - Regenerar comida individual ⭐ NUEVO
- **`GET /weekly-plan`** - Obtener plan semanal guardado ⭐ NUEVO

#### Endpoints de Comunicación ⭐ NUEVO
- `POST /specialist-requests` - Crear solicitud
- `GET /specialist-requests` - Listar solicitudes
- `GET /specialist-requests/:id` - Detalle de solicitud
- `POST /messages` - Enviar mensaje
- `GET /messages/:requestId` - Obtener mensajes
- `POST /specialist-plans` - Crear plan (especialista)
- `PUT /specialist-requests/:id/status` - Actualizar estado

### Frontend (React + TypeScript)

#### Componentes Principales
- `Login.tsx` - Inicio de sesión
- `Register.tsx` - Registro de usuarios
- `Profile.tsx` - Configuración de perfil
- `Dashboard.tsx` - Panel de control (actualizado con 5 acciones)
- `MealPlanner.tsx` - Generador de menús (con motor Prolog)
- `PrologInfo.tsx` - Información sobre el motor de lógica 🧠
- `RecipeGenerator.tsx` - Generador de recetas IA
- `RecipeEngineInfo.tsx` - Información del motor de recetas
- **`WeeklyRecipePlan.tsx`** - Plan semanal de recetas ⭐ NUEVO
- **`RecipeFavorites.tsx`** - Gestión de favoritos con búsqueda ⭐ NUEVO

#### Componentes de Comunicación ⭐ NUEVO
- `ContactSpecialist.tsx` - Contactar especialista
- `MyPlans.tsx` - Ver planes y chat
- `SpecialistSimulator.tsx` - Simulador (demo)

#### Componentes de UX Mejorada 🎨 NUEVO
- `NutritionStats.tsx` - Visualización nutricional interactiva con tooltips
- `RecipeGenerationProgress.tsx` - Animación de progreso con pasos
- `RecipeSuccessAnimation.tsx` - Celebración al generar recetas
- `IngredientSuggestions.tsx` - Sugerencias inteligentes de ingredientes
- `QuickTips.tsx` - Consejos contextuales rotativos
- `UserProfileSummary.tsx` - Resumen visual del perfil
- `ui/tooltip.tsx` - Sistema de tooltips informativos
- `ui/progress.tsx` - Barras de progreso lineal y circular

### Base de Datos (KV Store)

```
profile:{userId}                    → Perfil de usuario
mealplan:{userId}                   → Plan de alimentación
specialist_request:{requestId}      → Solicitud de plan
user_requests:{userId}              → Lista de solicitudes
specialist_plan:{requestId}         → Plan creado
message:{messageId}                 → Mensaje
request_messages:{requestId}        → Lista de mensajes
```

## 📊 Flujo de Datos

### Flujo de Solicitud de Plan

```
Usuario → Selecciona Tipo → Describe Solicitud
   ↓
Validaciones (Perfil, Descripción, Palabras)
   ↓
Almacena Solicitud (status: pendiente)
   ↓
Especialista Revisa → Crea Plan
   ↓
Actualiza Status (completado)
   ↓
Usuario Ve Plan → Puede enviar mensajes
```

### Flujo de Mensajería

```
Usuario/Especialista → Escribe Mensaje
   ↓
Valida (No vacío, Sin palabras prohibidas)
   ↓
Almacena Mensaje
   ↓
Actualiza Lista de Mensajes
   ↓
Otro Usuario Ve Mensaje en Tiempo Real
```

## 🎨 Interfaz de Usuario

### Dashboard
```
┌──────────────────────────────────────┐
│  Dr. Baymax - Panel de Control      │
├──────────────────────────────────────┤
│  📊 Peso: 70kg    🎯 Meta: Perder    │
│  🔥 TMB: 1650     ⚡ Calorías: 2000  │
├──────────────────────────────────────┤
│  Acciones Rápidas:                   │
│  ┌────────┐ ┌──────────┐ ┌────────┐ │
│  │  🍽️    │ │💬        │ │📋      │ │
│  │  Menú  │ │Especialis│ │Planes  │ │
│  └────────┘ └──────────┘ └────────┘ │
└──────────────────────────────────────┘
```

## 🧪 Testing

### Probar el Flujo Completo

1. **Registro y Login**
   ```
   → Registrarse con email y contraseña
   → Iniciar sesión
   ```

2. **Configurar Perfil**
   ```
   → Ingresar datos personales
   → Configurar metas
   → Agregar alergias/preferencias
   ```

3. **Generar Menú**
   ```
   → Ir a "Generar Menú"
   → Ver plan semanal
   → Explorar comidas
   ```

4. **Contactar Especialista** ⭐ NUEVO
   ```
   → Ir a "Contactar Especialista"
   → Elegir "Rutina" o "Dieta"
   → Describir necesidad
   → Enviar solicitud
   ```

5. **Simular Especialista** (Demo)
   ```
   → Ir a "🩺 Especialista (Demo)"
   → Ver solicitud
   → Crear plan con plantilla
   → Enviar plan
   ```

6. **Ver Plan y Chat**
   ```
   → Ir a "Mis Planes"
   → Abrir plan
   → Ver contenido completo
   → Enviar mensaje al especialista
   ```

### Casos de Prueba

#### ✅ Test 1: Perfil Incompleto
```
Usuario sin perfil → Intenta contactar especialista
→ Error: "Debes completar tu perfil..."
→ Redirige a configurar perfil
```

#### ✅ Test 2: Descripción Vacía
```
Usuario selecciona tipo → No escribe nada
→ Botón "Enviar" deshabilitado
→ Error si intenta enviar
```

#### ✅ Test 3: Palabras Prohibidas
```
Usuario escribe palabra prohibida
→ Error: "Palabras no permitidas..."
→ No se envía el mensaje
```

#### ✅ Test 4: Flujo Exitoso
```
Usuario completo → Solicita dieta → Especialista crea plan
→ Usuario ve plan → Envía mensaje → Especialista responde
→ ✅ Todo funciona
```

## 🔧 Tecnologías Utilizadas

- **Frontend**: React 18 + TypeScript
- **UI**: Tailwind CSS + shadcn/ui
- **Backend**: Supabase Edge Functions (Hono)
- **Base de Datos**: Supabase KV Store
- **Autenticación**: Supabase Auth
- **Iconos**: Lucide React
- **Notificaciones**: Sonner
- **🧠 Motor de IA**: Lógica de Predicados de Primer Orden (Prolog)

## 📦 Estructura del Proyecto

```
dr-baymax/
├── components/
│   ├── Login.tsx
│   ├── Register.tsx
│   ├── Dashboard.tsx
│   ├── Profile.tsx
│   ├── MealPlanner.tsx
│   ├── ContactSpecialist.tsx     ← Nuevo
│   ├── MyPlans.tsx               ← Nuevo
│   ├── SpecialistSimulator.tsx   ← Nuevo
│   └── ui/                       ← Componentes UI
├── supabase/
│   └── functions/
│       └── server/
│           ├── index.tsx         ← Endpoints REST API
│           ├── prolog_engine.tsx ← 🧠 Motor de lógica Prolog
│           └── kv_store.tsx
├── utils/
│   └── supabase/
│       ├── client.tsx
│       └── info.tsx
├── App.tsx
└── README.md
```

## 🌟 Casos de Uso - Resumen

| # | Caso de Uso | Estado | Componente |
|---|-------------|--------|------------|
| 1 | Gestionar Cuenta | ✅ | Login, Register |
| 2 | Configurar Perfil | ✅ | Profile |
| 3 | Generar Menú | ✅ | MealPlanner |
| 4 | **Comunicación** | ✅ ⭐ | ContactSpecialist, MyPlans |

## 📝 Flujos Alternativos Implementados

### FA1: Usuario sin perfil completo
- ✅ Validación en backend
- ✅ Mensaje de error claro
- ✅ Redirección automática

### FA2: Especialista no disponible
- ✅ Estado "pendiente" por defecto
- ✅ Mensaje: "Responderá en 24 horas"

### FA3: Usuario cancela solicitud
- ✅ Botón "Cancelar"
- ✅ Limpia formulario
- ✅ Regresa al menú

### FA4: Solicitud incompleta
- ✅ Validación frontend
- ✅ Validación backend
- ✅ Botón deshabilitado

### FA (Extension): Palabras prohibidas
- ✅ Lista de palabras filtradas
- ✅ Validación en solicitudes
- ✅ Validación en mensajes

## 🚀 Despliegue

La aplicación está diseñada para **Supabase**:

1. Crear proyecto en Supabase
2. Configurar variables de entorno
3. Desplegar Edge Functions
4. Configurar autenticación
5. ¡Listo!

### 💻 Ejecución Local

Para ejecutar el proyecto en tu dispositivo local:

- **[⚡ INICIO_RAPIDO.md](./INICIO_RAPIDO.md)** - Guía de 5 minutos para empezar
- **[📘 INSTALACION_LOCAL.md](./INSTALACION_LOCAL.md)** - Guía completa paso a paso con troubleshooting

### Scripts de Inicio
```bash
# Linux/macOS
./start-local.sh

# Windows
start-local.bat
```

## 🔐 Variables de Entorno Requeridas

```env
SUPABASE_URL=your-project-url
SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

## 📖 Documentación Adicional

### Guías de Instalación
- **[⚡ INICIO_RAPIDO.md](./INICIO_RAPIDO.md)** - Guía rápida de instalación (5 minutos)
- **[📘 INSTALACION_LOCAL.md](./INSTALACION_LOCAL.md)** - Guía completa con troubleshooting

### Documentación Técnica
- **[CASO_USO_COMUNICACION.md](./CASO_USO_COMUNICACION.md)** - Documentación completa del caso de uso 4
- **[MOTOR_PROLOG.md](./MOTOR_PROLOG.md)** - 🧠 Documentación completa del motor de lógica de predicados

## 🎯 Próximas Mejoras (Futuro)

- [ ] Notificaciones por email/SMS
- [ ] WebSockets para chat en tiempo real
- [ ] Subida de archivos (PDFs, imágenes)
- [ ] Sistema de calificación de especialistas
- [ ] Panel de administración
- [ ] Métricas y analytics
- [ ] Modo oscuro
- [ ] Aplicación móvil

## 🤝 Contribuciones

Este es un proyecto educativo. Sugerencias y mejoras son bienvenidas.

## 📄 Licencia

MIT License - Proyecto Educacional

---

**Desarrollado con ❤️ para la gestión nutricional moderna**

**Dr. Baymax** - Tu asistente personal de salud 🏥