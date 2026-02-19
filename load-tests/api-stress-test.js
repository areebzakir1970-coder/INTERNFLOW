import http from 'k6/http';
import { check, sleep, group } from 'k6';

// Stress test configuration - push the system to its limits
export const options = {
  stages: [
    { duration: '30s', target: 20 },   // Warm up
    { duration: '1m', target: 100 },   // Normal load
    { duration: '1m', target: 200 },   // High load
    { duration: '1m', target: 350 },   // Higher stress load
    { duration: '1m', target: 500 },   // Maximum stress - 500 users!
    { duration: '30s', target: 0 },    // Ramp down
  ],
  thresholds: {
    'http_req_duration': ['p(95)<1000'], // 95% of requests should be below 1s
    'http_req_failed': ['rate<0.2'],     // Error rate should be less than 20%
    'http_reqs': ['rate>100'],           // At least 100 requests per second
  },
};

const BASE_URL = 'http://localhost:8000';

export default function () {
  group('Health Check', () => {
    const res = http.get(`${BASE_URL}/api/health`);
    check(res, {
      'health check status 200': (r) => r.status === 200,
    });
  });

  sleep(0.5);
  
  group('User Login Attempt', () => {
    const payload = JSON.stringify({
      email: 'test@example.com',
      password: 'test123',
      role: 'student'
    });

    const params = {
      headers: {
        'Content-Type': 'application/json',
      },
    };

    const res = http.post(`${BASE_URL}/api/v1/user/login`, payload, params);
    check(res, {
      'login attempt processed': (r) => r.status >= 200 && r.status < 500,
    });
  });

  sleep(1);
}
