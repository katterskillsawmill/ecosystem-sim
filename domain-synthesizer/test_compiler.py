import os
from compiler import synthesize_domain, export_config

def run_tests():
    print("--- Running Domain Synthesizer Tests ---")
    
    # Test 1: Hospital ER
    hospital_config = synthesize_domain("Simulate a 500-bed hospital ER during a power outage")
    export_config(hospital_config, "../scenarios/hospital_er.json")
    assert hospital_config["entities"][0]["name"] == "ER_Doctor"
    
    # Test 2: DCoop Constellation
    dcoop_config = synthesize_domain("Simulate the DCoop Constellation with 500 active agents")
    export_config(dcoop_config, "../scenarios/dcoop_constellation_twin.json")
    assert dcoop_config["entities"][0]["name"] == "TaskBroker"
    
    print("--- All tests passed! Scenarios generated in /scenarios/ ---")

if __name__ == "__main__":
    run_tests()
