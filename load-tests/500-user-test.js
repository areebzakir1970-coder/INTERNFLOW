import http from 'k6/http';
import { check, sleep, group } from 'k6';

// 500 user stress test - realistic scenario with login
export const options = {
  stages: [
    { duration: '30s', target: 50 },    // Warm up to 50
    { duration: '1m', target: 150 },    // Build to 150
    { duration: '1m', target: 300 },    // Build to 300
    { duration: '1m', target: 500 },    // Maximum - 500 users!
    { duration: '1m', target: 500 },    // Sustain at 500
    { duration: '30s', target: 0 },     // Ramp down
  ],
  thresholds: {
    'http_req_duration': ['p(95)<3000'], // Allow up to 3s under extreme load
    'http_req_failed': ['rate<0.4'],     // Allow up to 40% failures under extreme stress
  },
};

const BASE_URL = 'http://localhost:8000';
const TEST_EMAIL = 'x@gmail.com';
const TEST_PASSWORD = 'x';

export default function () {
  const params = {
    headers: {
      'Content-Type': 'application/json',
    },
  };

  group('Health Check', () => {
    const res = http.get(`${BASE_URL}/api/health`);
    check(res, {
      'health check ok': (r) => r.status === 200,
    });
  });

  sleep(0.3);

  group('User Login - Student', () => {
    const payload = JSON.stringify({
      email: TEST_EMAIL,
      password: TEST_PASSWORD,
      role: 'student'
    });

    const res = http.post(`${BASE_URL}/api/v1/user/login`, payload, params);
    check(res, {
      'login processed': (r) => r.status === 200 || r.status === 400,
      'response time < 3s': (r) => r.timings.duration < 3000,
    });
  });

  sleep(0.5);
}
