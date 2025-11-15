/**
 * Collection Navigation Component
 * Tab navigation for collection-related pages
 */
import React from 'react';
import { useNavigate, useLocation, useParams } from 'react-router-dom';
import { FiDatabase, FiFileText, FiCode, FiDownload, FiLayers } from 'react-icons/fi';

const CollectionNav = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { dbName, collName } = useParams();

  const tabs = [
    {
      name: 'Documents',
      path: `/databases/${dbName}/collections/${collName}/documents`,
      icon: FiDatabase
    },
    {
      name: 'Schema',
      path: `/databases/${dbName}/collections/${collName}/schema`,
      icon: FiFileText
    },
    {
      name: 'Indexes',
      path: `/databases/${dbName}/collections/${collName}/indexes`,
      icon: FiLayers
    },
    {
      name: 'Aggregation',
      path: `/databases/${dbName}/collections/${collName}/aggregation`,
      icon: FiCode
    },
    {
      name: 'Export/Import',
      path: `/databases/${dbName}/collections/${collName}/export-import`,
      icon: FiDownload
    }
  ];

  const isActive = (path) => location.pathname === path;

  return (
    <div className="border-b border-gray-200 mb-4 md:mb-6 -mx-4 md:mx-0 px-4 md:px-0">
      <nav className="flex space-x-1 overflow-x-auto scrollbar-hide">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const active = isActive(tab.path);
          
          return (
            <button
              key={tab.name}
              onClick={() => navigate(tab.path)}
              className={`
                flex items-center px-3 md:px-4 py-2 md:py-3 text-xs md:text-sm font-medium border-b-2 transition-colors whitespace-nowrap flex-shrink-0
                ${active
                  ? 'border-purple-500 text-purple-600'
                  : 'border-transparent text-gray-600  hover:border-gray-300'
                }
              `}
            >
              <Icon className="mr-1 md:mr-2" size={14} />
              <span className="hidden sm:inline">{tab.name}</span>
              <span className="sm:hidden">{tab.name.split('/')[0]}</span>
            </button>
          );
        })}
      </nav>
    </div>
  );
};

export default CollectionNav;
