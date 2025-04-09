// pages/api/download.js
import fs from 'fs-extra';
import path from 'path';

export default async function handler(req, res) {
  const { file } = req.query;
  
  if (!file) {
    return res.status(400).json({ error: 'No file specified' });
  }
  
  // Validate filename to prevent directory traversal attacks
  const filename = path.basename(file);
  const filePath = path.join(process.cwd(), 'tmp/converted', filename);
  
  try {
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ error: 'File not found' });
    }
    
    const fileStats = await fs.stat(filePath);
    
    // Set headers
    res.setHeader('Content-Disposition', `attachment; filename=${filename}`);
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document');
    res.setHeader('Content-Length', fileStats.size);
    
    // Stream the file
    const fileStream = fs.createReadStream(filePath);
    fileStream.pipe(res);
    
    // Optional: Delete file after download (if you don't want to keep files on the server)
    // fileStream.on('end', () => fs.unlink(filePath).catch(err => console.error('Error deleting file:', err)));
  } catch (error) {
    console.error('Download error:', error);
    res.status(500).json({ error: 'Failed to download file: ' + error.message });
  }
}