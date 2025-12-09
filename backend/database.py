from motor.motor_asyncio import AsyncIOMotorClient
from backend.config import settings

client = AsyncIOMotorClient(settings.MONGODB_URI)
db = client.get_database()