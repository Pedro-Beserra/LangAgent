"""Dependências de injeção para autenticação em rotas FastAPI."""
from typing import Optional, Any
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from app.core.security import decode_access_token
from app.db.database import db

security = HTTPBearer(auto_error=False)


async def get_current_user_optional(
    credentials: Optional[HTTPAuthorizationCredentials] = Depends(security)
) -> Optional[dict[str, Any]]:
    """Extrai e valida o token JWT do header Authorization. Retorna o usuário ou None."""
    if not credentials or not credentials.credentials:
        return None
    
    token = credentials.credentials
    payload = decode_access_token(token)
    if not payload or "sub" not in payload:
        return None
        
    user_id = payload["sub"]
    user = await db.fetch_one(
        "SELECT id, name, email, avatar_url, created_at FROM users WHERE id = ?",
        [user_id]
    )
    return user


async def get_current_user(
    user: Optional[dict[str, Any]] = Depends(get_current_user_optional)
) -> dict[str, Any]:
    """Exige usuário autenticado. Retorna 401 se ausente ou inválido."""
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Autenticação necessária ou sessão expirada.",
            headers={"WWW-Authenticate": "Bearer"},
        )
    return user

