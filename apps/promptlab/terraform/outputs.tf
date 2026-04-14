##############################################################################
# PromptLab - Outputs
##############################################################################

output "api_url" {
  description = "URL of the PromptLab API"
  value       = "http://localhost:${var.api_port}"
}

output "frontend_url" {
  description = "URL of the PromptLab Frontend"
  value       = "http://localhost:${var.frontend_port}"
}

output "container_ids" {
  description = "IDs of the deployed Docker containers"
  value = {
    api      = docker_container.promptlab_api.id
    frontend = docker_container.promptlab_frontend.id
  }
}

output "network_name" {
  description = "Name of the Docker network used by PromptLab"
  value       = docker_network.promptlab.name
}
