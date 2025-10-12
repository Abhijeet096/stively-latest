import { Resend } from 'resend';


const resend = new Resend(process.env.RESEND_API_KEY);

interface SendVerificationEmailParams {
  email: string;
  verificationToken: string;
}

interface SendWelcomeEmailParams {
  email: string;
  firstName?: string;
}



export async function sendVerificationEmail({ email, verificationToken }: SendVerificationEmailParams) {
  const verificationUrl = `${process.env.NEXT_PUBLIC_APP_URL}/api/newsletter/verify?token=${verificationToken}`;

  try {
    const result = await resend.emails.send({
      from: 'Stively <team@stively.com>', // YOUR DOMAIN - Change after verification
      to: email,
      subject: '✨ Verify your email - Welcome to Stively!',
      html: `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f5f5f5;">
  <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
    <h1 style="color: white; margin: 0; font-size: 28px;">Welcome to Stively! 🎉</h1>
  </div>
  
  <div style="background: #ffffff; padding: 40px; border: 1px solid #e0e0e0; border-top: none; border-radius: 0 0 10px 10px;">
    <h2 style="color: #667eea; margin-top: 0;">One More Step...</h2>
    
    <p style="font-size: 16px; margin-bottom: 20px; color: #333;">
      Thank you for subscribing to Stively! We're excited to have you in our community.
    </p>
    
    <p style="font-size: 16px; margin-bottom: 30px; color: #333;">
      Please verify your email address by clicking the button below:
    </p>
    
    <div style="text-align: center; margin: 30px 0;">
      <a href="${verificationUrl}" style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 15px 40px; text-decoration: none; border-radius: 5px; font-weight: bold; font-size: 16px; display: inline-block; box-shadow: 0 4px 6px rgba(102, 126, 234, 0.3);">
        Verify My Email
      </a>
    </div>
    
    <p style="font-size: 14px; color: #666; margin-top: 30px;">
      Or copy and paste this link into your browser:
    </p>
    <p style="font-size: 12px; color: #667eea; word-break: break-all; background: #f5f5f5; padding: 10px; border-radius: 5px;">
      ${verificationUrl}
    </p>
    
    <hr style="border: none; border-top: 1px solid #e0e0e0; margin: 30px 0;">
    
    <p style="font-size: 12px; color: #999; text-align: center;">
      If you didn't subscribe to Stively, you can safely ignore this email.
    </p>
  </div>
  
  <div style="text-align: center; margin-top: 20px; color: #999; font-size: 12px;">
    <p>© 2024 Stively. All rights reserved.</p>
    <p><a href="https://stively.com" style="color: #667eea; text-decoration: none;">Visit our website</a></p>
  </div>
</body>
</html>`,
    });

    console.log('✅ Verification email sent:', result);
    return { success: true };
  } catch (error) {
    console.error('❌ Failed to send verification email:', error);
    return { success: false, error };
  }
}

export async function sendWelcomeEmail({ email, firstName }: SendWelcomeEmailParams) {
  const name = firstName || 'there';

  try {
    const result = await resend.emails.send({
      from: 'Stively Team <team@stively.com>', // YOUR DOMAIN - Change after verification
      to: email,
      subject: '🎉 Welcome to Stively - You\'re All Set!',
      html: `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f5f5f5;">
  <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px; text-align: center; border-radius: 10px 10px 0 0;">
    <h1 style="color: white; margin: 0; font-size: 32px;">🎉 You're In!</h1>
  </div>
  
  <div style="background: #ffffff; padding: 40px; border: 1px solid #e0e0e0; border-top: none; border-radius: 0 0 10px 10px;">
    <h2 style="color: #667eea; margin-top: 0;">Welcome to Stively, ${name}!</h2>
    
    <p style="font-size: 16px; margin-bottom: 20px; color: #333;">
      Your email has been verified successfully! 🎊
    </p>
    
    <p style="font-size: 16px; margin-bottom: 20px; color: #333;">
      You're now part of our community of <strong>50,000+</strong> readers who stay ahead with:
    </p>
    
    <div style="background: #f8f9ff; padding: 20px; border-radius: 8px; margin: 25px 0;">
      <ul style="margin: 0; padding-left: 20px;">
        <li style="margin-bottom: 10px; font-size: 15px; color: #333;">📚 Weekly curated articles & insights</li>
        <li style="margin-bottom: 10px; font-size: 15px; color: #333;">🚀 Exclusive content & early access</li>
        <li style="margin-bottom: 10px; font-size: 15px; color: #333;">💡 Expert analysis & deep dives</li>
        <li style="font-size: 15px; color: #333;">🎯 Tips & strategies from industry leaders</li>
      </ul>
    </div>
    
    <h3 style="color: #667eea; margin-top: 30px;">What's Next?</h3>
    
    <p style="font-size: 16px; margin-bottom: 20px; color: #333;">
      Start exploring our latest articles and discover content that inspires, educates, and empowers.
    </p>
    
    <div style="text-align: center; margin: 30px 0;">
      <a href="${process.env.NEXT_PUBLIC_APP_URL}/blog" style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 15px 40px; text-decoration: none; border-radius: 5px; font-weight: bold; font-size: 16px; display: inline-block; box-shadow: 0 4px 6px rgba(102, 126, 234, 0.3);">
        Explore Articles
      </a>
    </div>
    
    <hr style="border: none; border-top: 1px solid #e0e0e0; margin: 30px 0;">
    
    <p style="font-size: 14px; color: #666;">
      Have questions or feedback? Simply reply to this email - we'd love to hear from you!
    </p>
    
    <p style="font-size: 14px; color: #666; margin-top: 20px;">
      Cheers,<br>
      <strong>The Stively Team</strong>
    </p>
  </div>
  
  <div style="text-align: center; margin-top: 20px; color: #999; font-size: 12px;">
    <p>© 2024 Stively. All rights reserved.</p>
    <p>
      <a href="${process.env.NEXT_PUBLIC_APP_URL}" style="color: #667eea; text-decoration: none; margin: 0 10px;">Website</a> |
      <a href="${process.env.NEXT_PUBLIC_APP_URL}/unsubscribe" style="color: #667eea; text-decoration: none; margin: 0 10px;">Unsubscribe</a>
    </p>
  </div>
</body>
</html>`,
    });

    console.log('✅ Welcome email sent:', result);
    return { success: true };
  } catch (error) {
    console.error('❌ Failed to send welcome email:', error);
    return { success: false, error };
  }
}