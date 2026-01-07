import { Hono } from "npm:hono";
import { cors } from "npm:hono/cors";
import { logger } from "npm:hono/logger";
import { createClient } from "npm:@supabase/supabase-js";
import * as kv from "./kv_store.tsx";
import { generarPlanAlimentacion, generarAlternativas, alimentosDB } from "./prolog_engine.tsx";
import { generarReceta as generarRecetaPropia, obtenerEstadisticas } from "./recipe_engine.tsx";

const app = new Hono();

// Enable logger
app.use('*', logger(console.log));

// Enable CORS for all routes and methods
app.use(
  "/*",
  cors({
    origin: "*",
    allowHeaders: ["Content-Type", "Authorization"],
    allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    exposeHeaders: ["Content-Length"],
    maxAge: 600,
  }),
);

// Health check endpoint
app.get("/make-server-3d05204c/health", (c) => {
  return c.json({ status: "ok" });
});

// Signup endpoint
app.post("/make-server-3d05204c/signup", async (c) => {
  try {
    const { email, password, name } = await c.req.json();

    if (!email || !password) {
      console.log("Signup error: Missing email or password");
      return c.json({ error: "Email y contraseña son requeridos" }, 400);
    }

    // Validate password requirements (min 8 characters)
    if (password.length < 8) {
      console.log("Signup error: Password too short");
      return c.json({ 
        error: "La contraseña debe tener al menos 8 caracteres" 
      }, 400);
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
    );

    // Create user with Supabase Auth
    const { data, error } = await supabase.auth.admin.createUser({
      email,
      password,
      user_metadata: { name: name || '' },
      // Automatically confirm the user's email since an email server hasn't been configured.
      email_confirm: true
    });

    if (error) {
      console.log(`Signup error while creating user: ${error.message}`);
      
      // Check if email already exists
      if (error.message.includes('already registered') || error.message.includes('User already registered')) {
        return c.json({ 
          error: "Este correo electrónico ya está registrado. ¿Deseas iniciar sesión?",
          code: "EMAIL_EXISTS"
        }, 400);
      }
      
      return c.json({ error: error.message }, 400);
    }

    console.log(`User created successfully: ${data.user?.id}`);
    return c.json({ 
      user: data.user,
      message: "Usuario registrado exitosamente"
    }, 201);

  } catch (error) {
    console.log(`Unexpected error during signup: ${error}`);
    return c.json({ error: "Error al registrar usuario" }, 500);
  }
});

// Get user profile
app.get("/make-server-3d05204c/profile", async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    
    if (!accessToken) {
      console.log("Profile GET error: No access token provided");
      return c.json({ error: "No autorizado" }, 401);
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
    );

    const { data: { user }, error: authError } = await supabase.auth.getUser(accessToken);
    
    if (authError || !user) {
      console.log(`Profile GET authorization error: ${authError?.message}`);
      return c.json({ error: "No autorizado" }, 401);
    }

    // Get profile from KV store
    const profile = await kv.get(`profile:${user.id}`);
    
    if (!profile) {
      console.log(`Profile not found for user: ${user.id}`);
      return c.json({ profile: null });
    }

    console.log(`Profile retrieved for user: ${user.id}, type: ${typeof profile}, keys:`, Object.keys(profile));
    return c.json({ profile });

  } catch (error) {
    console.log(`Unexpected error getting profile: ${error}`);
    return c.json({ error: "Error al obtener el perfil" }, 500);
  }
});

// Save/Update user profile
app.put("/make-server-3d05204c/profile", async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    
    if (!accessToken) {
      console.log("Profile PUT error: No access token provided");
      return c.json({ error: "No autorizado" }, 401);
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
    );

    const { data: { user }, error: authError } = await supabase.auth.getUser(accessToken);
    
    if (authError || !user) {
      console.log(`Profile PUT authorization error: ${authError?.message}`);
      return c.json({ error: "No autorizado" }, 401);
    }

    const profileData = await c.req.json();

    // Validate required fields for TMB calculation
    if (!profileData.weight || !profileData.height) {
      console.log("Profile PUT error: Missing required fields");
      return c.json({ 
        error: "Por favor, completa tu peso y altura para continuar",
        fields: ["weight", "height"]
      }, 400);
    }

    // Validate unrealistic goals
    if (profileData.goal && profileData.goalTarget && profileData.weight) {
      const weeklyLimit = 1; // kg per week
      const currentWeight = profileData.weight;
      const targetWeight = profileData.goalTarget;
      const weightDifference = Math.abs(currentWeight - targetWeight);
      
      // Validate goal matches direction
      if (profileData.goal === 'lose' && targetWeight >= currentWeight) {
        console.log("Profile PUT error: Goal mismatch - trying to lose but target is higher");
        return c.json({
          error: `Si tu objetivo es perder peso, tu meta debe ser menor a tu peso actual (${currentWeight} kg)`,
          code: "GOAL_MISMATCH"
        }, 400);
      }
      
      if (profileData.goal === 'gain' && targetWeight <= currentWeight) {
        console.log("Profile PUT error: Goal mismatch - trying to gain but target is lower");
        return c.json({
          error: `Si tu objetivo es ganar peso, tu meta debe ser mayor a tu peso actual (${currentWeight} kg)`,
          code: "GOAL_MISMATCH"
        }, 400);
      }
      
      // Validate realistic weight change (max 1 kg per week, assuming 4 weeks)
      const maxRealisticChange = weeklyLimit * 4; // 4 kg for 4 weeks
      if ((profileData.goal === 'lose' || profileData.goal === 'gain') && weightDifference > maxRealisticChange) {
        console.log(`Profile PUT warning: Unrealistic goal - trying to change ${weightDifference} kg`);
        return c.json({
          error: `El cambio de peso que planeas (${weightDifference.toFixed(1)} kg) supera el límite saludable de ${weeklyLimit} kg por semana. Te recomendamos ajustar tu meta a máximo ${maxRealisticChange} kg de diferencia o dividir tu objetivo en etapas`,
          code: "UNREALISTIC_GOAL"
        }, 400);
      }
    }

    // Calculate TMB (Basal Metabolic Rate) using Mifflin-St Jeor equation
    let tmb = 0;
    if (profileData.weight && profileData.height && profileData.age && profileData.sex) {
      if (profileData.sex === 'male') {
        tmb = (10 * profileData.weight) + (6.25 * profileData.height) - (5 * profileData.age) + 5;
      } else {
        tmb = (10 * profileData.weight) + (6.25 * profileData.height) - (5 * profileData.age) - 161;
      }

      // Apply activity level multiplier
      const activityMultipliers: Record<string, number> = {
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

    // Save to KV store (JSONB objects directly, no stringify needed)
    await kv.set(`profile:${user.id}`, profileData);
    
    console.log(`Profile saved for user: ${user.id}, data:`, JSON.stringify(profileData));
    return c.json({ 
      profile: profileData,
      message: "Perfil guardado exitosamente"
    });

  } catch (error) {
    console.log(`Unexpected error saving profile: ${error}`);
    return c.json({ error: "Error al guardar el perfil" }, 500);
  }
});

