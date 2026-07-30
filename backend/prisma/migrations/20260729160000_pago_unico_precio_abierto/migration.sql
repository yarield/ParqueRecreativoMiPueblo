-- Los paquetes de precio abierto (reservas de hotel y similares) son cobros de
-- una sola vez: no generan un próximo pago. La fecha pasa a ser opcional y un
-- NULL significa "pago único, sin ciclo siguiente".
--
-- Las facturas existentes conservan su fecha, así que el histórico y los
-- cálculos de mora no cambian.
ALTER TABLE "facturas" ALTER COLUMN "fecha_proximo_pago" DROP NOT NULL;
