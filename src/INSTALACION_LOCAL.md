# 🚀 Guía de Instalación y Ejecución Local - Dr. Baymax

Esta guía te permitirá ejecutar **Dr. Baymax** en tu dispositivo local para desarrollo y pruebas.

---

## 📋 Requisitos Previos

Antes de comenzar, asegúrate de tener instalado:

### 1. **Node.js** (v18 o superior)
```bash
# Verificar versión de Node.js
node --version
# Debe mostrar v18.0.0 o superior
```

**Descargar**: https://nodejs.org/

### 2. **Cuenta de Supabase** (Gratis)
- Crear cuenta en: https://supabase.com
- El tier gratuito es suficiente para desarrollo

### 3. **Git** (Para clonar el repositorio)
```bash
# Verificar instalación
git --version
```

**Descargar**: https://git-scm.com/

### 4. **Editor de Código** (Recomendado)
- Visual Studio Code: https://code.visualstudio.com/
- Alternativas: WebStorm, Sublime Text, etc.

---

## 📥 Paso 1: Clonar o Descargar el Proyecto

### Opción A: Clonar con Git
```bash
# Clonar el repositorio
git clone <URL_DEL_REPOSITORIO>

# Entrar al directorio
cd dr-baymax
```

### Opción B: Descargar ZIP
1. Descarga el proyecto como ZIP
2. Extrae el contenido en una carpeta
3. Abre la terminal en esa carpeta

---

## 🔧 Paso 2: Configurar Supabase

### 2.1. Crear Proyecto en Supabase

1. Ve a https://app.supabase.com
2. Haz clic en **"New Project"**
3. Configura:
   - **Nombre**: `dr-baymax` (o el que prefieras)
   - **Database Password**: Crea una contraseña segura (guárdala)
   - **Region**: Elige la más cercana a ti
   - **Pricing Plan**: Free
4. Espera 2-3 minutos mientras se crea el proyecto

### 2.2. Obtener Credenciales

Una vez creado el proyecto:

1. Ve a **Settings** → **API**
2. Copia y guarda:
   - **Project URL** (ejemplo: `https://xxxxx.supabase.co`)
   - **anon public** key (API Key pública)
   - **service_role** key (⚠️ **Mantener secreta**)

---

## 🔑 Paso 3: Configurar Variables de Entorno

### 3.1. Crear Archivo de Configuración Frontend

En la raíz del proyecto, crea el archivo `/utils/supabase/info.tsx` con:

```typescript
export const projectId = 'TU_PROJECT_ID'; // De tu URL: https://TU_PROJECT_ID.supabase.co
export const publicAnonKey = 'TU_ANON_KEY'; // La clave 'anon public'
```

**Ejemplo:**
```typescript
export const projectId = 'abcdefghijklmnop';
export const publicAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...';
```

### 3.2. Configurar Variables de Entorno del Backend

Las Edge Functions de Supabase ya tienen acceso a estas variables automáticamente:
- `SUPABASE_URL`
- `SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`

No necesitas configurarlas manualmente cuando despliegues a Supabase.

---

## 📦 Paso 4: Instalar Dependencias

**IMPORTANTE**: Este proyecto usa **Figma Make** que NO requiere `npm install` tradicional.

### Verificación
```bash
# Solo asegúrate de que los archivos estén en su lugar
ls -la
```

El proyecto usa **importmaps** y carga las dependencias directamente desde CDNs (esm.sh).

---

## 🚀 Paso 5: Desplegar el Backend (Edge Functions)

### 5.1. Instalar Supabase CLI

#### En macOS:
```bash
brew install supabase/tap/supabase
```

#### En Windows:
```powershell
# Con Scoop
scoop bucket add supabase https://github.com/supabase/scoop-bucket.git
scoop install supabase
```

#### En Linux:
```bash
# Con Homebrew en Linux
brew install supabase/tap/supabase
```

**Documentación oficial**: https://supabase.com/docs/guides/cli

### 5.2. Iniciar Sesión en Supabase CLI
```bash
# Autenticarse
supabase login
```

Se abrirá tu navegador para autorizar la CLI.

### 5.3. Vincular Proyecto
```bash
# Vincular con tu proyecto de Supabase
supabase link --project-ref TU_PROJECT_ID
```

Reemplaza `TU_PROJECT_ID` con el ID de tu proyecto (el que está en la URL).

### 5.4. Desplegar las Edge Functions
```bash
# Desplegar todas las funciones
supabase functions deploy make-server-3d05204c

# Si pide credenciales, usa la contraseña de la base de datos que creaste
```

**Verificar despliegue:**
1. Ve a tu proyecto en Supabase
2. **Edge Functions** → Deberías ver `make-server-3d05204c`
3. Estado: **Active** ✅

---

## 🌐 Paso 6: Ejecutar el Frontend Localmente

### Opción A: Usar un servidor HTTP local (Recomendado)

#### Con Python (Si tienes Python instalado):
```bash
# Python 3
python -m http.server 8000

# Python 2 (si no funciona el anterior)
python -m SimpleHTTPServer 8000
```

