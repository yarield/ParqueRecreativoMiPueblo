-- Se elimina la deducción automática por paquete. El descuento al cliente pasa
-- a definirse únicamente en cada factura (campo "Descuento adicional"), que ya
-- guarda su resultado congelado en facturas.descuento_monto: el histórico no
-- cambia.
--
-- Valores existentes al momento de la migración, por si hiciera falta
-- reponerlos manualmente:
--   paquete #9  "15 dias"            -> 500  (monto)
--   paquete #1  "Natacion de bebes"  -> 5000 (monto)
ALTER TABLE "paquetes" DROP CONSTRAINT IF EXISTS "chk_paquetes_desc_tipo";
ALTER TABLE "paquetes" DROP CONSTRAINT IF EXISTS "chk_paquetes_desc_valor";
ALTER TABLE "paquetes" DROP COLUMN "descuento_tipo";
ALTER TABLE "paquetes" DROP COLUMN "descuento_valor";
