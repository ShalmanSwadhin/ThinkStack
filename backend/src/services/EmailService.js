import env from '../config/env.js';
import logger from '../utils/logger.js';

export class EmailService {
  async sendPasswordResetEmail(email, resetUrl) {
    if (!env.resend.apiKey) {
      logger.info(`[DEV] Password reset link for ${email}: ${resetUrl}`);
      return { dev: true, resetUrl };
    }

    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${env.resend.apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: env.resend.from,
        to: email,
        subject: 'Reset your ThinkStack password',
        html: `
          <h2>Password Reset</h2>
          <p>Click the link below to reset your password. This link expires in 1 hour.</p>
          <p><a href="${resetUrl}">Reset Password</a></p>
          <p>If you did not request this, ignore this email.</p>
        `,
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      logger.error(`Resend API error: ${error}`);
      throw new Error('Failed to send reset email');
    }

    return response.json();
  }
}

export default new EmailService();
