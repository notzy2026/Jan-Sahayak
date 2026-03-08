/**
 * pdfgen.js — PDF generation utility for Jan Sahayak
 *
 * Dependencies: pdf-lib, @pdf-lib/fontkit (both already in package.json)
 *
 * Exports:
 *   generateApplicationPDF(schemeId, userData, extractedData) → Uint8Array
 *   generateResultsSummaryPDF(schemes, userProfile)           → Uint8Array
 *   downloadPDF(pdfBytes, filename)                           → void
 */

import { PDFDocument, rgb, StandardFonts } from 'pdf-lib'
import fontkit from '@pdf-lib/fontkit'

// ─── Colours ──────────────────────────────────────────────────────────────────
const SAFFRON = rgb(1, 0.42, 0)        // #FF6B00
const NAVY    = rgb(0.07, 0.27, 0.52)  // Government blue
const DARK    = rgb(0.15, 0.15, 0.15)
const GRAY    = rgb(0.45, 0.45, 0.45)
const WHITE   = rgb(1, 1, 1)
const GREEN   = rgb(0.1, 0.6, 0.2)

// ─── Font loader (tries Noto Sans for Hindi support, falls back to Helvetica) ─
const NOTO_SANS_URL =
  'https://cdn.jsdelivr.net/npm/@fontsource/noto-sans-devanagari@5.0.8/files/noto-sans-devanagari-devanagari-400-normal.woff2'

async function loadHindiFont(pdfDoc) {
  try {
    pdfDoc.registerFontkit(fontkit)
    const resp = await fetch(NOTO_SANS_URL)
    if (!resp.ok) throw new Error('Font fetch failed')
    const fontBytes = await resp.arrayBuffer()
    return await pdfDoc.embedFont(fontBytes)
  } catch {
    // Fallback: Helvetica (ASCII only — Hindi chars will be omitted gracefully)
    return await pdfDoc.embedFont(StandardFonts.Helvetica)
  }
}

// ─── Helpers ──────────────────────────────────────────────────────────────────
function randomRef() {
  return 'JS-' + Date.now().toString(36).toUpperCase() + '-' +
    Math.floor(Math.random() * 9000 + 1000)
}

function todayString() {
  return new Date().toLocaleDateString('en-IN', {
    day: '2-digit', month: 'long', year: 'numeric',
  })
}

/**
 * Draw a section heading with an underline
 */
function drawSectionHeading(page, text, y, font, { width = 545 } = {}) {
  page.drawRectangle({
    x: 28, y: y - 3, width: width, height: 18,
    color: rgb(0.98, 0.95, 0.90),
  })
  page.drawText(text, { x: 32, y, font, size: 10, color: NAVY })
  page.drawLine({
    start: { x: 28, y: y - 4 },
    end: { x: 28 + width, y: y - 4 },
    thickness: 0.5, color: SAFFRON,
  })
  return y - 22
}

/**
 * Draw a labelled field row
 */
function drawField(page, label, value, x, y, labelFont, valueFont, colWidth = 260) {
  page.drawText(label + ':', { x, y, font: labelFont, size: 9, color: GRAY })
  page.drawText(String(value || '—'), {
    x: x + colWidth * 0.45, y, font: valueFont, size: 9, color: DARK,
  })
  return y - 16
}

// ─── Main: Application PDF ────────────────────────────────────────────────────
/**
 * generateApplicationPDF
 * @param {object} scheme        - The scheme object containing formFields
 * @param {object} userData      – from Zustand store (answers)
 * @param {object} extractedData – OCR-extracted fields from DocumentUpload (now includes dummy data from UI)
 * @returns {Promise<Uint8Array>}
 */