// Generate meal plan
app.post("/make-server-3d05204c/generate-menu", async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    
    if (!accessToken) {
      console.log("Generate menu error: No access token provided");
      return c.json({ error: "No autorizado" }, 401);
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
    );

    const { data: { user }, error: authError } = await supabase.auth.getUser(accessToken);
    
    if (authError || !user) {
      console.log(`Generate menu authorization error: ${authError?.message}`);
      return c.json({ error: "No autorizado" }, 401);
    }

    // Get profile
    const profileStr = await kv.get(`profile:${user.id}`);
    
    if (!profileStr) {
      console.log(`Generate menu error: Profile not found for user ${user.id}`);
      return c.json({ 
        error: "Necesitas completar tu perfil antes de generar un menú",
        code: "PROFILE_INCOMPLETE"
      }, 400);
    }

    const profile = profileStr;
    
    // Validate profile completeness
    if (!profile.weight || !profile.height || !profile.dailyCalories) {
      console.log("Generate menu error: Profile incomplete");
      return c.json({ 
        error: "Necesitas completar tu perfil antes de generar un menú",
        code: "PROFILE_INCOMPLETE"
      }, 400);
    }

    const { days } = await c.req.json();
    const numDays = days || 3;

    // Calculate calorie targets based on goal
    let targetCalories = profile.dailyCalories;
    if (profile.goal === 'lose') {
      targetCalories -= 500; // 500 calorie deficit for weight loss
    } else if (profile.goal === 'gain') {
      targetCalories += 500; // 500 calorie surplus for weight gain
    }

    // Prepare restricciones para el motor Prolog
    const restricciones = {
      alergias: profile.allergies || [],
      noDeseados: profile.unwantedFoods || []
    };

    console.log(`[PROLOG] Generando plan con motor de lógica de predicados...`);
    console.log(`[PROLOG] Días: ${numDays}, Calorías diarias: ${targetCalories}`);
    console.log(`[PROLOG] Restricciones:`, restricciones);

    // Generate meal plans usando motor de lógica de predicados (Prolog)
    const mealPlan = generarPlanAlimentacion(numDays, targetCalories, restricciones);

    if (!mealPlan || mealPlan.length === 0) {
      console.log("[PROLOG] No se pudo generar un plan viable con las restricciones dadas");
      return c.json({
        error: "No pudimos generar un menú. Tus preferencias alimenticias son muy restrictivas. Por favor, revísalas",
        code: "TOO_RESTRICTIVE"
      }, 400);
    }

    console.log(`[PROLOG] Plan generado exitosamente: ${mealPlan.length} días`);

    // Save meal plan (JSONB objects directly, no stringify needed)
    await kv.set(`mealplan:${user.id}`, {
      created: new Date().toISOString(),
      days: numDays,
      targetCalories,
      meals: mealPlan
    });

    console.log(`Meal plan generated for user: ${user.id}`);
    return c.json({ 
      mealPlan,
      targetCalories,
      message: "Menú generado exitosamente"
    });

  } catch (error) {
    console.log(`Unexpected error generating menu: ${error}`);
    return c.json({ error: "Error al generar el menú" }, 500);
  }
});

// Replace specific meal
app.post("/make-server-3d05204c/replace-meal", async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    
    if (!accessToken) {
      return c.json({ error: "No autorizado" }, 401);
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
    );

    const { data: { user }, error: authError } = await supabase.auth.getUser(accessToken);
    
    if (authError || !user) {
      return c.json({ error: "No autorizado" }, 401);
    }

    const { dayIndex, mealType, currentCalories } = await c.req.json();

    // Get profile for preferences
    const profile = await kv.get(`profile:${user.id}`) || {};

    // Preparar restricciones
    const restricciones = {
      alergias: profile.allergies || [],
      noDeseados: profile.unwantedFoods || []
    };

    // Mapear tipo de comida del frontend al formato Prolog
    const tipoProlog = mealType === 'breakfast' ? 'desayuno' : 
                       mealType === 'lunch' ? 'almuerzo' : 'cena';

    console.log(`[PROLOG] Generando alternativas para ${tipoProlog}, ${currentCalories} kcal`);

    // Generate alternative meals usando motor Prolog
    const alternatives = generarAlternativas(tipoProlog, currentCalories, restricciones, 3);

    console.log(`[PROLOG] ${alternatives.length} alternativas generadas para user: ${user.id}`);
    return c.json({ alternatives });

  } catch (error) {
    console.log(`Unexpected error replacing meal: ${error}`);
    return c.json({ error: "Error al reemplazar comida" }, 500);
  }
});

// ============================================================================
// NOTA: Las funciones de generación de menús han sido migradas al motor
// de lógica de predicados (Prolog) en prolog_engine.tsx
// 
// El motor utiliza:
// - Predicados de primer orden para definir alimentos y restricciones
// - Reglas de inferencia para selección de comidas
// - Encadenamiento hacia adelante para generar planes
// - Backtracking cuando no se pueden satisfacer restricciones
// ============================================================================

// ============================================================================
// SPECIALIST AUTHENTICATION AND PROFILE ENDPOINTS
// ============================================================================

// Specialist signup endpoint
app.post("/make-server-3d05204c/specialist-signup", async (c) => {
  try {
    const { email, password, name, specialty, professionalLicense } = await c.req.json();

    if (!email || !password || !name || !specialty || !professionalLicense) {
      console.log("Specialist signup error: Missing required fields");
      return c.json({ 
        error: "Todos los campos son requeridos (email, contraseña, nombre, especialidad, cédula profesional)" 
      }, 400);
    }

    // Validate password requirements (min 8 characters)
    if (password.length < 8) {
      console.log("Specialist signup error: Password too short");
      return c.json({ 
        error: "La contraseña debe tener al menos 8 caracteres" 
      }, 400);
    }

    // Validate professional license format (simple validation)
    if (professionalLicense.length < 6) {
      console.log("Specialist signup error: Invalid professional license");
      return c.json({ 
        error: "La cédula profesional debe tener al menos 6 caracteres" 
      }, 400);
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
    );

    // Create specialist user with Supabase Auth
    const { data, error } = await supabase.auth.admin.createUser({
      email,
      password,
      user_metadata: { 
        name,
        userType: 'specialist',
        specialty,
        professionalLicense
      },
      email_confirm: true
    });

    if (error) {
      console.log(`Specialist signup error: ${error.message}`);
      
      if (error.message.includes('already registered') || error.message.includes('User already registered')) {
        return c.json({ 
          error: "Este correo electrónico ya está registrado",
          code: "EMAIL_EXISTS"
        }, 400);
      }
      
      return c.json({ error: error.message }, 400);
    }

    // Create specialist profile
    const specialistProfile = {
      userId: data.user!.id,
      name,
      email,
      specialty, // 'nutrición' or 'entrenamiento'
      professionalLicense,
      isVerified: false, // TODO: Implement verification process
      activeRequests: 0,
      maxRequests: 10, // Maximum concurrent requests per specialist
      totalCompleted: 0,
      rating: 0,
      availability: 'available', // 'available', 'busy', 'offline'
      createdAt: new Date().toISOString()
    };

    await kv.set(`specialist_profile:${data.user!.id}`, specialistProfile);

    // Add to specialists list
    const specialistsKey = `specialists_list`;
    const existingSpecialists = await kv.get(specialistsKey);
    let specialistsList = existingSpecialists && Array.isArray(existingSpecialists) ? existingSpecialists : [];
    specialistsList.push(data.user!.id);
    await kv.set(specialistsKey, specialistsList);

    console.log(`Specialist created successfully: ${data.user?.id}`);
    return c.json({ 
      user: data.user,
      profile: specialistProfile,
      message: "Especialista registrado exitosamente"
    }, 201);

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.log(`Unexpected error during specialist signup: ${errorMessage}`);
    console.error(error);
    return c.json({ 
      error: "Error al registrar especialista",
      details: errorMessage 
    }, 500);
  }
});

