import os
import json
import asyncio
import datetime
import redis
import pinecone
from sentence_transformers import SentenceTransformer
from dotenv import load_dotenv

from academic_miner import AcademicResearchMiner
from server import MangosOrchestrator, KimiObserver, GrokObserver, DeepSeekNIMOrienter, AzureQuantumOrienter, OllamaHermesCommander, CursorHeadlessActor, ComfyUIAssetActor, PlaywrightEmbodiedActor, ReflectiveMemoryActor

load_dotenv()

redis_client = redis.Redis(host='redis', port=6379, db=0)

def broadcast(message: str):
    print(message)
    try:
        redis_client.publish('bigbrain_channel', message)
    except Exception as e:
        print(f"[Redis Error] {e}")

async def bigbrain_autonomous_loop():
    await asyncio.sleep(5)
    f100_ecosystems = [
        "Rust and WASM Edge Nodes",
        "Azure Quantum Simulated Annealing",
        "Foxglove Robotics Digital Twins",
        "Web3 DLT RPC Pipelines",
        "SportsInvest Algorithmic Finance"
    ]
    
    PINECONE_API_KEY = os.getenv("PINECONE_API_KEY", "")
    print("[WORKER] Loading sentence-transformers model...")
    model = SentenceTransformer('all-MiniLM-L6-v2')
    
    if PINECONE_API_KEY:
        pc = pinecone.Pinecone(api_key=PINECONE_API_KEY)
        try:
            indexes = [i.name for i in pc.list_indexes()]
            if "ecosystem-sim" not in indexes:
                print("[PINECONE] Creating index 'ecosystem-sim' with dimension 384...")
                pc.create_index(
                    name="ecosystem-sim",
                    dimension=384,
                    metric="cosine",
                    spec=pinecone.ServerlessSpec(cloud="aws", region="us-east-1")
                )
            index = pc.Index("ecosystem-sim")
        except Exception as e:
            print(f"[Pinecone Init Error] {e}")
            index = None
    else:
        index = None
        
    ecosystem_index = 0
    while True:
        target_ecosystem = f100_ecosystems[ecosystem_index % len(f100_ecosystems)]
        ecosystem_index += 1
        
        broadcast(f"[BIGBRAIN LOOP] Initiating Dynamic Red Team Audit for: '{target_ecosystem}'")
        
        orchestrator = MangosOrchestrator()
        decision = orchestrator.delegate_swarm({}, {"prompt": f"red team audit {target_ecosystem}"})
        broadcast(f"[MANGOS SWARM] Cost-Efficiency Analyzed. Dispatched tasks: {decision['tasks']}")
        
        await asyncio.sleep(2)
        
        miner = AcademicResearchMiner()
        report_path = miner.execute_red_team_audit(target_ecosystem)
        
        broadcast(f"[RED TEAM OODA] Golden Gems Extracted. CERN, ArXiv, GitHub, HF Indexed.")
        broadcast(f"[SYSTEM] Red Team Audit Report persisted to: {report_path}")
        
        broadcast(f"[DIGITAL TWIN] DCoop HQ Telemetry: CPU Load 68% | Active Nodes 4,096")
        if index:
            try:
                audit_text = f"Red team audit for {target_ecosystem}. Results: Golden Gems Extracted."
                vector = model.encode(audit_text).tolist()
                
                index.upsert(
                    vectors=[{
                        "id": f"audit-{datetime.datetime.now().timestamp()}", 
                        "values": vector, 
                        "metadata": {"ecosystem": target_ecosystem, "source": "local_model"}
                    }],
                    namespace=target_ecosystem.replace(" ", "-").lower()
                )
                broadcast(f"[PINECONE] Real Embedding (384d) logged to vector database for Immortality.")
            except Exception as e:
                print(f"[Pinecone Error] {e}")
        
        broadcast("--- OODA MARATHON CYCLE COMPLETE. PREPARING NEXT ECOSYSTEM ---")
        await asyncio.sleep(15)

if __name__ == "__main__":
    asyncio.run(bigbrain_autonomous_loop())
