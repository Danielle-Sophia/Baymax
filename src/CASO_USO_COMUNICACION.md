# 📱 Caso de Uso: Enviar Mensaje (Usuario–Especialista)

## 🎯 Objetivo

Permitir que el Usuario tenga una comunicación directa con el Especialista para solicitar un plan personalizado, ya sea una rutina de ejercicio o una dieta personalizada, con base en los datos configurados en su perfil.

---

## 👥 Actores Principales

- **Usuario**: Persona que utiliza la aplicación
- **Especialista**: Nutriólogo o entrenador (simulado en esta implementación)

---

## ✅ Precondiciones

1. El Usuario debe haber iniciado sesión (Caso de Uso 1)
2. El Usuario debe tener su perfil configurado (Caso de Uso 2)

---

## 📋 Postcondición

El sistema registra la solicitud y muestra la respuesta o plan creado por el Especialista.

---

## 🔄 Flujo Básico: "Solicitar Rutina o Dieta"

### Paso 1: Acceso
El Usuario selecciona la opción **"Contactar Especialista"** desde el Dashboard.

### Paso 2: Selección de Tipo
El Sistema muestra dos opciones:
- 🏋️ **"Solicitar Rutina"**
- 🍽️ **"Solicitar Dieta"**

### Paso 3: Elección
El Usuario elige una de las opciones (ejemplo: "Solicitar Dieta").

### Paso 4: Formulario
El Sistema muestra un formulario con una caja de texto para comentarios o solicitudes específicas.

**Ejemplo**: *"Quiero una dieta para perder grasa sin dejar los carbohidratos"*

### Paso 5: Envío
El Usuario llena el formulario y selecciona **"Enviar solicitud"**.

### Paso 6: Procesamiento
El Sistema:
- Valida que el perfil esté completo (FA1)
- Valida que la descripción no esté vacía (FA4)
- Valida que no contenga palabras prohibidas (FA1 Extension)
- Envía la información al Especialista correspondiente

### Paso 7: Recepción por Especialista
El Especialista:
- Recibe la solicitud
- Revisa el perfil del Usuario (peso, metas, alergias, nivel de actividad, etc.)

### Paso 8: Creación del Plan
El Especialista crea un plan personalizado (dieta o rutina) y agrega recomendaciones adicionales.

**Ejemplo**: *"No olvidar hidratarte antes del entrenamiento"*

### Paso 9: Notificación
El Sistema notifica al Usuario que el plan está listo.

### Paso 10: Visualización
El Usuario visualiza su plan personalizado desde la opción **"Mis Planes"** y puede:
- Ver el plan completo
- Enviar mensajes al especialista
- Marcar como "Recibido"

---

## ⚠️ Flujos Alternativos y Excepciones

### FA1: Usuario no ha configurado su perfil

**En el paso 3**, el Sistema detecta que el Usuario no tiene configurados sus datos personales.

```
3a. El Sistema muestra el mensaje: 
    "Debes completar tu perfil antes de contactar a un especialista."

3b. El Sistema redirige al Usuario al caso de uso "Configurar Perfil".
```

**Implementación**:
- Código de error: `PROFILE_INCOMPLETE`
- Redirección automática después de 2 segundos

---

### FA2: Especialista no disponible

**En el paso 6**, si el Especialista no está en línea o disponible:

```
6a. El Sistema muestra: 
    "Tu solicitud ha sido enviada. Un especialista la responderá 
    dentro de las próximas 24 horas."

6b. El Sistema marca la solicitud como "Pendiente de respuesta".
```

**Implementación**:
- Estado por defecto: `pendiente`
- Mensaje automático mostrado al usuario

---

### FA3: Usuario cancela la solicitud

**En el paso 5**, antes de enviar, el Usuario selecciona **"Cancelar"**.

```
5a. El Sistema descarta la solicitud.

5b. Regresa al menú principal.
```

**Implementación**:
- Botón "Cancelar" disponible
- Limpia el formulario
- Vuelve a la pantalla de selección de tipo

---

### FA4: Solicitud incompleta

**En el paso 5**, el Usuario no escribió nada en el campo de solicitud.

```
5a. El Sistema muestra el mensaje: 
    "Por favor, escribe una descripción de lo que necesitas."

5b. Regresa al paso 4 para que el Usuario complete el texto.
```

