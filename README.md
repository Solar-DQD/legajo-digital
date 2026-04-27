# Legajo Digital

Formulario web para la carga del legajo de empleados y postulantes de DQD. Recopila datos personales, habilidades, herramientas, experiencia laboral, formación, certificaciones, licencias, disponibilidad y CV en PDF. Guarda todo en SQL Server y sube los PDF a SharePoint.

## Descripción

Aplicación web construida con Next.js 16 (App Router) que expone dos puntos de entrada (`/empleado` y `/postulante`). Ambas rutas muestran el mismo formulario de 6 pasos; la diferencia es el estado con el que se guarda el registro (`Empleado Activo` vs `Postulante`) y la carpeta de SharePoint a la que va el CV. Al enviar, un server action valida los archivos, sube los PDFs a SharePoint usando Microsoft Graph API (client credentials) y persiste la data relacional en SQL Server dentro de una única transacción de Prisma.

## Stack

- **Next.js 16.2.1** (App Router, server actions con `bodySizeLimit: 50mb`, output `standalone`)
- **React 19.2.4** + **React Hook Form**
- **MUI 7.3.9** (Material UI) + **Tailwind CSS 4**
- **Prisma 7.5.0** con **SQL Server** (adapter `@prisma/adapter-mssql`)
- **TanStack Query 5** para fetch de catálogos
- **Microsoft Graph API** para subida de CVs a SharePoint
- **dayjs** con `customParseFormat` para parseo de fechas

## Requisitos

- Node.js 20.9+
- SQL Server accesible
- App registrada en Azure AD con permiso **Sites.ReadWrite.All** (application)
- Sitio y biblioteca de SharePoint con las carpetas de destino ya creadas para `empleados` y `postulantes`
- Archivo `.env` configurado en la raíz (el repo no trae `.env.example`)

## Setup

```bash
# Instalar dependencias
npm install

# Crear el .env en la raíz (ver "Variables de entorno")

# Generar Prisma Client
npm run db:generate

# Aplicar migraciones
npm run db:migrate

# Cargar datos iniciales (países, provincias, convenios, habilidades, etc.)
npm run db:seed

# Dev
npm run dev
```

## Variables de entorno

| Variable | Descripción |
|---|---|
| `DATABASE_URL` | Connection string de SQL Server (`sqlserver://HOST:PORT;database=...;user=...;password=...;encrypt=true;trustServerCertificate=true`) |
| `TENANT_ID` | Azure AD tenant ID |
| `CLIENT_ID` | Azure AD app client ID |
| `CLIENT_SECRET` | Azure AD app client secret |
| `SP_SITE_NAME` | Nombre del sitio de SharePoint (usado con `?search=` en Graph) |
| `SP_LIBRARY_NAME` | Nombre de la biblioteca de documentos dentro del sitio |
| `SP_UPLOAD_PATH_EMPLOYEE` | Carpeta base donde se suben CVs de empleados |
| `SP_UPLOAD_PATH_APLICANT` | Carpeta base donde se suben CVs de postulantes |

## Scripts

| Script | Descripción |
|---|---|
| `npm run dev` | Servidor de desarrollo |
| `npm run build` | Build de producción (`next build`) |
| `npm run start` | Servidor de producción (`next start`) |
| `npm run lint` | ESLint |
| `npm run db:migrate` | Crear / aplicar migraciones (`prisma migrate dev`) |
| `npm run db:push` | Push schema sin migración (`prisma db push`) |
| `npm run db:seed` | Seed de catálogos iniciales |
| `npm run db:generate` | Generar Prisma Client |

## Rutas

| Ruta | Descripción |
|---|---|
| `/empleado` | Formulario de carga de legajo para empleados activos |
| `/postulante` | Formulario de carga de legajo para postulantes |

Ambas rutas renderizan el mismo componente `FormPage` pasándole `formType` para diferenciar el estado guardado y la carpeta de SharePoint.

## Flujo del formulario

