/**
 * Comprehensive Tutor Functionalities Test Script
 * Tests all tutor endpoints with mock data
 * 
 * Usage: node test-tutor-endpoints.js
 */

const BASE_URL = process.env.API_URL || 'http://localhost:3000';

// Mock data
const mockTutorRegistration = {
  email: `test.tutor.${Date.now()}@example.com`,
  password: 'TestPassword123!',
  firstName: 'John',
  lastName: 'Doe',
  phone: '+27123456789',
  location: 'Cape Town',
  subjects: 'Mathematics, Physics, Chemistry',
  qualifications: 'BSc Mathematics, MSc Physics, Teaching Certificate',
  experience: '10 years of teaching experience at university level',
};

const mockTutorUpdate = {
  firstName: 'John',
  lastName: 'Smith',
  phone: '+27987654321',
  location: 'Johannesburg',
  subjects: 'Mathematics, Physics, Chemistry, Computer Science',
  qualifications: 'BSc Mathematics, MSc Physics, PhD Physics, Teaching Certificate',
  experience: '15 years of teaching experience',
};

const mockStudentRegistration = {
  email: `test.student.${Date.now()}@example.com`,
  password: 'TestPassword123!',
  firstName: 'Jane',
  lastName: 'Student',
  phone: '+27111111111',
  location: 'Durban',
};

let tutorToken = null;
let tutorId = null;
let studentToken = null;
let studentId = null;

// Helper function to make API requests
async function apiRequest(method, endpoint, data = null, token = null) {
  const url = `${BASE_URL}${endpoint}`;
  const options = {
    method,
    headers: {
      'Content-Type': 'application/json',
    },
  };

  if (token) {
    options.headers['Authorization'] = `Bearer ${token}`;
  }

  if (data) {
    options.body = JSON.stringify(data);
  }

  try {
    const response = await fetch(url, options);
    const responseData = await response.json().catch(() => ({ message: 'No JSON response' }));
    
    return {
      status: response.status,
      ok: response.ok,
      data: responseData,
    };
  } catch (error) {
    return {
      status: 0,
      ok: false,
      error: error.message,
    };
  }
}

// Test functions
async function testTutorRegistration() {
  console.log('\n📝 Test 1: Tutor Registration');
  console.log('─────────────────────────────────────');
  
  const result = await apiRequest('POST', '/auth/register', mockTutorRegistration);
  
  if (result.ok && result.data.tutor) {
    console.log('✅ Tutor registration successful');
    console.log(`   Tutor ID: ${result.data.tutor.id}`);
    console.log(`   Email: ${result.data.tutor.email}`);
    console.log(`   Status: ${result.data.tutor.status}`);
    tutorId = result.data.tutor.id;
    return true;
  } else {
    console.log('❌ Tutor registration failed');
    console.log(`   Status: ${result.status}`);
    console.log(`   Error: ${JSON.stringify(result.data)}`);
    return false;
  }
}

async function testTutorLogin() {
  console.log('\n🔐 Test 2: Tutor Login');
  console.log('─────────────────────────────────────');
  
  const loginData = {
    email: mockTutorRegistration.email,
    password: mockTutorRegistration.password,
  };
  
  const result = await apiRequest('POST', '/auth/login', loginData);
  
  if (result.ok && result.data.access_token) {
    console.log('✅ Tutor login successful');
    tutorToken = result.data.access_token;
    tutorId = result.data.tutorId || result.data.user?.id;
    console.log(`   Token received: ${tutorToken.substring(0, 20)}...`);
    console.log(`   Tutor ID: ${tutorId}`);
    return true;
  } else {
    console.log('❌ Tutor login failed');
    console.log(`   Status: ${result.status}`);
    console.log(`   Error: ${JSON.stringify(result.data)}`);
    return false;
  }
}

async function testGetMarketplaceTutors() {
  console.log('\n🏪 Test 3: Get Marketplace Tutors (Public)');
  console.log('─────────────────────────────────────');
  
  const result = await apiRequest('GET', '/tutors/marketplace');
  
  if (result.ok && Array.isArray(result.data)) {
    console.log('✅ Marketplace tutors retrieved successfully');
    console.log(`   Found ${result.data.length} tutors`);
    if (result.data.length > 0) {
      console.log(`   First tutor: ${result.data[0].firstName} ${result.data[0].lastName}`);
    }
    return true;
  } else {
    console.log('❌ Failed to get marketplace tutors');
    console.log(`   Status: ${result.status}`);
    return false;
  }
}

