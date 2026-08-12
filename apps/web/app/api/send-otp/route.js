import { NextResponse } from 'next/server';
import { Resend } from 'resend';

export async function POST(req) {
  try {
    const { email, code } = await req.json();

    if (!email || !code) {
      return NextResponse.json(
        { success: false, error: 'Email and code are required' },
        { status: 400 }
      );
    }

    const apiKey = process.env.RESEND_API_KEY;

    if (!apiKey) {
      console.warn('[Resend API] RESEND_API_KEY environment variable is missing in .env.local.');
      return NextResponse.json({
        success: true,
        delivered: false,
        simulatedCode: code,
        note: 'RESEND_API_KEY missing in apps/web/.env.local. Operating in demo mode.',
      });
    }

    const resend = new Resend(apiKey);

    const htmlContent = `
      <div style="background-color: #060913; color: #ffffff; padding: 40px; font-family: system-ui, -apple-system, sans-serif; border-radius: 16px; text-align: center; max-width: 500px; margin: 0 auto; border: 1px solid #1e293b;">
        <div style="margin-bottom: 12px;">
          <span style="font-size: 24px; font-weight: 900; color: #ffffff; tracking: -0.05em;">Cipher<span style="color: #c084fc;">Stream</span></span>
        </div>
        <p style="color: #94a3b8; font-size: 13px; margin: 0 0 24px 0;">Zero-Cloud E2EE Peer-to-Peer Transfer Gateway</p>
        
        <div style="background-color: #0d1324; border: 1px solid #334155; border-radius: 16px; padding: 24px; margin-bottom: 24px;">
          <p style="font-size: 14px; color: #cbd5e1; margin-top: 0;">Your 6-Digit Email Verification Code:</p>
          <div style="background-color: #070b19; border: 2px solid #38bdf8; border-radius: 12px; padding: 14px; display: inline-block; margin: 12px 0;">
            <span style="font-size: 34px; font-weight: 800; font-family: monospace; letter-spacing: 8px; color: #38bdf8;">${code}</span>
          </div>
          <p style="font-size: 12px; color: #64748b; margin-bottom: 0;">Enter this code in your browser to upgrade your account to Verified Member status.</p>
        </div>

        <p style="font-size: 11px; color: #475569; margin: 0;">If you did not request this email verification, you can safely ignore this email.</p>
      </div>
    `;

    const result = await resend.emails.send({
      from: 'onboarding@resend.dev',
      to: [email],
      subject: `🔐 CipherStream Email Verification Code: ${code}`,
      html: htmlContent,
    });

    if (result.error) {
      console.error('[Resend API Error]:', result.error);
      return NextResponse.json({
        success: false,
        delivered: false,
        error: result.error.message || JSON.stringify(result.error),
        simulatedCode: code,
      });
    }

    console.log('[Resend API] Email sent successfully:', result);

    return NextResponse.json({
      success: true,
      delivered: true,
      data: result.data,
    });
  } catch (err) {
    console.error('[Resend API Exception]:', err);
    return NextResponse.json(
      { success: false, error: err.message || 'Failed to send OTP email' },
      { status: 500 }
    );
  }
}
