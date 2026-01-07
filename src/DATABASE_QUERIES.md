# 🔍 Guía de Consultas y Operaciones - Dr. Baymax

## 📚 Índice

1. [Operaciones de Usuario](#operaciones-de-usuario)
2. [Operaciones de Perfil](#operaciones-de-perfil)
3. [Operaciones de Recetas](#operaciones-de-recetas)
4. [Operaciones de Planes de Comidas](#operaciones-de-planes-de-comidas)
5. [Operaciones de Especialistas](#operaciones-de-especialistas)
6. [Operaciones de Mensajes](#operaciones-de-mensajes)
7. [Consultas Avanzadas](#consultas-avanzadas)

---

## 1. Operaciones de Usuario

### 1.1 Registrar Usuario

```typescript
// Frontend
const response = await fetch(
  `https://${projectId}.supabase.co/functions/v1/make-server-3d05204c/signup`,
  {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: 'usuario@ejemplo.com',
      password: 'password123',
      name: 'Juan Pérez'
    })
  }
);

const { user, message } = await response.json();
```

```javascript
// Backend (index.tsx)
// 1. Validar datos
if (!email || !password) {
  return c.json({ error: "Email y contraseña son requeridos" }, 400);
}

// 2. Validar contraseña
if (password.length < 8) {
  return c.json({ error: "La contraseña debe tener al menos 8 caracteres" }, 400);
}

// 3. Crear usuario en Supabase Auth
const { data, error } = await supabase.auth.admin.createUser({
  email,
  password,
  user_metadata: { name: name || '' },
  email_confirm: true
});

// 4. Verificar si email ya existe
if (error?.message.includes('already registered')) {
  return c.json({ 
    error: "Este correo electrónico ya está registrado",
    code: "EMAIL_EXISTS"
  }, 400);
}

// 5. Retornar usuario creado
return c.json({ user: data.user, message: "Usuario registrado exitosamente" }, 201);
```

---

### 1.2 Iniciar Sesión

```typescript
// Frontend usando Supabase Client
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  'https://your-project.supabase.co',
  'your-anon-key'
);

const { data: { session }, error } = await supabase.auth.signInWithPassword({
  email: 'usuario@ejemplo.com',
  password: 'password123'
});

if (session) {
  const accessToken = session.access_token;
  // Guardar token para requests futuros
  localStorage.setItem('accessToken', accessToken);
}
```

---

### 1.3 Verificar Sesión Activa

```typescript
const { data: { session }, error } = await supabase.auth.getSession();

if (session) {
  console.log('Usuario autenticado:', session.user.email);
  const accessToken = session.access_token;
} else {
  console.log('No hay sesión activa');
}
```

---

## 2. Operaciones de Perfil

### 2.1 Obtener Perfil

```typescript
// Frontend
const response = await fetch(
  `https://${projectId}.supabase.co/functions/v1/make-server-3d05204c/profile`,
  {
    headers: {
      'Authorization': `Bearer ${accessToken}`
    }
  }
);

const { profile } = await response.json();
```

```javascript
// Backend KV Store
const profile = await kv.get(`profile:${user.id}`);

if (!profile) {
  return c.json({ profile: null });
}

return c.json({ profile });
```

---

### 2.2 Crear/Actualizar Perfil

```typescript
// Frontend
const profileData = {
  name: 'Juan Pérez',
  weight: 75,
  height: 175,
  age: 30,
  sex: 'male',
  activityLevel: 'moderate',
  goal: 'lose_weight',
  targetWeight: 70,
  targetDate: '2025-03-01',
  allergies: ['gluten', 'lactosa'],
  preferences: ['vegetariano']
};

const response = await fetch(
  `https://${projectId}.supabase.co/functions/v1/make-server-3d05204c/profile`,
  {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${accessToken}`
    },
    body: JSON.stringify(profileData)
  }
);

const { profile, message } = await response.json();
```

```javascript
// Backend - Cálculo de TMB
// 1. Validar campos requeridos
if (!profileData.weight || !profileData.height) {
  return c.json({ 
    error: "Por favor, completa tu peso y altura para continuar",
    fields: ["weight", "height"]
  }, 400);
}

// 2. Validar meta realista
if (profileData.targetWeight && profileData.targetDate) {
  const weeksDiff = Math.abs(
    new Date(profileData.targetDate).getTime() - new Date().getTime()
  ) / (7 * 24 * 60 * 60 * 1000);
  
  const weightChange = Math.abs(profileData.weight - profileData.targetWeight);
  const weeklyChange = weightChange / weeksDiff;
  
  if (weeklyChange > 1) {
    return c.json({
      error: "Tu meta es demasiado agresiva. Se recomienda un cambio máximo de 1 kg por semana.",
      weeklyChange: weeklyChange.toFixed(2),
      recommended: true
    }, 400);
  }
}

// 3. Validar restricciones
if (profileData.preferences && profileData.preferences.length > 3) {
  return c.json({
    error: "Demasiadas restricciones dietéticas. Máximo 3 preferencias permitidas.",
    current: profileData.preferences.length
  }, 400);
}

// 4. Calcular TMB (Mifflin-St Jeor)
let tmb = 0;
if (profileData.weight && profileData.height && profileData.age && profileData.sex) {
  if (profileData.sex === 'male') {
    tmb = (10 * profileData.weight) + (6.25 * profileData.height) - (5 * profileData.age) + 5;
  } else {
    tmb = (10 * profileData.weight) + (6.25 * profileData.height) - (5 * profileData.age) - 161;
  }

  // 5. Aplicar multiplicador de actividad
  const activityMultipliers = {
    sedentary: 1.2,
    light: 1.375,
    moderate: 1.55,
    active: 1.725,
    veryActive: 1.9
  };

  const dailyCalories = tmb * (activityMultipliers[profileData.activityLevel] || 1.2);
  profileData.tmb = Math.round(tmb);
  profileData.dailyCalories = Math.round(dailyCalories);
}

// 6. Guardar en KV Store
await kv.set(`profile:${user.id}`, profileData);

return c.json({ 
  profile: profileData,
  message: "Perfil guardado exitosamente"
});
```

---

## 3. Operaciones de Recetas

### 3.1 Generar Receta con IA

```typescript
// Frontend
const params = {
  ingredients: ['pollo', 'brócoli', 'arroz'],
  mealType: 'almuerzo',
  cookingTime: 30,
  difficulty: 'fácil',
  servings: 2
};

const response = await fetch(
  `https://${projectId}.supabase.co/functions/v1/make-server-3d05204c/recipes/generate`,
  {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${accessToken}`
    },
    body: JSON.stringify(params)
  }
);

const { recipe, success } = await response.json();
```

```javascript
// Backend - Generación de receta
// 1. Obtener perfil del usuario
const profile = await kv.get(`profile:${user.id}`);

// 2. Generar receta con motor IA
const recipe = await generarRecetaPropia({
  ingredientes: ingredients,
  tipoComida: mealType,
  tiempoPrep: cookingTime,
  dificultad: difficulty,
  porciones: servings,
  restricciones: profile?.allergies || [],
  preferencias: profile?.preferences || []
});

// 3. Validar que no contenga alergias
if (profile?.allergies) {
  const hasAllergens = recipe.ingredientes.some(ing =>
    profile.allergies.some(allergy =>
      ing.nombre.toLowerCase().includes(allergy.toLowerCase())
    )
  );

  if (hasAllergens) {
    return c.json({ 
      error: "La receta contiene ingredientes a los que eres alérgico" 
    }, 400);
  }
}

// 4. Guardar en historial
const recipeHistoryKey = `recipe_history:${user.id}`;
let recipeHistory = await kv.get(recipeHistoryKey) || [];

const savedRecipe = {
  ...recipe,
  id: `recipe_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
  generatedAt: new Date().toISOString(),
  parameters: { ingredients, mealType, cookingTime, difficulty, servings }
};

recipeHistory.unshift(savedRecipe);

// 5. Mantener solo últimas 20 recetas (FIFO)
if (recipeHistory.length > 20) {
  recipeHistory = recipeHistory.slice(0, 20);
}

await kv.set(recipeHistoryKey, recipeHistory);

return c.json({ recipe: savedRecipe, success: true });
```

---

### 3.2 Obtener Historial de Recetas

```typescript
// Frontend
const response = await fetch(
  `https://${projectId}.supabase.co/functions/v1/make-server-3d05204c/recipes/history`,
  {
    headers: {
      'Authorization': `Bearer ${accessToken}`
    }
  }
);

const { recipes } = await response.json();
```

```javascript
// Backend
const recipeHistoryKey = `recipe_history:${user.id}`;
const history = await kv.get(recipeHistoryKey);

return c.json({ recipes: history || [] });
```

---

### 3.3 Guardar Receta como Favorita

```typescript
// Frontend
const response = await fetch(
  `https://${projectId}.supabase.co/functions/v1/make-server-3d05204c/recipes/favorites`,
  {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${accessToken}`
    },
    body: JSON.stringify({ recipeId: 'recipe_1733328000000_abc123' })
  }
);

const { success } = await response.json();
```

```javascript
// Backend
const { recipeId } = await c.req.json();

const favoritesKey = `recipe_favorites:${user.id}`;
let favorites = await kv.get(favoritesKey) || [];

// Agregar solo si no existe
if (!favorites.includes(recipeId)) {
  favorites.push(recipeId);
  await kv.set(favoritesKey, favorites);
}

return c.json({ success: true });
```

---

### 3.4 Obtener Recetas Favoritas

```typescript
// Frontend
const response = await fetch(
  `https://${projectId}.supabase.co/functions/v1/make-server-3d05204c/recipes/favorites`,
  {
    headers: {
      'Authorization': `Bearer ${accessToken}`
    }
  }
);

const { recipes } = await response.json();
```

```javascript
// Backend
// 1. Obtener IDs de favoritos
const favoritesKey = `recipe_favorites:${user.id}`;
const favoriteIds = await kv.get(favoritesKey) || [];

// 2. Obtener historial completo
const recipeHistoryKey = `recipe_history:${user.id}`;
const allRecipes = await kv.get(recipeHistoryKey) || [];

// 3. Filtrar recetas favoritas
const favoriteRecipes = allRecipes.filter(recipe => 
  favoriteIds.includes(recipe.id)
);

return c.json({ recipes: favoriteRecipes });
```

---

### 3.5 Eliminar Favorito

```typescript
// Frontend
const response = await fetch(
  `https://${projectId}.supabase.co/functions/v1/make-server-3d05204c/recipes/favorites/${recipeId}`,
  {
    method: 'DELETE',
    headers: {
      'Authorization': `Bearer ${accessToken}`
    }
  }
);

const { success } = await response.json();
```

```javascript
// Backend
const favoritesKey = `recipe_favorites:${user.id}`;
let favorites = await kv.get(favoritesKey) || [];

favorites = favorites.filter(id => id !== recipeId);
await kv.set(favoritesKey, favorites);

return c.json({ success: true });
```

---

## 4. Operaciones de Planes de Comidas

### 4.1 Generar Plan de Alimentación

```typescript
// Frontend
const response = await fetch(
  `https://${projectId}.supabase.co/functions/v1/make-server-3d05204c/generate-menu`,
  {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${accessToken}`
    }
  }
);

const { menu, success } = await response.json();
```

```javascript
// Backend
// 1. Obtener perfil
const profile = await kv.get(`profile:${user.id}`);

if (!profile || !profile.tmb || !profile.dailyCalories) {
  return c.json({ 
    error: "Por favor, completa tu perfil antes de generar un plan de alimentación" 
  }, 400);
}

// 2. Generar plan con motor Prolog
const menu = generarPlanAlimentacion({
  calorias: profile.dailyCalories,
  objetivo: profile.goal || 'maintain',
  alergias: profile.allergies || [],
  preferencias: profile.preferences || [],
  diasSemana: 7
});

// 3. Guardar plan
const planKey = `meal_plan:${user.id}:${new Date().toISOString().split('T')[0]}`;
await kv.set(planKey, {
  planId: `plan_${Date.now()}`,
  userId: user.id,
  profileSnapshot: profile,
  menuSemanal: menu.menuSemanal,
  macronutrientsTotals: menu.totales,
  totalCalories: menu.caloriasTotales,
  razonamientoGeneral: menu.razonamiento,
  createdAt: new Date().toISOString(),
  expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
});

return c.json({ menu, success: true });
```

---

### 4.2 Reemplazar Comida en Plan

```typescript
// Frontend
const response = await fetch(
  `https://${projectId}.supabase.co/functions/v1/make-server-3d05204c/replace-meal`,
  {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${accessToken}`
    },
    body: JSON.stringify({
      dia: 'Lunes',
      tipoComida: 'desayuno'
    })
  }
);

const { nuevaComida, alternativas } = await response.json();
```

```javascript
// Backend
const { dia, tipoComida } = await c.req.json();

// 1. Obtener plan actual
const planKey = `meal_plan:${user.id}:${new Date().toISOString().split('T')[0]}`;
const plan = await kv.get(planKey);

if (!plan) {
  return c.json({ error: "No hay un plan de alimentación activo" }, 404);
}

// 2. Generar alternativas
const profile = plan.profileSnapshot;
const alternativas = generarAlternativas({
  tipoComida,
  caloriaObjetivo: profile.dailyCalories / 
    (tipoComida === 'desayuno' ? 4 : tipoComida === 'almuerzo' ? 2.5 : 3),
  restricciones: profile.allergies || [],
  preferencias: profile.preferences || []
});

// 3. Actualizar plan
const diaIndex = plan.menuSemanal.findIndex(d => d.dia === dia);
if (diaIndex >= 0) {
  plan.menuSemanal[diaIndex][tipoComida] = alternativas[0];
  
  // Registrar reemplazo
  if (!plan.replacements) plan.replacements = [];
  plan.replacements.push({
    dia,
    tipoComida,
    timestamp: new Date().toISOString(),
    razon: 'usuario_solicitado'
  });
  
  await kv.set(planKey, plan);
}

return c.json({ 
  nuevaComida: alternativas[0],
  alternativas: alternativas.slice(1, 4)
});
```

---

## 5. Operaciones de Especialistas

### 5.1 Registrar Especialista

```typescript
// Frontend
const response = await fetch(
  `https://${projectId}.supabase.co/functions/v1/make-server-3d05204c/specialist-signup`,
  {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: 'dr.nutriologo@ejemplo.com',
      password: 'password123',
      name: 'Dr. Carlos Ruiz',
      specialty: 'nutricion',
      professionalLicense: '12345678'
    })
  }
);

const { user, profile, message } = await response.json();
```

```javascript
// Backend
// 1. Validar campos requeridos
if (!email || !password || !name || !specialty || !professionalLicense) {
  return c.json({ 
    error: "Todos los campos son requeridos" 
  }, 400);
}

// 2. Validar cédula profesional
if (professionalLicense.length < 6) {
  return c.json({ 
    error: "La cédula profesional debe tener al menos 6 caracteres" 
  }, 400);
}

// 3. Crear usuario con rol de especialista
const { data, error } = await supabase.auth.admin.createUser({
  email,
  password,
  user_metadata: { 
    name,
    role: 'specialist' // IMPORTANTE: Marca como especialista
  },
  email_confirm: true
});

// 4. Crear perfil de especialista
const specialistProfile = {
  userId: data.user.id,
  name,
  specialty,
  professionalLicense,
  bio: '',
  certifications: [],
  yearsExperience: 0,
  availability: {},
  rating: 0,
  totalRequests: 0,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  isActive: true,
  maxRequests: 10
};

await kv.set(`specialist_profile:${data.user.id}`, specialistProfile);

return c.json({ 
  user: data.user,
  profile: specialistProfile,
  message: "Especialista registrado exitosamente"
}, 201);
```

---

### 5.2 Crear Solicitud de Asesoría

```typescript
// Frontend
const response = await fetch(
  `https://${projectId}.supabase.co/functions/v1/make-server-3d05204c/specialist-requests`,
  {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${accessToken}`
    },
    body: JSON.stringify({
      requestType: 'plan_alimentacion',
      description: 'Necesito un plan de alimentación personalizado para ganar masa muscular. Entreno 5 días a la semana.'
    })
  }
);

const { request, message } = await response.json();
```

```javascript
// Backend
const { requestType, description } = await c.req.json();

// 1. Validar tipo de solicitud
const validTypes = ['rutina_ejercicio', 'plan_alimentacion', 'asesoria_general'];
if (!validTypes.includes(requestType)) {
  return c.json({ error: "Tipo de solicitud inválido" }, 400);
}

// 2. Validar longitud de descripción
if (description.length < 50 || description.length > 1000) {
  return c.json({ 
    error: "La descripción debe tener entre 50 y 1000 caracteres",
    current: description.length
  }, 400);
}

// 3. Filtrar palabras prohibidas
if (containsForbiddenWords(description)) {
  return c.json({ 
    error: "La descripción contiene palabras no permitidas. Por favor, usa un lenguaje apropiado." 
  }, 400);
}

// 4. Verificar límite de solicitudes pendientes
const userRequestsKey = `user_requests:${user.id}`;
const userRequests = await kv.get(userRequestsKey) || [];

const pendingRequests = await Promise.all(
  userRequests.map(async reqId => await kv.get(`specialist_request:${reqId}`))
);

const activePending = pendingRequests.filter(
  req => req && (req.status === 'pending' || req.status === 'in_progress')
);

if (activePending.length >= 5) {
  return c.json({ 
    error: "Has alcanzado el límite de 5 solicitudes activas. Por favor, espera a que se completen." 
  }, 400);
}

// 5. Obtener perfil del usuario
const profile = await kv.get(`profile:${user.id}`);

// 6. Crear solicitud
const requestId = `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
const request = {
  requestId,
  userId: user.id,
  specialistId: null,
  requestType,
  description,
  status: 'pending',
  priority: 'medium',
  userProfileSnapshot: profile || {},
  createdAt: new Date().toISOString(),
  assignedAt: null,
  completedAt: null,
  metadata: {}
};

// 7. Guardar solicitud
await kv.set(`specialist_request:${requestId}`, request);

// 8. Actualizar lista de solicitudes del usuario
userRequests.push(requestId);
await kv.set(userRequestsKey, userRequests);

// 9. Intentar asignar automáticamente
await tryAssignToSpecialist(request);

return c.json({ 
  request,
  message: "Solicitud creada exitosamente. Un especialista te contactará pronto."
}, 201);
```

---

### 5.3 Obtener Solicitudes Asignadas (Especialista)

```typescript
// Frontend (Especialista)
const response = await fetch(
  `https://${projectId}.supabase.co/functions/v1/make-server-3d05204c/specialist/my-requests`,
  {
    headers: {
      'Authorization': `Bearer ${accessToken}`
    }
  }
);

const { requests } = await response.json();
```

```javascript
// Backend
// 1. Verificar que es especialista
const specialistProfile = await kv.get(`specialist_profile:${user.id}`);
if (!specialistProfile) {
  return c.json({ error: "No eres un especialista registrado" }, 403);
}

// 2. Obtener lista de solicitudes asignadas
const specialistRequestsKey = `specialist_requests:${user.id}`;
const requestIds = await kv.get(specialistRequestsKey) || [];

// 3. Cargar detalles de cada solicitud
const requests = await Promise.all(
  requestIds.map(async reqId => await kv.get(`specialist_request:${reqId}`))
);

// 4. Filtrar y ordenar
const validRequests = requests.filter(req => req !== null);
validRequests.sort((a, b) => 
  new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
);

return c.json({ requests: validRequests });
```

---

## 6. Operaciones de Mensajes

### 6.1 Enviar Mensaje en Chat

```typescript
// Frontend
const response = await fetch(
  `https://${projectId}.supabase.co/functions/v1/make-server-3d05204c/specialist-requests/${requestId}/messages`,
  {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${accessToken}`
    },
    body: JSON.stringify({
      content: 'Hola, revisé tu perfil y tengo algunas recomendaciones...'
    })
  }
);

const { message, success } = await response.json();
```

```javascript
// Backend
const { content } = await c.req.json();

// 1. Validar contenido
if (!content || content.trim().length === 0) {
  return c.json({ error: "El mensaje no puede estar vacío" }, 400);
}

if (content.length > 2000) {
  return c.json({ error: "El mensaje es demasiado largo (máx. 2000 caracteres)" }, 400);
}

// 2. Filtrar palabras prohibidas
if (containsForbiddenWords(content)) {
  return c.json({ 
    error: "El mensaje contiene palabras no permitidas",
    filtered: true
  }, 400);
}

// 3. Obtener solicitud
const request = await kv.get(`specialist_request:${requestId}`);
if (!request) {
  return c.json({ error: "Solicitud no encontrada" }, 404);
}

// 4. Verificar permisos (usuario o especialista asignado)
const isUser = request.userId === user.id;
const isAssignedSpecialist = request.specialistId === user.id;

if (!isUser && !isAssignedSpecialist) {
  return c.json({ error: "No tienes permiso para enviar mensajes en esta solicitud" }, 403);
}

// 5. Crear mensaje
const messageId = `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
const message = {
  messageId,
  requestId,
  senderId: user.id,
  senderType: isUser ? 'user' : 'specialist',
  content,
  timestamp: new Date().toISOString(),
  isFiltered: false,
  attachments: []
};

// 6. Guardar mensaje
const messagesKey = `request_messages:${requestId}`;
let messages = await kv.get(messagesKey) || [];
messages.push(message);
await kv.set(messagesKey, messages);

// 7. Actualizar estado de solicitud si es el primer mensaje del especialista
if (!isUser && request.status === 'assigned') {
  request.status = 'in_progress';
  await kv.set(`specialist_request:${requestId}`, request);
}

return c.json({ message, success: true }, 201);
```

---

### 6.2 Obtener Mensajes de una Solicitud

```typescript
// Frontend
const response = await fetch(
  `https://${projectId}.supabase.co/functions/v1/make-server-3d05204c/specialist-requests/${requestId}/messages`,
  {
    headers: {
      'Authorization': `Bearer ${accessToken}`
    }
  }
);

const { messages } = await response.json();
```

```javascript
// Backend
// 1. Obtener solicitud
const request = await kv.get(`specialist_request:${requestId}`);
if (!request) {
  return c.json({ error: "Solicitud no encontrada" }, 404);
}

// 2. Verificar permisos
const isUser = request.userId === user.id;
const isAssignedSpecialist = request.specialistId === user.id;

if (!isUser && !isAssignedSpecialist) {
  return c.json({ error: "No tienes permiso para ver estos mensajes" }, 403);
}

// 3. Obtener mensajes
const messagesKey = `request_messages:${requestId}`;
const messages = await kv.get(messagesKey) || [];

return c.json({ messages });
```

---

## 7. Consultas Avanzadas

### 7.1 Estadísticas de Usuario

```typescript
// Obtener estadísticas completas del usuario
async function getUserStats(userId: string, accessToken: string) {
  // 1. Historial de recetas
  const historyRes = await fetch(
    `https://${projectId}.supabase.co/functions/v1/make-server-3d05204c/recipes/history`,
    { headers: { 'Authorization': `Bearer ${accessToken}` } }
  );
  const { recipes: history } = await historyRes.json();

  // 2. Favoritos
  const favoritesRes = await fetch(
    `https://${projectId}.supabase.co/functions/v1/make-server-3d05204c/recipes/favorites`,
    { headers: { 'Authorization': `Bearer ${accessToken}` } }
  );
  const { recipes: favorites } = await favoritesRes.json();

  // 3. Calcular estadísticas
  const weekAgo = new Date();
  weekAgo.setDate(weekAgo.getDate() - 7);

  const weeklyRecipes = history.filter(r => 
    new Date(r.generatedAt) >= weekAgo
  );

  const recipesByMealType = history.reduce((acc, r) => {
    acc[r.mealType] = (acc[r.mealType] || 0) + 1;
    return acc;
  }, {});

  const avgDifficulty = history.reduce((sum, r) => {
    const difficultyScore = { 'fácil': 1, 'intermedio': 2, 'avanzado': 3 };
    return sum + (difficultyScore[r.dificultad] || 0);
  }, 0) / history.length;

  return {
    totalRecipes: history.length,
    totalFavorites: favorites.length,
    weeklyRecipes: weeklyRecipes.length,
    recipesByMealType,
    averageDifficulty: avgDifficulty.toFixed(1),
    mostUsedIngredients: getMostUsedIngredients(history)
  };
}

function getMostUsedIngredients(recipes: any[]) {
  const ingredientCount = {};
  
  recipes.forEach(recipe => {
    recipe.ingredientes?.forEach(ing => {
      const name = ing.nombre.toLowerCase();
      ingredientCount[name] = (ingredientCount[name] || 0) + 1;
    });
  });

  return Object.entries(ingredientCount)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10)
    .map(([name, count]) => ({ name, count }));
}
```

---

### 7.2 Búsqueda de Recetas

```typescript
// Buscar recetas en historial
function searchRecipes(recipes: any[], query: string, filters?: {
  mealType?: string;
  difficulty?: string;
  maxCalories?: number;
}) {
  let results = recipes;

  // Búsqueda por texto
  if (query) {
    const lowerQuery = query.toLowerCase();
    results = results.filter(recipe =>
      recipe.nombre.toLowerCase().includes(lowerQuery) ||
      recipe.descripcion?.toLowerCase().includes(lowerQuery) ||
      recipe.ingredientes.some(ing =>
        ing.nombre.toLowerCase().includes(lowerQuery)
      )
    );
  }

  // Filtros
  if (filters?.mealType) {
    results = results.filter(r => r.mealType === filters.mealType);
  }

  if (filters?.difficulty) {
    results = results.filter(r => r.dificultad === filters.difficulty);
  }

  if (filters?.maxCalories) {
    results = results.filter(r => r.nutricion.calorias <= filters.maxCalories);
  }

  return results;
}

// Uso
const results = searchRecipes(recipes, 'pollo', {
  mealType: 'almuerzo',
  maxCalories: 500
});
```

---

### 7.3 Análisis Nutricional Semanal

```typescript
// Analizar consumo nutricional de la semana
function analyzeWeeklyNutrition(mealPlan: any) {
  const totals = {
    calorias: 0,
    proteinas: 0,
    carbohidratos: 0,
    grasas: 0
  };

  mealPlan.menuSemanal.forEach(dia => {
    // Desayuno
    if (dia.desayuno) {
      totals.calorias += dia.desayuno.calorias || 0;
      totals.proteinas += dia.desayuno.proteinas || 0;
      totals.carbohidratos += dia.desayuno.carbohidratos || 0;
      totals.grasas += dia.desayuno.grasas || 0;
    }

    // Almuerzo
    if (dia.almuerzo) {
      totals.calorias += dia.almuerzo.calorias || 0;
      totals.proteinas += dia.almuerzo.proteinas || 0;
      totals.carbohidratos += dia.almuerzo.carbohidratos || 0;
      totals.grasas += dia.almuerzo.grasas || 0;
    }

    // Cena
    if (dia.cena) {
      totals.calorias += dia.cena.calorias || 0;
      totals.proteinas += dia.cena.proteinas || 0;
      totals.carbohidratos += dia.cena.carbohidratos || 0;
      totals.grasas += dia.cena.grasas || 0;
    }

    // Snacks
    dia.snacks?.forEach(snack => {
      totals.calorias += snack.calorias || 0;
      totals.proteinas += snack.proteinas || 0;
      totals.carbohidratos += snack.carbohidratos || 0;
      totals.grasas += snack.grasas || 0;
    });
  });

  // Promedios diarios
  const dailyAverages = {
    calorias: Math.round(totals.calorias / 7),
    proteinas: Math.round(totals.proteinas / 7),
    carbohidratos: Math.round(totals.carbohidratos / 7),
    grasas: Math.round(totals.grasas / 7)
  };

  // Distribución de macros
  const totalMacroCalories = 
    (totals.proteinas * 4) + 
    (totals.carbohidratos * 4) + 
    (totals.grasas * 9);

  const macroDistribution = {
    proteinas: Math.round((totals.proteinas * 4 / totalMacroCalories) * 100),
    carbohidratos: Math.round((totals.carbohidratos * 4 / totalMacroCalories) * 100),
    grasas: Math.round((totals.grasas * 9 / totalMacroCalories) * 100)
  };

  return {
    weeklyTotals: totals,
    dailyAverages,
    macroDistribution
  };
}
```

---

### 7.4 Exportar Datos de Usuario

```typescript
// Exportar todos los datos del usuario
async function exportUserData(userId: string, accessToken: string) {
  // Obtener todos los datos
  const [profileRes, historyRes, favoritesRes, requestsRes] = await Promise.all([
    fetch(`https://${projectId}.supabase.co/functions/v1/make-server-3d05204c/profile`, {
      headers: { 'Authorization': `Bearer ${accessToken}` }
    }),
    fetch(`https://${projectId}.supabase.co/functions/v1/make-server-3d05204c/recipes/history`, {
      headers: { 'Authorization': `Bearer ${accessToken}` }
    }),
    fetch(`https://${projectId}.supabase.co/functions/v1/make-server-3d05204c/recipes/favorites`, {
      headers: { 'Authorization': `Bearer ${accessToken}` }
    }),
    fetch(`https://${projectId}.supabase.co/functions/v1/make-server-3d05204c/user-requests`, {
      headers: { 'Authorization': `Bearer ${accessToken}` }
    })
  ]);

  const userData = {
    profile: await profileRes.json(),
    recipeHistory: await historyRes.json(),
    favorites: await favoritesRes.json(),
    requests: await requestsRes.json(),
    exportedAt: new Date().toISOString()
  };

  // Convertir a JSON
  const dataStr = JSON.stringify(userData, null, 2);
  
  // Descargar como archivo
  const blob = new Blob([dataStr], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `dr-baymax-data-${new Date().toISOString().split('T')[0]}.json`;
  a.click();
  URL.revokeObjectURL(url);

  return userData;
}
```

---

## 💡 Tips y Mejores Prácticas

### Manejo de Errores

```typescript
// Siempre envuelve las llamadas en try-catch
async function safeApiCall(url: string, options: RequestInit) {
  try {
    const response = await fetch(url, options);
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || `HTTP ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('API Error:', error);
    toast.error(error.message || 'Error en la solicitud');
    throw error;
  }
}
```

### Caché Local

```typescript
// Implementar caché simple
const cache = new Map();
const CACHE_TTL = 5 * 60 * 1000; // 5 minutos

async function getCachedData(key: string, fetcher: () => Promise<any>) {
  const cached = cache.get(key);
  
  if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
    return cached.data;
  }
  
  const data = await fetcher();
  cache.set(key, { data, timestamp: Date.now() });
  return data;
}

// Uso
const profile = await getCachedData('profile', () =>
  fetch(`${API_URL}/profile`, { headers })
    .then(res => res.json())
);
```

### Optimistic Updates

```typescript
// Actualizar UI antes de confirmar con servidor
async function toggleFavoriteOptimistic(recipeId: string) {
  // 1. Actualizar UI inmediatamente
  setFavorites(prev => 
    prev.includes(recipeId)
      ? prev.filter(id => id !== recipeId)
      : [...prev, recipeId]
  );

  // 2. Sincronizar con servidor
  try {
    const isFavorite = favorites.includes(recipeId);
    await fetch(`${API_URL}/recipes/favorites${isFavorite ? `/${recipeId}` : ''}`, {
      method: isFavorite ? 'DELETE' : 'POST',
      headers,
      body: isFavorite ? undefined : JSON.stringify({ recipeId })
    });
  } catch (error) {
    // 3. Revertir en caso de error
    setFavorites(prev => 
      prev.includes(recipeId)
        ? prev.filter(id => id !== recipeId)
        : [...prev, recipeId]
    );
    toast.error('Error al actualizar favoritos');
  }
}
```

---

**Última actualización**: 4 de Diciembre, 2024  
**Versión**: 1.0
