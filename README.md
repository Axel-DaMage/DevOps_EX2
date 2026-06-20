# Innovatech Inventory Desk

Proyecto base para una evaluacion de DevOps con arquitectura de 3 capas:

- `frontend`: aplicacion React para gestion de inventario y tickets.
- `backend`: API REST en Node.js + Express.
- `bd`: capa de base de datos MySQL con scripts de inicializacion.

La solucion esta pensada para un escenario "on-premise" que luego debe ser llevado a AWS con tres instancias EC2:

- EC2 Frontend en subred publica.
- EC2 Backend en subred privada.
- EC2 Base de datos en subred privada.

La separacion en carpetas busca que cada capa pueda tener su propia estrategia de contenerizacion y su propio `Dockerfile`.

## Regla de despliegue esperada

La solucion debe separarse en tres capas independientes:

- `frontend`: una instancia EC2 publica.
- `backend`: una instancia EC2 privada.
- `bd`: una instancia EC2 privada.

Cada carpeta representa una capa del sistema. Se espera que cada capa pueda contenerizarse de manera independiente y que la solucion final respete esta separacion al desplegarse en AWS.

## Contexto del caso

Innovatech Chile necesita una aplicacion interna sencilla para:

- registrar productos de inventario.
- consultar stock disponible.
- crear tickets de soporte relacionados a productos o incidencias internas.
- actualizar estado y prioridad de tickets.

La aplicacion esta funcional pero incompleta desde el punto de vista DevOps. El equipo debe tomar esta base y prepararla para ejecucion containerizada, despliegue automatizado y operacion en AWS.

## Estructura del repositorio

```text
.
|-- README.md
|-- bd
|   |-- .env.example
|   |-- README.md
|   |-- schema.sql
|   `-- seed.sql
|-- backend
|   |-- .env.example
|   |-- package.json
|   `-- src
`-- frontend
    |-- .env.example
    |-- index.html
    |-- package.json
    |-- vite.config.js
    `-- src
```

## Que incluye esta base

- codigo fuente del frontend.
- codigo fuente del backend.
- carpeta `bd` separada para representar la tercera capa.
- scripts SQL para crear esquema y datos iniciales.
- variables de entorno de ejemplo.
- README con guia de trabajo.

## Que NO incluye a proposito

Esto queda como trabajo del estudiante:

- `Dockerfile` para `frontend`.
- `Dockerfile` para `backend`.
- estrategia de contenerizacion para `bd`.
- `docker-compose.yml`.
- workflows de GitHub Actions.
- despliegue en EC2.
- configuracion final de secretos.
- versionado Git y estrategia de ramas.

## Arquitectura esperada en AWS

### Frontend

- desplegado en una EC2 publica.
- accesible por IP publica o DNS.
- consume la API del backend por variable de entorno.

### Backend

- desplegado en una EC2 privada.
- no deberia quedar expuesto a Internet.
- acepta trafico solo desde frontend.

### Base de datos

- desplegada en una EC2 privada.
- acepta conexiones solo desde backend.
- debe demostrar persistencia tras reinicio.

## Requerimientos funcionales

### Inventario

- listar productos.
- crear productos.
- editar nombre, categoria, stock y ubicacion.
- eliminar productos.
- marcar productos con stock bajo.

### Tickets

- listar tickets.
- crear tickets.
- asociar ticket a un producto opcionalmente.
- editar prioridad y estado.
- eliminar tickets.

### Resumen operacional

La interfaz muestra:

- cantidad total de productos.
- cantidad total de tickets.
- cantidad de productos con stock bajo.
- cantidad de tickets abiertos.

## Variables de entorno

### Frontend

Archivo base: [frontend/.env.example](/D:/proyectos/duoc/devops/frontend/.env.example)

```env
VITE_API_URL=http://localhost:3001
```

### Backend

Archivo base: [backend/.env.example](/D:/proyectos/duoc/devops/backend/.env.example)

- `PORT`
- `DB_HOST`
- `DB_PORT`
- `DB_NAME`
- `DB_USER`
- `DB_PASSWORD`
- `CORS_ORIGIN`

### Base de datos

Archivo base: [bd/.env.example](/D:/proyectos/duoc/devops/bd/.env.example)

