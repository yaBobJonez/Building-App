from fastapi import FastAPI
from routers import users, projects, tasks, documents, incidents

app = FastAPI()
app.include_router(users.router)
app.include_router(projects.router)
app.include_router(tasks.router)
app.include_router(documents.router)
app.include_router(incidents.router)
