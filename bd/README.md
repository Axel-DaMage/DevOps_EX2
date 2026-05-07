# Base de Datos

Esta carpeta representa la tercera capa de la solución: la base de datos.

Su propósito es dejar explícito que el proyecto está compuesto por tres componentes separados:

- `frontend`
- `backend`
- `bd`

## Contenido

- `schema.sql`: crea las tablas principales.
- `seed.sql`: inserta datos iniciales.
- `.env.example`: referencia de variables de entorno típicas para MySQL.

## Objetivo para estudiantes

Sobre esta carpeta, la dupla debería ser capaz de:

1. Definir cómo inicializar MySQL en contenedor.
2. Decidir qué volumen usar para persistencia.
3. Justificar cómo asegurar que la información no se pierda al reiniciar.
4. Integrar esta capa con el backend respetando variables de entorno y red.

## Nota docente

No se entrega `Dockerfile` ni `docker-compose.yml` a propósito.
La idea es que cada equipo resuelva la contenerización de esta capa según la estrategia que proponga para su despliegue en EC2.
