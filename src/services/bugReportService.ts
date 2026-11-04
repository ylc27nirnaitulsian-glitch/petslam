import { supabase, isSupabaseConfigured } from './supabaseClient';

export interface BugReportPayload {
  title: string;
  category: 'multiplayer' | 'matchmaking' | 'combat' | 'graphics' | 'audio' | 'account' | 'other';
  severity: 'low' | 'normal' | 'high' | 'critical';
  description: string;
  stepsToReproduce?: string;
  playerTag?: string;
  trainerName?: string;
  reporterEmail?: string;
  diagnostics?: Record<string, any>;
}

export interface BugReportResponse {
  success: boolean;
  message: string;
  reportId?: string;
  emailSent?: boolean;
  savedToDb?: boolean;
  destinationEmail: string;
  mailtoUrl?: string;
}

export const TARGET_BUG_EMAIL = 'nirnaitulsian@34gmail.com';

/**
 * Collects runtime client environment diagnostics
 */
export function getClientDiagnostics(extraData?: Record<string, any>): Record<string, any> {
  const isBrowser = typeof window !== 'undefined';
  if (!isBrowser) return { environment: 'server', ...(extraData || {}) };

  let webglInfo = 'unknown';
  try {
    const canvas = document.createElement('canvas');
    const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
    if (gl) {
      const dbg = (gl as any).getExtension('WEBGL_debug_renderer_info');
      if (dbg) {
        webglInfo = (gl as any).getParameter(dbg.UNMASKED_RENDERER_WEBGL);
      }
    }
  } catch {}

  return {
    appVersion: '2.4.0-alpha',
    timestamp: new Date().toISOString(),
    url: window.location.href,
    userAgent: navigator.userAgent,
    language: navigator.language,
    platform: navigator.platform,
    screen: {
      width: window.innerWidth,
      height: window.innerHeight,
      pixelRatio: window.devicePixelRatio || 1,
      orientation: window.innerWidth > window.innerHeight ? 'landscape' : 'portrait',
    },
    gpuRenderer: webglInfo,
    supabaseConnected: isSupabaseConfigured,
    ...(extraData || {}),
  };
}

/**
 * Builds a pre-filled mailto URL for direct email dispatch fallback
 */
export function buildBugMailtoUrl(payload: BugReportPayload): string {
  const subject = encodeURIComponent(
    `[PET SLAM Bug Report] [${payload.severity.toUpperCase()}] ${payload.title}`
  );

  const diag = payload.diagnostics || getClientDiagnostics();
  const bodyText = `
PET SLAM BUG REPORT
--------------------------------------------------
Title: ${payload.title}
Category: ${payload.category}
Severity: ${payload.severity}
Reporter: ${payload.trainerName || 'Trainer'} (${payload.playerTag || 'N/A'})
Contact Email: ${payload.reporterEmail || 'Not provided'}
Time: ${new Date().toLocaleString()}

DESCRIPTION:
${payload.description}

STEPS TO REPRODUCE:
${payload.stepsToReproduce || 'N/A'}

SYSTEM DIAGNOSTICS:
Platform: ${diag.platform || 'N/A'}
Resolution: ${diag.screen?.width}x${diag.screen?.height} (Ratio: ${diag.screen?.pixelRatio})
URL: ${diag.url || 'N/A'}
User Agent: ${diag.userAgent || 'N/A'}
--------------------------------------------------
`.trim();

  const body = encodeURIComponent(bodyText);
  return `mailto:${TARGET_BUG_EMAIL}?subject=${subject}&body=${body}`;
}

/**
 * Submits a bug report to the backend API and Supabase database, emailing nirnaitulsian@34gmail.com
 */
export async function submitBugReport(
  payload: BugReportPayload
): Promise<BugReportResponse> {
  const diagnostics = payload.diagnostics || getClientDiagnostics();
  const reportId = `bug_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
  const mailtoUrl = buildBugMailtoUrl({ ...payload, diagnostics });

  let savedToDb = false;
  let emailSent = false;
  let apiMessage = '';

  // 1. Try sending via backend Express or Cloudflare Pages API
  try {
    const res = await fetch('/api/bug-report', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...payload,
        diagnostics,
      }),
    });

    if (res.ok) {
      const data = await res.json();
      emailSent = Boolean(data.emailSent);
      savedToDb = Boolean(data.savedToDb);
      apiMessage = data.message || '';
      return {
        success: true,
        reportId: data.reportId || reportId,
        emailSent,
        savedToDb,
        destinationEmail: TARGET_BUG_EMAIL,
        message: apiMessage || `Bug report dispatched to ${TARGET_BUG_EMAIL}`,
        mailtoUrl,
      };
    }
  } catch (apiErr) {
    console.warn('[BugReport] Backend API route not reachable, falling back to direct Supabase record:', apiErr);
  }

  // 2. Direct Supabase Fallback (if backend API was offline or static preview)
  if (supabase && isSupabaseConfigured) {
    try {
      const { error } = await supabase.from('bug_reports').insert({
        id: reportId,
        player_tag: payload.playerTag || 'Anonymous',
        trainer_name: payload.trainerName || 'Anonymous Trainer',
        reporter_email: payload.reporterEmail || null,
        title: payload.title,
        category: payload.category,
        severity: payload.severity,
        description: payload.description,
        steps_to_reproduce: payload.stepsToReproduce || '',
        diagnostics,
        status: 'open',
        email_sent: false,
      });

      if (!error) {
        savedToDb = true;
      } else {
        console.warn('[BugReport] Supabase direct insert warning:', error);
      }
    } catch (dbErr) {
      console.warn('[BugReport] Supabase direct insert error:', dbErr);
    }
  }

  // 3. Store locally as well
  try {
    const localLogs = JSON.parse(localStorage.getItem('petslam_local_bug_reports') || '[]');
    localLogs.unshift({ id: reportId, ...payload, diagnostics, createdAt: new Date().toISOString() });
    localStorage.setItem('petslam_local_bug_reports', JSON.stringify(localLogs.slice(0, 15)));
  } catch {}

  return {
    success: true,
    reportId,
    emailSent: false,
    savedToDb,
    destinationEmail: TARGET_BUG_EMAIL,
    message: savedToDb
      ? `Bug report logged in database (#${reportId.slice(-6)}). You can also click below to open your email client directly.`
      : `Bug report recorded locally (#${reportId.slice(-6)}). Use the email button below to dispatch directly.`,
    mailtoUrl,
  };
}
