import { exec } from 'child_process';
import formidable from 'formidable';
import fs from 'fs/promises';
import path from 'path';
import util from 'util';

const execPromise = util.promisify(exec);

export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const uploadDir = path.join(process.cwd(), 'tmp');
  await fs.mkdir(uploadDir, { recursive: true });

  const form = formidable({
    uploadDir,
    filename: (name, ext) => `upload-${Date.now()}${ext}`,
    maxFileSize: 10 * 1024 * 1024,
  });

  try {
    const [fields, files] = await new Promise((resolve, reject) => {
      form.parse(req, (err, fields, files) => {
        if (err) return reject(err);
        resolve([fields, files]);
      });
    });

    const file = files.file[0];
    const originalName = path.parse(file.originalFilename).name;
    const sanitizedName = originalName.replace(/[^a-zA-Z0-9]/g, '_'); // Sanitize filename
    const inputPath = file.filepath;
    const outputFilename = `${sanitizedName}.docx`;
    const outputPath = path.join(uploadDir, outputFilename);

    // Make sure output directory exists
    const outputDir = path.dirname(outputPath);
    await fs.mkdir(outputDir, { recursive: true });

    // Convert using Python script
    const pythonCommand = `/Library/Frameworks/Python.framework/Versions/3.13/bin/python3 "${path.join(process.cwd(), 'pdf_converter.py')}" "${inputPath}" "${outputPath}"`;
    
    // Execute the Python command - This line was missing!
    const { stdout, stderr } = await execPromise(pythonCommand);
    
    if (stderr) {
      console.log('Python script output:', stderr);
    }
    
    // Check if the file exists before attempting to read it
    const fileExists = await fs.access(outputPath).then(() => true).catch(() => false);
    if (!fileExists) {
      throw new Error(`Output file was not created at ${outputPath}`);
    }

    // Read converted file
    const docxBuf = await fs.readFile(outputPath);

    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document');
    res.setHeader('Content-Disposition', `attachment; filename="${outputFilename}"`);
    res.send(docxBuf);

  } catch (error) {
    console.error('Conversion error:', error);
    res.status(500).json({ error: error.message || 'Conversion failed' });
  } finally {
    // Only attempt to clean up if the directory exists
    try {
      await fs.access(uploadDir);
      await fs.rm(uploadDir, { recursive: true, force: true });
    } catch (error) {
      console.log('Cleanup error (non-critical):', error.message);
    }
  }
}