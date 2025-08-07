import React, { useRef, useState } from 'react';
import DigitalSignaturePad from '../components/DigitalSignaturePad';

const SignatureDemo = () => {
  const signatureRef = useRef();
  const [savedSignatures, setSavedSignatures] = useState([]);
  const [currentSignature, setCurrentSignature] = useState(null);

  const handleSignatureSaved = (signatureData) => {
    console.log('Signature saved:', signatureData);
    setSavedSignatures(prev => [...prev, signatureData]);
  };

  const handleSignatureChange = (signatureData) => {
    console.log('Signature changed:', signatureData);
    setCurrentSignature(signatureData);
  };

  const clearSignature = () => {
    if (signatureRef.current) {
      signatureRef.current.clear();
    }
  };

  const getSignatureData = () => {
    if (signatureRef.current) {
      const signature = signatureRef.current.getSignature();
      console.log('Current signature data:', signature);
      alert(signature ? 'Signature data logged to console' : 'No signature drawn');
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Digital Signature Component Demo
          </h1>
          <p className="text-lg text-gray-600">
            Draw, save, and manage digital signatures with Firebase Storage integration
          </p>
        </div>

        {/* Main Signature Component */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            Interactive Signature Pad
          </h2>
          
          <DigitalSignaturePad
            ref={signatureRef}
            onSignatureSaved={handleSignatureSaved}
            onSignatureChange={handleSignatureChange}
          />

          {/* Additional Controls */}
          <div className="mt-6 flex flex-wrap gap-3">
            <button
              onClick={clearSignature}
              className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 font-medium"
            >
              Clear via Ref
            </button>
            <button
              onClick={getSignatureData}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 font-medium"
            >
              Get Signature Data
            </button>
          </div>
        </div>

        {/* Current Signature Info */}
        {currentSignature && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
            <h3 className="text-lg font-medium text-blue-900 mb-2">Current Signature Info</h3>
            <div className="text-sm text-blue-800">
              {typeof currentSignature === 'string' ? (
                <p>Data URL: {currentSignature.substring(0, 50)}...</p>
              ) : (
                <div className="space-y-1">
                  <p><strong>URL:</strong> {currentSignature.url}</p>
                  <p><strong>File:</strong> {currentSignature.fileName}</p>
                  <p><strong>Created:</strong> {new Date(currentSignature.createdAt).toLocaleString()}</p>
                  <p><strong>Type:</strong> {currentSignature.type}</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Saved Signatures Gallery */}
        {savedSignatures.length > 0 && (
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Saved Signatures ({savedSignatures.length})
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {savedSignatures.map((signature, index) => (
                <div key={index} className="border border-gray-200 rounded-lg p-4">
                  <div className="aspect-w-16 aspect-h-9 mb-3">
                    <img
                      src={signature.url}
                      alt={`Signature ${index + 1}`}
                      className="w-full h-32 object-contain border border-gray-100 rounded bg-gray-50"
                    />
                  </div>
                  
                  <div className="text-sm text-gray-600 space-y-1">
                    <p><strong>File:</strong> {signature.fileName}</p>
                    <p><strong>Saved:</strong> {new Date(signature.createdAt).toLocaleString()}</p>
                    <div className="flex space-x-2 mt-2">
                      <a
                        href={signature.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:text-blue-800 text-xs font-medium"
                      >
                        View Full Size
                      </a>
                      <a
                        href={signature.url}
                        download={signature.fileName}
                        className="text-green-600 hover:text-green-800 text-xs font-medium"
                      >
                        Download
                      </a>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Features List */}
        <div className="bg-gray-50 rounded-lg p-6 mt-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Component Features</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="font-medium text-gray-900 mb-2">✅ Core Features</h3>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• Touch and mouse drawing support</li>
                <li>• Canvas to PNG conversion</li>
                <li>• Firebase Storage upload</li>
                <li>• Clear and save functionality</li>
                <li>• Real-time drawing status</li>
                <li>• Responsive design</li>
                <li>• Download signatures</li>
                <li>• Loading states</li>
              </ul>
            </div>
            
            <div>
              <h3 className="font-medium text-gray-900 mb-2">🎛️ Technical Details</h3>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• React forwardRef support</li>
                <li>• Imperative API via useImperativeHandle</li>
                <li>• File organization by user ID</li>
                <li>• Timestamp-based naming</li>
                <li>• Error handling and validation</li>
                <li>• Mobile-optimized canvas size</li>
                <li>• Callback integration</li>
                <li>• Development debug info</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Usage Example */}
        <div className="bg-white rounded-lg shadow-lg p-6 mt-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Usage Example</h2>
          <pre className="bg-gray-100 rounded p-4 text-sm overflow-x-auto">
{`import DigitalSignaturePad from './components/DigitalSignaturePad';

function MyComponent() {
  const signatureRef = useRef();
  
  const handleSave = (signatureData) => {
    console.log('Signature saved:', signatureData);
    // signatureData contains: url, path, fileName, createdAt, etc.
  };

  const handleChange = (signatureData) => {
    // Called when signature is drawn or cleared
    console.log('Signature changed:', signatureData);
  };

  return (
    <DigitalSignaturePad
      ref={signatureRef}
      onSignatureSaved={handleSave}
      onSignatureChange={handleChange}
      existingSignature={savedSignature} // Optional
    />
  );
}`}
          </pre>
        </div>
      </div>
    </div>
  );
};

export default SignatureDemo;