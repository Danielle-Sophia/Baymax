# 🩺 Caso de Uso: Sistema de Especialistas

## 🎯 Objetivo

Permitir que nutriólogos y entrenadores físicos se registren en la plataforma, reciban solicitudes de usuarios de manera automática e inteligente, y proporcionen planes personalizados de dieta y ejercicio.

---

## 👥 Actores Principales

- **Especialista**: Nutriólogo o entrenador físico profesional
- **Usuario**: Persona que solicita planes personalizados
- **Sistema**: Gestor automático de asignación de solicitudes

---

## ✅ Precondiciones

1. El Especialista debe tener cédula profesional válida
2. El Sistema debe tener capacidad de almacenamiento
3. Debe existir una conexión a la base de datos

---

## 📋 Postcondición

- El Especialista está registrado y puede recibir solicitudes
- Las solicitudes se asignan automáticamente según disponibilidad
- Los usuarios reciben planes personalizados de especialistas reales

---

## 🔄 Flujo Principal: Registro de Especialista

### Paso 1: Selección de Tipo de Cuenta
El usuario accede a la aplicación y selecciona **"Soy Especialista"**

### Paso 2: Formulario de Registro
El Sistema muestra formulario solicitando:
- Nombre completo
- Correo electrónico
- Contraseña (mínimo 8 caracteres)
- Especialidad (Nutrición o Entrenamiento Físico)
- Cédula profesional (mínimo 6 caracteres)

### Paso 3: Validación de Datos
El Sistema valida:
- ✅ Todos los campos obligatorios completos
- ✅ Contraseña segura (≥8 caracteres)
- ✅ Cédula profesional válida (≥6 caracteres)
- ✅ Email no duplicado

### Paso 4: Creación de Cuenta
El Sistema:
- Crea usuario en Supabase Auth con `userType: 'specialist'`
- Genera perfil de especialista con:
  - `activeRequests: 0`
  - `maxRequests: 10`
  - `totalCompleted: 0`
  - `availability: 'available'`
  - `isVerified: false` (para futura verificación)

### Paso 5: Login Automático
El Sistema autentica al especialista y lo redirige a su dashboard

---

## 🔄 Flujo Principal: Sistema de Asignación Automática

### Cuando un Usuario Crea una Solicitud:

#### Paso 1: Análisis del Tipo de Solicitud
```
tipo = 'rutina' → especialidad = 'entrenamiento'
tipo = 'dieta' → especialidad = 'nutrición'
```

#### Paso 2: Búsqueda de Especialista Disponible

**Criterio 1: Especialista con especialidad exacta**
```javascript
specialty === targetSpecialty
availability === 'available'
activeRequests < maxRequests
```

**Selección**: Especialista con menor carga de trabajo

**Criterio 2: Si no hay coincidencia exacta**
```javascript
availability === 'available'
activeRequests < maxRequests
```

**Selección**: Cualquier especialista disponible con menor carga

#### Paso 3: Asignación

**Si se encuentra especialista:**
```
1. request.assignedTo = specialistId
2. request.status = 'asignado'
3. specialist.activeRequests += 1
4. Si activeRequests >= maxRequests:
     specialist.availability = 'busy'
```

**Si NO se encuentra especialista:**
```
1. request.assignedTo = null
2. request.status = 'pendiente'
3. Mensaje: "Se asignará cuando haya disponibilidad"
```

---

## 🎨 Flujo Principal: Dashboard del Especialista

### Vista Principal

```
┌────────────────────────────────────────────┐
│  Panel de Especialista                     │
├────────────────────────────────────────────┤
│  📊 Estadísticas:                          │
│  ┌──────┐ ┌──────┐ ┌──────┐ ┌──────┐     │
│  │  3   │ │  15  │ │  10  │ │ ✓    │     │
│  │Activ.│ │Compl.│ │Capac.│ │Disp. │     │
│  └──────┘ └──────┘ └──────┘ └──────┘     │
├────────────────────────────────────────────┤
│  Solicitudes Asignadas (3)                 │
│  ┌────────────────────────────────────┐   │
│  │ 🍽️ Plan de Dieta                   │   │
│  │ "Quiero perder grasa..."           │   │
│  │ [asignado] - 7 nov 2025            │   │
│  └────────────────────────────────────┘   │
└────────────────────────────────────────────┘
```

