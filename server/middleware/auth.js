import supabase from '../config/supabase.js';

export const authenticateToken = async (req, res, next) => {
  const token = req.headers['x-auth-token'];

  if (!token) {
    return res.status(401).json({ message: 'Access token required' });
  }

  try {
    const { data: { user }, error } = await supabase.auth.getUser(token);

    if (error || !user) {
      return res.status(401).json({ message: 'Invalid token' });
    }

    req.user = user;
    next();
  } catch (error) {
    console.error('Auth middleware error:', error);
    res.status(500).json({ message: 'Authentication error' });
  }
};

export const authorizeRole = (allowedRoles) => {
  return async (req, res, next) => {
    try {
      const { data: userData } = await supabase
        .from('Users')
        .select('RoleID')
        .eq('UserID', req.user.id)
        .single();

      const { data: roleData } = await supabase
        .from('Role')
        .select('RoleName')
        .eq('RoleID', userData.RoleID)
        .single();

      if (!allowedRoles.includes(roleData.RoleName)) {
        return res.status(403).json({ message: 'Insufficient permissions' });
      }

      req.userRole = roleData.RoleName;
      next();
    } catch (error) {
      console.error('Authorization error:', error);
      res.status(500).json({ message: 'Authorization error' });
    }
  };
};
