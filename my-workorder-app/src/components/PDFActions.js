import React, { useState } from 'react';
import { downloadWorkOrderPDF, previewWorkOrderPDF, getWorkOrderPDFBlob } from '../utils/pdfGenerator';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth } from '../firebase';

const PDFActions = ({ workOrderData, buttonStyle = 'default', showLabels = true, size = 'md' }) => {
  const [user] = useAuthState(auth);
  const [loading, setLoading] = useState({
    download: false,
    preview: false,
    share: false
  });

  const setLoadingState = (action, isLoading) => {
    setLoading(prev => ({ ...prev, [action]: isLoading }));
  };

  const handleDownload = async () => {
    setLoadingState('download', true);
    try {
      const filename = await downloadWorkOrderPDF(workOrderData, user);
      // Optional: Show success message
      console.log(`PDF downloaded: ${filename}`);
    } catch (error) {
      console.error('Download failed:', error);
      alert('Failed to download PDF. Please try again.');
    } finally {
      setLoadingState('download', false);
    }
  };

  const handlePreview = async () => {
    setLoadingState('preview', true);
    try {
      await previewWorkOrderPDF(workOrderData, user);
    } catch (error) {
      console.error('Preview failed:', error);
      alert('Failed to preview PDF. Please try again.');
    } finally {
      setLoadingState('preview', false);
    }
  };

  const handleShare = async () => {
    setLoadingState('share', true);
    try {
      if (navigator.share) {
        // Use Web Share API if available
        const blob = await getWorkOrderPDFBlob(workOrderData, user);
        const file = new File([blob], `WorkOrder_${workOrderData.workOrderNumber || 'Draft'}.pdf`, {
          type: 'application/pdf'
        });
        
        await navigator.share({
          title: `Work Order ${workOrderData.workOrderNumber || 'Draft'}`,
          text: `Work Order for ${workOrderData.companyName || 'Company'}`,
          files: [file]
        });
      } else {
        // Fallback: Copy link to clipboard or download
        await handleDownload();
        alert('PDF downloaded. You can now share the file manually.');
      }
    } catch (error) {
      if (error.name !== 'AbortError') {
        console.error('Share failed:', error);
        alert('Failed to share PDF. The file will be downloaded instead.');
        await handleDownload();
      }
    } finally {
      setLoadingState('share', false);
    }
  };

  // Button size classes
  const sizeClasses = {
    sm: 'px-2 py-1 text-xs',
    md: 'px-3 py-2 text-sm',
    lg: 'px-4 py-3 text-base'
  };

  // Button style variants
  const getButtonClasses = (variant, isLoading) => {
    const baseClasses = `inline-flex items-center font-medium rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${sizeClasses[size]}`;
    
    switch (variant) {
      case 'primary':
        return `${baseClasses} bg-primary-600 text-white hover:bg-primary-700 focus:ring-2 focus:ring-primary-500`;
      case 'secondary':
        return `${baseClasses} bg-gray-200 text-gray-800 hover:bg-gray-300 focus:ring-2 focus:ring-gray-500`;
      case 'outline':
        return `${baseClasses} border border-gray-300 text-gray-700 bg-white hover:bg-gray-50 focus:ring-2 focus:ring-primary-500`;
      case 'danger':
        return `${baseClasses} bg-red-600 text-white hover:bg-red-700 focus:ring-2 focus:ring-red-500`;
      case 'success':
        return `${baseClasses} bg-green-600 text-white hover:bg-green-700 focus:ring-2 focus:ring-green-500`;
      default:
        return `${baseClasses} bg-blue-600 text-white hover:bg-blue-700 focus:ring-2 focus:ring-blue-500`;
    }
  };

  const LoadingSpinner = () => (
    <svg className={`animate-spin ${size === 'sm' ? 'w-3 h-3' : size === 'lg' ? 'w-5 h-5' : 'w-4 h-4'} mr-2`} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
    </svg>
  );

  const DownloadIcon = () => (
    <svg className={`${size === 'sm' ? 'w-3 h-3' : size === 'lg' ? 'w-5 h-5' : 'w-4 h-4'} ${showLabels ? 'mr-2' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
    </svg>
  );

  const PreviewIcon = () => (
    <svg className={`${size === 'sm' ? 'w-3 h-3' : size === 'lg' ? 'w-5 h-5' : 'w-4 h-4'} ${showLabels ? 'mr-2' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
    </svg>
  );

  const ShareIcon = () => (
    <svg className={`${size === 'sm' ? 'w-3 h-3' : size === 'lg' ? 'w-5 h-5' : 'w-4 h-4'} ${showLabels ? 'mr-2' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z" />
    </svg>
  );

  if (buttonStyle === 'dropdown') {
    return (
      <div className="relative inline-block text-left">
        <div className="flex space-x-1">
          <button
            onClick={handleDownload}
            disabled={loading.download}
            className={getButtonClasses('primary', loading.download)}
            title="Download PDF"
          >
            {loading.download ? <LoadingSpinner /> : <DownloadIcon />}
            {showLabels && (loading.download ? 'Downloading...' : 'Download PDF')}
          </button>
          
          <button
            onClick={handlePreview}
            disabled={loading.preview}
            className={getButtonClasses('outline', loading.preview)}
            title="Preview PDF"
          >
            {loading.preview ? <LoadingSpinner /> : <PreviewIcon />}
            {showLabels && (loading.preview ? 'Loading...' : 'Preview')}
          </button>
          
          <button
            onClick={handleShare}
            disabled={loading.share}
            className={getButtonClasses('secondary', loading.share)}
            title="Share PDF"
          >
            {loading.share ? <LoadingSpinner /> : <ShareIcon />}
            {showLabels && (loading.share ? 'Sharing...' : 'Share')}
          </button>
        </div>
      </div>
    );
  }

  if (buttonStyle === 'compact') {
    return (
      <div className="flex space-x-1">
        <button
          onClick={handleDownload}
          disabled={loading.download}
          className={getButtonClasses('primary', loading.download)}
          title="Download PDF"
        >
          {loading.download ? <LoadingSpinner /> : <DownloadIcon />}
        </button>
        
        <button
          onClick={handlePreview}
          disabled={loading.preview}
          className={getButtonClasses('outline', loading.preview)}
          title="Preview PDF"
        >
          {loading.preview ? <LoadingSpinner /> : <PreviewIcon />}
        </button>
        
        <button
          onClick={handleShare}
          disabled={loading.share}
          className={getButtonClasses('secondary', loading.share)}
          title="Share PDF"
        >
          {loading.share ? <LoadingSpinner /> : <ShareIcon />}
        </button>
      </div>
    );
  }

  // Default style - single download button
  return (
    <button
      onClick={handleDownload}
      disabled={loading.download}
      className={getButtonClasses('primary', loading.download)}
      title="Download Work Order as PDF"
    >
      {loading.download ? <LoadingSpinner /> : <DownloadIcon />}
      {showLabels && (loading.download ? 'Generating PDF...' : 'Download as PDF')}
    </button>
  );
};

export default PDFActions;