### Componentes del Dashboard:

1. **Estadísticas en Tiempo Real**
   - Solicitudes activas
   - Solicitudes completadas
   - Capacidad máxima
   - Estado de disponibilidad

2. **Lista de Solicitudes Asignadas**
   - Tipo de solicitud (rutina/dieta)
   - Descripción breve
   - Estado actual
   - Fecha de creación

---

## 🔄 Flujo: Atender una Solicitud

### Paso 1: Selección
El Especialista hace clic en una solicitud

### Paso 2: Vista Detallada

**Panel Izquierdo:**
- Detalles de la solicitud
- Perfil completo del usuario:
  - Edad, sexo, peso, altura
  - TMB y calorías diarias
  - Objetivo (perder/ganar/mantener)
  - Alergias
  - Alimentos no deseados
  - Nivel de actividad
- Chat con el usuario

**Panel Derecho:**
- Editor de plan
- Botón "Usar Plantilla"
- Campo de recomendaciones
- Botón "Enviar Plan"

### Paso 3: Creación del Plan

**Opción A: Usar Plantilla**
```
Click en "Usar Plantilla"
  ↓
Sistema carga plantilla según tipo
  ↓
Especialista personaliza según perfil
```

**Opción B: Crear desde cero**
```
Especialista escribe plan completo
considerando:
- Perfil del usuario
- Restricciones
- Objetivos
- Preferencias
```

### Paso 4: Añadir Recomendaciones
```
Ejemplos:
- "Hidrátate antes de entrenar"
- "Evita carbohidratos refinados"
- "Descansa 8 horas diarias"
```

### Paso 5: Envío del Plan

El Sistema:
```
1. Valida contenido no vacío
2. Guarda el plan
3. Actualiza request.status = 'completado'
4. Decrementa specialist.activeRequests
5. Incrementa specialist.totalCompleted
6. Si activeRequests < maxRequests:
     specialist.availability = 'available'
7. Notifica al usuario
```

---

## 💬 Sistema de Mensajería

### Chat Bidireccional

**Usuario → Especialista**
```
"¿Puedo reemplazar el pollo por tofu?"
```

**Especialista → Usuario**
```
"Sí, 150g de tofu firme tiene proteína similar"
```

### Características:
- ✅ Tiempo real
- ✅ Filtro de palabras prohibidas
- ✅ Historial persistente
- ✅ Visible durante creación del plan

---

## ⚖️ Sistema de Balance de Carga

### Distribución Inteligente

```
Especialista A (Nutrición):
  activeRequests: 3/10
  availability: 'available'
  
Especialista B (Nutrición):
  activeRequests: 7/10
  availability: 'available'

Nueva solicitud (Dieta)
  ↓
Asigna a Especialista A (menor carga)
```

### Estados de Disponibilidad

```
available  → activeRequests < maxRequests
busy       → activeRequests >= maxRequests
offline    → Especialista no disponible (futuro)
```

---

## 🔐 Validaciones y Seguridad

### Registro de Especialista

```javascript
✅ Email único
✅ Contraseña ≥ 8 caracteres
✅ Cédula profesional ≥ 6 caracteres
✅ Especialidad válida ('nutrición' | 'entrenamiento')
✅ Nombre completo requerido
```

### Creación de Planes

```javascript
✅ Solo especialistas autenticados
✅ Solo planes para solicitudes asignadas
✅ Contenido del plan no vacío
✅ Verificación de permisos
```

### Chat

```javascript
✅ Filtro de palabras prohibidas
✅ Mensajes no vacíos
✅ Autenticación requerida
```

---

