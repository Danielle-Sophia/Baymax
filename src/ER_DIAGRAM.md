# 📐 Diagramas Entidad-Relación - Dr. Baymax

## Diagrama ER Principal (Mermaid)

```mermaid
erDiagram
    USER ||--o| PROFILE : "tiene"
    USER ||--o{ MEAL_PLAN : "genera"
    USER ||--o{ RECIPE : "crea"
    USER ||--o{ RECIPE_FAVORITE : "guarda"
    RECIPE ||--o{ RECIPE_FAVORITE : "favorito_de"
    USER ||--o{ SPECIALIST_REQUEST : "solicita"
    SPECIALIST ||--o| SPECIALIST_PROFILE : "tiene"
    SPECIALIST ||--o{ SPECIALIST_REQUEST : "atiende"
    SPECIALIST_REQUEST ||--o{ MESSAGE : "contiene"
    MEAL_PLAN ||--|{ MEAL_ITEM : "incluye"
    PROFILE ||--o| NUTRITION_GOAL : "define"
    
    USER {
        uuid id PK
        string email UK
        string password_hash
        timestamp created_at
        jsonb user_metadata
    }
    
    PROFILE {
        uuid userId FK
        float weight
        float height
        int age
        enum sex
        enum activityLevel
        enum goal
        float targetWeight
        date targetDate
        array allergies
        array preferences
        float tmb "CALCULATED"
        float dailyCalories "CALCULATED"
        timestamp createdAt
        timestamp updatedAt
    }
    
    NUTRITION_GOAL {
        enum goalType
        float targetWeight
        date targetDate
        float weeklyChange
        boolean isRealistic
        array warnings
    }
    
    MEAL_PLAN {
        string planId PK
        uuid userId FK
        object profileSnapshot
        array menuSemanal
        object macronutrientsTotals
        float totalCalories
        string razonamientoGeneral
        timestamp createdAt
        timestamp expiresAt
        array replacements
    }
    
    MEAL_ITEM {
        string nombre
        array ingredientes
        string preparacion
        float calorias
        float proteinas
        float carbohidratos
        float grasas
        string razonamiento
        array alternativas
    }
    
    RECIPE {
        string id PK
        uuid userId FK
        string nombre
        string descripcion
        array ingredientes
        array pasos
        int tiempoPreparacion
        enum dificultad
        int porciones
        object nutricion
        string consejos
        array categorias
        enum mealType
        timestamp generatedAt
        object parameters
    }
    
    RECIPE_FAVORITE {
        uuid userId FK
        array recipeIds FK
    }
    
    SPECIALIST {
        uuid id PK
        string email UK
        string password_hash
        timestamp created_at
        jsonb user_metadata "role:specialist"
    }
    
    SPECIALIST_PROFILE {
        uuid userId FK
        string name
        enum specialty
        string professionalLicense UK
        string bio
        array certifications
        int yearsExperience
        object availability
        float rating
        int totalRequests
        timestamp createdAt
        timestamp updatedAt
        boolean isActive
        int maxRequests
    }
    
    SPECIALIST_REQUEST {
        string requestId PK
        uuid userId FK
        uuid specialistId FK
        enum requestType
        string description
        enum status
        enum priority
        object userProfileSnapshot
        timestamp createdAt
        timestamp assignedAt
        timestamp completedAt
        object metadata
    }
    
    MESSAGE {
        string messageId PK
        string requestId FK
        uuid senderId FK
        enum senderType
        string content
        timestamp timestamp
        boolean isFiltered
        array attachments
    }
```

---

## Diagrama de Flujo de Usuario

```mermaid
flowchart TD
    A[👤 Usuario Nuevo] --> B[Registro]
    B --> C{Email existe?}
    C -->|Sí| D[Error: Email ya registrado]
    C -->|No| E[Crear Usuario en Auth]
    E --> F[Auto-login]
    F --> G[Configurar Perfil]
    
    G --> H{Datos completos?}
    H -->|No| I[Solicitar peso/altura]
    H -->|Sí| J[Calcular TMB]
    I --> J
    
    J --> K{Meta realista?}
    K -->|No| L[Advertencia: Cambio muy rápido]
    K -->|Sí| M[Guardar Perfil]
    L --> M
    
    M --> N[Dashboard Principal]
    
    N --> O[Generar Plan de Comidas]
    N --> P[Generar Receta IA]
    N --> Q[Solicitar Especialista]
    
    O --> O1[Motor Prolog]
    O1 --> O2[Plan Semanal]
    O2 --> O3{Reemplazar comida?}
    O3 -->|Sí| O1
    O3 -->|No| N
    
    P --> P1[Motor IA]
    P1 --> P2[Receta Personalizada]
    P2 --> P3{Guardar favorito?}
    P3 -->|Sí| P4[Agregar a favoritos]
    P3 -->|No| N
    P4 --> N
    
    Q --> Q1[Crear Solicitud]
    Q1 --> Q2{Palabras prohibidas?}
    Q2 -->|Sí| Q3[Error: Contenido inapropiado]
    Q2 -->|No| Q4[Asignar Especialista]
    Q4 --> Q5[Chat Habilitado]
    Q5 --> N
```

