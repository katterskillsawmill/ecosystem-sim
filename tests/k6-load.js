import http from 'k6/http';
import { sleep, check } from 'k6';

export const options = {
    vus: 5,
    duration: '30s',
    thresholds: {
        http_req_duration: ['p(95)<2000'], // 95% of requests must be under 2s
        http_req_failed: ['rate<0.01'],    // Errors must be less than 1%
    },
};

export default function () {
    const ecosystems = ["Rust and WASM Edge Nodes", "Azure Quantum", "Foxglove Robotics", "Web3"];
    const target = ecosystems[Math.floor(Math.random() * ecosystems.length)];
    
    // We are stressing the endpoint that triggers the full F100 OODA loop
    const url = `http://localhost:3131/api/ooda/execute?target_ecosystem=${encodeURIComponent(target)}`;
    
    const res = http.post(url);
    
    check(res, {
        'status is 200': (r) => r.status === 200,
        'marathon complete': (r) => r.json('status') === 'MARATHON_CYCLE_COMPLETE',
    });
    
    sleep(1);
}
