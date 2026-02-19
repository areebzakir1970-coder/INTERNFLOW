import http from 'k6/http';

// Setup script - Run once to create test user
export default function () {
  const BASE_URL = 'http://localhost:8000';
  
  // Try to register test user
  const registerPayload = JSON.stringify({
    fullname: 'Test User',
    email: 'x@gmail.com',
    phoneNumber: '1234567890',
    password: 'x',
    role: 'student'
  });

  const params = {
    headers: {
      'Content-Type': 'application/json',
    },
  };

  console.log('Creating test user for load testing...');
  const res = http.post(`${BASE_URL}/api/v1/user/register`, registerPayload, params);
  
  if (res.status === 201) {
    console.log('✅ Test user created successfully!');
  } else if (res.status === 400 && res.body.includes('already exists')) {
    console.log('✅ Test user already exists - ready for testing!');
  } else {
    console.log(`⚠️  Response: ${res.status} - ${res.body}`);
  }
}

export const options = {
  iterations: 1,  // Run only once
  vus: 1,         // Single user
};
