-- Revertir deducción de categorías (solo si existía en bases previas)
ALTER TABLE "categorias" DROP COLUMN IF EXISTS "descuento_porcentaje";

-- Facturas: reemplazar descuento_porcentaje por descuento_monto (monto absoluto descontado)
ALTER TABLE "facturas" DROP COLUMN IF EXISTS "descuento_porcentaje";
ALTER TABLE "facturas" ADD COLUMN "descuento_monto" DECIMAL(10,2) NOT NULL DEFAULT 0;

-- Paquetes: deducción automática configurable (monto fijo o porcentaje)
ALTER TABLE "paquetes" ADD COLUMN "descuento_tipo" VARCHAR(20) NOT NULL DEFAULT 'porcentaje';
ALTER TABLE "paquetes" ADD COLUMN "descuento_valor" DECIMAL(10,2) NOT NULL DEFAULT 0;
