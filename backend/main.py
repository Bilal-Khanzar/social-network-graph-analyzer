from fastapi import FastAPI
from fastapi.staticfiles import StaticFiles
from fastapi.templating import Jinja2Templates
from fastapi.middleware.cors import CORSMiddleware
from routers import graph, analysis
import os

app = FastAPI(title="Sosyal Ağ İzomorfizm ve Anomali Tespiti", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# Static files ve templates
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
app.mount("/static", StaticFiles(directory=os.path.join(BASE_DIR, "frontend/static")), name="static")
templates = Jinja2Templates(directory=os.path.join(BASE_DIR, "frontend/templates"))

app.include_router(graph.router, prefix="/api/graph", tags=["Graph"])
app.include_router(analysis.router, prefix="/api/analysis", tags=["Analysis"])

from fastapi import Request
from fastapi.responses import HTMLResponse

@app.get("/", response_class=HTMLResponse)
async def root(request: Request):
    return templates.TemplateResponse("index.html", {"request": request})

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)