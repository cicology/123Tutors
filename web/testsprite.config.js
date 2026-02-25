/**
 * TestSprite Configuration for Frontend (Next.js)
 * Bursary Management System Frontend Testing
 */

module.exports = {
  // Frontend Specific Configuration
  frontend: {
    framework: "nextjs",
    version: "14.2.16",
    
    // Build Configuration
    build: {
      command: "npm run build",
      outputDir: ".next",
      staticDir: "public"
    },

    // Development Server
    dev: {
      command: "npm run dev",
      port: 3000,
      host: "localhost"
    },

    // Testing Framework
    testing: {
      framework: "playwright",
      configFile: "playwright.config.js"
    }
  },

  // Component Testing
  components: {
    testDir: "./components",
    include: [
      "**/*.tsx",
      "**/*.ts"
    ],
    exclude: [
      "**/node_modules/**",
      "**/.next/**"
    ]
  },

  // Page Testing
  pages: {
    testDir: "./app",
    include: [
      "**/page.tsx",
      "**/layout.tsx"
    ]
  },

  // E2E Testing Scenarios
  scenarios: [
    {
      name: "User Authentication Flow",
      steps: [
        "Navigate to login page",
        "Enter valid credentials",
        "Verify successful login",
        "Check dashboard redirect"
      ]
    },
    {
      name: "Bursary Onboarding Process",
      steps: [
        "Start onboarding flow",
        "Fill organization details",
        "Configure budget settings",
        "Set eligibility criteria",
        "Complete onboarding"
      ]
    },
    {
      name: "Student Management",
      steps: [
        "Navigate to students page",
        "Add new student",
        "Upload student data",
        "Verify student creation",
        "Check student list"
      ]
    },
    {
      name: "Course Management",
      steps: [
        "Access courses section",
        "Create new course",
        "Enroll students",
        "Track progress"
      ]
    }
  ],

  // UI Components to Test
  uiComponents: [
    "Button",
    "Card", 
    "Dialog",
    "Form",
    "Table",
    "Input",
    "Select",
    "Avatar",
    "Badge",
    "Progress"
  ],

  // Accessibility Testing
  accessibility: {
    enabled: true,
    standards: ["WCAG 2.1 AA"],
    tools: ["axe-core"]
  },

  // Visual Regression Testing
  visual: {
    enabled: true,
    threshold: 0.2,
    updateSnapshots: false
  }
};
