from typing import Optional
from pydantic import BaseModel, Field, EmailStr

# --- Schemas de Fact-Checking ---
class CheckClaimRequest(BaseModel):
    claim: str = Field(..., min_length=3, description="Afirmação ou fato a ser investigado.")
    api_key: Optional[str] = Field(None, description="Chave Groq opcional enviada pelo usuário.")

class SourceModel(BaseModel):
    title: str
    url: str
    snippet: str
    source: str

class CheckClaimResponse(BaseModel):
    success: bool = True
    claim: str
    verdict: str
    confidence: str
    summary: str
    analysis: str
    sources: list[SourceModel] = []
    steps_log: list[str] = []


# --- Schemas de Autenticação de Usuário ---
class UserRegisterRequest(BaseModel):
    name: str = Field(..., min_length=2, max_length=100, description="Nome de usuário ou nome completo")
    email: str = Field(..., min_length=5, max_length=255, description="Endereço de e-mail válido")
    password: str = Field(..., min_length=6, max_length=128, description="Senha do usuário")
    avatar_url: Optional[str] = Field(None, description="URL ou dados da foto de perfil (opcional, padrão anônimo)")

class UserLoginRequest(BaseModel):
    email: str = Field(..., description="E-mail cadastrado")
    password: str = Field(..., description="Senha da conta")

class UpdateAvatarRequest(BaseModel):
    avatar_url: Optional[str] = Field(None, description="URL da foto do usuário ou string base64 / None para anônimo")

class UserResponse(BaseModel):
    id: str
    name: str
    email: str
    avatar_url: Optional[str] = None
    created_at: str

class AuthResponse(BaseModel):
    token: str
    token_type: str = "bearer"
    user: UserResponse
