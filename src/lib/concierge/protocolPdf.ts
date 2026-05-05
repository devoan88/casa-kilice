import fs from "node:fs";
import path from "node:path";

import type { PDFPage, PDFFont, RGB } from "pdf-lib";
import { PDFDocument, StandardFonts, rgb } from "pdf-lib";

import { MEDICAL_DISCLAIMER_EN } from "@/lib/skinScan/wellnessProtocol";
import { completeStylingProfile } from "@/lib/skinScan/stylingProfile";
import type { ConsultationAnalysisPayload, Undertone } from "@/lib/skinScan/types";
import { productVisualKit } from "@/lib/skinScan/productVisuals";

function undertoneOrNeutral(u: string): Undertone {
  if (u === "Cool" || u === "Warm" || u === "Neutral") return u;
  return "Neutral";
}

const W = 595.28;
const H = 841.89;
const margin = 52;

/** Thin double-line frame — luxury passport cover treatment. */
function drawPassportFrame(page: PDFPage, stroke: RGB) {
  const outer = 28;
  const inner = 32;
  const t = 0.55;
  for (const inset of [outer, inner]) {
    page.drawLine({
      start: { x: inset, y: inset },
      end: { x: W - inset, y: inset },
      thickness: t,
      color: stroke,
    });
    page.drawLine({
      start: { x: inset, y: H - inset },
      end: { x: W - inset, y: H - inset },
      thickness: t,
      color: stroke,
    });
    page.drawLine({
      start: { x: inset, y: inset },
      end: { x: inset, y: H - inset },
      thickness: t,
      color: stroke,
    });
    page.drawLine({
      start: { x: W - inset, y: inset },
      end: { x: W - inset, y: H - inset },
      thickness: t,
      color: stroke,
    });
  }
}

function wrap(text: string, maxLen: number): string[] {
  const words = text.split(/\s+/);
  const lines: string[] = [];
  let cur = "";
  for (const w of words) {
    const next = cur ? `${cur} ${w}` : w;
    if (next.length <= maxLen) cur = next;
    else {
      if (cur) lines.push(cur);
      cur = w.length > maxLen ? w.slice(0, maxLen) : w;
    }
  }
  if (cur) lines.push(cur);
  return lines.length ? lines : [""];
}

function drawParagraph(
  page: PDFPage,
  text: string,
  opts: { x: number; y: number; size: number; font: PDFFont; color: RGB; maxWidth: number; lineHeight: number },
): number {
  let y = opts.y;
  for (const line of wrap(text, opts.maxWidth)) {
    if (y < 48) return y;
    page.drawText(line, { x: opts.x, y, size: opts.size, font: opts.font, color: opts.color });
    y -= opts.lineHeight;
  }
  return y;
}

function assetBasename(src: string): string {
  const seg = src.split("/").pop() ?? "";
  return seg.replace(/\.(svg|jpg|png)$/i, "");
}

async function tryEmbedRaster(pdf: PDFDocument, baseName: string) {
  for (const ext of ["jpg", "png"] as const) {
    const filePath = path.join(process.cwd(), "public", "products", `${baseName}.${ext}`);
    if (!fs.existsSync(filePath)) continue;
    const buf = fs.readFileSync(filePath);
    try {
      if (ext === "jpg") return await pdf.embedJpg(buf);
      return await pdf.embedPng(buf);
    } catch {
      /* continue */
    }
  }
  return null;
}

