import React, { useState, useEffect } from 'react';
import { collection, query, onSnapshot, updateDoc, doc } from 'firebase/firestore';
import { db } from '../firebase';

const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const q = query(collection(db, 'users'));
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const usersData = [];
      querySnapshot.forEach((doc) => {
        usersData.push({ id: doc.id, ...doc.data() });
      });
      setUsers(usersData);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const updateUserRole = async (userId, newRole) => {
    try {
      await updateDoc(doc(db, 'users', userId), {
        role: newRole,
        updatedAt: new Date()
      });
    } catch (error) {
      console.error('Error updating user role:', error);
      alert('Error updating user role. Please try again.');
    }
  };

  const getRoleBadgeColor = (role) => {
    return role === 'admin' 
      ? 'bg-purple-100 text-purple-800' 
      : 'bg-blue-100 text-blue-800';
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">User Management</h1>
        <div className="text-sm text-gray-600">
          Total Users: {users.length}
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-sm font-medium text-gray-500">Total Users</h3>
          <p className="text-2xl font-bold text-gray-900">{users.length}</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-sm font-medium text-gray-500">Admins</h3>
          <p className="text-2xl font-bold text-purple-600">
            {users.filter(u => u.role === 'admin').length}
          </p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-sm font-medium text-gray-500">Workers</h3>
          <p className="text-2xl font-bold text-blue-600">
            {users.filter(u => u.role === 'worker').length}
          </p>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white shadow rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  User
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Email
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Current Role
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Joined
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {users.map((user) => (
                <tr key={user.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-10 w-10">
                        <div className="h-10 w-10 rounded-full bg-gray-300 flex items-center justify-center">
                          <span className="text-sm font-medium text-gray-700">
                            {user.username?.charAt(0)?.toUpperCase() || user.email?.charAt(0)?.toUpperCase()}
                          </span>
                        </div>
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">
                          {user.username || 'No username'}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{user.email}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getRoleBadgeColor(user.role)}`}>
                      {user.role?.charAt(0)?.toUpperCase() + user.role?.slice(1) || 'worker'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {user.createdAt?.toDate?.()?.toLocaleDateString() || 'Unknown'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    {user.role === 'admin' ? (
                      <button
                        onClick={() => updateUserRole(user.id, 'worker')}
                        className="text-orange-600 hover:text-orange-900 mr-3"
                        title="Demote to Worker"
                      >
                        Demote to Worker
                      </button>
                    ) : (
                      <button
                        onClick={() => updateUserRole(user.id, 'admin')}
                        className="text-purple-600 hover:text-purple-900 mr-3"
                        title="Promote to Admin"
                      >
                        Promote to Admin
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        {users.length === 0 && (
          <div className="text-center py-12">
            <h3 className="text-lg font-medium text-gray-900 mb-2">No users found</h3>
            <p className="text-gray-600">Users will appear here once they register.</p>
          </div>
        )}
      </div>

      {/* Role Management Instructions */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h3 className="text-lg font-medium text-blue-900 mb-2">Role Management Guide</h3>
        <div className="text-sm text-blue-800 space-y-2">
          <p><strong>Worker Role:</strong> Can create and manage their own work orders, upload images, and provide digital signatures.</p>
          <p><strong>Admin Role:</strong> Can view all work orders, change statuses, filter by company/address, export data, and manage user roles.</p>
          <p><strong>Default:</strong> All new registrations default to "Worker" role for security.</p>
          <p><strong>Promotion:</strong> Only existing admins can promote workers to admin status.</p>
        </div>
      </div>
    </div>
  );
};

export default UserManagement;