from supabase import create_client, Client
from dotenv import load_dotenv
from app.core.config import settings

load_dotenv()

url: str = settings.supabase_url
key: str = settings.supabase_key

supabase: Client = create_client(url or "", key or "")

def get_supabase() -> Client:
    return supabase
