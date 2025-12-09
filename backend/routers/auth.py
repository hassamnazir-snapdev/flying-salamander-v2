from fastapi import APIRouter, HTTPException, status, Depends
from fastapi.security import OAuth2PasswordRequestForm
from google.oauth2 import id_token
from google.auth.transport import requests as google_requests
from google_auth_oauthlib.flow import Flow
from pydantic import BaseModel
import json

from backend.database import db
from backend.models.user import UserCreate, UserResponse, Token, UserLogin
from backend.auth.security import get_password_hash, verify_password, create_access_token, get_current_user
from backend.config import settings

router = APIRouter(
    prefix="/auth",
    tags=["Authentication"]
)

@router.post("/signup", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
async def signup(user: UserCreate):
    # Check if user already exists
    if await db.users.find_one({"email": user.email}):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered"
        )
    
    # Hash password and create user
    user_dict = user.model_dump()
    user_dict["hashed_password"] = get_password_hash(user_dict.pop("password"))
    user_dict["is_active"] = True
    
    new_user = await db.users.insert_one(user_dict)
    created_user = await db.users.find_one({"_id": new_user.inserted_id})
    
    return UserResponse(**created_user)

class GoogleAuthCode(BaseModel):
    code: str

@router.post("/google", response_model=Token)
async def google_login(auth_data: GoogleAuthCode):
    try:
        # Exchange auth code for tokens
        # We need GOOGLE_CLIENT_SECRET for this flow
        if not settings.GOOGLE_CLIENT_SECRET:
             # Fallback/Error if secret isn't configured
             print("Missing GOOGLE_CLIENT_SECRET")
             raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Server configuration error: Missing Google Client Secret"
            )

        client_config = {
            "web": {
                "client_id": settings.GOOGLE_CLIENT_ID,
                "client_secret": settings.GOOGLE_CLIENT_SECRET,
                "auth_uri": "https://accounts.google.com/o/oauth2/auth",
                "token_uri": "https://oauth2.googleapis.com/token",
            }
        }

        flow = Flow.from_client_config(
            client_config=client_config,
            scopes=[
                "https://www.googleapis.com/auth/calendar.readonly",
                "openid",
                "https://www.googleapis.com/auth/userinfo.email",
                "https://www.googleapis.com/auth/userinfo.profile"
            ],
            redirect_uri="postmessage"
        )
        
        flow.fetch_token(code=auth_data.code)
        credentials = flow.credentials
        
        # Verify the ID token to get user info
        id_info = id_token.verify_oauth2_token(
            credentials.id_token,
            google_requests.Request(),
            settings.GOOGLE_CLIENT_ID,
            clock_skew_in_seconds=60
        )

        email = id_info['email']
        
        # Check if user exists
        user = await db.users.find_one({"email": email})
        
        update_data = {
            "integrations.google_calendar": True,
            "integrations.google_refresh_token": credentials.refresh_token,
            "integrations.google_access_token": credentials.token,
            # Store expiry if needed, usually token is enough or handle refresh logic
        }
        
        # NOTE: refresh_token might be None if the user has already approved the app
        # and we didn't request 'prompt="consent"'.
        # For this demo, we'll just update what we have.
        if not credentials.refresh_token:
             del update_data["integrations.google_refresh_token"]

        if not user:
            # Create new user
            user_dict = {
                "email": email,
                "hashed_password": "", # No password for Google users
                "is_active": True,
                "integrations": {
                    "google_calendar": True,
                    "notion": False,
                    "google_refresh_token": credentials.refresh_token,
                    "google_access_token": credentials.token
                }
            }
            new_user = await db.users.insert_one(user_dict)
            user = await db.users.find_one({"_id": new_user.inserted_id})
        else:
            # Update existing user tokens
            await db.users.update_one(
                {"_id": user["_id"]},
                {"$set": update_data}
            )
            
        access_token = create_access_token(data={"sub": email})
        return {"access_token": access_token, "token_type": "bearer"}
        
    except ValueError as e:
        print(f"Token verification failed: {e}")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid Google token",
            headers={"WWW-Authenticate": "Bearer"},
        )
    except Exception as e:
        print(f"Google Login Error: {e}")
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )

@router.post("/login", response_model=Token)
async def login(user_credentials: UserLogin):
    user = await db.users.find_one({"email": user_credentials.email})
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    if not verify_password(user_credentials.password, user["hashed_password"]):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    access_token = create_access_token(data={"sub": user["email"]})
    return {"access_token": access_token, "token_type": "bearer"}

# Endpoint for OAuth2 form compliance (Swagger UI)
@router.post("/token", response_model=Token, include_in_schema=False)
async def login_for_access_token(form_data: OAuth2PasswordRequestForm = Depends()):
    user = await db.users.find_one({"email": form_data.username})
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    if not verify_password(form_data.password, user["hashed_password"]):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    access_token = create_access_token(data={"sub": user["email"]})
    return {"access_token": access_token, "token_type": "bearer"}

@router.get("/me", response_model=UserResponse)
async def read_users_me(current_user: UserResponse = Depends(get_current_user)):
    return current_user