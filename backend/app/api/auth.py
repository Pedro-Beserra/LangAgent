"""Rotas de autenticação de usuários (Registro, Login e Perfil)."""
import uuid
import logging
from fastapi import APIRouter, HTTPException, status, Depends
from app.api.schemas import (
    UserRegisterRequest,
    UserLoginRequest,
    UserResponse,
    AuthResponse,
    UpdateAvatarRequest,
)
from app.api.dependencies import get_current_user
from app.core.security import hash_password, verify_password, create_access_token
from app.db.database import db

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/auth", tags=["Autenticação"])


@router.post("/register", response_model=AuthResponse, status_code=status.HTTP_201_CREATED)
async def register(request: UserRegisterRequest):
    """Cria uma nova conta de usuário, persiste no Turso e retorna o token JWT."""
    normalized_email = request.email.strip().lower()
    clean_name = request.name.strip()
    avatar_val = request.avatar_url.strip() if request.avatar_url else None

    # 1. Verifica duplicidade de e-mail
    existing = await db.fetch_one("SELECT id FROM users WHERE email = ?", [normalized_email])
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Este e-mail já está registrado na plataforma."
        )

    # 2. Hash seguro da senha com Bcrypt
    user_id = str(uuid.uuid4())
    pw_hash = hash_password(request.password)

    # 3. Salva no banco de dados Turso
    try:
        await db.execute(
            "INSERT INTO users (id, name, email, password_hash, avatar_url) VALUES (?, ?, ?, ?, ?)",
            [user_id, clean_name, normalized_email, pw_hash, avatar_val]
        )
    except Exception as e:
        logger.error("Erro ao inserir usuário no Turso: %s", str(e))
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Erro ao criar conta no banco de dados."
        )

    # 4. Busca os dados criados (incluindo created_at gerado pelo SQLite)
    user_row = await db.fetch_one(
        "SELECT id, name, email, avatar_url, created_at FROM users WHERE id = ?",
        [user_id]
    )

    if not user_row:
        raise HTTPException(status_code=500, detail="Erro ao resgatar usuário cadastrado.")

    # 5. Emite o token JWT
    token = create_access_token({"sub": user_id, "email": normalized_email})

    return AuthResponse(
        token=token,
        token_type="bearer",
        user=UserResponse(
            id=user_row["id"],
            name=user_row["name"],
            email=user_row["email"],
            avatar_url=user_row.get("avatar_url"),
            created_at=str(user_row["created_at"])
        )
    )


@router.post("/login", response_model=AuthResponse)
async def login(request: UserLoginRequest):
    """Autentica o usuário com e-mail e senha e retorna o token JWT."""
    normalized_email = request.email.strip().lower()

    # 1. Busca usuário por e-mail
    user = await db.fetch_one(
        "SELECT id, name, email, password_hash, avatar_url, created_at FROM users WHERE email = ?",
        [normalized_email]
    )

    # 2. Validação de credenciais com proteção contra timing attacks
    if not user or not verify_password(request.password, user["password_hash"]):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="E-mail ou senha incorretos."
        )

    # 3. Emite o token JWT
    token = create_access_token({"sub": user["id"], "email": user["email"]})

    return AuthResponse(
        token=token,
        token_type="bearer",
        user=UserResponse(
            id=user["id"],
            name=user["name"],
            email=user["email"],
            avatar_url=user.get("avatar_url"),
            created_at=str(user["created_at"])
        )
    )


@router.get("/me", response_model=UserResponse)
async def get_my_profile(current_user: dict = Depends(get_current_user)):
    """Retorna os dados do usuário autenticado a partir do token JWT."""
    return UserResponse(
        id=current_user["id"],
        name=current_user["name"],
        email=current_user["email"],
        avatar_url=current_user.get("avatar_url"),
        created_at=str(current_user["created_at"])
    )


@router.put("/avatar", response_model=UserResponse)
async def update_user_avatar(
    request: UpdateAvatarRequest,
    current_user: dict = Depends(get_current_user)
):
    """Atualiza a foto de perfil do usuário autenticado (ou define como None para anônimo)."""
    avatar_val = request.avatar_url.strip() if request.avatar_url and request.avatar_url.strip() else None
    
    await db.execute(
        "UPDATE users SET avatar_url = ? WHERE id = ?",
        [avatar_val, current_user["id"]]
    )
    
    user_row = await db.fetch_one(
        "SELECT id, name, email, avatar_url, created_at FROM users WHERE id = ?",
        [current_user["id"]]
    )
    
    if not user_row:
        raise HTTPException(status_code=404, detail="Usuário não encontrado.")

    return UserResponse(
        id=user_row["id"],
        name=user_row["name"],
        email=user_row["email"],
        avatar_url=user_row.get("avatar_url"),
        created_at=str(user_row["created_at"])
    )

