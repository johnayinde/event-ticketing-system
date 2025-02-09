module.exports = {
  testEnvironment: "node",
  testMatch: ["**/tests/**/*.test.js"],
  coveragePathIgnorePatterns: ["/node_modules/", "/config/", "/migrations/"],
  coverageThreshold: {
    global: {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80,
    },
  },
};