## 📊 Estructura de Datos

### Specialist Profile

```typescript
{
  userId: string;
  name: string;
  email: string;
  specialty: 'nutrición' | 'entrenamiento';
  professionalLicense: string;
  isVerified: boolean;              // Futuro: verificación
  activeRequests: number;           // Solicitudes actuales
  maxRequests: number;              // Capacidad máxima (10)
  totalCompleted: number;           // Historial completado
  rating: number;                   // Futuro: calificaciones
  availability: 'available' | 'busy' | 'offline';
  createdAt: string;
}
```

### Request (actualizado)

```typescript
{
  id: string;
  userId: string;
  type: 'rutina' | 'dieta';
  description: string;
  assignedTo: string | null;        // ID del especialista
  status: 'pendiente' | 'asignado' | 'completado';
  createdAt: string;
  updatedAt: string;
}
```

---

## 🗄️ Almacenamiento KV Store

### Nuevas Claves

```
specialist_profile:{userId}          → Perfil del especialista
specialists_list                     → Array de IDs de especialistas
specialist_assigned:{specialistId}   → Solicitudes asignadas
```

### Claves Existentes (actualizadas)

```
specialist_request:{requestId}       → Ahora incluye assignedTo
specialist_plan:{requestId}          → Ahora verifica especialista
```

---

## 🔄 Ciclo de Vida de una Solicitud

```
1. CREACIÓN (Usuario)
   ├─ status: 'pendiente'
   └─ assignedTo: null

2. ASIGNACIÓN AUTOMÁTICA (Sistema)
   ├─ Busca especialista disponible
   ├─ status: 'asignado'
   ├─ assignedTo: specialistId
   └─ specialist.activeRequests++

3. ATENCIÓN (Especialista)
   ├─ Ve solicitud en dashboard
   ├─ Revisa perfil del usuario
   ├─ Chatean si necesario
   └─ Crea plan personalizado

4. COMPLETADO (Especialista)
   ├─ Envía plan
   ├─ status: 'completado'
   ├─ specialist.activeRequests--
   ├─ specialist.totalCompleted++
   └─ availability actualizado

5. RECEPCIÓN (Usuario)
   ├─ Ve plan en "Mis Planes"
   ├─ Puede seguir chateando
   └─ Implementa el plan
```

---

## 📱 Interfaces de Usuario

### Pantalla de Selección

```
┌─────────────────────────────────────┐
│         Dr. Baymax                  │
├─────────────────────────────────────┤
│  ┌───────────┐    ┌───────────┐    │
│  │ 👤 Usuario│    │🩺 Especial│    │
│  │           │    │   ista    │    │
│  │ ✓ Planes  │    │ ✓ Gestión │    │
│  │ ✓ Metas   │    │ ✓ Planes  │    │
│  └───────────┘    └───────────┘    │
└─────────────────────────────────────┘
```

### Login Especialista

```
┌─────────────────────────────────────┐
│   🩺 Portal de Especialistas        │
├─────────────────────────────────────┤
│  Email: [________________]          │
│  Pass:  [________________]          │
│                                     │
│  [    Iniciar Sesión    ]          │
│                                     │
│  ¿No tienes cuenta?                 │
│  Registrarse como especialista      │
└─────────────────────────────────────┘
```

### Registro Especialista

```
┌─────────────────────────────────────┐
│  Registro de Especialista           │
├─────────────────────────────────────┤
│  Nombre: [_________________]        │
│  Email:  [_________________]        │
│  Especialidad: [Nutrición ▼]       │
│  Cédula: [_________________]        │
│  Pass:   [_________________]        │
│  Confirm:[_________________]        │
│                                     │
│  [ Registrarse como Especialista ]  │
└─────────────────────────────────────┘
```

### Vista de Solicitud

