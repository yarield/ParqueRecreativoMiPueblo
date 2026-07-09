-- AlterTable
ALTER TABLE "categorias" ADD COLUMN     "descuento_porcentaje" DECIMAL(5,2) NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE "facturas" ADD COLUMN     "descuento_porcentaje" DECIMAL(5,2) NOT NULL DEFAULT 0,
ADD COLUMN     "precio_base" DECIMAL(10,2) NOT NULL DEFAULT 0;
