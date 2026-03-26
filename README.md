# Legajo Digital

Formulario web para la carga de legajos de empleados. Recopila datos personales, habilidades, herramientas, experiencia laboral, formacion, disponibilidad y CV en PDF, guardando todo en SQL Server y subiendo el CV a SharePoint.

## Stack

- **Next.js 16** (App Router)
- **React 19** + React Hook Form
- **MUI 7** (Material UI) + Tailwind CSS 4
- **Prisma 7** con SQL Server (adapter MSSQL)
- **TanStack Query** para fetch de datos
- **Microsoft Graph API** para subida de CVs a SharePoint

## Requisitos

- Node.js 20.9+
- SQL Server accesible
- App registrada en Azure AD con permisos `Sites.ReadWrite.All` (application)

## Setup

```bash
# Instalar dependencias
npm install

# Copiar variables de entorno
cp .env.example .env
# Completar .env con los valores reales

# Generar Prisma Client
npm run db:generate

# Aplicar migraciones
npm run db:migrate

# Cargar datos iniciales (paises, provincias, etc.)
npm run db:seed

# Iniciar en desarrollo
npm run dev
```

## Variables de entorno

| Variable | Descripcion |
|---|---|
| `DATABASE_URL` | Connection string de SQL Server |
| `TENANT_ID` | Azure AD tenant ID |
| `CLIENT_ID` | Azure AD app client ID |
| `CLIENT_SECRET` | Azure AD app client secret |
| `SP_SITE_NAME` | Nombre del sitio SharePoint (busqueda) |
| `SP_LIBRARY_NAME` | Nombre de la biblioteca de documentos |
| `SP_UPLOAD_PATH` | Carpeta destino dentro de la biblioteca |

## Scripts

| Script | Descripcion |
|---|---|
| `npm run dev` | Servidor de desarrollo |
| `npm run build` | Build de produccion |
| `npm run start` | Servidor de produccion |
| `npm run lint` | ESLint |
| `npm run db:migrate` | Crear/aplicar migraciones |
| `npm run db:push` | Push schema sin migracion |
| `npm run db:seed` | Seed de datos iniciales |
| `npm run db:generate` | Generar Prisma Client |

## Estructura

```
app/
  page.tsx              # Formulario principal (6 pasos)
  layout.tsx            # Layout con header y providers
  error.tsx             # Error boundary
  components/
    StepWrapper.tsx      # Wrapper comun de cada paso
    FormField.tsx        # Input de texto reutilizable
    FormSelect.tsx       # Select reutilizable
    FormDatePicker.tsx   # DatePicker reutilizable
    FormStepper.tsx      # Indicador de progreso
    steps/               # Step1 a Step6
actions/                 # Server actions (Prisma queries + submit)
lib/
  prisma.ts             # Singleton de PrismaClient
  context/snackbar.tsx  # Context de notificaciones
  providers/            # QueryClient
prisma/
  schema.prisma         # Modelo de datos
  seed/                 # Seed de datos iniciales
  migrations/           # Migraciones SQL
```
