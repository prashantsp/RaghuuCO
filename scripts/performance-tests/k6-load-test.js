/**
 * K6 Load Testing Scripts
 * RAGHUU CO Legal Practice Management System
 * 
 * @author RAGHUU CO Development Team
 * @version 1.0.0
 * @since 2025-08-24
 * 
 * @description This script provides comprehensive load testing for the
 * legal practice management system using K6 performance testing framework.
 */

import http from 'k6/http';
import { check, sleep } from 'k6';
import { Rate, Trend, Counter } from 'k6/metrics';

// Custom metrics
const errorRate = new Rate('errors');
const authSuccessRate = new Rate('auth_success');
const apiResponseTime = new Trend('api_response_time');
const databaseQueryTime = new Trend('db_query_time');
const cacheHitRate = new Rate('cache_hits');

// Test configuration
export const options = {
  stages: [
    // Ramp up to 50 users over 2 minutes
    { duration: '2m', target: 50 },
    // Stay at 50 users for 5 minutes
    { duration: '5m', target: 50 },
    // Ramp up to 100 users over 3 minutes
    { duration: '3m', target: 100 },
    // Stay at 100 users for 10 minutes
    { duration: '10m', target: 100 },
    // Ramp down to 0 users over 2 minutes
    { duration: '2m', target: 0 }
  ],
  thresholds: {
    http_req_duration: ['p(95)<2000'], // 95% of requests should be below 2s
    http_req_failed: ['rate<0.1'], // Error rate should be below 10%
    errors: ['rate<0.05'], // Custom error rate should be below 5%
    auth_success: ['rate>0.95'], // Auth success rate should be above 95%
    api_response_time: ['p(95)<1500'], // API response time should be below 1.5s
    db_query_time: ['p(95)<500'], // DB query time should be below 500ms
    cache_hits: ['rate>0.8'] // Cache hit rate should be above 80%
  }
};

// Global variables
let authToken = '';
let userId = '';
let caseId = '';
let clientId = '';
let documentId = '';

/**
 * Setup function - runs once before the test
 */
export function setup() {
  console.log('Setting up load test...');
  
  // Login and get auth token
  const loginResponse = http.post(`${__ENV.API_URL || 'http://localhost:3001'}/api/v1/auth/login`, {
    email: 'test@raghuuco.com',
    password: 'testpassword123'
  });

  check(loginResponse, {
    'login successful': (r) => r.status === 200 && r.json('token'),
    'login response time < 1s': (r) => r.timings.duration < 1000
  });

  if (loginResponse.status === 200) {
    authToken = loginResponse.json('token');
    userId = loginResponse.json('user.id');
    authSuccessRate.add(1);
  } else {
    authSuccessRate.add(0);
    console.error('Login failed:', loginResponse.body);
  }

  return { authToken, userId };
}

/**
 * Main test function
 */
