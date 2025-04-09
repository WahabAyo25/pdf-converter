# In app.py
from fastapi import FastAPI, File, UploadFile, HTTPException
from fastapi.responses import FileResponse
import uvicorn
import os
import uuid
# Import your conversion function
from pdf_converter import convert_pdf_to_docx

app = FastAPI(title="PDF to DOCX Converter")

UPLOAD_DIR = "uploads"
OUTPUT_DIR = "output"

# Create directories if they don't exist
os.makedirs(UPLOAD_DIR, exist_ok=True)
os.makedirs(OUTPUT_DIR, exist_ok=True)

@app.post("/convert")
async def convert_pdf_endpoint(file: UploadFile = File(...)):
    # Validate file
    if not file.filename.endswith(".pdf"):
        raise HTTPException(status_code=400, detail="Only PDF files are allowed")
    
    # Generate unique filenames
    unique_id = str(uuid.uuid4())
    pdf_path = os.path.join(UPLOAD_DIR, f"{unique_id}.pdf")
    docx_path = os.path.join(OUTPUT_DIR, f"{unique_id}.docx")
    
    # Save uploaded PDF
    with open(pdf_path, "wb") as pdf_file:
        pdf_file.write(await file.read())
    
    try:
        # Use your conversion function
        convert_pdf_to_docx(pdf_path, docx_path)
        
        # Return the DOCX file
        return FileResponse(
            docx_path,
            media_type="application/vnd.openxmlformats-officedocument.wordprocessingml.document",
            filename=file.filename.replace(".pdf", ".docx")
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Conversion failed: {str(e)}")
    finally:
        # Clean up files (optionally)
        if os.path.exists(pdf_path):
            os.remove(pdf_path)

@app.get("/")
async def root():
    return {"message": "PDF to DOCX Converter API. Use POST /convert to convert files"}

if __name__ == "__main__":
    uvicorn.run("app:app", host="0.0.0.0", port=int(os.environ.get("PORT", 8000)))