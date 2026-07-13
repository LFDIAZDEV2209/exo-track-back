<div align="center">

<img src="../exo-track-front/public/logo.png" alt="ExoTrack Logo" width="100" />

# ExoTrack API

### Backend del sistema de gestión de declaraciones de renta en Colombia

API REST que potencia la plataforma ExoTrack para la administración tributaria de clientes.

[![NestJS](https://img.shields.io/badge/NestJS-11-E0234E?style=for-the-badge&logo=nestjs&logoColor=white)](https://nestjs.com)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.7-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://typescriptlang.org)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-15-4169E1?style=for-the-badge&logo=postgresql&logoColor=white)](https://www.postgresql.org)
[![TypeORM](https://img.shields.io/badge/TypeORM-0.3-FE0803?style=for-the-badge&logo=typeorm&logoColor=white)](https://typeorm.io)

[![API Docs](https://img.shields.io/badge/Swagger-85EA2D?style=for-the-badge&logo=swagger&logoColor=black)](#-documentación-swagger)
[![JWT](https://img.shields.io/badge/JWT-Auth-000000?style=for-the-badge&logo=jsonwebtokens&logoColor=white)](#-autenticación)

</div>

---

## Tabla de contenido

- [Descripción](#-descripción)
- [Stack](#-stack)
- [Requisitos](#-requisitos)
- [Instalación](#-instalación)
- [Variables de entorno](#-variables-de-entorno)
- [Arrancar el servidor](#-arrancar-el-servidor)
- [Base de datos](#-base-de-datos)
- [Seed data](#-seed-data)
- [API](#-api)
- [Autenticación](#-autenticación)
- [Swagger](#-documentación-swagger)
- [Testing](#-testing)
- [Arquitectura](#-arquitectura)
- [Modelo de datos](#-modelo-de-datos)
- [Comandos](#-comandos)

---

## Descripción

API NestJS que gestiona usuarios, declaraciones de renta y su detalle financiero (patrimonios, ingresos, deudas) para profesionales contables y sus clientes en Colombia.

---

## Stack

| Tecnología | Versión | Propósito |
|:-----------|:-------:|:----------|
| [NestJS](https://nestjs.com) | 11 | Framework modular Node.js |
| [TypeScript](https://typescriptlang.org) | 5.7 | Tipado estático |
| [TypeORM](https://typeorm.io) | 0.3 | ORM con mapeo objeto-relacional |
| [PostgreSQL](https://www.postgresql.org) | 15 | Base de datos relacional |
| [Passport JWT](https://www.passportjs.org) | 4.0 | Autenticación por token |
| [Swagger](https://swagger.io) | — | Documentación OpenAPI |
| [bcrypt](https://www.npmjs.com/package/bcrypt) | 6 | Hash de contraseñas |
| [class-validator](https://github.com/TypeStack/class-validator) | 0.14 | Validación de DTOs |
| [Jest](https://jestjs.io) | 30 | Unit + E2E testing |
| [ESLint](https://eslint.org) + [Prettier](https://prettier.io) | 9 / 3 | Linting y formato |

---

## Requisitos

- [Node.js](https://nodejs.org) 20+
- [pnpm](https://pnpm.io)
- [Docker](https://www.docker.com) (para PostgreSQL)

---

## Instalación

```bash
git clone https://github.com/LFDIAZDEV2209/exo-track.git
cd exo-track/exo-track-back
pnpm install
```

---

## Variables de entorno

Crear un archivo `.env` en la raíz del directorio:

```env
# Base de datos
DB_HOST=localhost
DB_PORT=5432
DB_NAME=exotrack_db
DB_USER=postgres
DB_PASSWORD=postgres
DB_SSL=false

# JWT
JWT_SECRET=tu-secreto-seguro-aqui
JWT_EXPIRES_IN=1h

# Servidor
PORT=3000
```

> ⚠️ El archivo `.env` está gitignoreado. Nunca commitees credenciales.

---

## Base de datos

Levantar PostgreSQL con Docker:

```bash
docker compose up -d
```

Esto crea un contenedor `exo-track-db` con PostgreSQL 15 en el puerto **5432**.

TypeORM está configurado con `synchronize: true` (solo desarrollo), así que las tablas se crean automáticamente al iniciar el servidor.

---

## Arrancar el servidor

```bash
pnpm start:dev
```

El servidor arranca en `http://localhost:3000` con watch automático.

| Modo | Comando | Puerto |
|:-----|:--------|:------:|
| Desarrollo | `pnpm start:dev` | 3000 |
| Debug | `pnpm start:debug` | 3000 |
| Producción | `pnpm build && pnpm start:prod` | 3000 |

---

## Seed data

El endpoint `GET /api/v1/seed` genera datos de prueba realistas:

| Dato | Cantidad |
|:-----|:--------:|
| Usuarios clientes | 30 |
| Declaraciones | 435 (29 usuarios × 15 años: 2011–2025) |
| Patrimonios | ~13,000 |
| Deudas | ~8,700 |
| Ingresos | ~6,500 |

Conceptos colombianos realistas: Casa de habitación, Vehículo, Salario, Préstamo hipotecario, Inversión en fondos, etc.

Para limpiar toda la base de datos: `DELETE /api/v1/seed`

### Credenciales del admin

| Campo | Valor |
|:------|:------|
| Cédula | `99999999` |
| Contraseña | `Admin123!` |

---

## API

Todas las rutas están prefijadas con `/api/v1`.

### Auth

| Método | Ruta | Auth | Descripción |
|:------:|:-----|:----:|:------------|
| `POST` | `/auth/login` | Público | Iniciar sesión (devuelve JWT + cookie httpOnly) |
| `POST` | `/auth/logout` | Auth | Cerrar sesión (limpia cookie) |
| `GET` | `/auth/check-auth-status` | Auth | Verificar token y obtener usuario actual |
| `POST` | `/auth/register` | Admin | Registrar nuevo usuario |

### Users

| Método | Ruta | Auth | Descripción |
|:------:|:-----|:----:|:------------|
| `GET` | `/users` | Admin | Listar clientes (paginado, con conteo de declaraciones) |
| `GET` | `/users/stats` | Admin | Estadísticas: total, activos, promedio declaraciones |
| `GET` | `/users/:term` | Admin | Buscar por UUID, cédula, email o nombre parcial |
| `POST` | `/users` | — | Crear usuario |
| `PUT` | `/users/:id` | Admin | Actualizar usuario |
| `DELETE` | `/users/:id` | Admin | Eliminar usuario (cascade) |

### Declarations

| Método | Ruta | Auth | Descripción |
|:------:|:-----|:----:|:------------|
| `GET` | `/declarations` | Auth | Listar declaraciones (paginado, filtrable por userId) |
| `GET` | `/declarations/stats` | Admin | Estadísticas: total, pendientes, completadas, tasa % |
| `GET` | `/declarations/recent-activity` | Admin | Actividad reciente con datos de usuario |
| `GET` | `/declarations/taxable-years?userId=` | Auth | Años gravables únicos para un usuario |
| `GET` | `/declarations/:id` | Auth | Detalle de declaración |
| `POST` | `/declarations` | Admin | Crear declaración |
| `PUT` | `/declarations/:id` | Admin | Actualizar declaración |
| `DELETE` | `/declarations/:id` | Admin | Eliminar declaración (cascade) |

### Assets

| Método | Ruta | Auth | Descripción |
|:------:|:-----|:----:|:------------|
| `GET` | `/assets` | — | Listar patrimonios (filtrable por declarationId) |
| `POST` | `/assets` | — | Crear patrimonio |
| `PUT` | `/assets/:id` | — | Actualizar patrimonio |
| `DELETE` | `/assets/:id` | — | Eliminar patrimonio |

### Incomes

| Método | Ruta | Auth | Descripción |
|:------:|:-----|:----:|:------------|
| `GET` | `/incomes` | Auth | Listar ingresos (filtrable por declarationId) |
| `POST` | `/incomes` | Admin | Crear ingreso |
| `PUT` | `/incomes/:id` | Admin | Actualizar ingreso |
| `DELETE` | `/incomes/:id` | Admin | Eliminar ingreso |

### Liabilities

| Método | Ruta | Auth | Descripción |
|:------:|:-----|:----:|:------------|
| `GET` | `/liabilities` | Auth | Listar deudas (filtrable por declarationId) |
| `POST` | `/liabilities` | Admin | Crear deuda |
| `PUT` | `/liabilities/:id` | Admin | Actualizar deuda |
| `DELETE` | `/liabilities/:id` | Admin | Eliminar deuda |

### Seed

| Método | Ruta | Auth | Descripción |
|:------:|:-----|:----:|:------------|
| `GET` | `/seed` | Admin | Generar datos de prueba |
| `DELETE` | `/seed` | Admin | Limpiar toda la base de datos |

---

## Autenticación

### JWT + Cookie httpOnly

El login devuelve un token JWT que se almacena en una cookie `auth_token` (httpOnly). El backend acepta el token de dos formas:

1. **Cookie** `auth_token` — para el frontend Next.js
2. **Header** `Authorization: Bearer <token>` — para clientes externos / Swagger

### Roles

| Rol | Permisos |
|:----|:---------|
| `ADMIN` | CRUD completo sobre usuarios, declaraciones y datos financieros |
| `USER` | Solo lectura de declaraciones y datos financieros propios |

Se aplican con decoradores:

```typescript
@Auth()           // Requiere autenticación
@RoleProtected(UserRole.ADMIN)  // Requiere rol admin
@GetUser()        // Inyecta el usuario autenticado
```

### Registro de usuarios

- Las contraseñas se generan automáticamente: 2 primeras letras del nombre + número de cédula
- Se hashean con bcrypt antes de guardarse
- El campo `password` tiene `select: false` (no se retorna en queries)

---

## Documentación Swagger

Disponible en **`http://localhost:3000/api`** cuando el servidor está corriendo.

Incluye autorización Bearer para probar endpoints protegidos directamente desde la UI de Swagger.

---

## Testing

```bash
# Unit tests (archivos *.spec.ts)
pnpm test

# Tests con cobertura
pnpm test:cov

# Tests E2E (archivos test/*.e2e-spec.ts)
pnpm test:e2e

# Watch mode
pnpm test:watch
```

---

## Arquitectura

```
src/
├── auth/                    # Autenticación JWT + Passport
│   ├── strategies/          # JwtStrategy (extrae token de cookie/header)
│   ├── guards/              # AuthGuard, UserRoleGuard
│   ├── decorators/          # @Auth(), @GetUser(), @RoleProtected()
│   ├── dto/                 # LoginDto, RegisterDto
│   ├── auth.controller.ts
│   ├── auth.service.ts
│   └── auth.module.ts
│
├── users/                   # Gestión de clientes y admins
│   ├── entities/            # User entity (UUID, bcrypt, roles)
│   ├── dto/                 # CreateUserDto, UpdateUserDto, PaginationDto
│   ├── users.controller.ts
│   ├── users.service.ts
│   └── users.module.ts
│
├── declarations/            # Declaraciones de renta
│   ├── entities/            # Declaration entity (status, year)
│   ├── enums/               # DeclarationStatus: PENDING, COMPLETED
│   ├── dto/                 # CreateDeclarationDto, FilterDeclarationDto
│   ├── declarations.controller.ts
│   ├── declarations.service.ts
│   └── declarations.module.ts
│
├── assets/                  # Patrimonios
│   ├── entities/            # Asset entity (concepto, monto, fuente)
│   ├── dto/
│   ├── assets.controller.ts
│   ├── assets.service.ts
│   └── assets.module.ts
│
├── incomes/                 # Ingresos
│   ├── entities/
│   ├── dto/
│   ├── incomes.controller.ts
│   ├── incomes.service.ts
│   └── incomes.module.ts
│
├── liabilities/             # Deudas
│   ├── entities/
│   ├── dto/
│   ├── liabilities.controller.ts
│   ├── liabilities.service.ts
│   └── liabilities.module.ts
│
├── seed/                    # Generación de datos de prueba
│   ├── data/                # Seed data (30 usuarios, conceptos realistas)
│   ├── seed.controller.ts
│   ├── seed.service.ts
│   └── seed.module.ts
│
├── common/                  # DTOs compartidos (PaginationDto)
├── shared/                  # Enums: UserRole, Source, DeclarationStatus
├── app.module.ts            # Módulo raíz (imports globales)
└── main.ts                  # Bootstrap: prefix /api/v1, CORS, Swagger, cookieParser
```

### Validación global

```typescript
app.useGlobalPipes(new ValidationPipe({
  whitelist: true,            // Elimina propiedades no declaradas en el DTO
  forbidNonWhitelisted: true  // Lanza error si hay propiedades extra
}));
```

### CORS

```
允许: https://exo-track-dev.netlify.app, http://localhost:3001
Métodos: GET, POST, PUT, DELETE
Headers: Content-Type, Authorization
Credentials: true
```

---

## Modelo de datos

```
┌──────────┐        ┌──────────────┐
│   User   │  1 ──∞ │  Declaration │
│──────────│        │──────────────│
│ id (UUID)│        │ id (UUID)    │
│ fullName │        │ taxableYear  │
│ docNumber│        │ status       │
│ email    │        │ description  │
│ phone    │        │ userId (FK)  │
│ password │        └──────┬───────┘
│ role     │               │
│ isActive │          1 ──∞│
└──────────┘               │
                     ┌─────┼─────┐
                     │     │     │
                ┌────┴──┐ ┌┴─────┐ ┌┴────────┐
                │ Asset │ │Income│ │Liability│
                │───────│ │──────│ │─────────│
                │ id    │ │ id   │ │ id      │
                │concept│ │concept│ │concept  │
                │amount │ │amount│ │amount   │
                │source │ │source│ │source   │
                └───────┘ └──────┘ └─────────┘
```

- Todas las claves primarias son **UUID**
- Relaciones `onDelete: CASCADE` — eliminar un usuario elimina sus declaraciones y datos financieros
- **Source** enum: `EXOGENA` (datos DIAN) | `MANUAL` (carga manual)
- **DeclarationStatus**: `PENDING` | `COMPLETED`

---

## Comandos

| Comando | Descripción |
|:--------|:------------|
| `pnpm start:dev` | Desarrollo con watch |
| `pnpm start:debug` | Desarrollo con debugger |
| `pnpm start:prod` | Producción (requiere build previo) |
| `pnpm build` | Compilar a `dist/` |
| `pnpm lint` | ESLint + fix |
| `pnpm format` | Prettier format |
| `pnpm test` | Unit tests |
| `pnpm test:watch` | Tests en watch |
| `pnpm test:cov` | Tests con cobertura |
| `pnpm test:e2e` | Tests E2E |
| `docker compose up -d` | Levantar PostgreSQL |

---

<div align="center">

Parte de [ExoTrack](https://github.com/LFDIAZDEV2209/exo-track)

</div>
