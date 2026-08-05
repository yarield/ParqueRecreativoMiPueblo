-- La cédula deja de ser obligatoria: hay clientes menores de edad que no la
-- tienen. El índice único se conserva; Postgres admite varios NULL en él, así
-- que se siguen bloqueando cédulas repetidas entre quienes sí la tienen.
ALTER TABLE "clientes" ALTER COLUMN "cedula" DROP NOT NULL;

-- Las cédulas vacías o en blanco pasan a NULL: de otro modo el índice único
-- solo dejaría existir a un cliente con la cadena vacía.
UPDATE "clientes" SET "cedula" = NULL WHERE btrim("cedula") = '';
