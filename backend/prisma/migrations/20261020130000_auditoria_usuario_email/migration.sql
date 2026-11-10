-- Email del responsable en cada fila de auditoría (PoC 3 de Facturación).
-- Para que la atribución no dependa de que el usuario siga existiendo, se
-- guarda su email junto al id. Se rellena en las filas que ya había.
--
-- El blindaje de la propia tabla auditoria (trigger append-only) vive en el
-- módulo de Auth/Auditoría (PR #45 de Dereck), que es el dueño de esa tabla.
-- Ese trigger deja pasar el ON DELETE SET NULL al borrar un usuario: por eso
-- se guarda el email, que conserva quién fue aunque el id quede en NULL.
-- Orden: esta migración va antes que la del #45, porque el UPDATE de abajo
-- rellena filas viejas y el trigger append-only lo rechazaría.
ALTER TABLE "auditoria" ADD COLUMN "usuario_email" VARCHAR(150);

UPDATE "auditoria" a
SET "usuario_email" = u."email"
FROM "usuarios" u
WHERE a."usuario_id" = u."id";
