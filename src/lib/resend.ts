import { Resend } from 'resend';
import dbConnect from './mongodb';
import User from '@/models/User';

const resend = new Resend(process.env.RESEND_API_KEY);

// Global database connection cache to avoid reconnecting for every email
let dbConnected = false;

/**
 * Ensures database connection is established (with caching)
 */
async function ensureDbConnection() {
  if (!dbConnected) {
    await dbConnect();
    dbConnected = true;
  }
}

/**
 * Sends an email using the RESEND service with improved error handling, logging, and retry logic.
 * @param to - Recipient email address.
 * @param subject - Subject of the email.
 * @param html - HTML content of the email.
 * @param retries - Number of retries on failure (default 3).
 * @returns A promise resolving to the RESEND response.
 */
export async function sendEmail(to: string, subject: string, html: string, retries: number = 3) {
  const from = process.env.RESEND_FROM_EMAIL;
  if (!from) {
    throw new Error('RESEND_FROM_EMAIL is not set in environment variables.');
  }

  for (let attempt = 1; attempt <= retries; attempt++) {
    const startTime = Date.now();

    try {
      console.log(`📧 Sending email to ${to} with subject: "${subject}" (attempt ${attempt}/${retries})`);

      const response = await resend.emails.send({
        from,
        to,
        subject,
        html
      });

      const duration = Date.now() - startTime;
      console.log(`✅ Email sent successfully to ${to} in ${duration}ms. ID: ${response.data?.id}`);

      return response;
    } catch (error: any) {
      const duration = Date.now() - startTime;
      console.error(`❌ Failed to send email to ${to} after ${duration}ms (attempt ${attempt}/${retries}):`, error);

      // Log specific error details for debugging
      if (error.response) {
        console.error('Resend API Error:', {
          status: error.response.status,
          statusText: error.response.statusText,
          data: error.response.data
        });
      }

      // If this is the last attempt, throw the error
      if (attempt === retries) {
        throw error;
      }

      // Wait before retrying (exponential backoff)
      const delay = Math.min(1000 * Math.pow(2, attempt - 1), 10000); // Max 10 seconds
      console.log(`⏳ Retrying in ${delay}ms...`);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
}

/**
 * Sends an email to a user based on their email preferences.
 * @param userId - User ID to check preferences for.
 * @param emailType - Type of email ('security', 'welcome', 'account-changes', 'newsletter', '2fa-notifications').
 * @param to - Recipient email address.
 * @param subject - Subject of the email.
 * @param html - HTML content of the email.
 * @returns A promise resolving to the RESEND response or null if not sent due to preferences.
 */
export async function sendEmailWithPreferences(
  userId: string,
  emailType: 'security' | 'welcome' | 'account-changes' | 'login-notifications' | 'newsletter' | '2fa-notifications',
  to: string,
  subject: string,
  html: string
) {
  const startTime = Date.now();
  console.log(`📧 sendEmailWithPreferences called: type=${emailType}, userId=${userId}, to=${to}`);

  // Security and welcome emails are always sent (no preference check needed)
  if (emailType === 'security' || emailType === 'welcome') {
    console.log(`🔒 Sending ${emailType} email (always sent)`);
    try {
      const htmlWithUnsubscribe = addUnsubscribeLink(html, to);
      const result = await sendEmail(to, subject, htmlWithUnsubscribe);
      const totalDuration = Date.now() - startTime;
      console.log(`✅ ${emailType} email sent successfully in ${totalDuration}ms`);
      return result;
    } catch (error) {
      console.error(`❌ Failed to send ${emailType} email:`, error);
      throw error;
    }
  }

  // For preference-based emails, check user preferences
  try {
    console.log(`🔍 Checking preferences for user ${userId}`);
    const dbStartTime = Date.now();

    await ensureDbConnection();
    const user = await User.findById(userId).select('emailPreferences');

    const dbDuration = Date.now() - dbStartTime;
    console.log(`🗄️ Database query completed in ${dbDuration}ms`);

    if (!user) {
      console.warn(`⚠️ User ${userId} not found, skipping email`);
      return null;
    }

    // Set default preferences if not set
    const preferences = {
      twoFANotifications: { enabled: false, ...user.emailPreferences?.twoFANotifications },
      accountChanges: { enabled: true, ...user.emailPreferences?.accountChanges },
      loginNotifications: { enabled: true, ...user.emailPreferences?.loginNotifications },
      newsletter: { enabled: true, ...user.emailPreferences?.newsletter }
    };

    let shouldSend = false;

    switch (emailType) {
      case 'account-changes':
        shouldSend = preferences.accountChanges?.enabled || false;
        break;
      case 'login-notifications':
        shouldSend = preferences.loginNotifications?.enabled || false;
        console.log(`🔐 Login notifications check: enabled=${shouldSend}`);
        break;
      case 'newsletter':
        shouldSend = preferences.newsletter?.enabled || false;
        break;
      case '2fa-notifications':
        shouldSend = preferences.twoFANotifications?.enabled || false;
        break;
      default:
        shouldSend = false;
    }

    if (!shouldSend) {
      const totalDuration = Date.now() - startTime;
      console.log(`🚫 Email not sent to ${to}: ${emailType} notifications disabled (${totalDuration}ms)`);
      return null;
    }

    console.log(`📤 Sending ${emailType} email to ${to}`);
    const htmlWithUnsubscribe = addUnsubscribeLink(html, to);
    const result = await sendEmail(to, subject, htmlWithUnsubscribe);

    const totalDuration = Date.now() - startTime;
    console.log(`✅ ${emailType} email sent successfully in ${totalDuration}ms`);

    return result;
  } catch (error) {
    const totalDuration = Date.now() - startTime;
    console.error(`❌ Error checking email preferences after ${totalDuration}ms:`, error);
    // If we can't check preferences, don't send the email to be safe
    return null;
  }
}

/**
 * Adds an unsubscribe link to the email HTML
 * @param html - Original HTML content
 * @param email - Recipient email address
 * @returns HTML with unsubscribe link added
 */
function addUnsubscribeLink(html: string, email: string): string {
  const encodedEmail = encodeURIComponent(email);
  const unsubscribeUrl = `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/unsubscribe?email=${encodedEmail}`;

  const unsubscribeFooter = `
    <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e0e0e0; text-align: center; color: #666; font-size: 12px;">
      <p>
        You're receiving this email because you have an account with SpyberPolymath.
        <br>
        <a href="${unsubscribeUrl}" style="color: #007bff; text-decoration: underline;">Manage your email preferences</a> |
        <a href="${unsubscribeUrl}&type=all" style="color: #007bff; text-decoration: underline;">Unsubscribe from all</a>
      </p>
      <p style="margin-top: 10px;">
        © 2024 SpyberPolymath. All rights reserved.
      </p>
    </div>
  `;

  // If the HTML already contains a closing body or html tag, insert before it
  if (html.includes('</body>')) {
    return html.replace('</body>', `${unsubscribeFooter}</body>`);
  } else if (html.includes('</html>')) {
    return html.replace('</html>', `${unsubscribeFooter}</html>`);
  } else {
    // If no closing tags, just append to the end
    return html + unsubscribeFooter;
  }
}