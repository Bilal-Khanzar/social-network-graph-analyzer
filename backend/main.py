from fastapi import FastAPI, Request
from fastapi.staticfiles import StaticFiles
from fastapi.templating import Jinja2Templates
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import HTMLResponse
from backend.routers import graph, analysis
import os

app = FastAPI(title="Social Network Analyzer", version="1.0.0")

# CORS Ayarları: Frontend'in Backend'e erişebilmesi için şart
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# Klasör yolları (Ana dizine göre)
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
FRONTEND_DIR = os.path.join(BASE_DIR, "frontend")

# Statik dosyaları (css, js) sunmak için
app.mount("/frontend", StaticFiles(directory=FRONTEND_DIR), name="frontend")

app.include_router(graph.router, prefix="/api/graph", tags=["Graph"])
app.include_router(analysis.router, prefix="/api/analysis", tags=["Analysis"])

@app.get("/", response_class=HTMLResponse)
async def root():
    with open(os.path.join(FRONTEND_DIR, "index.html"), "r", encoding="utf-8") as f:
        return HTMLResponse(content=f.read())

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("backend.main:app", host="0.0.0.0", port=8000, reload=True)