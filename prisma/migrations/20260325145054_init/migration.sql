BEGIN TRY

BEGIN TRAN;

-- CreateTable
CREATE TABLE [dbo].[Pais] (
    [id] INT NOT NULL IDENTITY(1,1),
    [nombre] NVARCHAR(1000) NOT NULL,
    CONSTRAINT [Pais_pkey] PRIMARY KEY CLUSTERED ([id])
);

-- CreateTable
CREATE TABLE [dbo].[Provincia] (
    [id] INT NOT NULL IDENTITY(1,1),
    [nombre] NVARCHAR(1000) NOT NULL,
    [idPais] INT NOT NULL,
    CONSTRAINT [Provincia_pkey] PRIMARY KEY CLUSTERED ([id])
);

-- CreateTable
CREATE TABLE [dbo].[Area] (
    [id] INT NOT NULL IDENTITY(1,1),
    [nombre] NVARCHAR(1000) NOT NULL,
    CONSTRAINT [Area_pkey] PRIMARY KEY CLUSTERED ([id])
);

-- CreateTable
CREATE TABLE [dbo].[Idioma] (
    [id] INT NOT NULL IDENTITY(1,1),
    [nombre] NVARCHAR(1000) NOT NULL,
    CONSTRAINT [Idioma_pkey] PRIMARY KEY CLUSTERED ([id])
);

-- CreateTable
CREATE TABLE [dbo].[NivelEducativo] (
    [id] INT NOT NULL IDENTITY(1,1),
    [nombre] NVARCHAR(1000) NOT NULL,
    CONSTRAINT [NivelEducativo_pkey] PRIMARY KEY CLUSTERED ([id])
);

-- CreateTable
CREATE TABLE [dbo].[TipoConvenio] (
    [id] INT NOT NULL IDENTITY(1,1),
    [nombre] NVARCHAR(1000) NOT NULL,
    CONSTRAINT [TipoConvenio_pkey] PRIMARY KEY CLUSTERED ([id])
);

-- CreateTable
CREATE TABLE [dbo].[Habilidad] (
    [id] INT NOT NULL IDENTITY(1,1),
    [nombre] NVARCHAR(1000) NOT NULL,
    [idTipoConvenio] INT NOT NULL,
    CONSTRAINT [Habilidad_pkey] PRIMARY KEY CLUSTERED ([id])
);

-- CreateTable
CREATE TABLE [dbo].[Herramienta] (
    [id] INT NOT NULL IDENTITY(1,1),
    [nombre] NVARCHAR(1000) NOT NULL,
    CONSTRAINT [Herramienta_pkey] PRIMARY KEY CLUSTERED ([id])
);

-- CreateTable
CREATE TABLE [dbo].[Licencia] (
    [id] INT NOT NULL IDENTITY(1,1),
    [codigo] NVARCHAR(1000) NOT NULL,
    [nombre] NVARCHAR(1000) NOT NULL,
    CONSTRAINT [Licencia_pkey] PRIMARY KEY CLUSTERED ([id])
);

-- CreateTable
CREATE TABLE [dbo].[Empleado] (
    [id] INT NOT NULL IDENTITY(1,1),
    [nombre] NVARCHAR(1000) NOT NULL,
    [dni] NVARCHAR(1000) NOT NULL,
    [telefono] NVARCHAR(1000) NOT NULL,
    [email] NVARCHAR(1000) NOT NULL,
    [urlCv] NVARCHAR(1000) NOT NULL,
    [idProvincia] INT NOT NULL,
    [idPais] INT NOT NULL,
    [idTipoConvenio] INT NOT NULL,
    [idArea] INT,
    [puesto] NVARCHAR(1000),
    CONSTRAINT [Empleado_pkey] PRIMARY KEY CLUSTERED ([id])
);

-- CreateTable
CREATE TABLE [dbo].[EmpleadoExperiencia] (
    [id] INT NOT NULL IDENTITY(1,1),
    [empresa] NVARCHAR(1000) NOT NULL,
    [puesto] NVARCHAR(1000) NOT NULL,
    [rubro] NVARCHAR(1000) NOT NULL,
    [desde] DATETIME2 NOT NULL,
    [hasta] DATETIME2,
    [descripcion] NVARCHAR(1000) NOT NULL,
    [idEmpleado] INT NOT NULL,
    CONSTRAINT [EmpleadoExperiencia_pkey] PRIMARY KEY CLUSTERED ([id])
);

-- CreateTable
CREATE TABLE [dbo].[EmpleadoEducacion] (
    [id] INT NOT NULL IDENTITY(1,1),
    [titulo] NVARCHAR(1000) NOT NULL,
    [institucion] NVARCHAR(1000) NOT NULL,
    [inicio] INT NOT NULL,
    [final] INT,
    [idNivelEducativo] INT NOT NULL,
    [idEmpleado] INT NOT NULL,
    CONSTRAINT [EmpleadoEducacion_pkey] PRIMARY KEY CLUSTERED ([id])
);

-- CreateTable
CREATE TABLE [dbo].[EmpleadoCertificacion] (
    [id] INT NOT NULL IDENTITY(1,1),
    [nombre] NVARCHAR(1000) NOT NULL,
    [idEmpleado] INT NOT NULL,
    CONSTRAINT [EmpleadoCertificacion_pkey] PRIMARY KEY CLUSTERED ([id])
);

