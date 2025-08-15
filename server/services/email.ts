import nodemailer from "nodemailer";

interface EmailService {
  sendAssessmentResults(
    email: string,
    name: string,
    results: {
      top1Gift: string;
      top2Gift: string;
      top3Gift: string;
      detailedResults: string;
    }
  ): Promise<void>;
}

class NodemailerEmailService implements EmailService {
  private transporter: nodemailer.Transporter;

  constructor() {
    this.transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || "smtp.gmail.com",
      port: parseInt(process.env.SMTP_PORT || "587"),
      secure: false,
      auth: {
        user: process.env.SMTP_USER || process.env.EMAIL_USER,
        pass: process.env.SMTP_PASS || process.env.EMAIL_PASS,
      },
    });
  }

  async sendAssessmentResults(
    email: string,
    name: string,
    results: {
      top1Gift: string;
      top2Gift: string;
      top3Gift: string;
      detailedResults: string;
    }
  ): Promise<void> {
    const mailOptions = {
      from: process.env.FROM_EMAIL || "noreply@kingdomimpact.org",
      to: email,
      subject: "Your Spiritual Gifts Assessment Results",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: linear-gradient(135deg, #1E40AF 0%, #1E3A8A 100%); color: white; padding: 30px; text-align: center;">
            <h1 style="margin: 0; font-size: 28px;">Your Spiritual Gifts Results</h1>
            <p style="margin: 10px 0 0 0; opacity: 0.9;">Kingdom Impact Training Assessment</p>
          </div>
          
          <div style="padding: 30px; background: white;">
            <p style="font-size: 18px; color: #374151; margin-bottom: 20px;">Hello ${name},</p>
            
            <p style="color: #6B7280; line-height: 1.6; margin-bottom: 25px;">
              Congratulations on completing your spiritual gifts assessment! God has uniquely gifted you to serve His Kingdom. 
              Here are your top 3 spiritual gifts:
            </p>
            
            <div style="background: #FEF3C7; border-left: 4px solid #F59E0B; padding: 20px; margin: 25px 0;">
              <h3 style="color: #92400E; margin: 0 0 10px 0;">Your Top 3 Gifts:</h3>
              <ol style="color: #92400E; margin: 0; padding-left: 20px;">
                <li style="margin-bottom: 5px; font-weight: 600;">${results.top1Gift}</li>
                <li style="margin-bottom: 5px; font-weight: 600;">${results.top2Gift}</li>
                <li style="margin-bottom: 5px; font-weight: 600;">${results.top3Gift}</li>
              </ol>
            </div>
            
            <div style="color: #6B7280; line-height: 1.6;">
              ${results.detailedResults}
            </div>
            
            <div style="text-align: center; margin-top: 30px;">
              <a href="${process.env.FRONTEND_URL || "http://localhost:5000"}" 
                 style="background: #1E40AF; color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; font-weight: 600;">
                View Full Results
              </a>
            </div>
          </div>
          
          <div style="background: #F9FAFB; padding: 20px; text-align: center; border-top: 1px solid #E5E7EB;">
            <p style="color: #6B7280; margin: 0; font-size: 14px;">
              Ready to step into your calling? Contact a ministry leader to explore opportunities.
            </p>
          </div>
        </div>
      `,
    };

    await this.transporter.sendMail(mailOptions);
  }
}

export const emailService: EmailService = new NodemailerEmailService();
