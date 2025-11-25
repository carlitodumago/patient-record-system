# Admin Login Automation Script

A secure and efficient script that automates the login process to an admin account on the Patient Record System web application.

## Features

- 🔐 **Secure Authentication**: Integrates with Supabase authentication system
- 🔄 **Session Management**: Proper session handling and token management
- 🛡️ **Error Handling**: Comprehensive error checking for invalid credentials and network issues
- 🌐 **Network Validation**: Validates connectivity before attempting login
- 🔁 **Retry Logic**: Configurable retry attempts with exponential backoff
- 📝 **Detailed Logging**: Verbose logging for debugging and monitoring
- ⚙️ **Flexible Configuration**: Support for config files and environment variables
- 🧹 **Resource Cleanup**: Proper cleanup of sessions and sensitive data

## Installation

1. Ensure Node.js is installed (version 16 or higher)
2. The script uses ES modules, so no additional dependencies are required

## Quick Start

### Basic Usage

```bash
# Use default configuration (admin@baankm3clinic.ph / adminbaan)
node admin-login-automation.js
```

### Using Environment Variables

```bash
export VITE_SUPABASE_URL="https://your-project.supabase.co"
export VITE_SUPABASE_ANON_KEY="your-anon-key"
node admin-login-automation.js
```

### Using Configuration File

```bash
# Edit the configuration file
cp admin-login-config.json my-config.json
# Edit my-config.json with your settings

# Run with custom config
node admin-login-automation.js --config ./my-config.json
```

### Command Line Options

```bash
# Override credentials
node admin-login-automation.js --email admin@example.com --password mypass

# Custom timeout and retries
node admin-login-automation.js --timeout 45000 --retries 5

# Verbose logging
node admin-login-automation.js --verbose

# Show help
node admin-login-automation.js --help
```

## Configuration

### Configuration File Format

```json
{
  "supabaseUrl": "https://your-project.supabase.co",
  "supabaseKey": "your-anon-key",
  "adminEmail": "admin@yourclinic.com",
  "adminPassword": "your-secure-password",
  "timeout": 30000,
  "retries": 3,
  "retryDelay": 1000,
  "verbose": false
}
```

### Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `VITE_SUPABASE_URL` | Supabase project URL | Yes |
| `VITE_SUPABASE_ANON_KEY` | Supabase anonymous key | Yes |

## Security Best Practices

### 🔒 Credential Management

1. **Never commit credentials** to version control
2. **Use environment variables** for sensitive data
3. **Store config files** outside of project directories
4. **Use strong passwords** and rotate them regularly
5. **Limit file permissions** on config files

```bash
# Secure file permissions (Unix/Linux)
chmod 600 admin-login-config.json

# Move config outside project
mv admin-login-config.json ~/.config/patient-system/
```

### 🛡️ Secure Usage

```bash
# Use absolute paths for config files
node admin-login-automation.js --config /secure/path/admin-config.json

# Use environment variables instead of config files
VITE_SUPABASE_URL="https://..." VITE_SUPABASE_ANON_KEY="..." node admin-login-automation.js
```

## Error Handling

The script handles various error scenarios:

### Network Issues
- Connection timeouts
- DNS resolution failures
- SSL/TLS errors

### Authentication Issues
- Invalid credentials
- Account locked/disabled
- Session expired

### Configuration Issues
- Missing environment variables
- Invalid configuration format
- Malformed credentials

### Example Error Output

```
[2024-01-15T10:30:00.000Z] ❌ Network connectivity failed: timeout after 30000ms
[2024-01-15T10:30:05.000Z] ℹ️  Retrying in 1000ms... (1/3)
[2024-01-15T10:30:10.000Z] ❌ Admin login automation failed after 15000ms
Error: Network timeout after 30000ms
```

## Advanced Usage

### Custom Configuration

```javascript
import AdminLoginAutomation from './admin-login-automation.js';

const automation = new AdminLoginAutomation({
  supabaseUrl: 'https://your-project.supabase.co',
  supabaseKey: 'your-anon-key',
  adminEmail: 'admin@yourclinic.com',
  adminPassword: 'your-password',
  timeout: 45000,
  retries: 5,
  verbose: true
});

const result = await automation.execute();

if (result.success) {
  console.log('Login successful:', result.user);
} else {
  console.error('Login failed:', result.error);
}
```

### Integration with Other Scripts

```bash
#!/bin/bash
# Example: Use in shell script

echo "Logging in to admin account..."
node admin-login-automation.js --verbose

if [ $? -eq 0 ]; then
  echo "Login successful, proceeding with admin tasks..."
  # Your admin tasks here
else
  echo "Login failed, exiting..."
  exit 1
fi
```

## Troubleshooting

### Common Issues

#### 1. "Missing Supabase configuration" Error