Luego abre: http://localhost:8000

#### Con Node.js (http-server):
```bash
# Instalar http-server globalmente
npm install -g http-server

# Ejecutar
http-server -p 8000
```

Luego abre: http://localhost:8000

#### Con VS Code (Live Server Extension):
1. Instala la extensión **"Live Server"** en VS Code
2. Click derecho en `index.html` → **"Open with Live Server"**
3. Se abrirá automáticamente en el navegador

### Opción B: Abrir directamente el archivo
⚠️ **No recomendado** debido a restricciones CORS

```bash
# En macOS
open index.html

# En Windows
start index.html

# En Linux
xdg-open index.html
```

---

## ✅ Paso 7: Verificar que Todo Funcione

### 7.1. Probar el Health Check del Backend

Abre en tu navegador:
```
https://TU_PROJECT_ID.supabase.co/functions/v1/make-server-3d05204c/health
```

**Respuesta esperada:**
```json
{
  "status": "ok"
}
```

### 7.2. Probar el Frontend

1. Abre http://localhost:8000 (o el puerto que elegiste)
2. Deberías ver la pantalla de bienvenida de **Dr. Baymax**
3. Haz clic en **"Soy Usuario"**
4. Intenta **crear una cuenta**

---

## 🛠️ Solución de Problemas Comunes

### ❌ Error: "Failed to fetch" al registrarse

**Causa**: Las Edge Functions no están desplegadas o hay error en las credenciales

**Solución:**
```bash
# Verificar logs de las funciones
supabase functions logs make-server-3d05204c

# Re-desplegar
supabase functions deploy make-server-3d05204c --no-verify-jwt
```

### ❌ Error: "CORS policy blocked"

**Causa**: Estás abriendo el HTML directamente desde el sistema de archivos

**Solución**: Usa un servidor HTTP local (ver Paso 6, Opción A)

### ❌ Error: "projectId is not defined"

**Causa**: No configuraste `/utils/supabase/info.tsx`

**Solución**: Verifica el Paso 3.1

### ❌ Error: "Unauthorized" al usar la app

**Causa**: Las claves de Supabase están incorrectas

**Solución**: 
1. Verifica `/utils/supabase/info.tsx`
2. Asegúrate de usar el `anon public` key, no el `service_role`

### ❌ Las funciones no se despliegan

**Causa**: Problema con Supabase CLI o permisos

**Solución:**
```bash
# Actualizar Supabase CLI
supabase update

# Verificar autenticación
supabase projects list

# Intentar con --legacy-bundle
supabase functions deploy make-server-3d05204c --legacy-bundle
```

---

## 📁 Estructura de Archivos (Referencia)

```
dr-baymax/
├── App.tsx                          # Componente principal
├── index.html                       # Punto de entrada HTML
├── components/                      # Componentes React
│   ├── Login.tsx
│   ├── Register.tsx
│   ├── Dashboard.tsx
│   ├── Profile.tsx
│   ├── MealPlanner.tsx
│   ├── RecipeGenerator.tsx
│   ├── WeeklyRecipePlan.tsx
│   ├── ContactSpecialist.tsx
│   ├── MyPlans.tsx
│   └── ui/                         # Componentes UI reutilizables
├── supabase/
│   └── functions/
│       └── server/
│           ├── index.tsx           # API REST (Edge Function)
│           ├── kv_store.tsx        # Base de datos KV
│           ├── prolog_engine.tsx   # Motor de lógica Prolog
│           └── recipe_engine.tsx   # Motor de recetas IA
├── utils/
│   └── supabase/
│       ├── client.tsx              # Cliente de Supabase
│       └── info.tsx                # ⚙️ CONFIGURAR AQUÍ
├── styles/
│   └── globals.css                 # Estilos globales
└── README.md                        # Documentación
```

---

## 🧪 Paso 8: Probar el Flujo Completo

### Test 1: Registro e Inicio de Sesión
```
✅ Crear cuenta nueva
✅ Iniciar sesión con las credenciales
```

### Test 2: Configurar Perfil
```
✅ Ingresar datos personales (peso, altura, edad)
✅ Establecer metas
✅ Agregar alergias (opcional)
✅ Guardar perfil
✅ Verificar que se calculen TMB y calorías
```

### Test 3: Generar Menú (Motor Prolog)
```
✅ Ir a "Generar Menú"
✅ Generar plan de 7 días
✅ Ver las 21 comidas
✅ Reemplazar una comida
```

### Test 4: Generar Recetas (Motor IA Propio)
```
✅ Ir a "Recetas con IA"
✅ Seleccionar tipo de comida
✅ Agregar ingredientes
✅ Generar receta
✅ Ver información nutricional
✅ Guardar en favoritos
```

### Test 5: Plan Semanal de Recetas
```
✅ Ir a "Plan Semanal"
✅ Generar 21 recetas automáticamente
✅ Ver lista de compras
✅ Regenerar una comida específica
```

