from typing import Optional, Annotated, List
from datetime import datetime
from pydantic import BaseModel, Field, BeforeValidator, ConfigDict
from bson import ObjectId

# Represents an ObjectId field in the database.
# It will be represented as a `str` on the model so that it can be serialized to JSON.
PyObjectId = Annotated[str, BeforeValidator(str)]

class MeetingBase(BaseModel):
    google_event_id: Optional[str] = None
    title: str
    start_time: datetime
    end_time: datetime
    is_online: bool = False
    location: Optional[str] = None
    participants: List[str] = []
    summary_link: Optional[str] = None
    is_recorded: bool = False
    status: str = "pending"  # e.g., pending, processed, completed

class MeetingCreate(MeetingBase):
    pass

class MeetingUpdate(BaseModel):
    status: Optional[str] = None
    summary_link: Optional[str] = None

class Meeting(MeetingBase):
    id: Optional[PyObjectId] = Field(None, alias="_id")
    user_id: PyObjectId

    model_config = ConfigDict(
        populate_by_name=True,
        arbitrary_types_allowed=True,
        json_encoders={ObjectId: str},
    )