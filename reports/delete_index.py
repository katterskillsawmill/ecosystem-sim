import os
import pinecone
from dotenv import load_dotenv

load_dotenv()

PINECONE_API_KEY = os.getenv("PINECONE_API_KEY", "")
if PINECONE_API_KEY:
    pc = pinecone.Pinecone(api_key=PINECONE_API_KEY)
    try:
        pc.delete_index('ecosystem-sim')
        print("Deleted ecosystem-sim index successfully")
    except Exception as e:
        print(f"Error: {e}")
