interface ChurchRegistrationEmailData {
  churchName: string;
  pastorName: string;
  inviteCode: string;
  organizationId: string;
  contactEmail: string;
}

export interface BetaApplicationNotificationData {
  churchName: string;
  contactPersonName: string;
  contactEmail: string;
  contactPhone: string;
  memberCount: string;
  currentSoftware: string;
  specificNeeds: string;
  website: string;
  address: string;
  description: string;
  inviteCode: string;
  organizationId: string;
}

export function generateChurchWelcomeEmail(data: ChurchRegistrationEmailData) {
  const { churchName, pastorName, inviteCode, organizationId, contactEmail } = data;
  
  const subject = `Welcome to Kingdom Impact Training - ${churchName} Registration Confirmed`;
  
  const htmlContent = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Welcome to Kingdom Impact Training</title>
    <style>
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700&display=swap');
        
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        
        body {
            font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            line-height: 1.6;
            color: #334155;
            background-color: #f8fafc;
        }
        
        .container {
            max-width: 600px;
            margin: 0 auto;
            background-color: #ffffff;
            border-radius: 12px;
            overflow: hidden;
            box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
        }
        
        .header {
            background: linear-gradient(135deg, #5b21b6 0%, #7c3aed 100%);
            padding: 40px 30px;
            text-align: center;
            color: white;
        }
        
        .crown-icon {
            width: 60px;
            height: 60px;
            margin: 0 auto 20px;
            background: rgba(255, 255, 255, 0.2);
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 24px;
        }
        
        .header h1 {
            font-size: 28px;
            font-weight: 700;
            margin-bottom: 8px;
        }
        
        .header p {
            font-size: 16px;
            opacity: 0.9;
        }
        
        .content {
            padding: 40px 30px;
        }
        
        .greeting {
            font-size: 18px;
            margin-bottom: 24px;
            color: #1e293b;
        }
        
        .success-message {
            background: linear-gradient(135deg, #ecfdf5 0%, #f0fdf4 100%);
            border-left: 4px solid #22c55e;
            padding: 20px;
            border-radius: 8px;
            margin-bottom: 30px;
        }
        
        .success-message h2 {
            color: #15803d;
            font-size: 20px;
            font-weight: 600;
            margin-bottom: 8px;
        }
        
        .success-message p {
            color: #166534;
            margin: 0;
        }
        
        .invite-section {
            background: #f8fafc;
            border: 2px dashed #cbd5e1;
            border-radius: 12px;
            padding: 24px;
            text-align: center;
            margin: 30px 0;
        }
        
        .invite-section h3 {
            color: #1e293b;
            font-size: 18px;
            font-weight: 600;
            margin-bottom: 12px;
        }
        
        .invite-code {
            background: #5b21b6;
            color: white;
            font-family: 'Monaco', 'Menlo', monospace;
            font-size: 24px;
            font-weight: 700;
            padding: 16px 24px;
            border-radius: 8px;
            display: inline-block;
            letter-spacing: 2px;
            margin: 12px 0;
        }
        
        .invite-instructions {
            color: #64748b;
            font-size: 14px;
            margin-top: 12px;
        }
        
        .next-steps {
            margin: 30px 0;
        }
        
        .next-steps h3 {
            color: #1e293b;
            font-size: 18px;
            font-weight: 600;
            margin-bottom: 16px;
        }
        
        .step {
            display: flex;
            align-items: flex-start;
            margin-bottom: 16px;
            padding: 16px;
            background: #f8fafc;
            border-radius: 8px;
        }
        
        .step-number {
            background: #5b21b6;
            color: white;
            width: 28px;
            height: 28px;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            font-weight: 600;
            font-size: 14px;
            margin-right: 16px;
            flex-shrink: 0;
        }
        
        .step-content {
            flex: 1;
        }
        
        .step-title {
            font-weight: 600;
            color: #1e293b;
            margin-bottom: 4px;
        }
        
        .step-description {
            color: #64748b;
            font-size: 14px;
        }
        
        .cta-button {
            display: inline-block;
            background: linear-gradient(135deg, #5b21b6 0%, #7c3aed 100%);
            color: white;
            text-decoration: none;
            padding: 16px 32px;
            border-radius: 8px;
            font-weight: 600;
            font-size: 16px;
            text-align: center;
            margin: 20px 0;
            box-shadow: 0 4px 12px rgba(139, 92, 246, 0.3);
            transition: transform 0.2s ease;
        }
        
        .cta-button:hover {
            transform: translateY(-2px);
        }
        
        .support-section {
            background: #f1f5f9;
            padding: 24px;
            border-radius: 8px;
            margin: 30px 0;
            text-align: center;
        }
        
        .support-section h3 {
            color: #1e293b;
            margin-bottom: 8px;
        }
        
        .support-section p {
            color: #64748b;
            margin-bottom: 16px;
        }
        
        .contact-info {
            color: #5b21b6;
            font-weight: 600;
        }
        
        .footer {
            background: #1e293b;
            color: #94a3b8;
            padding: 30px;
            text-align: center;
            font-size: 14px;
        }
        
        .footer p {
            margin-bottom: 8px;
        }
        
        .footer a {
            color: #8b5cf6;
            text-decoration: none;
        }
        
        @media (max-width: 600px) {
            .container {
                margin: 10px;
            }
            
            .header, .content {
                padding: 24px 20px;
            }
            
            .invite-code {
                font-size: 20px;
                padding: 12px 20px;
            }
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <div class="crown-icon">👑</div>
            <h1>Kingdom Impact Training</h1>
            <p>Spiritual Gifts Assessment Platform</p>
        </div>
        
        <div class="content">
            <div class="greeting">
                Dear ${pastorName},
            </div>
            
            <div class="success-message">
                <h2>🎉 Welcome to Kingdom Impact Training!</h2>
                <p><strong>${churchName}</strong> has been successfully registered and is ready to help your congregation discover their spiritual gifts.</p>
            </div>
            
            <p>Thank you for choosing Kingdom Impact Training to help your congregation discover and develop their God-given spiritual gifts. We're honored to partner with ${churchName} in this important ministry.</p>
            
            <div class="invite-section">
                <h3>📋 Your Congregation Invite Code</h3>
                <div class="invite-code">${inviteCode}</div>
                <div class="invite-instructions">
                    Share this code with your congregation members so they can join your church's assessment platform.
                </div>
            </div>
            
            <div class="next-steps">
                <h3>🚀 Next Steps to Get Started</h3>
                
                <div class="step">
                    <div class="step-number">1</div>
                    <div class="step-content">
                        <div class="step-title">Access Your Admin Dashboard</div>
                        <div class="step-description">Sign in to configure ministry opportunities and customize your church's assessment experience.</div>
                    </div>
                </div>
                
                <div class="step">
                    <div class="step-number">2</div>
                    <div class="step-content">
                        <div class="step-title">Add Ministry Opportunities</div>
                        <div class="step-description">Create specific ministry roles that match your congregation's spiritual gifts to provide actionable next steps.</div>
                    </div>
                </div>
                
                <div class="step">
                    <div class="step-number">3</div>
                    <div class="step-content">
                        <div class="step-title">Share the Invite Code</div>
                        <div class="step-description">Distribute the invite code above to your congregation members so they can take their spiritual gifts assessment.</div>
                    </div>
                </div>
                
                <div class="step">
                    <div class="step-number">4</div>
                    <div class="step-content">
                        <div class="step-title">Review Results & Guide Members</div>
                        <div class="step-description">Use the admin dashboard to view assessment results and help match members with appropriate ministry opportunities.</div>
                    </div>
                </div>
            </div>
            
            <div style="text-align: center;">
                <a href="${process.env.REPLIT_DOMAINS?.split(',')[0] ? `https://${process.env.REPLIT_DOMAINS.split(',')[0]}/church-admin-welcome` : '#'}" class="cta-button">
                    Access Your Admin Dashboard →
                </a>
            </div>
            
            <div class="support-section">
                <h3>📞 Need Help Getting Started?</h3>
                <p>Our team is here to support you every step of the way. Don't hesitate to reach out if you have questions or need assistance setting up your assessment platform.</p>
                <div class="contact-info">
                    Email: support@kingdomimpacttraining.com<br>
                    Phone: (555) 123-4567
                </div>
            </div>
            
            <p>We're excited to see how God will use this tool to help your congregation discover their unique calling and step into greater ministry impact.</p>
            
            <p>Blessings,<br>
            <strong>The Kingdom Impact Training Team</strong></p>
        </div>
        
        <div class="footer">
            <p><strong>Kingdom Impact Training</strong></p>
            <p>Empowering churches to discover and deploy spiritual gifts</p>
            <p><a href="#">Privacy Policy</a> | <a href="#">Unsubscribe</a></p>
        </div>
    </div>
</body>
</html>`;

  const textContent = `
Welcome to Kingdom Impact Training!

Dear ${pastorName},

Congratulations! ${churchName} has been successfully registered with Kingdom Impact Training.

Your Congregation Invite Code: ${inviteCode}

Next Steps:
1. Access Your Admin Dashboard - Sign in to configure ministry opportunities
2. Add Ministry Opportunities - Create specific ministry roles for your congregation
3. Share the Invite Code - Distribute the code above to your congregation members
4. Review Results & Guide Members - Use the dashboard to view assessment results

Access your admin dashboard: ${process.env.REPLIT_DOMAINS?.split(',')[0] ? `https://${process.env.REPLIT_DOMAINS.split(',')[0]}/church-admin-welcome` : 'Please visit your Kingdom Impact Training portal'}

Need help? Contact us:
Email: support@kingdomimpacttraining.com
Phone: (555) 123-4567

Blessings,
The Kingdom Impact Training Team
`;

  return {
    subject,
    html: htmlContent,
    text: textContent
  };
}

export function generateBetaApplicationNotificationEmail(data: BetaApplicationNotificationData) {
  const { 
    churchName, 
    contactPersonName, 
    contactEmail, 
    contactPhone, 
    memberCount, 
    currentSoftware, 
    specificNeeds, 
    website, 
    address, 
    description, 
    inviteCode, 
    organizationId 
  } = data;
  
  const subject = `🚀 New Beta Application: ${churchName}`;
  
  const htmlContent = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>New Beta Application</title>
    <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #334155; background-color: #f8fafc; }
        .container { max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1); }
        .header { background: linear-gradient(135deg, #5b21b6 0%, #7c3aed 100%); padding: 30px; text-align: center; color: white; }
        .content { padding: 30px; }
        .info-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 15px; margin: 20px 0; }
        .info-item { background: #f8fafc; padding: 15px; border-radius: 8px; border-left: 4px solid #5b21b6; }
        .info-label { font-weight: 600; color: #5b21b6; margin-bottom: 5px; }
        .info-value { color: #334155; }
        .full-width { grid-column: 1 / -1; }
        .highlight { background: linear-gradient(135deg, #ecfdf5 0%, #f0fdf4 100%); border-left: 4px solid #22c55e; padding: 20px; border-radius: 8px; margin: 20px 0; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🚀 New Beta Application</h1>
            <p>A church has applied for the KingdomOps Inner Circle beta program</p>
        </div>
        
        <div class="content">
            <div class="highlight">
                <h2 style="margin: 0 0 10px 0; color: #22c55e;">✅ ${churchName}</h2>
                <p style="margin: 0; color: #166534;">Organization ID: <strong>${organizationId}</strong></p>
                <p style="margin: 0; color: #166534;">Invite Code: <strong>${inviteCode}</strong></p>
            </div>
            
            <div class="info-grid">
                <div class="info-item">
                    <div class="info-label">Contact Person</div>
                    <div class="info-value">${contactPersonName}</div>
                </div>
                
                <div class="info-item">
                    <div class="info-label">Email</div>
                    <div class="info-value">${contactEmail}</div>
                </div>
                
                <div class="info-item">
                    <div class="info-label">Phone</div>
                    <div class="info-value">${contactPhone}</div>
                </div>
                
                <div class="info-item">
                    <div class="info-label">Church Size</div>
                    <div class="info-value">${memberCount}</div>
                </div>
                
                <div class="info-item">
                    <div class="info-label">Website</div>
                    <div class="info-value">${website}</div>
                </div>
                
                <div class="info-item">
                    <div class="info-label">Current Software</div>
                    <div class="info-value">${currentSoftware}</div>
                </div>
                
                <div class="info-item full-width">
                    <div class="info-label">Address</div>
                    <div class="info-value">${address}</div>
                </div>
                
                <div class="info-item full-width">
                    <div class="info-label">Church Description</div>
                    <div class="info-value">${description}</div>
                </div>
                
                <div class="info-item full-width">
                    <div class="info-label">Specific Needs & Goals</div>
                    <div class="info-value">${specificNeeds}</div>
                </div>
            </div>
            
            <div style="margin-top: 30px; text-align: center;">
                <p><strong>Next Steps:</strong></p>
                <p>1. Review the application details above</p>
                <p>2. Follow up with the contact person within 48 hours</p>
                <p>3. Provide them with onboarding instructions and beta access</p>
            </div>
        </div>
    </div>
</body>
</html>`;

  const textContent = `
🚀 NEW BETA APPLICATION

Church: ${churchName}
Organization ID: ${organizationId}
Invite Code: ${inviteCode}

CONTACT INFORMATION:
Name: ${contactPersonName}
Email: ${contactEmail}
Phone: ${contactPhone}

CHURCH DETAILS:
Size: ${memberCount}
Website: ${website}
Current Software: ${currentSoftware}

Address: ${address}

Description: ${description}

Specific Needs & Goals:
${specificNeeds}

NEXT STEPS:
1. Review the application details
2. Follow up with the contact person within 48 hours
3. Provide onboarding instructions and beta access
`;

  return {
    subject,
    html: htmlContent,
    text: textContent
  };
}