---

## Diagrama de Flujo de Especialista

```mermaid
flowchart TD
    A[👨‍⚕️ Especialista Nuevo] --> B[Registro Especialista]
    B --> C{Datos válidos?}
    C -->|No| D[Error: Campos faltantes]
    C -->|Sí| E{Cédula válida?}
    E -->|No| F[Error: Cédula inválida]
    E -->|Sí| G[Crear Usuario Especialista]
    
    G --> H[Crear Perfil Especialista]
    H --> I[Dashboard Especialista]
    
    I --> J[Ver Solicitudes Asignadas]
    J --> K{Hay solicitudes?}
    K -->|No| L[Esperando asignaciones...]
    K -->|Sí| M[Lista de Solicitudes]
    
    M --> N{Seleccionar solicitud}
    N --> O[Ver Perfil Usuario]
    O --> P[Iniciar Chat]
    
    P --> Q{Enviar mensaje}
    Q --> R{Palabras prohibidas?}
    R -->|Sí| S[Error: Contenido inapropiado]
    R -->|No| T[Enviar Mensaje]
    T --> P
    
    P --> U{Completar solicitud?}
    U -->|Sí| V[Marcar como Completada]
    U -->|No| P
    V --> I
```

---

## Diagrama de Arquitectura del Sistema

```mermaid
graph TB
    subgraph Frontend["🖥️ Frontend (React + Tailwind)"]
        UI[Interfaz de Usuario]
        Auth[Autenticación]
        RecipeGen[Generador de Recetas]
        MealPlan[Planificador de Comidas]
        Chat[Chat Especialista]
    end
    
    subgraph Backend["⚙️ Backend (Hono + Deno)"]
        API[API REST]
        AuthServ[Servicio de Auth]
        ProfileServ[Servicio de Perfiles]
        RecipeServ[Servicio de Recetas]
        MealServ[Servicio de Comidas]
        SpecServ[Servicio de Especialistas]
        ChatServ[Servicio de Chat]
    end
    
    subgraph AI["🤖 Motores IA"]
        Prolog[Motor Prolog]
        RecipeAI[Motor de Recetas IA]
        Validator[Validador de Restricciones]
    end
    
    subgraph Storage["💾 Almacenamiento"]
        SupaAuth[(Supabase Auth)]
        KV[(KV Store)]
        FoodDB[(Base de Alimentos)]
    end
    
    UI --> API
    Auth --> AuthServ
    RecipeGen --> RecipeServ
    MealPlan --> MealServ
    Chat --> ChatServ
    
    API --> AuthServ
    API --> ProfileServ
    API --> RecipeServ
    API --> MealServ
    API --> SpecServ
    API --> ChatServ
    
    AuthServ --> SupaAuth
    ProfileServ --> KV
    RecipeServ --> RecipeAI
    RecipeServ --> KV
    MealServ --> Prolog
    MealServ --> KV
    SpecServ --> KV
    ChatServ --> KV
    
    Prolog --> FoodDB
    Prolog --> Validator
    RecipeAI --> FoodDB
    RecipeAI --> Validator
```

---

## Diagrama de Estados de Solicitud

```mermaid
stateDiagram-v2
    [*] --> Pending: Usuario crea solicitud
    
    Pending --> Assigned: Sistema asigna especialista
    Pending --> Cancelled: Usuario cancela
    
    Assigned --> InProgress: Especialista acepta
    Assigned --> Pending: Especialista rechaza
    
    InProgress --> Completed: Especialista completa
    InProgress --> Cancelled: Usuario cancela
    
    Completed --> [*]
    Cancelled --> [*]
    
    note right of Pending
        - Esperando asignación
        - Auto-asignación por disponibilidad
    end note
    
    note right of InProgress
        - Chat activo
        - Mensajes filtrados
    end note
    
    note right of Completed
        - Solicitud cerrada
        - Historial disponible
    end note
```