// Get specialist profile
app.get("/make-server-3d05204c/specialist-profile", async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    
    if (!accessToken) {
      console.log("Specialist profile GET error: No access token provided");
      return c.json({ error: "No autorizado" }, 401);
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
    );

    const { data: { user }, error: authError } = await supabase.auth.getUser(accessToken);
    
    if (authError || !user) {
      console.log(`Specialist profile GET authorization error: ${authError?.message}`);
      return c.json({ error: "No autorizado" }, 401);
    }

    // Get specialist profile
    const profile = await kv.get(`specialist_profile:${user.id}`);
    
    if (!profile) {
      console.log(`Specialist profile not found for user: ${user.id}`);
      return c.json({ profile: null });
    }

    console.log(`Specialist profile retrieved for user: ${user.id}`);
    return c.json({ profile });

  } catch (error) {
    console.log(`Unexpected error getting specialist profile: ${error}`);
    return c.json({ error: "Error al obtener el perfil del especialista" }, 500);
  }
});

// Update specialist profile
app.put("/make-server-3d05204c/specialist-profile", async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    
    if (!accessToken) {
      console.log("Specialist profile PUT error: No access token provided");
      return c.json({ error: "No autorizado" }, 401);
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
    );

    const { data: { user }, error: authError } = await supabase.auth.getUser(accessToken);
    
    if (authError || !user) {
      console.log(`Specialist profile PUT authorization error: ${authError?.message}`);
      return c.json({ error: "No autorizado" }, 401);
    }

    const updates = await c.req.json();

    // Get existing profile
    const existingProfile = await kv.get(`specialist_profile:${user.id}`);
    if (!existingProfile) {
      return c.json({ error: "Perfil no encontrado" }, 404);
    }
    
    // Update allowed fields
    const updatedProfile = {
      ...existingProfile,
      ...updates,
      userId: existingProfile.userId, // Don't allow changing userId
      createdAt: existingProfile.createdAt // Don't allow changing createdAt
    };

    await kv.set(`specialist_profile:${user.id}`, updatedProfile);

    console.log(`Specialist profile updated for user: ${user.id}`);
    return c.json({ 
      profile: updatedProfile,
      message: "Perfil actualizado exitosamente"
    });

  } catch (error) {
    console.log(`Unexpected error updating specialist profile: ${error}`);
    return c.json({ error: "Error al actualizar el perfil" }, 500);
  }
});

// Get specialist's assigned requests
app.get("/make-server-3d05204c/specialist/my-requests", async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    
    if (!accessToken) {
      console.log("Get specialist requests error: No access token provided");
      return c.json({ error: "No autorizado" }, 401);
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
    );

    const { data: { user }, error: authError } = await supabase.auth.getUser(accessToken);
    
    if (authError || !user) {
      console.log(`Get specialist requests authorization error: ${authError?.message}`);
      return c.json({ error: "No autorizado" }, 401);
    }

    // Verify user is a specialist
    const specialistProfile = await kv.get(`specialist_profile:${user.id}`);
    if (!specialistProfile) {
      return c.json({ error: "No eres un especialista" }, 403);
    }

    // Get specialist's assigned requests
    const assignedRequestsKey = `specialist_assigned:${user.id}`;
    const requestIds = await kv.get(assignedRequestsKey);
    
    if (!requestIds || !Array.isArray(requestIds)) {
      return c.json({ requests: [] });
    }
    
    // Fetch all requests with user profiles
    const requests = [];
    for (const requestId of requestIds) {
      const request = await kv.get(`specialist_request:${requestId}`);
      if (request) {
        // Get user profile for this request
        const userProfile = await kv.get(`profile:${request.userId}`);
        
        requests.push({
          ...request,
          userProfile
        });
      }
    }

    console.log(`Retrieved ${requests.length} assigned requests for specialist ${user.id}`);
    return c.json({ requests });

  } catch (error) {
    console.log(`Unexpected error getting specialist requests: ${error}`);
    return c.json({ error: "Error al obtener las solicitudes" }, 500);
  }
});

// Helper function to find available specialist
async function findAvailableSpecialist(requestType: string): Promise<string | null> {
  try {
    // Get all specialists
    const specialistsListStr = await kv.get('specialists_list');
    if (!specialistsListStr) {
      return null;
    }

    const specialistIds = specialistsListStr;
    if (!Array.isArray(specialistIds)) {
      return null;
    }
    
    // Filter specialists by specialty and availability
    const targetSpecialty = requestType === 'rutina' ? 'entrenamiento' : 'nutrición';
    let selectedSpecialist = null;
    let minLoad = Infinity;

    for (const specialistId of specialistIds) {
      const profile = await kv.get(`specialist_profile:${specialistId}`);
      if (!profile) continue;

      // Check if specialist matches specialty and is not saturated
      if (profile.specialty === targetSpecialty && 
          profile.availability === 'available' &&
          profile.activeRequests < profile.maxRequests) {
        
        // Select specialist with least load
        if (profile.activeRequests < minLoad) {
          minLoad = profile.activeRequests;
          selectedSpecialist = specialistId;
        }
      }
    }

    // If no specialist with matching specialty, try any available specialist
    if (!selectedSpecialist) {
      for (const specialistId of specialistIds) {
        const profile = await kv.get(`specialist_profile:${specialistId}`);
        if (!profile) continue;

        if (profile.availability === 'available' &&
            profile.activeRequests < profile.maxRequests) {
          
          if (profile.activeRequests < minLoad) {
            minLoad = profile.activeRequests;
            selectedSpecialist = specialistId;
          }
        }
      }
    }

    return selectedSpecialist;
  } catch (error) {
    console.log(`Error finding available specialist: ${error}`);
    return null;
  }
}

// Helper function to assign request to specialist
async function assignRequestToSpecialist(requestId: string, specialistId: string) {
  try {
    // Add to specialist's assigned list
    const assignedKey = `specialist_assigned:${specialistId}`;
    const existingAssigned = await kv.get(assignedKey);
    const assignedList = Array.isArray(existingAssigned) ? existingAssigned : [];
    assignedList.unshift(requestId);
    await kv.set(assignedKey, assignedList);

    // Update specialist's active requests count
    const profile = await kv.get(`specialist_profile:${specialistId}`);
    if (profile) {
      profile.activeRequests = (profile.activeRequests || 0) + 1;
      
      // Update availability if reaching capacity
      if (profile.activeRequests >= profile.maxRequests) {
        profile.availability = 'busy';
      }
      
      await kv.set(`specialist_profile:${specialistId}`, profile);
    }

    console.log(`Request ${requestId} assigned to specialist ${specialistId}`);
  } catch (error) {
    console.log(`Error assigning request to specialist: ${error}`);
  }
}

// ============================================================================
// SPECIALIST COMMUNICATION ENDPOINTS
// ============================================================================

// Forbidden words filter
const FORBIDDEN_WORDS = [
  'idiota', 'estúpido', 'tonto', 'imbécil', 'pendejo', 'cabrón',
  'mierda', 'joder', 'puto', 'puta', 'coño', 'maldito'
];

function containsForbiddenWords(text: string): boolean {
  const lowerText = text.toLowerCase();
  return FORBIDDEN_WORDS.some(word => lowerText.includes(word));
}

