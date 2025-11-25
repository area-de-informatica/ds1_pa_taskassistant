# Task Assistant API - Documentación Swagger

## Descripción General

Task Assistant es una API REST completa para gestión de tareas, desarrollada con **NestJS** y **Mongoose** (MongoDB).

La API está totalmente documentada con **Swagger/OpenAPI 3.0** y disponible interactivamente en:

```
http://localhost:3000/api-docs
```

## Características

✅ **Autenticación JWT** - Protección de endpoints con tokens JWT  
✅ **Control de Roles (RBAC)** - Autorización basada en roles (administrador, docente, estudiante)  
✅ **Gestión de Tareas** - CRUD completo con asignación, progreso y calificación  
✅ **Comentarios** - Sistema de comentarios en tareas  
✅ **Etiquetas** - Etiquetas por palabra clave y color  
✅ **Metas** - Gestión de metas con vinculación de tareas  
✅ **Recursos** - Adjuntar enlaces y archivos a tareas  
✅ **Documentación Automática** - Swagger UI con todos los endpoints documentados  

## Requisitos

- Node.js 18+
- MongoDB Atlas cluster
- npm o yarn

## Instalación

```bash
# Clonar repositorio
git clone https://github.com/area-de-informatica/ds1_pa_taskassistant.git
cd Backend\ Taskassitent

# Instalar dependencias
npm install

# Configurar variables de entorno
cp .env.example .env
# Edita .env con tu conexión a MongoDB y JWT_SECRET

# Ejecutar en desarrollo
npm run start:dev
```

## Endpoints Principales

### Autenticación
- `POST /auth/login` - Iniciar sesión y obtener JWT

### Tareas
- `GET /tareas` - Obtener mis tareas
- `POST /tareas` - Crear nueva tarea
- `GET /tareas/:tareaId` - Obtener detalles de una tarea
- `PATCH /tareas/:tareaId` - Actualizar tarea
- `DELETE /tareas/:tareaId` - Eliminar tarea
- `POST /tareas/:tareaId/asignar` - Asignar tarea a usuario
- `PATCH /tareas/:tareaId/progreso` - Actualizar progreso
- `POST /tareas/:tareaId/tiempo` - Registrar tiempo trabajado
- `POST /tareas/:tareaId/calificar` - Calificar tarea completada
- `POST /tareas/:tareaId/recursos/link` - Adjuntar enlace
- `POST /tareas/:tareaId/recursos/upload` - Subir archivo
- `POST /tareas/:tareaId/etiquetas/:tipo` - Vincular etiqueta
- `DELETE /tareas/:tareaId/etiquetas/:tipo/:etiquetaId` - Desvinculada etiqueta

### Comentarios
- `POST /tareas/:tareaId/comentarios` - Publicar comentario

### Etiquetas
- `POST /etiquetas/palabra` - Crear etiqueta de palabra
- `GET /etiquetas/palabra` - Listar etiquetas de palabra
- `DELETE /etiquetas/palabra/:id` - Eliminar etiqueta de palabra
- `POST /etiquetas/color` - Crear etiqueta de color
- `GET /etiquetas/color` - Listar etiquetas de color
- `DELETE /etiquetas/color/:id` - Eliminar etiqueta de color

### Metas
- `POST /metas` - Crear meta
- `GET /metas` - Listar metas
- `DELETE /metas/:id` - Eliminar meta
- `POST /metas/:metaId/vincular-tarea` - Vincular tarea a meta
- `DELETE /metas/:metaId/vincular-tarea/:tareaId` - Desvinculada tarea de meta

## Acceder a la Documentación Swagger

1. **Ejecuta el servidor:**
   ```bash
   npm run start:dev
   ```

2. **Abre en tu navegador:**
   ```
   http://localhost:3000/api-docs
   ```

3. **En Swagger UI:**
   - Verás todos los endpoints organizados por etiquetas (Auth, Tareas, Comentarios, Etiquetas, Metas)
   - Haz clic en cada endpoint para ver detalles, parámetros, esquemas de request/response
   - Usa el botón **"Authorize"** para agregar tu JWT token
   - Prueba los endpoints directamente desde la UI con el botón **"Try it out"**

## Autenticación

1. **Obtener Token:**
   ```bash
   POST /auth/login
   Content-Type: application/json

   {
     "email": "user@example.com",
     "password": "password123"
   }
   ```

2. **Response:**
   ```json
   {
     "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
     "user": {
       "id": "507f1f77bcf86cd799439011",
       "email": "user@example.com",
       "nombre": "Juan Pérez",
       "rol": "docente_principal"
     }
   }
   ```

3. **Usar en Swagger:**
   - Haz clic en el botón **"Authorize"** arriba a la derecha
   - Pega tu token (sin "Bearer ", solo el token)
   - Haz clic en "Authorize"
   - Todos los endpoints protegidos ahora usarán tu token automáticamente

4. **Usar en curl:**
   ```bash
   curl -H "Authorization: Bearer YOUR_TOKEN" \
     http://localhost:3000/tareas
   ```

## Stack Tecnológico

- **Framework:** NestJS 11
- **Base de Datos:** MongoDB con Mongoose
- **Autenticación:** Passport.js + JWT
- **Documentación:** Swagger/OpenAPI 3.0
- **Lenguaje:** TypeScript
- **Validación:** class-validator
- **Testing:** Jest

## Estructura del Proyecto

```
src/
├── auth/               # Autenticación y JWT
├── tareas/            # Gestión de tareas
├── comentarios/       # Sistema de comentarios
├── etiquetas/         # Gestión de etiquetas
├── metas/             # Gestión de metas
├── schemas/           # Modelos Mongoose
├── common/            # Pipes y utilidades compartidas
├── app.module.ts      # Módulo principal
└── main.ts            # Punto de entrada
```

## Notas Importantes

- ⚠️ **JWT_SECRET:** Cambia el valor de `JWT_SECRET` en `.env` por una clave segura en producción
- ⚠️ **MongoDB Atlas:** Agrega tu IP a la lista blanca de seguridad en MongoDB Atlas
- ✅ **Todos los endpoints requieren autenticación** excepto `/auth/login`
- ✅ **Algunos endpoints requieren roles específicos** (administrador, docente)

## Troubleshooting

### "JWT_SECRET is not defined"
→ Asegúrate de tener `JWT_SECRET` configurado en tu `.env`

### "Could not connect to MongoDB"
→ Verifica que:
   - Tu `DATABASE_URL` en `.env` es correcta
   - Tu IP está en la lista blanca de MongoDB Atlas
   - Las credenciales de usuario/contraseña son correctas

### "Swagger no se carga"
→ Asegúrate de ejecutar con `npm run start:dev` en desarrollo

## Más Información

- [Documentación de NestJS](https://docs.nestjs.com)
- [Documentación de Mongoose](https://mongoosejs.com)
- [Documentación de Swagger/OpenAPI](https://swagger.io)

---

**Última actualización:** 12 de Noviembre, 2025  
**Versión:** 1.0.0-mongoose  
**Estado:** ✅ En Producción