---

## Diagrama de Ciclo de Vida de Receta

```mermaid
stateDiagram-v2
    [*] --> Generando: Usuario solicita receta
    
    Generando --> Validando: IA genera receta
    
    Validando --> Error: Validación falla
    Validando --> Generada: Validación exitosa
    
    Error --> Generando: Reintentar
    
    Generada --> EnHistorial: Guardar en historial
    EnHistorial --> Favorita: Usuario marca favorito
    EnHistorial --> [*]: Usuario cierra
    Favorita --> [*]: Usuario desmarca
    
    note right of Validando
        - Verificar alergias
        - Validar ingredientes
        - Calcular nutrición
    end note
    
    note right of EnHistorial
        - Máximo 20 recetas
        - FIFO si excede límite
    end note
```

---

## Diagrama de Cálculo de TMB

```mermaid
flowchart LR
    A[Datos del Usuario] --> B{Sexo}
    B -->|Masculino| C[TMB = 10W + 6.25H - 5A + 5]
    B -->|Femenino| D[TMB = 10W + 6.25H - 5A - 161]
    
    C --> E[TMB Base]
    D --> E
    
    E --> F{Nivel de Actividad}
    F -->|Sedentario| G[x 1.2]
    F -->|Ligero| H[x 1.375]
    F -->|Moderado| I[x 1.55]
    F -->|Activo| J[x 1.725]
    F -->|Muy Activo| K[x 1.9]
    
    G --> L[Calorías Diarias]
    H --> L
    I --> L
    J --> L
    K --> L
    
    L --> M{Objetivo}
    M -->|Perder Peso| N[- 500 cal]
    M -->|Ganar Músculo| O[+ 300 cal]
    M -->|Mantener| P[= Calorías]
    
    N --> Q[Calorías Objetivo]
    O --> Q
    P --> Q
    
    style A fill:#e1f5ff
    style E fill:#ffe1e1
    style L fill:#e1ffe1
    style Q fill:#ffe1ff
```

---

## Diagrama de Generación de Plan de Comidas (Prolog)

```mermaid
flowchart TD
    A[Inicio] --> B[Obtener Perfil Usuario]
    B --> C[Cargar Base de Alimentos]
    C --> D[Filtrar por Alergias]
    D --> E[Filtrar por Preferencias]
    
    E --> F{Por cada día}
    F --> G[Generar Desayuno]
    G --> H[Generar Almuerzo]
    H --> I[Generar Cena]
    I --> J[Generar Snacks]
    
    J --> K{Cumple macros?}
    K -->|No| L[Backtracking]
    L --> G
    K -->|Sí| M{Día < 7?}
    M -->|Sí| F
    M -->|No| N[Calcular Totales]
    
    N --> O{Validar Calorías Totales}
    O -->|Fuera de rango| P[Ajustar Porciones]
    P --> G
    O -->|Correcto| Q[Generar Razonamiento]
    Q --> R[Retornar Plan]
    
    style D fill:#ffcccc
    style E fill:#ffcccc
    style K fill:#ccffcc
    style O fill:#ccffcc
```

---

## Diagrama de Asignación Automática de Especialistas

```mermaid
flowchart TD
    A[Nueva Solicitud] --> B[Obtener Especialistas Activos]
    B --> C{Hay especialistas?}
    C -->|No| D[Error: Sin especialistas disponibles]
    C -->|Sí| E[Filtrar por Especialidad]
    
    E --> F{Especialidad coincide?}
    F -->|No| G[Usar especialistas generales]
    F -->|Sí| H[Lista de Candidatos]
    G --> H
    
    H --> I[Ordenar por totalRequests ASC]
    I --> J[Seleccionar primer especialista]
    J --> K{Especialista < maxRequests?}
    K -->|No| L[Siguiente especialista]
    L --> J
    K -->|Sí| M[Asignar Solicitud]
    
    M --> N[Actualizar totalRequests]
    N --> O[Cambiar status a 'assigned']
    O --> P[Guardar assignedAt]
    P --> Q[Notificar Especialista]
    Q --> R[Fin]
    
    style D fill:#ffcccc
    style M fill:#ccffcc
    style Q fill:#ccccff
```

---

## Diagrama de Seguridad y Validación

