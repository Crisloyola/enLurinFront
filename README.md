# Eslurin Frontend

Directorio digital de servicios y empresas en Lurín, Perú.

## 🛠 Stack

| Tecnología        | Versión  | Uso                            |
|-------------------|----------|--------------------------------|
| React             | 18.3     | UI Framework                   |
| TypeScript        | 5.5      | Tipado estático                |
| Vite              | 5.4      | Bundler + Dev Server           |
| Tailwind CSS      | 3.4      | Estilos utilitarios            |
| React Router DOM  | 6.26     | Navegación SPA                 |
| Axios             | 1.7      | HTTP Client → Spring Boot API  |
| Lucide React      | 0.441    | Íconos                         |

---

## 🚀 Instalación

```bash
# 1. Instalar dependencias
npm install

# 2. Correr en desarrollo
npm run dev

# 3. Build producción
npm run build
```

> Backend Spring Boot debe correr en `http://localhost:8080`
> Vite redirige automáticamente `/api/*` → `http://localhost:8080/api/*`

---

## 📁 Estructura

```
src/
├── assets/
│   ├── icons/
│   ├── images/
│   └── styles/
│       ├── globals.css      ← Tailwind + clases base
│       └── variables.css    ← CSS custom properties
│
├── components/
│   ├── common/
│   │   ├── Button.tsx       ← Botón reutilizable (variant, size, loading)
│   │   ├── Input.tsx        ← Input con label, error e íconos
│   │   ├── Modal.tsx        ← Modal genérico con backdrop
│   │   └── Loader.tsx       ← Spinner de carga
│   ├── layout/
│   │   ├── Header.tsx       ← Navbar sticky con menú de usuario
│   │   ├── Footer.tsx       ← Footer con links y redes
│   │   └── MainLayout.tsx   ← Layout wrapper (Header + Outlet + Footer)
│   └── cards/
│       └── BusinessCard.tsx ← Card de negocio reutilizable
│
├── pages/
│   ├── Home/Home.tsx            ← Página principal completa
│   ├── Auth/Login.tsx           ← Login con JWT
│   ├── Auth/Register.tsx        ← Registro (USER | PROVIDER)
│   ├── Profile/MyProfile.tsx    ← Perfil del usuario logueado
│   ├── Profile/EditProfile.tsx  ← Crear / editar perfil de negocio
│   ├── PublicProfile/PublicProfile.tsx  ← Vista pública de un negocio
│   ├── Admin/Dashboard.tsx      ← Panel admin con estadísticas
│   └── Admin/ProfilesPending.tsx← Aprobar / rechazar perfiles
│
├── services/
│   ├── api.ts               ← Axios con interceptores JWT
│   ├── auth.service.ts      ← login, register, logout
│   ├── profile.service.ts   ← CRUD de perfiles
│   └── admin.service.ts     ← Endpoints de administración
│
├── hooks/
│   ├── useAuth.ts           ← Acceso al contexto de auth
│   └── useFetch.ts          ← Hook genérico para llamadas API
│
├── context/
│   └── AuthContext.tsx      ← Estado global de autenticación
│
├── routes/
│   └── AppRouter.tsx        ← Rutas + guards (PrivateRoute, AdminRoute)
│
├── types/
│   ├── auth.types.ts        ← LoginRequest, RegisterRequest, AuthResponse
│   ├── profile.types.ts     ← Profile, ProfileFormData, Category
│   └── user.types.ts        ← User, UserRole
│
└── utils/
    ├── constants.ts         ← ROUTES, CATEGORIES, HOME_TABS
    └── helpers.ts           ← formatDate, truncate, getInitials
```

---

## 🔌 Endpoints esperados del backend

| Método | Endpoint                         | Descripción                    | Auth      |
|--------|----------------------------------|--------------------------------|-----------|
| POST   | `/api/auth/login`                | Login → `{ token, user }`      | Pública   |
| POST   | `/api/auth/register`             | Registro                       | Pública   |
| GET    | `/api/perfiles`                  | Listar perfiles (con filtros)  | Pública   |
| GET    | `/api/perfiles/:id`              | Detalle de perfil              | Pública   |
| GET    | `/api/perfiles/mi-perfil`        | Mi perfil (autenticado)        | JWT       |
| POST   | `/api/perfiles`                  | Crear perfil                   | JWT       |
| PUT    | `/api/perfiles/:id`              | Actualizar perfil              | JWT       |
| GET    | `/api/admin/perfiles/pendientes` | Listar pendientes              | ADMIN     |
| PATCH  | `/api/admin/perfiles/:id/aprobar`| Aprobar perfil                 | ADMIN     |
| PATCH  | `/api/admin/perfiles/:id/rechazar`| Rechazar perfil               | ADMIN     |
| GET    | `/api/admin/stats`               | Estadísticas generales         | ADMIN     |

---

## 🎨 Sistema de diseño

### Colores (Tailwind)
```
brand-600  #ea580c  ← Naranja principal
brand-700  #c2410c  ← Hover
brand-50   #fff7ed  ← Fondos suaves
```

### Clases utilitarias globales
```
.btn-primary    → Botón naranja redondeado
.btn-outline    → Botón con borde naranja
.btn-ghost      → Botón transparente
.card           → Tarjeta blanca con sombra y hover
.input-field    → Input estilizado con focus naranja
.badge          → Etiqueta pequeña redondeada
.section-title  → Título de sección
.page-container → Contenedor centrado max-w-7xl
```

### Tipografía
- **Display:** Plus Jakarta Sans (títulos, botones)
- **Body:** DM Sans (texto general)

---

## 🔐 Flujo de autenticación

1. Usuario hace login → backend devuelve `{ token, user }`
2. Token guardado en `localStorage`
3. `AuthContext` lo expone a todos los componentes
4. Axios interceptor adjunta `Authorization: Bearer <token>` automáticamente
5. Si el servidor devuelve `401` → se limpia el token y redirige a `/login`
6. `PrivateRoute` protege rutas que requieren autenticación
7. `AdminRoute` protege rutas que requieren `role === 'ADMIN'`
# enLurinFront
