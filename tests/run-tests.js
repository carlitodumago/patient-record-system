#!/usr/bin/env node

/**
 * Test Runner Script for Patient Record Management System
 *
 * This script provides a convenient way to run different types of tests
 * and generate comprehensive testing reports.
 */

import { execSync } from "child_process";
import { existsSync, mkdirSync } from "fs";
import { join } from "path";

class TestRunner {
  constructor() {
    this.testResultsDir = "./test-results";
    this.coverageDir = "./coverage";

    // Ensure result directories exist
    if (!existsSync(this.testResultsDir)) {
      mkdirSync(this.testResultsDir, { recursive: true });
    }
    if (!existsSync(this.coverageDir)) {
      mkdirSync(this.coverageDir, { recursive: true });
    }
  }

  log(message, type = "info") {
    const timestamp = new Date().toISOString();
    const colors = {
      info: "\x1b[36m", // Cyan
      success: "\x1b[32m", // Green
      warning: "\x1b[33m", // Yellow
      error: "\x1b[31m", // Red
      reset: "\x1b[0m", // Reset
    };

    console.log(`${colors[type]}[${timestamp}] ${message}${colors.reset}`);
  }

  runCommand(command, description) {
    this.log(`Running: ${description}`, "info");

    try {
      const output = execSync(command, {
        encoding: "utf8",
        stdio: "pipe",
        cwd: process.cwd(),
      });

      this.log(`✓ ${description} completed successfully`, "success");
      return { success: true, output };
    } catch (error) {
      this.log(`✗ ${description} failed: ${error.message}`, "error");
      return { success: false, error: error.message };
    }
  }

  async runUnitTests() {
    this.log("Starting Unit Tests...", "info");

    const result = this.runCommand(
      "npm run test:unit -- --run --coverage",
      "Unit Tests with Coverage"
    );

    if (result.success) {
      this.log("Unit tests completed. Coverage report generated.", "success");
    }

    return result;
  }

  async runE2ETests() {
    this.log("Starting End-to-End Tests...", "info");

    const result = this.runCommand("npm run test:e2e", "End-to-End Tests");

    if (result.success) {
      this.log(
        "E2E tests completed. Reports generated in test-results/",
        "success"
      );
    }

    return result;
  }

  async runManualTests() {
    this.log("Manual Testing Instructions:", "info");
    this.log(
      "Open tests/manual-testing-checklist.md for comprehensive testing guide",
      "info"
    );
    this.log(
      "Follow the step-by-step instructions to test all workflows manually",
      "info"
    );

    return { success: true, manual: true };
  }

  async runAllTests() {
    this.log("🚀 Starting Complete Test Suite...", "info");
    this.log("=".repeat(60), "info");

    const results = {
      unit: null,
      e2e: null,
      manual: null,
    };

    // Run unit tests
    results.unit = await this.runUnitTests();

    // Run E2E tests
    results.e2e = await this.runE2ETests();

    // Manual testing info
    results.manual = await this.runManualTests();

    // Summary
    this.log("=".repeat(60), "info");
    this.log("Test Summary:", "info");

    const totalTests = Object.keys(results).length;
    const passedTests = Object.values(results).filter(
      (r) => r?.success === true
    ).length;

    if (passedTests === totalTests) {
      this.log(
        `🎉 All tests completed successfully! (${passedTests}/${totalTests})`,
        "success"
      );
    } else {
      this.log(
        `⚠️  Some tests failed or need manual verification (${passedTests}/${totalTests})`,
        "warning"
      );
    }

    // Detailed results
    Object.entries(results).forEach(([testType, result]) => {
      if (result?.manual) {
        this.log(
          `  📋 ${testType.toUpperCase()}: Manual testing required`,
          "info"
        );
      } else if (result?.success) {
        this.log(`  ✅ ${testType.toUpperCase()}: Passed`, "success");
      } else {
        this.log(`  ❌ ${testType.toUpperCase()}: Failed`, "error");
      }
    });

    this.log("=".repeat(60), "info");
    this.log("📊 Reports generated:", "info");
    this.log(`  📈 Coverage Report: ${this.coverageDir}/index.html`, "info");
    this.log(
      `  🎭 E2E Test Results: ${this.testResultsDir}/index.html`,
      "info"
    );
    this.log(
      `  📋 Manual Test Checklist: tests/manual-testing-checklist.md`,
      "info"
    );

    return results;
  }

  async runSpecificTest(testType) {
    switch (testType) {
      case "unit":
        return await this.runUnitTests();
      case "e2e":
        return await this.runE2ETests();
      case "manual":
        return await this.runManualTests();
      default:
        this.log(`Unknown test type: ${testType}`, "error");
        return { success: false, error: "Unknown test type" };
    }
  }
}

// CLI Interface
async function main() {
  const args = process.argv.slice(2);
  const testRunner = new TestRunner();

  if (args.length === 0) {
    // Run all tests
    await testRunner.runAllTests();
  } else {
    // Run specific test type
    const testType = args[0];
    await testRunner.runSpecificTest(testType);
  }
}

// Handle process termination
process.on("SIGINT", () => {
  console.log("\n🛑 Test execution interrupted by user");
  process.exit(0);
});

process.on("SIGTERM", () => {
  console.log("\n🛑 Test execution terminated");
  process.exit(0);
});

// Run tests if this script is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch((error) => {
    console.error("Test runner error:", error);
    process.exit(1);
  });
}

export { TestRunner };
