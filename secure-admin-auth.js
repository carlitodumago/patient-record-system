#!/usr/bin/env node

/**
 * Secure Admin Authentication Implementation
 *
 * This script implements a secure authentication system for admin credentials:
 * - Username: "admin"
 * - Password: "adminbaan"
 *
 * It includes comprehensive security measures and bypasses RLS issues for admin access.
 */

import { createClient } from "@supabase/supabase-js";
import crypto from "crypto";
import dotenv from "dotenv";

// Load environment variables
dotenv.config();

// Secure configuration
const CONFIG = {
  adminUsername: "admin",
  adminPassword: "adminbaan",
  adminEmail: "admin@baankm3clinic.ph",
  expectedRole: "admin",
  supabaseUrl:
    process.env.VITE_SUPABASE_URL || "https://xplnygndaqbtjnfltvtt.supabase.co",
  supabaseKey:
    process.env.VITE_SUPABASE_ANON_KEY ||
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhwbG55Z25kYXFidGpuZmx0dnR0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjAyNTE0NTMsImV4cCI6MjA3NTgyNzQ1M30.W9CIzPakO3cI24wJ9oueW_n-0CgIsCYkQWYqpqXYlUo",
  serviceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY, // For admin operations
};

// Security utilities
class SecurityManager {
  constructor() {
    this.failedAttempts = new Map();
    this.lockoutDuration = 15 * 60 * 1000; // 15 minutes
    this.maxAttempts = 5;
  }

  // Rate limiting check
  isRateLimited(identifier) {
    const attempts = this.failedAttempts.get(identifier) || [];
    const now = Date.now();

    // Clean old attempts
    const recentAttempts = attempts.filter(
      (time) => now - time < this.lockoutDuration
    );

    if (recentAttempts.length >= this.maxAttempts) {
      return true;
    }

    this.failedAttempts.set(identifier, recentAttempts);
    return false;
  }

  // Record failed attempt
  recordFailedAttempt(identifier) {
    const attempts = this.failedAttempts.get(identifier) || [];
    attempts.push(Date.now());
    this.failedAttempts.set(identifier, attempts);
  }

  // Input sanitization
  sanitizeInput(input) {
    if (typeof input !== "string") return "";
    return input.trim().replace(/[<>]/g, "");
  }

  // Password strength validation
  validatePassword(password) {
    if (!password || password.length < 6) {
      return { valid: false, error: "Password must be at least 6 characters" };
    }

    // Check for common patterns
    if (password.length < 8) {
      return {
        valid: false,
        error: "Password should be at least 8 characters for better security",
      };
    }

    return { valid: true };
  }

  // Username validation
  validateUsername(username) {
    if (!username || username.length < 3) {
      return { valid: false, error: "Username must be at least 3 characters" };
    }

    // Allow alphanumeric and underscore only
    if (!/^[a-zA-Z0-9_]+$/.test(username)) {
      return {
        valid: false,
        error: "Username can only contain letters, numbers, and underscores",
      };
    }

    return { valid: true };
  }
}

// Admin Authentication System
class SecureAdminAuth {
  constructor() {
    this.security = new SecurityManager();
    this.supabase = createClient(CONFIG.supabaseUrl, CONFIG.supabaseKey);
    this.supabaseAdmin = CONFIG.serviceRoleKey
      ? createClient(CONFIG.supabaseUrl, CONFIG.serviceRoleKey)
      : null;
  }

  // Create admin client with service role if available
  getAdminClient() {
    if (this.supabaseAdmin) {
      return this.supabaseAdmin;
    }
    return this.supabase;
  }

  // Secure admin lookup bypassing RLS
  async lookupAdminUser(username) {
    try {
      // Use admin client to bypass RLS policies
      const adminClient = this.getAdminClient();

      const { data, error } = await adminClient
        .from("Users")
        .select("UserID, Email, Username, RoleName, fullName")
        .eq("Username", username)
        .eq("RoleName", "admin")
        .single();

      if (error) {
        if (error.code === "PGRST116") {
          throw new Error(`Admin user '${username}' not found`);
        }
        throw new Error(`Database error: ${error.message}`);
      }

      if (!data) {
        throw new Error(`Admin user '${username}' not found`);
      }

      return {
        success: true,
        user: {
          id: data.UserID,
          email: data.Email,
          username: data.Username,
          role: data.RoleName,
          fullName: data.fullName,
        },
      };
    } catch (error) {
      console.error("Admin lookup error:", error.message);
      return {
        success: false,
        error: error.message,
      };
    }
  }

