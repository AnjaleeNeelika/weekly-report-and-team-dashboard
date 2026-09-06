import os
from supabase import create_client, Client
from app.core.config import settings

_supabase_client: Client | None = None

def get_supabase() -> Client:
    global _supabase_client
    if _supabase_client is None:
        # Fall back to os.getenv in case settings object failed to load Vercel env vars
        url = settings.supabase_url or os.getenv("SUPABASE_URL", "")
        key = settings.supabase_key or os.getenv("SUPABASE_KEY", "")

        if not url or not url.startswith("http"):
            raise RuntimeError(
                "SUPABASE_URL is missing or invalid. "
                "Ensure it is configured in Vercel Project Settings."
            )
        if not key:
            raise RuntimeError(
                "SUPABASE_KEY is missing. "
                "Ensure it is configured in Vercel Project Settings."
            )

        _supabase_client = create_client(url, key)

    return _supabase_client