// Create specialist request (Solicitar Rutina o Dieta)
app.post("/make-server-3d05204c/specialist-requests", async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    
    if (!accessToken) {
      console.log("Create request error: No access token provided");
      return c.json({ error: "No autorizado" }, 401);
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
    );

    const { data: { user }, error: authError } = await supabase.auth.getUser(accessToken);
    
    if (authError || !user) {
      console.log(`Create request authorization error: ${authError?.message}`);
      return c.json({ error: "No autorizado" }, 401);
    }

    // FA1: Validate profile exists and is complete
    const profileStr = await kv.get(`profile:${user.id}`);
    
    if (!profileStr) {
      console.log(`Create request error: Profile not found for user ${user.id}`);
      return c.json({ 
        error: "Debes completar tu perfil antes de contactar a un especialista",
        code: "PROFILE_INCOMPLETE",
        redirectTo: "profile"
      }, 400);
    }

    const profile = profileStr;
    
    // Validate essential profile data
    if (!profile.weight || !profile.height || !profile.age) {
      console.log("Create request error: Profile incomplete");
      return c.json({ 
        error: "Debes completar tu perfil antes de contactar a un especialista",
        code: "PROFILE_INCOMPLETE",
        redirectTo: "profile"
      }, 400);
    }

    const { type, description } = await c.req.json();

    // FA4: Validate request is not empty
    if (!description || description.trim() === '') {
      console.log("Create request error: Empty description");
      return c.json({ 
        error: "Por favor, escribe una descripción de lo que necesitas",
        code: "EMPTY_DESCRIPTION"
      }, 400);
    }

    // FA1 (Extension): Check for forbidden words
    if (containsForbiddenWords(description)) {
      console.log("Create request error: Forbidden words detected");
      return c.json({ 
        error: "Tu mensaje contiene palabras no permitidas. Por favor, usa un lenguaje respetuoso",
        code: "FORBIDDEN_WORDS"
      }, 400);
    }

    // Validate type
    if (!['rutina', 'dieta'].includes(type)) {
      return c.json({ 
        error: "Tipo de solicitud inválido. Debe ser 'rutina' o 'dieta'",
        code: "INVALID_TYPE"
      }, 400);
    }

    // Find available specialist
    const availableSpecialist = await findAvailableSpecialist(type);
    
    // Create request
    const requestId = `req_${user.id}_${Date.now()}`;
    const request = {
      id: requestId,
      userId: user.id,
      type,
      description,
      assignedTo: availableSpecialist || null,
      status: availableSpecialist ? 'asignado' : 'pendiente',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    await kv.set(`specialist_request:${requestId}`, request);
    
    // Add to user's requests list
    const userRequestsKey = `user_requests:${user.id}`;
    const existingRequests = await kv.get(userRequestsKey);
    const requestsList = Array.isArray(existingRequests) ? existingRequests : [];
    requestsList.unshift(requestId);
    await kv.set(userRequestsKey, requestsList);

    // If specialist found, assign the request
    if (availableSpecialist) {
      await assignRequestToSpecialist(requestId, availableSpecialist);
      console.log(`Request ${requestId} auto-assigned to specialist ${availableSpecialist}`);
    } else {
      console.log(`No specialist available for request ${requestId}`);
    }

    console.log(`Specialist request created: ${requestId} for user ${user.id}`);
    
    const message = availableSpecialist 
      ? "Tu solicitud ha sido asignada a un especialista. Recibirás respuesta pronto."
      : "Tu solicitud ha sido recibida. Un especialista la atenderá cuando esté disponible.";
    
    return c.json({ 
      request,
      message
    }, 201);

  } catch (error) {
    console.log(`Unexpected error creating request: ${error}`);
    return c.json({ error: "Error al crear la solicitud" }, 500);
  }
});

// Get user's specialist requests
app.get("/make-server-3d05204c/specialist-requests", async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    
    if (!accessToken) {
      console.log("Get requests error: No access token provided");
      return c.json({ error: "No autorizado" }, 401);
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
    );

    const { data: { user }, error: authError } = await supabase.auth.getUser(accessToken);
    
    if (authError || !user) {
      console.log(`Get requests authorization error: ${authError?.message}`);
      return c.json({ error: "No autorizado" }, 401);
    }

    // Get user's request IDs
    const userRequestsKey = `user_requests:${user.id}`;
    const requestIds = await kv.get(userRequestsKey);
    
    if (!requestIds || !Array.isArray(requestIds)) {
      return c.json({ requests: [] });
    }
    
    // Fetch all requests with specialist info
    const requests = [];
    for (const requestId of requestIds) {
      const request = await kv.get(`specialist_request:${requestId}`);
      if (request) {
        // Get specialist profile if assigned
        if (request.assignedTo) {
          const specialistProfile = await kv.get(`specialist_profile:${request.assignedTo}`);
          if (specialistProfile) {
            requests.push({
              ...request,
              specialistName: specialistProfile.name,
              specialistSpecialty: specialistProfile.specialty
            });
          } else {
            requests.push(request);
          }
        } else {
          requests.push(request);
        }
      }
    }

    console.log(`Retrieved ${requests.length} requests for user ${user.id}`);
    return c.json({ requests });

  } catch (error) {
    console.log(`Unexpected error getting requests: ${error}`);
    return c.json({ error: "Error al obtener las solicitudes" }, 500);
  }
});

// Get single request with plan
app.get("/make-server-3d05204c/specialist-requests/:requestId", async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    
    if (!accessToken) {
      console.log("Get request error: No access token provided");
      return c.json({ error: "No autorizado" }, 401);
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
    );

    const { data: { user }, error: authError } = await supabase.auth.getUser(accessToken);
    
    if (authError || !user) {
      console.log(`Get request authorization error: ${authError?.message}`);
      return c.json({ error: "No autorizado" }, 401);
    }

    const requestId = c.req.param('requestId');
    
    // Get request
    const requestStr = await kv.get(`specialist_request:${requestId}`);
    
    if (!requestStr) {
      return c.json({ error: "Solicitud no encontrada" }, 404);
    }

    const request = requestStr;
    
    // Verify ownership
    if (request.userId !== user.id) {
      return c.json({ error: "No autorizado" }, 401);
    }

    // Get plan if exists
    const plan = await kv.get(`specialist_plan:${requestId}`) || null;

    console.log(`Retrieved request ${requestId} for user ${user.id}`);
    return c.json({ request, plan });

  } catch (error) {
    console.log(`Unexpected error getting request: ${error}`);
    return c.json({ error: "Error al obtener la solicitud" }, 500);
  }
});

