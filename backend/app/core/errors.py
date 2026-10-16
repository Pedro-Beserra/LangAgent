import traceback
from fastapi import Request, status
from fastapi.responses import JSONResponse

class AgentException(Exception):
    """Exceção base para erros ocorridos durante a execução do agente."""
    def __init__(self, message: str, stage: str = "general", details: str | None = None):
        super().__init__(message)
        self.message = message
        self.stage = stage  # 'planner', 'researcher', 'fact_checker', 'groq_auth'
        self.details = details

class GroqAuthError(AgentException):
    def __init__(self, message: str = "Chave da API Groq inválida ou ausente.", details: str | None = None):
        super().__init__(message=message, stage="groq_auth", details=details)

class ResearchToolError(AgentException):
    def __init__(self, message: str, tool_name: str, details: str | None = None):
        super().__init__(message=f"Falha na ferramenta '{tool_name}': {message}", stage="researcher", details=details)


async def agent_exception_handler(request: Request, exc: AgentException):
    return JSONResponse(
        status_code=status.HTTP_400_BAD_REQUEST,
        content={
            "success": False,
            "error_type": exc.__class__.__name__,
            "stage": exc.stage,
            "message": exc.message,
            "details": exc.details
        }
    )

async def generic_exception_handler(request: Request, exc: Exception):
    error_trace = traceback.format_exc()
    return JSONResponse(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        content={
            "success": False,
            "error_type": "InternalServerError",
            "stage": "unknown",
            "message": f"Erro inesperado no servidor: {str(exc)}",
            "details": error_trace
        }
    )

