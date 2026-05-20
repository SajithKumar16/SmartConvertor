import os
import shutil
import tempfile
import zipfile
from io import BytesIO
from typing import List
import numpy as np

from fastapi import FastAPI, UploadFile, File, Form, HTTPException
from fastapi.responses import FileResponse, Response
from fastapi.middleware.cors import CORSMiddleware

# Conversion Libraries
from PIL import Image
from pdf2docx import Converter as PDF2DocxConverter
from docx2pdf import convert as docx2pdf_convert
from fpdf import FPDF
import fitz  # PyMuPDF
from PyPDF2 import PdfMerger, PdfReader, PdfWriter
import easyocr

app = FastAPI(title="SmartConvert API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Adjust in production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

def get_temp_file(suffix=""):
    fd, path = tempfile.mkstemp(suffix=suffix)
    os.close(fd)
    return path

@app.post("/api/convert/image")
async def convert_image(file: UploadFile = File(...), targetFormat: str = Form(...)):
    try:
        content = await file.read()
        img = Image.open(BytesIO(content))
        
        if targetFormat.lower() in ["jpg", "jpeg"] and img.mode in ("RGBA", "P"):
            img = img.convert("RGB")
            
        output_io = BytesIO()
        save_format = "JPEG" if targetFormat.lower() in ["jpg", "jpeg"] else targetFormat.upper()
        img.save(output_io, format=save_format)
        
        return Response(
            content=output_io.getvalue(),
            media_type=f"image/{targetFormat.lower()}",
            headers={"Content-Disposition": f'attachment; filename="converted.{targetFormat.lower()}"'}
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/convert/pdf-to-docx")
async def convert_pdf_to_docx(file: UploadFile = File(...)):
    pdf_path = get_temp_file(suffix=".pdf")
    docx_path = get_temp_file(suffix=".docx")
    try:
        with open(pdf_path, "wb") as f:
            f.write(await file.read())
            
        cv = PDF2DocxConverter(pdf_path)
        cv.convert(docx_path, start=0, end=None)
        cv.close()
        
        return FileResponse(
            docx_path, 
            media_type="application/vnd.openxmlformats-officedocument.wordprocessingml.document",
            filename="converted.docx"
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/convert/docx-to-pdf")
async def convert_docx_to_pdf(file: UploadFile = File(...)):
    docx_path = get_temp_file(suffix=".docx")
    pdf_path = get_temp_file(suffix=".pdf")
    try:
        with open(docx_path, "wb") as f:
            f.write(await file.read())
            
        docx2pdf_convert(docx_path, pdf_path)
        
        return FileResponse(
            pdf_path, 
            media_type="application/pdf",
            filename="converted.pdf"
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"docx2pdf failed (Ensure MS Word is installed): {str(e)}")

@app.post("/api/convert/txt-to-pdf")
async def convert_txt_to_pdf(file: UploadFile = File(...)):
    try:
        content = await file.read()
        text = content.decode("utf-8")
        
        pdf = FPDF()
        pdf.add_page()
        pdf.set_font("Arial", size=12)
        pdf.multi_cell(0, 10, txt=text)
        
        pdf_path = get_temp_file(suffix=".pdf")
        pdf.output(pdf_path)
        
        return FileResponse(
            pdf_path, 
            media_type="application/pdf",
            filename="converted.pdf"
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/convert/compress-pdf")
async def compress_pdf(file: UploadFile = File(...)):
    pdf_path = get_temp_file(suffix=".pdf")
    out_path = get_temp_file(suffix=".pdf")
    try:
        with open(pdf_path, "wb") as f:
            f.write(await file.read())
            
        doc = fitz.open(pdf_path)
        doc.save(out_path, garbage=4, deflate=True, clean=True)
        doc.close()
        
        return FileResponse(
            out_path, 
            media_type="application/pdf",
            filename="compressed.pdf"
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/convert/merge-pdf")
async def merge_pdf(files: List[UploadFile] = File(...)):
    out_path = get_temp_file(suffix=".pdf")
    try:
        merger = PdfMerger()
        for file in files:
            content = await file.read()
            merger.append(BytesIO(content))
            
        merger.write(out_path)
        merger.close()
        
        return FileResponse(
            out_path, 
            media_type="application/pdf",
            filename="merged.pdf"
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/convert/split-pdf")
async def split_pdf(file: UploadFile = File(...)):
    zip_path = get_temp_file(suffix=".zip")
    try:
        content = await file.read()
        reader = PdfReader(BytesIO(content))
        
        with zipfile.ZipFile(zip_path, 'w') as zipf:
            for i in range(len(reader.pages)):
                writer = PdfWriter()
                writer.add_page(reader.pages[i])
                
                page_path = get_temp_file(suffix=".pdf")
                with open(page_path, "wb") as f:
                    writer.write(f)
                    
                zipf.write(page_path, arcname=f"page_{i+1}.pdf")
                
        return FileResponse(
            zip_path, 
            media_type="application/zip",
            filename="split_pages.zip"
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/convert/ocr")
async def extract_ocr(file: UploadFile = File(...)):
    try:
        content = await file.read()
        img = Image.open(BytesIO(content))
        img_np = np.array(img)
        
        # EasyOCR reading (gpu=False for broad compatibility)
        reader = easyocr.Reader(['en'], gpu=False)
        result = reader.readtext(img_np, detail=0)
        
        text = "\n".join(result)
        
        return Response(
            content=text,
            media_type="text/plain",
            headers={"Content-Disposition": 'attachment; filename="extracted.txt"'}
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"EasyOCR failed: {str(e)}")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
