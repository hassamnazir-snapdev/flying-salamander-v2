from typing import Optional, Annotated
from pydantic import BaseModel, EmailStr, Field, BeforeValidator, ConfigDict
from bson import ObjectId

# Represents an ObjectId field in the database.
# It will be represented as a `str` on the model so that it can be serialized to JSON.
PyObjectId = Annotated[str, BeforeValidator(str)]

class UserIntegrations(BaseModel):
    google_calendar: bool = False
    notion: bool = False
    google_refresh_token: Optional[str] = None
    google_access_token: Optional[str] = None
    google_token_expiry: Optional[int] = None

class UserBase(BaseModel):
    email: EmailStr

class UserCreate(UserBase):
    password: str = Field(..., min_length=6)

class UserLogin(UserBase):
    password: str

class UserResponse(UserBase):
    id: Optional[PyObjectId] = Field(None, alias="_id")
    is_active: bool = True
    integrations: UserIntegrations = Field(default_factory=UserIntegrations)

    model_config = ConfigDict(
        populate_by_name=True,
        arbitrary_types_allowed=True,
        json_encoders={ObjectId: str},
    )

class Token(BaseModel):
    access_token: str
    token_type: str

class TokenData(BaseModel):
    email: Optional[str] = None