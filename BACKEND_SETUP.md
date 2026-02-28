# Configuración requerida en Spring Boot

## 1. Habilitar CORS (OBLIGATORIO)

Agrega esta clase en tu proyecto Spring Boot:

```java
// src/main/java/com/tuapp/config/CorsConfig.java
package com.tuapp.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;
import org.springframework.web.filter.CorsFilter;

@Configuration
public class CorsConfig {

    @Bean
    public CorsFilter corsFilter() {
        CorsConfiguration config = new CorsConfiguration();
        config.addAllowedOrigin("http://localhost:5173");  // Vite dev server
        config.addAllowedOrigin("http://localhost:4173");  // Vite preview
        config.addAllowedHeader("*");
        config.addAllowedMethod("*");
        config.setAllowCredentials(true);

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", config);
        return new CorsFilter(source);
    }
}
```

## 2. Formato esperado del JWT

El frontend espera que `/auth/login` y `/auth/register` devuelvan:

```json
{
  "token": "eyJhbGciOiJIUzI1NiJ9...",
  "user": {
    "id": 1,
    "name": "Juan Pérez",
    "email": "juan@email.com",
    "role": "USER"   // "USER", "PROVIDER" o "ADMIN"
  }
}
```

## 3. Verificar que funciona

Con el backend corriendo en :8080 y el frontend en :5173:

```bash
# Test login desde terminal
curl -X POST http://localhost:8080/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@test.com","password":"123456"}'
```

Debe devolver `{ "token": "...", "user": { ... } }`.

## 4. Rutas del frontend ↔ endpoints del backend

| Frontend | Endpoint |
|----------|----------|
| `/`      | `GET /profiles/public` |
| `/explorar` | `GET /profiles/public/search` |
| `/perfil/:slug` | `GET /profiles/public/{slug}` |
| `/login` | `POST /auth/login` |
| `/registro` | `POST /auth/register` |
| `/mi-perfil` | `GET /profiles/me` |
| `/publicar` | `POST /profiles` |
| `/admin` | `GET /admin/profiles` + `GET /users` |
| `/admin/pendientes` | `GET /profiles/admin/pending` |
