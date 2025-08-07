import React, { useState } from 'react';
import PDFActions from '../components/PDFActions';
import { downloadWorkOrderPDF, previewWorkOrderPDF } from '../utils/pdfGenerator';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth } from '../firebase';

const PDFDemo = () => {
  const [user] = useAuthState(auth);
  const [selectedTemplate, setSelectedTemplate] = useState('complete');

  // Sample work order data with all possible fields
  const sampleWorkOrders = {
    complete: {
      id: 'demo-123',
      workOrderNumber: 'WO-2024-001',
      companyName: 'Tech Solutions Inc.',
      contactPerson: 'John Smith',
      phoneNumber: '+1 (555) 123-4567',
      postalAddress: '123 Business Park Drive\nSuite 100\nNew York, NY 10001\nUnited States',
      title: 'Server Maintenance and Upgrade',
      category: 'maintenance',
      priority: 'high',
      status: 'in-progress',
      estimatedHours: 8,
      location: 'Data Center - Building A, Floor 2',
      assignedTo: 'Mike Johnson',
      workDescription: 'Perform comprehensive server maintenance including hardware diagnostics, software updates, security patches, and performance optimization. This work order includes updating the server operating system, checking all hardware components for wear and tear, optimizing database performance, and implementing new security protocols as per company standards.',
      materials: 'Server replacement parts, backup drives, network cables, diagnostic tools, cleaning supplies, thermal paste, power supply units, memory modules',
      createdAt: new Date('2024-01-15T09:00:00'),
      submittedBy: user?.displayName || 'Demo User',
      images: [
        {
          name: 'server-rack-before.jpg',
          url: 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=400',
        },
        {
          name: 'network-setup.jpg',
          url: 'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=400',
        },
        {
          name: 'diagnostic-results.jpg',
          url: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=400',
        }
      ],
      signature: {
        url: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8/5+hHgAHggJ/PchI7wAAAABJRU5ErkJggg==',
        createdAt: new Date().toISOString(),
        fileName: 'signature.png'
      }
    },
    minimal: {
      id: 'demo-124',
      workOrderNumber: 'WO-2024-002',
      companyName: 'Small Business LLC',
      title: 'Basic Repair Task',
      category: 'repair',
      priority: 'medium',
      status: 'pending',
      workDescription: 'Simple repair task for demonstration purposes.',
      createdAt: new Date(),
      submittedBy: user?.displayName || 'Demo User'
    },
    noImages: {
      id: 'demo-125',
      workOrderNumber: 'WO-2024-003',
      companyName: 'Office Solutions Corp',
      contactPerson: 'Sarah Wilson',
      phoneNumber: '+1 (555) 987-6543',
      postalAddress: '456 Corporate Blvd\nOffice Tower\nLos Angeles, CA 90210',
      title: 'Office Equipment Installation',
      category: 'installation',
      priority: 'low',
      status: 'completed',
      estimatedHours: 4,
      location: 'Main Office - 3rd Floor',
      assignedTo: 'Alex Chen',
      workDescription: 'Install new office equipment including printers, scanners, and networking hardware.',
      materials: 'Printers, scanners, network switches, cables',
      createdAt: new Date('2024-01-10T14:30:00'),
      submittedBy: user?.displayName || 'Demo User',
      signature: {
        url: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8/5+hHgAHggJ/PchI7wAAAABJRU5ErkJggg==',
        createdAt: new Date().toISOString(),
        fileName: 'signature.png'
      }
    }
  };

  const currentWorkOrder = sampleWorkOrders[selectedTemplate];

  const handleDirectDownload = async () => {
    try {
      await downloadWorkOrderPDF(currentWorkOrder, user);
    } catch (error) {
      alert('Failed to download PDF: ' + error.message);
    }
  };

  const handleDirectPreview = async () => {
    try {
      await previewWorkOrderPDF(currentWorkOrder, user);
    } catch (error) {
      alert('Failed to preview PDF: ' + error.message);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            PDF Generation Demo
          </h1>
          <p className="text-lg text-gray-600">
            Generate professional work order PDFs with text, images, and digital signatures
          </p>
        </div>

        {/* Template Selector */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            Choose Template
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <button
              onClick={() => setSelectedTemplate('complete')}
              className={`p-4 rounded-lg border-2 transition-colors ${
                selectedTemplate === 'complete'
                  ? 'border-primary-500 bg-primary-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <h3 className="font-medium text-gray-900">Complete Example</h3>
              <p className="text-sm text-gray-600 mt-1">
                Full work order with all fields, images, and signature
              </p>
            </button>
            
            <button
              onClick={() => setSelectedTemplate('minimal')}
              className={`p-4 rounded-lg border-2 transition-colors ${
                selectedTemplate === 'minimal'
                  ? 'border-primary-500 bg-primary-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <h3 className="font-medium text-gray-900">Minimal Example</h3>
              <p className="text-sm text-gray-600 mt-1">
                Basic work order with minimal fields
              </p>
            </button>
            
            <button
              onClick={() => setSelectedTemplate('noImages')}
              className={`p-4 rounded-lg border-2 transition-colors ${
                selectedTemplate === 'noImages'
                  ? 'border-primary-500 bg-primary-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <h3 className="font-medium text-gray-900">No Images</h3>
              <p className="text-sm text-gray-600 mt-1">
                Work order with signature but no attached images
              </p>
            </button>
          </div>

          {/* PDF Actions */}
          <div className="flex flex-wrap gap-4 justify-center">
            <PDFActions 
              workOrderData={currentWorkOrder}
              buttonStyle="dropdown"
              showLabels={true}
              size="lg"
            />
            
            <button
              onClick={handleDirectDownload}
              className="px-6 py-3 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition-colors"
            >
              Direct Download
            </button>
            
            <button
              onClick={handleDirectPreview}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
            >
              Preview in New Tab
            </button>
          </div>
        </div>

        {/* Current Work Order Preview */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            Work Order Preview - {currentWorkOrder.workOrderNumber}
          </h2>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Company Information */}
            <div>
              <h3 className="font-medium text-gray-900 mb-3">Company Information</h3>
              <div className="space-y-2 text-sm">
                <p><strong>Company:</strong> {currentWorkOrder.companyName}</p>
                {currentWorkOrder.contactPerson && (
                  <p><strong>Contact:</strong> {currentWorkOrder.contactPerson}</p>
                )}
                {currentWorkOrder.phoneNumber && (
                  <p><strong>Phone:</strong> {currentWorkOrder.phoneNumber}</p>
                )}
                {currentWorkOrder.postalAddress && (
                  <p><strong>Address:</strong> {currentWorkOrder.postalAddress.replace(/\n/g, ', ')}</p>
                )}
              </div>
            </div>

            {/* Work Details */}
            <div>
              <h3 className="font-medium text-gray-900 mb-3">Work Details</h3>
              <div className="space-y-2 text-sm">
                <p><strong>Title:</strong> {currentWorkOrder.title}</p>
                <p><strong>Category:</strong> {currentWorkOrder.category}</p>
                <p><strong>Priority:</strong> {currentWorkOrder.priority}</p>
                <p><strong>Status:</strong> {currentWorkOrder.status}</p>
                {currentWorkOrder.estimatedHours && (
                  <p><strong>Est. Hours:</strong> {currentWorkOrder.estimatedHours}</p>
                )}
                {currentWorkOrder.assignedTo && (
                  <p><strong>Assigned To:</strong> {currentWorkOrder.assignedTo}</p>
                )}
              </div>
            </div>
          </div>

          {/* Description */}
          {currentWorkOrder.workDescription && (
            <div className="mt-6">
              <h3 className="font-medium text-gray-900 mb-2">Description</h3>
              <p className="text-sm text-gray-700">{currentWorkOrder.workDescription}</p>
            </div>
          )}

          {/* Materials */}
          {currentWorkOrder.materials && (
            <div className="mt-4">
              <h3 className="font-medium text-gray-900 mb-2">Materials/Tools</h3>
              <p className="text-sm text-gray-700">{currentWorkOrder.materials}</p>
            </div>
          )}

          {/* Images */}
          {currentWorkOrder.images && currentWorkOrder.images.length > 0 && (
            <div className="mt-6">
              <h3 className="font-medium text-gray-900 mb-3">Attached Images</h3>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {currentWorkOrder.images.map((image, index) => (
                  <div key={index} className="relative">
                    <img
                      src={image.url}
                      alt={image.name}
                      className="w-full h-32 object-cover rounded-lg border border-gray-200"
                    />
                    <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-50 text-white text-xs p-1 rounded-b-lg">
                      {image.name}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Signature */}
          {currentWorkOrder.signature && (
            <div className="mt-6">
              <h3 className="font-medium text-gray-900 mb-2">Digital Signature</h3>
              <div className="flex items-center space-x-4">
                <div className="bg-gray-50 p-2 rounded border">
                  <span className="text-sm text-gray-600">✓ Signature Present</span>
                </div>
                <span className="text-sm text-gray-600">
                  Signed by: {currentWorkOrder.submittedBy}
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Features Overview */}
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            PDF Generation Features
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div>
              <h3 className="font-medium text-gray-900 mb-2">📄 Content Features</h3>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• Professional header with work order number</li>
                <li>• Company information section</li>
                <li>• Detailed work specifications</li>
                <li>• Automatic text wrapping</li>
                <li>• Multi-page support</li>
                <li>• Date and time stamps</li>
              </ul>
            </div>
            
            <div>
              <h3 className="font-medium text-gray-900 mb-2">🖼️ Image Features</h3>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• Multiple image attachments</li>
                <li>• Automatic image resizing</li>
                <li>• Image captions and labels</li>
                <li>• Grid layout optimization</li>
                <li>• JPEG/PNG format support</li>
                <li>• Error handling for failed images</li>
              </ul>
            </div>
            
            <div>
              <h3 className="font-medium text-gray-900 mb-2">✍️ Signature Features</h3>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• Digital signature embedding</li>
                <li>• Base64 and URL support</li>
                <li>• Signature metadata</li>
                <li>• Timestamp recording</li>
                <li>• User identification</li>
                <li>• Professional presentation</li>
              </ul>
            </div>
          </div>

          <div className="mt-6 p-4 bg-blue-50 rounded-lg">
            <h3 className="font-medium text-blue-900 mb-2">Technical Implementation</h3>
            <p className="text-sm text-blue-800">
              Built with <strong>jsPDF</strong> library featuring automatic page breaks, 
              responsive layouts, image optimization, and comprehensive error handling. 
              All images are loaded asynchronously and converted to base64 for embedding.
            </p>
          </div>

          <div className="mt-4 p-4 bg-green-50 rounded-lg">
            <h3 className="font-medium text-green-900 mb-2">Usage in Application</h3>
            <p className="text-sm text-green-800">
              PDF generation is integrated throughout the work order system:
            </p>
            <ul className="text-sm text-green-800 mt-2 ml-4 space-y-1">
              <li>• Individual work order downloads from tables</li>
              <li>• Bulk PDF generation for reporting</li>
              <li>• Preview functionality before download</li>
              <li>• Mobile-friendly sharing options</li>
              <li>• Integration with work order forms</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PDFDemo;