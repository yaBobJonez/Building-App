from fastapi import FastAPI
from routers import users, projects, tasks

app = FastAPI()
app.include_router(users.router)
app.include_router(projects.router)
app.include_router(tasks.router)