async function testGetTutorDashboard() {
  console.log('\n📊 Test 4: Get Tutor Dashboard');
  console.log('─────────────────────────────────────');
  
  if (!tutorToken) {
    console.log('⚠️  Skipped - No tutor token available');
    return false;
  }
  
  const result = await apiRequest('GET', '/tutors/dashboard', null, tutorToken);
  
  if (result.ok && result.data) {
    console.log('✅ Tutor dashboard retrieved successfully');
    console.log(`   Pending requests: ${result.data.pendingRequests || 0}`);
    console.log(`   Upcoming lessons: ${result.data.upcomingLessons || 0}`);
    console.log(`   Total students: ${result.data.totalStudents || 0}`);
    return true;
  } else {
    console.log('❌ Failed to get tutor dashboard');
    console.log(`   Status: ${result.status}`);
    console.log(`   Error: ${JSON.stringify(result.data)}`);
    return false;
  }
}

async function testGetTutorProfile() {
  console.log('\n👤 Test 5: Get Tutor Profile');
  console.log('─────────────────────────────────────');
  
  if (!tutorToken) {
    console.log('⚠️  Skipped - No tutor token available');
    return false;
  }
  
  const result = await apiRequest('GET', '/tutors/profile', null, tutorToken);
  
  if (result.ok && result.data) {
    console.log('✅ Tutor profile retrieved successfully');
    console.log(`   Name: ${result.data.firstName} ${result.data.lastName}`);
    console.log(`   Email: ${result.data.email}`);
    console.log(`   Subjects: ${result.data.subjects || 'N/A'}`);
    console.log(`   Rating: ${result.data.rating || 0}`);
    return true;
  } else {
    console.log('❌ Failed to get tutor profile');
    console.log(`   Status: ${result.status}`);
    return false;
  }
}

async function testUpdateTutorProfile() {
  console.log('\n✏️  Test 6: Update Tutor Profile');
  console.log('─────────────────────────────────────');
  
  if (!tutorToken) {
    console.log('⚠️  Skipped - No tutor token available');
    return false;
  }
  
  const result = await apiRequest('PATCH', '/tutors/profile', mockTutorUpdate, tutorToken);
  
  if (result.ok && result.data) {
    console.log('✅ Tutor profile updated successfully');
    console.log(`   Updated name: ${result.data.firstName} ${result.data.lastName}`);
    console.log(`   Updated location: ${result.data.location}`);
    return true;
  } else {
    console.log('❌ Failed to update tutor profile');
    console.log(`   Status: ${result.status}`);
    console.log(`   Error: ${JSON.stringify(result.data)}`);
    return false;
  }
}

async function testGetTutorById() {
  console.log('\n🔍 Test 7: Get Tutor by ID');
  console.log('─────────────────────────────────────');
  
  if (!tutorToken || !tutorId) {
    console.log('⚠️  Skipped - No tutor token or ID available');
    return false;
  }
  
  const result = await apiRequest('GET', `/tutors/${tutorId}`, null, tutorToken);
  
  if (result.ok && result.data) {
    console.log('✅ Tutor by ID retrieved successfully');
    console.log(`   Name: ${result.data.firstName} ${result.data.lastName}`);
    return true;
  } else {
    console.log('❌ Failed to get tutor by ID');
    console.log(`   Status: ${result.status}`);
    return false;
  }
}

async function testStudentRegistration() {
  console.log('\n📝 Test 8: Student Registration (for tutor apply test)');
  console.log('─────────────────────────────────────');
  
  const result = await apiRequest('POST', '/auth/register/student', mockStudentRegistration);
  
  if (result.ok && result.data.student) {
    console.log('✅ Student registration successful');
    studentId = result.data.student.id;
    return true;
  } else {
    console.log('❌ Student registration failed');
    console.log(`   Status: ${result.status}`);
    return false;
  }
}

