##############################################################################
# PromptLab - Terraform Docker Deployment
# Deploys PromptLab API (Node.js + Express + SQLite) and Frontend (Nginx)
##############################################################################

terraform {
  required_version = ">= 1.5.0"

  required_providers {
    docker = {
      source  = "kreuzwerker/docker"
      version = "~> 3.0"
    }
  }
}

provider "docker" {}

# ---------------------------------------------------------------------------
# Network
# ---------------------------------------------------------------------------
resource "docker_network" "promptlab" {
  name   = "promptlab"
  driver = "bridge"
}

# ---------------------------------------------------------------------------
# Persistent volume for SQLite data
# ---------------------------------------------------------------------------
resource "docker_volume" "promptlab_data" {
  name = "promptlab-data"
}

# ---------------------------------------------------------------------------
# Images (built from local Dockerfiles)
# ---------------------------------------------------------------------------
resource "docker_image" "promptlab_api" {
  name = var.api_image_name

  build {
    context = "${path.module}/../backend"
    tag     = ["${var.api_image_name}:latest"]
  }
}

resource "docker_image" "promptlab_frontend" {
  name = var.frontend_image_name

  build {
    context = "${path.module}/../frontend"
    tag     = ["${var.frontend_image_name}:latest"]
  }
}

# ---------------------------------------------------------------------------
# Container: promptlab-api
# ---------------------------------------------------------------------------
resource "docker_container" "promptlab_api" {
  name  = "promptlab-api"
  image = docker_image.promptlab_api.image_id

  ports {
    internal = 3001
    external = var.api_port
  }

  env = [
    "PORT=3001",
    "NODE_ENV=${var.environment}",
  ]

  volumes {
    volume_name    = docker_volume.promptlab_data.name
    container_path = "/app/data"
  }

  networks_advanced {
    name = docker_network.promptlab.id
  }

  healthcheck {
    test         = ["CMD", "curl", "-f", "http://localhost:3001/health"]
    interval     = "30s"
    timeout      = "5s"
    retries      = 3
    start_period = "10s"
  }

  restart = "unless-stopped"
}

# ---------------------------------------------------------------------------
# Container: promptlab-frontend
# ---------------------------------------------------------------------------
resource "docker_container" "promptlab_frontend" {
  name  = "promptlab-frontend"
  image = docker_image.promptlab_frontend.image_id

  ports {
    internal = 80
    external = var.frontend_port
  }

  networks_advanced {
    name = docker_network.promptlab.id
  }

  depends_on = [
    docker_container.promptlab_api,
  ]

  restart = "unless-stopped"
}
