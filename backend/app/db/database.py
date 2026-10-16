"""Módulo de conexão com banco de dados Turso / LibSQL."""
import logging
from typing import Any, Optional
import libsql_client
from app.core.config import settings

logger = logging.getLogger(__name__)

class Database:
    def __init__(self):
        self._client: Optional[libsql_client.Client] = None

    def get_client(self) -> libsql_client.Client:
        if self._client is None:
            url = settings.TURSO_DATABASE_URL
            auth_token = settings.TURSO_AUTH_TOKEN if settings.TURSO_AUTH_TOKEN else None
            
            # Se for SQLite local (file:...), auth_token não deve ser enviado
            if url.startswith("file:"):
                self._client = libsql_client.create_client(url=url)
            else:
                self._client = libsql_client.create_client(url=url, auth_token=auth_token)
            
            logger.info("Cliente LibSQL/Turso conectado com sucesso em: %s", url.split("?")[0])
        return self._client

    async def close(self):
        if self._client is not None:
            await self._client.close()
            self._client = None
            logger.info("Conexão com LibSQL/Turso encerrada.")

    async def execute(self, query: str, args: Optional[list[Any] | tuple[Any, ...]] = None) -> libsql_client.ResultSet:
        client = self.get_client()
        return await client.execute(query, args or [])

    async def fetch_one(self, query: str, args: Optional[list[Any] | tuple[Any, ...]] = None) -> Optional[dict[str, Any]]:
        rs = await self.execute(query, args)
        if not rs.rows:
            return None
        row = rs.rows[0]
        return {col: row[col] for col in rs.columns}

    async def fetch_all(self, query: str, args: Optional[list[Any] | tuple[Any, ...]] = None) -> list[dict[str, Any]]:
        rs = await self.execute(query, args)
        return [{col: row[col] for col in rs.columns} for row in rs.rows]


db = Database()

