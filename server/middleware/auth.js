// Authentication middleware
// In a real application, this would verify JWT tokens

const auth = (req, res, next) => {
  // Get token from header
  const token = req.header('x-auth-token');

  // Check if no token
  if (!token) {
    return res.status(401).json({ message: 'No token, authorization denied' });
  }

  try {
    // In a real app, you would verify the JWT token here
    // For this mock version, we'll just check if the token exists
    if (token === 'mock-jwt-token') {
      // In a real app, the decoded user info would be added to the request
      req.user = { id: 'mock-user-id' };
      next();
    } else {
      res.status(401).json({ message: 'Token is not valid' });
    }
  } catch (err) {
    res.status(401).json({ message: 'Token is not valid' });
  }
};

// Role-based authorization middleware
const authorize = (roles = []) => {
  // roles param can be a single role string (e.g., 'admin') 
  // or an array of roles (e.g., ['admin', 'nurse'])
  if (typeof roles === 'string') {
    roles = [roles];
  }

  return (req, res, next) => {
    // In a real app, the user's role would be extracted from the JWT token
    // For this mock version, we'll just check a hardcoded role
    const userRole = req.header('x-user-role') || 'patient';

    if (roles.length && !roles.includes(userRole)) {
      // User's role is not authorized
      return res.status(403).json({ message: 'Forbidden: insufficient permissions' });
    }

    // Authentication and authorization successful
    next();
  };
};

export { auth, authorize };