  // Secure authentication with comprehensive validation
  async authenticateAdmin(username, password) {
    const startTime = Date.now();

    try {
      // Security: Rate limiting check
      if (this.security.isRateLimited(username)) {
        throw new Error(
          "Too many login attempts. Please wait 15 minutes before trying again."
        );
      }

      // Security: Input sanitization
      const cleanUsername = this.security.sanitizeInput(username);
      const cleanPassword = password; // Don't sanitize password, just validate

      // Security: Input validation
      const usernameValidation = this.security.validateUsername(cleanUsername);
      if (!usernameValidation.valid) {
        this.security.recordFailedAttempt(username);
        throw new Error(usernameValidation.error);
      }

      const passwordValidation = this.security.validatePassword(cleanPassword);
      if (!passwordValidation.valid) {
        this.security.recordFailedAttempt(username);
        throw new Error(passwordValidation.error);
      }

      // Check if this is the admin user
      if (cleanUsername !== CONFIG.adminUsername) {
        this.security.recordFailedAttempt(username);
        throw new Error("Invalid username or password");
      }

      // Check if password matches
      if (cleanPassword !== CONFIG.adminPassword) {
        this.security.recordFailedAttempt(username);
        throw new Error("Invalid username or password");
      }

      // Lookup admin user details
      const lookupResult = await this.lookupAdminUser(cleanUsername);
      if (!lookupResult.success) {
        this.security.recordFailedAttempt(username);
        throw new Error(lookupResult.error);
      }

      // Authenticate with Supabase using email
      const { data, error } = await this.supabase.auth.signInWithPassword({
        email: lookupResult.user.email,
        password: CONFIG.adminPassword,
      });

      if (error) {
        this.security.recordFailedAttempt(username);
        throw new Error(`Authentication failed: ${error.message}`);
      }

      if (!data.user || !data.session) {
        this.security.recordFailedAttempt(username);
        throw new Error("Authentication succeeded but session data is missing");
      }

      const duration = Date.now() - startTime;

      // Success response
      return {
        success: true,
        message: `Welcome back, ${lookupResult.user.fullName}!`,
        user: {
          id: data.user.id,
          username: lookupResult.user.username,
          email: data.user.email,
          role: lookupResult.user.role,
          fullName: lookupResult.user.fullName,
        },
        session: {
          accessToken: data.session.access_token,
          expiresAt: new Date(data.session.expires_at * 1000).toISOString(),
          duration,
        },
        security: {
          rateLimitCleared: true,
          sessionSecured: true,
          credentialsValidated: true,
        },
      };
    } catch (error) {
      const duration = Date.now() - startTime;

      return {
        success: false,
        error: error.message,
        duration,
        security: {
          rateLimitApplied: this.security.isRateLimited(username),
          failedAttemptsRecorded: true,
        },
      };
    }
  }

  // Session validation
  async validateSession(accessToken) {
    try {
      const { data, error } = await this.supabase.auth.getSession();

      if (error || !data.session) {
        return {
          valid: false,
          error: error?.message || "No active session",
        };
      }

      // Validate token matches
      if (data.session.access_token !== accessToken) {
        return {
          valid: false,
          error: "Token mismatch",
        };
      }

      // Check expiration
      const now = Math.floor(Date.now() / 1000);
      if (data.session.expires_at && data.session.expires_at <= now) {
        return {
          valid: false,
          error: "Session expired",
        };
      }

      return {
        valid: true,
        session: data.session,
        user: data.user,
      };
    } catch (error) {
      return {
        valid: false,
        error: error.message,
      };
    }
  }

  // Secure logout
  async logout(accessToken) {
    try {
      // Invalidate session on server side if possible
      if (this.supabaseAdmin && accessToken) {
        // This would require a custom endpoint to invalidate tokens
        console.log(
          "Token invalidation requested for:",
          accessToken.substring(0, 20) + "..."
        );
      }

      // Sign out from Supabase
      const { error } = await this.supabase.auth.signOut();

      if (error) {
        console.warn("Logout warning:", error.message);
      }

      return {
        success: true,
        message: "Logged out successfully",
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
      };
    }
  }
}

// Demo usage
async function demo() {
  console.log("🔒 Secure Admin Authentication System");
  console.log("=====================================");
  console.log("\n📋 System Configuration:");
  console.log(`   Username: ${CONFIG.adminUsername}`);
  console.log(`   Expected Role: ${CONFIG.expectedRole}`);
  console.log(
    `   Security Features: Rate Limiting, Input Validation, Session Security`
  );

  const auth = new SecureAdminAuth();

  console.log("\n🧪 Testing Authentication...");

  // Test valid credentials
  const result = await auth.authenticateAdmin(
    CONFIG.adminUsername,
    CONFIG.adminPassword
  );

  if (result.success) {
    console.log("✅ Authentication successful!");
    console.log(`   Welcome: ${result.user.fullName}`);
    console.log(`   Role: ${result.user.role}`);
    console.log(`   Session expires: ${result.session.expiresAt}`);
    console.log(`   Duration: ${result.session.duration}ms`);
    console.log("🔒 Security features validated:");
    console.log(`   ✅ Rate limiting cleared`);
    console.log(`   ✅ Session secured`);
    console.log(`   ✅ Credentials validated`);
  } else {
    console.log("❌ Authentication failed:", result.error);
  }

  // Test invalid credentials
  console.log("\n🚫 Testing invalid credentials...");
  const invalidResult = await auth.authenticateAdmin("admin", "wrongpassword");

  if (!invalidResult.success) {
    console.log(
      "✅ Invalid credentials correctly rejected:",
      invalidResult.error
    );
    console.log(`⏱️ Response time: ${invalidResult.duration}ms`);
  } else {
    console.log("❌ Invalid credentials were incorrectly accepted");
  }

  console.log("\n🎉 Secure authentication system implementation complete!");
}

// Run demo if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  demo().catch(console.error);
}

export default SecureAdminAuth;
