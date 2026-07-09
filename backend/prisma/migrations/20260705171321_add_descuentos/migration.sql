-- Facturas: precio base antes de aplicar deducción (para historial)
ALTER TABLE "facturas" ADD COLUMN "precio_base" DECIMAL(10,2) NOT NULL DEFAULT 0;
ALTER TABLE "facturas" ADD CONSTRAINT "chk_facturas_precio_base" CHECK ("precio_base" >= 0);
