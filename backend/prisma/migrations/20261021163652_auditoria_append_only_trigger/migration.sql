-- Bloquea UPDATE y DELETE directos sobre `auditoria`, incluso con el mismo
-- rol de base de datos que usa el backend. Corrige el hallazgo del PoC
-- "Integridad de bitácora de auditoría" (Audit Poisoning): hoy nada impide
-- alterar o borrar una fila de auditoría ya escrita.
--
-- Se implementa como trigger (no como REVOKE de permisos) por dos razones:
-- 1) no depende de conocer/fijar el nombre del rol de conexión en cada
--    entorno, y
-- 2) en este proyecto el backend se conecta como el superusuario `postgres`
--    (verificado en Fase 3), sobre el cual un REVOKE no tendría ningún
--    efecto — un superusuario ignora los permisos de GRANT/REVOKE. Un
--    trigger BEFORE sí se ejecuta igual para cualquier rol, incluido un
--    superusuario, mientras no se deshabilite explícitamente.
--
-- Excepción necesaria: `auditoria.usuario_id` tiene FK a `usuarios` con
-- ON DELETE SET NULL (ver 20260928191837_add_auditoria/migration.sql). Al
-- borrar un usuario, Postgres ejecuta automáticamente un UPDATE interno
-- para anular `usuario_id` en sus filas de auditoría asociadas — eso NO es
-- una alteración de contenido, es integridad referencial normal, y debe
-- permitirse. El trigger distingue ese caso exacto (solo cambia
-- usuario_id, de NOT NULL a NULL, nada más) de cualquier otro UPDATE.

CREATE OR REPLACE FUNCTION bloquear_modificacion_auditoria() RETURNS trigger AS $$
BEGIN
  IF TG_OP = 'UPDATE'
     AND NEW.usuario_id IS NULL
     AND OLD.usuario_id IS NOT NULL
     AND NEW.tabla IS NOT DISTINCT FROM OLD.tabla
     AND NEW.registro_id IS NOT DISTINCT FROM OLD.registro_id
     AND NEW.accion IS NOT DISTINCT FROM OLD.accion
     AND NEW.datos_anteriores IS NOT DISTINCT FROM OLD.datos_anteriores
     AND NEW.datos_nuevos IS NOT DISTINCT FROM OLD.datos_nuevos
     AND NEW.fecha IS NOT DISTINCT FROM OLD.fecha
  THEN
    -- Caso permitido: anulación de usuario_id por ON DELETE SET NULL al
    -- borrarse el usuario autor. No cambia ningún otro campo.
    RETURN NEW;
  END IF;

  RAISE EXCEPTION 'La tabla auditoria es append-only: % no permitido sobre la fila id=%', TG_OP, OLD.id;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS auditoria_append_only ON auditoria;

CREATE TRIGGER auditoria_append_only
  BEFORE UPDATE OR DELETE ON auditoria
  FOR EACH ROW EXECUTE FUNCTION bloquear_modificacion_auditoria();
