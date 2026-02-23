/**
 * TestSprite Configuration for Backend (NestJS)
 * Bursary Management System Backend Testing
 */

module.exports = {
  // Backend Specific Configuration
  backend: {
    framework: "nestjs",
    version: "10.0.0",
    
    // Build Configuration
    build: {
      command: "npm run build",
      outputDir: "dist"
    },

    // Development Server
    dev: {
      command: "npm run start:dev",
      port: 3000,
      host: "localhost"
    },

    // Testing Framework
    testing: {
      framework: "jest",
      configFile: "package.json"
    }
  },

  // API Endpoints to Test
  endpoints: [
    {
      name: "Bursary Students",
      path: "/bursary-students",
      methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
      auth: true
    },
    {
      name: "Student Progress",
      path: "/student-progress",
      methods: ["GET", "POST", "PUT", "DELETE"],
      auth: true
    },
    {
      name: "Courses",
      path: "/courses",
      methods: ["GET", "POST", "PUT", "DELETE"],
      auth: true
    },
    {
      name: "Tutor Requests",
      path: "/tutor-requests",
      methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
      auth: true
    },
    {
      name: "Invoices",
      path: "/invoices",
      methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
      auth: true
    },
    {
      name: "Lessons",
      path: "/lessons",
      methods: ["GET", "POST", "PUT", "DELETE"],
      auth: true
    },
    {
      name: "Analytics",
      path: "/analytics",
      methods: ["GET"],
      auth: true
    },
    {
      name: "Audit",
      path: "/audit",
      methods: ["GET"],
      auth: true
    }
  ],

  // Service Testing
  services: {
    testDir: "./src",
    include: [
      "**/*.service.ts",
      "**/*.controller.ts"
    ],
    exclude: [
      "**/node_modules/**",
      "**/dist/**"
    ]
  },

  // Integration Testing Scenarios
  scenarios: [
    {
      name: "Student CRUD Operations",
      steps: [
        "Create a new student",
        "Retrieve student by ID",
        "Update student information",
        "Delete student"
      ]
    },
    {
      name: "Progress Tracking",
      steps: [
        "Create student progress record",
        "Update progress metrics",
        "Track activity updates",
        "Retrieve progress by bursary"
      ]
    },
    {
      name: "Course Management",
      steps: [
        "Create a new course",
        "Enroll students in course",
        "Update course details",
        "Delete course"
      ]
    },
    {
      name: "Tutor Request Flow",
      steps: [
        "Create tutor request",
        "Approve/reject request",
        "Update request status",
        "Track request history"
      ]
    }
  ],

  // Database Testing
  database: {
    enabled: true,
    type: "postgresql",
    migrations: "./migrations",
    testDatabase: "bursary_test"
  },

  // API Testing
  api: {
    baseUrl: "http://localhost:3000",
    timeout: 30000,
    retries: 2
  }
};

