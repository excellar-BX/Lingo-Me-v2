'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  Languages, 
  Map, 
  Settings, 
  User, 
  LogOut,
  ChevronLeft,
  ChevronRight,
  Home
} from 'lucide-react';

const Navigation = () => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const pathname = usePathname();

  // Auto-collapse on mobile
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 1024) {
        setIsCollapsed(true);
      } else {
        setIsCollapsed(false);
      }
    };

    // Set initial state
    handleResize();
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const navigationItems = [
    { id: 'home', label: 'Home', icon: Home, href: '/' },
    { id: 'translator', label: 'Translator', icon: Languages, href: '/translator' },
    { id: 'maps', label: 'Maps', icon: Map, href: '/maps' },
    { id: 'settings', label: 'Settings', icon: Settings, href: '/settings' },
  ];

  const toggleSidebar = () => {
    setIsCollapsed(!isCollapsed);
  };

  const isActive = (href) => {
    if (href === '/') {
      return pathname === '/';
    }
    return pathname.startsWith(href);
  };

  return (
    <div className={`${isCollapsed ? 'w-20' : 'w-64'} bg-white shadow-lg transition-all duration-300 ease-in-out flex flex-col h-screen  left-0 top-0 z-50`}>
      {/* Header */}
      <div className="px-2 py-4 border-b border-gray-200 flex items-center justify-between">
        <div className="flex items-center">
          {/* Stylized SVG Icon */}
          <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center mr-3">
            <svg viewBox="0 0 24 24" className="w-5 h-5 text-white" fill="currentColor">
              <path d="M12 2C13.1 2 14 2.9 14 4C14 5.1 13.1 6 12 6C10.9 6 10 5.1 10 4C10 2.9 10.9 2 12 2ZM21 9V7L15 1H5C3.89 1 3 1.89 3 3V21C3 22.11 3.89 23 5 23H11V21H5V19H11V17H5V15H11V13H5V11H11V9H21ZM13 19V17H19V15H13V13H21V11H13V9H21V7H13V5H21V3H15V7H17V9H15V11H17V13H15V15H17V17H15V19H13ZM19 21V19H17V21H19Z"/>
            </svg>
          </div>
          {!isCollapsed && (
            <Link href="/" className="text-xl font-bold text-gray-800 hover:text-blue-600 transition-colors">
              Lingo Me
            </Link>
          )}
        </div>
        <button
          onClick={toggleSidebar}
          className="p-1 rounded-lg hover:bg-gray-100 transition-colors"
        >
          {isCollapsed ? (
            <ChevronRight className="w-5 h-5 text-gray-600" />
          ) : (
            <ChevronLeft className="w-5 h-5 text-gray-600" />
          )}
        </button>
      </div>

      {/* Navigation Items */}
      <nav className="flex-1 p-4">
        <ul className="space-y-2">
          {navigationItems.map((item) => {
            const IconComponent = item.icon;
            const active = isActive(item.href);
            
            return (
              <li key={item.id}>
                <Link
                  href={item.href}
                  className={`w-full flex items-center p-3 rounded-lg transition-all duration-200 ${
                    active
                      ? 'bg-blue-100 text-blue-700 shadow-sm'
                      : 'text-gray-600 hover:bg-gray-100 hover:text-gray-800'
                  }`}
                  title={isCollapsed ? item.label : undefined}
                >
                  <IconComponent className="w-5 h-5 flex-shrink-0" />
                  {!isCollapsed && (
                    <span className="ml-3 font-medium">{item.label}</span>
                  )}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Bottom Section */}
      <div className="p-4 border-t border-gray-200">
        {/* User Profile */}
        <button 
          className="w-full flex items-center p-3 rounded-lg text-gray-600 hover:bg-gray-100 hover:text-gray-800 transition-all duration-200 mb-2"
          title={isCollapsed ? "User Profile" : undefined}
        >
          <div className="w-5 h-5 bg-gray-400 rounded-full flex items-center justify-center flex-shrink-0">
            <User className="w-3 h-3 text-white" />
          </div>
          {!isCollapsed && (
            <div className="ml-3 text-left">
              <div className="font-medium text-sm">John Doe</div>
              <div className="text-xs text-gray-500">john@example.com</div>
            </div>
          )}
        </button>

        {/* Logout Button */}
        <button 
          className="w-full flex items-center p-3 rounded-lg text-red-600 hover:bg-red-50 hover:text-red-700 transition-all duration-200"
          title={isCollapsed ? "Logout" : undefined}
        >
          <LogOut className="w-5 h-5 flex-shrink-0" />
          {!isCollapsed && (
            <span className="ml-3 font-medium">Logout</span>
          )}
        </button>
      </div>
    </div>
  );
};

export default Navigation;