export async function generateApplicationPDF(scheme, userData = {}, extractedData = {}) {
  const schemeId = scheme.id;
  const pdfDoc   = await PDFDocument.create()
  const hindiFont = await loadHindiFont(pdfDoc)
  const boldFont  = await pdfDoc.embedFont(StandardFonts.HelveticaBold)
  const regFont   = await pdfDoc.embedFont(StandardFonts.Helvetica)

  // A4 page: 595 × 842 pt
  const page = pdfDoc.addPage([595, 842])
  const { width, height } = page.getSize()

  // ── HEADER ──────────────────────────────────────────────────────────────────
  // Top bar
  page.drawRectangle({ x: 0, y: height - 70, width, height: 70, color: NAVY })

  // Government of India emblem (text placeholder)
  page.drawText('🏛', { x: 25, y: height - 48, font: hindiFont, size: 28, color: WHITE })

  // Title
  page.drawText('GOVERNMENT OF INDIA / भारत सरकार', {
    x: 65, y: height - 28, font: boldFont, size: 11, color: WHITE,
  })
  page.drawText('Jan Sahayak — Welfare Scheme Application', {
    x: 65, y: height - 43, font: regFont, size: 9, color: rgb(0.85, 0.85, 0.85),
  })

  // Date (right-aligned)
  const dateStr = todayString()
  page.drawText('Date: ' + dateStr, {
    x: width - 150, y: height - 28, font: regFont, size: 8, color: rgb(0.8, 0.8, 0.8),
  })

  // Scheme name strip
  const schemeName_en =
    schemeId === 'pm-kisan'    ? 'PM-KISAN — Pradhan Mantri Kisan Samman Nidhi' :
    schemeId === 'ayushman'    ? 'Ayushman Bharat — PM Jan Arogya Yojana' :
    schemeId === 'pm-awas'     ? 'Pradhan Mantri Awas Yojana (Gramin)' :
    schemeId === 'pmfby'       ? 'Pradhan Mantri Fasal Bima Yojana' :
    schemeId === 'mudra'       ? 'Pradhan Mantri Mudra Yojana (Shishu)' :
    schemeId === 'kcc'         ? 'Kisan Credit Card (KCC)' :
    schemeId === 'udid'        ? 'Unique Disability ID (UDID) Scheme' :
    'Government Welfare Scheme'

  const schemeName_hi =
    schemeId === 'pm-kisan'    ? 'पीएम-किसान' :
    schemeId === 'ayushman'    ? 'आयुष्मान भारत' :
    schemeId === 'pm-awas'     ? 'पीएम आवास योजना' :
    schemeId === 'pmfby'       ? 'प्रधानमंत्री फसल बीमा योजना' :
    schemeId === 'mudra'       ? 'मुद्रा लोन (शिशु)' :
    schemeId === 'kcc'         ? 'किसान क्रेडिट कार्ड' :
    schemeId === 'udid'        ? 'यूडीआईडी (दिव्यांग पहचान)' :
    'सरकारी योजना'

  page.drawRectangle({ x: 0, y: height - 95, width, height: 25, color: rgb(0.99, 0.96, 0.92) })
  page.drawText(`${schemeName_hi}  |  ${schemeName_en}`, {
    x: 28, y: height - 87, font: boldFont, size: 10, color: SAFFRON,
  })

  // ── BODY ────────────────────────────────────────────────────────────────────
  let y = height - 120

  // --- Application Details ---
  y = drawSectionHeading(page, 'APPLICATION DETAILS / आवेदन विवरण', y, boldFont)

  const leftX = 28, rightX = 315;
  let currentYLeft = y;
  let currentYRight = y;

  if (scheme && scheme.formFields) {
    scheme.formFields.forEach((field, index) => {
      // Determine value: prefer extractedData (which holds our dummy UI values), fallback to userData, or default
      let val = extractedData[field.id] || userData[field.id] || '—';

      // Draw in two columns
      if (index % 2 === 0) {
        currentYLeft = drawField(page, field.label, String(val), leftX, currentYLeft, boldFont, regFont);
      } else {
        currentYRight = drawField(page, field.label, String(val), rightX, currentYRight, boldFont, regFont);
      }
    });
  } else {
    // Fallback if no formFields array exists
    currentYLeft = drawField(page, 'Applicant Name', extractedData?.applicantName || '—', leftX, currentYLeft, boldFont, regFont);
  }

  y = Math.min(currentYLeft, currentYRight) - 14;

  // Declaration box
  page.drawRectangle({ x: 28, y: y - 38, width: width - 56, height: 42, color: rgb(0.97, 0.97, 0.97), borderColor: rgb(0.8, 0.8, 0.8), borderWidth: 0.5 })
  page.drawText('DECLARATION: I hereby declare that all the information provided above is true and correct to the best of my knowledge.', {
    x: 35, y: y - 14, font: regFont, size: 7.5, color: GRAY, maxWidth: width - 70,
  })
  page.drawText('घोषणा: मैं घोषणा करता/करती हूँ कि ऊपर दी गई सभी जानकारी सत्य एवं सही है।', {
    x: 35, y: y - 28, font: hindiFont || regFont, size: 7.5, color: GRAY,
  })
  y -= 55

  // Signature line
  page.drawLine({ start: { x: 28, y }, end: { x: 200, y }, thickness: 0.5, color: DARK })
  page.drawText('Signature / हस्ताक्षर', { x: 75, y: y - 12, font: regFont, size: 8, color: GRAY })

  // ── FOOTER ──────────────────────────────────────────────────────────────────
  const refNo = randomRef()

  page.drawRectangle({ x: 0, y: 0, width, height: 40, color: rgb(0.95, 0.95, 0.95) })
  page.drawLine({ start: { x: 0, y: 40 }, end: { x: width, y: 40 }, thickness: 0.5, color: rgb(0.8, 0.8, 0.8) })

  page.drawText('Generated by Jan-Sahayak | jan-sahayak-demo.vercel.app', {
    x: 28, y: 26, font: regFont, size: 7.5, color: GRAY,
  })
  page.drawText(`Ref: ${refNo}`, { x: 28, y: 13, font: boldFont, size: 7.5, color: NAVY })

  // QR code placeholder (box)
  page.drawRectangle({ x: width - 62, y: 4, width: 58, height: 32, color: WHITE, borderColor: GRAY, borderWidth: 0.5 })
  page.drawText('[QR]', { x: width - 48, y: 15, font: regFont, size: 8, color: GRAY })

  return await pdfDoc.save()
}

