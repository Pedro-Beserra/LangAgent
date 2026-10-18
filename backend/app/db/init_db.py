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
    avatar_url TEXT,
    created_at TEXT NOT NULL DEFAULT (CURRENT_TIMESTAMP)
);
"""

CREATE_USERS_EMAIL_INDEX_SQL = """
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
"""


async def init_db() -> None:
    """Cria as tabelas e índices necessários no Turso se ainda não existirem."""
    logger.info("Inicializando esquema do banco de dados Turso / LibSQL...")
    try:
        await db.execute(CREATE_USERS_TABLE_SQL)
        await db.execute(CREATE_USERS_EMAIL_INDEX_SQL)
        
        # Migração segura para adicionar avatar_url se a tabela já existia sem a coluna
        try:
            await db.execute("ALTER TABLE users ADD COLUMN avatar_url TEXT")
        except Exception:
            pass  # Coluna já existe

        logger.info("Tabela 'users' e índices verificados/criados com sucesso.")
    finally:
        await db.close()


if __name__ == "__main__":
    import asyncio
    logging.basicConfig(level=logging.INFO)
    asyncio.run(init_db())

