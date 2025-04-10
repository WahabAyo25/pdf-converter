#!/usr/bin/env python3
import sys
import os
from pdf2docx import Converter

def convert_pdf_to_docx(pdf_file, docx_file):
    try:
        # Check if input file exists
        if not os.path.exists(pdf_file):
            print(f"Error: Input file {pdf_file} does not exist")
            sys.exit(1)
            
        # Make sure output directory exists
        os.makedirs(os.path.dirname(docx_file), exist_ok=True)
        
        # Perform conversion
        cv = Converter(pdf_file)
        cv.convert(docx_file)
        cv.close()
        
        # Verify the output file was created
        if os.path.exists(docx_file):
            print(f"Successfully converted {pdf_file} to {docx_file}")
        else:
            print(f"Error: Output file {docx_file} was not created")
            sys.exit(1)
            
    except Exception as e:
        print(f"Error converting PDF: {str(e)}")
        sys.exit(1)

if __name__ == "__main__":
    if len(sys.argv) != 3:
        print("Usage: python pdf_converter.py <input_pdf> <output_docx>")
        sys.exit(1)
    
    pdf_file = sys.argv[1]
    docx_file = sys.argv[2]
    
    print(f"Starting conversion from {pdf_file} to {docx_file}")
    convert_pdf_to_docx(pdf_file, docx_file)