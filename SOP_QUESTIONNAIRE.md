# F100 Constellation: SOP & Architecture Questionnaire

> **URGENT / F100 INTEGRITY PROTOCOL**
> This questionnaire is a strict requirement for all F100 Ecosystems. It must be filled out by the Lead Architect / Swarm Agent before any code is pushed to production. Superficial answers will be rejected by the CPX62 OODA Loop.

## 1. Domain & Node Identity
- **Ecosystem Namespace:** `[e.g., ecosystem-sim]`
- **Primary Function:** What is the primary computational, financial, or visual purpose of this node?
- **Cloudflare Edge Route:** `[e.g., cooperlux.pages.dev]`

## 2. 11-Dimensional FFI & Data Persistence
- **Memory Boundary:** Does this ecosystem rely on standard PostgreSQL, Vercel KV, or the experimental 11D Rust/WASM FFI memory mappings?
- **Data Hydration:** Are you pulling live user configurations from BigBrain / Mangos via the CPX62 backend, or relying on mock artifacts?
- **Cache Invalidation:** How are Cloudflare Edge caches purged when the Python orchestration scripts modify underlying assets?

## 3. WebGL / Physics / Visual Sovereignty (If Applicable)
- **Render Engine:** If using Three.js / React Three Fiber, what is the target framerate (FPS) under load?
- **Shader Pipeline:** Are custom GLSL shaders utilized for the Cooperlux Elite aesthetic? 
- **Pointer Locks:** Have F100 User Gates / Pointer Lock API constraints been successfully implemented without HMR blocking?

## 4. Telemetry & Webhook Security
- **WebSockets:** What is the URI for realtime data ingestion? (e.g., `ws://localhost:3131/api/twin/stream`)
- **Webhooks:** Are Stripe / GitHub webhook signatures actively verified? 
- **AI Agent Introspection:** Which Python algorithms (`ecosystem-bigbrain`) monitor this node?

## 5. Deployment / Execution
- **Wrangler Binding:** Have you verified the `wrangler.toml` bindings against the F100 master credentials?
- **Quality Control:** Does the Playwright E2E suite (`quality-control.sh`) yield a 100% pass rate?