**Implementación**:
- Validación en frontend y backend
- Código de error: `EMPTY_DESCRIPTION`
- Botón "Enviar" deshabilitado si está vacío

---

## 💬 Flujo Básico: "Extensión (Interacción continua)"

### Paso 1: Acceso al Chat
Si el Usuario desea hacer preguntas adicionales al Especialista:
- El Usuario abre el plan recibido desde "Mis Planes"
- Selecciona **"Enviar mensaje al especialista"**

### Paso 2: Interfaz de Chat
El Sistema muestra una interfaz de chat o mensajería.

### Paso 3: Envío de Mensaje
El Usuario escribe su mensaje.

**Ejemplo**: *"¿Puedo reemplazar el pollo por tofu?"*

### Paso 4: Respuesta
El Especialista responde directamente.

### Paso 5: Historial
El Sistema guarda la conversación en el historial del Usuario.

---

## 🚫 FA1 (Extensión): Usuario escribe palabras prohibidas

El Sistema detecta que el Usuario utiliza palabras que no son permitidas.

```
El sistema manda un mensaje: 
"Tu mensaje contiene palabras no permitidas. 
Por favor, usa un lenguaje respetuoso."
```

**Implementación**:
- Lista de palabras prohibidas en backend
- Validación al enviar solicitud o mensaje
- Código de error: `FORBIDDEN_WORDS`

**Palabras prohibidas incluidas**:
```javascript
['idiota', 'estúpido', 'tonto', 'imbécil', 'pendejo', 
 'cabrón', 'mierda', 'joder', 'puto', 'puta', 
 'coño', 'maldito']
```

---

## 🏗️ Implementación Técnica

### Backend (Edge Functions)

#### Endpoints Creados:

1. **POST `/specialist-requests`**
   - Crea una nueva solicitud
   - Valida perfil completo
   - Valida descripción no vacía
   - Filtra palabras prohibidas
   - Retorna: `request` y mensaje de confirmación

2. **GET `/specialist-requests`**
   - Obtiene todas las solicitudes del usuario
   - Retorna: array de `requests`

3. **GET `/specialist-requests/:requestId`**
   - Obtiene detalles de una solicitud específica
   - Incluye el plan si existe
   - Retorna: `request` y `plan`

4. **POST `/messages`**
   - Envía un mensaje en una conversación
   - Valida mensaje no vacío
   - Filtra palabras prohibidas
   - Retorna: `message` creado

5. **GET `/messages/:requestId`**
   - Obtiene todos los mensajes de una solicitud
   - Retorna: array de `messages`

6. **POST `/specialist-plans`**
   - Crea un plan personalizado (simulado)
   - Actualiza estado de solicitud a "completado"
   - Retorna: `plan` y mensaje

7. **PUT `/specialist-requests/:requestId/status`**
   - Actualiza el estado de una solicitud
   - Retorna: `request` actualizado

---

### Frontend (Componentes React)

#### 1. `ContactSpecialist.tsx`

**Funcionalidad**:
- Muestra opciones "Solicitar Rutina" y "Solicitar Dieta"
- Formulario para descripción de solicitud
- Validaciones FA1, FA3, FA4
- Manejo de palabras prohibidas

**Estados**:
- `selectedType`: 'rutina' | 'dieta' | null
- `description`: string
- `loading`: boolean
- `error`: string
- `success`: boolean

**Flujo**:
```
Inicio → Selección de Tipo → Formulario → Validación → Envío → Confirmación
```

---

#### 2. `MyPlans.tsx`

**Funcionalidad**:
- Lista de solicitudes del usuario
- Vista detallada de cada solicitud
- Visualización del plan personalizado
- Chat bidireccional con especialista

**Estados**:
- `requests`: Request[]
- `selectedRequest`: Request | null
- `plan`: Plan | null
- `messages`: Message[]
- `newMessage`: string

**Flujo**:
```
Lista de Solicitudes → Detalle → Ver Plan → Chat con Especialista
```

---

#### 3. `SpecialistSimulator.tsx` (Demo)

**Funcionalidad**:
- Simula panel de especialista
- Lista solicitudes pendientes
- Crea planes personalizados
- Plantillas predefinidas

**Nota**: Solo para demostración. En producción esto sería una interfaz separada con autenticación de especialistas.

---

### Dashboard

**Nuevas acciones agregadas**:

