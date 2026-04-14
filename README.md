# Training DevOps Bootcamp

Repositorio de trabajo para el **Bootcamp DevOps 2026** (T-Systems + Universidad de Granada).

---

## Material del bootcamp

Slides, workshops, laboratorios y cheat-sheets estan en la plataforma del curso:

**[carlospalanca.es/cursos](https://carlospalanca.es/cursos)**

El instructor os dara la contrasenya de acceso el primer dia.

| Dia | Temas | Que haceis con PromptLab |
|-----|-------|--------------------------|
| Dia 1 | Git, Docker, Docker Compose | Dockerizar la app |
| Dia 2 | CI/CD, GitHub Actions | Pipeline automatico: test, lint, build, push |
| Dia 3 | Kubernetes, Helm, GitOps con ArgoCD | Deploy en K8s, Helm chart, auto-sync |
| Dia 4 | Terraform, Prometheus, Grafana | IaC + monitorizacion completa |

---

## La app: PromptLab

**PromptLab** es una app para guardar, organizar y probar prompts de IA. Es el hilo conductor de todo el bootcamp — la misma app recorre Docker, CI/CD, Kubernetes y monitoring.

```
apps/promptlab/
├── backend/        Node.js + Express + SQLite (puerto 3001)
├── frontend/       HTML/CSS/JS + Nginx
├── k8s/            Manifiestos Kubernetes
├── helm/           Helm chart
├── terraform/      Configuracion Terraform (Docker provider)
├── monitoring/     Prometheus + Grafana
└── docker-compose.yml
```

**Stack:** Node.js 20, Express, SQLite, Nginx, Prometheus metrics

**Endpoints:** `/health`, `/metrics`, `/api/prompts`, `/api/prompts/:id/run`, `/api/categories`

**Tests:** `cd apps/promptlab/backend && npm install && npm test` (14 tests)

---

## Preparar el entorno

Antes del primer dia, necesitais:

- Windows 10/11 con **WSL2 + Ubuntu**
- **Docker Desktop** con integracion WSL2
- **Git** + cuenta GitHub
- **VS Code** con extension WSL
- **Node.js 20**, **kubectl**, **kind**, **helm**, **terraform** (dentro de WSL2)

Si vuestra red usa proxy corporativo, seguid la guia **WSL2 Proxy** en la plataforma.

La guia paso a paso completa esta en la plataforma del curso (Dia 0 — Setup del entorno).

---

## Empezar a trabajar

1. **Forkead** este repositorio a vuestra cuenta de GitHub (boton "Fork" arriba a la derecha).

2. **Clonad** vuestro fork dentro de WSL2:

```bash
cd ~/bootcamp
git clone https://github.com/TU-USUARIO/training-devops-bootcamp.git
cd training-devops-bootcamp
```

3. **Verificad** que la app funciona:

```bash
cd apps/promptlab/backend
npm install
npm test
# 14 tests passing
```

4. Abrid VS Code:

```bash
code .
```

Ya estais listos para el Dia 1.

---

## Que vais a construir

| Dia | Que anadis | Resultado |
|-----|-----------|-----------|
| Dia 1 | Dockerfiles + Docker Compose | PromptLab corriendo en contenedores |
| Dia 2 | Pipeline CI/CD | Tests, lint y build automaticos en cada push |
| Dia 3 | Deploy en Kubernetes + Helm + ArgoCD | PromptLab en un cluster K8s con GitOps |
| Dia 4 | Terraform + Prometheus + Grafana | Infraestructura como codigo + dashboard de metricas |

---

## Reglas del repositorio

- Trabajad siempre en vuestra copia (fork). No modifiqueis el repo original.
- Haced commits frecuentes con mensajes descriptivos.
- Si algo se rompe, `git log` para ver que cambio y `git diff` para ver que es diferente.