```
┌─────────────────────────────────────────────────────┐
│ ← Volver                                            │
├──────────────────┬──────────────────────────────────┤
│ 📋 Solicitud     │  ✍️ Crear Plan                   │
│                  │                                  │
│ 🍽️ Plan Dieta    │  Contenido:                      │
│ 7 nov 2025       │  ┌────────────────────────┐     │
│                  │  │ PLAN PERSONALIZADO:    │     │
│ Descripción:     │  │                        │     │
│ "Quiero perder   │  │ DESAYUNO:              │     │
│  grasa..."       │  │ - 3 huevos...          │     │
│                  │  │                        │     │
├──────────────────┤  └────────────────────────┘     │
│ 👤 Perfil Usuario│                                  │
│                  │  Recomendaciones:                │
│ Edad: 28 años    │  ┌────────────────────────┐     │
│ Peso: 75 kg      │  │ Hidrátate bien...      │     │
│ TMB: 1650 kcal   │  └────────────────────────┘     │
│ Meta: ↓ Perder   │                                  │
│                  │  [Usar Plantilla]                │
│ 🚫 Alergias:     │  [   Enviar Plan   ]            │
│ - Maní           │                                  │
│                  │                                  │
├──────────────────┤                                  │
│ 💬 Chat          │                                  │
│ ┌──────────────┐ │                                  │
│ │ Usuario:     │ │                                  │
│ │ "¿Tofu?"     │ │                                  │
│ │              │ │                                  │
│ │      Tú:     │ │                                  │
│ │    "Sí..."   │ │                                  │
│ └──────────────┘ │                                  │
│ [Mensaje...]  📤 │                                  │
└──────────────────┴──────────────────────────────────┘
```

---

## 🧪 Casos de Prueba

### Test 1: Registro Exitoso de Especialista

```
1. Seleccionar "Soy Especialista"
2. Llenar formulario completo
3. Cédula: "12345678"
4. Especialidad: "Nutrición"
5. Enviar → ✅ Cuenta creada
6. Redirige a dashboard
7. Ver stats: 0 activas, 0 completadas
```

### Test 2: Asignación Automática

```
Estado inicial:
- Especialista A (Nutrición): 3/10 solicitudes
- Especialista B (Nutrición): 7/10 solicitudes

Usuario crea solicitud de dieta
  ↓
Sistema asigna a Especialista A (menor carga)
  ↓
Especialista A ve solicitud en dashboard
→ ✅ Correcto
```

### Test 3: Saturación de Especialista

```
Especialista con 10/10 solicitudes activas
  ↓
availability cambia a 'busy'
  ↓
Nueva solicitud llega
  ↓
Se asigna a otro especialista disponible
→ ✅ Correcto
```

### Test 4: Flujo Completo

```
1. Especialista registrado (Nutrición)
2. Usuario solicita dieta
3. Sistema asigna automáticamente
4. Especialista ve solicitud
5. Revisa perfil del usuario
6. Usa plantilla
7. Personaliza según alergias
8. Añade recomendaciones
9. Envía plan
10. activeRequests decrementa
11. totalCompleted incrementa
12. Usuario ve plan completo
→ ✅ Todo funciona
```

### Test 5: Sin Especialistas Disponibles

```
Todos los especialistas busy
  ↓
Usuario crea solicitud
  ↓
status: 'pendiente'
assignedTo: null
  ↓
Mensaje: "Se asignará cuando haya disponibilidad"
  ↓
Cuando especialista termina plan:
  - availability → 'available'
  - Siguiente solicitud pendiente se asigna
→ ✅ Correcto
```

---

## 🔒 Seguridad Implementada

### Nivel de Autenticación

```javascript
1. Login requiere email + contraseña
2. Token JWT en Authorization header
3. Verificación de userType === 'specialist'
4. Supabase Service Role Key en backend
```

### Nivel de Autorización

```javascript
1. Solo especialistas ven dashboard de especialista
2. Solo pueden crear planes para solicitudes asignadas
3. Verificación de assignedTo === specialistId
4. Usuarios normales no acceden a endpoints de especialista
```

### Validación de Datos

