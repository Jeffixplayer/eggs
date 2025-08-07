import React, { useRef, useImperativeHandle, forwardRef } from 'react';
import SignatureCanvas from 'react-signature-canvas';

const DigitalSignature = forwardRef(({ onSignatureChange }, ref) => {
  const sigCanvasRef = useRef();

  useImperativeHandle(ref, () => ({
    clear: () => {
      sigCanvasRef.current.clear();
      onSignatureChange(null);
    },
    getSignature: () => {
      if (sigCanvasRef.current.isEmpty()) {
        return null;
      }
      return sigCanvasRef.current.getTrimmedCanvas().toDataURL('image/png');
    },
    isEmpty: () => {
      return sigCanvasRef.current.isEmpty();
    }
  }));

  const handleEnd = () => {
    if (!sigCanvasRef.current.isEmpty()) {
      const signatureData = sigCanvasRef.current.getTrimmedCanvas().toDataURL('image/png');
      onSignatureChange(signatureData);
    }
  };

  return (
    <div className="border-2 border-gray-300 rounded-lg overflow-hidden">
      <div className="bg-gray-50 px-3 py-2 border-b border-gray-300">
        <div className="flex justify-between items-center">
          <span className="text-sm font-medium text-gray-700">Digital Signature</span>
          <button
            type="button"
            onClick={() => {
              sigCanvasRef.current.clear();
              onSignatureChange(null);
            }}
            className="text-xs text-red-600 hover:text-red-800 font-medium"
          >
            Clear
          </button>
        </div>
      </div>
      <div className="bg-white p-2">
        <SignatureCanvas
          ref={sigCanvasRef}
          penColor="black"
          canvasProps={{
            width: window.innerWidth > 768 ? 400 : 300,
            height: 150,
            className: 'signature-canvas border border-gray-200 rounded w-full touch-action-none',
            style: { width: '100%', height: '150px' }
          }}
          onEnd={handleEnd}
        />
        <p className="text-xs text-gray-500 mt-2 text-center">
          Sign above using your mouse or touch screen
        </p>
      </div>
    </div>
  );
});

DigitalSignature.displayName = 'DigitalSignature';

export default DigitalSignature;