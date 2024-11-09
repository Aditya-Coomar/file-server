from fastapi import FastAPI, Depends, File, UploadFile, Form
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from fastapi.exceptions import RequestValidationError
from pydantic import ValidationError, BaseModel, EmailStr, Field
from starlette.exceptions import HTTPException as StarletteHTTPException
from pymongo import MongoClient
import random
from typing import Dict, Optional, List, Union, Annotated
import bcrypt
from datetime import datetime, timedelta
import os
from dotenv import load_dotenv
from fastapi_mail import FastMail, MessageSchema, ConnectionConfig, MessageType
from starlette.requests import Request
from template import HTMLTemplate
from storage import FileServerOperations
from starlette.responses import JSONResponse
import jwt
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from bson import ObjectId
from fastapi import HTTPException
from pathlib import Path

load_dotenv()
app = FastAPI()      # Create a FastAPI instance
mail_template = HTMLTemplate()
fso = FileServerOperations()

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

class TokenData(BaseModel):
    username: str = None

def verify_token(token: str):
    try:
        payload = jwt.decode(token, os.getenv("JWT_SECRET"), algorithms=["HS256"])
        username: str = payload.get("sub")
        if username is None:
            return None
        token_data = TokenData(username=username)
        return token_data
    except jwt.PyJWTError:
        return None

def get_current_active_user(token: str = Depends(OAuth2PasswordBearer(tokenUrl="api/auth/user/profile"))):
    credentials_exception = HTTPException(
        status_code=401,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    token_data = verify_token(token)
    if token_data is None:
        raise credentials_exception
    return token_data

def generate_access_token(data: Dict, expires_delta: Optional[timedelta] = None):
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=15)
    to_encode.update({"exp": expire, "iat": datetime.utcnow(), "iss": "Data Dock", "nbf": datetime.utcnow(), "sub": str(data["sub"])})
    secret = os.getenv("JWT_SECRET")
    encoded_jwt = jwt.encode(to_encode, secret, algorithm="HS256", headers={"alg": "HS256", "typ": "JWT"})
    return encoded_jwt



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


class registerUserSchema(BaseModel):
    email: EmailStr
    fullname: str = Field(..., min_length=3, max_length=50)
    username: str = Field(..., min_length=3, max_length=50)
    password: str = Field(..., min_length=8)
    
@app.post("/api/auth/register")
async def register(user: registerUserSchema):
    try:
        if db_connection.users_collection.find_one({"email": user.email}):
            return JSONResponse(status_code=400, content={"message": "Account already created with this Email.", "status": "error"})
        if db_connection.users_collection.find_one({"username": user.username}):
            return JSONResponse(status_code=400, content={"message": "Username already taken. Try another", "status": "error"})
        hashedPassword = bcrypt.hashpw(user.password.encode("utf-8"), bcrypt.gensalt())
        verification_code = random.randint(100000, 999999)
        hashedVerificationCode = bcrypt.hashpw(str(verification_code).encode("utf-8"), bcrypt.gensalt())
        user_data = {
            "email": user.email,
            "fullname": user.fullname,
            "username": user.username,
            "password": hashedPassword,
            "verification_code": hashedVerificationCode,
            "verification_code_expires": datetime.now(),
            "is_verified": False,
            "user_created_on": datetime.now().strftime("%a %d %B %Y, %H:%M:%S"),
            "last_login": None,
            "user_directory": {"allocated_space": 2.00, "used_space": 0.00, "root": f"{user.username}"}
        }
        try:
            db_connection.users_collection.insert_one(user_data)
            
            return JSONResponse(status_code=200, content={"message": "User registered successfully", "status": "success"})
        except Exception as e:
            return JSONResponse(status_code=500, content={"message": str(e), "status": "error"})
        
    except Exception as e:
        return JSONResponse(status_code=500, content={"message": str(e), "status": "error"})


# Login User
class loginUserSchema(BaseModel):
    user: str = None
    password: str