- `MYSQL_DATABASE`
- `MYSQL_USER`
- `MYSQL_PASSWORD`
- `MYSQL_ROOT_PASSWORD`

## Preparacion local sugerida

### 1. Base de datos

Crear una base de datos MySQL:

```sql
CREATE DATABASE innovatech_ops;
```

Luego ejecutar:

- [bd/schema.sql](/D:/proyectos/duoc/devops/bd/schema.sql)
- [bd/seed.sql](/D:/proyectos/duoc/devops/bd/seed.sql)

### 2. Backend

```bash
cd backend
npm install
npm run dev
```

### 3. Frontend

```bash
cd frontend
npm install
npm run dev
```

## Trabajo esperado del estudiante

1. Crear un `Dockerfile` para `frontend`.
2. Crear un `Dockerfile` para `backend`.
3. Resolver la contenerizacion de `bd` como tercera capa.
4. Crear `docker-compose.yml` para levantar la solucion completa.
5. Definir volumenes para persistencia.
6. Justificar el uso de `bind mount` o `named volume`.
7. Publicar imagenes en ECR o Docker Hub.
8. Implementar GitHub Actions.
9. Automatizar despliegue hacia EC2 usando la rama `deploy`.
10. Documentar secretos, variables y pasos de operacion.

## Guia de trabajo sugerida para estudiantes

### Etapa 1: entender la solucion

Antes de contenerizar, la dupla deberia identificar:

- que hace el frontend.
- que endpoints consume.
- que variables necesita el backend.
- como se conecta el backend a MySQL.
- que papel cumple la carpeta `bd`.

### Etapa 2: preparar contenedores

Se espera que construyan:

- un `Dockerfile` para el frontend.
- un `Dockerfile` para el backend.
- una estrategia clara para la carpeta `bd`.
- un `docker-compose.yml` para ambiente integrado.

Al menos deberian resolver:

- instalacion de dependencias.
- build del frontend.
- exposicion de puertos.
- variables de entorno.
- orden logico de servicios.

### Etapa 3: persistencia

La pauta pone mucho foco aqui, asi que deberian demostrar:

- que servicio necesita persistencia.
- que volumen usaron.
- por que eligieron `bind mount` o `named volume`.
- como comprueban que los datos permanecen tras reiniciar contenedores.

Sugerencia: para este caso, la persistencia principal deberia estar en MySQL.

### Etapa 4: despliegue en EC2

La solucion final deberia respetar esta topologia:

- frontend en EC2 publica.
- backend en EC2 privada.
- base de datos en EC2 privada.

Y ademas demostrar:

- que el frontend accede al backend.
- que el backend accede a MySQL.
- que el frontend no accede directamente a la base de datos.

### Etapa 5: pipeline CI/CD

Cada componente que corresponda debe automatizar:

1. build de imagen.
2. push a registry.
3. deploy en la EC2 correspondiente.

El trigger esperado por la pauta es un push sobre la rama `deploy`.

## Checklist de entrega

- aplicacion funcional en navegador.
- backend funcional con conexion real a MySQL.
- separacion visible entre `frontend`, `backend` y `bd`.
- Dockerfiles presentes y documentados.
- `docker-compose.yml` funcional.
- persistencia demostrable.
- workflow de GitHub Actions implementado.
- uso de secrets para credenciales.
- despliegue hacia EC2 automatizado.
- README claro y suficiente para reproducir el flujo.

## Minimos esperados

Para considerar la solucion completa, la dupla debe demostrar:

- frontend funcionando desde la EC2 publica.
- backend funcionando en EC2 privada y respondiendo al frontend.
- base de datos funcionando en EC2 privada.
- persistencia de datos tras reiniciar contenedores.
- despliegue automatizado mediante GitHub Actions.

## Recomendacion para video

Conviene pedir que muestren:

1. estructura del proyecto con tres carpetas.
2. Dockerfiles y `docker-compose.yml`.
3. volumenes configurados.
4. workflow de GitHub Actions.
5. push a rama `deploy`.
6. estado de contenedores en EC2.
7. prueba funcional desde navegador.
8. evidencia de persistencia.

Commit
