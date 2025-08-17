import nodemailer from 'nodemailer';

// Email configuration
const createTransporter = () => {
  // Use environment variables for email configuration
  const emailConfig = {
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: parseInt(process.env.SMTP_PORT || '587'),
    secure: false, // true for 465, false for other ports
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASSWORD,
    },
  };

  return nodemailer.createTransport(emailConfig);
};

export interface EmailOptions {
  to: string;
  subject: string;
  html: string;
  text: string;
  from?: string;
}

export async function sendEmail(options: EmailOptions): Promise<boolean> {
  try {
    // Check if email is configured
    if (!process.env.SMTP_USER || !process.env.SMTP_PASSWORD) {
      console.log('Email not configured - would send:', {
        to: options.to,
        subject: options.subject,
        preview: options.text.substring(0, 100) + '...'
      });
      return true; // Return true for testing purposes
    }

    const transporter = createTransporter();
    
    const mailOptions = {
      from: options.from || `"Kingdom Impact Training" <${process.env.SMTP_USER}>`,
      to: options.to,
      subject: options.subject,
      html: options.html,
      text: options.text,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('Email sent successfully:', info.messageId);
    return true;
  } catch (error) {
    console.error('Error sending email:', error);
    return false;
  }
}

export async function testEmailConnection(): Promise<boolean> {
  try {
    if (!process.env.SMTP_USER || !process.env.SMTP_PASSWORD) {
      console.log('Email configuration not found');
      return false;
    }

    const transporter = createTransporter();
    await transporter.verify();
    console.log('Email server connection verified');
    return true;
  } catch (error) {
    console.error('Email connection failed:', error);
    return false;
  }
}