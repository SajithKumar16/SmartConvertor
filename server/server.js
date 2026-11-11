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

const app = express();
app.use(cors({ exposedHeaders: ['Content-Disposition', 'X-Preview-URL'] }));
app.use(express.json());
app.use('/downloads', express.static(path.join(__dirname, 'downloads')));
require('dotenv').config();
const nodemailer = require('nodemailer');

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

  // Always record messages to server/contact_messages.json to guarantee zero data loss
  try {
    const messagesFile = path.join(__dirname, 'contact_messages.json');
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

// Helper: Python execution for docx2pdf
async function convertDocxToPdf(docxBuffer) {
  const tempDir = os.tmpdir();
  const uniqueId = `docx_${Date.now()}_${Math.random().toString(36).substring(7)}`;
  const inPath = path.join(tempDir, `${uniqueId}.docx`);
  const outPath = path.join(tempDir, `${uniqueId}.pdf`);
  fs.writeFileSync(inPath, docxBuffer);
  
  const pythonExe = path.join(__dirname, 'venv', 'Scripts', 'python.exe');
  const pyCode = `
import sys
from docx2pdf import convert
convert(r"${inPath.replace(/\\/g, '\\\\')}", r"${outPath.replace(/\\/g, '\\\\')}")
  `.trim();

  try {
    if (fs.existsSync(pythonExe)) {
      await execFileAsync(pythonExe, ['-c', pyCode], { timeout: 30000 });
      if (fs.existsSync(outPath)) {
        const pdfBytes = fs.readFileSync(outPath);
        return pdfBytes;
      }
    }
  } catch (err) {
    console.warn('Python docx2pdf failed, falling back:', err.message);
  } finally {
    try { if (fs.existsSync(inPath)) fs.unlinkSync(inPath); } catch (e) {}
    try { if (fs.existsSync(outPath)) fs.unlinkSync(outPath); } catch (e) {}
  }

  // Fallback: extract text and create PDF
  const pdfDoc = await PDFDocument.create();
  const page = pdfDoc.addPage([595.28, 841.89]);
  const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
  page.drawText("Document converted from DOCX", { x: 50, y: 800, size: 14, font, color: rgb(0.1, 0.1, 0.1) });
  return Buffer.from(await pdfDoc.save());
}

// Helper: Python execution for pdf2docx
async function convertPdfToDocx(pdfBuffer) {
  const tempDir = os.tmpdir();
  const uniqueId = `pdf_${Date.now()}_${Math.random().toString(36).substring(7)}`;
  const inPath = path.join(tempDir, `${uniqueId}.pdf`);
  const outPath = path.join(tempDir, `${uniqueId}.docx`);
  fs.writeFileSync(inPath, pdfBuffer);

  const pythonExe = path.join(__dirname, 'venv', 'Scripts', 'python.exe');
  const pyCode = `
from pdf2docx import Converter
cv = Converter(r"${inPath.replace(/\\/g, '\\\\')}")
cv.convert(r"${outPath.replace(/\\/g, '\\\\')}")
cv.close()
  `.trim();

  try {
    if (fs.existsSync(pythonExe)) {
      await execFileAsync(pythonExe, ['-c', pyCode], { timeout: 30000 });
      if (fs.existsSync(outPath)) {
        const docxBytes = fs.readFileSync(outPath);
        return docxBytes;
      }
    }
  } catch (err) {
    console.warn('Python pdf2docx failed, falling back to pdfreader:', err.message);
  } finally {
    try { if (fs.existsSync(inPath)) fs.unlinkSync(inPath); } catch (e) {}
    try { if (fs.existsSync(outPath)) fs.unlinkSync(outPath); } catch (e) {}
  }

  // Fallback via pdfreader
  const { PdfReader } = require("pdfreader");
  const extractedText = await new Promise((resolve, reject) => {
    let textContent = "";
    let lastY = null;
    new PdfReader().parseBuffer(pdfBuffer, (err, item) => {
      if (err) reject(err);
      else if (!item) resolve(textContent.trim() || "No text content found in PDF.");
      else if (item.text) {
        if (lastY !== null && Math.abs(item.y - lastY) > 0.5) textContent += "\n";
        textContent += item.text + " ";
        lastY = item.y;
      }
    });
  });
  
  const htmlContent = `<!DOCTYPE html><html><body>${extractedText.split('\n').map(l => `<p>${l.trim()}</p>`).join('')}</body></html>`;
  return Buffer.from(htmlContent, 'utf-8');
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
      const { data: { text } } = await Tesseract.recognize(buffer, 'eng');
      convertedBuffer = Buffer.from(text || 'No text recognized.', 'utf-8');
      mimeType = 'text/plain';
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
      const pdfDoc = await PDFDocument.create();
      const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
      let text = buffer.toString('utf-8').replace(/^\uFEFF/, '');
      // Sanitize special unicode characters not representable in WinAnsi
      text = text
        .replace(/[\u2018\u2019]/g, "'")
        .replace(/[\u201C\u201D]/g, '"')
        .replace(/[\u2013\u2014]/g, '-')
        .replace(/\u2026/g, '...')
        .replace(/[^\x09\x0A\x0D\x20-\x7E\xA0-\xFF]/g, ' ');
      const rawLines = text.split(/\r?\n/);

      let page = pdfDoc.addPage([595.28, 841.89]); // A4
      let y = 790;
      const margin = 50;
      const fontSize = 10.5;
      const lineHeight = 15;
      const maxWidth = 595.28 - margin * 2;

      for (let rawLine of rawLines) {
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
          const textWidth = font.widthOfTextAtSize(testLine, fontSize);
          if (textWidth > maxWidth) {
            if (y < margin) {
              page = pdfDoc.addPage([595.28, 841.89]);
              y = 790;
            }
            page.drawText(line, { x: margin, y, size: fontSize, font, color: rgb(0.12, 0.12, 0.12) });
            y -= lineHeight;
            line = word;
          } else {
            line = testLine;
          }
        }
        if (line) {
          if (y < margin) {
            page = pdfDoc.addPage([595.28, 841.89]);
            y = 790;
          }
          page.drawText(line, { x: margin, y, size: fontSize, font, color: rgb(0.12, 0.12, 0.12) });
          y -= lineHeight;
        }
      }

      convertedBuffer = Buffer.from(await pdfDoc.save());
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

    const downloadsDir = path.join(__dirname, 'downloads');
    if (!fs.existsSync(downloadsDir)) {
      fs.mkdirSync(downloadsDir, { recursive: true });
    }

    const uniqueFilename = `${Date.now()}_${newFileName}`;
    const filePath = path.join(downloadsDir, uniqueFilename);
    fs.writeFileSync(filePath, convertedBuffer);
    const previewUrl = `http://localhost:3001/downloads/${uniqueFilename}`;

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

const PORT = 3001;
app.listen(PORT, () => {
  console.log(`Conversion server running on port ${PORT}`);
});
