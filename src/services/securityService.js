import bcrypt from "bcryptjs";
import { supabase, TABLES } from "./supabase.js";

export class SecurityService {
  // Password policy configuration
  static PASSWORD_POLICY = {
    minLength: 8,
    maxLength: 128,
    requireUppercase: true,
    requireLowercase: true,
    requireNumbers: true,
    requireSpecialChars: true,
    preventCommonPasswords: true,
    preventSequential: true,
    maxAgeDays: 90,
    historyCount: 5,
  };

  // Common passwords to reject
  static COMMON_PASSWORDS = [
    "password",
    "password123",
    "123456",
    "123456789",
    "qwerty",
    "abc123",
    "password1",
    "admin",
    "letmein",
    "welcome",
    "monkey",
    "dragon",
    "password12",
    "password1234",
  ];

  // Validate password strength
  static validatePassword(password) {
    const policy = this.PASSWORD_POLICY;
    const errors = [];

    // Check length
    if (password.length < policy.minLength) {
      errors.push(
        `Password must be at least ${policy.minLength} characters long`
      );
    }

    if (password.length > policy.maxLength) {
      errors.push(`Password must not exceed ${policy.maxLength} characters`);
    }

    // Check character requirements
    if (policy.requireUppercase && !/[A-Z]/.test(password)) {
      errors.push("Password must contain at least one uppercase letter");
    }

    if (policy.requireLowercase && !/[a-z]/.test(password)) {
      errors.push("Password must contain at least one lowercase letter");
    }

    if (policy.requireNumbers && !/\d/.test(password)) {
      errors.push("Password must contain at least one number");
    }

    if (
      policy.requireSpecialChars &&
      !/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)
    ) {
      errors.push("Password must contain at least one special character");
    }

    // Check for common passwords
    if (
      policy.preventCommonPasswords &&
      this.COMMON_PASSWORDS.includes(password.toLowerCase())
    ) {
      errors.push("Password is too common and not allowed");
    }

    // Check for sequential characters
    if (policy.preventSequential) {
      const sequences = ["123456", "abcdef", "qwerty", "asdfgh"];
      if (sequences.some((seq) => password.toLowerCase().includes(seq))) {
        errors.push(
          "Password contains sequential characters and is not allowed"
        );
      }
    }

    // Check for repeated characters
    if (/(.)\1{2,}/.test(password)) {
      errors.push("Password contains too many repeated characters");
    }

