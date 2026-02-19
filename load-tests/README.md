# Load Testing for Job Portal (Kubernetes Deployment)

This directory contains k6 load testing scripts to test the performance and scalability of your Job Portal application running on Minikube.

## Prerequisites

1. **Install k6**:
   ```powershell
   # Using Chocolatey
   choco install k6
   
   # Or download from: https://k6.io/docs/get-started/installation/
   ```

2. **Ensure port-forwarding is active**:
   ```powershell
   # Terminal 1 - Backend
   kubectl port-forward -n job-portal deployment/backend 8000:8000
   
   # Terminal 2 - Frontend
   kubectl port-forward -n job-portal deployment/frontend 5173:80
   ```

## Available Tests

### 1. Basic Health Test (`basic-health-test.js`)
Tests the basic health endpoint with gradual load increase.
- **Duration**: ~2 minutes
- **Max Users**: 100 concurrent users
- **Use Case**: Basic API availability and response time

**Run:**
```powershell
k6 run load-tests/basic-health-test.js
```

### 2. API Stress Test (`api-stress-test.js`)
Comprehensive test covering multiple endpoints with high load.
- **Duration**: ~4 minutes
- **Max Users**: 300 concurrent users
- **Use Case**: Finding system breaking point

**Run:**
```powershell
k6 run load-tests/api-stress-test.js
```

### 3. Spike Test (`spike-test.js`)
Sudden traffic burst to test system resilience.
- **Duration**: ~1.5 minutes
- **Max Users**: 500 concurrent users (sudden spike)
- **Use Case**: Testing auto-scaling and recovery

**Run:**
```powershell
k6 run load-tests/spike-test.js
```

## Monitor Kubernetes During Tests

### Watch Pod Resources
```powershell
# Terminal 3 - Monitor pods
kubectl top pods -n job-portal --watch

# View detailed pod metrics
kubectl describe pods -n job-portal
```

### Watch Backend Logs
```powershell
# Terminal 4 - Backend logs
kubectl logs -f deployment/backend -n job-portal
```

### Check Pod Status
```powershell
kubectl get pods -n job-portal -w
```

## Understanding Results

### Key Metrics:
- **http_req_duration**: Response time (lower is better)
- **http_req_failed**: Failed requests percentage
- **http_reqs**: Requests per second
- **vus (Virtual Users)**: Concurrent users

### Success Criteria:
✅ **http_req_duration (p95) < 500ms** - 95% of requests complete in under 500ms
✅ **http_req_failed < 10%** - Less than 10% error rate
✅ **No pod crashes** - All pods remain running

### Warning Signs:
⚠️ Response time > 1s
⚠️ Error rate > 20%
⚠️ Pods restarting
⚠️ Memory/CPU limits reached

## Export Results

### Save results to file:
```powershell
k6 run --out json=results.json load-tests/basic-health-test.js
```

### Generate HTML report:
```powershell
k6 run --out json=results.json load-tests/basic-health-test.js
# Then use k6-reporter to generate HTML
```

## Scaling Recommendations

Based on test results, you may need to:

1. **Scale backend pods**:
   ```powershell
   kubectl scale deployment backend -n job-portal --replicas=5
   ```

2. **Increase resource limits** (edit `k8s/backend-deployment.yaml`):
   ```yaml
   resources:
     limits:
       memory: "1Gi"
       cpu: "1000m"
   ```

3. **Enable Horizontal Pod Autoscaler**:
   ```powershell
   kubectl autoscale deployment backend -n job-portal --cpu-percent=70 --min=2 --max=10
   ```

## Troubleshooting

### Port-forward dies during test
- Increase timeouts or run tests in shorter bursts
- Use k8s services directly if on same network

### Connection refused errors
- Verify port-forwarding is active: `netstat -ano | findstr :8000`
- Check backend pods are running: `kubectl get pods -n job-portal`

### High error rates
- Check backend logs for errors
- Verify MongoDB connection is stable
- Check resource limits aren't being hit

## Next Steps

1. Run basic test first to establish baseline
2. Gradually increase load with stress test
3. Test spike scenarios
4. Monitor and tune based on results
5. Set up autoscaling if needed
