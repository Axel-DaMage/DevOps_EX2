# Diagrama de Arquitectura — Innovatech EP3

```mermaid
graph TB
  subgraph Internet
    USUARIO[("Usuario / Navegador")]
  end

  subgraph AWS[ AWS - us-east-1 ]
    subgraph VPC[ VPC 10.0.0.0/16 ]
      
      subgraph Publica[ Subred Web - Pública 10.0.1.0/24 ]
        IGW[Internet Gateway]
        NAT_GB[NAT Gateway]
        ALB[ALB innovatech-alb<br/>:80 internet-facing]
      end

      subgraph Privada_App[ Subred App - Privada 10.0.2.0/24 ]
        ECS[ECS Cluster Fargate<br/>innovatech-cluster]
        
        subgraph Frontend[frontend-service]
          TASK_F[Task: frontend-task<br/>nginx :80<br/>CPU 256 / RAM 512]
        end

        subgraph Backend[backend-service]
          TASK_B[Task: backend-task<br/>node :8080<br/>CPU 256 / RAM 512]
        end
      end

      subgraph Privada_DB[ Subred DB - Privada 10.0.3.0/24 ]
        EC2_MYSQL[EC2 t2.micro<br/>MySQL 8 - :3306<br/>10.0.3.232]
      end

    end
  end

  USUARIO -->|HTTP :80| ALB

  ALB -->|"/* → Frontend TG"| TASK_F
  ALB -->|"/api/* → Backend TG"| TASK_B

  TASK_F -.->|solo estático| TASK_F
  TASK_B -->|TCP :3306| EC2_MYSQL

  TASK_B -.->|pull imágenes| ECR
  TASK_F -.->|pull imágenes| ECR

  subgraph ECR_REG[Amazon ECR]
    ECR_FRONT[innovatech/frontend]
    ECR_BACK[innovatech/backend]
  end

  subgraph GH[GitHub Actions]
    PIPELINE[Pipeline CI/CD<br/>push → build → push ECR → update ECS]
  end

  PIPELINE -.->|push imágenes| ECR_FRONT
  PIPELINE -.->|push imágenes| ECR_BACK
  PIPELINE -.->|force-new-deployment| TASK_F
  PIPELINE -.->|force-new-deployment| TASK_B

  subgraph MONITOREO[CloudWatch]
    LOGS_F[/ecs/frontend]
    LOGS_B[/ecs/backend]
  end

  TASK_F -.->|logs| LOGS_F
  TASK_B -.->|logs| LOGS_B

  IGW --- ALB
  NAT_GB -.->|salida internet| TASK_B
  NAT_GB -.->|salida internet| TASK_F
```

## Flujo de Tráfico

```
1. Usuario → http://innovatech-alb-...elb.amazonaws.com
2. ALB recibe petición en :80
3. ALB evalúa path:
   - / → Frontend TG → frontend-service (nginx, sirve index.html)
   - /api/* → Backend TG → backend-service (node, procesa request)
4. Backend consulta MySQL en 10.0.3.232:3306
5. Respuesta viaja de vuelta: Backend → ALB → Usuario
```

## Resumen de Componentes

| Componente | Propósito |
|---|---|
| ALB | Balanceador, path routing (/* frontend, /api/* backend) |
| Frontend Fargate | Sirve React estático (nginx) |
| Backend Fargate | API REST Node/Express |
| EC2 MySQL | Base de datos persistente |
| ECR | Repositorio de imágenes Docker |
| CloudWatch | Logs centralizados |
| NAT Gateway | Salida a internet desde subredes privadas |