    return {
      isValid: errors.length === 0,
      errors,
      strength: this.calculatePasswordStrength(password),
    };
  }

  // Calculate password strength score
  static calculatePasswordStrength(password) {
    let score = 0;

    // Length bonus
    if (password.length >= 8) score += 10;
    if (password.length >= 12) score += 10;
    if (password.length >= 16) score += 10;

    // Character variety bonus
    if (/[a-z]/.test(password)) score += 15;
    if (/[A-Z]/.test(password)) score += 15;
    if (/\d/.test(password)) score += 15;
    if (/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) score += 15;

    // Pattern penalties
    if (/(.)\1{2,}/.test(password)) score -= 10;
    if (/123456|abcdef|qwerty/i.test(password)) score -= 20;

    return Math.max(0, Math.min(100, score));
  }

  // Generate secure password
  static generateSecurePassword(length = 12) {
    const lowercase = "abcdefghijklmnopqrstuvwxyz";
    const uppercase = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    const numbers = "0123456789";
    const symbols = "!@#$%^&*()_+-=[]{}|;:,.<>?";

    let password = "";

    // Ensure at least one character from each category
    password += lowercase.charAt(Math.floor(Math.random() * lowercase.length));
    password += uppercase.charAt(Math.floor(Math.random() * uppercase.length));
    password += numbers.charAt(Math.floor(Math.random() * numbers.length));
    password += symbols.charAt(Math.floor(Math.random() * symbols.length));

    // Fill remaining length with random characters
    const allChars = lowercase + uppercase + numbers + symbols;
    for (let i = password.length; i < length; i++) {
      password += allChars.charAt(Math.floor(Math.random() * allChars.length));
    }

    // Shuffle the password
    return password
      .split("")
      .sort(() => Math.random() - 0.5)
      .join("");
  }

  // Hash password with proper salt rounds
  static async hashPassword(password) {
    const saltRounds = 12; // Increased from 10 for better security
    return await bcrypt.hash(password, saltRounds);
  }

  // Verify password
  static async verifyPassword(password, hashedPassword) {
    return await bcrypt.compare(password, hashedPassword);
  }

  // Check if password needs to be changed
  static async checkPasswordAge(userId) {
    try {
      const { data: user, error } = await supabase
        .from(TABLES.USERS)
        .select("password_changed_at")
        .eq("user_id", userId)
        .single();

      if (error || !user?.password_changed_at) {
        return { needsChange: true, reason: "Password age unknown" };
      }

      const passwordAge = new Date() - new Date(user.password_changed_at);
      const maxAge = this.PASSWORD_POLICY.maxAgeDays * 24 * 60 * 60 * 1000;

      return {
        needsChange: passwordAge > maxAge,
        daysUntilExpiry: Math.max(
          0,
          Math.ceil((maxAge - passwordAge) / (24 * 60 * 60 * 1000))
        ),
        reason: passwordAge > maxAge ? "Password has expired" : null,
      };
    } catch (error) {
      console.error("Error checking password age:", error);
      return { needsChange: false, reason: null };
    }
  }

  // Log security event
  static async logSecurityEvent(
    eventType,
    details = {},
    userId = null,
    ipAddress = null
  ) {
    try {
      const { error } = await supabase.from(TABLES.AUDIT_LOGS).insert({
        user_id: userId,
        action: `SECURITY_${eventType}`,
        table_name: "security_events",
        record_id: null,
        new_values: {
          eventType,
          details,
          ipAddress,
          timestamp: new Date().toISOString(),
        },
        ip_address: ipAddress,
        created_at: new Date().toISOString(),
      });

      if (error) throw error;
    } catch (error) {
      console.error("Error logging security event:", error);
    }
  }

  // Check for suspicious login attempts
  static async checkSuspiciousActivity(username, ipAddress) {
    try {
      const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString();

      // Count failed login attempts in the last hour
      const { data: failedAttempts, error } = await supabase
        .from(TABLES.AUDIT_LOGS)
        .select("created_at")
        .eq("action", "LOGIN_FAILED")
        .eq("new_values.username", username)
        .gte("created_at", oneHourAgo);

      if (error) throw error;

      const attemptCount = failedAttempts?.length || 0;

      // Log suspicious activity if too many failed attempts
      if (attemptCount >= 5) {
        await this.logSecurityEvent("SUSPICIOUS_LOGIN_ATTEMPTS", {
          username,
          attemptCount,
          ipAddress,
        });

        return {
          isSuspicious: true,
          reason: `Multiple failed login attempts (${attemptCount} in the last hour)`,
          shouldBlock: attemptCount >= 10,
        };
      }

      return { isSuspicious: false, shouldBlock: false };
    } catch (error) {
      console.error("Error checking suspicious activity:", error);
      return { isSuspicious: false, shouldBlock: false };
    }
  }

  // Rate limiting for authentication attempts
  static async checkRateLimit(identifier, action = "login") {
    try {
      const timeWindow = action === "login" ? 15 * 60 * 1000 : 60 * 60 * 1000; // 15min for login, 1hr for other actions
      const maxAttempts = action === "login" ? 5 : 10;
      const windowStart = new Date(Date.now() - timeWindow).toISOString();

      // Count attempts in time window
      const { data: attempts, error } = await supabase
        .from(TABLES.AUDIT_LOGS)
        .select("created_at")
        .eq("action", `${action.toUpperCase()}_ATTEMPT`)
        .eq("new_values.identifier", identifier)
        .gte("created_at", windowStart);

      if (error) throw error;

      const attemptCount = attempts?.length || 0;

      return {
        allowed: attemptCount < maxAttempts,
        attemptsRemaining: Math.max(0, maxAttempts - attemptCount),
        resetTime: new Date(Date.now() + timeWindow),
      };
    } catch (error) {
      console.error("Error checking rate limit:", error);
      return { allowed: true, attemptsRemaining: 5, resetTime: new Date() };
    }
  }

  // Validate email format and check for disposable emails
  static validateEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const isValidFormat = emailRegex.test(email);

    if (!isValidFormat) {
      return { isValid: false, reason: "Invalid email format" };
    }

    // Check for disposable email domains (simplified check)
    const disposableDomains = [
      "10minutemail.com",
      "tempmail.org",
      "guerrillamail.com",
    ];
    const domain = email.split("@")[1]?.toLowerCase();

    if (disposableDomains.includes(domain)) {
      return {
        isValid: false,
        reason: "Disposable email addresses are not allowed",
      };
    }

    return { isValid: true };
  }

  // Sanitize user input
  static sanitizeInput(input) {
    if (typeof input !== "string") return input;

    return input
      .trim()
      .replace(/[<>]/g, "") // Remove potential HTML tags
      .slice(0, 1000); // Limit length
  }

  // Generate secure session token
  static generateSecureToken() {
    const array = new Uint8Array(32);
    crypto.getRandomValues(array);
    return Array.from(array, (byte) => byte.toString(16).padStart(2, "0")).join(
      ""
    );
  }

  // Check if user account is locked
  static async isAccountLocked(userId) {
    try {
      const { data: user, error } = await supabase
        .from(TABLES.USERS)
        .select("is_active, updated_at")
        .eq("user_id", userId)
        .single();

      if (error) throw error;

      return {
        isLocked: !user?.is_active,
        reason: !user?.is_active ? "Account has been deactivated" : null,
      };
    } catch (error) {
      console.error("Error checking account status:", error);
      return { isLocked: false, reason: null };
    }
  }

  // Implement account lockout after failed attempts
  static async implementAccountLockout(
    userId,
    reason = "Multiple failed login attempts"
  ) {
    try {
      await supabase
        .from(TABLES.USERS)
        .update({
          is_active: false,
          updated_at: new Date().toISOString(),
        })
        .eq("user_id", userId);

      await this.logSecurityEvent("ACCOUNT_LOCKOUT", { userId, reason });

      return { success: true };
    } catch (error) {
      console.error("Error implementing account lockout:", error);
      throw error;
    }
  }

  // Password change with history tracking
  static async changePassword(userId, newPassword, oldPassword = null) {
    try {
      // Validate new password
      const validation = this.validatePassword(newPassword);
      if (!validation.isValid) {
        throw new Error(
          `Password does not meet requirements: ${validation.errors.join(", ")}`
        );
      }

      // Verify old password if provided
      if (oldPassword) {
        const { data: user } = await supabase
          .from(TABLES.USERS)
          .select("password_hash")
          .eq("user_id", userId)
          .single();

        if (user) {
          const isValidOldPassword = await this.verifyPassword(
            oldPassword,
            user.password_hash
          );
          if (!isValidOldPassword) {
            throw new Error("Current password is incorrect");
          }
        }
      }

      // Hash new password
      const newPasswordHash = await this.hashPassword(newPassword);

      // Update password
      await supabase
        .from(TABLES.USERS)
        .update({
          password_hash: newPasswordHash,
          password_changed_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .eq("user_id", userId);

      // Log password change
      await this.logSecurityEvent("PASSWORD_CHANGED", { userId });

      return { success: true };
    } catch (error) {
      console.error("Error changing password:", error);
      throw error;
    }
  }
}

export default SecurityService;