// Send message (User or Specialist)
app.post("/make-server-3d05204c/messages", async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    
    if (!accessToken) {
      console.log("Send message error: No access token provided");
      return c.json({ error: "No autorizado" }, 401);
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
    );

    const { data: { user }, error: authError } = await supabase.auth.getUser(accessToken);
    
    if (authError || !user) {
      console.log(`Send message authorization error: ${authError?.message}`);
      return c.json({ error: "No autorizado" }, 401);
    }

    const { requestId, message, senderType } = await c.req.json();

    // Validate message is not empty
    if (!message || message.trim() === '') {
      return c.json({ 
        error: "El mensaje no puede estar vacío",
        code: "EMPTY_MESSAGE"
      }, 400);
    }

    // FA1 (Extension): Check for forbidden words
    if (containsForbiddenWords(message)) {
      console.log("Send message error: Forbidden words detected");
      return c.json({ 
        error: "Tu mensaje contiene palabras no permitidas. Por favor, usa un lenguaje respetuoso",
        code: "FORBIDDEN_WORDS"
      }, 400);
    }

    // Verify request exists and user has access
    const requestStr = await kv.get(`specialist_request:${requestId}`);
    if (!requestStr) {
      return c.json({ error: "Solicitud no encontrada" }, 404);
    }

    const request = requestStr;
    if (request.userId !== user.id && senderType !== 'specialist') {
      return c.json({ error: "No autorizado" }, 401);
    }

    // Create message
    const messageId = `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const messageData = {
      id: messageId,
      requestId,
      senderId: user.id,
      senderType: senderType || 'user',
      message,
      timestamp: new Date().toISOString()
    };

    await kv.set(`message:${messageId}`, messageData);
    
    // Add to request's messages list
    const messagesKey = `request_messages:${requestId}`;
    const existingMessages = await kv.get(messagesKey);
    const messagesList = Array.isArray(existingMessages) ? existingMessages : [];
    messagesList.push(messageId);
    await kv.set(messagesKey, messagesList);

    console.log(`Message sent: ${messageId} for request ${requestId}`);
    
    return c.json({ 
      message: messageData,
      success: true
    }, 201);

  } catch (error) {
    console.log(`Unexpected error sending message: ${error}`);
    return c.json({ error: "Error al enviar el mensaje" }, 500);
  }
});

// Get messages for a request
app.get("/make-server-3d05204c/messages/:requestId", async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    
    if (!accessToken) {
      console.log("Get messages error: No access token provided");
      return c.json({ error: "No autorizado" }, 401);
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
    );

    const { data: { user }, error: authError } = await supabase.auth.getUser(accessToken);
    
    if (authError || !user) {
      console.log(`Get messages authorization error: ${authError?.message}`);
      return c.json({ error: "No autorizado" }, 401);
    }

    const requestId = c.req.param('requestId');
    
    // Verify request exists and user has access
    const requestStr = await kv.get(`specialist_request:${requestId}`);
    if (!requestStr) {
      return c.json({ error: "Solicitud no encontrada" }, 404);
    }

    const request = requestStr;
    if (request.userId !== user.id) {
      return c.json({ error: "No autorizado" }, 401);
    }

    // Get messages
    const messagesKey = `request_messages:${requestId}`;
    const messagesList = await kv.get(messagesKey);
    
    if (!messagesList || !Array.isArray(messagesList)) {
      return c.json({ messages: [] });
    }

    const messageIds = messagesList;
    
    // Fetch all messages
    const messages = [];
    for (const messageId of messageIds) {
      const message = await kv.get(`message:${messageId}`);
      if (message) {
        messages.push(message);
      }
    }

    console.log(`Retrieved ${messages.length} messages for request ${requestId}`);
    return c.json({ messages });

  } catch (error) {
    console.log(`Unexpected error getting messages: ${error}`);
    return c.json({ error: "Error al obtener los mensajes" }, 500);
  }
});

// Specialist creates a plan (simulated - in real app this would be specialist-only)
app.post("/make-server-3d05204c/specialist-plans", async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    
    if (!accessToken) {
      console.log("Create plan error: No access token provided");
      return c.json({ error: "No autorizado" }, 401);
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
    );

    const { data: { user }, error: authError } = await supabase.auth.getUser(accessToken);
    
    if (authError || !user) {
      console.log(`Create plan authorization error: ${authError?.message}`);
      return c.json({ error: "No autorizado" }, 401);
    }

    const { requestId, content, recommendations } = await c.req.json();

    // Verify request exists
    const requestStr = await kv.get(`specialist_request:${requestId}`);
    if (!requestStr) {
      return c.json({ error: "Solicitud no encontrada" }, 404);
    }

    const request = requestStr;

    // Verify specialist is authorized (either assigned or is a specialist)
    const specialistProfile = await kv.get(`specialist_profile:${user.id}`);
    if (!specialistProfile) {
      return c.json({ error: "Solo especialistas pueden crear planes" }, 403);
    }

    // Verify request is assigned to this specialist
    if (request.assignedTo && request.assignedTo !== user.id) {
      return c.json({ error: "Esta solicitud está asignada a otro especialista" }, 403);
    }

    // Create plan
    const plan = {
      id: `plan_${requestId}`,
      requestId,
      specialistId: user.id,
      content,
      recommendations: recommendations || '',
      createdAt: new Date().toISOString()
    };

    await kv.set(`specialist_plan:${requestId}`, plan);
    
    // Update request status
    request.status = 'completado';
    request.updatedAt = new Date().toISOString();
    await kv.set(`specialist_request:${requestId}`, request);

    // Decrement specialist's active requests count
    if (specialistProfile.activeRequests > 0) {
      specialistProfile.activeRequests -= 1;
      specialistProfile.totalCompleted = (specialistProfile.totalCompleted || 0) + 1;
      
      // Update availability if no longer busy
      if (specialistProfile.activeRequests < specialistProfile.maxRequests) {
        specialistProfile.availability = 'available';
      }
      
      await kv.set(`specialist_profile:${user.id}`, specialistProfile);
    }

    console.log(`Plan created for request: ${requestId}`);
    
    return c.json({ 
      plan,
      message: "Plan creado exitosamente"
    }, 201);

  } catch (error) {
    console.log(`Unexpected error creating plan: ${error}`);
    return c.json({ error: "Error al crear el plan" }, 500);
  }
});

// Update request status
app.put("/make-server-3d05204c/specialist-requests/:requestId/status", async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    
    if (!accessToken) {
      console.log("Update status error: No access token provided");
      return c.json({ error: "No autorizado" }, 401);
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
    );

    const { data: { user }, error: authError } = await supabase.auth.getUser(accessToken);
    
    if (authError || !user) {
      console.log(`Update status authorization error: ${authError?.message}`);
      return c.json({ error: "No autorizado" }, 401);
    }

    const requestId = c.req.param('requestId');
    const { status } = await c.req.json();

    // Verify request exists and user owns it
    const request = await kv.get(`specialist_request:${requestId}`);
    if (!request) {
      return c.json({ error: "Solicitud no encontrada" }, 404);
    }

    if (request.userId !== user.id) {
      return c.json({ error: "No autorizado" }, 401);
    }

    // Update status
    request.status = status;
    request.updatedAt = new Date().toISOString();
    await kv.set(`specialist_request:${requestId}`, request);

    console.log(`Request ${requestId} status updated to: ${status}`);
    
    return c.json({ 
      request,
      message: "Estado actualizado exitosamente"
    });

  } catch (error) {
    console.log(`Unexpected error updating status: ${error}`);
    return c.json({ error: "Error al actualizar el estado" }, 500);
  }
});

// Debug endpoint - Get all specialists and their assigned requests
app.get("/make-server-3d05204c/debug/specialists", async (c) => {
  try {
    const specialistsListStr = await kv.get('specialists_list');
    const specialistsList = Array.isArray(specialistsListStr) ? specialistsListStr : [];
    
    const specialists = [];
    for (const specialistId of specialistsList) {
      const profile = await kv.get(`specialist_profile:${specialistId}`);
      const assignedKey = `specialist_assigned:${specialistId}`;
      const assignedRequests = await kv.get(assignedKey);
      
      specialists.push({
        id: specialistId,
        profile,
        assignedRequests: Array.isArray(assignedRequests) ? assignedRequests : []
      });
    }
    
    return c.json({ specialists });
  } catch (error) {
    console.log(`Error in debug endpoint: ${error}`);
    return c.json({ error: String(error) }, 500);
  }
});

// Debug endpoint - Get all requests
app.get("/make-server-3d05204c/debug/requests", async (c) => {
  try {
    const allRequests = await kv.getByPrefix('specialist_request:');
    
    const requests = [];
    for (const item of allRequests) {
      requests.push(item);
    }
    
    return c.json({ requests });
  } catch (error) {
    console.log(`Error in debug endpoint: ${error}`);
    return c.json({ error: String(error) }, 500);
  }
});

// Debug endpoint - Get user profile by ID
app.get("/make-server-3d05204c/debug/profile/:userId", async (c) => {
  try {
    const userId = c.req.param('userId');
    const profile = await kv.get(`profile:${userId}`);
    
    return c.json({ 
      userId,
      profile,
      profileType: typeof profile,
      isNull: profile === null,
      keys: profile ? Object.keys(profile) : []
    });
  } catch (error) {
    console.log(`Error in debug profile endpoint: ${error}`);
    return c.json({ error: String(error) }, 500);
  }
});

// Debug endpoint - Ver base de conocimiento Prolog
app.get("/make-server-3d05204c/debug/prolog-knowledge", async (c) => {
  try {
    return c.json({
      message: "Base de conocimiento del motor Prolog",
      totalAlimentos: alimentosDB.length,
      desayunos: alimentosDB.filter(a => a.tipo === 'desayuno').length,
      almuerzos: alimentosDB.filter(a => a.tipo === 'almuerzo').length,
      cenas: alimentosDB.filter(a => a.tipo === 'cena').length,
      alimentos: alimentosDB.map(a => ({
        nombre: a.nombre,
        descripcion: a.descripcion,
        tipo: a.tipo,
        calorias: a.calorias,
        ingredientes: a.ingredientes
      }))
    });
  } catch (error) {
    console.log(`Error in debug Prolog endpoint: ${error}`);
    return c.json({ error: String(error) }, 500);
  }
});

// ============================================================================
// AI CHATBOT ENDPOINT
// ============================================================================

// Chat with AI nutritional assistant
app.post("/make-server-3d05204c/chat", async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    
    if (!accessToken) {
      console.log("Chat error: No access token provided");
      return c.json({ error: "No autorizado" }, 401);
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
    );

    const { data: { user }, error: authError } = await supabase.auth.getUser(accessToken);
    
    if (authError || !user) {
      console.log(`Chat authorization error: ${authError?.message}`);
      return c.json({ error: "No autorizado" }, 401);
    }

    const { message, history } = await c.req.json();

    if (!message || message.trim() === '') {
      return c.json({ error: "El mensaje no puede estar vacío" }, 400);
    }

    // Check for forbidden words
    if (containsForbiddenWords(message)) {
      return c.json({ 
        error: "Tu mensaje contiene palabras no permitidas. Por favor, usa un lenguaje respetuoso",
        code: "FORBIDDEN_WORDS"
      }, 400);
    }

    // Get user profile for personalization
    const profile = await kv.get(`profile:${user.id}`);
    const userMetadata = user.user_metadata;

    // Build context about the user
    let userContext = `Usuario: ${userMetadata?.name || 'Usuario'}`;
    
    if (profile) {
      userContext += `\n- Edad: ${profile.age} años, Sexo: ${profile.sex === 'male' ? 'Masculino' : 'Femenino'}`;
      userContext += `\n- Peso: ${profile.weight} kg, Altura: ${profile.height} cm`;
      userContext += `\n- Objetivo: ${profile.goal === 'lose' ? 'Perder peso' : profile.goal === 'gain' ? 'Ganar peso' : 'Mantener peso'}`;
      userContext += `\n- Meta: ${profile.goalTarget} kg`;
      userContext += `\n- TMB: ${profile.tmb} kcal, Calorías diarias: ${profile.dailyCalories} kcal`;
      userContext += `\n- Nivel de actividad: ${profile.activityLevel}`;
      
      if (profile.allergies && profile.allergies.length > 0) {
        userContext += `\n- Alergias: ${profile.allergies.join(', ')}`;
      }
      
      if (profile.unwantedFoods && profile.unwantedFoods.length > 0) {
        userContext += `\n- Alimentos no deseados: ${profile.unwantedFoods.join(', ')}`;
      }
    }

    // Build messages for OpenAI
    const messages = [
      {
        role: "system",
        content: `Eres "Dr. Baymax", un asistente nutricional experto y amigable de la aplicación de gestión nutricional "Dr. Baymax". 

Tu función es:
- Responder preguntas sobre nutrición, alimentación saludable y ejercicio
- Proporcionar consejos personalizados basados en el perfil del usuario
- Motivar y guiar al usuario en su viaje hacia sus metas de salud
- Ser empático, profesional y usar un lenguaje claro y accesible
- Dar respuestas concisas pero completas (máximo 3-4 párrafos)

IMPORTANTE:
- NO des diagnósticos médicos ni reemplaces consultas médicas profesionales
- Si el usuario pregunta algo médico serio, recomienda consultar con un profesional de la salud
- Enfócate en educación nutricional, hábitos saludables y motivación
- Usa el contexto del perfil del usuario para personalizar tus respuestas

Información del usuario:
${userContext}

Responde de manera amigable, profesional y personalizada.`
      }
    ];

    // Add chat history
    if (history && Array.isArray(history)) {
      history.forEach((msg: any) => {
        messages.push({
          role: msg.role,
          content: msg.content
        });
      });
    }

    // Add current message
    messages.push({
      role: "user",
      content: message
    });

    // Call OpenAI API
    const openaiApiKey = Deno.env.get('OPENAI_API_KEY');
    if (!openaiApiKey) {
      console.log("Chat error: OpenAI API key not configured");
      return c.json({ 
        error: "El chatbot no está configurado. Por favor, configura tu API key de OpenAI.",
        code: "API_KEY_MISSING"
      }, 500);
    }

    console.log(`[CHATBOT] Sending request to OpenAI for user ${user.id}`);

    const openaiResponse = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${openaiApiKey}`
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: messages,
        temperature: 0.7,
        max_tokens: 800
      })
    });

    if (!openaiResponse.ok) {
      const errorData = await openaiResponse.text();
      console.log(`[CHATBOT] OpenAI API error status: ${openaiResponse.status}`);
      console.log(`[CHATBOT] OpenAI API error details: ${errorData}`);
      return c.json({ 
        error: "Error al comunicarse con el asistente de IA",
        code: "OPENAI_ERROR",
        details: errorData,
        status: openaiResponse.status
      }, 500);
    }

    const data = await openaiResponse.json();
    console.log(`[CHATBOT] OpenAI response received`);
    
    if (!data.choices || !data.choices[0] || !data.choices[0].message) {
      console.log(`[CHATBOT] Invalid OpenAI response structure:`, JSON.stringify(data));
      return c.json({ 
        error: "Respuesta inválida del asistente de IA",
        code: "INVALID_RESPONSE"
      }, 500);
    }
    
    const assistantMessage = data.choices[0].message.content;

    console.log(`[CHATBOT] Response generated successfully for user ${user.id}`);

    // Store chat history
    const chatHistoryKey = `chat_history:${user.id}`;
    const existingHistory = await kv.get(chatHistoryKey) || [];
    const chatHistory = Array.isArray(existingHistory) ? existingHistory : [];
    
    chatHistory.push({
      role: 'user',
      content: message,
      timestamp: new Date().toISOString()
    });
    
    chatHistory.push({
      role: 'assistant',
      content: assistantMessage,
      timestamp: new Date().toISOString()
    });

    // Keep only last 50 messages
    if (chatHistory.length > 50) {
      chatHistory.splice(0, chatHistory.length - 50);
    }

    await kv.set(chatHistoryKey, chatHistory);

    return c.json({ 
      response: assistantMessage,
      success: true
    });

  } catch (error) {
    console.log(`Unexpected error in chat endpoint: ${error}`);
    return c.json({ error: "Error al procesar tu mensaje" }, 500);
  }
});

