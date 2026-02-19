import http from 'k6/http';
import { check, sleep } from 'k6';

// Spike test - sudden burst of traffic
export const options = {
  stages: [
    { duration: '10s', target: 10 },    // Normal load
    { duration: '10s', target: 500 },   // Sudden spike!
    { duration: '30s', target: 500 },   // Maintain spike
    { duration: '10s', target: 10 },    // Back to normal
    { duration: '10s', target: 0 },     // Ramp down
  ],
  thresholds: {
    'http_req_duration': ['p(95)<2000'], // Allow higher latency during spike
    'http_req_failed': ['rate<0.3'],     // Allow some failures during spike
  },
};

const BASE_URL = 'http://localhost:8000';

export default function () {
  const res = http.get(`${BASE_URL}/api/health`);
  
  check(res, {
    'status is 200': (r) => r.status === 200,
    'survived spike': (r) => r.status !== 0,
  });

  sleep(0.3);
}