// ─── Results Summary PDF ──────────────────────────────────────────────────────
/**
 * generateResultsSummaryPDF
 * One-page summary designed to be printed and taken to a CSC center.
 *
 * @param {Array}  schemes      – array of scheme objects from mockSchemes.js
 * @param {object} userProfile  – { name, state, q2, q3 }
 * @returns {Promise<Uint8Array>}
 */
export async function generateResultsSummaryPDF(schemes = [], userProfile = {}) {
  const pdfDoc  = await PDFDocument.create()
  const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold)
  const regFont  = await pdfDoc.embedFont(StandardFonts.Helvetica)

  const hindiFont = await loadHindiFont(pdfDoc)

  const page = pdfDoc.addPage([595, 842])
  const { width, height } = page.getSize()

  // Header
  page.drawRectangle({ x: 0, y: height - 60, width, height: 60, color: NAVY })
  page.drawText('Jan Sahayak — Eligible Schemes Summary', {
    x: 28, y: height - 28, font: boldFont, size: 13, color: WHITE,
  })
  page.drawText('जन-सहायक — पात्र योजनाएं सारांश | Generated: ' + todayString(), {
    x: 28, y: height - 46, font: regFont, size: 8, color: rgb(0.8, 0.8, 0.8),
  })

  // User profile strip
  page.drawRectangle({ x: 0, y: height - 85, width, height: 25, color: rgb(0.98, 0.95, 0.90) })
  page.drawText(
    `Applicant: ${userProfile.name || 'User'} | State: ${userProfile.state || '—'} | Occupation: ${userProfile.q2 || '—'}`,
    { x: 28, y: height - 77, font: regFont, size: 8.5, color: DARK }
  )

  // Table header
  let y = height - 105
  const COL = { scheme: 28, benefit: 215, helpline: 320, how: 415 }

  page.drawRectangle({ x: 28, y: y - 4, width: width - 56, height: 18, color: SAFFRON })
  page.drawText('Scheme Name', { x: COL.scheme, y, font: boldFont, size: 9, color: WHITE })
  page.drawText('Benefit', { x: COL.benefit, y, font: boldFont, size: 9, color: WHITE })
  page.drawText('Helpline', { x: COL.helpline, y, font: boldFont, size: 9, color: WHITE })
  page.drawText('How to Apply',{ x: COL.how, y, font: boldFont, size: 9, color: WHITE })
  y -= 18

  // Table rows
  schemes.forEach((s, i) => {
    const bg = i % 2 === 0 ? WHITE : rgb(0.97, 0.97, 0.97)
    page.drawRectangle({ x: 28, y: y - 6, width: width - 56, height: 22, color: bg })

    const name = s.name_en || s.name_hi || 'Unknown'
    const benefit = s.benefitLabel_en || s.benefitLabel || '—'
    const how = s.mode === 'online' ? 'Online Portal' : 'Offline / CSC'

    page.drawText(name.length > 28 ? name.slice(0, 26) + '…' : name,
      { x: COL.scheme, y: y + 4, font: boldFont, size: 8, color: DARK })
    page.drawText(benefit,     { x: COL.benefit,  y: y + 4, font: regFont, size: 8, color: GREEN })
    page.drawText(s.helpline,  { x: COL.helpline, y: y + 4, font: regFont, size: 8, color: DARK })
    page.drawText(how,         { x: COL.how,      y: y + 4, font: boldFont, size: 8,
      color: s.mode === 'online' ? SAFFRON : NAVY })

    y -= 22
  })

  // Divider
  y -= 8
  page.drawLine({ start: { x: 28, y }, end: { x: width - 28, y }, thickness: 0.4, color: rgb(0.8, 0.8, 0.8) })
  y -= 14

  // Instructions box  
  page.drawRectangle({ x: 28, y: y - 54, width: width - 56, height: 60, color: rgb(0.92, 0.97, 0.92), borderColor: GREEN, borderWidth: 0.5 })
  page.drawText('📌 Show this printout at your nearest CSC (Common Service Centre) to apply offline.',
    { x: 35, y: y - 10, font: boldFont, size: 9, color: rgb(0.1, 0.5, 0.1), maxWidth: width - 75 })
  page.drawText('• CSC Locator: findmycsc.org  |  • National Helpline: 14545  |  • All documents: bring originals + photocopies',
    { x: 35, y: y - 28, font: regFont, size: 8, color: DARK, maxWidth: width - 75 })
  page.drawText('यह प्रिंटआउट अपने नजदीकी CSC केंद्र या तहसील कार्यालय में ले जाएं।',
    { x: 35, y: y - 44, font: hindiFont || regFont, size: 8, color: GRAY })

  // Footer
  page.drawRectangle({ x: 0, y: 0, width, height: 30, color: rgb(0.95, 0.95, 0.95) })
  page.drawText('Generated by Jan-Sahayak | jan-sahayak-demo.vercel.app | Ref: ' + randomRef(),
    { x: 28, y: 10, font: regFont, size: 7.5, color: GRAY })

  return await pdfDoc.save()
}

// ─── Download helper ──────────────────────────────────────────────────────────
/**
 * downloadPDF
 * Creates a blob URL from raw PDF bytes and triggers browser download.
 *
 * @param {Uint8Array} pdfBytes
 * @param {string}     filename  – e.g. "pm-kisan-application.pdf"
 */
export function downloadPDF(pdfBytes, filename = 'jan-sahayak.pdf') {
  const blob = new Blob([pdfBytes], { type: 'application/pdf' })
  const url  = URL.createObjectURL(blob)
  const a    = document.createElement('a')
  a.href     = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  // Revoke after short delay to allow download to start
  setTimeout(() => URL.revokeObjectURL(url), 3000)
}
