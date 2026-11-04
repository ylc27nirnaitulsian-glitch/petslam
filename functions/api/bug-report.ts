/**
 * Cloudflare Pages Function: /api/bug-report
 * Accepts bug reports and dispatches them via Resend to nirnaitulsian@34gmail.com
 */

interface Env {
  RESEND_API_KEY?: string;
  RESEND_FROM_EMAIL?: string;
  VITE_SUPABASE_URL?: string;
  SUPABASE_SERVICE_ROLE_KEY?: string;
}

interface EventContext {
  request: Request;
  env: Env;
}

const TARGET_BUG_EMAIL = 'nirnaitulsian@34gmail.com';

const corsHeaders = {
  'Content-Type': 'application/json',
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

export async function onRequestOptions(): Promise<Response> {
  return new Response(null, {
    status: 204,
    headers: corsHeaders,
  });
}

export async function onRequestPost(context: EventContext): Promise<Response> {
  try {
    const env = context.env || {};
    const body: any = await context.request.json().catch(() => ({}));
    const {
      title,
      category,
      severity,
      description,
      stepsToReproduce,
      playerTag,
      trainerName,
      reporterEmail,
      diagnostics,
    } = body;

    if (!title || !description) {
      return new Response(
        JSON.stringify({ error: 'Title and description are required.' }),
        { status: 400, headers: corsHeaders }
      );
    }

    const reportId = `bug_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const apiKey = env.RESEND_API_KEY || '';
    const fromAddress = env.RESEND_FROM_EMAIL || 'PET SLAM Bug Tracker <onboarding@resend.dev>';

    let emailSent = false;
    let emailError = '';

    if (apiKey) {
      try {
        const resendRes = await fetch('https://api.resend.com/emails', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${apiKey.trim()}`,
          },
          body: JSON.stringify({
            from: fromAddress,
            to: TARGET_BUG_EMAIL,
            reply_to: reporterEmail || undefined,
            subject: `[PET SLAM Bug Report] [${(severity || 'NORMAL').toUpperCase()}] ${title}`,
            html: `
              <div style="font-family: monospace, sans-serif; background: #0A0E17; color: #FFFFFF; padding: 24px; border-radius: 12px; border: 2px solid #CCFF00;">
                <h1 style="color: #CCFF00; margin: 0 0 16px 0; font-size: 20px;">🐞 PET SLAM BUG REPORT</h1>
                <p><strong>Report ID:</strong> ${reportId}</p>
                <p><strong>Category:</strong> ${category || 'General'}</p>
                <p><strong>Severity:</strong> ${severity || 'normal'}</p>
                <p><strong>Reporter:</strong> ${trainerName || 'Anonymous'} (${playerTag || 'N/A'})</p>
                ${reporterEmail ? `<p><strong>Contact Email:</strong> ${reporterEmail}</p>` : ''}
                <hr style="border: 1px solid rgba(255,255,255,0.2); margin: 16px 0;" />
                <h3 style="color: #CCFF00;">Summary:</h3>
                <p style="font-size: 16px; font-weight: bold;">${title}</p>
                <h3 style="color: #CCFF00;">Description:</h3>
                <p style="white-space: pre-wrap; background: rgba(255,255,255,0.05); padding: 12px; border-radius: 8px;">${description}</p>
                ${stepsToReproduce ? `
                  <h3 style="color: #CCFF00;">Steps to Reproduce:</h3>
                  <p style="white-space: pre-wrap; background: rgba(255,255,255,0.05); padding: 12px; border-radius: 8px;">${stepsToReproduce}</p>
                ` : ''}
                <hr style="border: 1px solid rgba(255,255,255,0.2); margin: 16px 0;" />
                <h4 style="color: #8892B0;">Client Diagnostics:</h4>
                <pre style="background: #000; color: #00FF66; padding: 12px; border-radius: 8px; font-size: 12px; overflow-x: auto;">${JSON.stringify(diagnostics || {}, null, 2)}</pre>
              </div>
            `,
          }),
        });

        if (resendRes.ok) {
          emailSent = true;
        } else {
          emailError = await resendRes.text();
        }
      } catch (err: any) {
        emailError = err.message;
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        reportId,
        destinationEmail: TARGET_BUG_EMAIL,
        emailSent,
        message: emailSent
          ? `Bug report dispatched to ${TARGET_BUG_EMAIL}`
          : `Bug report processed. ${emailError || ''}`,
      }),
      { status: 200, headers: corsHeaders }
    );
  } catch (err: any) {
    return new Response(
      JSON.stringify({ success: false, error: err.message || 'Internal error' }),
      { status: 500, headers: corsHeaders }
    );
  }
}