export async function buildDigitalBeautyPassportPdf(input: {
  consultationId: string;
  createdAt: Date;
  aiRecommendation: string;
  analysisJson: string;
}): Promise<Uint8Array> {
  let analysis: ConsultationAnalysisPayload | null = null;
  try {
    analysis = JSON.parse(input.analysisJson) as ConsultationAnalysisPayload;
  } catch {
    analysis = null;
  }

  const pdf = await PDFDocument.create();
  const font = await pdf.embedFont(StandardFonts.Helvetica);
  const bold = await pdf.embedFont(StandardFonts.HelveticaBold);
  const cream = rgb(0.96, 0.94, 0.9);
  const ink = rgb(0.16, 0.12, 0.1);
  const gold = rgb(0.62, 0.48, 0.32);
  const muted = rgb(0.4, 0.36, 0.33);

  let page = pdf.addPage([W, H]);
  const bg = () => page.drawRectangle({ x: 0, y: 0, width: W, height: H, color: cream });
  bg();
  drawPassportFrame(page, gold);
  let y = H - 56;

  const freshPage = () => {
    page = pdf.addPage([W, H]);
    page.drawRectangle({ x: 0, y: 0, width: W, height: H, color: cream });
    drawPassportFrame(page, gold);
    return H - 72;
  };

  const needY = (min: number) => {
    if (y < min) y = freshPage();
  };

  page.drawText("Casa Kilicé", { x: margin, y, size: 11, font: bold, color: gold });
  y -= 22;
  page.drawText("Skin Scan · Casa Kilicé", { x: margin, y, size: 22, font: bold, color: ink });
  y -= 14;
  page.drawText("Ultra-modern digital beauty passport", { x: margin, y, size: 11, font, color: muted });
  y -= 28;
  page.drawText(`Consultation · ${input.consultationId.slice(0, 14)}…`, { x: margin, y, size: 8, font, color: muted });
  y -= 12;
  page.drawText(`Generated · ${input.createdAt.toISOString().slice(0, 10)} UTC`, { x: margin, y, size: 8, font, color: muted });
  y -= 28;
  page.drawLine({
    start: { x: margin, y: y + 6 },
    end: { x: W - margin, y: y + 6 },
    thickness: 0.6,
    color: gold,
  });
  y -= 20;
  page.drawText("Certificate of wellness analysis", { x: margin, y, size: 10, font: bold, color: ink });
  y -= 14;
  y = drawParagraph(
    page,
    "This certificate attests to a private Casa Kilicé Skin Scan session. AI-generated beauty and wellness guidance only — not a medical diagnosis or clinical record.",
    { x: margin, y, size: 8, font, color: muted, maxWidth: 72, lineHeight: 11 },
  );
  y -= 18;
  page.drawText("Authorised issuance", { x: margin, y, size: 7, font: bold, color: gold });
  y -= 10;
  page.drawLine({
    start: { x: margin, y: y + 4 },
    end: { x: margin + 220, y: y + 4 },
    thickness: 0.45,
    color: ink,
  });
  y -= 8;
  page.drawText("Casa Kilicé — Maison digital seal", { x: margin, y, size: 8, font, color: ink });
  y -= 28;

  if (analysis?.primaryProductSlug) {
    const kit = productVisualKit(analysis.primaryProductSlug);
    page.drawText("Maison textures", { x: margin, y, size: 10, font: bold, color: ink });
    y -= 16;
    const thumb = 72;
    const yRow = y;
    let ix = margin;
    for (const [base, caption, altLine] of [
      [assetBasename(kit.powderSwatch), "Powder", kit.altPowderTexture],
      [assetBasename(kit.creamSwatch), "Cream", kit.altCreamTexture],
    ] as const) {
      const img = await tryEmbedRaster(pdf, base);
      const bottom = yRow - thumb;
      if (img) {
        const scale = thumb / img.height;
        const iw = img.width * scale;
        page.drawImage(img, { x: ix, y: bottom, width: iw, height: thumb });
        page.drawText(caption, { x: ix, y: bottom - 11, size: 7, font: bold, color: gold });
        drawParagraph(page, altLine, {
          x: ix,
          y: bottom - 22,
          size: 6,
          font,
          color: muted,
          maxWidth: 28,
          lineHeight: 8,
        });
        ix += iw + 20;
      } else {
        page.drawRectangle({
          x: ix,
          y: bottom,
          width: thumb,
          height: thumb,
          color: rgb(0.94, 0.92, 0.88),
          borderColor: gold,
          borderWidth: 0.6,
        });
        page.drawText(caption, { x: ix + 22, y: bottom + thumb / 2 - 3, size: 8, font: bold, color: ink });
        drawParagraph(page, altLine, {
          x: ix,
          y: bottom - 12,
          size: 6,
          font,
          color: muted,
          maxWidth: 28,
          lineHeight: 8,
        });
        ix += thumb + 20;
      }
    }
    y = yRow - thumb - 44;
  }

  if (analysis) {
    needY(100);
    page.drawText("Complexion profile", { x: margin, y, size: 11, font: bold, color: ink });
    y -= 16;
    y = drawParagraph(page, `${analysis.undertone} undertone · ${analysis.depth} depth · source ${analysis.analysisSource}`, {
      x: margin,
      y,
      size: 10,
      font,
      color: ink,
      maxWidth: 72,
      lineHeight: 13,
    });
    y -= 10;
  }

  const stylingResolved = analysis
    ? analysis.styling ?? completeStylingProfile(undefined, undertoneOrNeutral(analysis.undertone))
    : null;
  if (stylingResolved) {
    needY(120);
    page.drawText("Personal stylist layer", { x: margin, y, size: 11, font: bold, color: ink });
    y -= 16;
    y = drawParagraph(page, `Gender presentation read: ${stylingResolved.genderPresentation}`, {
      x: margin,
      y,
      size: 9,
      font,
      color: muted,
      maxWidth: 72,
      lineHeight: 12,
    });
    y -= 6;
    y = drawParagraph(page, `Eyes: ${stylingResolved.eyeColorHint}`, {
      x: margin,
      y,
      size: 9,
      font,
      color: ink,
      maxWidth: 72,
      lineHeight: 12,
    });
    y -= 6;
    y = drawParagraph(page, `Colour season: ${stylingResolved.colorSeason}`, {
      x: margin,
      y,
      size: 9,
      font: bold,
      color: gold,
      maxWidth: 72,
      lineHeight: 12,
    });
    y -= 6;
    y = drawParagraph(page, `Hair: ${stylingResolved.hairColorAnalysis}`, {
      x: margin,
      y,
      size: 9,
      font,
      color: ink,
      maxWidth: 72,
      lineHeight: 12,
    });
    y -= 6;
    y = drawParagraph(page, `Palette: ${stylingResolved.clothingPalette.join(", ")}`, {
      x: margin,
      y,
      size: 9,
      font,
      color: ink,
      maxWidth: 72,
      lineHeight: 12,
    });
    y -= 6;
    y = drawParagraph(page, `Daily motivation: ${stylingResolved.dailyMotivation}`, {
      x: margin,
      y,
      size: 9,
      font,
      color: ink,
      maxWidth: 72,
      lineHeight: 12,
    });
    if (stylingResolved.genderPresentation === "male") {
      y -= 6;
      y = drawParagraph(page, `Masculine grooming: ${stylingResolved.masculineGrooming}`, {
        x: margin,
        y,
        size: 9,
        font,
        color: ink,
        maxWidth: 72,
        lineHeight: 12,
      });
    }
    y -= 10;
    y = drawParagraph(page, "Designed and Invented by Casa Kilicé", {
      x: margin,
      y,
      size: 7,
      font: bold,
      color: gold,
      maxWidth: 72,
      lineHeight: 10,
    });
    y -= 14;
  }

  needY(120);
  page.drawText("Your Casa Kilicé narrative", { x: margin, y, size: 11, font: bold, color: ink });
  y -= 16;
  y = drawParagraph(page, input.aiRecommendation.replace(/\*\*/g, ""), {
    x: margin,
    y,
    size: 10,
    font,
    color: ink,
    maxWidth: 72,
    lineHeight: 13,
  });
  y -= 14;

  if (analysis?.routineHints?.length) {
    needY(100);
    page.drawText("Multi-use ritual · product intelligence", { x: margin, y, size: 11, font: bold, color: ink });
    y -= 16;
    for (const h of analysis.routineHints) {
      needY(80);
      y = drawParagraph(page, `• ${h.replace(/\*\*/g, "")}`, { x: margin, y, size: 9, font, color: ink, maxWidth: 72, lineHeight: 12 });
      y -= 6;
    }
    y -= 10;
  }

  const w = analysis?.wellness;
  if (w) {
    needY(140);
    page.drawText("Holistic wellness protocol", { x: margin, y, size: 11, font: bold, color: ink });
    y -= 16;
    y = drawParagraph(page, `Texture: ${w.texture.summary}`, { x: margin, y, size: 9, font, color: ink, maxWidth: 72, lineHeight: 12 });
    y -= 8;
    needY(80);
    y = drawParagraph(
      page,
      `Hydration: ${w.signals.hydration} · Elasticity: ${w.signals.elasticity} · Fatigue: ${w.signals.fatigue}`,
      { x: margin, y, size: 9, font, color: ink, maxWidth: 72, lineHeight: 12 },
    );
    y -= 10;
    needY(120);
    page.drawText("Skincare", { x: margin, y, size: 10, font: bold, color: ink });
    y -= 14;
    y = drawParagraph(page, w.skincare.routine, { x: margin, y, size: 9, font, color: ink, maxWidth: 72, lineHeight: 12 });
    y -= 6;
    y = drawParagraph(page, `Cleansing: ${w.skincare.cleansingFrequency}`, { x: margin, y, size: 9, font, color: ink, maxWidth: 72, lineHeight: 12 });
    y -= 6;
    y = drawParagraph(page, `Actives: ${w.skincare.actives}`, { x: margin, y, size: 9, font, color: ink, maxWidth: 72, lineHeight: 12 });
    y -= 12;
    if (w.casaKiliceMultiUse) {
      needY(100);
      page.drawText("Casa Kilicé · magazine edit · multi-use", { x: margin, y, size: 10, font: bold, color: gold });
      y -= 14;
      y = drawParagraph(page, w.casaKiliceMultiUse, { x: margin, y, size: 9, font, color: ink, maxWidth: 72, lineHeight: 12 });
      y -= 12;
    }
    needY(100);
    page.drawText("Nutrition & supplements (discussion only)", { x: margin, y, size: 10, font: bold, color: ink });
    y -= 14;
    y = drawParagraph(page, w.supplements.suggestions.map((s) => `• ${s}`).join(" "), {
      x: margin,
      y,
      size: 9,
      font,
      color: ink,
      maxWidth: 72,
      lineHeight: 12,
    });
    y -= 6;
    y = drawParagraph(page, w.supplements.note, { x: margin, y, size: 9, font, color: muted, maxWidth: 72, lineHeight: 12 });
    y -= 12;
    needY(90);
    page.drawText("Lifestyle", { x: margin, y, size: 10, font: bold, color: ink });
    y -= 14;
    y = drawParagraph(
      page,
      `Sleep: ${w.lifestyle.sleepHours} · Exercise: ${w.lifestyle.exercise} · Nutrition: ${w.lifestyle.nutrition}`,
      { x: margin, y, size: 9, font, color: ink, maxWidth: 72, lineHeight: 12 },
    );
    y -= 12;
    needY(90);
    page.drawText("Sun safety", { x: margin, y, size: 10, font: bold, color: ink });
    y -= 14;
    y = drawParagraph(page, `${w.sunSafety.spfGuidance} ${w.sunSafety.tanningAdvice}`, {
      x: margin,
      y,
      size: 9,
      font,
      color: ink,
      maxWidth: 72,
      lineHeight: 12,
    });
    y -= 6;
    y = drawParagraph(page, w.sunSafety.uvIndexContext, { x: margin, y, size: 9, font, color: ink, maxWidth: 72, lineHeight: 12 });
    y -= 20;
  }

  needY(90);
  page.drawText("Medical notice", { x: margin, y, size: 10, font: bold, color: gold });
  y -= 14;
  drawParagraph(page, MEDICAL_DISCLAIMER_EN, { x: margin, y, size: 8, font, color: muted, maxWidth: 76, lineHeight: 11 });

  return pdf.save();
}
