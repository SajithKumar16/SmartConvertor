const express = require('express');
const cors = require('cors');
const multer = require('multer');
const sharp = require('sharp');
const fs = require('fs');
const path = require('path');
const os = require('os');
const { execFile } = require('child_process');
const util = require('util');
const execFileAsync = util.promisify(execFile);
const { PDFDocument, StandardFonts, rgb } = require('pdf-lib');
const JSZip = require('jszip');
const mammoth = require('mammoth');
const { Document, Packer, Paragraph, TextRun } = require('docx');

const app = express();
app.set('trust proxy', 1);
app.use(cors({ exposedHeaders: ['Content-Disposition', 'X-Preview-URL'] }));
app.use(express.json());
const writableBaseDir = process.env.VERCEL ? os.tmpdir() : __dirname;
const downloadsDir = path.join(writableBaseDir, 'downloads');
app.use('/downloads', express.static(downloadsDir));
require('dotenv').config();
const nodemailer = require('nodemailer');

const SUPPORTED_TOOLS = [
  'image',
  'img-to-pdf',
  'pdf-to-docx',
  'docx-to-pdf',
  'txt-to-pdf',
  'compress-pdf',
  'merge-pdf',
  'split-pdf',
  'ocr'
];

// Health & root status endpoints
app.get('/', (req, res) => {
  res.json({
    status: 'ok',
    service: 'SmartConvert API',
    version: '2.5.0',
    supportedFormats: SUPPORTED_TOOLS
  });
});

app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    version: '2.5.0',
    supportedFormats: SUPPORTED_TOOLS
  });
});

app.post('/api/contact', async (req, res) => {
  const { email, subject, message } = req.body;

  if (!email || !message) {
    return res.status(400).json({ error: 'Please provide both your email address and message.' });
  }

  const cleanPass = process.env.EMAIL_PASS ? process.env.EMAIL_PASS.replace(/\s+/g, '') : '';
  let emailDelivered = false;

  if (process.env.EMAIL_USER && cleanPass) {
    try {
      const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
          user: process.env.EMAIL_USER,
          pass: cleanPass
        }
      });

      await transporter.sendMail({
        from: `"${email}" <${process.env.EMAIL_USER}>`,
        to: process.env.EMAIL_USER,
        replyTo: email,
        subject: `SmartConvertor Contact Form: ${subject || 'No Subject'}`,
        text: `You received a new message from the SmartConvertor Contact Form.\n\nFrom: ${email}\n\nSubject: ${subject || 'No Subject'}\n\nMessage:\n${message}`
      });

      emailDelivered = true;
      console.log(`[Contact Form] Email sent successfully to ${process.env.EMAIL_USER}`);
    } catch (error) {
      console.warn('[Contact Form] Gmail SMTP Notice (Check App Password):', error.message);
    }
  }

  // Record messages locally for resilience
  try {
    const messagesFile = path.join(writableBaseDir, 'contact_messages.json');
    let messages = [];
    if (fs.existsSync(messagesFile)) {
      try {
        messages = JSON.parse(fs.readFileSync(messagesFile, 'utf8'));
      } catch (e) {
        messages = [];
      }
    }
    messages.unshift({
      date: new Date().toISOString(),
      email,
      subject: subject || 'No Subject',
      message,
      emailDelivered
    });
    fs.writeFileSync(messagesFile, JSON.stringify(messages.slice(0, 100), null, 2));
  } catch (err) {
    console.error('Failed to save contact message locally:', err);
  }

  res.json({
    success: true,
    message: emailDelivered
      ? 'Message sent successfully! Our team will respond shortly.'
      : 'Message received and saved! We will get in touch shortly.'
  });
});

// Set up storage with upload.any() to handle both 'file' and 'files'
const storage = multer.memoryStorage();
const upload = multer({
  storage: storage,
  limits: { fileSize: 100 * 1024 * 1024 } // 100MB
});