// Get chat history
app.get("/make-server-3d05204c/chat/history", async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    
    if (!accessToken) {
      return c.json({ error: "No autorizado" }, 401);
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
    );

    const { data: { user }, error: authError } = await supabase.auth.getUser(accessToken);
    
    if (authError || !user) {
      return c.json({ error: "No autorizado" }, 401);
    }

    const chatHistoryKey = `chat_history:${user.id}`;
    const history = await kv.get(chatHistoryKey);

    return c.json({ 
      history: history || []
    });

  } catch (error) {
    console.log(`Error getting chat history: ${error}`);
    return c.json({ error: "Error al obtener el historial" }, 500);
  }
});

// Clear chat history
app.delete("/make-server-3d05204c/chat/history", async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    
    if (!accessToken) {
      return c.json({ error: "No autorizado" }, 401);
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
    );

    const { data: { user }, error: authError } = await supabase.auth.getUser(accessToken);
    
    if (authError || !user) {
      return c.json({ error: "No autorizado" }, 401);
    }

    const chatHistoryKey = `chat_history:${user.id}`;
    await kv.del(chatHistoryKey);

    console.log(`Chat history cleared for user ${user.id}`);
    return c.json({ success: true });

  } catch (error) {
    console.log(`Error clearing chat history: ${error}`);
    return c.json({ error: "Error al borrar el historial" }, 500);
  }
});

