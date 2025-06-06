import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

const BottomNavigation = ({ userRole }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const basePath = userRole === 'student' ? '/student' : '/teacher';

  const tabs = [
    { label: 'Classes', path: `${basePath}/dashboard`, icon: '📚' },
    { label: 'History', path: `${basePath}/history`, icon: '📜' },
    { label: 'Profile', path: `${basePath}/profile`, icon: '👤' },
  ];

  return (
    <div className="fixed bottom-0 left-0 w-full bg-gray-800 text-white flex justify-around items-center h-16 shadow-lg">
      {tabs.map((tab) => (
        <button
          key={tab.label}
          onClick={() => {
            console.log(`Navigating to ${tab.path}`);
            navigate(tab.path);
          }}
          className={`flex flex-col items-center justify-center flex-1 h-full transition-colors ${
            location.pathname === tab.path ? 'bg-gray-700' : 'hover:bg-gray-600'
          }`}
        >
          <span className="text-2xl">{tab.icon}</span>
          <span className="text-xs">{tab.label}</span>
        </button>
      ))}
    </div>
  );
};

export default BottomNavigation;