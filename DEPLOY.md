# Guía de despliegue — Sistema Natación (Ubuntu Server)

Guía para montar la app (backend Express + PostgreSQL + frontend React) en una PC
con Ubuntu Server, accesible desde la red local y desde internet vía Cloudflare Tunnel.

> Reemplaza los valores entre `<...>` y las claves de ejemplo por los tuyos.

---

## 1. Hardware (qué PC)

La app es liviana, casi cualquier PC sirve:

- **CPU:** 2 núcleos (cualquier PC/mini-PC/laptop de la última década).
- **RAM:** 4 GB recomendado (2 GB mínimo).
- **Disco:** SSD de 20–60 GB (la base de datos será de pocos MB).
- **Red:** conéctala por **cable Ethernet** al router (más estable que WiFi).
- **Extra:** que quede siempre encendida; un **UPS/no-break** ayuda a no perder datos en cortes de luz.

---

## 2. Software a instalar

- **Ubuntu Server 24.04 LTS**
- **Node.js 22 LTS** (corre el backend)
- **PostgreSQL 16** (base de datos)
- **Nginx** (sirve el frontend y hace de puente al backend)
- **PM2** (mantiene el backend vivo y lo arranca al encender)
- **git, ufw** (firewall)

---

## 3. Instalación paso a paso

### a) Actualizar e instalar todo
```bash
sudo apt update && sudo apt upgrade -y
curl -fsSL https://deb.nodesource.com/setup_22.x | sudo -E bash -
sudo apt install -y nodejs postgresql nginx git
sudo npm install -g pm2
```

### b) Crear la base de datos
```bash
sudo -u postgres psql
```
Dentro de psql:
```sql
CREATE DATABASE natacion;
CREATE USER natacion_user WITH PASSWORD '<una_clave_fuerte>';
GRANT ALL PRIVILEGES ON DATABASE natacion TO natacion_user;
\q
```

### c) Traer el proyecto
```bash
cd /opt && sudo git clone <URL_DE_TU_REPO> natacion
sudo chown -R $USER:$USER /opt/natacion
```

### d) Backend
```bash
cd /opt/natacion/backend
npm ci

# crear el archivo .env
cat > .env <<'EOF'
DATABASE_URL="postgresql://natacion_user:<una_clave_fuerte>@localhost:5432/natacion"
JWT_SECRET="<una_cadena_larga_y_aleatoria>"
PORT=3000
EOF

npx prisma migrate deploy      # aplica todas las migraciones
npx prisma generate
npm run build                  # genera dist/
pm2 start dist/server.js --name natacion-api
```

> Para generar un JWT_SECRET aleatorio: `openssl rand -base64 48`

### e) Frontend
El código ya usa ruta relativa `/api` (funciona detrás de Nginx). Solo compilar y copiar:
```bash
cd /opt/natacion/frontend
npm ci
npm run build                  # genera dist/ (archivos estáticos)
sudo cp -r dist /var/www/natacion
```

### f) Nginx (sirve el frontend y redirige /api al backend)
```bash
sudo tee /etc/nginx/sites-available/natacion <<'EOF'
server {
    listen 80;
    server_name _;
    root /var/www/natacion;
    index index.html;

    location /api/ {
        proxy_pass http://localhost:3000;
    }
    location / {
        try_files $uri /index.html;   # routing de React
    }
}
EOF
sudo ln -s /etc/nginx/sites-available/natacion /etc/nginx/sites-enabled/
sudo rm -f /etc/nginx/sites-enabled/default
sudo nginx -t && sudo systemctl reload nginx
```

### g) Firewall + arranque automático
```bash
sudo ufw allow OpenSSH
sudo ufw allow 'Nginx Full'
sudo ufw enable
pm2 startup   # ejecuta el comando que te muestre
pm2 save
```

---

## 4. Acceso desde la red local

- Averigua la IP del servidor: `ip a` (algo como `192.168.1.50`).
- Desde cualquier PC/celular de la **misma red**: `http://192.168.1.50`
- **Recomendado:** reserva una IP fija para el servidor en el router (por DHCP).

---

## 5. Acceso desde internet (Cloudflare Tunnel)

Es la mejor opción para una PC en casa/local: **gratis**, **sin abrir puertos en el
router**, con **HTTPS automático** y funciona aunque tu IP pública cambie.

### Requisito: un dominio
Cloudflare gestiona el DNS y el túnel gratis, pero **necesitas un nombre de dominio**:
- Comprar uno barato (~$3–10 USD/año: `.com`, `.xyz`, etc.).
- Para **probar sin dominio**: `cloudflared tunnel --url http://localhost:80` da una URL
  temporal `*.trycloudflare.com` (cambia en cada reinicio; solo para pruebas).

### Pasos del túnel
El backend y Nginx quedan igual (Nginx en el puerto 80 local). El túnel solo conecta
ese Nginx con internet:
```bash
# 1. Instalar cloudflared
curl -L https://github.com/cloudflare/cloudflared/releases/latest/download/cloudflared-linux-amd64.deb -o cloudflared.deb
sudo dpkg -i cloudflared.deb

# 2. Autorizar tu dominio (abre un enlace en el navegador)
cloudflared tunnel login

# 3. Crear el túnel y apuntarlo a tu dominio
cloudflared tunnel create natacion
cloudflared tunnel route dns natacion natacion.<tudominio.com>

# 4. Config: mandar el tráfico del túnel a tu Nginx local (puerto 80)
#    Edita ~/.cloudflared/config.yml con el ingress apuntando a http://localhost:80
#    (ejemplo abajo)

# 5. Que arranque solo al encender la PC
cloudflared service install
```

Ejemplo de `~/.cloudflared/config.yml`:
```yaml
tunnel: natacion
credentials-file: /root/.cloudflared/<ID_DEL_TUNEL>.json

ingress:
  - hostname: natacion.<tudominio.com>
    service: http://localhost:80
  - service: http_status:404
```

Resultado: entras desde cualquier lado con `https://natacion.<tudominio.com>`, y dentro
del local sigue funcionando por IP.

---

## 6. ⚠️ Seguridad ANTES de exponer a internet

- **Cerrar el registro público de usuarios.** Hoy `POST /api/auth/register` no pide
  autenticación: en internet cualquiera podría crearse una cuenta y ver/editar todos los
  datos. Hay que dejar que solo un admin autenticado cree usuarios (o desactivar la ruta).
- **JWT_SECRET** largo y aleatorio (no el de ejemplo).
- **PostgreSQL solo en localhost** (nunca abierto al exterior) — así queda por defecto.
- **Cloudflare Access** (opcional) para añadir un login extra antes de la app.
- Mantener Ubuntu actualizado (`sudo apt update && sudo apt upgrade`) + `fail2ban` para SSH.
- **Backups automáticos** de la base de datos (cron con `pg_dump`).

Ejemplo de backup diario (crontab `crontab -e`):
```bash
0 2 * * * pg_dump -U natacion_user natacion > /opt/backups/natacion_$(date +\%F).sql
```

---

## 7. Comandos útiles de mantenimiento

```bash
pm2 status                 # ver estado del backend
pm2 logs natacion-api      # ver logs del backend
pm2 restart natacion-api   # reiniciar backend

# Actualizar la app tras cambios en el repo:
cd /opt/natacion && git pull
cd backend  && npm ci && npx prisma migrate deploy && npm run build && pm2 restart natacion-api
cd ../frontend && npm ci && npm run build && sudo cp -r dist/* /var/www/natacion/
```
