-- Paquetes de hotel: el cobro se calcula por noche. La característica se activa
-- en el paquete y al facturar se indican la tarifa y la cantidad de noches; el
-- precio base de la factura es el producto de ambas.
ALTER TABLE "paquetes" ADD COLUMN "cobro_por_noche" BOOLEAN NOT NULL DEFAULT false;

-- Los modos son excluyentes: en un paquete por noche la tarifa ya se ajusta en
-- cada factura, así que no tiene sentido marcarlo además como precio abierto.
ALTER TABLE "paquetes" ADD CONSTRAINT "chk_paquetes_modo_precio"
  CHECK (NOT ("precio_abierto" AND "cobro_por_noche"));

-- La tarifa aplicada y las noches quedan guardadas en la factura: el histórico
-- no depende de que el paquete conserve la tarifa con que se cobró.
ALTER TABLE "facturas" ADD COLUMN "noches" INTEGER;
ALTER TABLE "facturas" ADD COLUMN "precio_noche" DECIMAL(10,2);

ALTER TABLE "facturas" ADD CONSTRAINT "chk_facturas_noches"
  CHECK ("noches" IS NULL OR "noches" > 0);
ALTER TABLE "facturas" ADD CONSTRAINT "chk_facturas_precio_noche"
  CHECK ("precio_noche" IS NULL OR "precio_noche" >= 0);
