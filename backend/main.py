from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routers import users, projects, tasks, documents, incidents

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origin_regex=r'https?://((localhost)|(127\.0\.0\.1))(:\d+)?',
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"]
)

app.include_router(users.router)
app.include_router(projects.router)
app.include_router(tasks.router)
app.include_router(documents.router)
app.include_router(incidents.router)
