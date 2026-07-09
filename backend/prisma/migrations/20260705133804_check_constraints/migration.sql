-- Enums a nivel de base de datos (defensa en profundidad)
ALTER TABLE "clientes" ADD CONSTRAINT "chk_clientes_estado" CHECK ("estado" IN ('activo','inactivo'));
ALTER TABLE "paquetes" ADD CONSTRAINT "chk_paquetes_estado" CHECK ("estado" IN ('activo','inactivo'));
ALTER TABLE "paquetes" ADD CONSTRAINT "chk_paquetes_unidad" CHECK ("duracion_unidad" IN ('dias','meses'));
ALTER TABLE "paquetes" ADD CONSTRAINT "chk_paquetes_desc_tipo" CHECK ("descuento_tipo" IN ('porcentaje','monto'));

-- Rangos numéricos
ALTER TABLE "paquetes" ADD CONSTRAINT "chk_paquetes_precio" CHECK ("precio" >= 0);
ALTER TABLE "paquetes" ADD CONSTRAINT "chk_paquetes_duracion" CHECK ("duracion_dias" > 0);
ALTER TABLE "paquetes" ADD CONSTRAINT "chk_paquetes_desc_valor" CHECK ("descuento_valor" >= 0);
ALTER TABLE "facturas" ADD CONSTRAINT "chk_facturas_monto" CHECK ("monto" >= 0);
ALTER TABLE "facturas" ADD CONSTRAINT "chk_facturas_precio_base" CHECK ("precio_base" >= 0);
ALTER TABLE "facturas" ADD CONSTRAINT "chk_facturas_descuento" CHECK ("descuento_monto" >= 0);
