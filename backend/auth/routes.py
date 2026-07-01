from fastapi import APIRouter, HTTPException, Header, Depends
from pydantic import BaseModel
from typing import Optional
from passlib.context import CryptContext
from auth.utils import create_access_token, verify_token
from db.mongo import users_collection

router = APIRouter()

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

class RegisterUser(BaseModel):
    email: str
    password: str
    first_name: str
    last_name: str
    company: Optional[str] = None

class LoginUser(BaseModel):
    email: str
    password: str

def get_current_user(authorization: str = Header(...)):
    try:
        token = authorization.split(" ")[1]
    except IndexError:
        raise HTTPException(status_code=401, detail="Invalid authorization header")
    payload = verify_token(token)
    if not payload:
        raise HTTPException(status_code=401, detail="Invalid token")
    return payload["user_id"]

@router.post("/register")
def register(user: RegisterUser):
    if users_collection.find_one({"email": user.email}):
        raise HTTPException(status_code=400, detail="User already exists")
    hashed = pwd_context.hash(user.password)
    users_collection.insert_one({
        "email": user.email,
        "password": hashed,
        "first_name": user.first_name,
        "last_name": user.last_name,
        "company": user.company,
    })
    return {"message": "User registered successfully"}

@router.post("/login")
def login(user: LoginUser):
    db_user = users_collection.find_one({"email": user.email})
    if not db_user or not pwd_context.verify(user.password, db_user["password"]):
        raise HTTPException(status_code=401, detail="Invalid credentials")
    token = create_access_token({"user_id": user.email})
    return {"access_token": token}

@router.get("/me")
def get_me(user_id: str = Depends(get_current_user)):
    user = users_collection.find_one({"email": user_id})
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return {
        "email": user["email"],
        "first_name": user.get("first_name", ""),
        "last_name": user.get("last_name", ""),
        "company": user.get("company", ""),
    }
