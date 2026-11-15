
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

# Create the FastAPI application
app = FastAPI(
    title="Brain MRI Analysis API",
    description="Radiology-guided explainable brain MRI analysis using LLaVA",
    version="1.0.0"
)

# Allow our React frontend to communicate with the backend
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# Welcome endpoint
@app.get("/")
def home():
    return {
        "message": "Brain MRI Analysis API is running!"
    }


# Backend health check
@app.get("/api/health")
def health_check():
    return {
        "status": "healthy",
        "project": "Brain MRI Analysis",
        "model": "Not loaded yet"
    }
from app.routes.analysis import router as analysis_router

app.include_router(analysis_router, prefix="/api")