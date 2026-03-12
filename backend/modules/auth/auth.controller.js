const authService = require('./auth.service');

const authController = {
  async requestOTP(req, res, next) {
    try {
      const { email } = req.body;
      if (!email) {
        return res.status(400).json({ error: 'Email is required' });
      }

      await authService.requestOTP(email);
      res.status(200).json({ message: 'OTP sent successfully' });
    } catch (error) {
      next(error);
    }
  },

  async verifyOTP(req, res, next) {
    try {
      const { email, code } = req.body;
      if (!email || !code) {
        return res.status(400).json({ error: 'Email and OTP code are required' });
      }

      const { user, token } = await authService.verifyOTP(email, code);

      // Set JWT as a secure HTTP-only cookie
      res.cookie('admin_token', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 24 * 60 * 60 * 1000 // 24 hours
      });

      res.status(200).json({
        message: 'Login successful',
        user
      });
    } catch (error) {
      if (error.message === 'Invalid or expired OTP') {
        return res.status(401).json({ error: error.message });
      }
      next(error);
    }
  },

  async logout(req, res, next) {
    try {
      res.clearCookie('admin_token');
      res.status(200).json({ message: 'Logout successful' });
    } catch (error) {
      next(error);
    }
  },

  async getMe(req, res, next) {
    try {
      if (!req.admin) { // authMiddleware attaches to req.admin (legacy name, but refers to current user)
        return res.status(401).json({ error: 'Not authenticated' });
      }
      res.status(200).json({ user: req.admin });
    } catch (error) {
      next(error);
    }
  }
};

module.exports = authController;
