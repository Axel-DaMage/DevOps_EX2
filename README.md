# Innovatech Inventory Desk

Aplicacion de gestion de inventario y tickets con arquitectura de 3 capas orquestada en AWS ECS Fargate.

## Arquitectura en AWS

```
VPC 10.0.0.0/16
├── Subred Web (publica)  10.0.1.0/24 y 10.0.10.0/24
│   ├── Internet Gateway
│   ├── NAT Gateway
│   └── ALB (internet-facing, :80)
├── Subred App (privada)  10.0.2.0/24 y 10.0.20.0/24
│   └── ECS Fargate
│       ├── frontend-service (nginx :80)
│       └── backend-service  (node :8080)
└── Subred DB (privada)   10.0.3.0/24 y 10.0.30.0/24
    └── EC2 MySQL 8 (10.0.1.56, :3306)
```

### Componentes

- **ALB**: Application Load Balancer con path routing. `/*` al frontend, `/api/*` al backend.
- **Frontend**: React + Vite, servido por nginx en ECS Fargate (CPU 256, RAM 512).
- **Backend**: Node.js + Express, API REST en ECS Fargate (CPU 256, RAM 512).
- **Base de datos**: MySQL 8 en EC2 t2.micro, subred privada.
- **ECR**: Repositorios privados `innovatech/frontend` y `innovatech/backend`.
- **CloudWatch**: Logs centralizados y metricas de CPU/memoria.
- **Autoscaling**: Target Tracking al 50% CPU, min 1, max 3 tareas por servicio.

## Pipeline CI/CD

El workflow de GitHub Actions se activa con push a la rama `deploy`:

1. **build-and-push-backend**: Construye imagen Docker y la publica en ECR.
2. **build-and-push-frontend**: Construye imagen Docker con VITE_API_URL=/api y la publica en ECR.
3. **deploy**: Ejecuta `ecs update-service --force-new-deployment` en ambos servicios y espera estabilidad.

### Metricas del Pipeline

| Elemento | Resultado |
|---|---|
| Tiempo Total Pipeline | 3 min 39 seg |
| Tiempo Build Backend | 20 seg |
| Tiempo Build Frontend | 29 seg |
| Tiempo Deploy (ECS) | 3 min 0 seg |
| Consumo CPU Frontend | 0.05 % promedio |
| Consumo CPU Backend | 7.38 % promedio (peak 16.87 %) |
| Uso Memoria Frontend | 2.5 MB de 512 MB |
| Uso Memoria Backend | 26.4 MB de 512 MB |
| Errores en Pipeline | 0 |

## Estructura del Repositorio

```
.
├── README.md
├── .github/workflows/deploy.yml
├── bd/
│   ├── schema.sql
│   └── seed.sql
├── backend/
│   ├── Dockerfile
│   ├── package.json
│   └── src/
├── frontend/
│   ├── Dockerfile
│   ├── nginx.conf
│   ├── package.json
│   ├── vite.config.js
│   └── src/
└── docker-compose/
    └── docker-compose.yml
```

## Variables de Entorno

### Frontend
- `VITE_API_URL`: URL de la API (ej: `/api` para proxy nginx)

### Backend
- `PORT`, `DB_HOST`, `DB_PORT`, `DB_NAME`, `DB_USER`, `DB_PASSWORD`, `CORS_ORIGIN`

### Base de Datos
- `MYSQL_ROOT_PASSWORD`, `MYSQL_DATABASE`, `MYSQL_USER`, `MYSQL_PASSWORD`

## Requerimientos Funcionales

### Inventario
- CRUD de productos (nombre, categoria, stock, ubicacion)
- Marcado de stock bajo

### Tickets
- CRUD de tickets (titulo, descripcion, prioridad, estado)
- Asociacion opcional a un producto

### Dashboard
- Total productos, total tickets, stock bajo, tickets abiertos

## Despliegue Local

```bash
# Base de datos
docker run -d --name mysql -e MYSQL_ROOT_PASSWORD=root -e MYSQL_DATABASE=appdb -p 3306:3306 mysql:8

# Backend
cd backend && npm install && npm run dev

# Frontend
cd frontend && npm install && npm run dev
```

O con Docker Compose:

```bash
cd docker-compose && docker compose up -d
```

## Despliegue en AWS

1. Configurar secrets en GitHub (AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY, AWS_SESSION_TOKEN, DB_HOST, etc.)
2. Hacer push a la rama `deploy`
3. El pipeline construye imagenes, las publica en ECR y fuerza nuevo despliegue en ECS
4. La aplicacion queda accesible via URL del ALB

## Comandos Utiles

```bash
# Ver estado de servicios ECS
aws ecs describe-services --cluster innovatech-cluster --services frontend-service backend-service

# Forzar nuevo despliegue
aws ecs update-service --cluster innovatech-cluster --service frontend-service --force-new-deployment

# Ver logs en CloudWatch
aws logs tail /ecs/backend --follow

# Ver metricas de CPU
aws cloudwatch get-metric-statistics --namespace AWS/ECS --metric-name CPUUtilization \
  --dimensions Name=ClusterName,Value=innovatech-cluster Name=ServiceName,Value=backend-service \
  --start-time $(date -d '1 hour ago' -u +%Y-%m-%dT%H:%M:%SZ) --end-time $(date -u +%Y-%m-%dT%H:%M:%SZ) \
  --period 60 --statistics Average
```
