import React, { useState, useRef } from 'react';
import { collection, addDoc, updateDoc, doc } from 'firebase/firestore';
import { db, auth } from '../firebase';
import { useAuthState } from 'react-firebase-hooks/auth';
import ImageUpload from './ImageUpload';
import DigitalSignature from './SignatureCanvas';

const WorkOrderForm = ({ workOrder, onSave, onCancel }) => {
  const [user] = useAuthState(auth);
  const [loading, setLoading] = useState(false);
  const signatureRef = useRef();
  const [formData, setFormData] = useState({
    title: workOrder?.title || '',
    description: workOrder?.description || '',
    priority: workOrder?.priority || 'medium',
    status: workOrder?.status || 'pending',
    assignedTo: workOrder?.assignedTo || '',
    dueDate: workOrder?.dueDate || '',
    category: workOrder?.category || 'maintenance',
    location: workOrder?.location || '',
    estimatedHours: workOrder?.estimatedHours || '',
    materials: workOrder?.materials || '',
    companyName: workOrder?.companyName || '',
    postalAddress: workOrder?.postalAddress || '',
    contactPerson: workOrder?.contactPerson || '',
    phoneNumber: workOrder?.phoneNumber || '',
    workDescription: workOrder?.workDescription || '',
    images: workOrder?.images || [],
    signature: workOrder?.signature || null
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleImageUpload = (images) => {
    setFormData(prev => ({
      ...prev,
      images
    }));
  };

  const handleSignatureChange = (signature) => {
    setFormData(prev => ({
      ...prev,
      signature
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!user) return;

    // Validate required fields
    if (!formData.title || !formData.companyName || !formData.postalAddress) {
      alert('Please fill in all required fields (Title, Company Name, Postal Address)');
      return;
    }

    setLoading(true);
    try {
      const workOrderData = {
        ...formData,
        estimatedHours: formData.estimatedHours ? parseInt(formData.estimatedHours) : 0,
        updatedAt: new Date(),
        updatedBy: user.uid,
        submittedBy: user.displayName || user.email
      };

      if (workOrder?.id) {
        // Update existing work order
        await updateDoc(doc(db, 'workOrders', workOrder.id), workOrderData);
      } else {
        // Create new work order
        await addDoc(collection(db, 'workOrders'), {
          ...workOrderData,
          createdAt: new Date(),
          createdBy: user.uid,
          workOrderNumber: `WO-${Date.now()}`
        });
      }

      onSave();
    } catch (error) {
      console.error('Error saving work order:', error);
      alert('Error saving work order. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50 p-4">
      <div className="relative top-4 md:top-20 mx-auto border w-full max-w-4xl shadow-lg rounded-md bg-white min-h-[calc(100vh-2rem)] md:min-h-0">
        <div className="p-4 md:p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg md:text-xl font-medium text-gray-900">
              {workOrder?.id ? 'Edit Work Order' : 'Create New Work Order'}
            </h3>
            <button
              type="button"
              onClick={onCancel}
              className="md:hidden p-2 text-gray-400 hover:text-gray-600"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Company Information */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <h4 className="text-lg font-medium text-gray-900 mb-4">Company Information</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Company Name *</label>
                  <input
                    type="text"
                    name="companyName"
                    value={formData.companyName}
                    onChange={handleChange}
                    required
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700">Contact Person</label>
                  <input
                    type="text"
                    name="contactPerson"
                    value={formData.contactPerson}
                    onChange={handleChange}
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Postal Address *</label>
                  <textarea
                    name="postalAddress"
                    value={formData.postalAddress}
                    onChange={handleChange}
                    required
                    rows={2}
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700">Phone Number</label>
                  <input
                    type="tel"
                    name="phoneNumber"
                    value={formData.phoneNumber}
                    onChange={handleChange}
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                  />
                </div>
              </div>
            </div>

            {/* Work Order Details */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <h4 className="text-lg font-medium text-gray-900 mb-4">Work Order Details</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Title *</label>
                  <input
                    type="text"
                    name="title"
                    value={formData.title}
                    onChange={handleChange}
                    required
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700">Category</label>
                  <select
                    name="category"
                    value={formData.category}
                    onChange={handleChange}
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                  >
                    <option value="maintenance">Maintenance</option>
                    <option value="repair">Repair</option>
                    <option value="installation">Installation</option>
                    <option value="inspection">Inspection</option>
                    <option value="cleaning">Cleaning</option>
                    <option value="electrical">Electrical</option>
                    <option value="plumbing">Plumbing</option>
                    <option value="hvac">HVAC</option>
                    <option value="other">Other</option>
                  </select>
                </div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Work Description</label>
              <textarea
                name="workDescription"
                value={formData.workDescription}
                onChange={handleChange}
                rows={4}
                placeholder="Describe the work to be performed in detail..."
                className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-primary-500 focus:border-primary-500"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Priority</label>
                <select
                  name="priority"
                  value={formData.priority}
                  onChange={handleChange}
                  className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                  <option value="urgent">Urgent</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700">Status</label>
                <select
                  name="status"
                  value={formData.status}
                  onChange={handleChange}
                  className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                >
                  <option value="pending">Pending</option>
                  <option value="in-progress">In Progress</option>
                  <option value="completed">Completed</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700">Estimated Hours</label>
                <input
                  type="number"
                  name="estimatedHours"
                  value={formData.estimatedHours}
                  onChange={handleChange}
                  min="0"
                  step="0.5"
                  placeholder="0"
                  className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Assigned To</label>
                <input
                  type="text"
                  name="assignedTo"
                  value={formData.assignedTo}
                  onChange={handleChange}
                  placeholder="Employee name or ID"
                  className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700">Due Date</label>
                <input
                  type="datetime-local"
                  name="dueDate"
                  value={formData.dueDate}
                  onChange={handleChange}
                  className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Location</label>
              <input
                type="text"
                name="location"
                value={formData.location}
                onChange={handleChange}
                placeholder="Building, floor, room, etc."
                className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-primary-500 focus:border-primary-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Materials/Tools Required</label>
              <textarea
                name="materials"
                value={formData.materials}
                onChange={handleChange}
                rows={2}
                placeholder="List materials, tools, or equipment needed"
                className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-primary-500 focus:border-primary-500"
              />
            </div>

            {/* Image Upload Section */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <h4 className="text-lg font-medium text-gray-900 mb-4">Attachments</h4>
              <ImageUpload 
                onImageUpload={handleImageUpload}
                existingImages={formData.images}
              />
            </div>

            {/* Digital Signature Section */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <h4 className="text-lg font-medium text-gray-900 mb-4">Digital Signature</h4>
              <DigitalSignature 
                ref={signatureRef}
                onSignatureChange={handleSignatureChange}
              />
              {formData.signature && (
                <div className="mt-4">
                  <p className="text-sm text-green-600 font-medium">✓ Signature captured</p>
                </div>
              )}
            </div>

            <div className="flex flex-col sm:flex-row justify-end space-y-2 sm:space-y-0 sm:space-x-3 pt-6 border-t border-gray-200">
              <button
                type="button"
                onClick={onCancel}
                className="w-full sm:w-auto px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="w-full sm:w-auto px-4 py-2 bg-primary-600 text-white rounded-md text-sm font-medium hover:bg-primary-700 disabled:opacity-50"
              >
                {loading ? 'Saving...' : 'Save Work Order'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default WorkOrderForm;