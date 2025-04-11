import formidable from 'formidable';
import fs from 'fs/promises';
import path from 'path';
import fetch from 'node-fetch';

export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Use /tmp for Vercel serverless environment
  const uploadDir = '/tmp';
  
  try {
    // Ensure directory exists
    await fs.mkdir(uploadDir, { recursive: true }).catch(() => {});

    const form = formidable({
      uploadDir,
      keepExtensions: true,
      maxFileSize: 10 * 1024 * 1024, // 10MB
    });

    const [fields, files] = await new Promise((resolve, reject) => {
      form.parse(req, (err, fields, files) => {
        if (err) return reject(err);
        resolve([fields, files]);
      });
    });

    const file = files.file[0];
    const inputPath = file.filepath;
    
    // Create form data to send to our Python API
    const formData = new FormData();
    const fileBuffer = await fs.readFile(inputPath);
    const blob = new Blob([fileBuffer], { type: 'application/pdf' });
    formData.append('file', blob, file.originalFilename);
    
    // Update endpoint path - assuming your API has a /convert endpoint
    // If your API uses a different path, change this accordingly
    const response = await fetch('https://pdf-converter-guxo.onrender.com/convert', {
      method: 'POST',
      body: formData,
    });
    
    if (!response.ok) {
      throw new Error(`API returned ${response.status}: ${await response.text()}`);
    }
    
    // Forward the response from our Python API
    const docxBuffer = await response.arrayBuffer();
    
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document');
    res.setHeader('Content-Disposition', `attachment; filename="${path.parse(file.originalFilename).name}.docx"`);
    res.send(Buffer.from(docxBuffer));
    
    // Clean up just the specific file, not the entire directory
    await fs.unlink(inputPath).catch(err => console.log('File cleanup error:', err.message));
    
  } catch (error) {
    console.error('Conversion error:', error);
    res.status(500).json({ error: error.message || 'Conversion failed' });
  }
}