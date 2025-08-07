import React from 'react';
import { signOut } from 'firebase/auth';
import { auth } from '../firebase';

const Sidebar = ({ activeSection, setActiveSection }) => {
  const handleSignOut = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  const menuItems = [
    { id: 'worksheet', name: 'Worksheet', icon: '📋' },
    { id: 'schedule', name: 'Schedule', icon: '📅' },
    { id: 'project', name: 'Project', icon: '📊' },
  ];

  return (
    <div className="bg-white shadow-lg h-full w-64 fixed left-0 top-0 z-10">
      <div className="p-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-8">Work Orders</h2>
        
        <nav className="space-y-2">
          {menuItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveSection(item.id)}
              className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-left transition-colors ${
                activeSection === item.id
                  ? 'bg-primary-600 text-white'
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              <span className="text-xl">{item.icon}</span>
              <span className="font-medium">{item.name}</span>
            </button>
          ))}
        </nav>
        
        <div className="mt-8 pt-8 border-t border-gray-200">
          <button
            onClick={handleSignOut}
            className="w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-left text-red-600 hover:bg-red-50 transition-colors"
          >
            <span className="text-xl">🚪</span>
            <span className="font-medium">Sign Out</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;