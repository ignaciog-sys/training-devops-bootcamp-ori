##############################################################################
# PromptLab - Input Variables
##############################################################################

variable "api_port" {
  description = "External port for the PromptLab API container"
  type        = number
  default     = 3001
}

variable "frontend_port" {
  description = "External port for the PromptLab Frontend container"
  type        = number
  default     = 8080
}

variable "environment" {
  description = "Deployment environment (development, staging, production)"
  type        = string
  default     = "production"

  validation {
    condition     = contains(["development", "staging", "production"], var.environment)
    error_message = "Environment must be one of: development, staging, production."
  }
}

variable "api_image_name" {
  description = "Docker image name for the PromptLab API"
  type        = string
  default     = "promptlab-api"
}

variable "frontend_image_name" {
  description = "Docker image name for the PromptLab Frontend"
  type        = string
  default     = "promptlab-frontend"
}
