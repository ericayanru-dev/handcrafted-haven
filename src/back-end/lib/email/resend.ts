// src/lib/email/resend.ts
import { Resend } from 'resend';
import { AUTH_CONFIG } from '../../config/auth';

import WelcomeEmail from './templates/auth/welcome-email-template';
import VerifyEmail from './templates/auth/verification-email-template';
import ResetPasswordEmail from './templates/auth/rest-password-email-template';
import PasswordChangedEmail from './templates/auth/password-changed-email-template';
import LoginAlertEmail from './templates/auth/login-alert-emaill-template';

const resend = new Resend(AUTH_CONFIG.RESEND_API_KEY);

// Strict union type for all possible emails
type EmailPayload =
  | { type: "welcome"; props: { firstName: string; dashboardUrl?: string } }
  | { type: "verification"; props: { firstName: string; verifyUrl: string; code?: string } }
  | { type: "password-reset"; props: { firstName: string; resetUrl: string } }
  | { type: "password-changed"; props: { firstName: string } }
  | { type: "login-alert"; props: { firstName: string; location: string; device: string; time: string; ipAddress?: string } };

export async function sendEmail(to: string, payload: EmailPayload) {
  try {
    let subject = "";
    let reactComponent: React.ReactElement;

    switch (payload.type) {
      case "welcome":
        subject = `Welcome to Handcrafted Haven, ${payload.props.firstName}!`;
        reactComponent = WelcomeEmail(payload.props);
        break;

      case "verification":
        subject = "Verify your Handcrafted Haven account";
        reactComponent = VerifyEmail(payload.props);
        break;

      case "password-reset":
        subject = "Reset your Handcrafted Haven password";
        reactComponent = ResetPasswordEmail(payload.props);
        break;

      case "password-changed":
        subject = "Your Handcrafted Haven password has been changed";
        reactComponent = PasswordChangedEmail(payload.props);
        break;

      case "login-alert":
        subject = "New login detected on your Handcrafted Haven account";
        reactComponent = LoginAlertEmail(payload.props);
        break;

      default:
        throw new Error(`Unknown email type: ${JSON.stringify(payload)}`);    }

    const { data, error } = await resend.emails.send({
      from: "Handcrafted Haven <onboarding@resend.dev>",
      to,
      subject,
      react: reactComponent,
    });

    if (error) {
      console.error("Resend Error:", error);
      return { success: false, error: error.message };
    }

    return { success: true, data };
  } catch (err: any) {
    console.error("Send Email Error:", err);
    return { success: false, error: err.message || "Failed to send email" };
  }
}