// Shared helper: Sanitize text against the actual WinAnsi font encoder & render paginated A4 PDF
function sanitizeForPdfFont(rawText, font) {
  const normalized = (rawText || '')
    .replace(/^\uFEFF/, '')
    .replace(/\t/g, '    ')
    .replace(/\u00A0/g, ' ')
    .replace(/[\u200B-\u200D\u00AD\u2028\u2029]/g, '')
    .replace(/[\u2018\u2019]/g, "'")
    .replace(/[\u201C\u201D]/g, '"')
    .replace(/[\u2013\u2014]/g, '-')
    .replace(/\u2026/g, '...');

  const validCharCache = new Map();
  let safe = '';
  for (const ch of normalized) {
    if (ch === '\n' || ch === '\r') {
      safe += ch;
      continue;
    }
    let ok = validCharCache.get(ch);
    if (ok === undefined) {
      try {
        font.encodeText(ch);
        ok = true;
      } catch {
        ok = false;
      }
      validCharCache.set(ch, ok);
    }
    safe += ok ? ch : ' ';
  }
  return safe;
}

function extractReadableTextFromHtmlOrPlain(rawBuffer) {
  const content = rawBuffer.toString('utf-8');
  if (/<html|<body|<p|<div|<br/i.test(content)) {
    return content
      .replace(/<head[\s\S]*?<\/head>/gi, ' ')
      .replace(/<style[\s\S]*?<\/style>/gi, ' ')
      .replace(/<script[\s\S]*?<\/script>/gi, ' ')
      .replace(/<(?:br|\/p|\/div|\/tr|\/li|\/h[1-6])\b[^>]*>/gi, '\n')
      .replace(/<[^>]+>/g, ' ')
      .replace(/&nbsp;/gi, ' ')
      .replace(/&amp;/gi, '&')
      .replace(/&lt;/gi, '<')
      .replace(/&gt;/gi, '>')
      .replace(/&quot;/gi, '"')
      .replace(/&#39;/gi, "'")
      .replace(/[ \t]+\n/g, '\n')
      .replace(/\n{3,}/g, '\n\n')
      .trim();
  }
  return content.trim();
}

async function renderTextToPdfBuffer(rawText) {
  const pdfDoc = await PDFDocument.create();
  const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const text = sanitizeForPdfFont(rawText, font);

  const rawLines = text.split(/\r?\n/);
  let page = pdfDoc.addPage([595.28, 841.89]); // A4
  let y = 790;
  const margin = 50;
  const fontSize = 10.5;
  const lineHeight = 15;
  const maxWidth = 595.28 - margin * 2;

  const writeLine = (lineStr) => {
    if (y < margin) {
      page = pdfDoc.addPage([595.28, 841.89]);
      y = 790;
    }
    page.drawText(lineStr, { x: margin, y, size: fontSize, font, color: rgb(0.12, 0.12, 0.12) });
    y -= lineHeight;
  };

  for (const rawLine of rawLines) {
    if (!rawLine.trim()) {
      y -= lineHeight;
      if (y < margin) {
        page = pdfDoc.addPage([595.28, 841.89]);
        y = 790;
      }
      continue;
    }

    const words = rawLine.split(' ');
    let line = '';
    for (const word of words) {
      const testLine = line ? `${line} ${word}` : word;
      if (font.widthOfTextAtSize(testLine, fontSize) > maxWidth) {
        if (line) {
          writeLine(line);
          line = '';
        }
        // Handle single ultra-long words/URLs wider than maxWidth
        if (font.widthOfTextAtSize(word, fontSize) > maxWidth) {
          let chunk = '';
          for (const ch of word) {
            if (font.widthOfTextAtSize(chunk + ch, fontSize) > maxWidth && chunk) {
              writeLine(chunk);
              chunk = ch;
            } else {
              chunk += ch;
            }
          }
          line = chunk;
        } else {
          line = word;
        }
      } else {
        line = testLine;
      }
    }
    if (line) {
      writeLine(line);
    }
  }

  return Buffer.from(await pdfDoc.save());
}

// Helper: Convert DOCX to PDF (supports standard ZIP OOXML .docx, HTML-saved .docx, and local Word)
async function convertDocxToPdf(docxBuffer) {
  const isZipDocx = docxBuffer.length >= 2 && docxBuffer[0] === 0x50 && docxBuffer[1] === 0x4b; // 'PK'
  const isLegacyBinaryDoc =
    docxBuffer.length >= 4 &&
    docxBuffer[0] === 0xd0 &&
    docxBuffer[1] === 0xcf &&
    docxBuffer[2] === 0x11 &&
    docxBuffer[3] === 0xe0;

  if (isLegacyBinaryDoc) {
    throw new Error('Legacy binary .doc files are not supported in cloud mode. Please save as modern .docx and retry.');
  }

  const pythonExe = path.join(__dirname, 'venv', 'Scripts', 'python.exe');
  if (isZipDocx && fs.existsSync(pythonExe)) {
    const tempDir = os.tmpdir();
    const uniqueId = `docx_${Date.now()}_${Math.random().toString(36).substring(7)}`;
    const inPath = path.join(tempDir, `${uniqueId}.docx`);
    const outPath = path.join(tempDir, `${uniqueId}.pdf`);
    fs.writeFileSync(inPath, docxBuffer);

    const pyCode = `
from docx2pdf import convert
convert(r"${inPath.replace(/\\/g, '\\\\')}", r"${outPath.replace(/\\/g, '\\\\')}")
    `.trim();

    try {
      await execFileAsync(pythonExe, ['-c', pyCode], { timeout: 30000 });
      if (fs.existsSync(outPath)) {
        return fs.readFileSync(outPath);
      }
    } catch (err) {
      console.warn('Python docx2pdf fallback to mammoth:', err.message);
    } finally {
      try { if (fs.existsSync(inPath)) fs.unlinkSync(inPath); } catch (e) {}
      try { if (fs.existsSync(outPath)) fs.unlinkSync(outPath); } catch (e) {}
    }
  }

  let text = '';
  if (isZipDocx) {
    try {
      const result = await mammoth.extractRawText({ buffer: docxBuffer });
      text = result.value || '';
    } catch (err) {
      console.warn('Mammoth failed, falling back to HTML/plain parser:', err.message);
      text = extractReadableTextFromHtmlOrPlain(docxBuffer);
    }
  } else {
    // Handle HTML-exported .docx files (e.g. legacy pdf-to-docx exports) or plain-text .docx
    text = extractReadableTextFromHtmlOrPlain(docxBuffer);
  }

  return await renderTextToPdfBuffer(text.trim() || 'Document converted from DOCX (no text content).');
}

// Helper: Convert PDF to DOCX (Python pdf2docx if available, pure Node pdfreader + docx everywhere)
async function convertPdfToDocx(pdfBuffer) {
  const pythonExe = path.join(__dirname, 'venv', 'Scripts', 'python.exe');
  if (fs.existsSync(pythonExe)) {
    const tempDir = os.tmpdir();
    const uniqueId = `pdf_${Date.now()}_${Math.random().toString(36).substring(7)}`;
    const inPath = path.join(tempDir, `${uniqueId}.pdf`);
    const outPath = path.join(tempDir, `${uniqueId}.docx`);
    fs.writeFileSync(inPath, pdfBuffer);

    const pyCode = `
from pdf2docx import Converter
cv = Converter(r"${inPath.replace(/\\/g, '\\\\')}")
cv.convert(r"${outPath.replace(/\\/g, '\\\\')}")
cv.close()
    `.trim();

    try {
      await execFileAsync(pythonExe, ['-c', pyCode], { timeout: 30000 });
      if (fs.existsSync(outPath)) {
        return fs.readFileSync(outPath);
      }
    } catch (err) {
      console.warn('Python pdf2docx fallback to pure Node docx:', err.message);
    } finally {
      try { if (fs.existsSync(inPath)) fs.unlinkSync(inPath); } catch (e) {}
      try { if (fs.existsSync(outPath)) fs.unlinkSync(outPath); } catch (e) {}
    }
  }

  // Cross-platform pure Node.js binary .docx generation using pdfreader + docx
  const { PdfReader } = require('pdfreader');
  const extractedText = await new Promise((resolve, reject) => {
    let textContent = '';
    let lastY = null;
    new PdfReader().parseBuffer(pdfBuffer, (err, item) => {
      if (err) reject(err);
      else if (!item) resolve(textContent.trim() || 'No extractable text found in PDF.');
      else if (item.text) {
        if (lastY !== null && Math.abs(item.y - lastY) > 0.5) textContent += '\n';
        textContent += item.text + ' ';
        lastY = item.y;
      }
    });
  });

  const paragraphs = extractedText
    .split('\n')
    .map(line => line.trim())
    .filter(Boolean)
    .map(line => new Paragraph({
      children: [new TextRun({ text: line, size: 22 })],
      spacing: { after: 120 }
    }));

  const doc = new Document({
    sections: [{
      properties: {},
      children: paragraphs.length > 0 ? paragraphs : [new Paragraph('Empty PDF document.')]
    }]
  });

  return await Packer.toBuffer(doc);
}

// Main Conversion Handler
app.post('/api/convert', upload.any(), async (req, res) => {
  try {
    const uploadedFiles = req.files || [];
    if (uploadedFiles.length === 0) {
      return res.status(400).json({ error: 'No file uploaded. Please select a file.' });
    }

    const { targetFormat } = req.body;
    if (!targetFormat) {
      return res.status(400).json({ error: 'Target format not specified' });
    }

    const primaryFile = uploadedFiles[0];
    const originalName = primaryFile.originalname;
    const extension = path.extname(originalName).toLowerCase();
    const buffer = primaryFile.buffer;

    let convertedBuffer;
    let mimeType;
    let newExtension = targetFormat.toLowerCase();

    // 1. Image Conversions
    if (['jpg', 'png', 'webp'].includes(newExtension) && ['.jpg', '.jpeg', '.png', '.webp', '.bmp', '.svg'].includes(extension)) {
      if (newExtension === 'jpg') {
        convertedBuffer = await sharp(buffer).jpeg({ quality: 90 }).toBuffer();
        mimeType = 'image/jpeg';
      } else if (newExtension === 'png') {
        convertedBuffer = await sharp(buffer).png().toBuffer();
        mimeType = 'image/png';
      } else if (newExtension === 'webp') {
        convertedBuffer = await sharp(buffer).webp({ quality: 85 }).toBuffer();
        mimeType = 'image/webp';
      }
    }
    // 2. Image to PDF
    else if (targetFormat === 'img-to-pdf') {
      newExtension = 'pdf';
      const pdfDoc = await PDFDocument.create();
      let image;
      try {
        if (extension === '.png') {
          image = await pdfDoc.embedPng(buffer);
        } else if (extension === '.jpg' || extension === '.jpeg') {
          image = await pdfDoc.embedJpg(buffer);
        } else {
          const pngBuffer = await sharp(buffer).png().toBuffer();
          image = await pdfDoc.embedPng(pngBuffer);
        }
      } catch (e) {
        const pngBuffer = await sharp(buffer).png().toBuffer();
        image = await pdfDoc.embedPng(pngBuffer);
      }
      const page = pdfDoc.addPage([image.width, image.height]);
      page.drawImage(image, { x: 0, y: 0, width: image.width, height: image.height });
      convertedBuffer = Buffer.from(await pdfDoc.save());
      mimeType = 'application/pdf';
    }
    // 3. OCR (Text Extraction)
    else if (targetFormat === 'ocr') {
      if (!['.jpg', '.jpeg', '.png', '.bmp', '.webp', '.tiff'].includes(extension)) {
        return res.status(400).json({ error: 'OCR supports image formats (JPG, PNG, WEBP, BMP).' });
      }
      newExtension = 'txt';
      const Tesseract = require('tesseract.js');
      const pngBuffer = await sharp(buffer).png().toBuffer();
      const worker = await Tesseract.createWorker('eng', 1, {
        cachePath: writableBaseDir
      });
      try {
        const { data: { text } } = await worker.recognize(pngBuffer);
        convertedBuffer = Buffer.from((text && text.trim()) ? text : 'No text recognized.', 'utf-8');
      } finally {
        await worker.terminate();
      }
      mimeType = 'text/plain; charset=utf-8';
    }
    // 4. Compress PDF
    else if (targetFormat === 'compress-pdf') {
      if (extension !== '.pdf') {
        return res.status(400).json({ error: 'Please upload a valid PDF file to compress.' });
      }
      newExtension = 'pdf';
      const pdfDoc = await PDFDocument.load(buffer, { ignoreEncryption: true });
      convertedBuffer = Buffer.from(await pdfDoc.save({ useObjectStreams: true }));
      mimeType = 'application/pdf';
    }
    // 5. PDF to DOCX
    else if (targetFormat === 'pdf-to-docx') {
      if (extension !== '.pdf') {
        return res.status(400).json({ error: 'Please upload a valid PDF file to convert.' });
      }
      newExtension = 'docx';
      convertedBuffer = await convertPdfToDocx(buffer);
      mimeType = 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
    }
    // 6. DOCX to PDF
    else if (targetFormat === 'docx-to-pdf') {
      if (!['.docx', '.doc'].includes(extension)) {
        return res.status(400).json({ error: 'Please upload a valid DOCX file to convert.' });
      }
      newExtension = 'pdf';
      convertedBuffer = await convertDocxToPdf(buffer);
      mimeType = 'application/pdf';
    }
    // 7. TXT to PDF
    else if (targetFormat === 'txt-to-pdf') {
      newExtension = 'pdf';
      const text = buffer.toString('utf-8');
      convertedBuffer = await renderTextToPdfBuffer(text);
      mimeType = 'application/pdf';
    }
    // 8. Merge Multiple PDFs
    else if (targetFormat === 'merge-pdf') {
      const pdfFiles = uploadedFiles.filter(f =>
        f.originalname.toLowerCase().endsWith('.pdf') || f.mimetype === 'application/pdf'
      );
      if (pdfFiles.length < 2) {
        return res.status(400).json({ error: 'Please select at least 2 valid PDF files to merge.' });
      }

      newExtension = 'pdf';
      const mergedDoc = await PDFDocument.create();
      for (const pFile of pdfFiles) {
        const donor = await PDFDocument.load(pFile.buffer, { ignoreEncryption: true });
        const pages = await mergedDoc.copyPages(donor, donor.getPageIndices());
        pages.forEach(p => mergedDoc.addPage(p));
      }
      convertedBuffer = Buffer.from(await mergedDoc.save());
      mimeType = 'application/pdf';
    }
    // 9. Split PDF Pages (Returns ZIP containing each page)
    else if (targetFormat === 'split-pdf') {
      if (extension !== '.pdf') {
        return res.status(400).json({ error: 'Please upload a valid PDF file to split.' });
      }

      newExtension = 'zip';
      const srcDoc = await PDFDocument.load(buffer, { ignoreEncryption: true });
      const pageCount = srcDoc.getPageCount();
      if (pageCount === 0) {
        return res.status(400).json({ error: 'The uploaded PDF has no pages to split.' });
      }

      const zip = new JSZip();
      const baseName = path.parse(originalName).name;

      for (let i = 0; i < pageCount; i++) {
        const singlePageDoc = await PDFDocument.create();
        const [copiedPage] = await singlePageDoc.copyPages(srcDoc, [i]);
        singlePageDoc.addPage(copiedPage);
        const singlePageBytes = await singlePageDoc.save();
        zip.file(`${baseName}_page_${i + 1}.pdf`, singlePageBytes);
      }

      convertedBuffer = await zip.generateAsync({ type: 'nodebuffer', compression: 'DEFLATE' });
      mimeType = 'application/zip';
    } else {
      return res.status(400).json({ error: `Unsupported conversion format: ${targetFormat}` });
    }

    const baseName = targetFormat === 'merge-pdf' ? 'merged_documents' : path.parse(originalName).name;
    const newFileName = `${baseName}_converted.${newExtension}`;

    if (!fs.existsSync(downloadsDir)) {
      fs.mkdirSync(downloadsDir, { recursive: true });
    }

    const uniqueFilename = `${Date.now()}_${newFileName}`;
    const filePath = path.join(downloadsDir, uniqueFilename);
    fs.writeFileSync(filePath, convertedBuffer);

    // Dynamic public preview URL derived from the incoming request (never hardcodes localhost in production)
    const proto = (req.headers['x-forwarded-proto'] || req.protocol || 'http').split(',')[0].trim();
    const host = req.headers['x-forwarded-host'] || req.get('host') || `localhost:${PORT}`;
    const previewUrl = `${proto}://${host}/downloads/${encodeURIComponent(uniqueFilename)}`;

    res.set({
      'Content-Type': mimeType,
      'Content-Disposition': `attachment; filename="${newFileName}"`,
      'X-Preview-URL': previewUrl
    });

    res.send(convertedBuffer);

  } catch (error) {
    console.error('Conversion error:', error);
    res.status(500).json({ error: error.message || 'Failed to convert file.' });
  }
});

const PORT = process.env.PORT || 3001;
if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`Conversion server running on port ${PORT}`);
  });
}

module.exports = app;
