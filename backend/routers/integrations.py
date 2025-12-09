from fastapi import APIRouter, Depends, Body, HTTPException, status
from backend.models.user import UserResponse, UserIntegrations
from backend.auth.security import get_current_user
from backend.database import db
from bson import ObjectId

router = APIRouter(
    prefix="/user/integrations",
    tags=["integrations"]
)

@router.get("/", response_model=UserIntegrations)
async def get_integrations(
    current_user: UserResponse = Depends(get_current_user)
):
    """
    Get the current user's integration status.
    """
    # current_user already has the data from the DB, but let's fetch fresh if we want to be safe, 
    # or just rely on what came from the token/dependency if it fetches fresh.
    # The get_current_user dependency usually fetches fresh user data.
    
    # If the user model has an 'integrations' field, we return it.
    # If it's missing (old users), we might want to return default.
    return current_user.integrations

@router.patch("/", response_model=UserIntegrations)
async def update_integrations(
    integrations_update: dict = Body(...),
    current_user: UserResponse = Depends(get_current_user)
):
    """
    Update the integration status (partial update).
    Example body: {"google_calendar": true}
    """
    # Validate keys against UserIntegrations model fields
    allowed_keys = UserIntegrations.model_fields.keys()
    
    # Filter and validate input
    update_data = {}
    for key, value in integrations_update.items():
        if key in allowed_keys and isinstance(value, bool):
            update_data[f"integrations.{key}"] = value
            
    if not update_data:
         # If no valid keys provided, just return current state without error or maybe 400?
         # "accepts a partial dict" implies we just apply what works.
         return current_user.integrations

    await db.users.update_one(
        {"_id": ObjectId(current_user.id)},
        {"$set": update_data}
    )
    
    # Fetch updated user to return correct state
    updated_user = await db.users.find_one({"_id": ObjectId(current_user.id)})
    
    # Map to UserResponse to ensure everything is parsed correctly, then extract integrations
    return UserResponse(**updated_user).integrations