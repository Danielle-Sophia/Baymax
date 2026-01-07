# ⚡ Inicio Rápido - Dr. Baymax

¿Primera vez ejecutando el proyecto? Sigue estos 5 pasos:

---

## 📋 Pre-requisitos

✅ **Node.js** v18+ o **Python** instalado  
✅ **Cuenta de Supabase** (gratis): https://supabase.com

---

## 🚀 Pasos de Instalación (5 minutos)

### 1️⃣ Configurar Supabase

1. Ve a https://app.supabase.com
2. Crea un nuevo proyecto (tier gratuito)
3. Copia estas credenciales:
   - **Project URL** → Tu URL de Supabase
   - **anon public key** → Clave pública

### 2️⃣ Configurar el Proyecto

```bash
# Copiar archivo de configuración
cp utils/supabase/info.example.tsx utils/supabase/info.tsx
```

Edita `utils/supabase/info.tsx` con tus credenciales:

```typescript
export const projectId = 'abcdefgh'; // De tu URL
export const publicAnonKey = 'eyJhbGc...'; // Tu clave pública
```

### 3️⃣ Desplegar el Backend

```bash
# Instalar Supabase CLI (solo primera vez)
# macOS/Linux:
brew install supabase/tap/supabase

# Windows (con Scoop):
scoop install supabase

# Autenticar
supabase login

# Vincular proyecto (reemplaza con tu ID)
supabase link --project-ref TU_PROJECT_ID

# Desplegar funciones
supabase functions deploy make-server-3d05204c
```

### 4️⃣ Iniciar Servidor Local

**En macOS/Linux:**
```bash
# Dar permisos de ejecución
chmod +x start-local.sh

# Ejecutar
./start-local.sh
```

**En Windows:**
```cmd
start-local.bat
```

**Manualmente (si prefieres):**
```bash
# Con Python
python -m http.server 8000

# O con Node.js
npx http-server -p 8000
```

### 5️⃣ Abrir en el Navegador

Abre: **http://localhost:8000**

---

## ✅ Verificar Instalación

### Test del Backend
Abre en tu navegador:
```
https://TU_PROJECT_ID.supabase.co/functions/v1/make-server-3d05204c/health
```

Deberías ver:
```json
{"status":"ok"}
```

### Test del Frontend
1. Abre http://localhost:8000
2. Haz clic en **"Soy Usuario"**
3. Crea una cuenta de prueba
4. Si funciona → ✅ **¡Todo listo!**

---

## 🆘 Problemas Comunes

### ❌ "Failed to fetch"
→ El backend no está desplegado. Ejecuta:
```bash
supabase functions deploy make-server-3d05204c
```

### ❌ "projectId is not defined"
→ No configuraste `utils/supabase/info.tsx`. Revisa el Paso 2.

### ❌ "CORS blocked"
→ Usa un servidor HTTP (no abras index.html directamente)

---

## 📚 Documentación Completa

Para instrucciones detalladas, consulta:
- **[INSTALACION_LOCAL.md](./INSTALACION_LOCAL.md)** - Guía completa paso a paso
- **[README.md](./README.md)** - Documentación del proyecto

---

## 🎯 Próximos Pasos

Una vez que la app funcione:

1. ✅ **Crear cuenta** → Registrarte en la app
2. ✅ **Configurar perfil** → Peso, altura, metas
3. ✅ **Generar menú** → Probar el motor Prolog (21 comidas)
4. ✅ **Generar recetas** → Probar el motor de IA (45+ recetas)
5. ✅ **Plan semanal** → Generar 21 recetas + lista de compras
6. ✅ **Contactar especialista** → Probar el sistema de mensajería

---

## 💡 Comandos Útiles

```bash
# Ver logs del backend
supabase functions logs make-server-3d05204c --follow

# Re-desplegar después de cambios
supabase functions deploy make-server-3d05204c

# Estado del proyecto
supabase status
```

---

## 🎉 ¡Listo!

Si completaste los 5 pasos, **Dr. Baymax** debería estar funcionando.

**¿Problemas?** Consulta [INSTALACION_LOCAL.md](./INSTALACION_LOCAL.md)

---

**Dr. Baymax** 🏥 - Tu asistente personal de salud