-- CreateTable
CREATE TABLE [dbo].[EmpleadoIdioma] (
    [id] INT NOT NULL IDENTITY(1,1),
    [idEmpleado] INT NOT NULL,
    [idIdioma] INT NOT NULL,
    CONSTRAINT [EmpleadoIdioma_pkey] PRIMARY KEY CLUSTERED ([id])
);

-- CreateTable
CREATE TABLE [dbo].[EmpleadoHabilidad] (
    [id] INT NOT NULL IDENTITY(1,1),
    [idEmpleado] INT NOT NULL,
    [idHabilidad] INT NOT NULL,
    CONSTRAINT [EmpleadoHabilidad_pkey] PRIMARY KEY CLUSTERED ([id])
);

-- CreateTable
CREATE TABLE [dbo].[EmpleadoHerramienta] (
    [id] INT NOT NULL IDENTITY(1,1),
    [idEmpleado] INT NOT NULL,
    [idHerramienta] INT NOT NULL,
    CONSTRAINT [EmpleadoHerramienta_pkey] PRIMARY KEY CLUSTERED ([id])
);

-- CreateTable
CREATE TABLE [dbo].[EmpleadoLicencia] (
    [id] INT NOT NULL IDENTITY(1,1),
    [idEmpleado] INT NOT NULL,
    [idLicencia] INT NOT NULL,
    CONSTRAINT [EmpleadoLicencia_pkey] PRIMARY KEY CLUSTERED ([id])
);

-- AddForeignKey
ALTER TABLE [dbo].[Provincia] ADD CONSTRAINT [Provincia_idPais_fkey] FOREIGN KEY ([idPais]) REFERENCES [dbo].[Pais]([id]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[Habilidad] ADD CONSTRAINT [Habilidad_idTipoConvenio_fkey] FOREIGN KEY ([idTipoConvenio]) REFERENCES [dbo].[TipoConvenio]([id]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[Empleado] ADD CONSTRAINT [Empleado_idProvincia_fkey] FOREIGN KEY ([idProvincia]) REFERENCES [dbo].[Provincia]([id]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[Empleado] ADD CONSTRAINT [Empleado_idPais_fkey] FOREIGN KEY ([idPais]) REFERENCES [dbo].[Pais]([id]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[Empleado] ADD CONSTRAINT [Empleado_idTipoConvenio_fkey] FOREIGN KEY ([idTipoConvenio]) REFERENCES [dbo].[TipoConvenio]([id]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[Empleado] ADD CONSTRAINT [Empleado_idArea_fkey] FOREIGN KEY ([idArea]) REFERENCES [dbo].[Area]([id]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[EmpleadoExperiencia] ADD CONSTRAINT [EmpleadoExperiencia_idEmpleado_fkey] FOREIGN KEY ([idEmpleado]) REFERENCES [dbo].[Empleado]([id]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[EmpleadoEducacion] ADD CONSTRAINT [EmpleadoEducacion_idNivelEducativo_fkey] FOREIGN KEY ([idNivelEducativo]) REFERENCES [dbo].[NivelEducativo]([id]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[EmpleadoEducacion] ADD CONSTRAINT [EmpleadoEducacion_idEmpleado_fkey] FOREIGN KEY ([idEmpleado]) REFERENCES [dbo].[Empleado]([id]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[EmpleadoCertificacion] ADD CONSTRAINT [EmpleadoCertificacion_idEmpleado_fkey] FOREIGN KEY ([idEmpleado]) REFERENCES [dbo].[Empleado]([id]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[EmpleadoIdioma] ADD CONSTRAINT [EmpleadoIdioma_idEmpleado_fkey] FOREIGN KEY ([idEmpleado]) REFERENCES [dbo].[Empleado]([id]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[EmpleadoIdioma] ADD CONSTRAINT [EmpleadoIdioma_idIdioma_fkey] FOREIGN KEY ([idIdioma]) REFERENCES [dbo].[Idioma]([id]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[EmpleadoHabilidad] ADD CONSTRAINT [EmpleadoHabilidad_idEmpleado_fkey] FOREIGN KEY ([idEmpleado]) REFERENCES [dbo].[Empleado]([id]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[EmpleadoHabilidad] ADD CONSTRAINT [EmpleadoHabilidad_idHabilidad_fkey] FOREIGN KEY ([idHabilidad]) REFERENCES [dbo].[Habilidad]([id]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[EmpleadoHerramienta] ADD CONSTRAINT [EmpleadoHerramienta_idEmpleado_fkey] FOREIGN KEY ([idEmpleado]) REFERENCES [dbo].[Empleado]([id]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[EmpleadoHerramienta] ADD CONSTRAINT [EmpleadoHerramienta_idHerramienta_fkey] FOREIGN KEY ([idHerramienta]) REFERENCES [dbo].[Herramienta]([id]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[EmpleadoLicencia] ADD CONSTRAINT [EmpleadoLicencia_idEmpleado_fkey] FOREIGN KEY ([idEmpleado]) REFERENCES [dbo].[Empleado]([id]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[EmpleadoLicencia] ADD CONSTRAINT [EmpleadoLicencia_idLicencia_fkey] FOREIGN KEY ([idLicencia]) REFERENCES [dbo].[Licencia]([id]) ON DELETE NO ACTION ON UPDATE NO ACTION;

COMMIT TRAN;

END TRY
BEGIN CATCH

IF @@TRANCOUNT > 0
BEGIN
    ROLLBACK TRAN;
END;
THROW

END CATCH