```tsx
┌─────────────────────────────────────┐
│  Dashboard - Acciones Rápidas      │
├─────────────────────────────────────┤
│  📊 Generar Menú                    │
│  💬 Contactar Especialista          │
│  📋 Mis Planes                      │
└─────────────────────────────────────┘
```

---

## 📊 Estructura de Datos

### Request (Solicitud)

```typescript
{
  id: string;              // "req_{userId}_{timestamp}"
  userId: string;          // ID del usuario
  type: 'rutina' | 'dieta';
  description: string;     // Descripción de la solicitud
  status: 'pendiente' | 'en_progreso' | 'completado';
  createdAt: string;       // ISO timestamp
  updatedAt: string;       // ISO timestamp
}
```

### Plan

```typescript
{
  id: string;              // "plan_{requestId}"
  requestId: string;       // ID de la solicitud
  specialistId: string;    // ID del especialista
  content: string;         // Contenido del plan
  recommendations: string; // Recomendaciones adicionales
  createdAt: string;       // ISO timestamp
}
```

### Message

```typescript
{
  id: string;              // "msg_{timestamp}_{random}"
  requestId: string;       // ID de la solicitud
  senderId: string;        // ID del remitente
  senderType: 'user' | 'specialist';
  message: string;         // Contenido del mensaje
  timestamp: string;       // ISO timestamp
}
```

---

## 🗄️ Almacenamiento (KV Store)

### Claves utilizadas:

```
specialist_request:{requestId}     → Request object
user_requests:{userId}             → Array of requestIds
specialist_plan:{requestId}        → Plan object
message:{messageId}                → Message object
request_messages:{requestId}       → Array of messageIds
```

---

## 🎨 Interfaz de Usuario

### Vista: Contactar Especialista

```
┌────────────────────────────────────────┐
│  Contactar Especialista                │
├────────────────────────────────────────┤
│  ┌─────────────────┐ ┌───────────────┐│
│  │  🏋️ Solicitar   │ │ 🍽️ Solicitar  ││
│  │     Rutina      │ │     Dieta     ││
│  └─────────────────┘ └───────────────┘│
└────────────────────────────────────────┘
```

### Vista: Formulario de Solicitud

```
┌────────────────────────────────────────┐
│  🍽️ Solicitar Plan de Dieta            │
├────────────────────────────────────────┤
│  Describe tu solicitud:               │
│  ┌──────────────────────────────────┐ │
│  │ Quiero una dieta para perder     │ │
│  │ grasa sin dejar carbohidratos... │ │
│  └──────────────────────────────────┘ │
│                                        │
│  [Enviar Solicitud]  [Cancelar]       │
└────────────────────────────────────────┘
```

### Vista: Mis Planes

```
┌────────────────────────────────────────┐
│  Mis Planes                            │
├────────────────────────────────────────┤
│  🍽️ Plan de Dieta     [✅ Completado]  │
│  Solicitado: 6 nov 2025                │
│  Click para ver detalles...            │
├────────────────────────────────────────┤
│  🏋️ Rutina           [🕐 Pendiente]    │
│  Solicitado: 5 nov 2025                │
└────────────────────────────────────────┘
```

### Vista: Detalle con Plan

```
┌────────────────────────────────────────┐
│  🍽️ Plan de Dieta Personalizado        │
├────────────────────────────────────────┤
│  📋 Contenido del Plan:                │
│  ┌──────────────────────────────────┐ │
│  │ DESAYUNO (7:00 AM):              │ │
│  │ - 3 huevos revueltos             │ │
│  │ - 2 rebanadas pan integral...    │ │
│  └──────────────────────────────────┘ │
│                                        │
│  💡 Recomendaciones:                  │
│  No olvidar hidratarte...             │
└────────────────────────────────────────┘
```

### Vista: Chat

```
┌────────────────────────────────────────┐
│  💬 Conversación con el especialista   │
├────────────────────────────────────────┤
│                 ┌─────────────────┐    │
│                 │ Tengo una       │    │
│                 │ pregunta...     │    │
│                 └─────────────────┘    │
│  ┌───────────────────┐                 │
│  │ Claro, dime...    │                 │
│  └───────────────────┘                 │
├────────────────────────────────────────┤
│  [Escribe tu mensaje...]    [📤 Enviar]│
└────────────────────────────────────────┘
```

---

