from typing import Optional, Annotated
from datetime import datetime
from pydantic import BaseModel, Field, BeforeValidator, ConfigDict
from bson import ObjectId
from enum import Enum

# Represents an ObjectId field in the database.
# It will be represented as a `str` on the model so that it can be serialized to JSON.
PyObjectId = Annotated[str, BeforeValidator(str)]

class ActionType(str, Enum):
    EMAIL = "Email"
    INVITE = "Invite"
    TASK = "Task"

class ActionStatus(str, Enum):
    PENDING = "Pending"
    EXECUTED = "Executed"
    COMPLETED = "Completed" 

class ActionItemBase(BaseModel):
    description: str
    action_type: ActionType
    status: ActionStatus = ActionStatus.PENDING
    owner: Optional[str] = None
    due_date: Optional[datetime] = None
    meeting_id: Optional[PyObjectId] = None

class ActionItemCreate(ActionItemBase):
    pass

class ActionItemUpdate(BaseModel):
    description: Optional[str] = None
    action_type: Optional[ActionType] = None
    status: Optional[ActionStatus] = None
    owner: Optional[str] = None
    due_date: Optional[datetime] = None

class ActionItem(ActionItemBase):
    id: Optional[PyObjectId] = Field(None, alias="_id")
    user_id: PyObjectId

    model_config = ConfigDict(
        populate_by_name=True,
        arbitrary_types_allowed=True,
        json_encoders={ObjectId: str},
    )