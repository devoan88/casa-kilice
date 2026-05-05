import { Resend } from "resend";

import { getCasaBankDetails } from "@/lib/bankDetails";
import { formatMoney } from "@/lib/money";

function esc(s: string) {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function fromAddress() {
  return process.env.EMAIL_FROM?.trim() || "Casa Kilicé <onboarding@resend.dev>";
}

export async function sendOrderConfirmationEmail(args: {
  to: string;
  orderId: string;
  customerName: string;
  lines: { name: string; qty: number; lineTotalCents: number }[];
  totalCents: number;
  currency: string;
  paymentMethod: "cod" | "bank_transfer" | string;
  completeUrl: string;
}): Promise<{ ok: boolean; skipped?: boolean; error?: string }> {
  const apiKey = process.env.RESEND_API_KEY?.trim();
  if (!apiKey) {
    console.info("[mail] RESEND_API_KEY missing — order confirmation not emailed to", args.to);
    return { ok: false, skipped: true, error: "Email not configured." };
  }

  const bank = getCasaBankDetails();
  const isBank = args.paymentMethod === "bank_transfer";
  const linesHtml = args.lines
    .map(
      (l) =>
        `<tr><td style="padding:8px 0;border-bottom:1px solid #eee">${esc(l.name)} × ${l.qty}</td><td style="padding:8px 0;border-bottom:1px solid #eee;text-align:right">${esc(formatMoney(l.lineTotalCents, args.currency))}</td></tr>`,
    )
    .join("");

  const bankBlock = isBank
    ? `<p style="margin:16px 0 8px;font-size:12px;letter-spacing:0.12em;text-transform:uppercase;color:#6b5d52">Bank transfer</p>
       <p style="margin:0;font-family:monospace;font-size:15px;color:#3c3530">${esc(bank.iban || "Configure CK_BANK_IBAN")}</p>
       <p style="margin:12px 0 0;font-size:13px;color:#5c534c"><strong>Payment description:</strong> include your Order ID <code style="background:#f5f0ea;padding:2px 6px;border-radius:4px">${esc(args.orderId)}</code></p>`
    : `<p style="margin:16px 0 0;font-size:14px;color:#5c534c">Cash on delivery — please have <strong>${esc(formatMoney(args.totalCents, args.currency))}</strong> ready when the courier arrives.</p>`;

  const html = `<!DOCTYPE html><html><body style="margin:0;background:#faf7f4;font-family:Georgia,serif;color:#3c3530">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="padding:32px 16px"><tr><td align="center">
    <table width="560" cellspacing="0" cellpadding="0" style="max-width:560px;background:#fff;border-radius:16px;border:1px solid #e8e0d8;overflow:hidden">
      <tr><td style="padding:28px 28px 12px">
        <p style="margin:0;font-size:11px;letter-spacing:0.28em;text-transform:uppercase;color:#8a7f76">Casa Kilicé</p>
        <h1 style="margin:12px 0 0;font-size:26px;font-weight:600">Order received</h1>
        <p style="margin:12px 0 0;font-size:15px;line-height:1.55;color:#5c534c">Thank you, ${esc(args.customerName)}. Your order is <strong>pending</strong> while our team confirms details.</p>
      </td></tr>
      <tr><td style="padding:0 28px 8px">
        <p style="margin:0 0 8px;font-size:11px;letter-spacing:0.2em;text-transform:uppercase;color:#8a7f76">Order ID</p>
        <p style="margin:0;font-family:monospace;font-size:14px;word-break:break-all">${esc(args.orderId)}</p>
      </td></tr>
      <tr><td style="padding:16px 28px">
        <table width="100%" cellspacing="0" cellpadding="0">${linesHtml}</table>
        <p style="margin:16px 0 0;text-align:right;font-size:18px;font-weight:600">Total ${esc(formatMoney(args.totalCents, args.currency))}</p>
      </td></tr>
      <tr><td style="padding:8px 28px 28px">
        ${bankBlock}
        <p style="margin:24px 0 0"><a href="${args.completeUrl.replace(/&/g, "&amp;").replace(/"/g, "&quot;")}" style="display:inline-block;padding:12px 22px;background:#3c3530;color:#faf7f4;text-decoration:none;border-radius:999px;font-size:11px;letter-spacing:0.18em;text-transform:uppercase">View order summary</a></p>
      </td></tr>
    </table>
  </td></tr></table></body></html>`;

  try {
    const resend = new Resend(apiKey);
    const { error } = await resend.emails.send({
      from: fromAddress(),
      to: args.to,
      subject: `Casa Kilicé — order ${args.orderId.slice(0, 10)}…`,
      html,
    });
    if (error) {
      console.error("[mail] Resend error", error);
      return { ok: false, error: error.message };
    }
    return { ok: true };
  } catch (e) {
    console.error("[mail] sendOrderConfirmationEmail", e);
    return { ok: false, error: e instanceof Error ? e.message : "Send failed" };
  }
}

export async function sendPaymentReminderEmail(args: {
  to: string;
  customerName: string;
  orderLabel: string;
  totalCents: number;
  currency: string;
  paymentMethod: string | null;
}): Promise<{ ok: boolean; skipped?: boolean; error?: string }> {
  const apiKey = process.env.RESEND_API_KEY?.trim();
  if (!apiKey) {
    console.info("[mail] RESEND_API_KEY missing — payment reminder not sent to", args.to);
    return { ok: false, skipped: true, error: "Email not configured." };
  }

  const bank = getCasaBankDetails();
  const isBank = args.paymentMethod === "bank_transfer";
  const payHint = isBank
    ? `<p style="margin:12px 0 0;font-size:14px;color:#5c534c">If you chose <strong>bank transfer</strong>, please send payment to <span style="font-family:monospace">${esc(bank.iban || "—")}</span> and include your order reference in the transfer description.</p>`
    : `<p style="margin:12px 0 0;font-size:14px;color:#5c534c">If you chose <strong>cash on delivery</strong>, no bank step is needed — we will reach out if anything is unclear.</p>`;

  const html = `<!DOCTYPE html><html><body style="margin:0;background:#faf7f4;font-family:Georgia,serif;color:#3c3530">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="padding:32px 16px"><tr><td align="center">
    <table width="560" cellspacing="0" cellpadding="0" style="max-width:560px;background:#fff;border-radius:16px;border:1px solid #e8e0d8;overflow:hidden">
      <tr><td style="padding:28px 28px 12px">
        <p style="margin:0;font-size:11px;letter-spacing:0.28em;text-transform:uppercase;color:#8a7f76">Casa Kilicé</p>
        <h1 style="margin:12px 0 0;font-size:24px;font-weight:600">Payment reminder</h1>
        <p style="margin:12px 0 0;font-size:15px;line-height:1.55;color:#5c534c">Hello ${esc(args.customerName)}, your order <strong>${esc(args.orderLabel)}</strong> is still <strong>pending</strong>. Order total: <strong>${esc(formatMoney(args.totalCents, args.currency))}</strong>.</p>
        ${payHint}
        <p style="margin:20px 0 0;font-size:13px;color:#6b5d52">If you have already paid or have questions, reply to this email or contact us with your order reference.</p>
      </td></tr>
    </table>
  </td></tr></table></body></html>`;

  try {
    const resend = new Resend(apiKey);
    const { error } = await resend.emails.send({
      from: fromAddress(),
      to: args.to,
      subject: `Casa Kilicé — reminder: order ${args.orderLabel} pending`,
      html,
    });
    if (error) {
      console.error("[mail] Resend payment reminder", error);
      return { ok: false, error: error.message };
    }
    return { ok: true };
  } catch (e) {
    console.error("[mail] sendPaymentReminderEmail", e);
    return { ok: false, error: e instanceof Error ? e.message : "Send failed" };
  }
}

export async function sendMarketingEmail(args: {
  to: string;
  subject: string;
  html: string;
}): Promise<{ ok: boolean; error?: string }> {
  const apiKey = process.env.RESEND_API_KEY?.trim();
  if (!apiKey) {
    return { ok: false, error: "RESEND_API_KEY not set." };
  }
  try {
    const resend = new Resend(apiKey);
    const { error } = await resend.emails.send({
      from: fromAddress(),
      to: args.to,
      subject: args.subject,
      html: args.html,
    });
    if (error) return { ok: false, error: error.message };
    return { ok: true };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "Send failed" };
  }
}
