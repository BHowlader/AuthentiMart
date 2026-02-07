from fastapi import APIRouter, Depends, HTTPException, status, File, UploadFile
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from datetime import timedelta, datetime
from app.database import get_db
from app.models import User, UserRole
from app.schemas import UserCreate, UserResponse, Token, TokenWithUser, UserUpdate, ForgotPassword, ResetPassword, SocialLoginRequest
from app.utils import (
    verify_password, 
    get_password_hash, 
    create_access_token,
    get_current_user_required
)
from app.config import settings
import uuid
import httpx
import os
import shutil

router = APIRouter(prefix="/auth", tags=["Authentication"])

@router.post("/register", response_model=TokenWithUser)
async def register(user_data: UserCreate, db: Session = Depends(get_db)):
    # Check if email already exists
    existing_user = db.query(User).filter(User.email == user_data.email).first()
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered"
        )
    
    # Create new user
    new_user = User(
        name=user_data.name,
        email=user_data.email,
        phone=user_data.phone,
        password_hash=get_password_hash(user_data.password),
        role=UserRole.USER.value
    )
    
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    
    # Create access token
    access_token = create_access_token(
        data={"sub": str(new_user.id), "role": str(new_user.role)}
    )

    return {"token": access_token, "user": new_user}

@router.post("/login", response_model=TokenWithUser)
async def login(
    form_data: OAuth2PasswordRequestForm = Depends(),
    db: Session = Depends(get_db)
):
    # Find user by email
    user = db.query(User).filter(User.email == form_data.username).first()
    
    if not user or not verify_password(form_data.password, user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Account is deactivated"
        )
    
    # Create access token
    access_token = create_access_token(
        data={"sub": str(user.id), "role": str(user.role)}
    )

    return {"token": access_token, "user": user}

@router.get("/me", response_model=UserResponse)
async def get_current_user_profile(
    current_user: User = Depends(get_current_user_required)
):
    return current_user

@router.put("/me", response_model=UserResponse)
async def update_profile(
    user_data: UserUpdate,
    current_user: User = Depends(get_current_user_required),
    db: Session = Depends(get_db)
):
    if user_data.name:
        current_user.name = user_data.name
    if user_data.phone:
        current_user.phone = user_data.phone
    
    db.commit()
    db.refresh(current_user)
    
    return current_user

@router.post("/change-password")
async def change_password(
    password_data: dict,
    current_user: User = Depends(get_current_user_required),
    db: Session = Depends(get_db)
):
    current_password = password_data.get("current_password")
    new_password = password_data.get("new_password")
    
    if not verify_password(current_password, current_user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Current password is incorrect"
        )
    
    current_user.password_hash = get_password_hash(new_password)
    db.commit()
    
    return {"message": "Password changed successfully"}

@router.post("/forgot-password")
async def forgot_password(
    data: ForgotPassword,
    db: Session = Depends(get_db)
):
    user = db.query(User).filter(User.email == data.email).first()
    if not user:
        # Don't reveal if user exists
        return {"message": "If this email is registered, you will receive password reset instructions."}
    
    # Generate reset token
    token = str(uuid.uuid4())
    user.reset_token = token
    user.reset_token_expiry = datetime.utcnow() + timedelta(hours=1)
    db.commit()
    
    # In a real app, send email here
    # For now, just print to console for development
    print(f"RESET LINK: {settings.app_url}/reset-password?token={token}")
    
    return {"message": "If this email is registered, you will receive password reset instructions."}

@router.post("/reset-password")
async def reset_password(
    data: ResetPassword,
    db: Session = Depends(get_db)
):
    user = db.query(User).filter(User.reset_token == data.token).first()
    
    if not user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid or expired token"
        )
        
    if user.reset_token_expiry < datetime.utcnow():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Token has expired"
        )
    
    # Reset password
    user.password_hash = get_password_hash(data.new_password)
    user.reset_token = None
    user.reset_token_expiry = None
    db.commit()
    
    return {"message": "Password has been reset successfully"}

