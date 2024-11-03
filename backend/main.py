from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from fastapi.exceptions import RequestValidationError
from pydantic import ValidationError, BaseModel, EmailStr, Field
from starlette.exceptions import HTTPException as StarletteHTTPException
from pymongo import MongoClient
import random
from typing import Dict, Optional, List
import bcrypt
from datetime import datetime, timedelta
import os
from dotenv import load_dotenv
from fastapi_mail import FastMail, MessageSchema, ConnectionConfig, MessageType
from starlette.requests import Request
from template import HTMLTemplate
from storage import FileServerOperations
from starlette.responses import JSONResponse

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
        existing_user = db_connection.users_collection.find_one({"email": user.email}) or db_connection.users_collection.find_one({"username": user.username})
        if existing_user:
            return JSONResponse(status_code=400, content={"message": "User already exists with this email or username"})
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
            "user_directory": {"allocated_space": 2.00, "used_space": 0.00, "root_directory": f"{fso.root_directory}/{user.username}"}
        }
        try:
            db_connection.users_collection.insert_one(user_data)
            return JSONResponse(status_code=200, content={"message": "User registered successfully"})
        except Exception as e:
            return JSONResponse(status_code=500, content={"message": str(e)})
        
    except Exception as e:
        return JSONResponse(status_code=500, content={"message": str(e)})


# Login User
class loginUserSchema(BaseModel):
    user: str = None
    password: str

@app.post("/api/auth/login")
async def login(user: loginUserSchema):
    try:
        if not user.user:
            return JSONResponse(status_code=400, content={"message": "Email or Username is required"})
        
        user_data = db_connection.users_collection.find_one({"$or": [{"email": user.user}, {"username": user.user}]})
        if not user_data:
            return JSONResponse(status_code=404, content={"message": "User not found"})
        
        if not bcrypt.checkpw(user.password.encode("utf-8"), user_data["password"]):
            return JSONResponse(status_code=403, content={"message": "Invalid password"})
        
        if not user_data["is_verified"]:
            return JSONResponse(status_code=403, content={"message": "User is not verified"})
        
        user_data["last_login"] = datetime.now().strftime("%a %d %B %Y, %H:%M:%S")
        db_connection.users_collection.update_one({"_id": user_data["_id"]}, {"$set": user_data})
        return JSONResponse(status_code=200, content={"message": "User logged in successfully"})
    except Exception as e:
        return JSONResponse(status_code=500, content={"message": str(e)})

class sendOTPSchema(BaseModel):
    email: EmailStr

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
            return JSONResponse(status_code=400, content={"message": "Email is required"})
        user_data = db_connection.users_collection.find_one({"email": data.email})
        if not user_data:
            return JSONResponse(status_code=404, content={"message": "User not found with this email"})
        if (datetime.now() - user_data["verification_code_expires"]).seconds < 60:
            return {"status": 400, "message": "Please wait for 60 seconds before sending another OTP"}
        otp_verification_code = random.randint(100000, 999999)
        otp_email = mail_template.otp_template(otp_verification_code, data.email, "Verify your Account", "Thank you for choosing Data Dock. Use the following OTP to complete the procedure to verification of your account.")
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
        return JSONResponse(status_code=200, content={"message": "OTP sent successfully"})
    except Exception as e:
        return JSONResponse(status_code=500, content={"message": str(e)})
    
@app.post("/api/auth/login/email")
async def login_email(data: sendOTPSchema):
    try:
        if not data.email:
            return JSONResponse(status_code=400, content={"message": "Email is required"})
        user_data = db_connection.users_collection.find_one({"email": data.email})
        if not user_data:
            return JSONResponse(status_code=404, content={"message": "User not found with this email"})
        if (datetime.now() - user_data["verification_code_expires"]).seconds < 60:
            return {"status": 400, "message": "Please wait for 60 seconds before sending another OTP"}
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
        return JSONResponse(status_code=200, content={"message": "OTP sent successfully"})
    except Exception as e:
        return JSONResponse(status_code=500, content={"message": str(e)})

class verifyOTPSchema(BaseModel):
    email: EmailStr
    otp: str

@app.post("/api/auth/otp/verify/account")
async def verify_otp(data: verifyOTPSchema):
    try:
        if not data.email or not data.otp:
            return JSONResponse(status_code=400, content={"message": "Email and OTP is required"})
        user_data = db_connection.users_collection.find_one({"email": data.email})
        if not user_data:
            return JSONResponse(status_code=404, content={"message": "User not found with this email"})
        if datetime.now() > user_data["verification_code_expires"]:
            return JSONResponse(status_code=403, content={"message": "OTP expired"})
        if not bcrypt.checkpw(str(data.otp).encode("utf-8"), user_data["verification_code"]):
            return {"status": 400, "message": "Invalid OTP"}
        user_data["is_verified"] = True
        user_data["verification_code_expires"] = datetime.now()
        db_connection.users_collection.update_one({"_id": user_data["_id"]}, {"$set": user_data})
        try:
            os.makedirs(user_data["user_directory"]["root_directory"])
        except FileExistsError:
            pass
        return JSONResponse(status_code=200, content={"message": "OTP verified successfully"})
    except Exception as e:
        return JSONResponse(status_code=500, content={"message": str(e)})
    
@app.post("/api/auth/otp/verify/login")
async def verify_otp(data: verifyOTPSchema):
    try:
        if not data.email or not data.otp:
            return JSONResponse(status_code=400, content={"message": "Email and OTP is required"})
        user_data = db_connection.users_collection.find_one({"email": data.email})
        if not user_data:
            return JSONResponse(status_code=404, content={"message": "User not found with this email"})
        if datetime.now() > user_data["verification_code_expires"]:
            return JSONResponse(status_code=403, content={"message": "OTP expired"})
        if not bcrypt.checkpw(str(data.otp).encode("utf-8"), user_data["verification_code"]):
            return {"status": 400, "message": "Invalid OTP"}
        user_data["last_login"] = datetime.now().strftime("%a %d %B %Y, %H:%M:%S")
        user_data["verification_code_expires"] = datetime.now()
        db_connection.users_collection.update_one({"_id": user_data["_id"]}, {"$set": user_data})
        return JSONResponse(status_code=200, content={"message": "User logged in successfully"})
    except Exception as e:
        return JSONResponse(status_code=500, content={"message": str(e)})

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, port=8000)