@app.post("/api/auth/login")
async def login(user: loginUserSchema):
    try:
        if not user.user:
            return JSONResponse(status_code=400, content={"message": "Email or Username is required", "status": "error"})
        
        user_data = db_connection.users_collection.find_one({"$or": [{"email": user.user}, {"username": user.user}]})
        if not user_data:
            return JSONResponse(status_code=404, content={"message": "User not found", "status": "error"})
        
        if not bcrypt.checkpw(user.password.encode("utf-8"), user_data["password"]):
            return JSONResponse(status_code=403, content={"message": "Invalid password", "status": "error"})
        
        if not user_data["is_verified"]:
            return JSONResponse(status_code=403, content={"message": "User is not verified", "status": "error"})
        
        user_data["last_login"] = datetime.now().strftime("%a %d %B %Y, %H:%M:%S")
        db_connection.users_collection.update_one({"_id": user_data["_id"]}, {"$set": user_data})
        jwt_token = generate_access_token({"sub": str(user_data["_id"])}, expires_delta=timedelta(days=1))
        return JSONResponse(status_code=200, content={"message": "User logged in successfully", "token": jwt_token, "status": "success"})
    except Exception as e:
        return JSONResponse(status_code=500, content={"message": str(e), "status": "error"})

class sendOTPSchema(BaseModel):
    email: str

conf = ConnectionConfig(
   MAIL_USERNAME=os.getenv("MAIL_USER"),
   MAIL_PASSWORD=os.getenv("MAIL_SECRET"),
   MAIL_FROM=os.getenv("MAIL_USER"),
   MAIL_PORT=os.getenv("MAIL_PORT"),
   MAIL_SERVER=os.getenv("MAIL_HOST"),
   MAIL_FROM_NAME="Data Dock",
   MAIL_STARTTLS = True,
   MAIL_SSL_TLS = False,
   USE_CREDENTIALS = True,
   VALIDATE_CERTS = True
)
@app.post("/api/auth/otp/send/account")
async def send_otp(data: sendOTPSchema):
    try:
        if not data.email:
            return JSONResponse(status_code=400, content={"message": "Email is required", "status": "error"})
        user_data = db_connection.users_collection.find_one({"$or": [{"email": data.email}, {"username": data.email}]})
        if not user_data:
            return JSONResponse(status_code=404, content={"message": "User not found with this email", "status": "error"})
        """
        if (datetime.now() - user_data["verification_code_expires"]).seconds < 60:
            return JSONResponse(status_code=400, content={"message": "Please wait for 60 seconds before sending another OTP", "status": "error"})
        """
        otp_verification_code = random.randint(100000, 999999)
        otp_email = mail_template.otp_template(otp_verification_code, user_data["email"], "Verify your Account", "Thank you for choosing Data Dock. Use the following OTP to complete the procedure to verification of your account.")
        message = MessageSchema(
            subject="Verify your Account",
            recipients=[user_data["email"]],
            body=otp_email,
            subtype=MessageType.html,
        )
        hashedVerificationCode = bcrypt.hashpw(str(otp_verification_code).encode("utf-8"), bcrypt.gensalt())
        user_data["verification_code"] = hashedVerificationCode
        user_data["verification_code_expires"] = datetime.now() + timedelta(minutes=15)
        db_connection.users_collection.update_one({"_id": user_data["_id"]}, {"$set": user_data})
        fm = FastMail(conf)
        await fm.send_message(message)
        return JSONResponse(status_code=200, content={"message": "OTP sent successfully", "status": "success"})
    except Exception as e:
        return JSONResponse(status_code=500, content={"message": str(e), "status": "error"})
    