## ✅ Validaciones Implementadas

### Frontend

1. ✅ Perfil completo antes de solicitar
2. ✅ Descripción no vacía
3. ✅ Botón deshabilitado si no hay texto
4. ✅ Mensaje de error claro
5. ✅ Redirección automática en caso de perfil incompleto

### Backend

1. ✅ Verificación de autenticación (access token)
2. ✅ Validación de perfil completo (peso, altura, edad)
3. ✅ Validación de descripción no vacía
4. ✅ Filtro de palabras prohibidas
5. ✅ Validación de tipo ('rutina' o 'dieta')
6. ✅ Verificación de permisos (usuario solo ve sus solicitudes)

---

## 🧪 Testing

### Casos de Prueba

#### Test 1: Flujo Completo Exitoso
```
1. Usuario con perfil completo
2. Selecciona "Solicitar Dieta"
3. Escribe descripción válida
4. Envía solicitud → ✅ Éxito
5. Ve solicitud en "Mis Planes"
6. Especialista crea plan
7. Usuario ve plan completo
8. Usuario envía mensaje
9. Especialista responde
```

#### Test 2: FA1 - Perfil Incompleto
```
1. Usuario sin perfil
2. Intenta contactar especialista
3. Sistema detecta perfil incompleto
4. Muestra error: "Debes completar tu perfil..."
5. Redirige a perfil → ✅ Correcto
```

#### Test 3: FA4 - Descripción Vacía
```
1. Usuario selecciona tipo
2. No escribe nada
3. Botón "Enviar" está deshabilitado
4. Intenta enviar → Error
5. Mensaje: "Por favor, escribe una descripción..."
→ ✅ Correcto
```

#### Test 4: FA1 Extension - Palabras Prohibidas
```
1. Usuario escribe: "idiota de nutriólogo"
2. Intenta enviar
3. Sistema detecta palabra prohibida
4. Mensaje: "Tu mensaje contiene palabras no permitidas..."
→ ✅ Correcto
```

#### Test 5: FA3 - Cancelar Solicitud
```
1. Usuario llena formulario
2. Click en "Cancelar"
3. Formulario se limpia
4. Vuelve a pantalla de selección
→ ✅ Correcto
```

---

## 📝 Notas de Implementación

### Estado de Solicitudes

- **pendiente**: Solicitud enviada, esperando respuesta
- **en_progreso**: Especialista trabajando en el plan
- **completado**: Plan listo y enviado al usuario

### Simulador de Especialista

El componente `SpecialistSimulator` es solo para demostración. En producción:

1. Habría una interfaz separada solo para especialistas
2. Con autenticación y roles específicos
3. Sistema de asignación de solicitudes
4. Dashboard de especialista real
5. Notificaciones por email/SMS

### Escalabilidad

Para producción, considerar:

1. **Notificaciones**: Email/SMS cuando plan está listo
2. **Tiempo real**: WebSockets para chat en vivo
3. **Archivos**: Subir PDFs, imágenes del plan
4. **Rating**: Sistema de calificación de especialistas
5. **Historial**: Búsqueda y filtros en solicitudes
6. **Analytics**: Métricas de tiempo de respuesta

---

## 🎯 Objetivos Cumplidos

✅ **Caso de Uso Principal**: Implementado completamente
✅ **Flujo Básico**: Todos los pasos funcionales
✅ **FA1**: Validación de perfil completo
✅ **FA2**: Estado "pendiente" por defecto
✅ **FA3**: Opción de cancelar
✅ **FA4**: Validación de descripción vacía
✅ **Extensión**: Sistema de chat funcional
✅ **FA1 Extension**: Filtro de palabras prohibidas
✅ **UI/UX**: Interfaz intuitiva y clara
✅ **Backend**: Todos los endpoints necesarios
✅ **Validaciones**: Frontend y backend robustas

---

## 🚀 Para Probar

1. **Registrarse** → Login → Configurar perfil
2. Ir a **"Contactar Especialista"**
3. Seleccionar tipo (Rutina o Dieta)
4. Escribir descripción
5. Enviar solicitud
6. Ir a **"🩺 Especialista (Demo)"**
7. Ver solicitud y crear plan
8. Volver a **"Mis Planes"**
9. Ver plan completo
10. Enviar mensajes en el chat

---

**¡Implementación completa del Caso de Uso 4! 🎉**
