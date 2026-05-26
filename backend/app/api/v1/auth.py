from fastapi import APIRouter, Depends, HTTPException, status, Request
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from pydantic import BaseModel, EmailStr
import secrets
from google.oauth2 import id_token
from google.auth.transport import requests

from app.core.database import get_db
from app.core.config import settings
from app.core.security import hash_password, verify_password, create_access_token
from app.api.deps import get_current_user
from app.models.user import User
from app.core.limiter import limiter


router = APIRouter()


# ---- Schemas ----

class LoginRequest(BaseModel):
    username: str
    password: str


class RegisterRequest(BaseModel):
    username: str
    email: str
    password: str
    full_name: str | None = None
    registration_secret: str | None = None


class GoogleLoginRequest(BaseModel):
    credential: str | None = None
    access_token: str | None = None


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: dict


class UserResponse(BaseModel):
    id: str
    username: str
    email: str
    full_name: str | None
    role: str


# ---- Endpoints ----

@router.post("/google", response_model=TokenResponse)
@limiter.limit("5/minute")
async def google_login(request: Request, login_data: GoogleLoginRequest, db: AsyncSession = Depends(get_db)):
    """Authenticate or register user via Google OAuth2 token."""
    import httpx

    try:
        email = None
        name = None

        if login_data.credential:
            # Verify the token with Google
            idinfo = id_token.verify_oauth2_token(
                login_data.credential, 
                requests.Request(), 
                settings.GOOGLE_CLIENT_ID
            )
            email = idinfo.get('email')
            name = idinfo.get('name')
        
        elif login_data.access_token:
            async with httpx.AsyncClient() as client:
                resp = await client.get(
                    "https://www.googleapis.com/oauth2/v3/userinfo",
                    headers={"Authorization": f"Bearer {login_data.access_token}"}
                )
                if resp.status_code != 200:
                    raise ValueError("Akses token tidak valid")
                
                idinfo = resp.json()
                email = idinfo.get('email')
                name = idinfo.get('name')
        
        else:
            raise ValueError("Token tidak ditemukan")

        if not email:
            raise ValueError("Token does not contain email")

    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Token Google tidak valid: {str(e)}",
        )

    # Check if user exists
    result = await db.execute(select(User).where(User.email == email))
    user = result.scalar_one_or_none()

    if not user:
        # Check domain restriction
        if settings.ALLOWED_AUTH_DOMAIN:
            if not email.endswith(f"@{settings.ALLOWED_AUTH_DOMAIN}"):
                raise HTTPException(
                    status_code=status.HTTP_403_FORBIDDEN,
                    detail=f"Hanya email dari domain @{settings.ALLOWED_AUTH_DOMAIN} yang diizinkan."
                )

        # Auto register new user
        # Generate a complex random password hash since they use Google to login
        random_password = secrets.token_urlsafe(32)
        
        # Create a unique username from email
        base_username = email.split('@')[0]
        username = base_username
        
        # Ensure username is unique
        counter = 1
        while True:
            existing = await db.execute(select(User).where(User.username == username))
            if not existing.scalar_one_or_none():
                break
            username = f"{base_username}{counter}"
            counter += 1

        user = User(
            username=username,
            email=email,
            password_hash=hash_password(random_password),
            full_name=name,
        )
        db.add(user)
        await db.flush()

    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Akun tidak aktif",
        )

    access_token = create_access_token(data={"sub": str(user.id)})

    return TokenResponse(
        access_token=access_token,
        user={
            "id": str(user.id),
            "username": user.username,
            "email": user.email,
            "full_name": user.full_name,
            "role": user.role,
        },
    )


@router.post("/login", response_model=TokenResponse)
@limiter.limit("5/minute")
async def login(request: Request, login_data: LoginRequest, db: AsyncSession = Depends(get_db)):
    """Authenticate admin and return JWT token."""
    result = await db.execute(select(User).where(User.username == login_data.username))
    user = result.scalar_one_or_none()

    if not user or not verify_password(login_data.password, user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Username atau password salah",
        )

    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Akun tidak aktif",
        )

    access_token = create_access_token(data={"sub": str(user.id)})

    return TokenResponse(
        access_token=access_token,
        user={
            "id": str(user.id),
            "username": user.username,
            "email": user.email,
            "full_name": user.full_name,
            "role": user.role,
        },
    )


@router.post("/register", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
@limiter.limit("3/minute")
async def register(request: Request, reg_data: RegisterRequest, db: AsyncSession = Depends(get_db)):
    """Register a new admin user."""
    # Check registration secret if configured
    if settings.REGISTRATION_SECRET:
        if reg_data.registration_secret != settings.REGISTRATION_SECRET:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Token registrasi tidak valid atau tidak ditemukan."
            )

    # Check duplicate username
    existing = await db.execute(select(User).where(User.username == reg_data.username))
    if existing.scalar_one_or_none():
        raise HTTPException(status_code=400, detail="Username sudah digunakan")

    # Check duplicate email
    existing = await db.execute(select(User).where(User.email == reg_data.email))
    if existing.scalar_one_or_none():
        raise HTTPException(status_code=400, detail="Email sudah digunakan")

    user = User(
        username=reg_data.username,
        email=reg_data.email,
        password_hash=hash_password(reg_data.password),
        full_name=reg_data.full_name,
    )
    db.add(user)
    await db.flush()

    return UserResponse(
        id=str(user.id),
        username=user.username,
        email=user.email,
        full_name=user.full_name,
        role=user.role,
    )


@router.get("/me", response_model=UserResponse)
async def get_me(current_user: User = Depends(get_current_user)):
    """Get current authenticated user info."""
    return UserResponse(
        id=str(current_user.id),
        username=current_user.username,
        email=current_user.email,
        full_name=current_user.full_name,
        role=current_user.role,
    )


class UserUpdateRequest(BaseModel):
    full_name: str | None = None
    email: EmailStr | None = None
    password: str | None = None


@router.put("/me", response_model=UserResponse)
async def update_me(
    data: UserUpdateRequest,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Update current user profile (name, email, password)."""
    if data.email and data.email != current_user.email:
        # Check if email is taken
        existing = await db.execute(select(User).where(User.email == data.email))
        if existing.scalar_one_or_none():
            raise HTTPException(status_code=400, detail="Email sudah digunakan")
        current_user.email = data.email

    if data.full_name is not None:
        current_user.full_name = data.full_name

    if data.password:
        current_user.password_hash = hash_password(data.password)

    await db.flush()
    
    return UserResponse(
        id=str(current_user.id),
        username=current_user.username,
        email=current_user.email,
        full_name=current_user.full_name,
        role=current_user.role,
    )
