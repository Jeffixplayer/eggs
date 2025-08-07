import React, { useRef, useState, useImperativeHandle, forwardRef } from 'react';
import SignatureCanvas from 'react-signature-canvas';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { storage, auth } from '../firebase';
import { useAuthState } from 'react-firebase-hooks/auth';

const DigitalSignaturePad = forwardRef(({ onSignatureSaved, onSignatureChange, existingSignature }, ref) => {
  const [user] = useAuthState(auth);
  const sigCanvasRef = useRef();
  const [isDrawing, setIsDrawing] = useState(false);
  const [isEmpty, setIsEmpty] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [savedSignature, setSavedSignature] = useState(existingSignature || null);

  useImperativeHandle(ref, () => ({
    clear: () => {
      handleClear();
    },
    getSignature: () => {
      if (savedSignature) {
        return savedSignature;
      }
      if (sigCanvasRef.current.isEmpty()) {
        return null;
      }
      return sigCanvasRef.current.getTrimmedCanvas().toDataURL('image/png');
    },
    isEmpty: () => {
      return isEmpty && !savedSignature;
    },
    getSavedSignature: () => {
      return savedSignature;
    }
  }));

  const handleClear = () => {
    sigCanvasRef.current.clear();
    setIsEmpty(true);
    setIsDrawing(false);
    setSavedSignature(null);
    if (onSignatureChange) {
      onSignatureChange(null);
    }
  };

  const handleBegin = () => {
    setIsDrawing(true);
  };

  const handleEnd = () => {
    const canvas = sigCanvasRef.current;
    if (canvas && !canvas.isEmpty()) {
      setIsEmpty(false);
      const signatureData = canvas.getTrimmedCanvas().toDataURL('image/png');
      if (onSignatureChange) {
        onSignatureChange(signatureData);
      }
    }
  };

  const handleSave = async () => {
    if (!user) {
      alert('You must be logged in to save signatures');
      return;
    }

    if (sigCanvasRef.current.isEmpty()) {
      alert('Please draw a signature first');
      return;
    }

    setIsSaving(true);
    try {
      // Get the signature as a blob
      const canvas = sigCanvasRef.current.getTrimmedCanvas();
      
      // Convert canvas to blob
      const blob = await new Promise((resolve) => {
        canvas.toBlob(resolve, 'image/png', 1.0);
      });

      if (!blob) {
        throw new Error('Failed to create signature image');
      }

      // Create a unique filename
      const timestamp = Date.now();
      const fileName = `signatures/${user.uid}/${timestamp}-signature.png`;
      const storageRef = ref(storage, fileName);

      // Upload to Firebase Storage
      const uploadResult = await uploadBytes(storageRef, blob);
      const downloadURL = await getDownloadURL(uploadResult.ref);

      // Create signature object with metadata
      const signatureData = {
        url: downloadURL,
        path: fileName,
        fileName: `${timestamp}-signature.png`,
        createdAt: new Date().toISOString(),
        createdBy: user.uid,
        type: 'signature'
      };

      setSavedSignature(signatureData);
      
      // Call the callback with the signature data
      if (onSignatureSaved) {
        onSignatureSaved(signatureData);
      }

      // Also call onChange for form integration
      if (onSignatureChange) {
        onSignatureChange(signatureData);
      }

      alert('Signature saved successfully!');
    } catch (error) {
      console.error('Error saving signature:', error);
      alert('Failed to save signature. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDownload = () => {
    if (savedSignature && savedSignature.url) {
      // Download from Firebase Storage
      const link = document.createElement('a');
      link.href = savedSignature.url;
      link.download = savedSignature.fileName || 'signature.png';
      link.click();
    } else if (!sigCanvasRef.current.isEmpty()) {
      // Download current canvas content
      const canvas = sigCanvasRef.current.getTrimmedCanvas();
      const link = document.createElement('a');
      link.href = canvas.toDataURL('image/png');
      link.download = `signature-${Date.now()}.png`;
      link.click();
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto">
      <div className="border-2 border-gray-300 rounded-lg overflow-hidden bg-white shadow-sm">
        {/* Header */}
        <div className="bg-gray-50 px-4 py-3 border-b border-gray-300">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-medium text-gray-900">Digital Signature</h3>
            <div className="flex items-center space-x-2">
              {savedSignature && (
                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                  <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  Saved
                </span>
              )}
              {isDrawing && (
                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                  Drawing...
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Canvas Area */}
        <div className="p-4">
          {savedSignature ? (
            // Show saved signature
            <div className="relative">
              <img 
                src={savedSignature.url} 
                alt="Saved Signature" 
                className="w-full h-40 object-contain border border-gray-200 rounded bg-gray-50"
              />
              <div className="absolute top-2 right-2">
                <button
                  onClick={handleClear}
                  className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded text-sm font-medium"
                >
                  Edit
                </button>
              </div>
            </div>
          ) : (
            // Show drawing canvas
            <div className="relative">
              <SignatureCanvas
                ref={sigCanvasRef}
                penColor="black"
                canvasProps={{
                  width: window.innerWidth > 768 ? 600 : Math.min(window.innerWidth - 100, 400),
                  height: 200,
                  className: 'signature-canvas border border-gray-200 rounded cursor-crosshair touch-none',
                  style: { 
                    width: '100%', 
                    height: '200px',
                    touchAction: 'none'
                  }
                }}
                onBegin={handleBegin}
                onEnd={handleEnd}
              />
              
              {/* Canvas instructions */}
              {isEmpty && (
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <div className="text-center text-gray-400">
                    <svg className="w-8 h-8 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                    </svg>
                    <p className="text-sm">Sign here using your mouse or finger</p>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Controls */}
        <div className="bg-gray-50 px-4 py-3 border-t border-gray-300">
          <div className="flex flex-col sm:flex-row justify-between items-center space-y-2 sm:space-y-0 sm:space-x-3">
            <div className="text-sm text-gray-600">
              {savedSignature 
                ? `Saved: ${new Date(savedSignature.createdAt).toLocaleString()}`
                : isEmpty 
                  ? 'Draw your signature above'
                  : 'Signature ready to save'
              }
            </div>
            
            <div className="flex space-x-2">
              {/* Clear Button */}
              <button
                onClick={handleClear}
                disabled={isEmpty && !savedSignature}
                className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Clear
              </button>

              {/* Download Button */}
              <button
                onClick={handleDownload}
                disabled={isEmpty && !savedSignature}
                className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Download
              </button>

              {/* Save Button */}
              {!savedSignature && (
                <button
                  onClick={handleSave}
                  disabled={isEmpty || isSaving}
                  className="px-4 py-2 bg-primary-600 text-white rounded-md text-sm font-medium hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                >
                  {isSaving ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Saving...
                    </>
                  ) : (
                    'Save to Cloud'
                  )}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Technical Info (Development/Debug) */}
      {process.env.NODE_ENV === 'development' && (
        <div className="mt-4 p-3 bg-gray-100 rounded text-xs text-gray-600">
          <strong>Debug Info:</strong><br />
          Empty: {isEmpty.toString()}<br />
          Drawing: {isDrawing.toString()}<br />
          Saved: {savedSignature ? 'Yes' : 'No'}<br />
          {savedSignature && (
            <>
              File: {savedSignature.fileName}<br />
              Path: {savedSignature.path}
            </>
          )}
        </div>
      )}
    </div>
  );
});

DigitalSignaturePad.displayName = 'DigitalSignaturePad';

export default DigitalSignaturePad;