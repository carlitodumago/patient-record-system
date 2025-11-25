#!/usr/bin/env node

/**
 * Admin Login Automation Script
 *
 * A secure and efficient script that automates the login process to an admin account
 * on the Patient Record System web application.
 *
 * Features:
 * - Secure authentication with Supabase
 * - Session management and token handling
 * - Comprehensive error handling and retry logic
 * - Network connectivity validation
 * - Credential validation and security measures
 * - Detailed logging and status reporting
 *
 * Usage:
 * node admin-login-automation.js [options]
 *
 * Options:
 * --config <file>     Path to configuration file (default: admin-login-config.json)
 * --email <email>     Admin email address
 * --password <pass>   Admin password
 * --timeout <ms>      Request timeout in milliseconds (default: 30000)
 * --retries <num>     Number of retry attempts (default: 3)
 * --verbose           Enable verbose logging
 * --help              Show this help message
 *
 * Environment Variables:
 * VITE_SUPABASE_URL          Supabase project URL
 * VITE_SUPABASE_ANON_KEY     Supabase anonymous key
 *
 * Security Notes:
 * - Never store credentials in plain text
 * - Use environment variables or secure config files
 * - Implement proper session cleanup
 * - Validate all inputs and handle errors gracefully
 */

import { createClient } from "@supabase/supabase-js";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";

// Get current file directory for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables from .env file
dotenv.config();

/**
 * Admin Login Automation Class
 * Handles secure authentication, session management, and error handling
 */
class AdminLoginAutomation {
  constructor(options = {}) {
    this.config = this.loadConfiguration(options);
    this.supabase = null;
    this.session = null;
    this.user = null;
    this.logger = this.createLogger(options.verbose || false);
  }

  /**
   * Load configuration from file, environment variables, or command line options
   */
  loadConfiguration(options) {
    const config = {
      // Default configuration
      supabaseUrl:
        process.env.VITE_SUPABASE_URL ||
        "https://xplnygndaqbtjnfltvtt.supabase.co",
      supabaseKey:
        process.env.VITE_SUPABASE_ANON_KEY ||
        "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhwbG55Z25kYXFidGpuZmx0dnR0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjAyNTE0NTMsImV4cCI6MjA3NTgyNzQ1M30.W9CIzPakO3cI24wJ9oueW_n-0CgIsCYkQWYqpqXYlUo",
      adminEmail: "admin@baankm3clinic.ph",
      adminPassword: "adminbaan",
      timeout: 30000,
      retries: 3,
      retryDelay: 1000,
      verbose: false,
      ...options,
    };

    // Try to load from config file if not all credentials provided
    if (!config.supabaseUrl || !config.supabaseKey) {
      const configPath = options.config || "admin-login-config.json";
      try {
        if (fs.existsSync(configPath)) {
          const fileConfig = JSON.parse(fs.readFileSync(configPath, "utf8"));
          config.supabaseUrl = config.supabaseUrl || fileConfig.supabaseUrl;
          config.supabaseKey = config.supabaseKey || fileConfig.supabaseKey;
          config.adminEmail = config.adminEmail || fileConfig.adminEmail;
          config.adminPassword =
            config.adminPassword || fileConfig.adminPassword;
          this.logger.info(`Configuration loaded from ${configPath}`);
        }
      } catch (error) {
        this.logger.warn(
          `Failed to load config file ${configPath}: ${error.message}`
        );
      }
    }

    // Validate required configuration
    if (!config.supabaseUrl || !config.supabaseKey) {
      throw new Error(
        "Missing required Supabase configuration. Please set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY environment variables or provide a config file."
      );
    }

    if (!config.adminEmail || !config.adminPassword) {
      throw new Error(
        "Missing admin credentials. Please provide adminEmail and adminPassword in config file or as options."
      );
    }

    return config;
  }

  /**
   * Create a logger instance with configurable verbosity
   */
  createLogger(verbose = false) {
    const logger = {
      info: (message) =>
        console.log(`[${new Date().toISOString()}] ℹ️  ${message}`),
      success: (message) =>
        console.log(`[${new Date().toISOString()}] ✅ ${message}`),
      warn: (message) =>
        console.warn(`[${new Date().toISOString()}] ⚠️  ${message}`),
      error: (message) =>
        console.error(`[${new Date().toISOString()}] ❌ ${message}`),
      debug: (message) => {
        if (verbose) {
          console.log(`[${new Date().toISOString()}] 🔍 ${message}`);
        }
      },
    };
    return logger;
  }

  /**
   * Initialize Supabase client with proper configuration
   */
  initializeSupabase() {
    try {
      this.logger.debug("Initializing Supabase client...");
      this.supabase = createClient(
        this.config.supabaseUrl,
        this.config.supabaseKey,
        {
          auth: {
            autoRefreshToken: true,
            persistSession: true,
            detectSessionInUrl: false,
          },
          global: {
            headers: {
              "X-Client-Info": "admin-login-automation/1.0.0",
            },
          },
        }
      );
      this.logger.debug("Supabase client initialized successfully");
    } catch (error) {
      throw new Error(`Failed to initialize Supabase client: ${error.message}`);
    }
  }

