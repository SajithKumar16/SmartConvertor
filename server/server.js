const express = require('express');
const cors = require('cors');
const multer = require('multer');
const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const app = express();
app.use(cors({ exposedHeaders: ['Content-Disposition', 'X-Preview-URL'] }));
app.use(express.json());
app.use('/downloads', express.static(path.join(__dirname, 'downloads')));
require('dotenv').config();
const nodemailer = require('nodemailer');

app.post('/api/contact', async (req, res) => {
  const { email, subject, message } = req.body;
  
  if (!process.env.EMAIL_PASS) {
    return res.status(500).json({ error: 'Backend SMTP not configured. Please check terminal instructions.' });
  }

  try {
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
      }
    });

    await transporter.sendMail({
      from: email,
      to: process.env.EMAIL_USER,
      subject: `SmartConvertor Contact Form: ${subject || 'No Subject'}`,
      text: `You received a new message from the SmartConvertor Contact Form.\n\nFrom: ${email}\n\nMessage:\n${message}`
    });

    res.json({ success: true, message: 'Message sent!' });
  } catch (error) {
    console.error('Email error:', error);
    res.status(500).json({ error: 'Failed to send email. Check credentials.' });
  }
});

// Set up storage
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

app.post('/api/convert', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const { targetFormat } = req.body;
    if (!targetFormat) {
      return res.status(400).json({ error: 'Target format not specified' });
    }

    const originalName = req.file.originalname;
    const extension = path.extname(originalName).toLowerCase();
    const buffer = req.file.buffer;

    let convertedBuffer;
    let mimeType;
    let newExtension = targetFormat.toLowerCase();

    const { PDFDocument } = require('pdf-lib');

    // Image Conversions
    if (['jpg', 'png', 'webp'].includes(newExtension) && ['.jpg', '.jpeg', '.png', '.webp'].includes(extension)) {
      if (newExtension === 'jpg') {
        convertedBuffer = await sharp(buffer).jpeg().toBuffer();
        mimeType = 'image/jpeg';
      } else if (newExtension === 'png') {
        convertedBuffer = await sharp(buffer).png().toBuffer();
        mimeType = 'image/png';
      } else if (newExtension === 'webp') {
        convertedBuffer = await sharp(buffer).webp().toBuffer();
        mimeType = 'image/webp';
      }
    } else if (targetFormat === 'img-to-pdf') {
      newExtension = 'pdf';
      const pdfDoc = await PDFDocument.create();
      let image;
      try {
        if (extension === '.png') {
          image = await pdfDoc.embedPng(buffer);
        } else if (extension === '.jpg' || extension === '.jpeg') {
          image = await pdfDoc.embedJpg(buffer);
        } else {
          // Fallback: convert to PNG using sharp first
          const pngBuffer = await sharp(buffer).png().toBuffer();
          image = await pdfDoc.embedPng(pngBuffer);
        }
      } catch (e) {
        // If direct embed fails, force convert to png and try again
        const pngBuffer = await sharp(buffer).png().toBuffer();
        image = await pdfDoc.embedPng(pngBuffer);
      }
      const page = pdfDoc.addPage([image.width, image.height]);
      page.drawImage(image, { x: 0, y: 0, width: image.width, height: image.height });
      convertedBuffer = Buffer.from(await pdfDoc.save());
      mimeType = 'application/pdf';
    } else if (targetFormat === 'ocr') {
      if (!['.jpg', '.jpeg', '.png', '.bmp', '.webp'].includes(extension)) {
        return res.status(400).json({ error: 'OCR currently only supports image files (JPG, PNG, WEBP, BMP).' });
      }
      newExtension = 'txt';
      const Tesseract = require('tesseract.js');
      const { data: { text } } = await Tesseract.recognize(buffer, 'eng');
      convertedBuffer = Buffer.from(text, 'utf-8');
      mimeType = 'text/plain';
    } else if (targetFormat === 'compress-pdf') {
      if (extension !== '.pdf') {
        return res.status(400).json({ error: 'Please upload a valid PDF file to compress.' });
      }
      newExtension = 'pdf';
      const { PDFDocument } = require('pdf-lib');
      const pdfDoc = await PDFDocument.load(buffer);
      // Basic compression by rebuilding the PDF structure
      convertedBuffer = Buffer.from(await pdfDoc.save());
      mimeType = 'application/pdf';
    } else if (targetFormat === 'pdf-to-docx') {
      if (extension !== '.pdf') {
        return res.status(400).json({ error: 'Please upload a valid PDF file to convert.' });
      }
      newExtension = 'docx';
      const { PdfReader } = require("pdfreader");
      const extractedText = await new Promise((resolve, reject) => {
        let textContent = "";
        let lastY = null;
        new PdfReader().parseBuffer(buffer, (err, item) => {
          if (err) {
            reject(err);
          } else if (!item) {
            resolve(textContent.trim() || "No text content found in PDF.");
          } else if (item.text) {
            // Group text on similar vertical lines together
            if (lastY !== null && Math.abs(item.y - lastY) > 0.5) {
              textContent += "\n";
            }
            textContent += item.text + " ";
            lastY = item.y;
          }
        });
      });
      
      const htmlContent = `
<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<style>
body { font-family: "Calibri", "Arial", sans-serif; line-height: 1.5; font-size: 11pt; }
p { margin-bottom: 8pt; text-align: justify; }
</style>
</head>
<body>
${extractedText.split('\n').map(line => line.trim() ? `<p>${line.trim()}</p>` : '').join('')}
</body>
</html>
      `;
      convertedBuffer = Buffer.from(htmlContent, 'utf-8');
      mimeType = 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
    } else {
      // For PDF/DOCX we will mock it for now
      return res.status(501).json({ error: `Conversion to ${targetFormat} is currently mocked or unsupported in this lightweight build.` });
    }

    const newFileName = `${path.parse(originalName).name}_converted.${newExtension}`;

    const downloadsDir = path.join(__dirname, 'downloads');
    if (!fs.existsSync(downloadsDir)) {
      fs.mkdirSync(downloadsDir);
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
    res.status(500).json({ error: 'Failed to convert file' });
  }
});

const PORT = 3001;
app.listen(PORT, () => {
  console.log(`Conversion server running on port ${PORT}`);
});
