/*
  Warnings:

  - Added the required column `idDisponibilidadViaje` to the `Empleado` table without a default value. This is not possible if the table is not empty.

*/
BEGIN TRY

BEGIN TRAN;

-- AlterTable
ALTER TABLE [dbo].[Empleado] ADD [idDisponibilidadViaje] INT NOT NULL;

-- CreateTable
CREATE TABLE [dbo].[DisponibilidadViaje] (
    [id] INT NOT NULL IDENTITY(1,1),
    [nombre] NVARCHAR(1000) NOT NULL,
    CONSTRAINT [DisponibilidadViaje_pkey] PRIMARY KEY CLUSTERED ([id])
);

-- AddForeignKey
ALTER TABLE [dbo].[Empleado] ADD CONSTRAINT [Empleado_idDisponibilidadViaje_fkey] FOREIGN KEY ([idDisponibilidadViaje]) REFERENCES [dbo].[DisponibilidadViaje]([id]) ON DELETE NO ACTION ON UPDATE NO ACTION;

COMMIT TRAN;

END TRY
BEGIN CATCH

IF @@TRANCOUNT > 0
BEGIN
    ROLLBACK TRAN;
END;
THROW

END CATCH
