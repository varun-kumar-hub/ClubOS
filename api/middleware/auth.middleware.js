const supabase = require('../config/database');
const { ADMIN_EMAILS } = require('../config/environment');

const adminEmailList = (ADMIN_EMAILS || 'admin@clubevent.com,test@clubevent.com')
  .split(',')
  .map((email) => email.trim().toLowerCase())
  .filter(Boolean);

const determineRole = (email) => (
  adminEmailList.includes(email?.toLowerCase()) ? 'admin' : 'student'
);

const isAdminRole = (role) => role === 'admin' || role === 'club_admin';

const getTokenFromRequest = (req) => {
  if (req.cookies?.admin_token) {
    return req.cookies.admin_token;
  }

  if (req.headers.authorization?.startsWith('Bearer ')) {
    return req.headers.authorization.split(' ')[1];
  }

  return null;
};

const authMiddleware = async (req, res, next) => {
  try {
    const token = getTokenFromRequest(req);

    if (!token) {
      return res.status(401).json({ error: 'Access denied. Please login.' });
    }

    const { data: { user }, error: userError } = await supabase.auth.getUser(token);

    if (userError || !user) {
      return res.status(401).json({ error: 'Invalid or expired session.' });
    }

    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .maybeSingle();

    if (profileError) {
      console.error('Profile lookup failed:', profileError.message);
    }

    const profileRole = profile?.role?.toLowerCase();
    const emailRole = determineRole(user.email);
    const role = isAdminRole(profileRole) || emailRole === 'admin'
      ? 'admin'
      : (profileRole || 'student');

    req.user = {
      ...user,
      profile,
      role,
    };

    req.admin = req.user;

    next();
  } catch (err) {
    console.error('Auth Middleware Error:', err);
    return res.status(500).json({ error: 'Authentication internal failure.' });
  }
};

const isAdminMiddleware = (req, res, next) => {
  if (req.user && isAdminRole(req.user.role)) {
    return next();
  }

  return res.status(403).json({ error: 'Access forbidden: Admins only.' });
};

module.exports = authMiddleware;
module.exports.authMiddleware = authMiddleware;
module.exports.isAdminMiddleware = isAdminMiddleware;
