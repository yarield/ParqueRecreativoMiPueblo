-- Paquetes de precio abierto: el precio se define (o se ajusta) al facturar.
-- El modo se guarda en un booleano explícito y no como "precio NULL", para que
-- un paquete pueda alternar entre fijo y abierto sin perder su precio de
-- referencia.
ALTER TABLE "paquetes" ADD COLUMN "precio_abierto" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "paquetes" ALTER COLUMN "precio" DROP NOT NULL;

-- Comisión del canal de venta (Booking, Expedia, agencia…). No reduce lo que
-- paga el cliente: reduce lo que finalmente recibe el negocio.
ALTER TABLE "facturas" ADD COLUMN "origen" VARCHAR(100);
ALTER TABLE "facturas" ADD COLUMN "comision_tipo" VARCHAR(20) NOT NULL DEFAULT 'porcentaje';
ALTER TABLE "facturas" ADD COLUMN "comision_valor" DECIMAL(10,2) NOT NULL DEFAULT 0;
ALTER TABLE "facturas" ADD COLUMN "comision_monto" DECIMAL(10,2) NOT NULL DEFAULT 0;
ALTER TABLE "facturas" ADD COLUMN "monto_neto" DECIMAL(10,2) NOT NULL DEFAULT 0;

-- Las facturas ya emitidas no tienen comisión: su neto es el monto cobrado.
UPDATE "facturas" SET "monto_neto" = "monto";

ALTER TABLE "facturas" ADD CONSTRAINT "chk_facturas_comision_tipo" CHECK ("comision_tipo" IN ('porcentaje','monto'));
ALTER TABLE "facturas" ADD CONSTRAINT "chk_facturas_comision_valor" CHECK ("comision_valor" >= 0);
ALTER TABLE "facturas" ADD CONSTRAINT "chk_facturas_comision_monto" CHECK ("comision_monto" >= 0);
ALTER TABLE "facturas" ADD CONSTRAINT "chk_facturas_monto_neto" CHECK ("monto_neto" >= 0);
