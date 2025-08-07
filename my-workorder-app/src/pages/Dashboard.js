import React, { useState, useEffect } from 'react';
import { collection, query, orderBy, onSnapshot, deleteDoc, doc } from 'firebase/firestore';
import { db, auth } from '../firebase';
import { useAuthState } from 'react-firebase-hooks/auth';
import Sidebar from '../components/Sidebar';
import WorkOrderForm from '../components/WorkOrderForm';

const Dashboard = () => {
  const [user] = useAuthState(auth);
  const [activeSection, setActiveSection] = useState('worksheet');
  const [workOrders, setWorkOrders] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editingWorkOrder, setEditingWorkOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;

    const q = query(collection(db, 'workOrders'), orderBy('createdAt', 'desc'));
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const workOrdersData = [];
      querySnapshot.forEach((doc) => {
        workOrdersData.push({ id: doc.id, ...doc.data() });
      });
      setWorkOrders(workOrdersData);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [user]);

  const handleCreateWorkOrder = () => {
    setEditingWorkOrder(null);
    setShowForm(true);
  };

  const handleEditWorkOrder = (workOrder) => {
    setEditingWorkOrder(workOrder);
    setShowForm(true);
  };

  const handleDeleteWorkOrder = async (workOrderId) => {
    if (window.confirm('Are you sure you want to delete this work order?')) {
      try {
        await deleteDoc(doc(db, 'workOrders', workOrderId));
      } catch (error) {
        console.error('Error deleting work order:', error);
      }
    }
  };

  const handleFormSave = () => {
    setShowForm(false);
    setEditingWorkOrder(null);
  };

  const handleFormCancel = () => {
    setShowForm(false);
    setEditingWorkOrder(null);
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'urgent': return 'bg-red-100 text-red-800';
      case 'high': return 'bg-orange-100 text-orange-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800';
      case 'in-progress': return 'bg-blue-100 text-blue-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const renderWorksheet = () => (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Work Orders</h1>
        <button
          onClick={handleCreateWorkOrder}
          className="bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-lg font-medium"
        >
          Create New Work Order
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
        </div>
      ) : workOrders.length === 0 ? (
        <div className="text-center py-12">
          <h3 className="text-lg font-medium text-gray-900 mb-2">No work orders yet</h3>
          <p className="text-gray-600 mb-4">Get started by creating your first work order</p>
          <button
            onClick={handleCreateWorkOrder}
            className="bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-lg font-medium"
          >
            Create Work Order
          </button>
        </div>
      ) : (
        <div className="bg-white shadow rounded-lg overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Title
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Priority
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Assigned To
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Due Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {workOrders.map((workOrder) => (
                <tr key={workOrder.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-gray-900">{workOrder.title}</div>
                      <div className="text-sm text-gray-500">{workOrder.description}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getPriorityColor(workOrder.priority)}`}>
                      {workOrder.priority}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(workOrder.status)}`}>
                      {workOrder.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {workOrder.assignedTo || 'Unassigned'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {workOrder.dueDate ? new Date(workOrder.dueDate).toLocaleDateString() : 'No due date'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                    <button
                      onClick={() => handleEditWorkOrder(workOrder)}
                      className="text-primary-600 hover:text-primary-900"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDeleteWorkOrder(workOrder.id)}
                      className="text-red-600 hover:text-red-900"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );

  const renderSchedule = () => (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Schedule</h1>
      <div className="bg-white shadow rounded-lg p-6">
        <p className="text-gray-600">Schedule view coming soon...</p>
      </div>
    </div>
  );

  const renderProject = () => (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Projects</h1>
      <div className="bg-white shadow rounded-lg p-6">
        <p className="text-gray-600">Project management coming soon...</p>
      </div>
    </div>
  );

  const renderContent = () => {
    switch (activeSection) {
      case 'worksheet':
        return renderWorksheet();
      case 'schedule':
        return renderSchedule();
      case 'project':
        return renderProject();
      default:
        return renderWorksheet();
    }
  };

  return (
    <div className="flex h-screen bg-gray-100">
      <Sidebar activeSection={activeSection} setActiveSection={setActiveSection} />
      
      <main className="flex-1 ml-64 p-8 overflow-y-auto">
        <div className="max-w-7xl mx-auto">
          <div className="mb-4">
            <p className="text-gray-600">
              Welcome back, {user?.displayName || user?.email}!
            </p>
          </div>
          {renderContent()}
        </div>
      </main>

      {showForm && (
        <WorkOrderForm
          workOrder={editingWorkOrder}
          onSave={handleFormSave}
          onCancel={handleFormCancel}
        />
      )}
    </div>
  );
};

export default Dashboard;