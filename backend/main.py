import sys
from pathlib import Path

# Garante que a pasta backend esteja no path de módulos do Python
backend_dir = Path(__file__).resolve().parent
if str(backend_dir) not in sys.path:
    sys.path.insert(0, str(backend_dir))

from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.core.config import settings
from app.core.errors import AgentException, agent_exception_handler, generic_exception_handler
from app.api.routes import router as api_router
from app.db.init_db import init_db
from app.db.database import db


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Inicializa tabelas no Turso / LibSQL se ainda não existirem
    try:
        await init_db()
    except Exception as e:
        print(f"[Aviso] Falha ao inicializar banco de dados: {e}")
    yield
    # Encerra conexões com o banco de dados
    await db.close()


def create_application() -> FastAPI:
    app = FastAPI(
        title=settings.PROJECT_NAME,
        version=settings.VERSION,
        description="API do Agente de Fact-Checking & Jornalismo Investigativo com LangGraph e Groq",
        lifespan=lifespan
    )

    # 1. Configuração de Middleware CORS
    app.add_middleware(
        CORSMiddleware,
        allow_origins=settings.ALLOWED_ORIGINS,
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    # 2. Handlers de Erro Centralizados
    app.add_exception_handler(AgentException, agent_exception_handler)
    app.add_exception_handler(Exception, generic_exception_handler)

    # 3. Rotas da Aplicação
    app.include_router(api_router)

    return app

app = create_application()

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
