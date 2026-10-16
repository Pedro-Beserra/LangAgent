"""Script de inicialização e migração do esquema do banco de dados no Turso."""
import logging
from app.db.database import db

logger = logging.getLogger(__name__)

CREATE_USERS_TABLE_SQL = """
CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE,
    password_hash TEXT NOT NULL,
    created_at TEXT NOT NULL DEFAULT (CURRENT_TIMESTAMP)
);
"""

CREATE_USERS_EMAIL_INDEX_SQL = """
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
"""


async def init_db() -> None:
    """Cria as tabelas e índices necessários no Turso se ainda não existirem."""
    logger.info("Inicializando esquema do banco de dados Turso / LibSQL...")
    await db.execute(CREATE_USERS_TABLE_SQL)
    await db.execute(CREATE_USERS_EMAIL_INDEX_SQL)
    logger.info("Tabela 'users' e índices verificados/criados com sucesso.")


if __name__ == "__main__":
    import asyncio
    asyncio.run(init_db())

