import sys
import os

# Add the parent directory to sys.path to allow absolute imports from backend.*
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from backend.config import settings
from backend.database import client
from backend.routers import auth, meetings, action_items, integrations

app = FastAPI()

app.include_router(auth.router)
app.include_router(meetings.router)
app.include_router(action_items.router)
app.include_router(integrations.router)

# CORS Configuration
origins = settings.CORS_ORIGINS.split(",")

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/healthz")
# Trigger reload for env update
async def health_check():
    try:
        # Ping the database to check connection
        await client.admin.command('ping')
        db_status = "connected"
    except Exception:
        db_status = "disconnected"
    
    return {"status": "ok", "db": db_status}
# Trigger reload
# Trigger reload for dependencies
# Trigger reload for env vars