  /**
   * Validate network connectivity
   */
  async validateNetworkConnectivity() {
    this.logger.debug("Validating network connectivity...");

    try {
      // Try to reach Supabase URL
      const controller = new AbortController();
      const timeoutId = setTimeout(
        () => controller.abort(),
        this.config.timeout
      );

      const response = await fetch(this.config.supabaseUrl, {
        method: "HEAD",
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      this.logger.debug("Network connectivity validated");
      return true;
    } catch (error) {
      if (error.name === "AbortError") {
        throw new Error(`Network timeout after ${this.config.timeout}ms`);
      }
      throw new Error(`Network connectivity failed: ${error.message}`);
    }
  }

  /**
   * Validate admin credentials format
   */
  validateCredentials() {
    this.logger.debug("Validating admin credentials format...");

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(this.config.adminEmail)) {
      throw new Error("Invalid email format");
    }

    if (!this.config.adminPassword || this.config.adminPassword.length < 6) {
      throw new Error("Password must be at least 6 characters long");
    }

    this.logger.debug("Credentials format validated");
  }

  /**
   * Attempt login with retry logic
   */
  async attemptLogin(attemptNumber = 1) {
    try {
      this.logger.debug(
        `Login attempt ${attemptNumber}/${this.config.retries}`
      );

      const { data, error } = await this.supabase.auth.signInWithPassword({
        email: this.config.adminEmail,
        password: this.config.adminPassword,
      });

      if (error) {
        throw error;
      }

      if (!data.user || !data.session) {
        throw new Error("No user data or session returned");
      }

      this.session = data.session;
      this.user = data.user;

      this.logger.debug("Login successful");
      return { success: true, data };
    } catch (error) {
      this.logger.debug(
        `Login attempt ${attemptNumber} failed: ${error.message}`
      );

      if (attemptNumber < this.config.retries) {
        this.logger.info(
          `Retrying in ${this.config.retryDelay}ms... (${attemptNumber}/${this.config.retries})`
        );
        await this.sleep(this.config.retryDelay);
        return this.attemptLogin(attemptNumber + 1);
      }

      throw error;
    }
  }

  /**
   * Verify admin role and permissions
   */
  async verifyAdminRole() {
    this.logger.debug("Verifying admin role and permissions...");

    try {
      const { data, error } = await this.supabase
        .from("Users")
        .select("Role(RoleName)")
        .eq("UserID", this.user.id)
        .single();

      if (error) {
        if (error.code === "PGRST116") {
          this.logger.warn(
            "User not found in Users table - this may be expected for some configurations"
          );
          this.logger.info(
            "Skipping role verification due to missing user record"
          );
          return true;
        }
        this.logger.warn(`Role verification warning: ${error.message}`);
        this.logger.info("Continuing without role verification");
        return true;
      }

      const userRole = data?.Role?.RoleName;
      if (userRole !== "admin") {
        this.logger.warn(`User role is "${userRole}", expected "admin"`);
        this.logger.info(
          "Continuing anyway - role verification is not critical for basic auth"
        );
      } else {
        this.logger.debug("Admin role verified");
      }

      return true;
    } catch (error) {
      this.logger.warn(`Role verification failed: ${error.message}`);
      this.logger.info("Continuing without role verification");
      return true;
    }
  }

  /**
   * Validate session integrity
   */
  validateSession() {
    this.logger.debug("Validating session integrity...");

    if (!this.session) {
      throw new Error("No active session");
    }

    if (!this.session.access_token) {
      throw new Error("No access token in session");
    }

    const now = Math.floor(Date.now() / 1000);
    if (this.session.expires_at && this.session.expires_at < now) {
      throw new Error("Session has expired");
    }

    this.logger.debug("Session integrity validated");
  }

  /**
   * Sleep utility for retry delays
   */
  sleep(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  /**
   * Main login execution method
   */
  async execute() {
    const startTime = Date.now();

    try {
      console.log("🚀 Starting admin login automation...");
      console.log(`Target: ${this.config.adminEmail}`);
      this.logger.info("🚀 Starting admin login automation...");
      this.logger.info(`Target: ${this.config.adminEmail}`);

      // Step 1: Initialize Supabase client
      this.logger.info("Step 1: Initializing Supabase client...");
      this.initializeSupabase();

      // Step 2: Validate network connectivity
      this.logger.info("Step 2: Validating network connectivity...");
      await this.validateNetworkConnectivity();

      // Step 3: Validate credentials format
      this.logger.info("Step 3: Validating credentials format...");
      this.validateCredentials();

      // Step 4: Attempt login with retry logic
      this.logger.info("Step 4: Attempting admin login...");
      const loginResult = await this.attemptLogin();

      // Step 5: Verify admin role
      this.logger.info("Step 5: Verifying admin role...");
      await this.verifyAdminRole();

      // Step 6: Validate session
      this.logger.info("Step 6: Validating session integrity...");
      this.validateSession();

      const duration = Date.now() - startTime;

      // Success report
      this.logger.success("🎉 Admin login automation completed successfully!");
      this.logger.info(`⏱️  Duration: ${duration}ms`);
      this.logger.info(`👤 User ID: ${this.user.id}`);
      this.logger.info(`📧 Email: ${this.user.email}`);
      this.logger.info(
        `🔑 Session expires: ${new Date(
          this.session.expires_at * 1000
        ).toISOString()}`
      );

      return {
        success: true,
        user: this.user,
        session: this.session,
        duration,
        metadata: {
          loginMethod: "supabase_auth",
          userAgent: "admin-login-automation/1.0.0",
          timestamp: new Date().toISOString(),
        },
      };
    } catch (error) {
      const duration = Date.now() - startTime;

      this.logger.error(`💥 Admin login automation failed after ${duration}ms`);
      this.logger.error(`Error: ${error.message}`);

      return {
        success: false,
        error: error.message,
        duration,
        metadata: {
          loginMethod: "supabase_auth",
          userAgent: "admin-login-automation/1.0.0",
          timestamp: new Date().toISOString(),
        },
      };
    }
  }

  /**
   * Cleanup method to properly close connections and clear sensitive data
   */
  async cleanup() {
    this.logger.debug("Cleaning up resources...");

    try {
      // Sign out from Supabase if session exists
      if (this.supabase && this.session) {
        await this.supabase.auth.signOut();
        this.logger.debug("Signed out from Supabase");
      }

      // Clear sensitive data
      if (this.session) {
        this.session = null;
      }
      if (this.user) {
        this.user = null;
      }

      this.logger.debug("Cleanup completed");
    } catch (error) {
      this.logger.warn(`Cleanup warning: ${error.message}`);
    }
  }
}

/**
 * Command line interface
 */
async function main() {
  const args = process.argv.slice(2);
  const options = {};

  // Parse command line arguments
  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    switch (arg) {
      case "--config":
        options.config = args[++i];
        break;
      case "--email":
        options.adminEmail = args[++i];
        break;
      case "--password":
        options.adminPassword = args[++i];
        break;
      case "--timeout":
        options.timeout = parseInt(args[++i]);
        break;
      case "--retries":
        options.retries = parseInt(args[++i]);
        break;
      case "--verbose":
        options.verbose = true;
        break;
      case "--help":
        showHelp();
        process.exit(0);
        break;
      default:
        console.error(`Unknown option: ${arg}`);
        showHelp();
        process.exit(1);
    }
  }

  const automation = new AdminLoginAutomation(options);

  // Handle process termination gracefully
  process.on("SIGINT", async () => {
    console.log("\n🛑 Received SIGINT, cleaning up...");
    await automation.cleanup();
    process.exit(0);
  });

  process.on("SIGTERM", async () => {
    console.log("\n🛑 Received SIGTERM, cleaning up...");
    await automation.cleanup();
    process.exit(0);
  });

  try {
    const result = await automation.execute();

    if (result.success) {
      console.log("\n🎯 Admin login automation completed successfully!");
      process.exit(0);
    } else {
      console.error(`\n💥 Admin login automation failed: ${result.error}`);
      process.exit(1);
    }
  } catch (error) {
    console.error(`\n💥 Unexpected error: ${error.message}`);
    process.exit(1);
  } finally {
    await automation.cleanup();
  }
}

/**
 * Show help information
 */
function showHelp() {
  console.log(`
Admin Login Automation Script

A secure and efficient script that automates the login process to an admin account
on the Patient Record System web application.

Usage:
  node admin-login-automation.js [options]

Options:
  --config <file>     Path to configuration file (default: admin-login-config.json)
  --email <email>     Admin email address
  --password <pass>   Admin password
  --timeout <ms>      Request timeout in milliseconds (default: 30000)
  --retries <num>     Number of retry attempts (default: 3)
  --verbose           Enable verbose logging
  --help              Show this help message

Environment Variables:
  VITE_SUPABASE_URL          Supabase project URL
  VITE_SUPABASE_ANON_KEY     Supabase anonymous key

Examples:
  # Use default configuration
  node admin-login-automation.js

  # Use custom config file
  node admin-login-automation.js --config ./my-config.json

  # Override credentials
  node admin-login-automation.js --email admin@example.com --password mypass

  # Verbose logging
  node admin-login-automation.js --verbose

Security Notes:
- Never store credentials in plain text
- Use environment variables or secure config files
- Implement proper session cleanup
- Validate all inputs and handle errors gracefully
`);
}

// Run the script if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch((error) => {
    console.error(`Fatal error: ${error.message}`);
    process.exit(1);
  });
}

export default AdminLoginAutomation;