async function testStudentLogin() {
  console.log('\n🔐 Test 9: Student Login');
  console.log('─────────────────────────────────────');
  
  const loginData = {
    email: mockStudentRegistration.email,
    password: mockStudentRegistration.password,
  };
  
  const result = await apiRequest('POST', '/auth/login', loginData);
  
  if (result.ok && result.data.access_token) {
    console.log('✅ Student login successful');
    studentToken = result.data.access_token;
    studentId = result.data.studentId || result.data.user?.id;
    return true;
  } else {
    console.log('❌ Student login failed');
    return false;
  }
}

async function testApplyAsTutor() {
  console.log('\n📋 Test 10: Apply as Tutor (Student → Tutor)');
  console.log('─────────────────────────────────────');
  
  if (!studentToken) {
    console.log('⚠️  Skipped - No student token available');
    return false;
  }
  
  const applyData = {
    firstName: 'Jane',
    lastName: 'Tutor',
    phone: '+27222222222',
    location: 'Pretoria',
    subjects: 'English, History',
    qualifications: 'BA English, MA History',
    experience: '5 years teaching experience',
  };
  
  const result = await apiRequest('POST', '/tutors/apply', applyData, studentToken);
  
  if (result.ok && result.data) {
    console.log('✅ Tutor application submitted successfully');
    console.log(`   Application status: ${result.data.status || 'pending'}`);
    return true;
  } else {
    console.log('❌ Failed to apply as tutor');
    console.log(`   Status: ${result.status}`);
    console.log(`   Error: ${JSON.stringify(result.data)}`);
    return false;
  }
}

// Main test runner
async function runAllTests() {
  console.log('🚀 Starting Tutor Functionalities Test Suite');
  console.log('═══════════════════════════════════════════════════════');
  console.log(`Base URL: ${BASE_URL}`);
  console.log('═══════════════════════════════════════════════════════');

  const results = {
    passed: 0,
    failed: 0,
    skipped: 0,
  };

  // Test sequence
  const tests = [
    { name: 'Tutor Registration', fn: testTutorRegistration },
    { name: 'Tutor Login', fn: testTutorLogin },
    { name: 'Get Marketplace Tutors', fn: testGetMarketplaceTutors },
    { name: 'Get Tutor Dashboard', fn: testGetTutorDashboard },
    { name: 'Get Tutor Profile', fn: testGetTutorProfile },
    { name: 'Update Tutor Profile', fn: testUpdateTutorProfile },
    { name: 'Get Tutor by ID', fn: testGetTutorById },
    { name: 'Student Registration', fn: testStudentRegistration },
    { name: 'Student Login', fn: testStudentLogin },
    { name: 'Apply as Tutor', fn: testApplyAsTutor },
  ];

  for (const test of tests) {
    try {
      const result = await test.fn();
      if (result === true) {
        results.passed++;
      } else if (result === false) {
        results.failed++;
      } else {
        results.skipped++;
      }
    } catch (error) {
      console.log(`❌ Test "${test.name}" threw an error: ${error.message}`);
      results.failed++;
    }
  }

  // Summary
  console.log('\n═══════════════════════════════════════════════════════');
  console.log('📊 Test Summary');
  console.log('═══════════════════════════════════════════════════════');
  console.log(`✅ Passed: ${results.passed}`);
  console.log(`❌ Failed: ${results.failed}`);
  console.log(`⚠️  Skipped: ${results.skipped}`);
  console.log(`📈 Total: ${results.passed + results.failed + results.skipped}`);
  console.log('═══════════════════════════════════════════════════════');

  if (results.failed === 0) {
    console.log('\n🎉 All tests passed!');
    process.exit(0);
  } else {
    console.log('\n⚠️  Some tests failed. Please check the output above.');
    process.exit(1);
  }
}

// Check if fetch is available (Node.js 18+)
if (typeof fetch === 'undefined') {
  console.error('❌ This script requires Node.js 18+ or you need to install node-fetch');
  console.error('   Install: npm install node-fetch');
  process.exit(1);
}

// Run tests
runAllTests().catch((error) => {
  console.error('Fatal error:', error);
  process.exit(1);
});