@app.post("/api/auth/login/email")
async def login_email(data: sendOTPSchema):
    try:
        if not data.email:
            return JSONResponse(status_code=400, content={"message": "Email is required", "status": "error"})
        user_data = db_connection.users_collection.find_one({"email": data.email})
        if not user_data:
            return JSONResponse(status_code=404, content={"message": "User not found with this email", "status": "error"})
        otp_verification_code = random.randint(100000, 999999)
        otp_email = mail_template.otp_template(otp_verification_code, data.email, "Login to your account", "Use the following OTP to complete the procedure of logging into your account.")
        message = MessageSchema(
            subject="Verify your Account",
            recipients=[data.email],
            body=otp_email,
            subtype=MessageType.html,
        )
        hashedVerificationCode = bcrypt.hashpw(str(otp_verification_code).encode("utf-8"), bcrypt.gensalt())
        user_data["verification_code"] = hashedVerificationCode
        user_data["verification_code_expires"] = datetime.now() + timedelta(minutes=15)
        db_connection.users_collection.update_one({"_id": user_data["_id"]}, {"$set": user_data})
        fm = FastMail(conf)
        await fm.send_message(message)
        return JSONResponse(status_code=200, content={"message": "OTP sent successfully", "status": "success"})
    except Exception as e:
        return JSONResponse(status_code=500, content={"message": str(e), "status": "error"})

class verifyOTPSchema(BaseModel):
    email: str
    otp: str

@app.post("/api/auth/otp/verify/account")
async def verify_otp(data: verifyOTPSchema):
    try:
        if not data.email or not data.otp:
            return JSONResponse(status_code=400, content={"message": "Email and OTP is required", "status": "error"})
        user_data = db_connection.users_collection.find_one({"$or": [{"email": data.email}, {"username": data.email}]})
        if not user_data:
            return JSONResponse(status_code=404, content={"message": "User not found with this email", "status": "error"})
        if datetime.now() > user_data["verification_code_expires"]:
            return JSONResponse(status_code=403, content={"message": "OTP expired", "status": "error"})
        if not bcrypt.checkpw(str(data.otp).encode("utf-8"), user_data["verification_code"]):
            return JSONResponse(status_code=400, content={"message": "Invalid OTP", "status": "error"})
        user_data["is_verified"] = True
        user_data["verification_code_expires"] = datetime.now()
        db_connection.users_collection.update_one({"_id": user_data["_id"]}, {"$set": user_data})
        try:
            os.makedirs(f"{fso.root_directory}/{user_data['user_directory']['root']}")
        except FileExistsError:
            pass
        return JSONResponse(status_code=200, content={"message": "OTP verified successfully", "status": "success"})
    except Exception as e:
        return JSONResponse(status_code=500, content={"message": str(e), "status": "error"})
    
@app.post("/api/auth/otp/verify/login")
async def verify_otp(data: verifyOTPSchema):
    try:
        if not data.email or not data.otp:
            return JSONResponse(status_code=400, content={"message": "Email and OTP is required", "status": "error"})
        user_data = db_connection.users_collection.find_one({"email": data.email})
        if not user_data:
            return JSONResponse(status_code=404, content={"message": "User not found with this email", "status": "error"})
        if datetime.now() > user_data["verification_code_expires"]:
            return JSONResponse(status_code=403, content={"message": "OTP expired", "status": "error"})
        if not bcrypt.checkpw(str(data.otp).encode("utf-8"), user_data["verification_code"]):
            return JSONResponse(status_code=400, content={"message": "Invalid OTP", "status": "error"})
        user_data["last_login"] = datetime.now().strftime("%a %d %B %Y, %H:%M:%S")
        user_data["verification_code_expires"] = datetime.now()
        db_connection.users_collection.update_one({"_id": user_data["_id"]}, {"$set": user_data})
        jwt_token = generate_access_token({"sub": str(user_data["_id"])}, expires_delta=timedelta(days=1))
        return JSONResponse(status_code=200, content={"message": "User logged in successfully", "token": jwt_token, "status": "success"})
    except Exception as e:
        return JSONResponse(status_code=500, content={"message": str(e), "status": "error"})



@app.get("/api/auth/user/profile")
async def get_user_profile(user: TokenData = Depends(get_current_active_user)):
    try:
        user_data = db_connection.users_collection.find_one({"_id": ObjectId(user.username)})
        if not user_data:
            return JSONResponse(status_code=404, content={"message": "User not found", "status": "error"})
        response = {
            "email": user_data["email"],
            "fullname": user_data["fullname"],
            "username": user_data["username"],
            "user_directory": user_data["user_directory"]
        }
        return JSONResponse(status_code=200, content={"message": response, "status": "success"})
    except Exception as e:
        return JSONResponse(status_code=500, content={"message": str(e), "status": "error"})

