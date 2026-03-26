/*
  Warnings:

  - A unique constraint covering the columns `[dni]` on the table `Empleado` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[email]` on the table `Empleado` will be added. If there are existing duplicate values, this will fail.

*/
BEGIN TRY

BEGIN TRAN;

-- AlterTable
ALTER TABLE [dbo].[Empleado] ADD [createdAt] DATETIME2 NOT NULL CONSTRAINT [Empleado_createdAt_df] DEFAULT CURRENT_TIMESTAMP;

-- CreateIndex
ALTER TABLE [dbo].[Empleado] ADD CONSTRAINT [Empleado_dni_key] UNIQUE NONCLUSTERED ([dni]);

-- CreateIndex
ALTER TABLE [dbo].[Empleado] ADD CONSTRAINT [Empleado_email_key] UNIQUE NONCLUSTERED ([email]);

COMMIT TRAN;

END TRY
BEGIN CATCH

IF @@TRANCOUNT > 0
BEGIN
    ROLLBACK TRAN;
END;
THROW

END CATCH
