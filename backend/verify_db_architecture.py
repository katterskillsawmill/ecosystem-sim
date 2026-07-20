import os
import sys

sys.path.append("/root/ecosystems/ecosystem-sim/backend")
from academic_miner import AcademicResearchMiner

miner = AcademicResearchMiner()

print("--- [COUNCIL VERIFICATION] INITIATING ACADEMIC SWEEP ---")

print("\n1. Querying ArXiv (MIT / Stanford) for Vector Memory Architectures...")
arxiv_res = miner.fetch_arxiv_papers(query="Supabase Qdrant Vector Architecture RAG")
print(arxiv_res)

print("\n2. Querying CERN Zenodo for High-Scale Persistence...")
cern_res = miner.fetch_cern_research(query="Database Persistence Scaling")
print(cern_res)

print("\n3. Querying GitHub for Production Python Supabase Implementations...")
github_res = miner.fetch_github_repos(query="supabase python asyncpg fastapi")
print(github_res)

print("\n4. Querying HuggingFace for Qdrant RAG Models...")
hf_res = miner.fetch_huggingface_models(query="Qdrant RAG 1536")
print(hf_res)

print("\n--- [COUNCIL VERIFICATION] SWEEP COMPLETE ---")
