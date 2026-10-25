// ==============================================================================
// PET SLAM: Supabase Edge Function for Secure Waitlist & Resend Emails
// Deploy with: supabase functions deploy waitlist --no-verify-jwt
// Required Secrets: RESEND_API_KEY (Set via Supabase Dashboard -> Edge Functions -> Secrets)
// ==============================================================================

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, GET, OPTIONS",
};

interface WaitlistRequest {
  email: string;
}

serve(async (req: Request) => {
  // 1. Handle CORS Preflight
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    // 2. Health check / status probe
    if (req.method === "GET") {
      return new Response(
        JSON.stringify({ status: "operational", service: "PET SLAM Waitlist Engine" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (req.method !== "POST") {
      return new Response(
        JSON.stringify({ error: "Method not allowed" }),
        { status: 405, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // 3. Parse and validate payload
    const body: WaitlistRequest = await req.json().catch(() => ({ email: "" }));
    const rawEmail = body.email;

    if (!rawEmail || typeof rawEmail !== "string") {
      return new Response(
        JSON.stringify({ success: false, error: "Email address is required." }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const email = rawEmail.trim().toLowerCase();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email) || email.length > 254) {
      return new Response(
        JSON.stringify({ success: false, error: "Please provide a valid email address." }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // 4. Initialize Supabase Service Role client
    const supabaseUrl = Deno.env.get("SUPABASE_URL") ?? "";
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";

    if (!supabaseUrl || !supabaseServiceKey) {
      console.error("Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in Edge Function environment.");
      return new Response(
        JSON.stringify({ success: false, error: "Server configuration error: Database keys not detected." }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // 5. Check duplicate registration
    const { data: existing, error: checkError } = await supabase
      .from("waitlist")
      .select("id, email, created_at, signup_status, perks")
      .eq("email", email)
      .maybeSingle();

    if (checkError) {
      console.error("Error querying waitlist:", checkError);
    }

    if (existing) {
      return new Response(
        JSON.stringify({
          success: false,
          duplicate: true,
          message: "This email is already registered on the PET SLAM waitlist.",
          entry: existing,
        }),
        { status: 409, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // 6. Insert new candidate into database
    const perksData = {
      credits: 10000,
      founder_badge: true,
      alpha_access: true,
    };

    const { data: inserted, error: insertError } = await supabase
      .from("waitlist")
      .insert({
        email,
        signup_status: "confirmed",
        perks: perksData,
        email_delivery_status: "pending",
      })
      .select()
      .single();

    if (insertError || !inserted) {
      console.error("Failed to insert into waitlist:", insertError);
      return new Response(
        JSON.stringify({
          success: false,
          error: "Database error: Could not record signup. Please try again.",
        }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // 7. Dispatch Transactional Confirmation Email via Resend
    const resendApiKey = Deno.env.get("RESEND_API_KEY");
    const senderEmail = Deno.env.get("RESEND_FROM_EMAIL") || "PET SLAM <hello@petslam.com>";

    let emailSent = false;
    let emailStatusMessage = "";

    if (!resendApiKey) {
      emailStatusMessage = "RESEND_API_KEY secret not yet set in Supabase Edge Function secrets. Signup saved successfully.";
      console.warn("RESEND_API_KEY is not configured.");
    } else {
      try {
        const emailSubject = "Welcome to PET SLAM. You're on the list.";
        const plainTextBody = `WELCOME TO THE ARENA.

You're officially on the PET SLAM waitlist.

Get ready to own, train and battle your animals. We're building something different, and you'll be among the first to experience it.

As a registered genesis applicant, your voucher (${inserted.id}) includes:
• 10,000 In-App Arena Credits
• Founder Beast Badge
• Priority Closed Alpha Feature Testing

The arena is coming. Stay tuned.

– Team PET SLAM
https://petslam.com`;

        const htmlBody = `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <style>
            body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #0B0C10; color: #F3F4F6; margin: 0; padding: 30px 15px; }
            .container { max-width: 600px; margin: 0 auto; background-color: #12141A; border: 1px solid #232734; padding: 40px 30px; }
            .logo { font-size: 28px; font-weight: 900; letter-spacing: 2px; text-transform: uppercase; color: #FFFFFF; }
            .accent { color: #CCFF00; }
            .badge { display: inline-block; background-color: rgba(204, 255, 0, 0.1); border: 1px solid rgba(204, 255, 0, 0.3); color: #CCFF00; padding: 4px 10px; font-size: 11px; font-weight: bold; text-transform: uppercase; letter-spacing: 1.5px; margin-top: 15px; }
            h1 { font-size: 24px; text-transform: uppercase; letter-spacing: 1px; color: #FFFFFF; margin-top: 25px; margin-bottom: 15px; }
            p { font-size: 15px; line-height: 1.6; color: #D1D5DB; margin-bottom: 16px; }
            .perks-box { background-color: #08090C; border: 1px solid #232734; padding: 20px; margin: 25px 0; }
            .perk-item { padding: 8px 0; border-bottom: 1px solid rgba(255,255,255,0.05); font-size: 13px; }
            .perk-item:last-child { border-bottom: none; }
            .perk-title { color: #CCFF00; font-weight: bold; }
            .voucher { font-family: monospace; font-size: 12px; color: #9CA3AF; margin-top: 10px; }
            .footer { margin-top: 35px; border-top: 1px solid #232734; padding-top: 20px; font-size: 12px; color: #6B7280; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="logo">PET<span class="accent"> SLAM</span></div>
            <div class="badge">Application Confirmed · Genesis Registry</div>
            
            <h1>WELCOME TO THE ARENA.</h1>
            
            <p>You're officially on the <strong>PET SLAM</strong> waitlist.</p>
            <p>Get ready to own, train and battle your animals. We're building something different, and you'll be among the first to experience it.</p>
            
            <div class="perks-box">
              <div style="font-size: 12px; text-transform: uppercase; letter-spacing: 1px; color: #9CA3AF; margin-bottom: 10px; font-weight: bold;">Granted Genesis Privileges</div>
              <div class="perk-item"><span class="perk-title">10,000 Arena Credits</span> · Allocated for marketplace acquisition & leveling</div>
              <div class="perk-item"><span class="perk-title">Founder Beast Badge</span> · Permanent insignia for your competitor profile</div>
              <div class="perk-item"><span class="perk-title">Closed Alpha Access</span> · Priority invitation to playtest PvP & auctions</div>
              <div class="voucher">Registration Voucher: <strong>${inserted.id}</strong></div>
            </div>
            
            <p>The arena is coming. Stay tuned.</p>
            <p style="margin-top: 25px; font-weight: bold; color: #FFFFFF;">– Team PET SLAM</p>
            
            <div class="footer">
              © ${new Date().getFullYear()} PET SLAM Gaming Ltd. All rights reserved.<br>
              Where animal ownership meets competitive esports gaming.
            </div>
          </div>
        </body>
        </html>
        `;

        const resendResponse = await fetch("https://api.resend.com/emails", {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${resendApiKey}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            from: senderEmail,
            to: [email],
            subject: emailSubject,
            text: plainTextBody,
            html: htmlBody,
          }),
        });

        if (resendResponse.ok) {
          emailSent = true;
          emailStatusMessage = "Confirmation email dispatched via Resend";
          // Update DB delivery status
          await supabase
            .from("waitlist")
            .update({ email_delivery_status: "sent" })
            .eq("id", inserted.id);
        } else {
          const resendError = await resendResponse.text();
          console.warn("Resend API rejected request:", resendResponse.status, resendError);
          emailStatusMessage = `Resend returned HTTP ${resendResponse.status}. Signup safely retained in database.`;
          await supabase
            .from("waitlist")
            .update({ email_delivery_status: "failed", email_delivery_error: resendError })
            .eq("id", inserted.id);
        }
      } catch (err: any) {
        console.error("Network error connecting to Resend:", err);
        emailStatusMessage = "Network error connecting to Resend. Signup safely retained in database.";
        await supabase
          .from("waitlist")
          .update({ email_delivery_status: "failed", email_delivery_error: err?.message || "Unknown error" })
          .eq("id", inserted.id);
      }
    }

    // 8. Return response
    return new Response(
      JSON.stringify({
        success: true,
        message: "You're in. Welcome to PET SLAM.",
        entry: inserted,
        emailStatus: {
          sent: emailSent,
          message: emailStatusMessage,
        },
        perksAwarded: {
          credits: 10000,
          founderBadge: "Granted",
          alphaTesting: "Priority Invitation",
        },
      }),
      { status: 201, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err: any) {
    console.error("Edge function unhandled exception:", err);
    return new Response(
      JSON.stringify({ success: false, error: "An unexpected server error occurred." }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
