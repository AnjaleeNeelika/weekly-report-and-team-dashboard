import logging
from fastapi import FastAPI, Depends, Request
from fastapi.exceptions import RequestValidationError
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from app.api.v1.router import api_router

logger = logging.getLogger("uvicorn.error")

app = FastAPI(title="Weekly Report & Team Dashboard API with Supabase")

origins = [
    "http://localhost:3000",
    "http://localhost:3001",
    "https://weekly-report-and-team-dashboard.vercel.app",
]

vercel_preview_regex = r"https:\/\/weekly-report-and-team-dashboard.*\.vercel\.app"

# Configure CORS for frontend access
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_origin_regex=vercel_preview_regex,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(api_router, prefix="/api/v1")


@app.exception_handler(RequestValidationError)
async def validation_exception_handler(request: Request, exc: RequestValidationError):
    errors = exc.errors()
    logger.error("422 Validation error on %s %s: %s", request.method, request.url.path, errors)
    return JSONResponse(
        status_code=422,
        content={"detail": errors},
    )

@app.get("/")
def read_root():
    return {"message": "Welcome to the Weekly Report API connected to Supabase"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="[IP_ADDRESS]", port=8000)

