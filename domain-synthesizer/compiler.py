import json
import os

def synthesize_domain(prompt: str) -> dict:
    """
    Acts as the LLM interface (OpenClaw / Hermes) to compile
    a natural language prompt into ECS configurations.
    """
    print(f"[Synthesizer] Analyzing domain prompt: '{prompt}'")
    
    # In a real environment, this would call out to OpenClaw via HTTP
    # Here we simulate the LLM extraction logic:
    
    if "hospital" in prompt.lower():
        entities = [
            {"name": "ER_Doctor", "role": "Processor", "capacity": 10.0, "processing_rate": 0.5},
            {"name": "Patient", "role": "Workload", "capacity": 1.0, "processing_rate": 0.0}
        ]
        tick_rate = 1.0
        
    elif "dcoop constellation" in prompt.lower():
        entities = [
            {"name": "TaskBroker", "role": "Router", "capacity": 1000.0, "processing_rate": 50.0},
            {"name": "OpenClaw_Agent", "role": "Inference", "capacity": 100.0, "processing_rate": 2.5},
            {"name": "MANGOS_Cost_Router", "role": "Optimizer", "capacity": 500.0, "processing_rate": 10.0}
        ]
        tick_rate = 0.1
        
    else:
        # Generic Fallback
        entities = [
            {"name": "GenericNode", "role": "Actor", "capacity": 50.0, "processing_rate": 1.0}
        ]
        tick_rate = 1.0

    config = {
        "domain_prompt": prompt,
        "tick_rate_ms": tick_rate,
        "entities": entities
    }
    
    return config

def export_config(config: dict, filepath: str):
    os.makedirs(os.path.dirname(filepath), exist_ok=True)
    with open(filepath, 'w') as f:
        json.dump(config, f, indent=4)
    print(f"[Synthesizer] Successfully exported simulation config to {filepath}")
