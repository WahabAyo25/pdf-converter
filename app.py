from fastapi import FastAPI, File, UploadFile, HTTPException
from fastapi.responses import FileResponse
from fastapi.middleware.cors import CORSMiddleware
import uvicorn
import os
import uuid
import logging
# Import your conversion function
from pdf_converter import convert_pdf_to_docx

# Set up logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

app = FastAPI(title="PDF to DOCX Converter")

# Set up CORS middleware
app.add_middleware(
    CORSMiddleware,
    # Replace with your actual frontend URL(s)
    allow_origins=["https://your-nextjs-app.vercel.app", "http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

UPLOAD_DIR = "uploads"
OUTPUT_DIR = "output"

# Create directories if they don't exist
os.makedirs(UPLOAD_DIR, exist_ok=True)
os.makedirs(OUTPUT_DIR, exist_ok=True)

@app.post("/convert")
async def convert_pdf_endpoint(file: UploadFile = File(...)):
    logger.info(f"Received file: {file.filename}")
    
    # Validate file
    if not file.filename.endswith(".pdf"):
        logger.warning(f"Invalid file type: {file.filename}")
        raise HTTPException(status_code=400, detail="Only PDF files are allowed")
    
    # Generate unique filenames
    unique_id = str(uuid.uuid4())
    pdf_path = os.path.join(UPLOAD_DIR, f"{unique_id}.pdf")
    docx_path = os.path.join(OUTPUT_DIR, f"{unique_id}.docx")
    
    logger.info(f"Saving PDF to {pdf_path}")
    # Save uploaded PDF
    with open(pdf_path, "wb") as pdf_file:
        pdf_file.write(await file.read())
    
    try:
        # Use your conversion function
        logger.info(f"Starting conversion from {pdf_path} to {docx_path}")
        convert_pdf_to_docx(pdf_path, docx_path)
        logger.info("Conversion successful")
        
        # Return the DOCX file
        return FileResponse(
            docx_path,
            media_type="application/vnd.openxmlformats-officedocument.wordprocessingml.document",
            filename=file.filename.replace(".pdf", ".docx")
        )
    except Exception as e:
        logger.error(f"Conversion failed: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Conversion failed: {str(e)}")
    finally:
        # Clean up files (optionally)
        if os.path.exists(pdf_path):
            logger.info(f"Cleaning up: Removing {pdf_path}")
            os.remove(pdf_path)

@app.get("/")
async def root():
    return {"message": "PDF to DOCX Converter API. Use POST /convert to convert files"}

@app.get("/health")
async def health_check():
    """Health check endpoint to verify the service is running."""
    return {
        "status": "healthy",
        "service": "PDF to DOCX Converter API",
        "version": "1.0.0"  # You might want to use an environment variable for this
    }

if __name__ == "__main__":
    uvicorn.run("app:app", host="0.0.0.0", port=int(os.environ.get("PORT", 8000)))