```mermaid
flowchart TD
    A[Request Entrante] --> B{Tiene Authorization?}
    B -->|No| C[401 Unauthorized]
    B -->|Sí| D[Extraer Access Token]
    
    D --> E[Validar con Supabase Auth]
    E --> F{Token válido?}
    F -->|No| G[401 Unauthorized]
    F -->|Sí| H[Obtener User ID]
    
    H --> I{Endpoint requiere perfil?}
    I -->|Sí| J[Cargar Perfil]
    I -->|No| M
    
    J --> K{Perfil existe?}
    K -->|No| L[400 Bad Request: Configura perfil]
    K -->|Sí| M[Validar Datos de Request]
    
    M --> N{Datos válidos?}
    N -->|No| O[400 Bad Request]
    N -->|Sí| P{Contiene palabras prohibidas?}
    
    P -->|Sí| Q[400 Bad Request: Contenido inapropiado]
    P -->|No| R[Procesar Request]
    
    R --> S{Operación exitosa?}
    S -->|No| T[500 Server Error]
    S -->|Sí| U[200 OK / 201 Created]
    
    style C fill:#ffcccc
    style G fill:#ffcccc
    style L fill:#ffcccc
    style O fill:#ffcccc
    style Q fill:#ffcccc
    style T fill:#ffcccc
    style U fill:#ccffcc
```

---

## Matriz de Acceso por Rol

| Endpoint | Usuario | Especialista | Público |
|----------|---------|--------------|---------|
| `POST /signup` | ✅ | ✅ | ✅ |
| `GET /profile` | ✅ (propio) | ❌ | ❌ |
| `PUT /profile` | ✅ (propio) | ❌ | ❌ |
| `POST /generate-menu` | ✅ | ❌ | ❌ |
| `POST /replace-meal` | ✅ | ❌ | ❌ |
| `POST /recipes/generate` | ✅ | ❌ | ❌ |
| `GET /recipes/history` | ✅ (propio) | ❌ | ❌ |
| `GET /recipes/favorites` | ✅ (propio) | ❌ | ❌ |
| `POST /specialist-signup` | ❌ | ✅ | ✅ |
| `GET /specialist-profile` | ❌ | ✅ (propio) | ❌ |
| `POST /specialist-requests` | ✅ | ❌ | ❌ |
| `GET /specialist/my-requests` | ❌ | ✅ (asignadas) | ❌ |
| `POST /specialist-requests/:id/messages` | ✅ (propias) | ✅ (asignadas) | ❌ |

---

## Diagrama de Datos en KV Store

```mermaid
graph LR
    subgraph User_Data["👤 Datos de Usuario"]
        P[profile:user123]
        RH[recipe_history:user123]
        RF[recipe_favorites:user123]
        UR[user_requests:user123]
    end
    
    subgraph Specialist_Data["👨‍⚕️ Datos de Especialista"]
        SP[specialist_profile:spec456]
        SR[specialist_requests:spec456]
    end
    
    subgraph Shared_Data["🤝 Datos Compartidos"]
        REQ[specialist_request:req_789]
        MSG[request_messages:req_789]
    end
    
    subgraph Food_Data["🥗 Datos de Alimentos"]
        FDB[(Food Database In-Memory)]
    end
    
    P -.referencia.-> UR
    UR -.contiene IDs.-> REQ
    SR -.contiene IDs.-> REQ
    REQ -.tiene.-> MSG
    RH -.array de.-> Recipe
    RF -.array de IDs.-> Recipe
    
    style P fill:#e1f5ff
    style RH fill:#ffe1e1
    style RF fill:#ffe1ff
    style SP fill:#e1ffe1
    style REQ fill:#fff4e1
    style MSG fill:#f0e1ff
```

---

## Glosario de Términos

| Término | Descripción |
|---------|-------------|
| **TMB** | Tasa Metabólica Basal - Calorías que el cuerpo quema en reposo |
| **KV Store** | Key-Value Store - Sistema de almacenamiento clave-valor |
| **JSONB** | JSON Binary - Formato JSON optimizado para almacenamiento |
| **FK** | Foreign Key - Llave foránea |
| **PK** | Primary Key - Llave primaria |
| **UK** | Unique Key - Llave única |
| **FIFO** | First In First Out - Primero en entrar, primero en salir |
| **Prolog** | Lenguaje de programación lógica usado para inferencia |
| **Backtracking** | Técnica de búsqueda que retrocede cuando falla |
| **Snapshot** | Copia inmutable de datos en un momento específico |

---

**Nota**: Estos diagramas son visualizaciones del modelo de datos. Para ver el modelo completo con todas las especificaciones, consulta `DATABASE_MODEL.md`.
