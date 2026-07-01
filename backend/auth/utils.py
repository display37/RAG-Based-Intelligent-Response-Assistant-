import os
from jose import jwt, JWTError
from datetime import datetime, timedelta

ALGORITHM = "HS256"

def _get_secret():
    key = os.getenv("SECRET_KEY")
    if not key:
        raise RuntimeError("SECRET_KEY environment variable is not set")
    return key

def create_access_token(data: dict):
    payload = data.copy()
    payload["exp"] = datetime.utcnow() + timedelta(hours=24)
    return jwt.encode(payload, _get_secret(), algorithm=ALGORITHM)

def verify_token(token: str):
    try:
        payload = jwt.decode(token, _get_secret(), algorithms=[ALGORITHM])
        return payload
    except JWTError:
        return None