```javascript
✅ Cédula profesional mínimo 6 caracteres
✅ Especialidad solo valores válidos
✅ Email único en sistema
✅ Contraseña segura
✅ Plan no vacío
```

---

## 📈 Métricas y Estadísticas

### Para Especialistas

- **Activas**: Solicitudes actualmente asignadas
- **Completadas**: Total de planes enviados
- **Capacidad**: Máximo de solicitudes simultáneas (10)
- **Disponibilidad**: Estado actual (disponible/ocupado)

### Para el Sistema (Futuro)

- Tiempo promedio de respuesta
- Tasa de satisfacción de usuarios
- Especialistas más activos
- Distribución de carga

---

## 🚀 Características Futuras

### Verificación de Cédula

```
1. Especialista sube foto de cédula
2. Admin verifica autenticidad
3. isVerified cambia a true
4. Badge de verificación en perfil
```

### Sistema de Calificaciones

```
Usuario califica especialista (1-5 estrellas)
  ↓
specialist.rating actualizado
  ↓
Especialistas con mejor rating priorizados
```

### Notificaciones

```
- Email cuando se asigna solicitud
- SMS para planes listos
- Push notifications en app
```

### Horarios de Disponibilidad

```
Especialista configura:
- Lunes-Viernes: 9am - 6pm
- Sábado: 9am - 2pm
- Domingo: No disponible

Sistema solo asigna en horarios activos
```

---

## 📝 Endpoints del Backend

### Autenticación de Especialistas

```
POST /specialist-signup
- Crea cuenta de especialista
- Requiere: email, password, name, specialty, professionalLicense
- Retorna: user, profile

GET /specialist-profile
- Obtiene perfil del especialista
- Requiere: Authorization header
- Retorna: profile

PUT /specialist-profile
- Actualiza perfil
- Requiere: Authorization header
- Retorna: updated profile
```

### Gestión de Solicitudes

```
GET /specialist/my-requests
- Lista solicitudes asignadas
- Requiere: Authorization header (especialista)
- Retorna: requests[] con userProfile incluido

POST /specialist-plans
- Crea plan para solicitud
- Requiere: Authorization (especialista), requestId, content
- Verifica: assignedTo === specialistId
- Actualiza: activeRequests, totalCompleted, availability
- Retorna: plan
```

---

## ✅ Checklist de Implementación

### Backend
- ✅ POST /specialist-signup
- ✅ GET /specialist-profile
- ✅ PUT /specialist-profile
- ✅ GET /specialist/my-requests
- ✅ findAvailableSpecialist()
- ✅ assignRequestToSpecialist()
- ✅ Auto-asignación en POST /specialist-requests
- ✅ Actualización de carga en POST /specialist-plans

### Frontend
- ✅ SpecialistRegister.tsx
- ✅ SpecialistLogin.tsx
- ✅ SpecialistDashboard.tsx
- ✅ Sistema de selección de tipo de usuario
- ✅ App.tsx con manejo dual (user/specialist)
- ✅ Navegación separada para especialistas

### Features
- ✅ Registro con cédula profesional
- ✅ Asignación automática inteligente
- ✅ Balance de carga entre especialistas
- ✅ Dashboard con estadísticas
- ✅ Vista detallada de solicitudes
- ✅ Chat bidireccional
- ✅ Plantillas de planes
- ✅ Sistema de verificación de permisos

---

## 🎯 Objetivos Cumplidos

✅ **Registro de especialistas** con validación de cédula  
✅ **Login separado** para especialistas  
✅ **Sistema de asignación automática** inteligente  
✅ **Balance de carga** entre especialistas  
✅ **Dashboard completo** con estadísticas en tiempo real  
✅ **Vista detallada** con perfil completo del usuario  
✅ **Chat integrado** usuario-especialista  
✅ **Creación de planes** con plantillas  
✅ **Seguridad robusta** con verificación de permisos  
✅ **UI/UX profesional** para especialistas  

---

**¡Sistema completo de especialistas implementado! 🎉**
