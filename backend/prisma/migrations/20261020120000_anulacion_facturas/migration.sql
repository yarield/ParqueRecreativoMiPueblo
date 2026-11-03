-- Las facturas ya no se borran: se marcan como anuladas para conservar el
-- registro y poder revisarlo después.
ALTER TABLE "facturas" ADD COLUMN "anulada" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN "anulada_en" TIMESTAMP(3);
