-- CreateTable
CREATE TABLE "auditoria" (
    "id" SERIAL NOT NULL,
    "tabla" VARCHAR(50) NOT NULL,
    "registro_id" INTEGER NOT NULL,
    "accion" VARCHAR(20) NOT NULL,
    "usuario_id" INTEGER,
    "datos_anteriores" JSONB,
    "datos_nuevos" JSONB,
    "fecha" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "auditoria_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "idx_auditoria_tabla_registro" ON "auditoria"("tabla", "registro_id");

-- CreateIndex
CREATE INDEX "idx_auditoria_fecha" ON "auditoria"("fecha");

-- AddForeignKey
ALTER TABLE "auditoria" ADD CONSTRAINT "auditoria_usuario_id_fkey" FOREIGN KEY ("usuario_id") REFERENCES "usuarios"("id") ON DELETE SET NULL ON UPDATE NO ACTION;
