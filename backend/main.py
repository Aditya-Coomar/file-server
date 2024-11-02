from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from fastapi.exceptions import RequestValidationError
from pydantic import ValidationError, BaseModel, EmailStr, Field
from starlette.exceptions import HTTPException as StarletteHTTPException
from pymongo import MongoClient
import random
from typing import Dict, Optional
import bcrypt
from datetime import datetime
import os


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
    
origins = [ "http://localhost", "http://localhost:3000", "http://localhost:8000", "http://localhost:8080", "http://localhost:8081", "https://data-dock.vercel.app/", "https://file-server-anshucoomar04gmailcoms-projects.vercel.app/" ]

app.add_middleware( CORSMiddleware, allow_origins=["*"], allow_credentials=True, allow_methods=["*"], allow_headers=["*"])

class FileServerOperations:
    root_directory = "G://FileServer"
    def __init__(self):
        if not os.path.exists(self.root_directory):
            os.makedirs(self.root_directory)
    
    def get_directory_size(self, directory):
        """Returns the `directory` size in bytes."""
        total = 0
        try:
            # print("[+] Getting the size of", directory) 
            for entry in os.scandir(directory):
                if entry.is_file(): 
                    # if it's a file, use stat() function
                    total += entry.stat().st_size
                elif entry.is_dir(): 
                    # if it's a directory, recursively call this function
                    try:
                        total += self.get_directory_size(entry.path)
                    except FileNotFoundError:
                        pass
        except NotADirectoryError:
            # if `directory` isn't a directory, get the file size then
            return os.path.getsize(directory)
        except PermissionError:
            # if for whatever reason we can't open the folder, return 0
            return 0
        return total

fso = FileServerOperations()

@app.get("/")
async def read_root():
    return {"status": 200, "message":"Ping OK"}

class DatabaseConnection:
    def __init__(self):
        self.client = MongoClient("mongodb://localhost:27017/")
        self.db = self.client["file_server"]
        self.users_collection = self.db["users"]
        
        self.users_collection.create_index("email", unique=True)
        self.users_collection.create_index("username", unique=True)

db_connection = DatabaseConnection()


class registerUser(BaseModel):
    email: EmailStr
    fullname: str = Field(..., min_length=3, max_length=50)
    username: str = Field(..., min_length=3, max_length=50)
    password: str = Field(..., min_length=8)
    
@app.post("/api/auth/register")
async def register(user: registerUser):
    try:
        existing_user = db_connection.users_collection.find_one({"email": user.email}) or db_connection.users_collection.find_one({"username": user.username})
        if existing_user:
            return {"status": 400, "message": "User already exists with this email or username"}
        hashedPassword = bcrypt.hashpw(user.password.encode("utf-8"), bcrypt.gensalt())
        verification_code = random.randint(100000, 999999)
        user_data = {
            "email": user.email,
            "fullname": user.fullname,
            "username": user.username,
            "password": hashedPassword,
            "verification_code": verification_code,
            "is_verified": False,
            "user_created_on": datetime.now().strftime("%a %d %B %Y, %H:%M:%S"),
            "last_login": None,
            "user_directory": {"allocated_space": 10.00, "used_space": 0.00, "root_directory": f"{fso.root_directory}/{user.username}"}
        }
        try:
            os.makedirs(f"{fso.root_directory}/{user.username}")
            db_connection.users_collection.insert_one(user_data)
            return {"status": 200, "message": "User registered successfully"}
        except Exception as e:
            return {"status": 500, "message": str(e)}
        
    except Exception as e:
        return {"status": 500, "message": str(e)}


# Login User
class loginUser(BaseModel):
    email: Optional[EmailStr] = None
    username: Optional[str] = None
    password: str

@app.post("/api/auth/login")
async def login(user: loginUser):
    try:
        if user.email:
            user_data = db_connection.users_collection.find_one({"email": user.email})
        elif user.username:
            user_data = db_connection.users_collection.find_one({"username": user.username})
        else:
            return {"status": 400, "message": "Email or Username is required"}
        
        if not user_data:
            return {"status": 400, "message": "User not found with this email or username"}
        
        if not bcrypt.checkpw(user.password.encode("utf-8"), user_data["password"]):
            return {"status": 400, "message": "Invalid password"}
        
        if not user_data["is_verified"]:
            return {"status": 403, "message": "User is not verified"}
        
        user_data["last_login"] = datetime.now().strftime("%a %d %B %Y, %H:%M:%S")
        db_connection.users_collection.update_one({"_id": user_data["_id"]}, {"$set": user_data})
        return {"status": 200, "message": "User logged in successfully"}
    except Exception as e:
        return {"status": 500, "message": str(e)}



if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, port=8000)