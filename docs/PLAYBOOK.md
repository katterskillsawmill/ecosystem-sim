# F100 DCOOP HQ - ULTIMATE PLAYBOOK

## 1. Introduction
Welcome to the operational manual for the **F100 Ecosystem Simulation Engine**. 
This architecture represents a mathematical leap in AI capabilities, shifting from simple "prompt-response" mechanics into **Phase 5: Continuous BigBrain Autonomous OODA Loops**.

## 2. Core Architecture
The system is divided into two primary containers:
* **The WebGL React Frontend**: Port `3000`. A fully 3D interactive Next.js application running `react-three-fiber` and the rapier physics engine.
* **The BigBrain FastAPI Backend**: Port `3131`. A Python engine hosting the `MANGOS` cost-first router, the `AcademicResearchMiner`, and the `Digital Twin WebSocket` stream.

## 3. Operational Deployment
This architecture is now fully containerized. To deploy this to production (Hetzner, AWS, Azure):
```bash
# Boot the F100 Swarm
docker-compose up -d --build

# Monitor the Live AI Telemetry Logs
docker-compose logs -f backend
```

## 4. The BigBrain Loop
The F100 Swarm no longer requires human input. The moment `server.py` boots, it spawns an `asyncio` task.
1. The orchestrator selects a bleeding-edge web research topic.
2. The **MANGOS Router** actively evaluates token API costs (Grok, Claude, Cursor) and routes the task financially.
3. The **Academic Miner** performs physical `HTTP GET` calls against the ArXiv, GitHub, and HuggingFace APIs to extract "Golden Gems".
4. The system physicalizes the findings into `/root/ecosystems/reports/`.
5. The loop repeats endlessly, driving a continuous stream of AI intelligence into your servers.

## 5. TVP Quality Control (Trust, Verify, Prove)
To ensure the backend endpoints never deteriorate, you must run the Playwright headless validation suite:
```bash
cd ui-dashboard
npx playwright test e2e/api.spec.ts
```
If the output says `2 passed`, the BigBrain and WebSockets are mathematically proven to be alive.

## 6. Accessing the Matrix Monitor
1. Navigate to `http://localhost:3000` (or your cloud domain).
2. Use WASD to navigate the 3D datacenter.
3. Walk into the proximity sensor of any **Computer Terminal**.
4. The screen will automatically project a live `ws://localhost:3131` WebSocket stream of the BigBrain's internal monologue in real-time.

## 7. Advanced Runbook: Developer Accounts & API Keys
To unleash the swarm without hitting rate limits, you must authenticate the pipelines.
1. Copy the `.env.example` file: `cp .env.example .env`
2. **GitHub PAT**: Generate a fine-grained token at `github.com/settings/tokens`.
3. **HuggingFace**: Generate a read token at `huggingface.co/settings/tokens`.
4. **LLM Routers**: Provide API keys for Anthropic (Claude), OpenAI, and xAI (Grok).
5. Inject the `.env` into the Docker swarm:
```bash
docker-compose --env-file .env up -d
```

## 8. Phase 6 Pipelines (Pre-PRD Marathon)
The F100 architecture is evolving into a global publishing hub.
* **Dane-Portal Engine**: The Next.js frontend will be locked behind the `PORTAL_ADMIN_USER` secure ingress. Only authorized DCoop Executives will be able to access the 3D terminals and issue directives.
* **Eco-Publishing Engine**: The BigBrain's generated `/reports` markdown artifacts will be automatically picked up by an active listener, parsed, and fired off to a Vercel Deploy Hook, statically compiling the intelligence into a public-facing Web 3.0 blog automatically.

---
*End of Playbook. The Swarm is Yours.*

## Live HQ ports

- Backend: `http://127.0.0.1:3135`
- Frontend: `http://127.0.0.1:3002`
- Redis: `6379`