**Solution**: Set environment variables or create config file
```bash
export VITE_SUPABASE_URL="https://your-project.supabase.co"
export VITE_SUPABASE_ANON_KEY="your-anon-key"
```

#### 2. "Network connectivity failed" Error

**Solution**: Check internet connection and Supabase URL
```bash
# Test connectivity
curl -I https://your-project.supabase.co

# Check if URL is correct
node -e "console.log(process.env.VITE_SUPABASE_URL)"
```

#### 3. "Invalid credentials" Error

**Solution**: Verify admin credentials
```bash
# Check if admin account exists
node server/scripts/createAdminAccount.js
```

#### 4. "User role is not admin" Error

**Solution**: Ensure the user has admin role in the database
```sql
-- Check user role
SELECT u.Email, r.RoleName
FROM Users u
JOIN Role r ON u.RoleID = r.RoleID
WHERE u.Email = 'admin@yourclinic.com';
```

### Debug Mode

Enable verbose logging for detailed information:

```bash
node admin-login-automation.js --verbose
```

## API Reference

### AdminLoginAutomation Class

#### Constructor Options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `supabaseUrl` | string | - | Supabase project URL |
| `supabaseKey` | string | - | Supabase anonymous key |
| `adminEmail` | string | - | Admin email address |
| `adminPassword` | string | - | Admin password |
| `timeout` | number | 30000 | Request timeout in ms |
| `retries` | number | 3 | Number of retry attempts |
| `retryDelay` | number | 1000 | Delay between retries in ms |
| `verbose` | boolean | false | Enable verbose logging |

#### Methods

##### `execute()`

Executes the complete login automation process.

**Returns:** `Promise<Object>`
```javascript
{
  success: boolean,
  user?: Object,
  session?: Object,
  duration: number,
  error?: string,
  metadata: Object
}
```

##### `cleanup()`

Cleans up resources and sessions.

**Returns:** `Promise<void>`

## Examples

### Example 1: Basic Login

```bash
node admin-login-automation.js
```

Output:
```
[2024-01-15T10:30:00.000Z] 🚀 Starting admin login automation...
[2024-01-15T10:30:00.000Z] ℹ️  Step 1: Initializing Supabase client...
[2024-01-15T10:30:00.000Z] ℹ️  Step 2: Validating network connectivity...
[2024-01-15T10:30:01.000Z] ℹ️  Step 3: Validating credentials format...
[2024-01-15T10:30:01.000Z] ℹ️  Step 4: Attempting admin login...
[2024-01-15T10:30:02.000Z] ℹ️  Step 5: Verifying admin role...
[2024-01-15T10:30:02.000Z] ℹ️  Step 6: Validating session integrity...
[2024-01-15T10:30:02.000Z] ✅ Admin login automation completed successfully!
[2024-01-15T10:30:02.000Z] ℹ️  Duration: 2000ms
[2024-01-15T10:30:02.000Z] 👤 User ID: abc-123-def-456
[2024-01-15T10:30:02.000Z] 📧 Email: admin@baankm3clinic.ph
[2024-01-15T10:30:02.000Z] 🔑 Session expires: 2024-01-15T11:30:02.000Z

🎉 Admin login automation completed successfully!
```

### Example 2: Login with Custom Config

```bash
node admin-login-automation.js --config ./prod-config.json --verbose
```

### Example 3: Error Handling

```bash
node admin-login-automation.js --email wrong@email.com --password wrongpass
```

Output:
```
[2024-01-15T10:30:00.000Z] 🚀 Starting admin login automation...
[2024-01-15T10:30:00.000Z] ℹ️  Step 1: Initializing Supabase client...
[2024-01-15T10:30:00.000Z] ℹ️  Step 2: Validating network connectivity...
[2024-01-15T10:30:01.000Z] ℹ️  Step 3: Validating credentials format...
[2024-01-15T10:30:01.000Z] ℹ️  Step 4: Attempting admin login...
[2024-01-15T10:30:05.000Z] ❌ Login attempt 1 failed: Invalid login credentials
[2024-01-15T10:30:05.000Z] ℹ️  Retrying in 1000ms... (1/3)
[2024-01-15T10:30:10.000Z] ❌ Login attempt 2 failed: Invalid login credentials
[2024-01-15T10:30:10.000Z] ℹ️  Retrying in 1000ms... (2/3)
[2024-01-15T10:30:15.000Z] ❌ Login attempt 3 failed: Invalid login credentials
[2024-01-15T10:30:15.000Z] ❌ Admin login automation failed after 15000ms
Error: Invalid login credentials

💥 Admin login automation failed: Invalid login credentials
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is part of the Patient Record System and follows the same license terms.

## Support

For issues and questions:
1. Check the troubleshooting section
2. Review the error logs with verbose mode
3. Verify your configuration and credentials
4. Check network connectivity to Supabase

---

**⚠️ Security Notice**: This script handles sensitive authentication data. Always follow security best practices and never expose credentials in logs or version control.