### Test 6: Contactar Especialista
```
✅ Ir a "Contactar Especialista"
✅ Seleccionar tipo (Rutina/Dieta)
✅ Describir necesidad
✅ Enviar solicitud
✅ Ver en "Mis Planes"
```

---

## 🔍 Comandos Útiles

### Ver logs del backend en tiempo real:
```bash
supabase functions logs make-server-3d05204c --follow
```

### Servir Edge Functions localmente (alternativa):
```bash
# Iniciar Supabase local
supabase start

# Servir funciones localmente
supabase functions serve make-server-3d05204c
```

### Detener Supabase local:
```bash
supabase stop
```

### Ver estado del proyecto:
```bash
supabase status
```

---

## 🎓 Consejos para Desarrollo

### 1. Usar las Herramientas de Desarrollo del Navegador
- **F12** para abrir DevTools
- **Console**: Ver logs y errores
- **Network**: Ver peticiones HTTP
- **Application**: Ver LocalStorage y cookies

### 2. Ver logs del servidor
```bash
# En una terminal aparte
supabase functions logs make-server-3d05204c --follow
```

### 3. Probar endpoints manualmente con cURL
```bash
# Health check
curl https://TU_PROJECT_ID.supabase.co/functions/v1/make-server-3d05204c/health

# Crear usuario (POST)
curl -X POST https://TU_PROJECT_ID.supabase.co/functions/v1/make-server-3d05204c/signup \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer TU_ANON_KEY" \
  -d '{"email":"test@test.com","password":"Test1234!","name":"Test User"}'
```

### 4. Modificar código en tiempo real
- Los cambios en el frontend se reflejan al recargar la página
- Los cambios en el backend requieren re-desplegar:
  ```bash
  supabase functions deploy make-server-3d05204c
  ```

---

## 📊 Monitoreo y Debugging

### Ver estadísticas de Supabase:
1. Ve a tu proyecto en https://app.supabase.com
2. **Database** → Ver datos almacenados en KV Store
3. **Edge Functions** → Ver logs y métricas
4. **Auth** → Ver usuarios registrados

### Inspeccionar datos en KV Store:
```bash
# Ejecutar query SQL en Supabase Dashboard
SELECT * FROM kv_store_3d05204c WHERE key LIKE 'profile:%';
```

---

## 🔐 Seguridad - Mejores Prácticas

### ✅ DO (Hacer):
- Usa `publicAnonKey` en el frontend
- Usa `service_role_key` SOLO en el backend
- Mantén las credenciales en archivos privados
- No subas `utils/supabase/info.tsx` a repositorios públicos

### ❌ DON'T (No hacer):
- Nunca expongas `service_role_key` en el frontend
- No compartas las credenciales públicamente
- No uses el mismo proyecto para producción y desarrollo

---

## 🚀 Preparar para Producción

Cuando estés listo para compartir tu app:

### 1. Crear proyecto de producción en Supabase
- Proyecto separado del de desarrollo

### 2. Configurar dominio personalizado (opcional)
- En Supabase: Settings → Custom Domains

### 3. Habilitar autenticación por email
- Settings → Auth → Email Templates
- Configurar SMTP server

### 4. Optimizar rendimiento
- Minificar archivos JavaScript
- Comprimir imágenes
- Habilitar caching

### 5. Monitoreo
- Configurar alertas en Supabase
- Monitorear uso de recursos

---

## 📞 Soporte

### Recursos Adicionales:
- **Documentación de Supabase**: https://supabase.com/docs
- **Supabase CLI Docs**: https://supabase.com/docs/guides/cli
- **React Docs**: https://react.dev/
- **TypeScript Docs**: https://www.typescriptlang.org/docs/

### Problemas Comunes:
Consulta la sección **"Solución de Problemas Comunes"** arriba.

---

## ✅ Checklist de Instalación

Usa este checklist para verificar que completaste todos los pasos:

- [ ] Node.js v18+ instalado
- [ ] Cuenta de Supabase creada
- [ ] Proyecto de Supabase configurado
- [ ] Credenciales copiadas (URL, anon key, service role key)
- [ ] Archivo `/utils/supabase/info.tsx` creado y configurado
- [ ] Supabase CLI instalado
- [ ] Vinculado con `supabase link`
- [ ] Edge Functions desplegadas
- [ ] Health check funciona (retorna `{"status":"ok"}`)
- [ ] Servidor HTTP local ejecutándose
- [ ] Aplicación abierta en navegador (http://localhost:8000)
- [ ] Registro de usuario funciona
- [ ] Login funciona
- [ ] Perfil se guarda correctamente
- [ ] Generación de menú funciona
- [ ] Generación de recetas funciona

---

## 🎉 ¡Listo!

Si completaste todos los pasos, **Dr. Baymax** debería estar funcionando correctamente en tu dispositivo local.

**¡A probar y desarrollar! 🚀**

---

**Desarrollado con ❤️ para la gestión nutricional moderna**

**Dr. Baymax** - Tu asistente personal de salud 🏥