export default function(data) {
  const { authToken, userId } = data;
  
  if (!authToken) {
    console.error('No auth token available');
    return;
  }

  const headers = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${authToken}`
  };

  // Test different API endpoints
  testDashboard(headers);
  testCases(headers);
  testClients(headers);
  testDocuments(headers);
  testTimeTracking(headers);
  testBilling(headers);
  testSearch(headers);
  testAnalytics(headers);

  // Random sleep between requests
  sleep(Math.random() * 2 + 1);
}

/**
 * Test dashboard endpoints
 */
function testDashboard(headers) {
  const startTime = Date.now();
  
  const response = http.get(`${__ENV.API_URL || 'http://localhost:3001'}/api/v1/dashboard`, {
    headers: headers
  });

  const duration = Date.now() - startTime;
  apiResponseTime.add(duration);

  check(response, {
    'dashboard status is 200': (r) => r.status === 200,
    'dashboard has data': (r) => r.json('stats') !== undefined,
    'dashboard response time < 2s': (r) => r.timings.duration < 2000
  });

  errorRate.add(response.status !== 200);
}

/**
 * Test cases endpoints
 */
function testCases(headers) {
  // Get cases list
  const casesResponse = http.get(`${__ENV.API_URL || 'http://localhost:3001'}/api/v1/cases?limit=20&page=1`, {
    headers: headers
  });

  check(casesResponse, {
    'cases list status is 200': (r) => r.status === 200,
    'cases list has data': (r) => r.json('data') !== undefined,
    'cases response time < 1.5s': (r) => r.timings.duration < 1500
  });

  errorRate.add(casesResponse.status !== 200);

  // Get specific case if available
  if (casesResponse.status === 200 && casesResponse.json('data').length > 0) {
    const firstCase = casesResponse.json('data')[0];
    caseId = firstCase.id;

    const caseResponse = http.get(`${__ENV.API_URL || 'http://localhost:3001'}/api/v1/cases/${caseId}`, {
      headers: headers
    });

    check(caseResponse, {
      'case detail status is 200': (r) => r.status === 200,
      'case detail has data': (r) => r.json('id') === caseId,
      'case detail response time < 1s': (r) => r.timings.duration < 1000
    });

    errorRate.add(caseResponse.status !== 200);
  }
}

/**
 * Test clients endpoints
 */
function testClients(headers) {
  const clientsResponse = http.get(`${__ENV.API_URL || 'http://localhost:3001'}/api/v1/clients?limit=20&page=1`, {
    headers: headers
  });

  check(clientsResponse, {
    'clients list status is 200': (r) => r.status === 200,
    'clients list has data': (r) => r.json('data') !== undefined,
    'clients response time < 1.5s': (r) => r.timings.duration < 1500
  });

  errorRate.add(clientsResponse.status !== 200);

  if (clientsResponse.status === 200 && clientsResponse.json('data').length > 0) {
    const firstClient = clientsResponse.json('data')[0];
    clientId = firstClient.id;

    const clientResponse = http.get(`${__ENV.API_URL || 'http://localhost:3001'}/api/v1/clients/${clientId}`, {
      headers: headers
    });

    check(clientResponse, {
      'client detail status is 200': (r) => r.status === 200,
      'client detail has data': (r) => r.json('id') === clientId,
      'client detail response time < 1s': (r) => r.timings.duration < 1000
    });

    errorRate.add(clientResponse.status !== 200);
  }
}

/**
 * Test documents endpoints
 */
function testDocuments(headers) {
  const documentsResponse = http.get(`${__ENV.API_URL || 'http://localhost:3001'}/api/v1/documents?limit=20&page=1`, {
    headers: headers
  });

  check(documentsResponse, {
    'documents list status is 200': (r) => r.status === 200,
    'documents list has data': (r) => r.json('data') !== undefined,
    'documents response time < 1.5s': (r) => r.timings.duration < 1500
  });

  errorRate.add(documentsResponse.status !== 200);

  if (documentsResponse.status === 200 && documentsResponse.json('data').length > 0) {
    const firstDocument = documentsResponse.json('data')[0];
    documentId = firstDocument.id;

    const documentResponse = http.get(`${__ENV.API_URL || 'http://localhost:3001'}/api/v1/documents/${documentId}`, {
      headers: headers
    });

    check(documentResponse, {
      'document detail status is 200': (r) => r.status === 200,
      'document detail has data': (r) => r.json('id') === documentId,
      'document detail response time < 1s': (r) => r.timings.duration < 1000
    });

    errorRate.add(documentResponse.status !== 200);
  }
}

/**
 * Test time tracking endpoints
 */
function testTimeTracking(headers) {
  const timeEntriesResponse = http.get(`${__ENV.API_URL || 'http://localhost:3001'}/api/v1/time-entries?limit=20&page=1`, {
    headers: headers
  });

  check(timeEntriesResponse, {
    'time entries list status is 200': (r) => r.status === 200,
    'time entries list has data': (r) => r.json('data') !== undefined,
    'time entries response time < 1.5s': (r) => r.timings.duration < 1500
  });

  errorRate.add(timeEntriesResponse.status !== 200);

  // Test time tracking summary
  const summaryResponse = http.get(`${__ENV.API_URL || 'http://localhost:3001'}/api/v1/time-entries/summary?period=week`, {
    headers: headers
  });

  check(summaryResponse, {
    'time summary status is 200': (r) => r.status === 200,
    'time summary has data': (r) => r.json('totalHours') !== undefined,
    'time summary response time < 1s': (r) => r.timings.duration < 1000
  });

  errorRate.add(summaryResponse.status !== 200);
}

/**
 * Test billing endpoints
 */
function testBilling(headers) {
  const invoicesResponse = http.get(`${__ENV.API_URL || 'http://localhost:3001'}/api/v1/invoices?limit=20&page=1`, {
    headers: headers
  });

  check(invoicesResponse, {
    'invoices list status is 200': (r) => r.status === 200,
    'invoices list has data': (r) => r.json('data') !== undefined,
    'invoices response time < 1.5s': (r) => r.timings.duration < 1500
  });

  errorRate.add(invoicesResponse.status !== 200);

  // Test billing summary
  const billingSummaryResponse = http.get(`${__ENV.API_URL || 'http://localhost:3001'}/api/v1/billing/summary?period=month`, {
    headers: headers
  });

  check(billingSummaryResponse, {
    'billing summary status is 200': (r) => r.status === 200,
    'billing summary has data': (r) => r.json('totalRevenue') !== undefined,
    'billing summary response time < 1s': (r) => r.timings.duration < 1000
  });

  errorRate.add(billingSummaryResponse.status !== 200);
}

/**
 * Test search functionality
 */
function testSearch(headers) {
  const searchTerms = ['case', 'client', 'document', 'invoice', 'contract'];
  const randomTerm = searchTerms[Math.floor(Math.random() * searchTerms.length)];

  const searchResponse = http.get(`${__ENV.API_URL || 'http://localhost:3001'}/api/v1/search?q=${randomTerm}&limit=10`, {
    headers: headers
  });

  check(searchResponse, {
    'search status is 200': (r) => r.status === 200,
    'search has results': (r) => r.json('results') !== undefined,
    'search response time < 2s': (r) => r.timings.duration < 2000
  });

  errorRate.add(searchResponse.status !== 200);

  // Test search suggestions
  const suggestionsResponse = http.get(`${__ENV.API_URL || 'http://localhost:3001'}/api/v1/search/suggestions?q=${randomTerm}`, {
    headers: headers
  });

  check(suggestionsResponse, {
    'search suggestions status is 200': (r) => r.status === 200,
    'search suggestions has data': (r) => r.json('suggestions') !== undefined,
    'search suggestions response time < 500ms': (r) => r.timings.duration < 500
  });

  errorRate.add(suggestionsResponse.status !== 200);
}

/**
 * Test analytics endpoints
 */
function testAnalytics(headers) {
  const analyticsResponse = http.get(`${__ENV.API_URL || 'http://localhost:3001'}/api/v1/analytics/business?period=month`, {
    headers: headers
  });

  check(analyticsResponse, {
    'analytics status is 200': (r) => r.status === 200,
    'analytics has data': (r) => r.json('revenue') !== undefined,
    'analytics response time < 3s': (r) => r.timings.duration < 3000
  });

  errorRate.add(analyticsResponse.status !== 200);

  // Test productivity analytics
  const productivityResponse = http.get(`${__ENV.API_URL || 'http://localhost:3001'}/api/v1/analytics/productivity?period=week`, {
    headers: headers
  });

  check(productivityResponse, {
    'productivity analytics status is 200': (r) => r.status === 200,
    'productivity analytics has data': (r) => r.json('userProductivity') !== undefined,
    'productivity analytics response time < 2s': (r) => r.timings.duration < 2000
  });

  errorRate.add(productivityResponse.status !== 200);
}

/**
 * Teardown function - runs once after the test
 */
export function teardown(data) {
  console.log('Load test completed');
  console.log('Final metrics:');
  console.log('- Error rate:', errorRate.value);
  console.log('- Auth success rate:', authSuccessRate.value);
  console.log('- Average API response time:', apiResponseTime.value);
  console.log('- Average DB query time:', databaseQueryTime.value);
  console.log('- Cache hit rate:', cacheHitRate.value);
}