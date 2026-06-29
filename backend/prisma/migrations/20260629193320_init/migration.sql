-- CreateTable
CREATE TABLE "categorias" (
    "id" SERIAL NOT NULL,
    "nombre" VARCHAR(100) NOT NULL,
    "descripcion" TEXT,

    CONSTRAINT "categorias_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "clientes" (
    "id" SERIAL NOT NULL,
    "nombre" VARCHAR(150) NOT NULL,
    "cedula" VARCHAR(30) NOT NULL,
    "telefono" VARCHAR(30),
    "fecha_inicio" DATE NOT NULL,
    "observaciones" TEXT,
    "estado" VARCHAR(20) NOT NULL DEFAULT 'activo',

    CONSTRAINT "clientes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "facturas" (
    "id" SERIAL NOT NULL,
    "cliente_id" INTEGER NOT NULL,
    "paquete_id" INTEGER NOT NULL,
    "usuario_id" INTEGER,
    "fecha_facturacion" DATE NOT NULL DEFAULT CURRENT_DATE,
    "fecha_proximo_pago" DATE NOT NULL,
    "monto" DECIMAL(10,2) NOT NULL,

    CONSTRAINT "facturas_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "paquetes" (
    "id" SERIAL NOT NULL,
    "nombre" VARCHAR(150) NOT NULL,
    "precio" DECIMAL(10,2) NOT NULL,
    "categoria_id" INTEGER NOT NULL,
    "duracion_dias" INTEGER NOT NULL,
    "estado" VARCHAR(20) NOT NULL DEFAULT 'activo',

    CONSTRAINT "paquetes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "usuarios" (
    "id" SERIAL NOT NULL,
    "nombre" VARCHAR(150) NOT NULL,
    "email" VARCHAR(150) NOT NULL,
    "password_hash" VARCHAR(255) NOT NULL,

    CONSTRAINT "usuarios_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "categorias_nombre_key" ON "categorias"("nombre");

-- CreateIndex
CREATE UNIQUE INDEX "clientes_cedula_key" ON "clientes"("cedula");

-- CreateIndex
CREATE INDEX "idx_clientes_estado" ON "clientes"("estado");

-- CreateIndex
CREATE INDEX "idx_clientes_fecha_inicio" ON "clientes"("fecha_inicio");

-- CreateIndex
CREATE INDEX "idx_clientes_nombre" ON "clientes"("nombre");

-- CreateIndex
CREATE INDEX "idx_facturas_cliente_id" ON "facturas"("cliente_id");

-- CreateIndex
CREATE INDEX "idx_facturas_fecha_facturacion" ON "facturas"("fecha_facturacion");

-- CreateIndex
CREATE INDEX "idx_facturas_fecha_proximo_pago" ON "facturas"("fecha_proximo_pago");

-- CreateIndex
CREATE INDEX "idx_facturas_paquete_id" ON "facturas"("paquete_id");

-- CreateIndex
CREATE INDEX "idx_paquetes_categoria_id" ON "paquetes"("categoria_id");

-- CreateIndex
CREATE INDEX "idx_paquetes_estado" ON "paquetes"("estado");

-- CreateIndex
CREATE INDEX "idx_paquetes_nombre" ON "paquetes"("nombre");

-- CreateIndex
CREATE UNIQUE INDEX "usuarios_email_key" ON "usuarios"("email");

-- AddForeignKey
ALTER TABLE "facturas" ADD CONSTRAINT "facturas_cliente_id_fkey" FOREIGN KEY ("cliente_id") REFERENCES "clientes"("id") ON DELETE RESTRICT ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "facturas" ADD CONSTRAINT "facturas_paquete_id_fkey" FOREIGN KEY ("paquete_id") REFERENCES "paquetes"("id") ON DELETE RESTRICT ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "facturas" ADD CONSTRAINT "facturas_usuario_id_fkey" FOREIGN KEY ("usuario_id") REFERENCES "usuarios"("id") ON DELETE SET NULL ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "paquetes" ADD CONSTRAINT "paquetes_categoria_id_fkey" FOREIGN KEY ("categoria_id") REFERENCES "categorias"("id") ON DELETE RESTRICT ON UPDATE NO ACTION;
