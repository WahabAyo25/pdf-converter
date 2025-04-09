// components/PdfConverter.jsx
import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export default function PdfConverter() {
  const [file, setFile] = useState(null);
  const [fileName, setFileName] = useState('');
  const [outputFileName, setOutputFileName] = useState('');
  const [isConverting, setIsConverting] = useState(false);
  const [convertedFileUrl, setConvertedFileUrl] = useState('');
  const [error, setError] = useState('');
  const [isDragging, setIsDragging] = useState(false);
  const [conversionProgress, setConversionProgress] = useState(0);
  const [logoError, setLogoError] = useState(false);
  const fileInputRef = useRef(null);
  
  // Simulate progress during conversion
  const simulateProgress = () => {
    setConversionProgress(0);
    const interval = setInterval(() => {
      setConversionProgress(prev => {
        const newProgress = prev + Math.random() * 15;
        return newProgress >= 90 ? 90 : newProgress;
      });
    }, 500);
    return interval;
  };

  const processFile = (selectedFile) => {
    if (selectedFile) {
      if (selectedFile.type === 'application/pdf') {
        setFile(selectedFile);
        setFileName(selectedFile.name);
        setOutputFileName(selectedFile.name.replace(/\.pdf$/i, '.docx'));
        setError('');
      } else {
        setError('Please select a PDF file');
        setFile(null);
        setFileName('');
        setOutputFileName('');
      }
    }
  };

  const handleFileChange = (e) => {
    processFile(e.target.files[0]);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  const handleConvert = async () => {
    if (!file) {
      setError('Please select a file first');
      return;
    }

    setIsConverting(true);
    setError('');
    setConvertedFileUrl('');
    
    // Start progress simulation
    const progressInterval = simulateProgress();

    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch('/api/convert', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText);
      }

      // Complete the progress bar to 100%
      setConversionProgress(100);
      
      const blob = await response.blob();
      const downloadUrl = window.URL.createObjectURL(blob);
      setConvertedFileUrl(downloadUrl);
    } catch (err) {
      setError(err.message);
    } finally {
      clearInterval(progressInterval);
      setIsConverting(false);
    }
  };

  const resetConverter = () => {
    setFile(null);
    setFileName('');
    setOutputFileName('');
    setConvertedFileUrl('');
    setError('');
    setConversionProgress(0);
  };

  const handleImageError = () => {
    setLogoError(true);
  };

  // Determine which logo to use
  const logoSrc = logoError 
    ? "https://cdn.punchng.com/wp-content/uploads/2023/05/04121722/efcc.jpg" 
    : "/efcc-logo.png";

  return (
    <div className="pdf-converter-container">
      <div className="pdf-converter-overlay"></div>
  

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-4xl w-full mx-auto p-6 bg-white rounded-xl shadow-xl z-10"
      >
        {/* Header with EFCC Logo and title */}
        <div className="flex items-center justify-center mb-8">
          <motion.div 
            initial={{ scale: 0.9 }}
            animate={{ scale: 1 }}
            className="mr-4"
          >
            <div className="rounded-full overflow-hidden w-20 h-20 border-2 border-gray-200 shadow-md flex items-center justify-center bg-white">
              <img 
                src={logoSrc}
                alt="EFCC Logo" 
                className="h-full w-full object-contain"
                onError={handleImageError}
              />
            </div>
          </motion.div>
          <div className="text-center">
            <motion.h1 
              initial={{ x: -20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="text-3xl font-bold text-red-600"
            >
              EFCC Nigeria
            </motion.h1>
            <motion.h2 
              initial={{ x: -20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="text-xl font-semibold text-gray-700"
            >
              PDF to DOCX Converter
            </motion.h2>
          </div>
        </div>

        {/* Main Content */}
        <motion.div 
          layout
          className="bg-gradient-to-br from-white to-gray-50 p-6 rounded-lg border border-red-200 shadow-sm"
        >
          <AnimatePresence mode="wait">
            {!convertedFileUrl ? (
              <motion.div
                key="upload"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
              >
                {/* File Upload Area */}
                <motion.div 
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.99 }}
                  className={`mb-6 p-8 border-2 border-dashed rounded-lg flex flex-col items-center justify-center cursor-pointer transition-all duration-300 ${
                    isDragging 
                      ? 'border-red-500 bg-red-50 shadow-inner' 
                      : file 
                        ? 'border-green-400 bg-green-50' 
                        : 'border-red-300 hover:border-red-400 hover:bg-red-50'
                  }`}
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                  onClick={() => fileInputRef.current.click()}
                >
                  <motion.div
                    animate={{ 
                      y: [0, -5, 0],
                      transition: { 
                        repeat: isDragging ? Infinity : 0, 
                        duration: 1.5 
                      }
                    }}
                  >
                    {file ? (
                      <svg className="w-12 h-12 text-green-500 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                      </svg>
                    ) : (
                      <svg className="w-12 h-12 text-red-600 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"></path>
                      </svg>
                    )}
                  </motion.div>
                  <p className="text-lg font-medium text-gray-800 mb-1">
                    {file ? 'File selected' : 'Drag & Drop your PDF file here'}
                  </p>
                  <p className="text-sm text-gray-600">
                    {file ? 'Click to change selection' : 'or click to browse'}
                  </p>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".pdf"
                    onChange={handleFileChange}
                    className="hidden"
                  />
                </motion.div>

                {/* Selected File Details */}
                <AnimatePresence>
                  {fileName && (
                    <motion.div 
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="mb-6 p-4 bg-white rounded-lg border border-gray-200 shadow-sm"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          <div className="mr-3 bg-red-100 p-2 rounded-lg">
                            <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
                            </svg>
                          </div>
                          <div>
                            <h3 className="font-medium text-gray-800">Selected File:</h3>
                            <p className="text-gray-700 text-sm truncate max-w-xs">{fileName}</p>
                          </div>
                        </div>
                        <motion.button 
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          onClick={(e) => {
                            e.stopPropagation();
                            resetConverter();
                          }}
                          className="text-red-500 hover:text-red-700 p-2 rounded-full hover:bg-red-50 transition-colors"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
                          </svg>
                        </motion.button>
                      </div>
                      <div className="mt-2 pt-2 border-t border-gray-100">
                        <h3 className="font-medium text-gray-800">Output File:</h3>
                        <p className="text-gray-700 text-sm flex items-center">
                          <svg className="w-4 h-4 mr-1 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7v8a2 2 0 002 2h6M8 7V5a2 2 0 012-2h4.586a1 1 0 01.707.293l4.414 4.414a1 1 0 01.293.707V15a2 2 0 01-2 2h-2"></path>
                          </svg>
                          {outputFileName}
                        </p>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Error Message */}
                <AnimatePresence>
                  {error && (
                    <motion.div 
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="mb-6 p-4 bg-red-50 border border-red-300 rounded-lg shadow-sm"
                    >
                      <div className="flex items-center">
                        <svg className="w-5 h-5 text-red-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                        </svg>
                        <p className="text-red-600">{error}</p>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Convert Button */}
                <motion.button
                  whileHover={!file || isConverting ? {} : { scale: 1.02 }}
                  whileTap={!file || isConverting ? {} : { scale: 0.98 }}
                  onClick={handleConvert}
                  disabled={!file || isConverting}
                  className={`w-full py-3 px-4 rounded-lg font-medium flex items-center justify-center transition-all duration-300 ${
                    !file || isConverting
                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    : 'bg-gradient-to-r from-red-600 to-red-500 text-white hover:shadow-lg hover:from-red-700 hover:to-red-600'
                  }`}
                >
                  {isConverting ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Converting...
                    </>
                  ) : (
                    <div className="flex items-center">
                      <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l4 4m0 0l-4 4m4-4H4"></path>
                      </svg>
                      Convert to DOCX
                    </div>
                  )}
                </motion.button>

                {/* Conversion Progress Bar */}
                <AnimatePresence>
                  {isConverting && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="mt-4"
                    >
                      <div className="w-full bg-gray-200 rounded-full h-2.5">
                        <motion.div 
                          className="bg-red-600 h-2.5 rounded-full" 
                          initial={{ width: '0%' }}
                          animate={{ width: `${conversionProgress}%` }}
                          transition={{ type: "tween" }}
                        />
                      </div>
                      <p className="text-xs text-gray-500 mt-1 text-right">Processing...</p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            ) : (
              /* Success Message and Download Section */
              <motion.div 
                key="success"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="text-center"
              >
                <motion.div 
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", stiffness: 200, damping: 15 }}
                  className="mb-8"
                >
                  <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-green-100 text-green-600 mb-4 shadow-md">
                    <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                    </svg>
                  </div>
                  <h3 className="text-2xl font-semibold text-gray-800 mb-2">Conversion Successful!</h3>
                  <p className="text-gray-700">Your file is ready to download</p>
                </motion.div>
                
                <motion.div
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  className="mb-6"
                >
                  <a
                    href={convertedFileUrl}
                    download={outputFileName}
                    className="inline-block py-3 px-6 bg-gradient-to-r from-green-600 to-green-500 text-white rounded-lg hover:from-green-700 hover:to-green-600 shadow-md hover:shadow-lg transition-all"
                  >
                    <div className="flex items-center justify-center">
                      <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"></path>
                      </svg>
                      Download {outputFileName}
                    </div>
                  </a>
                </motion.div>
                
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={resetConverter}
                  className="w-full py-3 px-4 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-all border border-gray-200 shadow-sm hover:shadow"
                >
                  <div className="flex items-center justify-center">
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path>
                    </svg>
                    Convert Another File
                  </div>
                </motion.button>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        {/* Footer */}
        <div className="mt-8 text-center text-sm text-gray-600">
          <p>© {new Date().getFullYear()} Economic and Financial Crimes Commission, Nigeria</p>
          <p className="mt-1">This tool is for official document processing only</p>
        </div>
      </motion.div>
    </div>
  );
}