@app.get('/api/auth/user/storage/info')
async def get_user_storage_info(user: TokenData = Depends(get_current_active_user)):
    try:
        user_data = db_connection.users_collection.find_one({"_id": ObjectId(user.username)})
        if not user_data:
            return JSONResponse(status_code=404, content={"message": "User not found", "status": "error"})
        dir_count = fso.count_files_and_folders(f"{fso.root_directory}/{user_data['user_directory']['root']}")
        response = {
            "allocated_space": user_data["user_directory"]["allocated_space"],
            "used_space": round(user_data["user_directory"]["used_space"], 2),
            "count": {"files": dir_count[0], "folders": dir_count[1]}
        }
        return JSONResponse(status_code=200, content={"message": response, "status": "success"})
    except Exception as e:
        return JSONResponse(status_code=500, content={"message": str(e), "status": "error"})


class getDirectorySchema(BaseModel):
    directory_path: str
@app.post("/api/auth/user/get/directory")
async def get_directory(data: getDirectorySchema, user: TokenData = Depends(get_current_active_user)):
    try:
        user_data = db_connection.users_collection.find_one({"_id": ObjectId(user.username)})
        if not user_data:
            return JSONResponse(status_code=404, content={"message": "User not found", "status": "error"})
        directory_list = fso.scan_directory(data.directory_path)
        
        return JSONResponse(status_code=200, content={"message": directory_list, "status": "success"})
    except Exception as e:
        return JSONResponse(status_code=500, content={"message": str(e), "status": "error"})  



class createDirectorySchema(BaseModel):
    directory_name: str
    base_directory_path: str

@app.post("/api/auth/user/create/directory")
async def create_directory(data: createDirectorySchema, user: TokenData = Depends(get_current_active_user)):
    try:
        user_data = db_connection.users_collection.find_one({"_id": ObjectId(user.username)})
        if not user_data:
            return JSONResponse(status_code=404, content={"message": "User not found", "status": "error"})
        if os.path.exists(f"{fso.root_directory}/{data.base_directory_path}/{data.directory_name}"):
            return JSONResponse(status_code=400, content={"message": "Directory already exists", "status": "error"})
        if not os.path.exists(f"{data.base_directory_path}/{data.directory_name}"):
            os.makedirs(f"{fso.root_directory}/{data.base_directory_path}/{data.directory_name}")
            return JSONResponse(status_code=200, content={"message": "Directory created successfully", "status": "success"})
        
    except Exception as e:
        return JSONResponse(status_code=500, content={"message": str(e), "status": "error"})


    
@app.post("/api/auth/user/upload/file")
async def upload_file(
    directory_path: str = Form(...),
    file: UploadFile = File(...),
     user: TokenData = Depends(get_current_active_user)):
    try:
        user_data = db_connection.users_collection.find_one({"_id": ObjectId(user.username)})
        if not user_data:
            return JSONResponse(status_code=404, content={"message": "User not found", "status": "error"})
        if not os.path.exists(f"{fso.root_directory}/{directory_path}"):
            return JSONResponse(status_code=404, content={"message": "Directory not found", "status": "error"})
        file_path = os.path.join(f"{fso.root_directory}/{directory_path}", file.filename)
        with open(file_path, "wb") as buffer:
            buffer.write(file.file.read())
        folder_size = fso.get_directory_size(f"{fso.root_directory}/{user_data['user_directory']['root']}")/(1024*1024*1024)
        user_data["user_directory"]["used_space"] = folder_size
        db_connection.users_collection.update_one({"_id": user_data["_id"]}, {"$set": user_data})
        return JSONResponse(status_code=200, content={"message": "File uploaded successfully", "status": "success"})
    except Exception as e:
        return JSONResponse(status_code=500, content={"message": str(e), "status": "error"})



# Run the FastAPI application
if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, port=8000)