# Fundación MAKU — Campaña de donación + Bingo benéfico

Aplicación web para la campaña de recaudación de **Equipo MAKU**: una página
pública con la meta de donación, un formulario de donación con comprobante
(Bre-B), y un sistema de venta de 400 cartones de bingo con panel para cada
integrante del equipo y un panel de administración.

## Qué incluye

- **Página pública (`/`)**: portada, barra de progreso hacia la meta,
  estadísticas y botón de donar.
- **`/donar`**: muestra la llave Bre-B configurable y un formulario para que
  cualquier persona done y suba su comprobante.
- **`/login`**: acceso para integrantes del equipo y administradores.
- **`/panel`**: cada integrante ve sus cartones asignados y reporta ventas
  (comprador + evidencia de pago).
- **`/admin`**: panel de administración —
  - **Donaciones**: aprobar/rechazar donaciones pendientes.
  - **Cartones de bingo**: asignar rangos de cartones a integrantes y
    aprobar/rechazar ventas reportadas.
  - **Integrantes**: crear cuentas de acceso para el equipo.
  - **Configuración**: logo, meta, llave Bre-B, textos de la portada, precio
    del cartón.

Toda donación y venta de cartón queda en estado **"pendiente"** hasta que un
administrador la aprueba; solo entonces se suma a la meta.

## Stack técnico

- [Next.js](https://nextjs.org) (React) — alojado gratis en **Vercel**.
- [Supabase](https://supabase.com) — base de datos Postgres, autenticación y
  almacenamiento de archivos (gratis).

## Primeros pasos (configuración inicial)

### 1. Variables de entorno

Copia `.env.local.example` a `.env.local` y completa los valores con los de tu
proyecto de Supabase (Dashboard → Settings → API):

```
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
SUPABASE_SERVICE_ROLE_KEY=...
```

> `SUPABASE_SERVICE_ROLE_KEY` es secreta — solo se usa en el servidor para
> crear las cuentas de los integrantes del equipo. Nunca la publiques ni la
> agregues al repositorio.

### 2. Crear el esquema de base de datos

Entra a tu proyecto de Supabase → **SQL Editor** → **New query**, pega todo el
contenido de [`supabase/schema.sql`](./supabase/schema.sql) y dale **Run**.
Esto crea las tablas, los 400 cartones, las políticas de seguridad (RLS) y los
buckets de almacenamiento (`evidence` privado y `logos` público).

### 3. Crear el primer administrador

El esquema no crea administradores automáticamente (por seguridad). Para
crear el primero:

1. En Supabase, ve a **Authentication → Users → Add user** y crea un usuario
   con tu correo y una contraseña (marca "Auto Confirm User").
2. Copia el **UUID** del usuario que se creó.
3. Ve a **Table Editor → profiles → Insert row** y crea una fila con:
   - `id`: el UUID que copiaste
   - `full_name`: tu nombre
   - `role`: `admin`
4. Ya puedes iniciar sesión en `/login` con ese correo y contraseña — te
   llevará directo a `/admin`.

Desde el panel de administración podrás crear el resto de cuentas de los
integrantes del equipo (ellos sí se crean desde la app, no hace falta repetir
este proceso manual).

### 4. Ejecutar en desarrollo

```bash
npm install
npm run dev
```

Abre [http://localhost:3000](http://localhost:3000).

## Desplegar en Vercel

1. Sube este proyecto a un repositorio de GitHub.
2. En [vercel.com](https://vercel.com) → **New Project** → importa el
   repositorio.
3. En **Environment Variables**, agrega las mismas 3 variables de
   `.env.local`.
4. Clic en **Deploy**. Cada vez que hagas `git push`, Vercel actualiza la app
   automáticamente.

## Estructura del proyecto

```
src/
  app/
    page.tsx              Página pública principal
    donar/                 Formulario de donación
    login/                 Inicio de sesión
    panel/                 Panel del integrante (vendedor)
    admin/                 Panel de administración
  components/              Componentes compartidos (Navbar, ProgressBar)
  lib/
    supabase/              Clientes de Supabase (browser/server/admin)
    settings.ts             Lectura de configuración del sitio
    stats.ts                Estadísticas públicas de la campaña
    types.ts                Tipos de la base de datos
supabase/
  schema.sql                Esquema completo de la base de datos
```
