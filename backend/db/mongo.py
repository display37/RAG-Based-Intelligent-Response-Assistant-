from pymongo import MongoClient, ASCENDING
import os
import certifi
from dotenv import load_dotenv

load_dotenv()

MONGO_URI = os.getenv("MONGO_URI")

client = MongoClient(MONGO_URI, tlsCAFile=certifi.where())

db = client["ai_rag_saas"]

users_collection = db["users"]
chats_collection = db["chats"]

def create_indexes():
    users_collection.create_index([("email", ASCENDING)], unique=True)
    chats_collection.create_index([("user_id", ASCENDING)])
    chats_collection.create_index([("chat_id", ASCENDING)])