El formulario tiene 6 pasos, todos bajo un `FormProvider` de React Hook Form:

1. **Datos personales** — nombre, DNI, fecha de nacimiento, teléfono, email, país, provincia, convenio, área, puesto
2. **Habilidades** — catálogo filtrado por convenio + habilidades personalizadas
3. **Herramientas** — catálogo + herramientas personalizadas
4. **Experiencia laboral** — empresa, puesto, rubro, desde/hasta (MM-YYYY), descripción
5. **Formación** — educaciones (con nivel, institución, años), certificaciones, licencias
6. **Disponibilidad** — disponibilidad para viajar, idiomas, observaciones y CV (PDF, uno o varios)

Al enviar, el server action `submitLegajo` ejecuta:

1. Valida archivos (PDF, ≤ 5MB por archivo, ≤ 40MB total).
2. Obtiene token de Graph API (client credentials).
3. Sube archivo/s a SharePoint: un archivo suelto o una carpeta con N archivos si hay varios.
4. Dentro de una transacción Prisma: crea habilidades/herramientas personalizadas, crea el empleado, crea todas las relaciones hijas.

## Arquitectura y módulos

- `app/` — rutas (`empleado`, `postulante`, `error.tsx`, `layout.tsx`)
- `components/FormPage.tsx` — contenedor del formulario de 6 pasos
- `components/steps/` — Step1 a Step6
- `components/common/` — inputs reutilizables (`FormField`, `FormSelect`, `FormDatePicker`, `FormStepper`, `StepWrapper`)
- `actions/` — server actions por dominio (área, disponibilidad, estado, habilidad, herramienta, idioma, legajo, licencia, nivel educativo, país, provincia, puesto, tipo convenio, Graph API)
- `actions/legajo/legajo.actions.ts` — server action `submitLegajo`
- `actions/graphApi/graphApi.actions.ts` — token y upload a SharePoint
- `lib/prisma.ts` — singleton de PrismaClient
- `lib/context/snackbar.tsx` — provider de notificaciones
- `lib/providers/queryProvider.ts` — QueryClient de TanStack Query
- `lib/constants/index.ts` — `MAX_CV_SIZE = 5MB`, `MAX_CV_TOTAL_SIZE = 40MB`
- `prisma/schema.prisma` — modelo relacional
- `prisma/seed/seed.ts` — seed de catálogos

## Estructura principal

```text
app/
  layout.tsx
  error.tsx
  globals.css
  empleado/page.tsx
  postulante/page.tsx
components/
  FormPage.tsx
  common/
  landing/
  steps/
actions/
  area/ disponibilidad/ estadoEmpleado/ graphApi/ habilidad/ herramienta/
  idioma/ legajo/ licencia/ nivelEducativo/ pais/ provincia/ puesto/ tipoconvenio/
lib/
  prisma.ts
  constants/ context/ providers/ types/ utils/
prisma/
  schema.prisma
  seed/
  migrations/
```

## Notas

- **Next.js 16** tiene breaking changes respecto a versiones previas (ver `AGENTS.md`). No aplicar convenciones de Next 13–15 a ciegas.
- Todo el backend del form son **server actions** — no hay rutas API REST.
- El límite de request de server actions está elevado a 50MB en [next.config.ts](next.config.ts) para acomodar subidas de CV con certificaciones.
- El upload a SharePoint usa **client credentials** (no hay usuario de por medio) — por eso requiere permiso `Sites.ReadWrite.All` como application, no delegated.
- Los campos `habilidadesPersonalizadas` y `herramientasPersonalizadas` que escribe el usuario se persisten como registros nuevos en los catálogos `Habilidad` y `Herramienta`, no en tablas separadas.
- El estado del registro (`Postulante` vs `Empleado Activo`) se resuelve vía la tabla `EstadoEmpleado`, no con un flag booleano.
- El componente `components/landing/index.tsx` existe pero no está montado en ninguna ruta hoy (queda como base para un wrapper futuro con captcha/landing).