@router.post("/social-login", response_model=TokenWithUser)
async def social_login(
    data: SocialLoginRequest,
    db: Session = Depends(get_db)
):
    email = None
    name = None
    picture = None
    provider_id = None
    
    # verify token with provider
    async with httpx.AsyncClient() as client:
        if data.provider == "google":
            # 1. Try as Access Token with userinfo endpoint (Standard OAuth2)
            # This ensures we get profile info including picture
            headers = {"Authorization": f"Bearer {data.token}"}
            resp = await client.get("https://www.googleapis.com/oauth2/v3/userinfo", headers=headers)
            
            if resp.status_code == 200:
                user_info = resp.json()
                email = user_info.get("email")
                name = user_info.get("name")
                picture = user_info.get("picture")
                provider_id = user_info.get("sub")
            else:
                # 2. If that fails, try as ID Token (compat with <GoogleLogin/> component which returns id_token)
                resp = await client.get(f"https://oauth2.googleapis.com/tokeninfo?id_token={data.token}")
                
                if resp.status_code != 200:
                    raise HTTPException(status_code=400, detail="Invalid Google token")
                    
                user_info = resp.json()
                email = user_info.get("email")
                name = user_info.get("name")
                picture = user_info.get("picture")
                provider_id = user_info.get("sub")
            
        elif data.provider == "facebook":
            # Verify Facebook Access Token
            # Need fields: id,name,email,picture.type(large)
            resp = await client.get(f"https://graph.facebook.com/me?access_token={data.token}&fields=id,name,email,picture.type(large)")
            if resp.status_code != 200:
                raise HTTPException(status_code=400, detail="Invalid Facebook token")
            
            user_info = resp.json()
            email = user_info.get("email")
            name = user_info.get("name")
            # FB picture structure is different: picture.data.url
            picture = user_info.get("picture", {}).get("data", {}).get("url")
            provider_id = user_info.get("id")
            
        else:
            raise HTTPException(status_code=400, detail="Unsupported provider")
            
    if not email:
         raise HTTPException(status_code=400, detail="Email not found in social profile")

    # Check if user exists
    user = db.query(User).filter(User.email == email).first()
    
    if user:
        # Update missing or changed social info
        # We update the picture ONLY if the user hasn't set a custom picture
        if picture and picture != user.picture and not user.is_custom_picture:
            user.picture = picture
        
        if data.provider == "google" and not user.google_id:
            user.google_id = provider_id
        if data.provider == "facebook" and not user.facebook_id:
            user.facebook_id = provider_id
            
        db.commit()
        db.refresh(user)
    else:
        # Register new user
        # We need a dummy password since it's required by our model but user logs in via social
        # Using uuid as random password
        dummy_pw = str(uuid.uuid4())
        
        user = User(
            email=email,
            name=name,
            password_hash=get_password_hash(dummy_pw),
            role=UserRole.USER.value,
            picture=picture,
            is_active=True
        )
        if data.provider == "google":
            user.google_id = provider_id
        elif data.provider == "facebook":
            user.facebook_id = provider_id
            
        db.add(user)
        db.commit()
        db.refresh(user)
        
    access_token = create_access_token(
        data={"sub": str(user.id), "role": str(user.role)}
    )
    
    return {"token": access_token, "user": user}

@router.post("/upload-avatar", response_model=UserResponse)
async def upload_avatar(
    file: UploadFile = File(...),
    current_user: User = Depends(get_current_user_required),
    db: Session = Depends(get_db)
):
    # Validate file type
    if not file.content_type.startswith('image/'):
        raise HTTPException(status_code=400, detail="File must be an image")
    
    # Create upload directory
    upload_dir = "uploads/avatars"
    os.makedirs(upload_dir, exist_ok=True)
    
    # Generate unique filename
    file_extension = os.path.splitext(file.filename)[1]
    filename = f"user_{current_user.id}_{uuid.uuid4()}{file_extension}"
    file_path = f"{upload_dir}/{filename}"
    
    # Save file
    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)
        
    # Update user profile
    # URL should be relative path that frontend can access via static mount
    # Mounted at /uploads
    image_url = f"{settings.api_url}/uploads/avatars/{filename}"
    
    current_user.picture = image_url
    current_user.is_custom_picture = True
    
    db.commit()
    db.refresh(current_user)
    
    return current_user