// ============================================================================
// AI RECIPE GENERATOR ENDPOINT
// ============================================================================

// Generate AI recipe using custom recipe engine
app.post("/make-server-3d05204c/generate-recipe", async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    
    if (!accessToken) {
      console.log("Recipe generator error: No access token provided");
      return c.json({ error: "No autorizado" }, 401);
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
    );

    const { data: { user }, error: authError } = await supabase.auth.getUser(accessToken);
    
    if (authError || !user) {
      console.log(`Recipe generator authorization error: ${authError?.message}`);
      return c.json({ error: "No autorizado" }, 401);
    }

    // Get user profile
    const profileStr = await kv.get(`profile:${user.id}`);
    
    if (!profileStr) {
      console.log(`Recipe generator error: Profile not found for user ${user.id}`);
      return c.json({ 
        error: "Debes completar tu perfil antes de generar recetas",
        code: "PROFILE_INCOMPLETE"
      }, 400);
    }

    const profile = profileStr;
    
    // Get request parameters
    const { 
      ingredients = [], 
      mealType = 'almuerzo', 
      cookingTime = 'medium',
      difficulty = 'medium',
      servings = 2
    } = await c.req.json();

    console.log(`[RECIPE GENERATOR] Generating recipe for user ${user.id}`);
    console.log(`[RECIPE GENERATOR] User restrictions:`, {
      allergies: profile.allergies || [],
      unwantedFoods: profile.unwantedFoods || [],
      preferences: profile.preferences || []
    });

    // Map difficulty levels
    const difficultyMap: Record<string, string> = {
      easy: 'fácil',
      medium: 'intermedio',
      hard: 'avanzado'
    };

    // Use custom recipe engine
    let recipe;
    try {
      recipe = generarRecetaPropia({
        tipo: mealType,
        dificultad: difficultyMap[difficulty] || 'intermedio',
        tiempoCoccion: cookingTime,
        porciones: servings,
        ingredientesDisponibles: ingredients,
        restricciones: {
          alergias: profile.allergies || [],
          noDeseados: profile.unwantedFoods || [],
          preferencias: profile.preferences || []
        },
        perfil: profile
      });
    } catch (error) {
      console.log(`[RECIPE GENERATOR] Error from recipe engine: ${error}`);
      return c.json({ 
        error: error.message || "No se pudo generar una receta con las restricciones actuales. Intenta con opciones más flexibles.",
        code: "GENERATION_ERROR"
      }, 400);
    }

    // Save recipe to history
    const recipeHistoryKey = `recipe_history:${user.id}`;
    let recipeHistory = await kv.get(recipeHistoryKey) || [];
    
    const savedRecipe = {
      ...recipe,
      id: `recipe_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      generatedAt: new Date().toISOString(),
      parameters: {
        ingredients,
        mealType,
        cookingTime,
        difficulty,
        servings
      }
    };

    recipeHistory.unshift(savedRecipe);
    
    // Keep only last 20 recipes
    if (recipeHistory.length > 20) {
      recipeHistory = recipeHistory.slice(0, 20);
    }

    await kv.set(recipeHistoryKey, recipeHistory);

    console.log(`[RECIPE GENERATOR] Recipe generated successfully: ${savedRecipe.nombre}`);

    return c.json({ 
      recipe: savedRecipe,
      success: true
    });

  } catch (error) {
    console.log(`Unexpected error in recipe generator: ${error}`);
    return c.json({ error: "Error al generar la receta" }, 500);
  }
});

// Get recipe history
app.get("/make-server-3d05204c/recipes/history", async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    
    if (!accessToken) {
      return c.json({ error: "No autorizado" }, 401);
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
    );

    const { data: { user }, error: authError } = await supabase.auth.getUser(accessToken);
    
    if (authError || !user) {
      return c.json({ error: "No autorizado" }, 401);
    }

    const recipeHistoryKey = `recipe_history:${user.id}`;
    const history = await kv.get(recipeHistoryKey);

    return c.json({ 
      recipes: history || []
    });

  } catch (error) {
    console.log(`Error getting recipe history: ${error}`);
    return c.json({ error: "Error al obtener el historial" }, 500);
  }
});

// Save favorite recipe
app.post("/make-server-3d05204c/recipes/favorite", async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    
    if (!accessToken) {
      return c.json({ error: "No autorizado" }, 401);
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
    );

    const { data: { user }, error: authError } = await supabase.auth.getUser(accessToken);
    
    if (authError || !user) {
      return c.json({ error: "No autorizado" }, 401);
    }

    const { recipeId } = await c.req.json();

    const favoritesKey = `recipe_favorites:${user.id}`;
    let favorites = await kv.get(favoritesKey) || [];

    if (!favorites.includes(recipeId)) {
      favorites.push(recipeId);
      await kv.set(favoritesKey, favorites);
    }

    return c.json({ success: true });

  } catch (error) {
    console.log(`Error saving favorite recipe: ${error}`);
    return c.json({ error: "Error al guardar favorito" }, 500);
  }
});

// Get favorite recipes
app.get("/make-server-3d05204c/recipes/favorites", async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    
    if (!accessToken) {
      return c.json({ error: "No autorizado" }, 401);
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
    );

    const { data: { user }, error: authError } = await supabase.auth.getUser(accessToken);
    
    if (authError || !user) {
      return c.json({ error: "No autorizado" }, 401);
    }

    const favoritesKey = `recipe_favorites:${user.id}`;
    const favoriteIds = await kv.get(favoritesKey) || [];

    // Get all recipe IDs from history
    const historyKey = `recipe_history:${user.id}`;
    const allRecipes = await kv.get(historyKey) || [];

    // Filter only favorite recipes
    const favoriteRecipes = allRecipes.filter((recipe: any) => 
      favoriteIds.includes(recipe.id)
    );

    return c.json({ recipes: favoriteRecipes });

  } catch (error) {
    console.log(`Error getting favorite recipes: ${error}`);
    return c.json({ error: "Error al obtener favoritos" }, 500);
  }
});

// Remove from favorites
app.delete("/make-server-3d05204c/recipes/favorite/:recipeId", async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    
    if (!accessToken) {
      return c.json({ error: "No autorizado" }, 401);
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
    );

    const { data: { user }, error: authError } = await supabase.auth.getUser(accessToken);
    
    if (authError || !user) {
      return c.json({ error: "No autorizado" }, 401);
    }

    const recipeId = c.req.param('recipeId');
    const favoritesKey = `recipe_favorites:${user.id}`;
    let favorites = await kv.get(favoritesKey) || [];

    favorites = favorites.filter((id: string) => id !== recipeId);
    await kv.set(favoritesKey, favorites);

    return c.json({ success: true });

  } catch (error) {
    console.log(`Error removing favorite recipe: ${error}`);
    return c.json({ error: "Error al eliminar favorito" }, 500);
  }
});

// Get recipe engine statistics
app.get("/make-server-3d05204c/recipes/stats", (c) => {
  try {
    const stats = obtenerEstadisticas();
    return c.json({ 
      stats,
      engine: "Custom Recipe Engine v1.0",
      message: "Motor de recetas propio - 100% autónomo"
    });
  } catch (error) {
    console.log(`Error getting recipe stats: ${error}`);
    return c.json({ error: "Error al obtener estadísticas" }, 500);
  }
});

// ============================================================================
// WEEKLY RECIPE PLAN ENDPOINTS
// ============================================================================

// Generate weekly recipe plan
app.post("/make-server-3d05204c/weekly-recipe-plan", async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    
    if (!accessToken) {
      console.log("Weekly plan error: No access token provided");
      return c.json({ error: "No autorizado" }, 401);
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_ANON_KEY')!,
    );

    const { data: { user }, error: userError } = await supabase.auth.getUser(accessToken);
    
    if (userError || !user) {
      console.log(`Weekly plan authorization error: ${userError?.message}`);
      return c.json({ error: "No autorizado" }, 401);
    }

    // Get user profile
    const profile = await kv.get(`profile:${user.id}`);
    
    if (!profile) {
      console.log(`Weekly plan error: User ${user.id} has no profile`);
      return c.json({ error: "Debes completar tu perfil primero" }, 400);
    }

    console.log(`[WEEKLY PLAN] Generating plan for user ${user.id}`);

    // Map difficulty preferences
    const difficultyMap: Record<string, 'fácil' | 'intermedio' | 'avanzado'> = {
      'easy': 'fácil',
      'medium': 'intermedio',
      'hard': 'avanzado',
      'fácil': 'fácil',
      'intermedio': 'intermedio',
      'avanzado': 'avanzado',
    };

    const dias = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'];
    const planSemanal: any[] = [];

    // Generate recipes for each day
    for (const dia of dias) {
      console.log(`[WEEKLY PLAN] Generating meals for ${dia}`);
      
      // Generate breakfast
      const desayuno = generarRecetaPropia({
        tipo: 'desayuno',
        dificultad: difficultyMap['fácil'],
        tiempoCoccion: '30',
        porciones: 2,
        ingredientesDisponibles: [],
        restricciones: {
          alergias: profile.allergies || [],
          noDeseados: profile.unwantedFoods || [],
          preferencias: profile.preferences || []
        },
        perfil: profile
      });

      // Generate lunch (vary difficulty)
      const almuerzoDificultad = dias.indexOf(dia) % 2 === 0 ? 'fácil' : 'intermedio';
      const almuerzo = generarRecetaPropia({
        tipo: 'almuerzo',
        dificultad: difficultyMap[almuerzoDificultad],
        tiempoCoccion: '45',
        porciones: 2,
        ingredientesDisponibles: [],
        restricciones: {
          alergias: profile.allergies || [],
          noDeseados: profile.unwantedFoods || [],
          preferencias: profile.preferences || []
        },
        perfil: profile
      });

      // Generate dinner (lighter meals)
      const cena = generarRecetaPropia({
        tipo: 'cena',
        dificultad: difficultyMap['fácil'],
        tiempoCoccion: '30',
        porciones: 2,
        ingredientesDisponibles: [],
        restricciones: {
          alergias: profile.allergies || [],
          noDeseados: profile.unwantedFoods || [],
          preferencias: profile.preferences || []
        },
        perfil: profile
      });

      planSemanal.push({
        dia,
        desayuno,
        almuerzo,
        cena
      });

      console.log(`[WEEKLY PLAN] ✓ ${dia} complete`);
    }

    // Save weekly plan
    await kv.set(`weekly_plan:${user.id}`, {
      plan: planSemanal,
      generatedAt: new Date().toISOString(),
      userId: user.id
    });

    console.log(`[WEEKLY PLAN] Plan saved for user ${user.id}`);

    return c.json({
      plan: planSemanal,
      message: "Plan semanal generado exitosamente"
    });

  } catch (error) {
    console.log(`Error generating weekly plan: ${error}`);
    return c.json({ 
      error: "Error al generar el plan semanal. Intenta de nuevo.",
      details: error instanceof Error ? error.message : String(error)
    }, 500);
  }
});

// Regenerate a single meal
app.post("/make-server-3d05204c/regenerate-meal", async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    
    if (!accessToken) {
      console.log("Regenerate meal error: No access token provided");
      return c.json({ error: "No autorizado" }, 401);
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_ANON_KEY')!,
    );

    const { data: { user }, error: userError } = await supabase.auth.getUser(accessToken);
    
    if (userError || !user) {
      console.log(`Regenerate meal authorization error: ${userError?.message}`);
      return c.json({ error: "No autorizado" }, 401);
    }

    const { tipoComida } = await c.req.json();

    if (!tipoComida || !['desayuno', 'almuerzo', 'cena'].includes(tipoComida)) {
      return c.json({ error: "Tipo de comida inválido" }, 400);
    }

    // Get user profile
    const profile = await kv.get(`profile:${user.id}`);
    
    if (!profile) {
      return c.json({ error: "Debes completar tu perfil primero" }, 400);
    }

    console.log(`[REGENERATE] Regenerating ${tipoComida} for user ${user.id}`);

    // Map difficulty
    const difficultyMap: Record<string, 'fácil' | 'intermedio' | 'avanzado'> = {
      'easy': 'fácil',
      'medium': 'intermedio',
      'hard': 'avanzado',
      'fácil': 'fácil',
      'intermedio': 'intermedio',
      'avanzado': 'avanzado',
    };

    // Generate new recipe
    const dificultad = tipoComida === 'almuerzo' ? 'intermedio' : 'fácil';
    const tiempoCoccion = tipoComida === 'almuerzo' ? '45' : '30';

    const recipe = generarRecetaPropia({
      tipo: tipoComida,
      dificultad: difficultyMap[dificultad],
      tiempoCoccion,
      porciones: 2,
      ingredientesDisponibles: [],
      restricciones: {
        alergias: profile.allergies || [],
        noDeseados: profile.unwantedFoods || [],
        preferencias: profile.preferences || []
      },
      perfil: profile
    });

    console.log(`[REGENERATE] ✓ New ${tipoComida}: ${recipe.nombre}`);

    return c.json({
      recipe,
      message: `${tipoComida.charAt(0).toUpperCase() + tipoComida.slice(1)} regenerado exitosamente`
    });

  } catch (error) {
    console.log(`Error regenerating meal: ${error}`);
    return c.json({ 
      error: "Error al regenerar la comida. Intenta de nuevo.",
      details: error instanceof Error ? error.message : String(error)
    }, 500);
  }
});

// Get saved weekly plan
app.get("/make-server-3d05204c/weekly-plan", async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    
    if (!accessToken) {
      return c.json({ error: "No autorizado" }, 401);
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_ANON_KEY')!,
    );

    const { data: { user }, error: userError } = await supabase.auth.getUser(accessToken);
    
    if (userError || !user) {
      return c.json({ error: "No autorizado" }, 401);
    }

    const weeklyPlan = await kv.get(`weekly_plan:${user.id}`);
    
    if (!weeklyPlan) {
      return c.json({ 
        plan: null,
        message: "No hay plan semanal guardado"
      });
    }

    return c.json({
      plan: weeklyPlan.plan,
      generatedAt: weeklyPlan.generatedAt
    });

  } catch (error) {
    console.log(`Error getting weekly plan: ${error}`);
    return c.json({ error: "Error al obtener el plan semanal" }, 500);
  }
});

Deno.serve(app.fetch);