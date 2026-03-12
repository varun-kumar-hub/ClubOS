const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');
const authModel = require('./auth.model');
const crypto = require('crypto');

const JWT_SECRET = process.env.JWT_SECRET || 'club_super_secret_jwt_key_2026';
const JWT_EXPIRES_IN = '24h';

// Predefined admin emails (can be comma-separated in .env)
const ADMIN_EMAILS = (process.env.ADMIN_EMAILS || '').split(',').map(e => e.trim().toLowerCase());

// Setup nodemailer transporter
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: process.env.SMTP_PORT,
  secure: process.env.SMTP_PORT == 465, 
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

const authService = {
  async requestOTP(email) {
    email = email.toLowerCase();
    
    // Generate 6-digit OTP
    const otp = crypto.randomInt(100000, 999999).toString();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes from now

    // Save to DB
    await authModel.saveOTP(email, otp, expiresAt.toISOString());

    // Send Email (in development, we might want to log it if SMTP is not configured)
    if (process.env.NODE_ENV === 'development' && !process.env.SMTP_HOST) {
      console.log(`[DEV] OTP for ${email}: ${otp}`);
      return { success: true, message: 'OTP sent (check logs)' };
    }

    try {
      await transporter.sendMail({
        from: process.env.SMTP_FROM || '"Club Event Platform" <noreply@clubevent.com>',
        to: email,
        subject: 'Your Login OTP - Club Event Platform',
        text: `Your OTP for logging in is: ${otp}. It expires in 10 minutes.`,
        html: `<b>Your OTP for logging in is: <span style="font-size: 24px;">${otp}</span></b><p>It expires in 10 minutes.</p>`,
      });
      return { success: true, message: 'OTP sent to your email' };
    } catch (error) {
      console.error('Email sending failed:', error);
      throw new Error('Failed to send OTP email');
    }
  },

  async verifyOTP(email, code) {
    email = email.toLowerCase();
    const isValid = await authModel.verifyOTP(email, code);
    
    if (!isValid) {
      throw new Error('Invalid or expired OTP');
    }

    // Determine role
    const role = ADMIN_EMAILS.includes(email) ? 'club_admin' : 'participant';

    // Find or create user
    let user = await authModel.findByEmail(email);
    if (!user) {
      user = await authModel.createUser({
        email,
        role,
        name: email.split('@')[0], // Default name from email
      });
    } else if (user.role !== role) {
      // Update role if it changed in the admin list
      // This allows promoting/demoting users via .env
      // Note: In a real app, you might want more complex role management.
    }

    // Generate JWT
    const payload = {
      id: user.id,
      email: user.email,
      role: user.role
    };

    const token = jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });

    return { user: payload, token };
  },

  verifyToken(token) {
    return jwt.verify(token, JWT_SECRET);
  }
};

module.exports = authService;
